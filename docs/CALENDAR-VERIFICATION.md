# Calendar Day-of-Week Verification Guide

Quick reference for verifying calendar day-of-week accuracy.

---

## Quick Verification Commands

### 1. Python Calendar (Most Reliable)

```bash
python3 -c "import calendar; print(calendar.month(2026, 1))"
```

**Output** (January 2026):
```
    January 2026
Mo Tu We Th Fr Sa Su
          1  2  3  4
 5  6  7  8  9 10 11
12 13 14 15 16 17 18
19 20 21 22 23 24 25
26 27 28 29 30 31
```

✅ **January 1, 2026 = Thursday**

### 2. JavaScript Date API

```bash
node -e "console.log('Jan 1, 2026:', new Date(2026, 0, 1).toDateString())"
```

**Output**: `Thu Jan 01 2026`

### 3. Our Verification Script

```bash
npx tsx scripts/verify-timezone-fix.ts
```

---

## Expected Calendar Grid for January 2026

```
Sun   Mon   Tue   Wed   Thu   Fri   Sat
─────────────────────────────────────────
28    29    30    31    1     2     3
(Dec) (Dec) (Dec) (Dec) (Jan) (Jan) (Jan)

4     5     6     7     8     9     10
11    12    13    14    15    16    17
18    19    20    21    22    23    24
25    26    27    28    29    30    31

(1)   (2)   (3)   (4)   (5)   (6)
(Feb) (Feb) (Feb) (Feb) (Feb) (Feb)
```

**Key Points**:
- January 1, 2026 falls on **Thursday** (column 5)
- Grid starts with Sunday, December 28, 2025
- Grid ends with Saturday, February 6, 2026
- Total cells: 42 (6 weeks × 7 days)

---

## Common Reference Dates

| Date | Day of Week | Position in Grid |
|------|-------------|------------------|
| Dec 28, 2025 | Sunday | 0 |
| Dec 29, 2025 | Monday | 1 |
| Dec 30, 2025 | Tuesday | 2 |
| Dec 31, 2025 | Wednesday | 3 |
| **Jan 1, 2026** | **Thursday** | **4** |
| Jan 2, 2026 | Friday | 5 |
| Jan 3, 2026 | Saturday | 6 |
| Jan 4, 2026 | Sunday | 7 |

---

## Debugging Timezone Issues

If you suspect timezone issues, check these:

### 1. Date Constructor Behavior

```javascript
const date = new Date(2026, 0, 1);
console.log('Local:', date.toString());
console.log('UTC:', date.toUTCString());
console.log('ISO:', date.toISOString());
console.log('Day:', date.getDay()); // Should be 4 (Thursday)
```

### 2. date-fns Operations

```javascript
const { startOfDay, startOfMonth, format } = require('date-fns');

const date = new Date(2026, 0, 15);
const normalized = startOfDay(date);
const monthStart = startOfDay(startOfMonth(normalized));

console.log('Month start:', format(monthStart, 'EEEE, MMMM d, yyyy'));
// Should output: "Thursday, January 1, 2026"
```

### 3. Check Timezone Environment

```bash
node -e "console.log('Timezone:', Intl.DateTimeFormat().resolvedOptions().timeZone)"
```

---

## Success Criteria

✅ **All of these must be true:**

1. January 1, 2026 displays as **Thursday**
2. Calendar grid starts on **Sunday** (December 28, 2025)
3. First week contains exactly **7 days** (Dec 28 - Jan 3)
4. Grid contains exactly **42 cells** (6 weeks)
5. Current month days are visually distinct
6. Today's date is highlighted correctly
7. Blocked dates persist across reloads

---

## Files Modified

- `/lib/utils/dates.ts` - Added defensive `startOfDay()` normalization
- `/scripts/verify-timezone-fix.ts` - Verification script
- `/docs/TIMEZONE-FIX-SUMMARY.md` - Detailed analysis
- `/docs/CALENDAR-VERIFICATION.md` - This guide

---

## Related Documentation

- [Timezone Fix Summary](./TIMEZONE-FIX-SUMMARY.md)
- [date-fns Documentation](https://date-fns.org/)
- [JavaScript Date API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)
