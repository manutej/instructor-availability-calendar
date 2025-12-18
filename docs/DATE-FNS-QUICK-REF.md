# date-fns Quick Reference - Calendar System

**One-page reference for all calendar date operations**

---

## Installation

```bash
npm install date-fns@^3.0.0
```

---

## Import Pattern (Tree-Shakable)

```typescript
// ✅ ALWAYS use named imports
import { format, addDays, isSameDay } from 'date-fns';

// ❌ NEVER use wildcard imports
import * as dateFns from 'date-fns'; // Includes entire library!
```

---

## Calendar Grid Generation

### Generate 42-Day Grid (6 weeks × 7 days)

```typescript
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addDays,
} from 'date-fns';

function generateCalendarGrid(date: Date): Date[] {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  // Pad to exactly 42 days
  while (days.length < 42) {
    days.push(addDays(days[days.length - 1], 1));
  }

  return days.slice(0, 42);
}
```

**Bundle Size**: ~3.8KB gzipped

---

## Date Comparison

| Check | Function | Example |
|-------|----------|---------|
| Is today? | `isToday(date)` | `isToday(date) ? 'bg-blue' : 'bg-white'` |
| Same day? | `isSameDay(d1, d2)` | `isSameDay(date, selected)` |
| Same month? | `isSameMonth(d1, d2)` | `isSameMonth(date, currentMonth)` |
| Before? | `isBefore(d1, d2)` | `isBefore(date, today)` |
| After? | `isAfter(d1, d2)` | `isAfter(date, maxDate)` |
| In range? | `isWithinInterval(date, {start, end})` | Range selection |

**Bundle Size**: ~1.2KB gzipped

**Critical**: Use `startOfDay()` for day-level comparisons!

```typescript
import { isBefore, startOfDay } from 'date-fns';

// ✅ Correct - compares days only
isBefore(startOfDay(date1), startOfDay(date2))

// ❌ Wrong - compares including time
isBefore(date1, date2) // May give unexpected results!
```

---

## Date Formatting

### Storage Format (ISO 8601)

```typescript
import { formatISO, parseISO } from 'date-fns';

// To storage
const stored = formatISO(date, { representation: 'date' });
// "2024-01-15" - Unambiguous, sortable, DB-friendly

// From storage
const date = parseISO('2024-01-15');
```

### Display Formats

```typescript
import { format } from 'date-fns';

format(date, 'MMMM yyyy');          // "January 2024"
format(date, 'MMM d, yyyy');        // "Jan 15, 2024"
format(date, 'EEEE, MMMM d, yyyy'); // "Monday, January 15, 2024"
format(date, 'EEE');                // "Mon"
format(date, 'd');                  // "15"
```

**Bundle Size**: ~2.5KB gzipped

### Format Tokens Cheatsheet

| Token | Output | Description |
|-------|--------|-------------|
| `yyyy` | 2024 | 4-digit year |
| `yy` | 24 | 2-digit year |
| `MMMM` | January | Full month |
| `MMM` | Jan | Short month |
| `MM` | 01 | 2-digit month |
| `dd` | 05 | 2-digit day |
| `d` | 5 | Day of month |
| `EEEE` | Monday | Full day name |
| `EEE` | Mon | Short day name |
| `do` | 5th | Day with ordinal |

---

## Month Navigation

```typescript
import { addMonths, subMonths } from 'date-fns';

// Previous/Next month
const prevMonth = subMonths(currentMonth, 1);
const nextMonth = addMonths(currentMonth, 1);

// Jump to specific month
const targetMonth = new Date(2024, 0, 1); // Jan 2024

// Jump to today
const today = new Date();
```

**Bundle Size**: ~1.5KB gzipped

---

## Keyboard Navigation

```typescript
import { addDays, subDays, startOfWeek, endOfWeek } from 'date-fns';

// Arrow keys
const left  = subDays(date, 1);   // ← Previous day
const right = addDays(date, 1);   // → Next day
const up    = subDays(date, 7);   // ↑ Previous week
const down  = addDays(date, 7);   // ↓ Next week

// Home/End
const weekStart = startOfWeek(date, { weekStartsOn: 0 });
const weekEnd = endOfWeek(date, { weekStartsOn: 0 });

// Page Up/Down
const prevMonth = subMonths(date, 1);
const nextMonth = addMonths(date, 1);
```

---

## Date Range Selection

```typescript
import { eachDayOfInterval, isBefore, startOfDay } from 'date-fns';

function generateDateRange(start: Date, end: Date): Date[] {
  const startDay = startOfDay(start);
  const endDay = startOfDay(end);

  // Swap if needed
  const [actualStart, actualEnd] = isBefore(startDay, endDay)
    ? [startDay, endDay]
    : [endDay, startDay];

  return eachDayOfInterval({ start: actualStart, end: actualEnd });
}
```

---

## Common Patterns

### Calendar Component

```typescript
const [currentMonth, setCurrentMonth] = useState(new Date());

const calendarDays = useMemo(
  () => generateCalendarGrid(currentMonth),
  [currentMonth]
);

const weeks = useMemo(() => {
  const result: Date[][] = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    result.push(calendarDays.slice(i, i + 7));
  }
  return result;
}, [calendarDays]);
```

### Day Cell State

```typescript
const isCurrent = isSameMonth(date, currentMonth);
const isToday = isDateToday(date);
const isSelected = selectedDate && isSameDay(date, selectedDate);
const isDisabled = isBefore(startOfDay(date), startOfDay(new Date()));
```

---

## Performance Tips

### 1. Memoize Expensive Operations

```typescript
// ✅ Memoize calendar grid
const grid = useMemo(
  () => generateCalendarGrid(currentMonth),
  [currentMonth]
);

// ✅ Memoize comparisons
const isSelected = useCallback(
  (date) => selectedDate && isSameDay(date, selectedDate),
  [selectedDate]
);

// ✅ Memoize formatted strings
const header = useMemo(
  () => format(currentMonth, 'MMMM yyyy'),
  [currentMonth]
);
```

### 2. Avoid Creating Dates in Render

```typescript
// ❌ Bad - creates new Date every render
<button onClick={() => setDate(new Date())}>Today</button>

// ✅ Good - memoize today
const today = useMemo(() => startOfDay(new Date()), []);
<button onClick={() => setDate(today)}>Today</button>
```

---

## Common Pitfalls

### 1. Timezone Issues

```typescript
// ❌ Wrong
const date = new Date('2024-01-15'); // Local timezone

// ✅ Correct
const date = startOfDay(new Date(2024, 0, 15));
```

### 2. Month Boundaries

```typescript
// ❌ Wrong
const feb31 = new Date(2024, 1, 31); // → March 3!

// ✅ Correct
const lastDay = endOfMonth(new Date(2024, 1, 1)); // → Feb 29
```

### 3. Date Mutation

```typescript
// ❌ Wrong
date.setDate(date.getDate() + 1); // Mutates!

// ✅ Correct
const tomorrow = addDays(date, 1); // Immutable
```

### 4. Week Start Day

```typescript
// ❌ Ambiguous
startOfWeek(date); // Defaults to Sunday

// ✅ Explicit
startOfWeek(date, { weekStartsOn: 0 }); // Sunday
startOfWeek(date, { weekStartsOn: 1 }); // Monday
```

---

## Bundle Size Summary

```
Format operations:        2.5 KB
Calendar grid:            3.8 KB
Date comparison:          1.2 KB
Month navigation:         1.5 KB
────────────────────────────────
Total typical usage:   10-14 KB gzipped
```

**Target**: < 15KB (✅ Achieved)

---

## Complete Import List

```typescript
// Calendar grid
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addDays,
  getDay,
} from 'date-fns';

// Comparison
import {
  isSameDay,
  isSameMonth,
  isToday,
  isBefore,
  isAfter,
  isEqual,
  startOfDay,
} from 'date-fns';

// Formatting
import {
  format,
  formatISO,
  parseISO,
} from 'date-fns';

// Navigation
import {
  addDays,
  subDays,
  addMonths,
  subMonths,
} from 'date-fns';
```

---

## Quick Decision Tree

**Need to...**

- Generate calendar grid? → `generateCalendarGrid()`
- Check if today? → `isToday(date)`
- Check if same day? → `isSameDay(d1, d2)`
- Check if in month? → `isSameMonth(date, month)`
- Store date? → `formatISO(date, { representation: 'date' })`
- Display date? → `format(date, 'MMM d, yyyy')`
- Navigate months? → `addMonths()` / `subMonths()`
- Navigate days? → `addDays()` / `subDays()`
- Get date range? → `eachDayOfInterval({ start, end })`

---

## Type Definitions

```typescript
interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  dayOfWeek: number; // 0-6
}

type WeekStartDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;
```

---

**Full Guide**: See `DATE-UTILITIES-GUIDE.md`
**Implementation**: See `dates.ts` section in guide
**Research**: See `RESEARCH-SUMMARY.md`
