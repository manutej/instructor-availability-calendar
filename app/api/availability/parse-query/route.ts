/**
 * Parse Query API Route
 *
 * Converts natural language availability queries into structured queries
 * using Claude AI with fallback to pattern-based parsing.
 *
 * @route POST /api/availability/parse-query
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import type { AvailabilityQuery, ParseQueryResponse, ParseQueryError } from '@/types/email-generator';

// Initialize Anthropic client - fail securely if API key missing
if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY environment variable is required');
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * System prompt for Claude to parse availability queries
 *
 * Instructs Claude to extract query parameters from natural language
 * and return them in JSON format.
 */
const SYSTEM_PROMPT = `You are an intelligent availability query parser for a calendar scheduling system.

Your task is to parse natural language queries about availability into structured JSON format.

Extract the following information from the user's query:
1. **intent**: What type of query is this?
   - "find_days": User wants fully available dates (e.g., "available days next week")
   - "find_slots": User wants specific time slots (e.g., "morning slots in January")
   - "suggest_times": User wants meeting suggestions (e.g., "best times for a meeting")

2. **dateRange**: What time period to search?
   - Extract start and end dates
   - Handle relative dates ("next week", "this month", "in 2 weeks")
   - Default to current date + 30 days if not specified

3. **timePreference** (optional): What time of day?
   - "morning": 6am-12pm
   - "afternoon": 12pm-6pm
   - "evening": 6pm-10pm
   - "any": All time slots (default)

4. **slotDuration** (optional): How long should the available block be?
   - "1hour": Individual hour slots (default)
   - "half-day": 6-hour blocks
   - "full-day": Full day (16 hours)

5. **count** (optional): Maximum number of results
   - Extract if user specifies (e.g., "top 5 times", "3 suggestions")

Return ONLY valid JSON in this exact format:
{
  "intent": "find_days" | "find_slots" | "suggest_times",
  "dateRange": {
    "start": "YYYY-MM-DD",
    "end": "YYYY-MM-DD"
  },
  "timePreference": "morning" | "afternoon" | "evening" | "any",
  "slotDuration": "1hour" | "half-day" | "full-day",
  "count": number
}

Examples:

Query: "Avail for next month"
Response: {"intent":"find_days","dateRange":{"start":"2026-01-01","end":"2026-01-31"}}

Query: "Morning slots next week"
Response: {"intent":"find_slots","dateRange":{"start":"2026-01-06","end":"2026-01-12"},"timePreference":"morning"}

Query: "Best times for a 1-hour meeting in January"
Response: {"intent":"suggest_times","dateRange":{"start":"2026-01-01","end":"2026-01-31"},"slotDuration":"1hour"}

Query: "Top 5 afternoon times this week"
Response: {"intent":"suggest_times","dateRange":{"start":"2026-01-01","end":"2026-01-07"},"timePreference":"afternoon","count":5}

Current date for reference: {{currentDate}}`;

/**
 * Fallback parser for common query patterns
 *
 * Used when Claude API is unavailable or returns invalid JSON.
 * Handles basic patterns like "next week", "this month", etc.
 */
function fallbackParser(userQuery: string, currentDate: Date): AvailabilityQuery {
  const query = userQuery.toLowerCase();

  // Determine intent
  let intent: 'find_days' | 'find_slots' | 'suggest_times' = 'find_days';
  if (query.includes('slot') || query.includes('time')) {
    intent = 'find_slots';
  }
  if (query.includes('suggest') || query.includes('best') || query.includes('recommend')) {
    intent = 'suggest_times';
  }

  // Determine time preference
  let timePreference: 'morning' | 'afternoon' | 'evening' | 'any' = 'any';
  if (query.includes('morning')) timePreference = 'morning';
  if (query.includes('afternoon')) timePreference = 'afternoon';
  if (query.includes('evening')) timePreference = 'evening';

  // Determine duration
  let slotDuration: '1hour' | 'half-day' | 'full-day' | undefined;
  if (query.includes('half day') || query.includes('half-day')) slotDuration = 'half-day';
  if (query.includes('full day') || query.includes('full-day')) slotDuration = 'full-day';

  // Extract count
  let count: number | undefined;
  const countMatch = query.match(/top (\d+)|(\d+) (times|suggestions|results)/);
  if (countMatch) {
    count = parseInt(countMatch[1] || countMatch[2]);
  }

  // Determine date range (default patterns)
  let start = new Date(currentDate);
  let end = new Date(currentDate);

  if (query.includes('next week')) {
    // Next Monday
    const daysUntilMonday = (8 - start.getDay()) % 7 || 7;
    start.setDate(start.getDate() + daysUntilMonday);
    end = new Date(start);
    end.setDate(end.getDate() + 6);  // Sunday of next week
  } else if (query.includes('this week')) {
    // Monday of current week
    const daysFromMonday = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - daysFromMonday);
    end = new Date(start);
    end.setDate(end.getDate() + 6);
  } else if (query.includes('next month')) {
    start = new Date(start.getFullYear(), start.getMonth() + 1, 1);
    end = new Date(start.getFullYear(), start.getMonth() + 2, 0);  // Last day of next month
  } else if (query.includes('this month')) {
    start = new Date(start.getFullYear(), start.getMonth(), 1);
    end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
  } else {
    // Default: next 30 days
    end.setDate(end.getDate() + 30);
  }

  return {
    intent,
    dateRange: { start, end },
    timePreference,
    slotDuration,
    count
  };
}

/**
 * Parse natural language query with Claude AI
 *
 * @param userQuery - Natural language query from user
 * @param currentDate - Current date for relative date parsing
 * @returns Structured AvailabilityQuery or null if parsing fails
 */
async function parseWithClaude(userQuery: string, currentDate: Date): Promise<AvailabilityQuery | null> {
  try {
    const systemPrompt = SYSTEM_PROMPT.replace('{{currentDate}}', currentDate.toISOString().split('T')[0]);

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userQuery
        }
      ]
    });

    // Extract text content
    const content = response.content[0];
    if (content.type !== 'text') {
      console.error('Claude returned non-text content');
      return null;
    }

    // Parse JSON response
    const parsed = JSON.parse(content.text);

    // Convert date strings to Date objects
    const query: AvailabilityQuery = {
      intent: parsed.intent,
      dateRange: {
        start: new Date(parsed.dateRange.start),
        end: new Date(parsed.dateRange.end)
      },
      timePreference: parsed.timePreference,
      slotDuration: parsed.slotDuration,
      count: parsed.count
    };

    // Validate parsed query
    if (!query.intent || !query.dateRange.start || !query.dateRange.end) {
      console.error('Claude returned incomplete query');
      return null;
    }

    return query;
  } catch (error) {
    console.error('Error parsing with Claude:', error);
    return null;
  }
}

/**
 * POST /api/availability/parse-query
 *
 * Parse natural language availability query into structured format.
 *
 * @body { userQuery: string } - Natural language query
 * @returns ParseQueryResponse | ParseQueryError
 *
 * @example
 * POST /api/availability/parse-query
 * {
 *   "userQuery": "Available mornings next week"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "query": {
 *     "intent": "find_slots",
 *     "dateRange": { "start": "2026-01-06T00:00:00.000Z", "end": "2026-01-12T00:00:00.000Z" },
 *     "timePreference": "morning"
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();

    // Import validation at runtime to avoid circular dependencies
    const { ParseQueryRequestSchema, safeValidate } = await import('@/lib/validation/schemas');
    const validation = safeValidate(ParseQueryRequestSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error
        } satisfies ParseQueryError,
        { status: 400 }
      );
    }

    const { userQuery } = validation.data;

    // Get current date for relative date parsing
    const currentDate = new Date();

    // Try parsing with Claude first
    let query = await parseWithClaude(userQuery, currentDate);
    let usedFallback = false;

    // Fall back to pattern-based parser if Claude fails
    if (!query) {
      console.warn('Claude parsing failed, using fallback parser');
      query = fallbackParser(userQuery, currentDate);
      usedFallback = true;
    }

    // Return successful response
    const response: ParseQueryResponse = {
      success: true,
      query,
      warning: usedFallback ? 'Used fallback parser - results may be less accurate' : undefined
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in parse-query route:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      } satisfies ParseQueryError,
      { status: 500 }
    );
  }
}
