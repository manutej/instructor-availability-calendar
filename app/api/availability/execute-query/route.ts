/**
 * Execute Query API Route
 *
 * Executes structured availability queries against calendar data.
 * Used in conjunction with parse-query to complete the query workflow.
 *
 * @route POST /api/availability/execute-query
 */

import { NextRequest, NextResponse } from 'next/server';
import { createQueryEngine } from '@/lib/query-engine';
import { getPersistenceAdapter } from '@/lib/data/persistence';
import type {
  AvailabilityQuery,
  ExecuteQueryResponse,
  ExecuteQueryError
} from '@/types/email-generator';

/**
 * POST /api/availability/execute-query
 *
 * Execute a structured availability query against calendar data.
 *
 * @body AvailabilityQuery - Structured query (from parse-query or direct)
 * @returns ExecuteQueryResponse | ExecuteQueryError
 *
 * @example
 * POST /api/availability/execute-query
 * {
 *   "intent": "find_slots",
 *   "dateRange": {
 *     "start": "2026-01-06T00:00:00.000Z",
 *     "end": "2026-01-12T00:00:00.000Z"
 *   },
 *   "timePreference": "morning",
 *   "count": 10
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "results": {
 *     "intent": "find_slots",
 *     "items": [
 *       { "date": "2026-01-06T00:00:00.000Z", "time": "09:00", "period": "morning" },
 *       ...
 *     ],
 *     "query": { ... }
 *   },
 *   "query": { ... }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();

    // Import validation at runtime to avoid circular dependencies
    const { ExecuteQueryRequestSchema, safeValidate } = await import('@/lib/validation/schemas');
    const validation = safeValidate(ExecuteQueryRequestSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error
        } satisfies ExecuteQueryError,
        { status: 400 }
      );
    }

    const normalizedQuery = validation.data;

    // Load calendar data from persistence
    const persistence = getPersistenceAdapter();
    const calendarData = await persistence.loadAvailability();

    if (!calendarData) {
      return NextResponse.json(
        {
          success: false,
          error: 'No calendar data available'
        } satisfies ExecuteQueryError,
        { status: 404 }
      );
    }

    // Create query engine and execute
    const engine = createQueryEngine(calendarData);
    const results = engine.execute(normalizedQuery);

    // Return successful response
    const response: ExecuteQueryResponse = {
      success: true,
      results,
      query: normalizedQuery
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in execute-query route:', error);

    // Handle validation errors from query engine
    if (error instanceof Error && error.message.includes('Invalid date range')) {
      return NextResponse.json(
        {
          success: false,
          error: error.message
        } satisfies ExecuteQueryError,
        { status: 400 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      } satisfies ExecuteQueryError,
      { status: 500 }
    );
  }
}

/**
 * GET /api/availability/execute-query
 *
 * Not supported - use POST instead.
 */
export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: 'GET method not supported. Use POST with query body.'
    } satisfies ExecuteQueryError,
    { status: 405 }
  );
}
