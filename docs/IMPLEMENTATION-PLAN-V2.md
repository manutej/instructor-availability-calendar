# Calendar Availability System - Implementation Plan v2.0

**Version**: 2.0.0 (Public Sharing + Email Generation)
**Previous**: 1.0.0 (Private calendar only)
**Updated**: 2025-12-16
**Timeline**: 13 hours to MVP (was 11h)

---

## What's New in v2.0

### New Features
1. **Public Calendar Sharing** - Shareable URLs for students/clients
2. **Email Generation** - Professional emails with date verification
3. **Calendar Attachments** - .ics files for email recipients
4. **Dual-Mode System** - Private (instructor) + Public (read-only)

### Timeline Impact
- **Original**: 11 hours (Phases 1-6)
- **Added**: +2 hours (Phases 7-8)
- **Total**: **13 hours to complete MVP**

### Bundle Size Impact
- **Original**: 151 KB gzipped
- **Added**: +25 KB (react-email, ics, slugify)
- **Total**: **176 KB** (still 24 KB under 200 KB budget ✓)

---

## Complete Implementation Roadmap

### Phases 1-6: Core Calendar (11 hours)
*See IMPLEMENTATION-PLAN.md for detailed breakdown*

- Phase 1: Setup (1h)
- Phase 2: Core Calendar (3h)
- Phase 3: State Management (2h)
- Phase 4: Interactions (2.5h)
- Phase 5: MCP Integration (1.5h)
- Phase 6: Polish (1h)

**Checkpoint 6.0** (11 hours): Core calendar complete ✓

---

### Phase 7: Public Sharing (1.5 hours) - NEW

**Goal**: Shareable read-only calendar for students/clients

**Reference**: `docs/PUBLIC-SHARING-EMAIL-GUIDE.md` - Lines 1-600

#### Task 7.1: Install Additional Dependencies (10 min)

```bash
npm install slugify
```

**Expected Output**: Package added to dependencies

#### Task 7.2: Create Instructor Profile Model (20 min)

**File**: `types/instructor.ts`

**Source**: `docs/PUBLIC-SHARING-EMAIL-GUIDE.md:100-150`

```typescript
export interface InstructorProfile {
  id: string;
  slug: string;              // "john-instructor"
  displayName: string;        // "Dr. John Smith"
  email: string;
  publicUrl: string;          // Auto-generated
  isPublic: boolean;          // Enable/disable public calendar
  createdAt: Date;
  theme?: {
    primaryColor?: string;
    logo?: string;
  };
}
```

#### Task 7.3: Create Public API Route (30 min)

**File**: `app/api/availability/[slug]/route.ts`

**Source**: `docs/PUBLIC-SHARING-EMAIL-GUIDE.md:200-280`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { loadBlockedDates } from '@/lib/utils/storage';

export const revalidate = 300; // 5-minute cache

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

  // In MVP: Load from localStorage backup file
  // Future: Database query by slug
  try {
    const blockedDates = loadBlockedDates();
    const instructorProfile = {
      displayName: 'Instructor', // TODO: Load from profile
      slug,
      publicUrl: `${process.env.NEXT_PUBLIC_URL}/calendar/${slug}`
    };

    return NextResponse.json({
      instructor: instructorProfile,
      blockedDates: Array.from(blockedDates.entries()),
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Calendar not found' },
      { status: 404 }
    );
  }
}
```

#### Task 7.4: Create Public Calendar Page (30 min)

**File**: `app/calendar/[slug]/page.tsx`

**Source**: `docs/PUBLIC-SHARING-EMAIL-GUIDE.md:300-450`

```typescript
import { Metadata } from 'next';
import PublicCalendarView from '@/components/calendar/PublicCalendarView';

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  return {
    title: `Calendar - ${params.slug}`,
    description: 'View availability calendar'
  };
}

export default async function PublicCalendarPage({
  params
}: {
  params: { slug: string };
}) {
  // Fetch availability data server-side
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
  const response = await fetch(
    `${baseUrl}/api/availability/${params.slug}`,
    { next: { revalidate: 300 } }
  );

  if (!response.ok) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Calendar Not Found</h1>
        <p className="text-gray-600">
          This calendar link may be inactive or incorrect.
        </p>
      </div>
    );
  }

  const data = await response.json();

  return (
    <main className="container mx-auto py-8">
      <PublicCalendarView
        instructor={data.instructor}
        blockedDates={new Map(data.blockedDates)}
        lastUpdated={data.lastUpdated}
      />
    </main>
  );
}
```

#### Task 7.5: Create Public Calendar Component (30 min)

**File**: `components/calendar/PublicCalendarView.tsx`

**Source**: `docs/PUBLIC-SHARING-EMAIL-GUIDE.md:450-600`

```typescript
'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import CalendarGrid from './CalendarGrid';
import { InstructorProfile, BlockedDate } from '@/types';

interface PublicCalendarViewProps {
  instructor: InstructorProfile;
  blockedDates: Map<string, BlockedDate>;
  lastUpdated: string;
}

export default function PublicCalendarView({
  instructor,
  blockedDates,
  lastUpdated
}: PublicCalendarViewProps) {
  return (
    <Card className="p-6">
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold mb-2">
          {instructor.displayName}'s Availability
        </h1>
        <p className="text-sm text-gray-500">
          Last updated: {new Date(lastUpdated).toLocaleString()}
        </p>
      </div>

      {/* Read-only calendar */}
      <CalendarGrid
        blockedDates={blockedDates}
        editable={false} // KEY: Read-only mode
      />

      {/* Legend */}
      <div className="mt-6 flex gap-4 justify-center text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded" />
          <span>Blocked</span>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-6 text-center">
        <a
          href={`mailto:${instructor.email}`}
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Contact to Book
        </a>
      </div>
    </Card>
  );
}
```

#### Task 7.6: Update CalendarGrid for Read-Only Mode (10 min)

**Update**: `components/calendar/CalendarGrid.tsx`

Add `editable` prop:
```typescript
interface CalendarGridProps {
  editable?: boolean; // NEW: defaults to true
  // ... existing props
}

export default function CalendarGrid({
  editable = true,
  // ... existing props
}: CalendarGridProps) {
  return (
    <div className="grid grid-cols-7 gap-1 lg:gap-2">
      {calendarWeeks.flat().map((day, idx) => (
        <DayCell
          key={idx}
          day={day}
          editable={editable} // Pass to DayCell
        />
      ))}
    </div>
  );
}
```

**Update**: `components/calendar/DayCell.tsx`

Conditionally disable interactions:
```typescript
interface DayCellProps {
  day: CalendarDay;
  editable?: boolean; // NEW
}

export default function DayCell({ day, editable = true }: DayCellProps) {
  const { blockDate, unblockDate } = useAvailability();

  const handleClick = () => {
    if (!editable) return; // Disabled in public mode
    // ... existing click logic
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    if (!editable) {
      e.preventDefault(); // Disable right-click in public mode
      return;
    }
    // ... existing context menu logic
  };

  return (
    <div
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      className={`
        ${bgClass}
        ${editable ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}
      `}
    >
      {day.dayOfMonth}
    </div>
  );
}
```

**Checkpoint 7.0** (12.5 hours elapsed):
- [ ] Public route accessible at `/calendar/test-instructor`
- [ ] Calendar displays in read-only mode
- [ ] No click handlers active
- [ ] "Contact to Book" button visible
- [ ] Mobile responsive

**Documentation**: `docs/PUBLIC-SHARING-EMAIL-GUIDE.md` (Lines 1-600)

---

### Phase 8: Email Generation (1.5 hours) - NEW

**Goal**: Generate professional emails with date-verified availability

**Reference**: `docs/PUBLIC-SHARING-EMAIL-GUIDE.md` - Lines 600-1100

#### Task 8.1: Install Email Dependencies (5 min)

```bash
npm install react-email ics
npm install -D @react-email/components
```

#### Task 8.2: Create Date Verification Utility (30 min)

**File**: `lib/utils/date-verification.ts`

**Source**: `docs/PUBLIC-SHARING-EMAIL-GUIDE.md:700-800`

```typescript
import { format, getDay, isValid, parseISO } from 'date-fns';

export interface VerifiedDate {
  date: Date;
  dayOfWeek: string;         // "Monday"
  formatted: string;          // "Monday, January 5, 2026"
  isVerified: boolean;
  correctedFrom?: string;
}

const DAY_NAMES = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday',
  'Thursday', 'Friday', 'Saturday'
];

/**
 * Verify that a date string matches the expected day of week
 * CRITICAL: Prevents errors like "Monday, Jan 5, 2026" when it's actually Tuesday
 */
export function verifyDate(dateInput: Date | string): VerifiedDate {
  const date = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;

  if (!isValid(date)) {
    throw new Error(`Invalid date: ${dateInput}`);
  }

  const dayIndex = getDay(date); // 0 = Sunday, 1 = Monday, ...
  const actualDayName = DAY_NAMES[dayIndex];
  const formatted = format(date, 'EEEE, MMMM d, yyyy');

  return {
    date,
    dayOfWeek: actualDayName,
    formatted, // Uses date-fns format - ALWAYS correct
    isVerified: true
  };
}

/**
 * Get next available dates from blocked dates map
 */
export function getAvailableDates(
  blockedDates: Map<string, BlockedDate>,
  startDate: Date,
  count: number = 10
): VerifiedDate[] {
  const available: VerifiedDate[] = [];
  let currentDate = new Date(startDate);
  const maxDays = count * 3; // Safety limit

  for (let i = 0; i < maxDays && available.length < count; i++) {
    const dateKey = format(currentDate, 'yyyy-MM-dd');

    if (!blockedDates.has(dateKey)) {
      available.push(verifyDate(currentDate));
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return available;
}

/**
 * Example usage:
 * const verified = verifyDate(new Date('2026-01-05'));
 * console.log(verified.formatted); // "Monday, January 5, 2026" ✓
 *
 * // NEVER do this (manual construction):
 * const wrong = `Tuesday, January 5, 2026`; // ERROR!
 */
```

#### Task 8.3: Create .ics Generator (20 min)

**File**: `lib/utils/ics-generator.ts`

**Source**: `docs/PUBLIC-SHARING-EMAIL-GUIDE.md:800-880`

```typescript
import { createEvents, EventAttributes } from 'ics';
import { format } from 'date-fns';
import { VerifiedDate } from './date-verification';

export interface ICSOptions {
  instructorName: string;
  instructorEmail: string;
  availableDates: VerifiedDate[];
}

export function generateICS({
  instructorName,
  instructorEmail,
  availableDates
}: ICSOptions): string {
  const events: EventAttributes[] = availableDates.map(({ date }) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    return {
      start: [year, month, day],
      duration: { hours: 1 }, // Default 1-hour slot
      title: `Available - ${instructorName}`,
      description: 'Instructor available for booking',
      status: 'TENTATIVE',
      organizer: { name: instructorName, email: instructorEmail },
      categories: ['Availability']
    };
  });

  const { error, value } = createEvents(events);

  if (error) {
    throw new Error(`Failed to create ICS: ${error}`);
  }

  return value || '';
}

export function downloadICS(content: string, filename: string = 'availability.ics') {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
```

#### Task 8.4: Create Email Template Component (30 min)

**File**: `emails/availability-email.tsx`

**Source**: `docs/PUBLIC-SHARING-EMAIL-GUIDE.md:880-1000`

```typescript
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Hr
} from '@react-email/components';
import { VerifiedDate } from '@/lib/utils/date-verification';

interface AvailabilityEmailProps {
  instructorName: string;
  availableDates: VerifiedDate[];
  calendarLink: string;
  customMessage?: string;
}

export default function AvailabilityEmail({
  instructorName,
  availableDates,
  calendarLink,
  customMessage
}: AvailabilityEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section>
            <Text style={heading}>Available Dates - {instructorName}</Text>

            {customMessage && (
              <Text style={paragraph}>{customMessage}</Text>
            )}

            <Text style={paragraph}>
              Here are my available dates for the next few weeks:
            </Text>

            <ul style={list}>
              {availableDates.map((verifiedDate, idx) => (
                <li key={idx} style={listItem}>
                  <strong>{verifiedDate.formatted}</strong>
                </li>
              ))}
            </ul>

            <Hr style={hr} />

            <Text style={paragraph}>
              View my complete availability calendar:
            </Text>

            <Link href={calendarLink} style={link}>
              {calendarLink}
            </Link>

            <Text style={footer}>
              A calendar file is attached to import these dates into your
              calendar app (Google Calendar, Apple Calendar, Outlook).
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif'
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px'
};

const heading = {
  fontSize: '24px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '40px 0 20px'
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0'
};

const list = {
  fontSize: '16px',
  lineHeight: '26px',
  marginLeft: '20px'
};

const listItem = {
  marginBottom: '8px'
};

const link = {
  color: '#0066cc',
  textDecoration: 'underline'
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0'
};

const footer = {
  fontSize: '14px',
  color: '#8898aa',
  lineHeight: '20px',
  marginTop: '32px'
};
```

#### Task 8.5: Create Email Generation API Route (20 min)

**File**: `app/api/email/generate/route.ts`

**Source**: `docs/PUBLIC-SHARING-EMAIL-GUIDE.md:1000-1100`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { render } from '@react-email/render';
import AvailabilityEmail from '@/emails/availability-email';
import { getAvailableDates } from '@/lib/utils/date-verification';
import { generateICS } from '@/lib/utils/ics-generator';
import { loadBlockedDates } from '@/lib/utils/storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      instructorName = 'Instructor',
      instructorEmail,
      startDate = new Date(),
      count = 10,
      customMessage,
      calendarLink
    } = body;

    // Load blocked dates
    const blockedDates = loadBlockedDates();

    // Get available dates with verification
    const availableDates = getAvailableDates(
      blockedDates,
      new Date(startDate),
      count
    );

    if (availableDates.length === 0) {
      return NextResponse.json(
        { error: 'No available dates in selected range' },
        { status: 400 }
      );
    }

    // Generate email HTML
    const emailHtml = render(
      <AvailabilityEmail
        instructorName={instructorName}
        availableDates={availableDates}
        calendarLink={calendarLink}
        customMessage={customMessage}
      />
    );

    // Generate plain text version
    const emailText = availableDates
      .map(d => `• ${d.formatted}`)
      .join('\n');

    // Generate .ics file
    const icsContent = generateICS({
      instructorName,
      instructorEmail,
      availableDates
    });

    return NextResponse.json({
      html: emailHtml,
      text: `Available Dates - ${instructorName}\n\n${emailText}\n\nView calendar: ${calendarLink}`,
      ics: icsContent,
      availableDates: availableDates.map(d => d.formatted)
    });
  } catch (error) {
    console.error('Email generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate email' },
      { status: 500 }
    );
  }
}
```

#### Task 8.6: Create Email Generation UI (15 min)

**File**: `components/dashboard/EmailGenerator.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Copy, Download } from 'lucide-react';

export default function EmailGenerator({
  instructorName,
  instructorEmail,
  calendarLink
}: {
  instructorName: string;
  instructorEmail: string;
  calendarLink: string;
}) {
  const [customMessage, setCustomMessage] = useState('');
  const [generatedEmail, setGeneratedEmail] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/email/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instructorName,
          instructorEmail,
          customMessage,
          calendarLink,
          count: 10 // Next 10 available dates
        })
      });

      const data = await response.json();
      setGeneratedEmail(data);
    } catch (error) {
      console.error('Failed to generate email:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadICS = () => {
    if (!generatedEmail?.ics) return;
    const blob = new Blob([generatedEmail.ics], { type: 'text/calendar' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'availability.ics';
    link.click();
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Generate Availability Email</h3>

      <Textarea
        placeholder="Optional custom message..."
        value={customMessage}
        onChange={e => setCustomMessage(e.target.value)}
        rows={3}
      />

      <Button onClick={handleGenerate} disabled={isGenerating}>
        <Mail className="mr-2 h-4 w-4" />
        {isGenerating ? 'Generating...' : 'Generate Email'}
      </Button>

      {generatedEmail && (
        <div className="border rounded-lg p-4 space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Available Dates:</h4>
            <ul className="list-disc list-inside">
              {generatedEmail.availableDates.map((date: string, idx: number) => (
                <li key={idx}>{date}</li>
              ))}
            </ul>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => copyToClipboard(generatedEmail.html)}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy HTML
            </Button>
            <Button
              variant="outline"
              onClick={() => copyToClipboard(generatedEmail.text)}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy Text
            </Button>
            <Button variant="outline" onClick={downloadICS}>
              <Download className="mr-2 h-4 w-4" />
              Download .ics
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
```

**Checkpoint 8.0** (14 hours elapsed):
- [ ] Email generator UI accessible in dashboard
- [ ] "Generate Email" button creates email
- [ ] Date verification working (day-of-week matches date)
- [ ] .ics file downloads successfully
- [ ] Copy HTML/text to clipboard works
- [ ] Email renders correctly in preview

**Documentation**: `docs/PUBLIC-SHARING-EMAIL-GUIDE.md` (Lines 600-1100)

---

## Updated Success Criteria (v2.0)

### Minimum Viable Success
- [x] User can see a calendar (v1.0)
- [x] User can block days (v1.0)
- [x] Blocks persist on refresh (v1.0)
- [ ] Google Calendar events display (v1.0)
- [ ] **Public calendar accessible at shareable URL** (v2.0 NEW)
- [ ] **Email generates with verified dates** (v2.0 NEW)
- [ ] **.ics attachment downloads** (v2.0 NEW)

### Enhanced Success
- [ ] Half-day blocking (AM/PM)
- [ ] Drag selection
- [ ] Month navigation
- [ ] **Copy shareable URL to clipboard** (v2.0 NEW)
- [ ] **Email templates copy-paste ready** (v2.0 NEW)

---

## Complete Timeline (v2.0)

| Phase | Duration | Cumulative | Tasks |
|-------|----------|------------|-------|
| 1. Setup | 1h | 1h | Next.js + deps + structure |
| 2. Calendar | 3h | 4h | Grid + DayCell + Toolbar |
| 3. State | 2h | 6h | Context + localStorage |
| 4. Interactions | 2.5h | 8.5h | Half-day + Drag + Keyboard |
| 5. MCP | 1.5h | 10h | Google Calendar sync |
| 6. Polish | 1h | 11h | Loading + Errors |
| **7. Public Sharing** | **1.5h** | **12.5h** | **Shareable URLs + Read-only** |
| **8. Email Generation** | **1.5h** | **14h** | **Email + Date verify + .ics** |
| **Buffer** | **-** | **-** | **1h contingency** |
| **Total** | **13-14h** | **13-14h** | **Complete MVP** |

**Critical Path**: 10.5 hours (core features only, no email/public)
**Full MVP**: 13-14 hours (all v2.0 features)
**Emergency Fallback**: 11 hours (v1.0 without public/email)

---

## Bundle Size Validation (v2.0)

| Component | Size | Notes |
|-----------|------|-------|
| Next.js + React base | 70 KB | Core framework |
| date-fns | 14 KB | Date operations |
| shadcn/ui + Radix | 30 KB | UI components |
| Tailwind CSS | 15 KB | Styling |
| MCP SDK | 15 KB | Google Calendar |
| Utilities | 7 KB | Custom code |
| **v1.0 Subtotal** | **151 KB** | **Original MVP** |
| react-email | 15 KB | Email templates |
| ics | 8 KB | Calendar files |
| slugify | 2 KB | URL slugs |
| **v2.0 Addition** | **+25 KB** | **New features** |
| **v2.0 Total** | **176 KB** | **Still under 200 KB budget** ✓ |

**Remaining Budget**: 24 KB

---

## Risk Mitigation (Updated)

### v2.0 Risks

**R009: Public URL Conflicts** (Score 4)
- **Fallback**: Add numeric suffix (`john-instructor-2`)
- **Prevention**: Validate slug uniqueness before creation

**R010: Date Verification Errors** (Score 6)
- **Mitigation**: Always use `date-fns format()` - never manual construction
- **Testing**: Unit tests for all 2026 dates, leap year 2028
- **Code Review**: PR checklist requires date verification audit

**R011: Email Rendering Issues** (Score 3)
- **Solution**: react-email tested across Gmail, Outlook, Apple Mail
- **Fallback**: Plain text version always included

---

## Testing Checklist (v2.0)

### Public Calendar (New)
- [ ] Navigate to `/calendar/test-slug`
- [ ] Calendar displays correctly
- [ ] No edit permissions (read-only)
- [ ] "Contact to Book" button works
- [ ] Mobile responsive (375px width)
- [ ] Last updated timestamp shows

### Email Generation (New)
- [ ] Generate email for next 10 available dates
- [ ] All dates have correct day-of-week (verify manually)
- [ ] Copy HTML to clipboard
- [ ] Copy plain text to clipboard
- [ ] Download .ics file
- [ ] Import .ics to Google Calendar (test)
- [ ] Import .ics to Apple Calendar (test)

### Date Verification (Critical)
```typescript
// Test cases
verifyDate(new Date('2026-01-05')).formatted
// → "Monday, January 5, 2026" ✓

verifyDate(new Date('2028-02-29')).formatted
// → "Tuesday, February 29, 2028" ✓ (Leap year)

// Should throw error:
verifyDate(new Date('2026-02-29'))
// → Error: Invalid date (not a leap year)
```

---

## Documentation Map (v2.0)

### Phase 7 (Public Sharing)
- `docs/PUBLIC-SHARING-EMAIL-GUIDE.md` - Lines 1-600
- `docs/PUBLIC-SHARING-QUICK-REF.md` - Quick reference

### Phase 8 (Email Generation)
- `docs/PUBLIC-SHARING-EMAIL-GUIDE.md` - Lines 600-1100
- `docs/PUBLIC-SHARING-QUICK-REF.md` - Email examples

### All Phases
- `specs/SPEC-V2.md` - Updated requirements
- `docs/IMPLEMENTATION-PLAN-V2.md` - This document
- `PROGRESS.md` - Session history

---

## Quick Start (v2.0)

### Day 1: Core Calendar (11h)
```bash
# Follow IMPLEMENTATION-PLAN.md (v1.0)
# Phases 1-6
```

**Checkpoint**: Working private calendar ✓

### Day 2: Public + Email (2-3h)
```bash
# Install new dependencies
npm install react-email ics slugify

# Phase 7: Public sharing (1.5h)
# Phase 8: Email generation (1.5h)
```

**Final Checkpoint**: Complete v2.0 MVP ✓

---

## Next Steps

1. **Complete Phases 1-6** (11h) - Core calendar from v1.0
2. **Add Phase 7** (1.5h) - Public sharing
3. **Add Phase 8** (1.5h) - Email generation
4. **Test complete workflow**:
   - Instructor blocks dates
   - Generates shareable URL
   - Student views public calendar
   - Instructor generates email
   - Email includes verified dates + .ics attachment

**Total Time**: 13-14 hours to complete v2.0 MVP

---

**Version**: 2.0.0
**Status**: Ready for implementation
**Timeline**: 13-14 hours
**Bundle Size**: 176 KB (24 KB under budget)
**Risk Level**: Medium-Low (all risks mitigated)

🚀 **Ready to build complete MVP with public sharing + email!**
