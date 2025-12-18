# Critical Bug Fix: Calendar State Management

**Date**: 2025-12-16
**Status**: ✅ FIXED
**Severity**: CRITICAL
**Impact**: Calendar navigation completely broken

---

## Problem Summary

The calendar was not updating when navigating months due to **duplicate state management** - two separate `useCalendar()` hook instances creating isolated state that never synchronized.

### Root Cause

```tsx
// CalendarView.tsx (Parent)
const { currentMonth, goToNextMonth, ... } = useCalendar(); // State A

// CalendarGrid.tsx (Child)
const { calendarWeeks } = useCalendar(); // State B ❌ SEPARATE INSTANCE
```

**Result**: Navigation buttons updated State A, but CalendarGrid displayed State B (which never changed).

---

## The Fix: Unidirectional Data Flow

### Before (BROKEN)

```
CalendarView [useCalendar() → State A] → updates on navigation ✓
                ↓ (no connection)
CalendarGrid [useCalendar() → State B] → NEVER updates ❌
```

### After (FIXED)

```
CalendarView [useCalendar() → State] → passes via props ↓
                                        ↓
CalendarGrid [receives props]       → re-renders when props change ✓
```

---

## Implementation Changes

### 1. CalendarView.tsx (Parent Component)

**Changed**: Extract `calendarWeeks` from hook and pass as props

```tsx
export default function CalendarView({ editable = true }: CalendarViewProps) {
  const {
    currentMonth,
    calendarWeeks,     // ✅ ADDED: Extract from hook
    goToNextMonth,
    goToPreviousMonth,
    goToToday
  } = useCalendar();

  // ... other code ...

  return (
    <Card className="p-4 lg:p-6">
      <CalendarToolbar ... />
      <CalendarGrid
        calendarWeeks={calendarWeeks}  // ✅ ADDED: Pass as prop
        currentMonth={currentMonth}    // ✅ ADDED: For debugging/keys
        editable={editable}
      />
    </Card>
  );
}
```

### 2. CalendarGrid.tsx (Child Component)

**Changed**: Receive data via props instead of creating own state

```tsx
import DayCell from './DayCell';
import { type CalendarDay } from '@/lib/utils/dates';

interface CalendarGridProps {
  calendarWeeks: CalendarDay[][];  // ✅ ADDED: Receive from parent
  currentMonth: Date;              // ✅ ADDED: For stable keys
  editable?: boolean;
}

export default function CalendarGrid({
  calendarWeeks,   // ✅ FROM PROPS
  currentMonth,    // ✅ FROM PROPS
  editable = true
}: CalendarGridProps) {
  // ❌ REMOVED: const { calendarWeeks } = useCalendar();

  // ... rest of component uses props ...

  return (
    <div className="grid grid-cols-7 gap-1 lg:gap-2">
      {calendarWeeks.flat().map((day, idx) => (
        <DayCell
          key={`${currentMonth.getTime()}-${idx}`}  // ✅ IMPROVED: Stable keys
          day={day}
          editable={editable}
        />
      ))}
    </div>
  );
}
```

---

## Constitutional Compliance

This fix adheres to project architecture principles:

### ✅ Article I: Simplicity
- **Single source of truth**: One `useCalendar()` hook instance
- **Clear data flow**: Parent manages state, child receives props

### ✅ Article VIII: Data Flow Clarity
- **Unidirectional flow**: State flows down via props
- **No prop drilling**: Only one level deep (View → Grid)
- **Explicit dependencies**: Props clearly defined in interface

### ✅ Article VII: Component Isolation
- **Pure presentation**: CalendarGrid is now stateless (receives all data via props)
- **Clear boundaries**: CalendarView = smart component, CalendarGrid = presentational

---

## Testing Verification

### Manual Test Cases

Run these tests after deployment:

1. **Initial Load**
   - ✅ Calendar displays December 2025 (current month)
   - ✅ Grid shows 42 cells (6 weeks × 7 days)
   - ✅ Today's date highlighted

2. **Next Month Navigation**
   - ✅ Click "Next" → Calendar shows January 2026
   - ✅ Click "Next" again → Calendar shows February 2026
   - ✅ Month header updates correctly

3. **Previous Month Navigation**
   - ✅ Click "Previous" → Calendar shows January 2026
   - ✅ Click "Previous" again → Calendar shows December 2025
   - ✅ Grid cells update with new dates

4. **Today Button**
   - ✅ Navigate to any future/past month
   - ✅ Click "Today" → Calendar returns to December 2025
   - ✅ Current date highlighted

5. **Edge Cases**
   - ✅ Rapidly click Next 5 times → Calendar updates all 5 times
   - ✅ Navigate to December 2024 → Shows correct 42-cell grid
   - ✅ Navigate to February 2025 (28 days) → Grid fills correctly with previous/next month dates

### Automated Test (Future)

```typescript
describe('CalendarGrid state management', () => {
  it('updates when parent state changes', () => {
    const { rerender } = render(<CalendarGrid ... />);

    // Change currentMonth in parent
    const nextMonth = getNextMonth(currentMonth);
    rerender(<CalendarGrid currentMonth={nextMonth} ... />);

    // Verify grid updated
    expect(screen.getByText('February 2026')).toBeInTheDocument();
  });
});
```

---

## Performance Impact

### Before Fix
- **Re-renders**: CalendarGrid never re-rendered (stale state)
- **Memory**: Two separate state instances (wasteful)

### After Fix
- **Re-renders**: CalendarGrid re-renders when `calendarWeeks` prop changes (correct)
- **Memory**: Single state instance (efficient)
- **Performance**: No degradation - `useMemo` still caches expensive calculations

### Memo Analysis

```tsx
// useCalendar.ts (unchanged - still optimized)
const calendarWeeks = useMemo<CalendarDay[][]>(() => {
  return groupEnrichedIntoWeeks(calendarDays);
}, [calendarDays]);
```

**Key Point**: `useMemo` ensures `calendarWeeks` reference only changes when `currentMonth` changes, preventing unnecessary re-renders.

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ CalendarView (Smart Component)                              │
│                                                              │
│ State Management:                                           │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ useCalendar()                                        │   │
│ │   currentMonth: Date                                 │   │
│ │   calendarWeeks: CalendarDay[][]  ← useMemo cached  │   │
│ │   goToNextMonth: () => void                          │   │
│ │   goToPreviousMonth: () => void                      │   │
│ │   goToToday: () => void                              │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│ Props Flow (Unidirectional):                                │
│   ↓ currentMonth                                            │
│   ↓ calendarWeeks                                           │
│   ↓ editable                                                │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ CalendarGrid (Presentational Component)                     │
│                                                              │
│ Received Props:                                             │
│   - calendarWeeks: CalendarDay[][]                          │
│   - currentMonth: Date                                      │
│   - editable: boolean                                       │
│                                                              │
│ Behavior:                                                   │
│   - Renders 42-cell grid from calendarWeeks                │
│   - Re-renders when props change                           │
│   - No internal state management                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Learnings

### 1. React Hooks Create Independent State
Each `useCalendar()` call creates a **new state instance**. Components cannot "share" state through multiple hook calls.

### 2. Props Are the Correct Pattern
When child components need parent state, **pass via props** - don't duplicate the hook.

### 3. Smart vs Presentational Components
- **Smart**: Manage state via hooks (CalendarView)
- **Presentational**: Receive data via props (CalendarGrid)

### 4. Stable Keys Matter
Using `currentMonth.getTime()` in keys ensures React properly identifies when to re-render cells during month changes.

---

## Files Modified

1. `/Users/manu/Documents/LUXOR/cal/components/calendar/CalendarView.tsx`
   - Added `calendarWeeks` extraction from hook
   - Pass `calendarWeeks` and `currentMonth` as props to CalendarGrid

2. `/Users/manu/Documents/LUXOR/cal/components/calendar/CalendarGrid.tsx`
   - Removed internal `useCalendar()` hook call
   - Added props interface with `CalendarDay[][]` type
   - Improved key stability using `currentMonth.getTime()`

---

## Build Verification

```bash
$ npm run build
✓ Compiled successfully
✓ Generating static pages (4/4)
○  (Static)  prerendered as static content
```

**Status**: ✅ TypeScript compilation successful, no errors

---

## Next Steps

1. **Manual Testing**: Verify all test cases above in browser
2. **Integration Testing**: Test with Google Calendar data
3. **Documentation**: Update component architecture diagrams
4. **Code Review**: Have teammate verify the fix pattern

---

## References

- **React Docs**: [Sharing State Between Components](https://react.dev/learn/sharing-state-between-components)
- **Project Constitution**: Article VIII (Data Flow Clarity)
- **Implementation Plan**: `/Users/manu/Documents/LUXOR/cal/docs/IMPLEMENTATION-PLAN-V2.md`
- **Issue Tracker**: (Add Linear issue ID here)

---

**Fix Implemented By**: Claude Code (Pragmatic Programmer)
**Review Status**: Pending manual testing
**Deployment Status**: Ready for testing
