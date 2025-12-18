# Public Sharing & Email - Quick Reference

**One-page cheatsheet** for implementing public calendar sharing and email generation.

---

## Installation (3 commands)

```bash
npm install react-email @react-email/components
npm install ics slugify
npm install --save-dev @types/react
```

**Bundle size**: +25 KB (151 KB → 176 KB, still 24 KB under 200 KB budget)

---

## URL Slug Generation

```typescript
import slugify from 'slugify';

// Generate safe URL slug
const slug = slugify('Dr. John O\'Brien', { lower: true, strict: true });
// → 'dr-john-obrien'

// Full shareable URL
const url = `${process.env.NEXT_PUBLIC_BASE_URL}/calendar/${slug}`;
// → 'https://yoursite.com/calendar/dr-john-obrien'
```

---

## Public Route Setup

```typescript
// app/calendar/[slug]/page.tsx
export const dynamicParams = true;
export const revalidate = 300; // 5 min cache

export default async function PublicCalendarPage({ params }: { params: { slug: string } }) {
  const instructor = await fetch(`/api/availability/${params.slug}`).then(r => r.json());

  return <PublicCalendarView instructor={instructor} readOnly={true} />;
}
```

---

## Date Verification (Critical!)

```typescript
import { format, getDay } from 'date-fns';

// ✅ ALWAYS use format() - guarantees correct day name
const verified = format(new Date('2026-01-05'), 'EEEE, MMMM d, yyyy');
// → 'Monday, January 5, 2026' (CORRECT)

// ❌ NEVER manually construct date strings
const wrong = `Tuesday, January 5, 2026`; // Jan 5, 2026 is Monday!

// Day name verification
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const dayIndex = getDay(new Date('2026-01-05')); // 1
const dayName = DAY_NAMES[dayIndex]; // 'Monday'
```

---

## Email Template (React Email)

```tsx
// emails/templates/AvailabilityEmail.tsx
import { Html, Body, Container, Text, Button } from '@react-email/components';
import { format, getDay } from 'date-fns';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function AvailabilityEmail({ dates }: { dates: Date[] }) {
  return (
    <Html>
      <Body>
        <Container>
          <Text>Available dates:</Text>
          {dates.map((date, i) => {
            const dayName = DAY_NAMES[getDay(date)];
            const dateStr = format(date, 'MMMM d, yyyy');
            return <Text key={i}>• {dayName}, {dateStr}</Text>;
          })}
          <Button href="https://yoursite.com/calendar/john-doe">
            View Calendar
          </Button>
        </Container>
      </Body>
    </Html>
  );
}
```

---

## .ics File Generation

```typescript
import { createEvents } from 'ics';

// Generate calendar file
const events = dates.map(date => ({
  start: [date.getFullYear(), date.getMonth() + 1, date.getDate()],
  duration: { hours: 24 },
  title: 'Available - John Doe',
  status: 'CONFIRMED',
  busyStatus: 'FREE',
}));

createEvents(events, (error, value) => {
  if (!error) {
    // 'value' is .ics file content (string)
    // Attach to email or download
  }
});
```

---

## Email API Route

```typescript
// app/api/email/send-availability/route.ts
import { NextResponse } from 'next/server';
import { render } from '@react-email/render';
import { AvailabilityEmail } from '@/emails/templates/AvailabilityEmail';

export async function POST(request: Request) {
  const { dates, studentEmail } = await request.json();

  const html = render(<AvailabilityEmail dates={dates.map(d => new Date(d))} />);

  // Send via your email service (Resend, SendGrid, etc.)
  await sendEmail({ to: studentEmail, html });

  return NextResponse.json({ success: true });
}
```

---

## Middleware (Public vs Private Routes)

```typescript
// middleware.ts
import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Public routes (no auth)
  if (pathname.startsWith('/calendar/')) {
    return NextResponse.next();
  }

  // Private routes (auth required)
  if (pathname.startsWith('/dashboard')) {
    const isAuth = checkAuth(request);
    if (!isAuth) return NextResponse.redirect('/login');
  }

  return NextResponse.next();
}
```

---

## Date Validation for 2026+

```typescript
import { isValid, isLeapYear, getDaysInMonth } from 'date-fns';

function validateDate(date: Date): boolean {
  if (!isValid(date)) return false;
  if (date.getFullYear() < 2026) return false;

  // Check Feb 29 on non-leap years
  const month = date.getMonth() + 1;
  const day = date.getDate();
  if (month === 2 && day === 29 && !isLeapYear(date)) return false;

  // Check day is valid for month
  if (day > getDaysInMonth(date)) return false;

  return true;
}

// Usage
const valid = validateDate(new Date('2026-02-29')); // false (not leap year)
const valid2 = validateDate(new Date('2028-02-29')); // true (leap year)
```

---

## Common Pitfalls ⚠️

| Mistake | Fix |
|---------|-----|
| Manual date strings: `"Monday, Jan 5, 2026"` | Use `format(date, 'EEEE, MMM d, yyyy')` |
| Feb 29 on non-leap years (2026) | Use `isLeapYear()` validation |
| Month index confusion (0-11 vs 1-12) | date-fns uses 0-indexed, ics uses 1-indexed |
| Timezone issues in .ics | Always specify timezone: `America/New_York` |
| Public route caching forever | Set `revalidate: 300` (5 min) |

---

## Testing Checklist

**Date Verification**:
- [ ] `format(new Date('2026-01-05'), 'EEEE, MMMM d, yyyy')` → "Monday, January 5, 2026"
- [ ] Feb 29, 2026 rejected (not leap year)
- [ ] Feb 29, 2028 accepted (leap year)

**Email**:
- [ ] Renders in Gmail, Outlook, Apple Mail
- [ ] .ics attachment opens in calendar apps
- [ ] All dates have correct day names
- [ ] Links work

**Public Calendar**:
- [ ] `/calendar/john-doe` accessible without login
- [ ] Shows blocked/available dates correctly
- [ ] Updates within 5 minutes

---

## File Structure

```
app/
├── calendar/[slug]/page.tsx     # Public calendar view
├── api/
│   ├── availability/[slug]/route.ts  # Public availability API
│   └── email/send-availability/route.ts  # Email sender
├── dashboard/page.tsx           # Private editor
emails/
└── templates/AvailabilityEmail.tsx  # Email template
lib/
├── slugify.ts                   # URL slug generator
├── date-verification.ts         # Date validation
└── ics.ts                       # Calendar file generator
```

---

## Timeline

| Phase | Duration | Tasks |
|-------|----------|-------|
| Public Sharing | 1.5h | Routes, slugs, public view, caching |
| Email System | 0.5h | Template, verification, .ics, API |
| **Total** | **2h** | **Adds to 11h base = 13h total** |

---

**See**: `PUBLIC-SHARING-EMAIL-GUIDE.md` for complete implementation details.
