# Calendar Availability System Specification

**Version**: 1.0.0
**Status**: Draft
**Created**: 2025-12-16
**Timeline**: 9-13 hours to MVP

## Executive Summary

A minimal viable calendar availability system for instructors that combines Airbnb's intuitive blocking interface with Calendly's simplicity. The system enables instructors to manage their availability through visual calendar blocking while syncing with Google Calendar via MCP.

## Problem Statement

### Current Pain Points
1. **Fragmented Scheduling**: Instructors manage availability across multiple platforms
2. **Manual Coordination**: Constant back-and-forth emails to find suitable times
3. **Visual Complexity**: Existing tools are feature-heavy and overwhelming
4. **Integration Gaps**: Poor synchronization with existing Google Calendar events

### Target Users
- **Primary**: Individual instructors/tutors managing 5-20 students
- **Secondary**: Small coaching businesses with 1-3 instructors
- **Anti-persona**: Large enterprises needing complex approval workflows

## Scope

### Week 1 MVP (Must Have)
| Feature | Description | Priority |
|---------|-------------|----------|
| **Calendar View** | Display current month with date grid | P0 |
| **Google Calendar Sync** | Read events via MCP integration | P0 |
| **Full Day Blocking** | Click to mark entire days unavailable | P0 |
| **Half Day Blocking** | AM/PM availability toggles | P0 |
| **Visual Selection** | Drag to select multiple days | P0 |
| **State Persistence** | Save blocked dates to localStorage | P0 |

### Week 2 Enhancements (Nice to Have)
| Feature | Description | Priority |
|---------|-------------|----------|
| **Hourly Slots** | Divide days into 1-hour blocks | P1 |
| **Text Parsing** | "Unavailable Dec 20-25" input | P1 |
| **Booking Categories** | Travel/Booked/Tentative states | P2 |
| **Multi-month View** | Navigate future months | P2 |
| **Export Function** | Share availability via link | P3 |

### Explicitly Out of Scope
- Payment processing
- Multi-user/team management
- Automated email notifications
- Video conferencing integration
- Recurring availability patterns
- Time zone conversions (MVP uses local time only)
- Mobile app (responsive web only)

## User Stories

### US1: View Monthly Calendar
**As an** instructor
**I want to** see my current month's calendar
**So that** I can understand my existing commitments

**Acceptance Criteria**:
- Calendar displays current month on load
- Shows day names and date numbers
- Highlights today's date
- Displays existing Google Calendar events (read-only)

### US2: Block Full Days
**As an** instructor
**I want to** click days to mark them unavailable
**So that** students know when I cannot teach

**Acceptance Criteria**:
- Single click toggles day availability
- Visual indicator shows blocked days (red background)
- State persists on page refresh
- Can block multiple days via drag selection

### US3: Block Half Days
**As an** instructor
**I want to** mark mornings or afternoons as unavailable
**So that** I can have granular control over my schedule

**Acceptance Criteria**:
- Right-click shows AM/PM options
- Half-day blocks show distinct visual treatment
- Can combine with full-day blocks on other days
- Clear visual distinction between AM and PM blocks

### US4: Sync with Google Calendar
**As an** instructor
**I want to** see my existing Google Calendar events
**So that** I don't double-book myself

**Acceptance Criteria**:
- Connects via MCP Google Calendar integration
- Shows event titles and times
- Updates when calendar changes
- Read-only display (no event creation in MVP)

### US5: Visual Drag Selection
**As an** instructor
**I want to** drag across multiple days to block them
**So that** I can quickly mark vacation periods

**Acceptance Criteria**:
- Click and drag selects date range
- Visual feedback during selection
- Release applies block to all selected days
- Shift+click for range selection alternative

## Success Criteria

### Quantitative Metrics
- **Development Time**: Complete MVP in d 13 hours
- **Performance**: Initial load < 1 second
- **User Actions**: Block a day in d 2 clicks
- **Code Size**: Bundle < 200KB gzipped
- **Test Coverage**: 80% for critical paths

### Qualitative Metrics
- **Intuitive**: New user can block dates without instructions
- **Visual Clarity**: Availability status obvious at a glance
- **Responsive**: Works on desktop and tablet (mobile nice-to-have)
- **Accessible**: Keyboard navigable, screen reader compatible

## Technical Constraints

### Must Use
- Next.js 14 with App Router
- React 18+ with TypeScript
- Tailwind CSS for styling
- shadcn/ui component library
- Google Calendar MCP for integration
- date-fns for date manipulation

### Must Avoid
- Custom authentication systems (use NextAuth if needed)
- Direct Google API calls (use MCP exclusively)
- Complex state management (no Redux/MobX for MVP)
- Server-side database (localStorage only for MVP)
- Custom date picker components (use shadcn/ui)

## Edge Cases

### Data Conflicts
- Google Calendar event overlaps with manual block
- localStorage corrupted or cleared
- MCP connection fails

### User Interactions
- Blocking dates in the past
- Selecting across month boundaries
- Rapid clicking/selection
- Browser back/forward navigation

### Display Issues
- Month with 6 weeks vs 5 weeks
- Events spanning multiple days
- All-day events vs timed events
- Different screen sizes/resolutions

## Dependencies

### External Services
- Google Calendar API (via MCP)
- Vercel hosting (optional for deployment)

### Third-party Libraries
- Next.js 14.x
- React 18.x
- TypeScript 5.x
- Tailwind CSS 3.x
- shadcn/ui components
- date-fns 3.x
- @radix-ui/primitives

### Development Tools
- Node.js 20+
- pnpm (preferred) or npm
- VS Code with ESLint/Prettier

## Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| MCP integration complexity | Medium | High | Prototype early, have fallback mock data |
| 13-hour timeline exceeded | Medium | Medium | Ruthlessly cut P1/P2 features |
| State sync issues | Low | High | Implement optimistic UI updates |
| Browser compatibility | Low | Medium | Target modern browsers only |

## Glossary

- **MCP**: Model Context Protocol - Anthropic's integration framework
- **Blocking**: Marking time as unavailable
- **Half-day**: AM (midnight-noon) or PM (noon-midnight)
- **Availability**: Time slots open for booking
- **Sync**: One-way read from Google Calendar

## Document Control

- **Author**: System Architect
- **Reviewers**: Pending
- **Approval**: Pending
- **Next Review**: After MVP completion