/**
 * Email Generation API Route
 *
 * Generates professional availability emails using Claude AI (Anthropic) for intelligent
 * email composition based on persistent store data.
 *
 * @module app/api/email/generate
 *
 * Features:
 * - Reads availability data from persistent store
 * - Uses Claude API to generate intelligent, context-aware email text
 * - Renders HTML email using react-email template
 * - Generates plain text version
 * - Creates .ics calendar file for available dates
 *
 * Environment Variables:
 * - ANTHROPIC_API_KEY: Required for Claude API access
 *
 * @see components/dashboard/EmailGenerator for UI component
 * @see emails/availability-email for email template
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { render } from '@react-email/render';
import AvailabilityEmail from '@/emails/availability-email';
import { PersistenceService } from '@/lib/data/persistence';
import { format, addDays, isBefore, startOfDay } from 'date-fns';
import type { VerifiedDate } from '@/types/email';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Types
interface GenerateEmailRequest {
  instructorName: string;
  instructorEmail: string;
  customMessage?: string;
  calendarLink: string;
  count?: number; // Number of available dates to include
  startDate?: string; // ISO date string for range start
  endDate?: string; // ISO date string for range end
}

interface EmailGenerationResponse {
  html: string;
  text: string;
  ics: string;
  availableDates: string[];
}

/**
 * POST /api/email/generate
 *
 * Generates availability email using Claude AI for intelligent composition
 */
export async function POST(request: NextRequest) {
  try {
    // Validate API key
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY environment variable is not configured' },
        { status: 500 }
      );
    }

    // Parse request body
    const body: GenerateEmailRequest = await request.json();
    const {
      instructorName,
      instructorEmail,
      customMessage,
      calendarLink,
      count = 10,
      startDate,
      endDate,
    } = body;

    // Validate required fields
    if (!instructorName || !instructorEmail || !calendarLink) {
      return NextResponse.json(
        { error: 'Missing required fields: instructorName, instructorEmail, calendarLink' },
        { status: 400 }
      );
    }

    // Initialize persistence service
    const persistence = PersistenceService.getInstance(instructorEmail);

    // Load availability data from persistent store
    const availabilityData = await persistence.loadAvailability();

    if (!availabilityData) {
      return NextResponse.json(
        { error: 'No availability data found. Please configure your calendar first.' },
        { status: 404 }
      );
    }

    // Extract available dates from blocked dates (inverse logic)
    const blockedDates = availabilityData.blockedDates;
    const today = startOfDay(new Date());
    const rangeStart = startDate ? startOfDay(new Date(startDate)) : today;
    const rangeEnd = endDate ? startOfDay(new Date(endDate)) : addDays(today, 90); // Default 90 days

    // Generate list of all dates in range
    const allDates: Date[] = [];
    let currentDate = rangeStart;
    while (isBefore(currentDate, rangeEnd)) {
      allDates.push(currentDate);
      currentDate = addDays(currentDate, 1);
    }

    // Filter out blocked dates
    const availableDates: VerifiedDate[] = allDates
      .filter((date) => {
        const dateKey = format(date, 'yyyy-MM-dd');
        const blockedDate = blockedDates[dateKey];
        // Available if not blocked or not full day block
        return !blockedDate || blockedDate.status !== 'full';
      })
      .slice(0, count) // Limit to requested count
      .map((date) => ({
        date,
        dayOfWeek: format(date, 'EEEE'),
        formatted: format(date, 'EEEE, MMMM d, yyyy'),
        isVerified: true,
      }));

    if (availableDates.length === 0) {
      return NextResponse.json(
        { error: 'No available dates found in the specified range' },
        { status: 404 }
      );
    }

    // Use Claude to generate intelligent email text
    const claudePrompt = `You are a professional email assistant. Generate a short, professional email about upcoming availability.

Context:
- Instructor: ${instructorName}
- Available dates: ${availableDates.length} dates between ${format(rangeStart, 'MMMM d')} and ${format(rangeEnd, 'MMMM d, yyyy')}
- Custom message: ${customMessage || 'None'}

Generate a brief (2-3 sentences) professional email text that:
1. Introduces the available dates
2. Incorporates the custom message if provided
3. Encourages booking via the calendar link
4. Maintains a warm, professional tone

Return ONLY the email text, no subject line or formatting.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: claudePrompt,
        },
      ],
    });

    // Extract generated text from Claude response
    const generatedText = message.content[0].type === 'text'
      ? message.content[0].text
      : customMessage || 'Here are my available dates for upcoming meetings.';

    // Render HTML email using react-email template
    const html = render(
      AvailabilityEmail({
        instructorName,
        availableDates,
        calendarLink,
        customMessage: generatedText,
      })
    );

    // Generate plain text version
    const text = `
Available Dates - ${instructorName}

${generatedText}

Available Dates:
${availableDates.map((d) => `• ${d.formatted}`).join('\n')}

View complete calendar: ${calendarLink}

A calendar file (.ics) is attached to import these dates into your calendar app.
`.trim();

    // Generate .ics calendar file
    const ics = generateICS(availableDates, instructorName, instructorEmail);

    // Return response
    const response: EmailGenerationResponse = {
      html,
      text,
      ics,
      availableDates: availableDates.map((d) => d.formatted),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Email generation error:', error);

    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `Claude API error: ${error.message}` },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate email' },
      { status: 500 }
    );
  }
}

/**
 * Generate .ics calendar file for available dates
 *
 * Creates iCalendar format file compatible with Google Calendar, Apple Calendar, Outlook.
 *
 * @param dates Array of verified dates
 * @param organizerName Instructor name
 * @param organizerEmail Instructor email
 * @returns .ics file content as string
 */
function generateICS(
  dates: VerifiedDate[],
  organizerName: string,
  organizerEmail: string
): string {
  const now = new Date();
  const timestamp = format(now, "yyyyMMdd'T'HHmmss'Z'");

  // iCalendar header
  let ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Instructor Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Available Dates',
    'X-WR-TIMEZONE:UTC',
    'X-WR-CALDESC:Available dates for booking',
  ].join('\r\n');

  // Add each date as an all-day event
  dates.forEach((verifiedDate, idx) => {
    const date = verifiedDate.date;
    const dateStr = format(date, 'yyyyMMdd');
    const uid = `available-${dateStr}-${idx}@calendar.local`;

    ics += '\r\n' + [
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${timestamp}`,
      `DTSTART;VALUE=DATE:${dateStr}`,
      `DTEND;VALUE=DATE:${dateStr}`,
      `SUMMARY:Available - ${organizerName}`,
      `DESCRIPTION:${organizerName} is available for booking on this date`,
      `ORGANIZER;CN=${organizerName}:mailto:${organizerEmail}`,
      'STATUS:TENTATIVE',
      'TRANSP:TRANSPARENT',
      'END:VEVENT',
    ].join('\r\n');
  });

  ics += '\r\nEND:VCALENDAR';

  return ics;
}
