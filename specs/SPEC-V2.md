# Calendar Availability System - Specification v2.0

**Version**: 2.0.0 (Public Sharing + Email Generation)
**Previous**: 1.0.0 (Private calendar only)
**Updated**: 2025-12-16
**Timeline**: 13-15 hours to MVP (was 11h)

---

## Changes from v1.0

### New Requirements

**PUBLIC.1**: Public calendar view for students/clients to see availability
**PUBLIC.2**: Shareable URLs (e.g., `/calendar/john-instructor`)
**EMAIL.1**: Generate professional email responses with available dates
**EMAIL.2**: Date verification ensuring day-of-week accuracy (critical for 2026+)
**EMAIL.3**: Calendar file attachment (.ics) for email recipients

### Architecture Impact

- **Dual-mode system**: Private (instructor) + Public (students)
- **Authentication**: Required for private mode, none for public
- **Email service**: Template generation + date validation layer
- **Additional timeline**: +2-4 hours for public sharing and email features

---

## Executive Summary

Instructor calendar availability system with **dual-mode access**:

1. **Private Mode** (Instructor):
   - Block/unblock dates (full day, AM, PM)
   - Google Calendar sync via MCP
   - Drag selection, keyboard navigation
   - State persistence

2. **Public Mode** (Students/Clients):
   - **Read-only calendar view** at shareable URL
   - See available/blocked dates (no edit permissions)
   - No login required
   - Responsive design for mobile viewing

3. **Email Generation**:
   - **Professional email templates** with available dates
   - **Date verification** (e.g., "Monday, Jan 5, 2026" validated as actual Monday)
   - **Calendar attachment** (.ics file) for recipient's calendar app
   - Copy-paste ready or integration with email service

---

## Problem Statement

### Original Pain Points (v1.0)
1. Fragmented scheduling across platforms
2. Manual email coordination
3. Visual complexity
4. Integration gaps

### New Pain Points (v2.0)
5. **Students can't see instructor availability** without back-and-forth emails
6. **Email responses with wrong dates** (e.g., "Monday, Jan 5" when Jan 5 is actually Tuesday)
7. **No calendar file attachment** forcing manual entry into student calendars
8. **No public-facing interface** requiring instructor to screenshot/send images

---

## User Personas

### Primary: Instructor (Private Mode)
- **Goal**: Manage availability, block dates, sync with Google Calendar
- **Access**: Full edit permissions at `/calendar` or `/dashboard`
- **Features**: All v1.0 features + shareable URL management

### Secondary: Students/Clients (Public Mode)
- **Goal**: View instructor availability, find open dates
- **Access**: Read-only at `/calendar/[instructor-slug]`
- **Features**: View calendar, see blocked/available dates, no editing

### Tertiary: Email Recipients
- **Goal**: Receive professional email with accurate available dates
- **Access**: Email with calendar attachment
- **Features**: Date-verified list, .ics attachment, professional formatting

---

## Feature Requirements

### Week 1 MVP (v2.0) - 13-15 hours

#### Private Mode Features (P0) - 9 hours
*(Same as v1.0 - see original SPEC.md)*

1. Calendar View
2. Google Calendar Sync (MCP)
3. Full Day Blocking
4. Half Day Blocking (AM/PM)
5. Visual Drag Selection
6. State Persistence (localStorage)

#### Public Mode Features (P0) - 2-3 hours

**PUBLIC.1: Shareable URL Generation**
- Instructor creates unique slug (e.g., `john-instructor`)
- URL: `yoursite.com/calendar/john-instructor`
- Copy-to-clipboard button in private dashboard
- QR code generation for easy mobile sharing

**PUBLIC.2: Read-Only Calendar View**
- Same visual design as private mode
- No click handlers, no editing
- Available/Blocked states visible
- "Book a session" CTA button (optional, links to email/contact)
- Responsive mobile design

**PUBLIC.3: Access Control**
- Public routes: `/calendar/[slug]` - no auth required
- Private routes: `/dashboard` - auth required (Phase 2)
- Separate components: `PublicCalendar` vs `PrivateCalendar`

#### Email Generation Features (P0) - 2 hours

**EMAIL.1: Email Template Generation**
- Professional HTML email template
- Instructor name, contact info
- List of available dates (next 30 days or custom range)
- Branded footer with calendar link

**EMAIL.2: Date Verification**
```typescript
// Example requirement
Input:  "Monday, January 5, 2026"
Verify: January 5, 2026 IS a Monday ✓
Output: Include in email

Input:  "Monday, January 6, 2026"
Verify: January 6, 2026 is Tuesday ✗
Output: Correct to "Tuesday, January 6, 2026"
```

**EMAIL.3: Calendar Attachment (.ics)**
- Generate .ics file with available dates
- Recipient can import to Google Calendar, Apple Calendar, Outlook
- Each available date as separate event
- "Tentative" status (not confirmed booking)

**EMAIL.4: Email Output Formats**
- **Copy-paste**: Plain text + HTML for manual sending
- **Download**: .eml file for email client
- **API ready**: JSON format for email service integration (SendGrid, etc.)

---

## User Stories (Updated)

### Story 1: Instructor Shares Calendar (New)
**As an** instructor
**I want to** generate a shareable link to my availability calendar
**So that** students can see my available dates without asking

**Acceptance Criteria**:
- Instructor creates slug in settings (e.g., "dr-smith")
- System generates URL: `yoursite.com/calendar/dr-smith`
- Copy button copies URL to clipboard
- URL accessible without login
- Calendar shows current availability (syncs with instructor's blocks)

### Story 2: Student Views Availability (New)
**As a** student
**I want to** view my instructor's calendar at a public URL
**So that** I can see available dates and plan accordingly

**Acceptance Criteria**:
- Navigate to `/calendar/dr-smith`
- See month calendar with available/blocked dates
- Available dates: green or white
- Blocked dates: red
- No editing permissions (read-only)
- Mobile-responsive for phone viewing

### Story 3: Instructor Generates Email Response (New)
**As an** instructor
**I want to** generate a professional email with my available dates
**So that** I can respond to booking requests quickly

**Acceptance Criteria**:
- Click "Generate Email" button in dashboard
- Select date range (e.g., next 30 days)
- Email includes:
  - Greeting with instructor name
  - List of available dates (verified day-of-week)
  - Calendar link to public view
  - .ics attachment
- Copy HTML or plain text to clipboard
- Option to download .eml file

### Story 4: Date Verification Prevents Errors (New)
**As an** instructor
**I want** the system to verify day-of-week matches calendar date
**So that** I don't send emails with incorrect dates

**Acceptance Criteria**:
- System validates: "Monday, Jan 5, 2026" is actually Monday
- If mismatch detected, auto-corrects or warns
- Handles leap years correctly
- Works for dates in 2026, 2027, 2028+
- Example:
  ```
  Input:  Next available Monday: January 5, 2026
  Verify: January 5, 2026 = Monday ✓
  Output: "Monday, January 5, 2026" (correct)

  Input:  Next available Monday: January 6, 2026
  Verify: January 6, 2026 = Tuesday ✗
  Correct: Find next Monday = January 12, 2026
  Output: "Monday, January 12, 2026" (corrected)
  ```

### Story 5: Email Recipient Adds to Calendar (New)
**As an** email recipient (student)
**I want to** receive a calendar attachment with available dates
**So that** I can import them to my calendar app

**Acceptance Criteria**:
- Email includes .ics attachment
- Opening .ics file shows list of available dates
- Each date is "Tentative" status
- Imports to Google Calendar, Apple Calendar, Outlook
- No conflicts with existing events

---

## Technical Architecture (Updated)

### Route Structure

```
app/
├── (private)/              # Protected routes
│   ├── dashboard/
│   │   └── page.tsx       # Instructor dashboard with edit controls
│   ├── settings/
│   │   └── page.tsx       # Slug management, public URL settings
│   └── layout.tsx         # Auth wrapper (future)
│
├── calendar/
│   └── [slug]/
│       └── page.tsx       # PUBLIC: Read-only calendar view
│
├── api/
│   ├── calendar/
│   │   └── route.ts       # MCP bridge (protected)
│   ├── public/
│   │   └── [slug]/
│   │       └── route.ts   # Public availability data (read-only)
│   └── email/
│       ├── generate/
│       │   └── route.ts   # Generate email template
│       └── verify-dates/
│           └── route.ts   # Date verification endpoint
│
└── page.tsx               # Landing page or redirect to dashboard
```

### Component Architecture

```typescript
// Private Mode Components (Instructor)
<PrivateCalendar>
  <CalendarToolbar onGenerate Email />
  <CalendarGrid editable={true} />
  <DayCell onClick={toggleBlock} onContextMenu={halfDayMenu} />
</PrivateCalendar>

// Public Mode Components (Students)
<PublicCalendar slug="john-instructor">
  <CalendarHeader instructorName="John Instructor" />
  <CalendarGrid editable={false} />
  <DayCell isReadOnly />
  <BookingCTA href={`mailto:${instructorEmail}`} />
</PublicCalendar>

// Email Generation Components
<EmailTemplate>
  <EmailHeader instructorName />
  <AvailableDatesList dates={verifiedDates} />
  <CalendarLink publicUrl />
  <ICSAttachment />
</EmailTemplate>
```

### Data Flow (Dual Mode)

**Private Mode**:
```
Instructor → Dashboard → AvailabilityContext → localStorage
                                              → Database (future)
                                              → Public API cache
```

**Public Mode**:
```
Student → /calendar/[slug] → Public API → Cached availability
                                        → Read-only CalendarGrid
```

**Email Generation**:
```
Instructor → "Generate Email" → Date verification → Email template
                                                   → .ics generator
                                                   → Copy/download
```

### New Data Models

```typescript
// Instructor Profile (for public sharing)
interface InstructorProfile {
  id: string;
  slug: string;              // URL-safe: "john-instructor"
  displayName: string;        // "Dr. John Smith"
  email: string;
  publicUrl: string;          // Auto-generated
  isPublic: boolean;          // Enable/disable public calendar
  theme?: {
    primaryColor: string;
    logo?: string;
  };
}

// Email Template Data
interface EmailTemplateData {
  instructorName: string;
  availableDates: VerifiedDate[];
  dateRange: { start: Date; end: Date };
  calendarLink: string;
  customMessage?: string;
}

// Date Verification
interface VerifiedDate {
  date: Date;
  dayOfWeek: string;         // "Monday"
  formatted: string;          // "Monday, January 5, 2026"
  isVerified: boolean;        // True if day matches date
  correctedFrom?: string;     // If auto-corrected
}

// ICS Event
interface ICSEvent {
  summary: string;            // "Available - Dr. Smith"
  start: Date;
  end: Date;
  status: 'TENTATIVE';
  description: string;
}
```

---

## Week 1 MVP Features (v2.0)

### Must Have (P0) - 13-15 hours

**Private Mode** (9h - from v1.0):
- ✓ Calendar View
- ✓ Google Calendar Sync
- ✓ Full Day Blocking
- ✓ Half Day Blocking
- ✓ Drag Selection
- ✓ Persistence

**Public Mode** (2-3h - NEW):
- ✓ Shareable URL generation
- ✓ Read-only calendar view
- ✓ Mobile-responsive design
- ✓ Public/private route separation

**Email Generation** (2h - NEW):
- ✓ Email template with available dates
- ✓ Date verification (day-of-week)
- ✓ .ics file generation
- ✓ Copy-paste HTML/plain text

### Should Have (P1) - Week 2

**Public Mode**:
- Custom branding (logo, colors)
- QR code for mobile sharing
- "Book Now" button integration
- Embed widget for instructor website

**Email**:
- SendGrid/Mailgun API integration
- Email scheduling
- Template customization
- Multiple date range presets

### Nice to Have (P2) - Future

**Public Mode**:
- Analytics (view counts, popular times)
- Multiple timezone display
- Language localization
- Dark mode

**Email**:
- AI-generated custom messages
- Follow-up email sequences
- Booking confirmation emails
- Reminder emails

---

## Explicitly Out of Scope (v2.0)

### Week 1 MVP
- ❌ Authentication system (use simple password/PIN for now)
- ❌ Payment processing
- ❌ Actual booking system (email generation only, no auto-booking)
- ❌ Multi-instructor support
- ❌ Database (localStorage + file export for public data)
- ❌ Real-time sync between instructor edits and public view (manual refresh)
- ❌ Email sending (generation only, manual send or copy-paste)
- ❌ Recurring availability patterns
- ❌ Video conferencing integration

### Future Versions
- Database persistence (PostgreSQL)
- Authentication (NextAuth.js)
- Booking system with confirmations
- Payment integration (Stripe)
- Email automation (SendGrid)
- Real-time updates (WebSockets)
- Multi-user/multi-instructor

---

## Success Criteria (v2.0)

### Development Metrics
- **Time to MVP**: ≤ 15 hours (13h target)
- **Bundle Size**: < 200 KB gzipped (including email templates)
- **Initial Load**: < 2 seconds on 4G

### Feature Metrics
- **Public calendar accessible**: No login required
- **Shareable URL generated**: < 5 seconds
- **Email generation**: < 2 seconds for 30-day range
- **Date verification**: 100% accuracy for 2026-2030

### User Experience
- **User actions to share calendar**: ≤ 2 clicks
- **User actions to generate email**: ≤ 3 clicks
- **Email copy-paste**: Single click
- **Mobile responsive**: Works on 375px width
- **Accessibility**: WCAG AA compliant (public view)

### Quality Gates
- ✓ Day-of-week verification never produces errors
- ✓ Public calendar shows current instructor availability
- ✓ .ics files import successfully to Google/Apple/Outlook
- ✓ Email templates render correctly in major email clients

---

## Edge Cases (New)

### Public Calendar
- **Deleted instructor**: 404 page with helpful message
- **Inactive public calendar**: Show "Calendar unavailable" message
- **Stale data**: Add "Last updated" timestamp
- **Mobile viewport**: Calendar grid responsive down to 375px

### Email Generation
- **No available dates**: Show "No availability in selected range" message
- **Far future dates**: Support dates through 2030+
- **Leap year**: February 29 handled correctly
- **Timezone**: Display in instructor's timezone, note in email

### Date Verification
- **Ambiguous dates**: "Jan 5" → Assume current/next year
- **Invalid dates**: "February 30" → Validation error
- **Timezone edge cases**: Date changes across timezones
- **Daylight saving**: Handle time changes correctly

---

## Risk Analysis (Updated)

### New Risks (v2.0)

**R009: Public URL Conflicts** (Score 4: Medium × Medium)
- **Risk**: Two instructors choose same slug
- **Mitigation**: Unique constraint, suggest alternatives
- **Fallback**: Add numeric suffix (e.g., "john-instructor-2")

**R010: Date Verification Complexity** (Score 6: Medium × High)
- **Risk**: Incorrect day-of-week calculations for future years
- **Mitigation**: Use date-fns `getDay()`, extensive testing
- **Validation**: Test all 2026 dates, leap year 2028

**R011: Email Rendering Issues** (Score 3: Low × Medium)
- **Risk**: Email templates break in some email clients
- **Mitigation**: Use react-email (tested across clients)
- **Fallback**: Plain text version always included

**R012: Public Calendar Performance** (Score 4: Medium × Medium)
- **Risk**: Public view slow with many visitors
- **Mitigation**: Static generation (Next.js ISR), CDN caching
- **Target**: < 1s load time for public view

---

## Timeline Impact (v2.0)

### Original Timeline (v1.0): 11 hours
- Phase 1: Setup (1h)
- Phase 2: Calendar (3h)
- Phase 3: State (2h)
- Phase 4: Interactions (2.5h)
- Phase 5: MCP (1.5h)
- Phase 6: Polish (1h)

### Updated Timeline (v2.0): 13-15 hours

**Phase 7: Public Sharing (2-3h) - NEW**
- Task 7.1: Instructor profile with slug (30 min)
- Task 7.2: Public route `/calendar/[slug]` (45 min)
- Task 7.3: Read-only calendar component (30 min)
- Task 7.4: Copy-to-clipboard URL (15 min)
- Task 7.5: Mobile responsive styling (30 min)

**Phase 8: Email Generation (2h) - NEW**
- Task 8.1: Date verification function (30 min)
- Task 8.2: Email template component (45 min)
- Task 8.3: .ics file generator (30 min)
- Task 8.4: Copy-paste + download UI (15 min)

**Total**: 13-15 hours to full MVP with public sharing + email

---

## Comparison: v1.0 vs v2.0

| Feature | v1.0 | v2.0 |
|---------|------|------|
| **Private calendar** | ✓ | ✓ |
| **Google Calendar sync** | ✓ | ✓ |
| **Block dates** | ✓ | ✓ |
| **Half-day blocking** | ✓ | ✓ |
| **Persistence** | localStorage | localStorage + Public export |
| **Public sharing** | ❌ | ✓ Shareable URL |
| **Email generation** | ❌ | ✓ With date verification |
| **Calendar attachment** | ❌ | ✓ .ics file |
| **Read-only view** | ❌ | ✓ Public route |
| **Timeline** | 11h | 13-15h |
| **Bundle size** | 151 KB | ~180 KB (est.) |

---

## Next Steps (Updated)

1. **Review v2.0 specifications** (this document)
2. **Read updated implementation plan** (IMPLEMENTATION-PLAN-V2.md - to be created)
3. **Review new research**: Public sharing + Email guide
4. **Start Phase 1** (unchanged from v1.0)
5. **Implement Phases 7-8** (new public + email features)
6. **Test complete workflow**:
   - Instructor blocks dates
   - Generates shareable URL
   - Student views public calendar
   - Instructor generates email with verified dates
   - Email includes .ics attachment

---

**Version History**:
- v1.0.0 (2025-12-16): Initial specification (private calendar only)
- v2.0.0 (2025-12-16): Added public sharing + email generation

**Status**: Ready for implementation
**Estimated Completion**: 13-15 hours
**Risk Level**: Medium (new public features + date verification)
