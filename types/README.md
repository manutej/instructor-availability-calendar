# Calendar System Type Definitions

Complete TypeScript type definitions for the calendar availability system.

## Files

### 1. `calendar.ts` (214 lines)
Core calendar types for availability management.

**Exports**:
- `BlockedDate` - Date blocked by instructor (full/AM/PM)
- `GoogleEvent` - Google Calendar event via MCP
- `CalendarState` - Application state (Context + localStorage)
- `CalendarDay` - Computed properties for calendar cell rendering
- `StorageSchema` - localStorage persistence schema

**Key Features**:
- ISO date strings (YYYY-MM-DD) for consistency
- Map-based blocked dates for O(1) lookup
- Versioned storage schema for migrations

### 2. `instructor.ts` (167 lines)
Instructor profiles for public calendar sharing (v2.0).

**Exports**:
- `InstructorProfile` - Shareable calendar profile
- `PublicCalendarData` - Public API response format

**Key Features**:
- URL-safe slug for public routes (`/calendar/[slug]`)
- Optional theme customization (colors, logo)
- Public/private toggle

### 3. `email.ts` (279 lines)
Email generation with critical date verification (v2.0).

**Exports**:
- `VerifiedDate` - Date with verified day-of-week
- `EmailTemplateData` - Email template input
- `ICSEvent` - Calendar attachment event
- `EmailGenerationResponse` - API response

**Key Features**:
- CRITICAL: Prevents "Monday, Jan 5" errors when Jan 5 is Tuesday
- All dates verified through `verifyDate()` utility
- ICS file generation for calendar imports

### 4. `index.ts` (221 lines)
Central export point + type guards + utility types.

**Re-exports**: All types from calendar/instructor/email

**Type Guards**:
- `isDateBlocked()` - Check if date is blocked
- `isDateFullyBlocked()` - Check if fully blocked (not AM/PM)
- `isAMBlocked()` - Check if AM blocked
- `isPMBlocked()` - Check if PM blocked

**Utility Types**:
- `CalendarStateUpdate` - Partial state updates
- `InstructorProfileInput` - Profile creation (omits auto-gen fields)
- `EmailTemplateInput` - Email input (omits computed dates)

## Statistics

- **Total Lines**: 881
- **Interfaces**: 10
- **Type Guards**: 4
- **Utility Types**: 3
- **JSDoc Coverage**: 100%

## Validation

```bash
# Zero TypeScript errors
npx tsc --noEmit
```

## Usage Examples

### Import Types
```typescript
import { BlockedDate, GoogleEvent, CalendarState } from '@/types';
import { InstructorProfile } from '@/types/instructor';
import { VerifiedDate, EmailTemplateData } from '@/types/email';
```

### Use Type Guards
```typescript
import { isDateBlocked, isDateFullyBlocked } from '@/types';

const blockedDates = new Map([
  ['2026-01-15', { date: '2026-01-15', status: 'full' }]
]);

if (isDateBlocked('2026-01-15', blockedDates)) {
  // Date is blocked
}

if (isDateFullyBlocked('2026-01-15', blockedDates)) {
  // Date is fully blocked (not just AM/PM)
}
```

### Date Verification (CRITICAL)
```typescript
import { verifyDate } from '@/lib/utils/date-verification';
import { VerifiedDate } from '@/types';

// ✅ CORRECT: Always use verification
const verified: VerifiedDate = verifyDate(new Date('2026-01-05'));
console.log(verified.formatted); // "Monday, January 5, 2026" ✓

// ❌ WRONG: Never construct date strings manually
const wrong = `Tuesday, January 5, 2026`; // ERROR if Jan 5 is Monday!
```

## References

- Specifications: `specs/TECHNICAL-PLAN.md` Lines 119-157
- v2.0 Models: `specs/SPEC-V2.md` Lines 315-358
- Date Verification: `docs/PUBLIC-SHARING-EMAIL-GUIDE.md`

## Success Criteria

- ✅ All types compile with `npx tsc --noEmit`
- ✅ Zero TypeScript errors
- ✅ Follows strict mode
- ✅ Complete JSDoc comments (100% coverage)
- ✅ Type guards for common operations
- ✅ Utility types for partial updates
