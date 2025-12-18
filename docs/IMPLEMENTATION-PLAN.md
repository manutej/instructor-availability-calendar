# Calendar Availability System - Complete Implementation Plan

**Version**: 1.0.0
**Generated**: 2025-12-16
**Timeline**: 11 hours to MVP
**Status**: Ready for Implementation

---

## Executive Summary

This document synthesizes **2,026 lines of specifications** and **218 KB of research documentation** into an actionable implementation plan for building a calendar availability system in 11 hours.

### What We're Building

**Product**: Instructor calendar availability system with Google Calendar sync
**Stack**: Next.js 14, React 18, TypeScript, Tailwind CSS, shadcn/ui, date-fns
**Integration**: MCP (Model Context Protocol) for Google Calendar
**Timeline**: 11 hours (with 7.25h critical path, 4h emergency fallback)

---

## 📋 Pre-Implementation Checklist

### Documentation Review (30 min)
- [ ] Read `specs/constitution.md` - 9 foundational principles
- [ ] Review `specs/SPEC.md` - Complete feature requirements
- [ ] Scan `specs/TASK-BREAKDOWN.md` - 11-hour timeline
- [ ] Note `specs/RISKS.md` - Mitigation strategies

### Environment Setup (15 min)
- [ ] Node.js 20+ installed: `node -v`
- [ ] npm 10+ installed: `npm -v`
- [ ] Git initialized in `/Users/manu/Documents/LUXOR/cal/`
- [ ] Code editor ready (VS Code recommended)

### Research Documentation Available
- [x] Next.js patterns: `docs/NEXTJS-IMPLEMENTATION-GUIDE.md` (32 KB)
- [x] React patterns: `docs/REACT-PATTERNS-GUIDE.md` (43 KB)
- [x] Date utilities: `docs/DATE-UTILITIES-GUIDE.md` (24 KB)
- [x] Components: `docs/component-library-guide.md` (39 KB)
- [x] Styling: `docs/STYLING-PATTERNS-GUIDE.md` (31 KB)
- [x] Dependencies: `docs/DEPENDENCY-ANALYSIS.md` (26 KB)

---

## 🎯 Implementation Roadmap

### Phase 1: Project Setup (1 hour)

**Goal**: Functional Next.js 14 project with all dependencies installed

**Reference**:
- `docs/NEXTJS-IMPLEMENTATION-GUIDE.md` - Lines 1-150
- `docs/DEPENDENCY-ANALYSIS.md` - Lines 400-450 (package.json)

**Tasks**:

#### Task 1.1: Initialize Next.js (30 min)
```bash
cd /Users/manu/Documents/LUXOR/cal
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"
```

**Expected Output**: Next.js project structure created

#### Task 1.2: Install Dependencies (15 min)
```bash
# Core dependencies
npm install date-fns clsx tailwind-merge lucide-react

# MCP integration
npm install @modelcontextprotocol/sdk zod

# shadcn/ui setup
npx shadcn-ui@latest init
# Choose: TypeScript, slate theme, CSS variables

# Install components
npx shadcn-ui@latest add button card tooltip context-menu
```

**Expected Output**: All dependencies in `package.json`, shadcn/ui configured

#### Task 1.3: Create File Structure (15 min)
```bash
mkdir -p {components/calendar,lib/{mcp,utils},hooks,contexts,types}
touch lib/utils/dates.ts
touch lib/utils/storage.ts
touch types/calendar.ts
touch contexts/AvailabilityContext.tsx
```

**Expected Output**: Directory structure matching `docs/NEXTJS-IMPLEMENTATION-GUIDE.md:75-95`

**Checkpoint 1.0** (1 hour elapsed):
- [ ] `npm run dev` works
- [ ] http://localhost:3000 shows Next.js default page
- [ ] No console errors

**Documentation**: `docs/NEXTJS-IMPLEMENTATION-GUIDE.md` (Section 1-2)

---

### Phase 2: Core Calendar Component (3 hours)

**Goal**: Visual calendar grid displaying current month with 42 cells

**Reference**:
- `docs/REACT-PATTERNS-GUIDE.md` - Custom hooks section
- `docs/DATE-UTILITIES-GUIDE.md` - Calendar grid generation
- `docs/STYLING-PATTERNS-GUIDE.md` - Grid layout and cell styling

#### Task 2.1: Create Type Definitions (20 min)

**File**: `types/calendar.ts`

**Source**: Copy from `docs/NEXTJS-IMPLEMENTATION-GUIDE.md:160-195`

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

export interface CalendarDay {
  date: Date;
  isToday: boolean;
  isCurrentMonth: boolean;
  dayOfMonth: number;
  blockStatus: 'available' | 'blocked' | 'am-blocked' | 'pm-blocked';
  googleEvents: GoogleEvent[];
}
```

#### Task 2.2: Build Date Utilities (30 min)

**File**: `lib/utils/dates.ts`

**Source**: Copy complete implementation from `docs/DATE-UTILITIES-GUIDE.md:100-350`

**Key Functions**:
- `generateCalendarGrid(date: Date): CalendarDay[][]` - 7×6 grid
- `isDateToday(date: Date): boolean`
- `toISODateString(date: Date): string`
- `toDisplayString(date: Date): string`
- `getPreviousMonth(date: Date): Date`
- `getNextMonth(date: Date): Date`

**Test**: Add console.log in component to verify grid generation

#### Task 2.3: Build CalendarGrid Component (45 min)

**File**: `components/calendar/CalendarGrid.tsx`

**Source**: Combine patterns from:
- `docs/REACT-PATTERNS-GUIDE.md:600-720` (useCalendar hook)
- `docs/STYLING-PATTERNS-GUIDE.md:200-280` (grid layout)

**Key Features**:
```tsx
'use client';

import { useCalendar } from '@/hooks/useCalendar';
import DayCell from './DayCell';

export default function CalendarGrid() {
  const { calendarWeeks, currentMonth } = useCalendar();

  return (
    <div className="grid grid-cols-7 gap-1 lg:gap-2">
      {/* Day headers: Sun, Mon, Tue... */}
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
        <div key={day} className="text-center font-semibold">
          {day}
        </div>
      ))}

      {/* Calendar cells */}
      {calendarWeeks.flat().map((day, idx) => (
        <DayCell key={idx} day={day} />
      ))}
    </div>
  );
}
```

**Documentation**: `docs/NEXTJS-IMPLEMENTATION-GUIDE.md:250-320`

#### Task 2.4: Build DayCell Component (45 min)

**File**: `components/calendar/DayCell.tsx`

**Source**: Complete implementation from `docs/component-library-guide.md:250-350`

**Visual States** (from `docs/STYLING-PATTERNS-GUIDE.md:100-200`):
```tsx
const bgClass = {
  'available': 'bg-white hover:bg-slate-50',
  'blocked': 'bg-red-500 text-white hover:bg-red-600',
  'am-blocked': 'bg-gradient-to-b from-red-500 from-50% to-white to-50%',
  'pm-blocked': 'bg-gradient-to-t from-red-500 from-50% to-white to-50%'
}[day.blockStatus];
```

**Key Features**:
- Click to toggle blocked state
- Visual feedback on hover
- Today's date highlighting
- Event indicators (small dots)

#### Task 2.5: Build CalendarToolbar Component (30 min)

**File**: `components/calendar/CalendarToolbar.tsx`

**Source**: `docs/component-library-guide.md:400-470`

**Features**:
- Previous/Next month buttons
- "Today" button
- Refresh button (for Google Calendar sync)
- Month/Year display

```tsx
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar, RefreshCw } from 'lucide-react';

export default function CalendarToolbar({
  currentMonth,
  onPrevMonth,
  onNextMonth,
  onToday,
  onRefresh,
  isLoading
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex gap-2">
        <Button variant="outline" onClick={onPrevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" onClick={onNextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="outline" onClick={onToday}>
          <Calendar className="h-4 w-4 mr-2" />
          Today
        </Button>
      </div>

      <h2 className="text-xl font-semibold">
        {toMonthYearString(currentMonth)}
      </h2>

      <Button variant="outline" onClick={onRefresh} disabled={isLoading}>
        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  );
}
```

#### Task 2.6: Wire Up Calendar Page (20 min)

**File**: `app/page.tsx`

```tsx
import CalendarToolbar from '@/components/calendar/CalendarToolbar';
import CalendarGrid from '@/components/calendar/CalendarGrid';
import { Card } from '@/components/ui/card';

export default function Home() {
  return (
    <main className="container mx-auto py-8">
      <Card className="p-6">
        <CalendarToolbar />
        <CalendarGrid />
      </Card>
    </main>
  );
}
```

**Checkpoint 2.0** (4 hours elapsed):
- [ ] Calendar displays current month
- [ ] 42 cells in 7×6 grid
- [ ] Day names visible
- [ ] Today's date highlighted
- [ ] Navigation buttons present

**Documentation**:
- `docs/NEXTJS-IMPLEMENTATION-GUIDE.md` (Sections 3-4)
- `docs/REACT-PATTERNS-GUIDE.md` (Sections 1-2)
- `docs/STYLING-PATTERNS-GUIDE.md` (Sections 1-3)

---

### Phase 3: State Management (2 hours)

**Goal**: Click to block/unblock dates with persistence

**Reference**:
- `docs/REACT-PATTERNS-GUIDE.md` - AvailabilityContext implementation
- `docs/NEXTJS-IMPLEMENTATION-GUIDE.md` - Context provider setup

#### Task 3.1: Create AvailabilityContext (45 min)

**File**: `contexts/AvailabilityContext.tsx`

**Source**: Complete copy-paste from `docs/REACT-PATTERNS-GUIDE.md:20-174`

**Key Features**:
```typescript
interface AvailabilityContextValue {
  blockedDates: Map<string, BlockedDate>;
  googleEvents: GoogleEvent[];
  isLoading: boolean;
  error: Error | null;

  // Actions
  blockDate: (date: Date) => void;
  unblockDate: (date: Date) => void;
  blockDateRange: (start: Date, end: Date) => void;
  setHalfDayBlock: (date: Date, period: 'AM' | 'PM', blocked: boolean) => void;
  refreshGoogleCalendar: () => Promise<void>;
  clearAll: () => void;
}
```

**Implementation**:
- React Context with useState
- localStorage sync (auto-save on every change)
- Optimistic updates (UI updates immediately)
- Memoized context value

#### Task 3.2: Implement localStorage Integration (30 min)

**File**: `lib/utils/storage.ts`

**Source**: `docs/REACT-PATTERNS-GUIDE.md:412-500`

```typescript
const STORAGE_KEY = 'cal_availability_v1';

export function loadBlockedDates(): Map<string, BlockedDate> {
  if (typeof window === 'undefined') return new Map();

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return new Map();

    const parsed = JSON.parse(stored);
    return new Map(Object.entries(parsed));
  } catch (error) {
    console.error('Failed to load blocked dates:', error);
    return new Map();
  }
}

export function saveBlockedDates(dates: Map<string, BlockedDate>): void {
  if (typeof window === 'undefined') return;

  try {
    const obj = Object.fromEntries(dates);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  } catch (error) {
    console.error('Failed to save blocked dates:', error);
  }
}
```

#### Task 3.3: Connect Components to State (30 min)

**Updates**:

1. **app/layout.tsx**: Wrap with AvailabilityProvider
```tsx
import { AvailabilityProvider } from '@/contexts/AvailabilityContext';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AvailabilityProvider>
          {children}
        </AvailabilityProvider>
      </body>
    </html>
  );
}
```

2. **components/calendar/DayCell.tsx**: Use context
```tsx
import { useAvailability } from '@/contexts/AvailabilityContext';

export default function DayCell({ day }) {
  const { blockedDates, blockDate, unblockDate } = useAvailability();

  const isBlocked = blockedDates.has(toISODateString(day.date));

  const handleClick = () => {
    if (isBlocked) {
      unblockDate(day.date);
    } else {
      blockDate(day.date);
    }
  };

  return (
    <div onClick={handleClick} className={/* ... */}>
      {day.dayOfMonth}
    </div>
  );
}
```

#### Task 3.4: Add useCalendar Hook (15 min)

**File**: `hooks/useCalendar.ts`

**Source**: `docs/REACT-PATTERNS-GUIDE.md:176-260`

```typescript
export function useCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const calendarDays = useMemo(
    () => generateCalendarGrid(currentMonth),
    [currentMonth]
  );

  const calendarWeeks = useMemo(
    () => groupIntoWeeks(calendarDays),
    [calendarDays]
  );

  const goToNextMonth = useCallback(() => {
    setCurrentMonth(prev => getNextMonth(prev));
  }, []);

  const goToPrevMonth = useCallback(() => {
    setCurrentMonth(prev => getPreviousMonth(prev));
  }, []);

  const goToToday = useCallback(() => {
    setCurrentMonth(new Date());
  }, []);

  return {
    currentMonth,
    calendarDays,
    calendarWeeks,
    goToNextMonth,
    goToPrevMonth,
    goToToday
  };
}
```

**Checkpoint 3.0** (6 hours elapsed):
- [ ] Click a day → turns red (blocked)
- [ ] Click again → turns white (available)
- [ ] Refresh page → blocks persist
- [ ] No console errors
- [ ] Month navigation works

**Documentation**: `docs/REACT-PATTERNS-GUIDE.md` (Sections 1-4)

---

### Phase 4: Interactions (2.5 hours)

**Goal**: Half-day blocking, drag selection, keyboard navigation

**Reference**:
- `docs/REACT-PATTERNS-GUIDE.md` - useDragSelection, useKeyboardNav
- `docs/component-library-guide.md` - Context Menu

#### Task 4.1: Implement Context Menu for Half-Day (45 min)

**Update**: `components/calendar/DayCell.tsx`

**Source**: `docs/component-library-guide.md:200-280`

```tsx
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';

export default function DayCell({ day }) {
  const { setHalfDayBlock } = useAvailability();

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className={/* day cell styling */}>
          {day.dayOfMonth}
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent>
        <ContextMenuItem onClick={() => setHalfDayBlock(day.date, 'AM', true)}>
          Block Morning (AM)
        </ContextMenuItem>
        <ContextMenuItem onClick={() => setHalfDayBlock(day.date, 'PM', true)}>
          Block Afternoon (PM)
        </ContextMenuItem>
        <ContextMenuItem onClick={() => unblockDate(day.date)}>
          Clear Block
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
```

**Update Context**: Add half-day logic to AvailabilityContext
```typescript
setHalfDayBlock: (date, period, blocked) => {
  const key = toISODateString(date);
  const current = blockedDates.get(key);

  if (blocked) {
    // Block specified period
    if (current?.status === (period === 'AM' ? 'pm' : 'am')) {
      // Other half already blocked → full day
      blockedDates.set(key, { date: key, status: 'full' });
    } else {
      blockedDates.set(key, { date: key, status: period.toLowerCase() });
    }
  } else {
    // Unblock specified period
    if (current?.status === 'full') {
      // Keep other half
      blockedDates.set(key, {
        date: key,
        status: period === 'AM' ? 'pm' : 'am'
      });
    } else {
      blockedDates.delete(key);
    }
  }

  saveBlockedDates(blockedDates);
  setBlockedDates(new Map(blockedDates));
}
```

#### Task 4.2: Implement Drag Selection (45 min)

**File**: `hooks/useDragSelection.ts`

**Source**: `docs/REACT-PATTERNS-GUIDE.md:260-350`

```typescript
export function useDragSelection() {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Date | null>(null);
  const [dragEnd, setDragEnd] = useState<Date | null>(null);

  const handleMouseDown = (date: Date) => {
    setIsDragging(true);
    setDragStart(date);
    setDragEnd(date);
  };

  const handleMouseEnter = (date: Date) => {
    if (isDragging) {
      setDragEnd(date);
    }
  };

  const handleMouseUp = () => {
    if (isDragging && dragStart && dragEnd) {
      // Emit range selection event
      const [start, end] = [dragStart, dragEnd].sort((a, b) => a.getTime() - b.getTime());
      onRangeSelect?.(start, end);
    }

    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mouseup', handleMouseUp);
      return () => window.removeEventListener('mouseup', handleMouseUp);
    }
  }, [isDragging]);

  return {
    isDragging,
    dragStart,
    dragEnd,
    handleMouseDown,
    handleMouseEnter
  };
}
```

**Update CalendarGrid**: Integrate drag selection

#### Task 4.3: Implement Keyboard Navigation (30 min)

**File**: `hooks/useKeyboardNav.ts`

**Source**: `docs/REACT-PATTERNS-GUIDE.md:360-410`

```typescript
export function useKeyboardNav(calendarDays: CalendarDay[]) {
  const [focusedIndex, setFocusedIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
          setFocusedIndex(prev => Math.min(prev + 1, calendarDays.length - 1));
          break;
        case 'ArrowLeft':
          setFocusedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'ArrowDown':
          setFocusedIndex(prev => Math.min(prev + 7, calendarDays.length - 1));
          break;
        case 'ArrowUp':
          setFocusedIndex(prev => Math.max(prev - 7, 0));
          break;
        case ' ':
        case 'Enter':
          e.preventDefault();
          // Toggle block on focused cell
          const day = calendarDays[focusedIndex];
          toggleBlock(day.date);
          break;
        case 'Escape':
          // Clear focus
          setFocusedIndex(-1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [calendarDays, focusedIndex]);

  return { focusedIndex };
}
```

**Checkpoint 4.0** (8.5 hours elapsed):
- [ ] Right-click shows AM/PM menu
- [ ] Can block morning or afternoon
- [ ] Drag to select multiple days
- [ ] Arrow keys navigate days
- [ ] Space/Enter toggles block

**Documentation**:
- `docs/REACT-PATTERNS-GUIDE.md` (Sections 3-5)
- `docs/component-library-guide.md` (Context Menu section)

---

### Phase 5: Google Calendar Integration (1.5 hours)

**Goal**: Display Google Calendar events via MCP

**Reference**:
- `docs/NEXTJS-IMPLEMENTATION-GUIDE.md` - API Routes
- `docs/DEPENDENCY-ANALYSIS.md` - MCP SDK integration

#### Task 5.1: Setup MCP Connection (30 min)

**File**: `lib/mcp/google-calendar.ts`

**Source**: `docs/DEPENDENCY-ANALYSIS.md:200-280`

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { z } from 'zod';

const EventSchema = z.object({
  id: z.string(),
  title: z.string(),
  start: z.string(),
  end: z.string(),
  isAllDay: z.boolean()
});

export async function fetchGoogleCalendarEvents(
  startDate: string,
  endDate: string
): Promise<GoogleEvent[]> {
  const transport = new StdioClientTransport({
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-google-calendar']
  });

  const client = new Client({
    name: 'calendar-availability-client',
    version: '1.0.0'
  }, {
    capabilities: {}
  });

  await client.connect(transport);

  try {
    const result = await client.request({
      method: 'tools/call',
      params: {
        name: 'get_events',
        arguments: {
          start_date: startDate,
          end_date: endDate
        }
      }
    });

    const events = z.array(EventSchema).parse(result.content);

    return events.map(e => ({
      id: e.id,
      title: e.title,
      start: new Date(e.start),
      end: new Date(e.end),
      isAllDay: e.isAllDay
    }));
  } finally {
    await client.close();
  }
}
```

#### Task 5.2: Create Calendar API Route (30 min)

**File**: `app/api/calendar/route.ts`

**Source**: `docs/NEXTJS-IMPLEMENTATION-GUIDE.md:200-250`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { fetchGoogleCalendarEvents } from '@/lib/mcp/google-calendar';

export const revalidate = 60; // Cache for 60 seconds

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const start = searchParams.get('start');
  const end = searchParams.get('end');

  if (!start || !end) {
    return NextResponse.json(
      { error: 'Missing start or end date' },
      { status: 400 }
    );
  }

  try {
    const events = await fetchGoogleCalendarEvents(start, end);

    return NextResponse.json({
      events,
      syncedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to fetch Google Calendar events:', error);

    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 }
    );
  }
}
```

#### Task 5.3: Integrate with Frontend (30 min)

**Update**: `contexts/AvailabilityContext.tsx`

Add Google Calendar sync:
```typescript
const refreshGoogleCalendar = useCallback(async () => {
  setIsLoading(true);
  setError(null);

  try {
    const startOfMonth = format(currentMonth, 'yyyy-MM-01');
    const endOfMonth = format(addMonths(currentMonth, 1), 'yyyy-MM-01');

    const response = await fetch(
      `/api/calendar?start=${startOfMonth}&end=${endOfMonth}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch calendar events');
    }

    const data = await response.json();
    setGoogleEvents(data.events);
    setLastSync(new Date());
  } catch (err) {
    setError(err as Error);
  } finally {
    setIsLoading(false);
  }
}, [currentMonth]);

// Auto-refresh on mount and month change
useEffect(() => {
  refreshGoogleCalendar();
}, [currentMonth]);
```

**Fallback**: If MCP fails, use mock data from `docs/DEPENDENCY-ANALYSIS.md:250`

**Checkpoint 5.0** (10 hours elapsed):
- [ ] Google Calendar events display
- [ ] Refresh button syncs events
- [ ] Events show in day cells
- [ ] Loading state during sync
- [ ] Error handling works

**Decision Point**: If MCP not working by 10h mark, use mock data and ship

**Documentation**:
- `docs/NEXTJS-IMPLEMENTATION-GUIDE.md` (Section 4)
- `docs/DEPENDENCY-ANALYSIS.md` (MCP Integration)

---

### Phase 6: Polish & Testing (1 hour)

**Goal**: Loading states, error boundaries, final styling

**Reference**:
- `docs/NEXTJS-IMPLEMENTATION-GUIDE.md` - Error handling
- `docs/component-library-guide.md` - Loading states

#### Task 6.1: Loading States (15 min)

**Update**: Add Spinner component from `docs/component-library-guide.md:500-520`

Use in:
- CalendarToolbar (refresh button)
- CalendarGrid (full calendar loading)
- DayCell (individual cell loading during sync)

#### Task 6.2: Error Boundaries (15 min)

**File**: `app/error.tsx`

**Source**: `docs/NEXTJS-IMPLEMENTATION-GUIDE.md:400-430`

```tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Try again
      </button>
    </div>
  );
}
```

#### Task 6.3: Final Styling Pass (20 min)

**Checklist**:
- [ ] WCAG AA color contrast verified
- [ ] Focus indicators visible
- [ ] Hover states smooth
- [ ] Calendar fits in 1440px viewport
- [ ] Mobile responsive (optional)

**Reference**: `docs/STYLING-PATTERNS-GUIDE.md` - Accessibility checklist

#### Task 6.4: Manual Testing (10 min)

**Smoke Test** (from `specs/ACCEPTANCE-CRITERIA.md:335-342`):
1. Load calendar → shows current month ✓
2. Click a day → becomes blocked (red) ✓
3. Click again → becomes available (white) ✓
4. Refresh page → blocks persist ✓
5. Navigate to next month → works ✓
6. Navigate back → blocks still there ✓

**Checkpoint 6.0** (11 hours elapsed):
- [ ] All P0 features working
- [ ] No console errors
- [ ] Blocks persist
- [ ] Google Calendar syncs (or mock data)
- [ ] Error handling graceful

---

## 🎯 Success Criteria

### Minimum Viable Success (Must Have)
- [x] User can see a calendar
- [x] User can block days
- [x] Blocks persist on refresh
- [ ] Google Calendar events display (or mock fallback)

### Enhanced Success (Should Have)
- [ ] Half-day blocking (AM/PM)
- [ ] Drag selection
- [ ] Month navigation
- [ ] Loading states

### Stretch Goals (Nice to Have)
- [ ] Keyboard navigation
- [ ] Error boundaries
- [ ] Tooltips on events

---

## 📊 Timeline Validation

| Phase | Estimated | Critical Path | Buffer |
|-------|-----------|---------------|---------|
| 1. Setup | 1h | 0.5h | 0.5h |
| 2. Calendar | 3h | 2h | 1h |
| 3. State | 2h | 1.5h | 0.5h |
| 4. Interactions | 2.5h | 1.5h | 1h |
| 5. MCP Integration | 1.5h | 1h | 0.5h |
| 6. Polish | 1h | 0.25h | 0.75h |
| **Total** | **11h** | **7.25h** | **3.75h** |

**Critical Path**: 7.25 hours for fully functional calendar
**Emergency Fallback**: 4 hours for minimal viable (static grid + click toggle + localStorage)

---

## 🚨 Risk Mitigation

### High Priority Risks

**R001: MCP Integration (Score 9)**
- **Decision Point**: Hour 6
- **Fallback**: Mock data from `docs/DEPENDENCY-ANALYSIS.md:250`
- **Emergency**: Ship without Google Calendar sync

**R002: Timeline Overrun (Score 6)**
- **Checkpoints**: Hour 4, 6, 9
- **Feature Cutting**: Half-day (-45min), Drag (-45min), Keyboard (-30min)
- **Total Recoverable**: 2.5 hours

### Medium Priority Risks

**R003: State Sync Bugs (Score 4)**
- **Testing**: After each phase
- **Pattern**: Single source of truth (Context → localStorage)
- **Verification**: Refresh page after each change

---

## 📚 Reference Documentation Map

### During Setup (Phase 1)
- `docs/NEXTJS-IMPLEMENTATION-GUIDE.md` - Sections 1-2
- `docs/DEPENDENCY-ANALYSIS.md` - package.json template

### During Calendar Build (Phase 2)
- `docs/DATE-UTILITIES-GUIDE.md` - Grid generation
- `docs/REACT-PATTERNS-GUIDE.md` - useCalendar hook
- `docs/STYLING-PATTERNS-GUIDE.md` - Grid layout, cell states
- `docs/component-library-guide.md` - shadcn/ui components

### During State Management (Phase 3)
- `docs/REACT-PATTERNS-GUIDE.md` - AvailabilityContext (lines 20-174)
- `docs/NEXTJS-IMPLEMENTATION-GUIDE.md` - Context provider setup

### During Interactions (Phase 4)
- `docs/REACT-PATTERNS-GUIDE.md` - useDragSelection, useKeyboardNav
- `docs/component-library-guide.md` - Context Menu

### During Integration (Phase 5)
- `docs/NEXTJS-IMPLEMENTATION-GUIDE.md` - API Routes
- `docs/DEPENDENCY-ANALYSIS.md` - MCP SDK

### During Polish (Phase 6)
- `docs/NEXTJS-IMPLEMENTATION-GUIDE.md` - Error boundaries
- `docs/component-library-guide.md` - Loading states
- `docs/STYLING-PATTERNS-GUIDE.md` - Accessibility

---

## 🔧 Troubleshooting

### Common Issues

**Issue**: "Module not found: @/components/ui/button"
- **Solution**: Run `npx shadcn-ui@latest add button`

**Issue**: Calendar grid not displaying
- **Solution**: Check `generateCalendarGrid` returns 42 days

**Issue**: Blocks don't persist
- **Solution**: Verify localStorage.setItem is called in AvailabilityContext

**Issue**: MCP connection fails
- **Solution**: Use mock data fallback from DEPENDENCY-ANALYSIS.md

**Issue**: TypeScript errors on Date operations
- **Solution**: Check date-fns imports match DATE-UTILITIES-GUIDE.md

---

## ✅ Definition of Done

A feature is complete when:

1. ✅ All acceptance criteria pass (see `specs/ACCEPTANCE-CRITERIA.md`)
2. ✅ Code is type-safe (no TypeScript errors)
3. ✅ No console errors in Chrome
4. ✅ Manually tested with smoke test
5. ✅ Blocked dates persist correctly
6. ✅ Git commit created

---

## 🚀 Next Steps

1. **Review this plan** (15 min)
2. **Start Phase 1, Task 1.1** (create Next.js project)
3. **Follow checkpoints** at hours 1, 4, 6, 8.5, 10, 11
4. **Use documentation** as reference during implementation
5. **Ship MVP** at hour 11

---

**Generated from**:
- 2,026 lines of specifications
- 218 KB of research documentation
- 6 parallel Context7 research agents
- GitHub spec-kit methodology

**Ready to build!** 🎯
