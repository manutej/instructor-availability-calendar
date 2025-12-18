# Public Calendar Sharing & Email Generation Guide

**Project**: Instructor Calendar Availability System
**Feature**: Public shareable calendars + professional email responses
**Purpose**: Enable students/clients to view instructor availability without login
**Timeline Impact**: +2 hours to MVP (13 hours total)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Public Calendar Sharing](#public-calendar-sharing)
   - [Architecture Overview](#architecture-overview)
   - [Dynamic Route Implementation](#dynamic-route-implementation)
   - [URL Slug Generation](#url-slug-generation)
   - [Authentication Strategy](#authentication-strategy)
   - [Read-Only Calendar Component](#read-only-calendar-component)
3. [Email Generation System](#email-generation-system)
   - [Email Template Library](#email-template-library)
   - [Date Verification Logic](#date-verification-logic)
   - [Professional Email Formatting](#professional-email-formatting)
   - [Calendar Attachment (.ics)](#calendar-attachment-ics)
4. [Complete Code Examples](#complete-code-examples)
5. [Implementation Timeline](#implementation-timeline)
6. [Testing & Validation](#testing--validation)

---

## Executive Summary

### What We're Building

**Two Modes**:
1. **Private Mode** (instructor): `/dashboard` - Full CRUD operations on availability
2. **Public Mode** (students): `/calendar/[instructor-slug]` - Read-only view of available dates

**Key Features**:
- Shareable URLs: `yoursite.com/calendar/john-doe`
- Professional email generation with available dates
- Day-of-week verification (prevent "Monday, Jan 5, 2026" when it's actually Tuesday)
- .ics calendar file attachment for email clients
- No authentication required for public viewing

### Tech Stack Additions

| Library | Purpose | Size | Why |
|---------|---------|------|-----|
| `react-email` | Email templates | ~15 KB | Production-grade HTML email rendering |
| `ics` | .ics file generation | ~8 KB | iCalendar format compliance |
| `slugify` | URL slug creation | ~2 KB | Safe URL generation from names |
| **Total** | | **~25 KB** | **Lightweight addition to 151 KB base** |

### Timeline Impact

| Phase | Original | With Public Sharing | Delta |
|-------|----------|-------------------|-------|
| Phase 1 (Setup) | 1h | 1h | +0h |
| Phase 2 (Calendar) | 3h | 3h | +0h |
| Phase 3 (State) | 2h | 2h | +0h |
| Phase 4 (Interactions) | 2.5h | 2.5h | +0h |
| Phase 5 (MCP) | 1.5h | 1.5h | +0h |
| **Phase 7 (Public Sharing)** | - | **1.5h** | **+1.5h** |
| **Phase 8 (Email System)** | - | **0.5h** | **+0.5h** |
| Phase 6 (Polish) | 1h | 1h | +0h |
| **Total** | **11h** | **13h** | **+2h** |

---

## Public Calendar Sharing

### Architecture Overview

```
Private Route (authenticated):
  /dashboard
    ├── CalendarGrid (editable)
    ├── Block/unblock controls
    └── Share URL generator

Public Route (no auth):
  /calendar/[slug]
    ├── CalendarGrid (read-only)
    ├── Available dates highlighted
    └── Contact instructor CTA
```

**Data Flow**:
```
1. Instructor creates availability → Stored in DB/localStorage
2. System generates slug from instructor name → "John Doe" → "john-doe"
3. Public URL shared: yoursite.com/calendar/john-doe
4. Public visitor accesses URL → Fetches availability (read-only)
5. Available dates displayed → Green highlights, blocked = gray
```

### Dynamic Route Implementation

**File Structure**:
```
app/
├── dashboard/
│   └── page.tsx              # Private: Instructor calendar editor
├── calendar/
│   └── [slug]/
│       ├── page.tsx          # Public: Read-only calendar view
│       └── layout.tsx        # Public layout (no auth required)
├── api/
│   ├── calendar/
│   │   └── route.ts          # Private: MCP integration
│   └── availability/
│       └── [slug]/
│           └── route.ts      # Public: Fetch availability by slug
└── layout.tsx                # Root layout
```

**App Router Implementation**:

```typescript
// app/calendar/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { PublicCalendarView } from '@/components/PublicCalendarView';

interface PageProps {
  params: { slug: string };
}

// Statically generate routes for known instructors
export async function generateStaticParams() {
  // Fetch all instructor slugs from database
  const instructors = await fetch('https://yourapi.com/instructors')
    .then(res => res.json());

  return instructors.map((instructor: { slug: string }) => ({
    slug: instructor.slug,
  }));
}

// Enable dynamic params for new instructors (on-demand generation)
export const dynamicParams = true;

// Revalidate every 5 minutes to pick up availability changes
export const revalidate = 300;

export default async function PublicCalendarPage({ params }: PageProps) {
  const { slug } = params;

  // Fetch instructor data and availability
  const instructor = await getInstructorBySlug(slug);

  if (!instructor) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicCalendarView
        instructor={instructor}
        availability={instructor.availability}
      />
    </div>
  );
}

// Server-side data fetching
async function getInstructorBySlug(slug: string) {
  try {
    const res = await fetch(`https://yourapi.com/availability/${slug}`, {
      next: { revalidate: 300 } // Cache for 5 minutes
    });

    if (!res.ok) return null;

    return await res.json();
  } catch (error) {
    console.error('Failed to fetch instructor:', error);
    return null;
  }
}
```

**API Route for Public Availability**:

```typescript
// app/api/availability/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

  try {
    // Fetch from database or localStorage backup
    const availability = await fetchAvailabilityBySlug(slug);

    if (!availability) {
      return NextResponse.json(
        { error: 'Instructor not found' },
        { status: 404 }
      );
    }

    // Return only public data (no personal info)
    return NextResponse.json({
      instructorName: availability.name,
      slug: availability.slug,
      blockedDates: availability.blockedDates, // ISO date strings
      halfDayBlocks: availability.halfDayBlocks,
      timezone: availability.timezone,
      updatedAt: availability.updatedAt,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Failed to fetch availability:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function fetchAvailabilityBySlug(slug: string) {
  // Implementation depends on your storage solution
  // Example with mock data:
  const instructors = {
    'john-doe': {
      name: 'John Doe',
      slug: 'john-doe',
      blockedDates: ['2026-01-05', '2026-01-12'],
      halfDayBlocks: [
        { date: '2026-01-08', period: 'AM' },
      ],
      timezone: 'America/New_York',
      updatedAt: new Date().toISOString(),
    },
  };

  return instructors[slug] || null;
}
```

### URL Slug Generation

**Installation**:
```bash
npm install slugify
```

**Slug Generator Utility**:

```typescript
// lib/slugify.ts
import slugify from 'slugify';

export function generateInstructorSlug(name: string): string {
  return slugify(name, {
    lower: true,      // Convert to lowercase
    strict: true,     // Strip special characters
    remove: /[*+~.()'"!:@]/g, // Remove these characters
  });
}

// Examples:
// "John Doe" → "john-doe"
// "María García" → "maria-garcia"
// "Dr. James O'Brien" → "dr-james-obrien"
// "李明 (Li Ming)" → "li-ming"

export function generateShareableURL(instructorName: string, baseURL?: string): string {
  const slug = generateInstructorSlug(instructorName);
  const base = baseURL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  return `${base}/calendar/${slug}`;
}
```

**Usage in Dashboard**:

```typescript
// components/ShareURLGenerator.tsx
'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { generateShareableURL } from '@/lib/slugify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ShareURLGeneratorProps {
  instructorName: string;
}

export function ShareURLGenerator({ instructorName }: ShareURLGeneratorProps) {
  const [copied, setCopied] = useState(false);
  const shareURL = generateShareableURL(instructorName);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareURL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700">
        Shareable Calendar URL
      </label>
      <div className="flex gap-2">
        <Input
          value={shareURL}
          readOnly
          className="font-mono text-sm"
        />
        <Button
          onClick={handleCopy}
          variant="outline"
          size="sm"
          className="shrink-0"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-1" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </>
          )}
        </Button>
      </div>
      <p className="text-xs text-slate-500">
        Share this URL with students to let them view your availability
      </p>
    </div>
  );
}
```

### Authentication Strategy

**Middleware for Route Protection**:

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes (no auth required)
  const publicRoutes = [
    '/calendar/',      // Public calendar views
    '/api/availability/', // Public availability API
  ];

  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  if (isPublicRoute) {
    return NextResponse.next(); // Allow access
  }

  // Protected routes require authentication
  const isAuthenticated = checkAuth(request);

  if (!isAuthenticated && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

function checkAuth(request: NextRequest): boolean {
  // Implement your auth check (session, JWT, etc.)
  const token = request.cookies.get('auth-token');
  return !!token;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/calendar/:path*',
    '/api/calendar/:path*',
    '/api/availability/:path*',
  ],
};
```

### Read-Only Calendar Component

```typescript
// components/PublicCalendarView.tsx
'use client';

import { useState } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { CalendarGrid } from './CalendarGrid';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Mail } from 'lucide-react';

interface PublicCalendarViewProps {
  instructor: {
    name: string;
    slug: string;
  };
  availability: {
    blockedDates: string[]; // ISO date strings
    halfDayBlocks: Array<{ date: string; period: 'AM' | 'PM' }>;
    timezone: string;
  };
}

export function PublicCalendarView({
  instructor,
  availability
}: PublicCalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Convert blocked dates to Set for O(1) lookup
  const blockedDatesSet = new Set(availability.blockedDates);
  const halfDayMap = new Map(
    availability.halfDayBlocks.map(block => [block.date, block.period])
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          {instructor.name}'s Availability
        </h1>
        <p className="text-slate-600">
          View available dates for booking
        </p>
      </div>

      {/* Calendar */}
      <Card className="p-6 mb-6">
        <CalendarGrid
          currentMonth={currentMonth}
          onMonthChange={setCurrentMonth}
          blockedDates={blockedDatesSet}
          halfDayBlocks={halfDayMap}
          readOnly={true} // Disable all interactions
        />
      </Card>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mb-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-green-100 border-2 border-green-600 rounded" />
          <span className="text-slate-700">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-red-100 border-2 border-red-600 rounded" />
          <span className="text-slate-700">Blocked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-green-100 to-red-100 border-2 border-slate-400 rounded" />
          <span className="text-slate-700">Partially Available</span>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <Button size="lg" asChild>
          <a href={`mailto:${instructor.slug}@example.com`}>
            <Mail className="h-5 w-5 mr-2" />
            Contact {instructor.name}
          </a>
        </Button>
        <p className="text-xs text-slate-500 mt-2">
          Last updated: {format(new Date(), 'MMM d, yyyy h:mm a')}
        </p>
      </div>
    </div>
  );
}
```

---

## Email Generation System

### Email Template Library

**Installation**:
```bash
npm install react-email @react-email/components
npm install --save-dev @types/react
```

**Project Setup**:
```bash
mkdir emails
mkdir emails/templates
```

**Email Template - Available Dates**:

```tsx
// emails/templates/AvailabilityEmail.tsx
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
  Heading,
} from '@react-email/components';
import { format, getDay } from 'date-fns';

interface AvailabilityEmailProps {
  instructorName: string;
  studentName: string;
  availableDates: Array<{
    date: Date;
    period?: 'AM' | 'PM' | 'FULL';
  }>;
  calendarURL: string;
}

// Day names for verification
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function AvailabilityEmail({
  instructorName = 'John Doe',
  studentName = 'Student',
  availableDates = [],
  calendarURL = 'https://example.com/calendar/john-doe',
}: AvailabilityEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Heading style={h1}>
            {instructorName}'s Available Dates
          </Heading>

          {/* Greeting */}
          <Text style={text}>
            Hi {studentName},
          </Text>

          <Text style={text}>
            Thank you for your interest in booking a session. Here are my available dates:
          </Text>

          {/* Available Dates List */}
          <Section style={dateSection}>
            {availableDates.map((slot, index) => {
              const dayName = DAY_NAMES[getDay(slot.date)];
              const dateStr = format(slot.date, 'MMMM d, yyyy');
              const periodStr = slot.period === 'AM' ? ' (Morning)'
                             : slot.period === 'PM' ? ' (Afternoon)'
                             : '';

              return (
                <Text key={index} style={dateItem}>
                  • {dayName}, {dateStr}{periodStr}
                </Text>
              );
            })}
          </Section>

          <Hr style={hr} />

          {/* CTA */}
          <Text style={text}>
            To view my full calendar and book a session:
          </Text>

          <Button style={button} href={calendarURL}>
            View Calendar
          </Button>

          {/* Footer */}
          <Text style={footer}>
            This email was generated automatically. Available dates are updated in real-time.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const h1 = {
  color: '#1e293b',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0 20px',
  padding: '0 40px',
};

const text = {
  color: '#475569',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 40px',
};

const dateSection = {
  margin: '24px 40px',
  backgroundColor: '#f8fafc',
  padding: '20px',
  borderRadius: '8px',
};

const dateItem = {
  color: '#0f172a',
  fontSize: '15px',
  lineHeight: '28px',
  margin: '0',
  fontFamily: 'monospace',
};

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 20px',
  margin: '24px 40px',
};

const hr = {
  borderColor: '#e2e8f0',
  margin: '32px 40px',
};

const footer = {
  color: '#94a3b8',
  fontSize: '12px',
  lineHeight: '20px',
  margin: '32px 40px 0',
};

export default AvailabilityEmail;
```

**Email Rendering Function**:

```typescript
// lib/email.ts
import { render } from '@react-email/render';
import { AvailabilityEmail } from '@/emails/templates/AvailabilityEmail';

export interface EmailData {
  instructorName: string;
  studentName: string;
  studentEmail: string;
  availableDates: Array<{
    date: Date;
    period?: 'AM' | 'PM' | 'FULL';
  }>;
  calendarURL: string;
}

export async function renderAvailabilityEmail(data: EmailData): Promise<string> {
  const html = render(
    <AvailabilityEmail
      instructorName={data.instructorName}
      studentName={data.studentName}
      availableDates={data.availableDates}
      calendarURL={data.calendarURL}
    />
  );

  return html;
}

// Plain text version for email clients that don't support HTML
export async function renderAvailabilityEmailText(data: EmailData): Promise<string> {
  const { instructorName, studentName, availableDates, calendarURL } = data;

  const datesList = availableDates
    .map(slot => {
      const dayName = format(slot.date, 'EEEE');
      const dateStr = format(slot.date, 'MMMM d, yyyy');
      const periodStr = slot.period === 'AM' ? ' (Morning)'
                     : slot.period === 'PM' ? ' (Afternoon)'
                     : '';
      return `• ${dayName}, ${dateStr}${periodStr}`;
    })
    .join('\n');

  return `
${instructorName}'s Available Dates

Hi ${studentName},

Thank you for your interest in booking a session. Here are my available dates:

${datesList}

To view my full calendar and book a session, visit:
${calendarURL}

This email was generated automatically. Available dates are updated in real-time.
  `.trim();
}
```

### Date Verification Logic

**Critical**: Prevent sending emails with incorrect day-of-week/date combinations (e.g., "Monday, Jan 5, 2026" when Jan 5, 2026 is actually a Monday is CORRECT, but if it were Tuesday, that's an error).

```typescript
// lib/date-verification.ts
import {
  format,
  getDay,
  parse,
  isValid,
  isLeapYear,
  getDaysInMonth,
} from 'date-fns';

// Day names for verification
const DAY_NAMES = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday',
  'Thursday', 'Friday', 'Saturday'
] as const;

type DayName = typeof DAY_NAMES[number];

/**
 * Verify that a day name matches the actual day of week for a date
 *
 * @example
 * verifyDayOfWeek(new Date('2026-01-05'), 'Monday') // Returns true (Jan 5, 2026 IS Monday)
 * verifyDayOfWeek(new Date('2026-01-05'), 'Tuesday') // Returns false
 */
export function verifyDayOfWeek(date: Date, expectedDay: DayName): boolean {
  if (!isValid(date)) {
    throw new Error('Invalid date provided');
  }

  const actualDayIndex = getDay(date);
  const actualDayName = DAY_NAMES[actualDayIndex];

  return actualDayName === expectedDay;
}

/**
 * Get the correct day name for a date
 *
 * @example
 * getCorrectDayName(new Date('2026-01-05')) // Returns 'Monday'
 */
export function getCorrectDayName(date: Date): DayName {
  if (!isValid(date)) {
    throw new Error('Invalid date provided');
  }

  const dayIndex = getDay(date);
  return DAY_NAMES[dayIndex];
}

/**
 * Verify a date string matches expected format and day of week
 *
 * @example
 * const result = verifyDateString('Monday, January 5, 2026');
 * // Returns: { valid: true, date: Date, dayName: 'Monday', corrected: null }
 */
export interface DateVerificationResult {
  valid: boolean;
  date: Date | null;
  dayName: string | null;
  expectedDayName: string | null;
  error?: string;
  corrected?: string; // Corrected string if day was wrong
}

export function verifyDateString(
  dateString: string,
  format: string = 'EEEE, MMMM d, yyyy'
): DateVerificationResult {
  try {
    // Parse the date string
    const parsedDate = parse(dateString, format, new Date());

    // Check if date is valid
    if (!isValid(parsedDate)) {
      return {
        valid: false,
        date: null,
        dayName: null,
        expectedDayName: null,
        error: 'Invalid date format',
      };
    }

    // Extract day name from string
    const dayNameMatch = dateString.match(/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/);
    const providedDayName = dayNameMatch ? dayNameMatch[1] : null;

    if (!providedDayName) {
      return {
        valid: false,
        date: parsedDate,
        dayName: null,
        expectedDayName: null,
        error: 'No day name found in date string',
      };
    }

    // Get actual day name
    const actualDayName = getCorrectDayName(parsedDate);

    // Verify match
    if (providedDayName !== actualDayName) {
      // Generate corrected string
      const corrected = dateString.replace(providedDayName, actualDayName);

      return {
        valid: false,
        date: parsedDate,
        dayName: providedDayName,
        expectedDayName: actualDayName,
        error: `Day mismatch: "${providedDayName}" should be "${actualDayName}"`,
        corrected,
      };
    }

    return {
      valid: true,
      date: parsedDate,
      dayName: providedDayName,
      expectedDayName: actualDayName,
    };
  } catch (error) {
    return {
      valid: false,
      date: null,
      dayName: null,
      expectedDayName: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Format date with verified day-of-week
 * Guarantees the day name matches the date
 *
 * @example
 * formatDateVerified(new Date('2026-01-05'))
 * // Returns 'Monday, January 5, 2026'
 */
export function formatDateVerified(
  date: Date,
  formatString: string = 'EEEE, MMMM d, yyyy'
): string {
  if (!isValid(date)) {
    throw new Error('Invalid date provided');
  }

  // format() from date-fns automatically uses correct day name
  return format(date, formatString);
}

/**
 * Validate a date for year 2026+ with leap year handling
 */
export function validateFutureDate(date: Date): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!isValid(date)) {
    errors.push('Invalid date');
    return { valid: false, errors };
  }

  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 0-indexed
  const day = date.getDate();

  // Check year is 2026 or later
  if (year < 2026) {
    errors.push(`Year ${year} is before 2026`);
  }

  // Check leap year for February 29
  if (month === 2 && day === 29 && !isLeapYear(date)) {
    errors.push(`${year} is not a leap year, Feb 29 is invalid`);
  }

  // Check day is valid for month
  const daysInMonth = getDaysInMonth(date);
  if (day > daysInMonth) {
    errors.push(`Day ${day} is invalid for month ${month} (max: ${daysInMonth})`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Example usage in email generation
 */
export function generateEmailDateList(dates: Date[]): Array<{
  formatted: string;
  verified: boolean;
  date: Date;
}> {
  return dates.map(date => {
    const formatted = formatDateVerified(date, 'EEEE, MMMM d, yyyy');
    const validation = validateFutureDate(date);

    return {
      formatted,
      verified: validation.valid,
      date,
    };
  }).filter(item => item.verified); // Only return valid dates
}
```

**Usage Example**:

```typescript
// Example: Verify dates before sending email
import { verifyDateString, formatDateVerified, validateFutureDate } from '@/lib/date-verification';

// BAD: Manual string construction (prone to errors)
const badDate = `Monday, January 5, 2026`; // Is Jan 5, 2026 actually Monday?

// GOOD: Automatic verification
const date = new Date('2026-01-05');
const goodDate = formatDateVerified(date); // Returns 'Monday, January 5, 2026'

// Verify existing strings
const result = verifyDateString('Tuesday, January 5, 2026');
console.log(result);
// {
//   valid: false,
//   date: 2026-01-05T00:00:00.000Z,
//   dayName: 'Tuesday',
//   expectedDayName: 'Monday',
//   error: 'Day mismatch: "Tuesday" should be "Monday"',
//   corrected: 'Monday, January 5, 2026'
// }

// Validate future dates
const validation = validateFutureDate(new Date('2026-02-29'));
console.log(validation);
// {
//   valid: false,
//   errors: ['2026 is not a leap year, Feb 29 is invalid']
// }
```

### Professional Email Formatting

**Complete Email API Route**:

```typescript
// app/api/email/send-availability/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { renderAvailabilityEmail, renderAvailabilityEmailText } from '@/lib/email';
import { generateCalendarICS } from '@/lib/ics';
import { formatDateVerified, validateFutureDate } from '@/lib/date-verification';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      instructorName,
      instructorEmail,
      studentName,
      studentEmail,
      availableDates, // Array of ISO date strings
      calendarURL,
    } = body;

    // Validate and convert dates
    const validatedDates = availableDates
      .map((dateStr: string) => new Date(dateStr))
      .filter((date: Date) => {
        const validation = validateFutureDate(date);
        return validation.valid;
      });

    if (validatedDates.length === 0) {
      return NextResponse.json(
        { error: 'No valid dates provided' },
        { status: 400 }
      );
    }

    // Prepare email data
    const emailData = {
      instructorName,
      studentName,
      studentEmail,
      availableDates: validatedDates.map(date => ({
        date,
        period: 'FULL' as const,
      })),
      calendarURL,
    };

    // Render email HTML and text
    const html = await renderAvailabilityEmail(emailData);
    const text = await renderAvailabilityEmailText(emailData);

    // Generate .ics attachment
    const icsFile = await generateCalendarICS({
      instructorName,
      dates: validatedDates,
    });

    // Send email (using your email service - Resend, SendGrid, etc.)
    await sendEmail({
      from: instructorEmail,
      to: studentEmail,
      subject: `${instructorName}'s Available Dates`,
      html,
      text,
      attachments: [
        {
          filename: 'availability.ics',
          content: icsFile,
          contentType: 'text/calendar',
        },
      ],
    });

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      datesSent: validatedDates.length,
    });
  } catch (error) {
    console.error('Failed to send email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}

// Placeholder for your email service
async function sendEmail(options: any) {
  // Implement with Resend, SendGrid, NodeMailer, etc.
  console.log('Sending email:', options);
}
```

### Calendar Attachment (.ics)

**Installation**:
```bash
npm install ics
```

**ICS Generator**:

```typescript
// lib/ics.ts
import { createEvents, EventAttributes } from 'ics';
import { format } from 'date-fns';

export interface ICSEventData {
  instructorName: string;
  dates: Date[];
  timezone?: string;
}

/**
 * Generate .ics calendar file with available dates
 */
export async function generateCalendarICS(data: ICSEventData): Promise<string> {
  const { instructorName, dates, timezone = 'America/New_York' } = data;

  // Convert Date objects to ics format: [year, month, day, hour, minute]
  const events: EventAttributes[] = dates.map(date => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // ics uses 1-indexed months
    const day = date.getDate();

    return {
      start: [year, month, day],
      duration: { hours: 24 }, // All-day event
      title: `Available - ${instructorName}`,
      description: `${instructorName} is available for booking on this date.`,
      status: 'CONFIRMED',
      busyStatus: 'FREE',
      organizer: { name: instructorName },
      categories: ['Availability', 'Booking'],
      // @ts-ignore - timezone not in types but supported
      timezone,
    };
  });

  return new Promise((resolve, reject) => {
    createEvents(events, (error, value) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(value);
    });
  });
}

/**
 * Generate .ics file for download (browser)
 */
export async function downloadICSFile(data: ICSEventData, filename: string = 'availability.ics') {
  const icsContent = await generateCalendarICS(data);

  const blob = new Blob([icsContent], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
```

**Usage in Component**:

```typescript
// components/ExportCalendarButton.tsx
'use client';

import { Download } from 'lucide-react';
import { Button } from './ui/button';
import { downloadICSFile } from '@/lib/ics';

interface ExportCalendarButtonProps {
  instructorName: string;
  availableDates: Date[];
}

export function ExportCalendarButton({
  instructorName,
  availableDates
}: ExportCalendarButtonProps) {
  const handleExport = async () => {
    try {
      await downloadICSFile({
        instructorName,
        dates: availableDates,
      }, `${instructorName.toLowerCase().replace(/\s+/g, '-')}-availability.ics`);
    } catch (error) {
      console.error('Failed to export calendar:', error);
      alert('Failed to export calendar file');
    }
  };

  return (
    <Button
      onClick={handleExport}
      variant="outline"
      size="sm"
    >
      <Download className="h-4 w-4 mr-2" />
      Export Calendar (.ics)
    </Button>
  );
}
```

---

## Complete Code Examples

### Full Public Page Example

```typescript
// app/calendar/[slug]/page.tsx (Complete)
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PublicCalendarView } from '@/components/PublicCalendarView';
import { generateInstructorSlug } from '@/lib/slugify';

export const dynamicParams = true;
export const revalidate = 300; // 5 minutes

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const instructor = await getInstructorBySlug(params.slug);

  if (!instructor) {
    return {
      title: 'Instructor Not Found',
    };
  }

  return {
    title: `${instructor.name}'s Availability Calendar`,
    description: `View available dates for booking with ${instructor.name}`,
    openGraph: {
      title: `${instructor.name}'s Availability`,
      description: `View available dates for booking`,
      type: 'website',
    },
  };
}

export async function generateStaticParams() {
  const instructors = await getAllInstructors();
  return instructors.map(instructor => ({
    slug: generateInstructorSlug(instructor.name),
  }));
}

export default async function PublicCalendarPage({ params }: PageProps) {
  const instructor = await getInstructorBySlug(params.slug);

  if (!instructor) {
    notFound();
  }

  return <PublicCalendarView instructor={instructor} availability={instructor.availability} />;
}

async function getInstructorBySlug(slug: string) {
  // Implement based on your data source
  return null;
}

async function getAllInstructors() {
  // Implement based on your data source
  return [];
}
```

### Email Sending Component (Dashboard)

```typescript
// components/SendAvailabilityEmail.tsx
'use client';

import { useState } from 'react';
import { Mail } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { generateShareableURL } from '@/lib/slugify';

interface SendAvailabilityEmailProps {
  instructorName: string;
  instructorSlug: string;
  instructorEmail: string;
  availableDates: Date[];
}

export function SendAvailabilityEmail({
  instructorName,
  instructorSlug,
  instructorEmail,
  availableDates,
}: SendAvailabilityEmailProps) {
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSend = async () => {
    setSending(true);
    setSuccess(false);

    try {
      const calendarURL = generateShareableURL(instructorName);

      const response = await fetch('/api/email/send-availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instructorName,
          instructorEmail,
          studentName,
          studentEmail,
          availableDates: availableDates.map(d => d.toISOString()),
          calendarURL,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      setSuccess(true);
      setStudentName('');
      setStudentEmail('');
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="font-semibold text-lg">Send Availability Email</h3>

      <div className="space-y-2">
        <Label htmlFor="student-name">Student Name</Label>
        <Input
          id="student-name"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
          placeholder="John Smith"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="student-email">Student Email</Label>
        <Input
          id="student-email"
          type="email"
          value={studentEmail}
          onChange={(e) => setStudentEmail(e.target.value)}
          placeholder="student@example.com"
        />
      </div>

      <Button
        onClick={handleSend}
        disabled={!studentName || !studentEmail || sending || availableDates.length === 0}
        className="w-full"
      >
        <Mail className="h-4 w-4 mr-2" />
        {sending ? 'Sending...' : `Send Available Dates (${availableDates.length})`}
      </Button>

      {success && (
        <p className="text-sm text-green-600">
          ✓ Email sent successfully to {studentEmail}
        </p>
      )}

      {availableDates.length === 0 && (
        <p className="text-sm text-amber-600">
          No available dates to send. Unblock some dates first.
        </p>
      )}
    </div>
  );
}
```

---

## Implementation Timeline

### Phase 7: Public Calendar Sharing (1.5 hours)

**Tasks**:

1. **Setup Routes** (20 min)
   - Create `app/calendar/[slug]/` directory
   - Implement `page.tsx` with dynamic params
   - Setup API route `/api/availability/[slug]/route.ts`
   - Configure middleware for public access

2. **Slug Generation** (15 min)
   - Install `slugify` package
   - Create `lib/slugify.ts` utility
   - Add `ShareURLGenerator` component to dashboard
   - Test with various instructor names

3. **Public Calendar View** (30 min)
   - Create `PublicCalendarView` component
   - Modify `CalendarGrid` to support read-only mode
   - Add legend and CTA section
   - Style for public-facing presentation

4. **Data Fetching** (15 min)
   - Implement `getInstructorBySlug()` function
   - Add caching strategy (5 min revalidation)
   - Handle 404 cases with `notFound()`
   - Test with mock data

5. **Testing & Polish** (10 min)
   - Test shareable URLs
   - Verify read-only behavior
   - Test cache invalidation
   - Mobile responsiveness check

### Phase 8: Email Generation System (0.5 hours)

**Tasks**:

1. **Email Template Setup** (10 min)
   - Install `react-email` and `ics` packages
   - Create `emails/templates/` directory
   - Implement `AvailabilityEmail.tsx` template
   - Test rendering with preview

2. **Date Verification** (10 min)
   - Create `lib/date-verification.ts`
   - Implement verification functions
   - Add validation for 2026+ dates
   - Unit test critical cases

3. **ICS Generation** (5 min)
   - Create `lib/ics.ts`
   - Implement calendar file generation
   - Add download functionality
   - Test .ics file opens in calendar apps

4. **Email API Route** (10 min)
   - Create `/api/email/send-availability/route.ts`
   - Integrate template rendering
   - Add .ics attachment logic
   - Configure email service (Resend/SendGrid)

5. **Dashboard Integration** (5 min)
   - Add `SendAvailabilityEmail` component
   - Integrate with existing dashboard
   - Test end-to-end email flow
   - Verify date accuracy

---

## Testing & Validation

### Date Verification Tests

```typescript
// __tests__/date-verification.test.ts
import { describe, test, expect } from '@jest/globals';
import {
  verifyDayOfWeek,
  getCorrectDayName,
  verifyDateString,
  formatDateVerified,
  validateFutureDate,
} from '@/lib/date-verification';

describe('Date Verification', () => {
  test('verifyDayOfWeek - correct match', () => {
    const jan5_2026 = new Date('2026-01-05'); // Monday
    expect(verifyDayOfWeek(jan5_2026, 'Monday')).toBe(true);
  });

  test('verifyDayOfWeek - incorrect match', () => {
    const jan5_2026 = new Date('2026-01-05'); // Monday
    expect(verifyDayOfWeek(jan5_2026, 'Tuesday')).toBe(false);
  });

  test('getCorrectDayName - returns correct day', () => {
    const jan5_2026 = new Date('2026-01-05');
    expect(getCorrectDayName(jan5_2026)).toBe('Monday');
  });

  test('verifyDateString - detects mismatch', () => {
    const result = verifyDateString('Tuesday, January 5, 2026');
    expect(result.valid).toBe(false);
    expect(result.expectedDayName).toBe('Monday');
    expect(result.corrected).toBe('Monday, January 5, 2026');
  });

  test('formatDateVerified - always correct', () => {
    const jan5_2026 = new Date('2026-01-05');
    const formatted = formatDateVerified(jan5_2026);
    expect(formatted).toBe('Monday, January 5, 2026');
  });

  test('validateFutureDate - rejects leap year errors', () => {
    const feb29_2026 = new Date('2026-02-29'); // 2026 is NOT a leap year
    const result = validateFutureDate(feb29_2026);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('2026 is not a leap year, Feb 29 is invalid');
  });

  test('validateFutureDate - accepts valid leap year', () => {
    const feb29_2028 = new Date('2028-02-29'); // 2028 IS a leap year
    const result = validateFutureDate(feb29_2028);
    expect(result.valid).toBe(true);
  });
});
```

### Manual Testing Checklist

**Public Calendar**:
- [ ] Access `/calendar/john-doe` without authentication
- [ ] Verify blocked dates show as red
- [ ] Verify available dates show as green
- [ ] Month navigation works (read-only)
- [ ] URL slug handles special characters (O'Brien → obrien)
- [ ] 404 page for non-existent instructors
- [ ] Cache updates within 5 minutes of availability changes

**Email Generation**:
- [ ] Email renders correctly in Gmail, Outlook, Apple Mail
- [ ] All dates show correct day-of-week
- [ ] .ics file attachment opens in calendar apps
- [ ] Plain text version readable
- [ ] Links work (calendar URL)
- [ ] No dates from 2025 or earlier
- [ ] February 29 only on leap years (2028, 2032, not 2026, 2027)

**Date Verification**:
- [ ] "Monday, January 5, 2026" → Verified ✓
- [ ] "Tuesday, January 5, 2026" → Error detected, corrected to "Monday"
- [ ] Feb 29, 2026 → Rejected (not a leap year)
- [ ] Feb 29, 2028 → Accepted (leap year)

---

## Success Criteria

### Functional Requirements ✅

- [ ] Public calendar accessible at `/calendar/[instructor-slug]`
- [ ] No authentication required for public viewing
- [ ] Shareable URL generator in dashboard
- [ ] Email template renders with verified dates
- [ ] .ics calendar file attachment works
- [ ] Day-of-week verification prevents errors
- [ ] All dates display correctly for 2026+

### Performance Requirements ✅

- [ ] Public page loads < 2s on 4G
- [ ] Email generation < 500ms
- [ ] .ics file generation < 100ms
- [ ] Public calendar cache (5 min) working
- [ ] Bundle size increase < 30 KB

### Quality Requirements ✅

- [ ] All email clients render correctly (Gmail, Outlook, Apple Mail)
- [ ] .ics files open in all major calendar apps
- [ ] Date verification catches 100% of day mismatches
- [ ] Mobile responsive public calendar
- [ ] Accessibility (keyboard navigation, screen readers)

---

## References

### Documentation
- [Next.js Dynamic Routes](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes)
- [React Email Components](https://react.email/docs/components/html)
- [date-fns Documentation](https://date-fns.org/docs/Getting-Started)
- [ics Package](https://www.npmjs.com/package/ics)

### Related Guides
- `NEXTJS-IMPLEMENTATION-GUIDE.md` - Next.js App Router patterns
- `DATE-UTILITIES-GUIDE.md` - date-fns utilities
- `REACT-PATTERNS-GUIDE.md` - State management patterns
- `IMPLEMENTATION-PLAN.md` - Master implementation plan

---

**Generated**: 2025-12-16
**Author**: deep-researcher agent
**Status**: Ready for implementation
**Timeline**: +2 hours to MVP (13 hours total)

🚀 **Public sharing + email system ready to build!**
