# Intelligent Email Availability Generator - Implementation Specification

**Status**: Ready for Implementation
**Estimated Time**: 14-19 hours (2-3 days)
**Confidence**: 95%
**Version**: 1.0

---

## Executive Summary

This specification defines the implementation of an AI-powered email availability generator that allows instructors to:
- Use natural language queries ("Avail for next month")
- Find 1-hour meeting slots (not just AM/PM blocks)
- Filter by time-of-day (morning/afternoon/evening)
- Generate professional emails with .ics attachments
- Use both structured (buttons) and unstructured (text) input

---

## Requirements Verification

| Requirement | Solution | Status |
|------------|----------|--------|
| "Avail for next month" returns all fully available days | `findAvailableDays()` method | ✅ Designed |
| One-hour meeting slots | 16 hourly slots (6am-10pm) in TimeSlotStatus | ✅ Designed |
| Morning/afternoon/evening awareness | Time period mapping in query engine | ✅ Designed |
| LLM-powered suggestions | Claude API integration with fallback parser | ✅ Designed |
| Structured + unstructured selection | Quick actions + text input | ✅ Designed |
| Set specific times | `slotDuration` parameter in AvailabilityQuery | ✅ Designed |

---

## Architecture Overview

### Data Flow
```
User Input (Text/Button)
  ↓
Claude API (Natural Language Parsing)
  ↓
AvailabilityQuery (Structured)
  ↓
QueryEngine (Execute against Calendar Data)
  ↓
QueryResult (Matching Dates/Slots)
  ↓
EmailComposer (Generate Email + .ics)
  ↓
Email Sent
```

### Technology Stack
- **LLM**: Claude 3.5 Sonnet (Anthropic API)
- **Backend**: Next.js App Router API routes
- **Frontend**: React 19 + framer-motion
- **Email**: react-email + .ics generation
- **Data**: localStorage (v2 format with auto-migration)

---

## Data Model

### Version 2 Data Structure

```typescript
// lib/types.ts

export interface TimeSlotStatus {
  slots: Map<string, boolean>;  // '06:00' → true means blocked
  fullDayBlock?: boolean;
  eventName?: string;
}

export interface AvailabilityData {
  version: 1 | 2;
  blockedDates: {
    [date: string]: BlockStatus | TimeSlotStatus;  // Support both v1 and v2
  };
  instructorId: string;
}

export interface AvailabilityQuery {
  intent: 'find_slots' | 'find_days' | 'suggest_times';
  dateRange: {
    start: Date;
    end: Date;
  };
  timePreference?: 'morning' | 'afternoon' | 'evening' | 'any';
  slotDuration?: '1hour' | 'half-day' | 'full-day';
  count?: number;
}

export interface QueryResult {
  intent: AvailabilityQuery['intent'];
  items: Date[] | TimeSlot[] | MeetingSuggestion[];
  query: AvailabilityQuery;
  suggestions?: string[];  // Alternative suggestions if no results
}

export interface TimeSlot {
  date: Date;
  time: string;  // '09:00', '14:00', etc.
}

export interface MeetingSuggestion {
  date: Date;
  time: string;
  score: number;  // 0-1, based on contiguous availability
  reason: string;  // "3 consecutive hours available"
}
```

### Time Slot Constants

```typescript
// lib/time-slots.ts

export const MORNING_SLOTS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00'
];

export const AFTERNOON_SLOTS = [
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
];

export const EVENING_SLOTS = [
  '18:00', '19:00', '20:00', '21:00'
];

export const ALL_SLOTS = [
  ...MORNING_SLOTS,
  ...AFTERNOON_SLOTS,
  ...EVENING_SLOTS
];

export const TIME_PERIODS = {
  morning: MORNING_SLOTS,
  afternoon: AFTERNOON_SLOTS,
  evening: EVENING_SLOTS,
  any: ALL_SLOTS
};
```

---

## Migration Strategy

### Automatic v1 → v2 Migration

```typescript
// lib/migration-service.ts

export class DataMigrationService {
  migrateToV2(v1Data: AvailabilityData): AvailabilityData {
    const v2Data = { ...v1Data, version: 2 };

    for (const [date, blockStatus] of Object.entries(v1Data.blockedDates)) {
      if (this.isV1Format(blockStatus)) {
        const slots = new Map<string, boolean>();

        // AM blocked → block morning slots
        if (blockStatus.AM) {
          MORNING_SLOTS.forEach(slot => slots.set(slot, true));
        }

        // PM blocked → block afternoon + evening slots
        if (blockStatus.PM) {
          AFTERNOON_SLOTS.forEach(slot => slots.set(slot, true));
          EVENING_SLOTS.forEach(slot => slots.set(slot, true));
        }

        v2Data.blockedDates[date] = {
          slots,
          fullDayBlock: blockStatus.AM && blockStatus.PM,
          eventName: blockStatus.eventName
        };
      }
    }

    return v2Data;
  }

  // Backward compatibility - derive AM/PM from slots
  deriveAMPM(status: TimeSlotStatus): { AM: boolean; PM: boolean } {
    const morningBlocked = MORNING_SLOTS.some(slot => status.slots.get(slot));
    const afternoonBlocked =
      AFTERNOON_SLOTS.some(slot => status.slots.get(slot)) ||
      EVENING_SLOTS.some(slot => status.slots.get(slot));

    return { AM: morningBlocked, PM: afternoonBlocked };
  }

  private isV1Format(status: any): status is BlockStatus {
    return 'AM' in status && 'PM' in status;
  }
}

export const migrationService = new DataMigrationService();
```

**Migration Timing**:
- **On Load**: Auto-detect version, migrate v1 → v2 in-memory
- **On Save**: Always save as v2 format
- **No Data Loss**: v1 data preserved, just expanded to v2
- **Rollback**: Can derive v1 from v2 if needed

---

## Query Engine

### Core Query Execution

```typescript
// lib/query-engine.ts

import { differenceInDays, isWithinInterval } from 'date-fns';
import { TIME_PERIODS } from './time-slots';

const MAX_QUERY_DAYS = 90;

export class AvailabilityQueryEngine {
  execute(query: AvailabilityQuery, calendarData: AvailabilityData): QueryResult {
    // Validate query
    this.validateQuery(query);

    switch (query.intent) {
      case 'find_days':
        return this.findAvailableDays(query, calendarData);
      case 'find_slots':
        return this.findAvailableSlots(query, calendarData);
      case 'suggest_times':
        return this.suggestMeetingTimes(query, calendarData);
    }
  }

  private validateQuery(query: AvailabilityQuery): void {
    const days = differenceInDays(query.dateRange.end, query.dateRange.start);
    if (days > MAX_QUERY_DAYS) {
      throw new Error(
        `Query range too large (${days} days). Maximum is ${MAX_QUERY_DAYS} days.`
      );
    }
  }

  private findAvailableDays(
    query: AvailabilityQuery,
    data: AvailabilityData
  ): QueryResult {
    const availableDays: Date[] = [];

    for (const [dateStr, status] of Object.entries(data.blockedDates)) {
      const date = new Date(dateStr);

      // Check if in range
      if (!this.isDateInRange(date, query.dateRange)) continue;

      // Check if fully available (no blocked slots)
      const isFullyAvailable = this.isV2Status(status)
        ? !status.fullDayBlock && Array.from(status.slots.values()).every(blocked => !blocked)
        : !status.AM && !status.PM;

      if (isFullyAvailable) {
        availableDays.push(date);
      }
    }

    return {
      intent: 'find_days',
      items: availableDays,
      query,
      suggestions: availableDays.length === 0
        ? ['No fully available days found. Try a different date range or look for specific time slots.']
        : undefined
    };
  }

  private findAvailableSlots(
    query: AvailabilityQuery,
    data: AvailabilityData
  ): QueryResult {
    const targetSlots = query.timePreference
      ? TIME_PERIODS[query.timePreference]
      : TIME_PERIODS.any;

    const availableSlots: TimeSlot[] = [];

    for (const [dateStr, status] of Object.entries(data.blockedDates)) {
      const date = new Date(dateStr);

      if (!this.isDateInRange(date, query.dateRange)) continue;

      if (this.isV2Status(status)) {
        // v2 format - check individual slots
        for (const slotTime of targetSlots) {
          if (!status.slots.get(slotTime)) {  // Not blocked
            availableSlots.push({ date, time: slotTime });
          }
        }
      } else {
        // v1 format - derive from AM/PM
        if (query.timePreference === 'morning' && !status.AM) {
          MORNING_SLOTS.forEach(time => {
            availableSlots.push({ date, time });
          });
        } else if (query.timePreference !== 'morning' && !status.PM) {
          (query.timePreference === 'afternoon' ? AFTERNOON_SLOTS : EVENING_SLOTS)
            .forEach(time => {
              availableSlots.push({ date, time });
            });
        }
      }
    }

    const limitedSlots = query.count
      ? availableSlots.slice(0, query.count)
      : availableSlots;

    return {
      intent: 'find_slots',
      items: limitedSlots,
      query,
      suggestions: limitedSlots.length === 0
        ? this.suggestAlternatives(query)
        : undefined
    };
  }

  private suggestMeetingTimes(
    query: AvailabilityQuery,
    data: AvailabilityData
  ): QueryResult {
    // Find slots and rank by contiguous availability
    const slots = this.findAvailableSlots(query, data).items as TimeSlot[];

    // Group by date
    const slotsByDate = new Map<string, TimeSlot[]>();
    slots.forEach(slot => {
      const key = slot.date.toISOString().split('T')[0];
      if (!slotsByDate.has(key)) slotsByDate.set(key, []);
      slotsByDate.get(key)!.push(slot);
    });

    // Score each slot based on contiguous availability
    const suggestions: MeetingSuggestion[] = [];

    for (const [dateStr, dateSlots] of slotsByDate) {
      dateSlots.forEach(slot => {
        const score = this.calculateContiguityScore(slot, dateSlots);
        const contiguousHours = Math.floor(score * 10);

        suggestions.push({
          date: slot.date,
          time: slot.time,
          score,
          reason: `${contiguousHours} consecutive hours available`
        });
      });
    }

    // Sort by score (highest first)
    suggestions.sort((a, b) => b.score - a.score);

    return {
      intent: 'suggest_times',
      items: suggestions.slice(0, query.count || 5),
      query
    };
  }

  private calculateContiguityScore(slot: TimeSlot, dateSlots: TimeSlot[]): number {
    // Count consecutive available hours before and after this slot
    const slotHour = parseInt(slot.time.split(':')[0]);
    let before = 0, after = 0;

    for (let h = slotHour - 1; h >= 6; h--) {
      if (dateSlots.some(s => s.time === `${h.toString().padStart(2, '0')}:00`)) {
        before++;
      } else break;
    }

    for (let h = slotHour + 1; h <= 21; h++) {
      if (dateSlots.some(s => s.time === `${h.toString().padStart(2, '0')}:00`)) {
        after++;
      } else break;
    }

    return (before + after + 1) / 10;  // Normalize to 0-1
  }

  private suggestAlternatives(query: AvailabilityQuery): string[] {
    const suggestions: string[] = [];

    if (query.timePreference === 'morning') {
      suggestions.push('Try afternoons or evenings instead.');
    } else if (query.timePreference === 'afternoon') {
      suggestions.push('Try mornings or evenings instead.');
    } else if (query.timePreference === 'evening') {
      suggestions.push('Try mornings or afternoons instead.');
    }

    suggestions.push('Try a different date range or look for full-day availability.');

    return suggestions;
  }

  private isDateInRange(date: Date, range: { start: Date; end: Date }): boolean {
    return isWithinInterval(date, { start: range.start, end: range.end });
  }

  private isV2Status(status: any): status is TimeSlotStatus {
    return 'slots' in status;
  }
}
```

---

## API Routes

### 1. Parse Natural Language Query

```typescript
// app/api/availability/parse-query/route.ts

import { Anthropic } from '@anthropic-ai/sdk';
import type { AvailabilityQuery } from '@/types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

export async function POST(request: Request) {
  const { query, currentDate, timezone } = await request.json();

  const systemPrompt = `You are an availability query parser. Extract structured query information from natural language.

Today is ${currentDate} (timezone: ${timezone}).

Output valid JSON matching this schema:
{
  "intent": "find_slots" | "find_days" | "suggest_times",
  "dateRange": {
    "start": "YYYY-MM-DD",
    "end": "YYYY-MM-DD"
  },
  "timePreference": "morning" | "afternoon" | "evening" | "any",
  "slotDuration": "1hour" | "half-day" | "full-day",
  "count": number (optional)
}

Examples:
- "Avail for next month" → { "intent": "find_days", "dateRange": { "start": "2025-01-01", "end": "2025-01-31" }, "slotDuration": "full-day" }
- "Morning meetings next week" → { "intent": "find_slots", "dateRange": { "start": "2025-01-06", "end": "2025-01-12" }, "timePreference": "morning", "slotDuration": "1hour" }
- "Available afternoons in March" → { "intent": "find_slots", "dateRange": { "start": "2025-03-01", "end": "2025-03-31" }, "timePreference": "afternoon", "slotDuration": "1hour" }

Return ONLY valid JSON, no markdown formatting.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: query
      }],
      system: systemPrompt
    });

    const responseText = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    // Parse Claude's JSON response
    const parsedQuery: AvailabilityQuery = JSON.parse(responseText);

    // Validate schema
    if (!parsedQuery.intent || !parsedQuery.dateRange) {
      throw new Error('Invalid query structure');
    }

    return Response.json({
      success: true,
      query: parsedQuery
    });

  } catch (error) {
    console.error('Query parsing error:', error);

    // Fallback to simple pattern matching
    try {
      const fallbackQuery = fallbackParser(query, currentDate);
      return Response.json({
        success: true,
        query: fallbackQuery,
        warning: 'Using simplified parsing. Results may be less accurate.'
      });
    } catch (fallbackError) {
      return Response.json({
        success: false,
        error: 'Failed to parse query. Please try rephrasing.'
      }, { status: 400 });
    }
  }
}

function fallbackParser(input: string, currentDate: string): AvailabilityQuery {
  const now = new Date(currentDate);

  // Simple pattern matching for common queries
  if (/next month/i.test(input)) {
    const start = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 2, 0);
    return {
      intent: 'find_days',
      dateRange: { start, end },
      slotDuration: 'full-day'
    };
  }

  if (/morning/i.test(input)) {
    const start = new Date(now);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14);
    return {
      intent: 'find_slots',
      dateRange: { start, end },
      timePreference: 'morning',
      slotDuration: '1hour'
    };
  }

  // Default: next 30 days, any time
  const start = new Date(now);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 30);
  return {
    intent: 'find_days',
    dateRange: { start, end },
    slotDuration: 'full-day'
  };
}
```

### 2. Execute Query

```typescript
// app/api/availability/execute-query/route.ts

import { AvailabilityQueryEngine } from '@/lib/query-engine';
import { persistence } from '@/lib/data/persistence';
import type { AvailabilityQuery, QueryResult } from '@/types';

export async function POST(request: Request) {
  const { query }: { query: AvailabilityQuery } = await request.json();

  try {
    // Load calendar data
    const calendarData = await persistence.loadAvailability();

    if (!calendarData) {
      return Response.json({
        success: false,
        error: 'No calendar data found'
      }, { status: 404 });
    }

    // Execute query
    const engine = new AvailabilityQueryEngine();
    const results = engine.execute(query, calendarData);

    return Response.json({
      success: true,
      results,
      query  // Echo back for debugging
    });

  } catch (error) {
    console.error('Query execution error:', error);
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to execute query'
    }, { status: 500 });
  }
}
```

---

## UI Components

### Email Generator Modal

```typescript
// components/email-generator/EmailGeneratorModal.tsx

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import NaturalLanguageInput from './NaturalLanguageInput';
import QuickActionButtons from './QuickActionButtons';
import QueryResultsPreview from './QueryResultsPreview';
import EmailComposer from './EmailComposer';
import { useAvailabilityQuery } from '@/hooks/useAvailabilityQuery';

interface EmailGeneratorModalProps {
  onClose: () => void;
}

export default function EmailGeneratorModal({ onClose }: EmailGeneratorModalProps) {
  const { executeQuery, isProcessing, results, error } = useAvailabilityQuery();
  const [step, setStep] = useState<'query' | 'results' | 'compose'>('query');

  const handleQuerySubmit = async (query: string) => {
    await executeQuery(query);
    if (results) {
      setStep('results');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          className="bg-white/90 backdrop-blur-md rounded-2xl shadow-glass max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold">Generate Availability Email</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {step === 'query' && (
              <>
                <NaturalLanguageInput
                  onQuerySubmit={handleQuerySubmit}
                  isProcessing={isProcessing}
                />
                <QuickActionButtons onQuerySubmit={handleQuerySubmit} />
              </>
            )}

            {step === 'results' && results && (
              <>
                <QueryResultsPreview
                  results={results}
                  onEdit={() => setStep('query')}
                />
                <button
                  onClick={() => setStep('compose')}
                  className="w-full btn-primary"
                >
                  Compose Email
                </button>
              </>
            )}

            {step === 'compose' && results && (
              <EmailComposer
                results={results}
                onBack={() => setStep('results')}
                onSent={onClose}
              />
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">{error}</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
```

### Natural Language Input

```typescript
// components/email-generator/NaturalLanguageInput.tsx

'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';

interface NaturalLanguageInputProps {
  onQuerySubmit: (query: string) => void;
  isProcessing: boolean;
}

export default function NaturalLanguageInput({
  onQuerySubmit,
  isProcessing
}: NaturalLanguageInputProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = () => {
    if (query.trim()) {
      onQuerySubmit(query);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Describe your availability needs:
      </label>
      <textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="e.g., 'Available mornings next week' or 'Find days with full availability in March'"
        rows={3}
        disabled={isProcessing}
      />
      <button
        onClick={handleSubmit}
        disabled={isProcessing || !query.trim()}
        className="w-full btn-primary flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            Processing...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Find Availability
          </>
        )}
      </button>
    </div>
  );
}
```

### Quick Action Buttons

```typescript
// components/email-generator/QuickActionButtons.tsx

'use client';

import { Calendar, Clock, Sun, Moon } from 'lucide-react';

interface QuickActionButtonsProps {
  onQuerySubmit: (query: string) => void;
}

export default function QuickActionButtons({ onQuerySubmit }: QuickActionButtonsProps) {
  const quickActions = [
    {
      label: 'Next Month (Full Days)',
      query: 'Find all days with full availability next month',
      icon: Calendar
    },
    {
      label: 'Morning Slots This Week',
      query: 'Available morning slots this week',
      icon: Sun
    },
    {
      label: 'Afternoon Meetings',
      query: 'Find afternoon meeting slots in the next 2 weeks',
      icon: Clock
    },
    {
      label: 'Evening Availability',
      query: 'Show evening availability for the next 30 days',
      icon: Moon
    }
  ];

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-600">Or choose a quick action:</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              onClick={() => onQuerySubmit(action.query)}
              className="flex items-center gap-2 p-3 bg-white/70 hover:bg-white border border-gray-200 rounded-lg transition text-sm text-left"
            >
              <Icon className="w-4 h-4 text-blue-500" />
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

---

## Implementation Roadmap

### Phase 1: Data Model & Migration (2-3 hours)
- [ ] Create `lib/time-slots.ts` with slot constants
- [ ] Extend `lib/types.ts` with new interfaces
- [ ] Build `lib/migration-service.ts`
- [ ] Update `lib/data/persistence.ts` for version handling
- [ ] Write unit tests for migration

### Phase 2: Query Engine (2-3 hours)
- [ ] Create `lib/query-engine.ts`
- [ ] Implement `findAvailableDays()`
- [ ] Implement `findAvailableSlots()`
- [ ] Implement `suggestMeetingTimes()`
- [ ] Add validation and error handling
- [ ] Write unit tests

### Phase 3: LLM Integration (1-2 hours)
- [ ] Create `app/api/availability/parse-query/route.ts`
- [ ] Add Claude API client
- [ ] Implement fallback parser
- [ ] Test with example queries

### Phase 4: Query Execution API (1 hour)
- [ ] Create `app/api/availability/execute-query/route.ts`
- [ ] Integrate query engine
- [ ] Add error handling
- [ ] Test end-to-end

### Phase 5: UI Components (3-4 hours)
- [ ] Create `NaturalLanguageInput.tsx`
- [ ] Create `QuickActionButtons.tsx`
- [ ] Create `QueryResultsPreview.tsx`
- [ ] Create `EmailComposer.tsx`
- [ ] Create `EmailGeneratorModal.tsx`
- [ ] Apply glassmorphism styling

### Phase 6: Context Integration (1-2 hours)
- [ ] Extend `AvailabilityContext.tsx`
- [ ] Add auto-migration on load
- [ ] Create `useAvailabilityQuery.ts` hook
- [ ] Test with v1 and v2 data

### Phase 7: Email Generation (1-2 hours)
- [ ] Create email template
- [ ] Create send-email API route
- [ ] Generate .ics file
- [ ] Test email flow

### Phase 8: Dashboard Integration (1 hour)
- [ ] Add button to dashboard
- [ ] Wire up modal
- [ ] Add loading states
- [ ] Test full flow

### Phase 9: Testing & Polish (2 hours)
- [ ] Test edge cases
- [ ] Mobile testing
- [ ] Accessibility audit
- [ ] Performance testing
- [ ] Write documentation

**Total**: 14-19 hours

---

## Success Criteria

✅ User can type "Avail for next month" and get all fully available days
✅ User can find 1-hour morning slots
✅ Email generates with .ics attachment
✅ Works on mobile
✅ Existing calendar functionality unchanged
✅ Data migration happens automatically

---

## Environment Variables

```bash
# .env.local
ANTHROPIC_API_KEY=sk-ant-...  # Required for LLM query parsing
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Claude API failure | Fallback pattern-based parser |
| Complex migration | Extensive unit tests, backward compatible |
| Performance issues | Query range limits (90 days max), result pagination |
| Timezone confusion | All dates in user's local timezone |
| Email send failure | Queue system with retry |

---

## Next Steps

1. **Review and Approve Specification**
2. **Set up ANTHROPIC_API_KEY in environment**
3. **Begin Phase 1: Data Model & Migration**
4. **Launch frontend-architect agent for UI implementation**

---

**Document Status**: Ready for Implementation
**Created**: 2025-12-17
**Last Updated**: 2025-12-17
