# Task Breakdown

**Version**: 1.0.0
**Total Estimate**: 11 hours (within 9-13 hour target)
**Methodology**: Test-first where critical, speed-first overall

## Phase 1: Project Setup (1 hour)

### Task 1.1: Initialize Next.js Project [30 min]
```bash
npx create-next-app@latest cal --typescript --tailwind --app --no-src-dir
cd cal
```
**Acceptance**:
- Project runs with `npm run dev`
- TypeScript configured
- Tailwind CSS working
- App router enabled

### Task 1.2: Install Dependencies [15 min]
```bash
npm install date-fns clsx tailwind-merge
npm install @radix-ui/react-context-menu @radix-ui/react-tooltip
npm install lucide-react
npm install -D @types/node
```
**Acceptance**:
- All packages installed
- No version conflicts
- package.json updated

### Task 1.3: Setup shadcn/ui [15 min]
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card tooltip context-menu
```
**Acceptance**:
- Components installed in `components/ui/`
- Tailwind config updated
- CSS variables configured

## Phase 2: Core Calendar Component (3 hours)

### Task 2.1: Create Type Definitions [20 min]
**File**: `types/calendar.ts`
```typescript
export interface BlockedDate {
  date: string; // YYYY-MM-DD
  status: 'full' | 'am' | 'pm';
}

export interface GoogleEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  isAllDay: boolean;
}

export interface CalendarState {
  currentMonth: Date;
  blockedDates: Map<string, BlockedDate>;
  googleEvents: GoogleEvent[];
  isLoading: boolean;
}
```
**Acceptance**:
- Types compile without errors
- Covers all data needs

### Task 2.2: Build CalendarGrid Component [45 min]
**File**: `components/calendar/CalendarGrid.tsx`
- 7x6 grid layout
- Accepts currentMonth prop
- Renders 42 DayCell components
- Handles month boundaries
**Acceptance**:
- Displays correct days for any month
- Previous/next month days grayed out
- Grid responsive on desktop

### Task 2.3: Build DayCell Component [45 min]
**File**: `components/calendar/DayCell.tsx`
- Display date number
- Show blocked status (visual states)
- Click handler
- Hover effects
- Today highlighting
**Acceptance**:
- All visual states working
- Click events fire correctly
- Proper styling applied

### Task 2.4: Build CalendarToolbar Component [30 min]
**File**: `components/calendar/CalendarToolbar.tsx`
- Previous/Next month buttons
- Current month/year display
- Today button
- Refresh button (for Google sync)
**Acceptance**:
- Navigation works
- Month displays correctly
- Buttons have proper styling

### Task 2.5: Create Date Utilities [30 min]
**File**: `lib/utils/dates.ts`
```typescript
import { startOfMonth, endOfMonth, eachDayOfInterval,
         format, isSameDay, isToday } from 'date-fns';

export function getCalendarDays(month: Date): Date[] {
  // Get 42 days for calendar grid
}

export function formatDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function parseTimeRange(am: boolean): { start: number, end: number } {
  return am ? { start: 0, end: 12 } : { start: 12, end: 24 };
}
```
**Acceptance**:
- All date functions tested manually
- Correct date arrays generated
- Edge cases handled

### Task 2.6: Wire Up Basic Calendar Page [20 min]
**File**: `app/page.tsx`
- Import and use CalendarGrid
- Pass static data initially
- Basic layout wrapper
**Acceptance**:
- Calendar displays on homepage
- No console errors
- Responsive layout

## Phase 3: State Management (2 hours)

### Task 3.1: Create Availability Context [45 min]
**File**: `contexts/AvailabilityContext.tsx`
```typescript
export const AvailabilityProvider: React.FC = ({ children }) => {
  const [blockedDates, setBlockedDates] = useState<Map<string, BlockedDate>>();
  const [googleEvents, setGoogleEvents] = useState<GoogleEvent[]>([]);

  // Actions: blockDate, unblockDate, blockDateRange, etc.

  return (
    <AvailabilityContext.Provider value={...}>
      {children}
    </AvailabilityContext.Provider>
  );
};
```
**Acceptance**:
- Context provides all needed state
- Actions update state correctly
- No re-render issues

### Task 3.2: Implement localStorage Integration [30 min]
**File**: `lib/utils/storage.ts`
```typescript
const STORAGE_KEY = 'cal_blocked_dates_v1';

export function saveBlockedDates(dates: BlockedDate[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dates));
}

export function loadBlockedDates(): BlockedDate[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}
```
**Acceptance**:
- Data persists across refreshes
- Handles missing/corrupt data
- Migration path considered

### Task 3.3: Connect Components to State [30 min]
- Update CalendarGrid to use context
- Update DayCell to read/update state
- Add click handlers
**Acceptance**:
- Clicking blocks/unblocks days
- State updates reflected immediately
- Multiple components stay in sync

### Task 3.4: Add useCalendar Hook [15 min]
**File**: `hooks/useCalendar.ts`
```typescript
export function useCalendar() {
  const context = useContext(AvailabilityContext);
  if (!context) throw new Error('...');
  return context;
}
```
**Acceptance**:
- Clean API for components
- Type safety maintained
- Error boundaries work

## Phase 4: Interactions (2.5 hours)

### Task 4.1: Implement Click to Block [30 min]
- Add click handler to DayCell
- Toggle blocked state
- Update context and localStorage
**Acceptance**:
- Single click blocks/unblocks
- Visual feedback immediate
- Persists on refresh

### Task 4.2: Implement Half-Day Blocking [45 min]
- Add context menu to DayCell
- Create AM/PM options
- Update visual states
- Handle state transitions
**Acceptance**:
- Right-click shows menu
- Can block AM or PM separately
- Visual states correct
- Combines to full day when both blocked

### Task 4.3: Implement Drag Selection [45 min]
**File**: `hooks/useDragSelection.ts`
- Track mouse down/up/move
- Calculate selected date range
- Visual feedback during drag
- Apply block on release
**Acceptance**:
- Can drag across multiple days
- Visual feedback during drag
- Blocks all selected days
- Works across week boundaries

### Task 4.4: Add Keyboard Navigation [30 min]
**File**: `hooks/useKeyboardNav.ts`
- Arrow keys move focus
- Space/Enter toggles block
- Escape cancels selection
- Page Up/Down changes month
**Acceptance**:
- Can navigate without mouse
- Focus indicators visible
- All keys work as expected

## Phase 5: Google Calendar Integration (1.5 hours)

### Task 5.1: Setup MCP Connection [30 min]
**File**: `lib/mcp/google-calendar.ts`
```typescript
// MCP client setup
// Connection configuration
// Error handling
```
**Acceptance**:
- Can connect to MCP server
- Handles connection errors
- Types for MCP responses

### Task 5.2: Create Calendar API Route [30 min]
**File**: `app/api/calendar/route.ts`
```typescript
export async function GET(request: Request) {
  // Parse date range from query
  // Call MCP to get events
  // Transform and return
}
```
**Acceptance**:
- Endpoint responds correctly
- Returns Google events
- Handles errors gracefully

### Task 5.3: Integrate with Frontend [30 min]
- Add fetch logic to context
- Display events in DayCell
- Add refresh functionality
- Loading states
**Acceptance**:
- Events display in calendar
- Refresh button works
- Loading indicators show
- Errors handled gracefully

## Phase 6: Polish & Testing (1 hour)

### Task 6.1: Loading States [15 min]
- Add loading skeletons
- Spinner for refresh
- Optimistic updates
**Acceptance**:
- No layout shift during load
- Clear feedback during operations

### Task 6.2: Error Boundaries [15 min]
**File**: `components/ErrorBoundary.tsx`
- Catch React errors
- Fallback UI
- Error reporting
**Acceptance**:
- App doesn't crash on errors
- User sees helpful message
- Can recover from errors

### Task 6.3: Final Styling Pass [20 min]
- Consistent colors
- Proper spacing
- Mobile responsiveness check
- Dark mode consideration
**Acceptance**:
- Looks professional
- Consistent design language
- No obvious visual bugs

### Task 6.4: Manual Testing [10 min]
- Run through test script
- Check all features
- Verify persistence
**Acceptance**:
- All P0 features work
- No console errors
- Performance acceptable

## Parallel Task Opportunities

Tasks that can be done in parallel (different developers or split screen):

**Parallel Group 1** (After Phase 2.1):
- Task 2.2 (CalendarGrid)
- Task 2.3 (DayCell)
- Task 2.4 (CalendarToolbar)

**Parallel Group 2** (After Phase 3.1):
- Task 3.2 (localStorage)
- Task 5.1 (MCP setup)

**Parallel Group 3** (After Phase 4.1):
- Task 4.2 (Half-day)
- Task 4.3 (Drag selection)
- Task 4.4 (Keyboard nav)

## Critical Path

The minimum tasks needed for a working MVP:

1. **Phase 1**: All tasks (1 hour)
2. **Phase 2**: Tasks 2.1, 2.2, 2.3, 2.5 (2 hours 20 min)
3. **Phase 3**: Tasks 3.1, 3.2, 3.3 (1 hour 45 min)
4. **Phase 4**: Task 4.1 only (30 min)
5. **Phase 5**: All tasks (1.5 hours)
6. **Phase 6**: Task 6.4 only (10 min)

**Critical Path Total**: 7 hours 15 minutes

## Time Buffers

Built-in buffers for each phase:
- Phase 1: No buffer needed (straightforward)
- Phase 2: 30 min buffer (component complexity)
- Phase 3: 15 min buffer (state debugging)
- Phase 4: 30 min buffer (interaction complexity)
- Phase 5: 30 min buffer (MCP unknowns)
- Phase 6: 15 min buffer (testing discoveries)

**Total Buffer**: 2 hours

## Risk Mitigation Tasks

If running behind schedule, skip these first:
1. Task 4.4 (Keyboard navigation) - Save 30 min
2. Task 4.3 (Drag selection) - Save 45 min
3. Task 4.2 (Half-day blocking) - Save 45 min
4. Task 6.1, 6.2, 6.3 (Polish) - Save 50 min

**Total Recoverable Time**: 2 hours 50 minutes

## Success Metrics

### MVP Complete When:
- [x] Calendar displays current month
- [x] Can click to block/unblock days
- [x] Blocks persist on refresh
- [x] Google Calendar events display
- [x] Can navigate months
- [x] No critical bugs

### Stretch Goals If Time Permits:
- [ ] Half-day blocking
- [ ] Drag selection
- [ ] Keyboard navigation
- [ ] Loading skeletons
- [ ] Error boundaries
- [ ] Dark mode

## Daily Standup Questions

If working across multiple sessions:

**Start of Session**:
1. Which phase am I starting?
2. Any blockers from last session?
3. What's the goal for this session?

**End of Session**:
1. What did I complete?
2. What's remaining?
3. Any unexpected issues?
4. Notes for next session?

## Implementation Order

### Recommended Sequential Order (11 hours):
1. Phase 1 complete (1 hr) 
2. Phase 2 complete (3 hrs) 
3. Phase 3 complete (2 hrs) 
4. Phase 4.1 only (0.5 hrs) 
5. Phase 5 complete (1.5 hrs) 
6. Phase 4.2, 4.3 (1.5 hrs) 
7. Phase 6 complete (1 hr) 
8. Phase 4.4 if time (0.5 hrs) 

### Speed Run Order (7 hours):
1. Phase 1 complete (1 hr)
2. Phase 2: Tasks 2.1, 2.2, 2.3, 2.5 (2.3 hrs)
3. Phase 3: Tasks 3.1, 3.2, 3.3 (1.75 hrs)
4. Phase 4: Task 4.1 only (0.5 hrs)
5. Phase 5 complete (1.5 hrs)
6. Manual testing (10 min)

## Git Commit Strategy

Commit after each completed task with format:
```
feat(cal): [Phase.Task] Description

Example:
feat(cal): [2.2] Build CalendarGrid component with month display
feat(cal): [3.1] Create AvailabilityContext for state management
fix(cal): [4.1] Fix click handler not updating localStorage
```

This ensures:
- Easy rollback if needed
- Clear progress tracking
- Reviewable chunks
- CI/CD friendly

## Definition of "Done" per Task

A task is complete when:
1. Code written and working
2. No TypeScript errors
3. No console errors
4. Acceptance criteria met
5. Committed to git
6. Manually tested

## Emergency Simplifications

If drastically behind schedule:

### Ultra-Minimal MVP (4 hours):
1. Static calendar grid (no components)
2. Click to toggle red/white backgrounds
3. Save array of blocked dates to localStorage
4. No Google Calendar integration
5. No navigation (current month only)

This ensures something working vs. nothing.