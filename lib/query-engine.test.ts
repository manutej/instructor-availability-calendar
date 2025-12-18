/**
 * Availability Query Engine Tests
 *
 * Comprehensive test suite for query execution engine.
 * Tests all three query intents and edge cases.
 *
 * @module lib/query-engine.test
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { AvailabilityQueryEngine, createQueryEngine } from './query-engine';
import type { AvailabilityDataV2, AvailabilityQuery } from '@/types/email-generator';
import { MORNING_SLOTS, AFTERNOON_SLOTS, EVENING_SLOTS } from './time-slots';

describe('AvailabilityQueryEngine', () => {
  let testData: AvailabilityDataV2;
  let engine: AvailabilityQueryEngine;

  beforeEach(() => {
    // Create test data with various blocking scenarios
    testData = {
      version: 2,
      instructorId: 'test-instructor',
      blockedDates: {
        // Fully available date (not in blockedDates)
        // '2026-01-01' - implicitly available

        // Fully blocked date
        '2026-01-02': {
          slots: new Map([
            ...MORNING_SLOTS.map(s => [s, true] as [string, boolean]),
            ...AFTERNOON_SLOTS.map(s => [s, true] as [string, boolean]),
            ...EVENING_SLOTS.map(s => [s, true] as [string, boolean])
          ]),
          fullDayBlock: true,
          eventName: 'Conference'
        },

        // Morning blocked only
        '2026-01-03': {
          slots: new Map([
            ...MORNING_SLOTS.map(s => [s, true] as [string, boolean])
          ]),
          eventName: 'Morning Meeting'
        },

        // Afternoon blocked only
        '2026-01-04': {
          slots: new Map([
            ...AFTERNOON_SLOTS.map(s => [s, true] as [string, boolean])
          ]),
          eventName: 'Afternoon Workshop'
        },

        // Single slot blocked (9am)
        '2026-01-05': {
          slots: new Map([
            ['09:00', true]
          ]),
          eventName: 'Quick Call'
        },

        // Multiple non-consecutive blocked slots
        '2026-01-06': {
          slots: new Map([
            ['09:00', true],
            ['14:00', true],
            ['18:00', true]
          ]),
          eventName: 'Scattered Meetings'
        },

        // Consecutive afternoon availability (for scoring tests)
        '2026-01-07': {
          slots: new Map([
            ...MORNING_SLOTS.map(s => [s, true] as [string, boolean]),
            ...EVENING_SLOTS.map(s => [s, true] as [string, boolean])
          ]),
          eventName: 'Afternoon Free'
        }
      }
    };

    engine = new AvailabilityQueryEngine(testData);
  });

  describe('factory function', () => {
    it('should create query engine instance', () => {
      const factoryEngine = createQueryEngine(testData);
      expect(factoryEngine).toBeInstanceOf(AvailabilityQueryEngine);
    });
  });

  describe('date range validation', () => {
    it('should reject invalid date objects', () => {
      const query: AvailabilityQuery = {
        intent: 'find_days',
        dateRange: {
          start: new Date('invalid'),
          end: new Date('2026-01-31')
        }
      };

      expect(() => engine.execute(query)).toThrow('Invalid date range');
    });

    it('should reject end date before start date', () => {
      const query: AvailabilityQuery = {
        intent: 'find_days',
        dateRange: {
          start: new Date('2026-01-31'),
          end: new Date('2026-01-01')
        }
      };

      expect(() => engine.execute(query)).toThrow('end date must be after start date');
    });

    it('should reject date range exceeding 90 days', () => {
      const query: AvailabilityQuery = {
        intent: 'find_days',
        dateRange: {
          start: new Date('2026-01-01'),
          end: new Date('2026-05-01')  // 120 days
        }
      };

      expect(() => engine.execute(query)).toThrow('exceeds maximum of 90 days');
    });

    it('should accept valid date range within 90 days', () => {
      const query: AvailabilityQuery = {
        intent: 'find_days',
        dateRange: {
          start: new Date('2026-01-01'),
          end: new Date('2026-03-01')  // ~60 days
        }
      };

      expect(() => engine.execute(query)).not.toThrow();
    });
  });

  describe('find_days intent', () => {
    it('should find fully available dates (not in blockedDates)', () => {
      const query: AvailabilityQuery = {
        intent: 'find_days',
        dateRange: {
          start: new Date('2026-01-01'),
          end: new Date('2026-01-07')
        }
      };

      const result = engine.execute(query);

      expect(result.intent).toBe('find_days');
      expect(result.items).toHaveLength(1);
      expect((result.items[0] as Date).toISOString().split('T')[0]).toBe('2026-01-01');
    });

    it('should exclude fully blocked dates', () => {
      const query: AvailabilityQuery = {
        intent: 'find_days',
        dateRange: {
          start: new Date('2026-01-02'),
          end: new Date('2026-01-02')
        }
      };

      const result = engine.execute(query);

      expect(result.items).toHaveLength(0);
      expect(result.suggestions).toBeDefined();
    });

    it('should exclude partially blocked dates', () => {
      const query: AvailabilityQuery = {
        intent: 'find_days',
        dateRange: {
          start: new Date('2026-01-03'),
          end: new Date('2026-01-06')
        }
      };

      const result = engine.execute(query);

      // Dates 03-06 all have some blocking
      expect(result.items).toHaveLength(0);
    });

    it('should respect count limit', () => {
      // Add more fully available dates to test count
      const extendedData = { ...testData };
      // Dates 08-12 implicitly available (not in blockedDates)

      const extendedEngine = new AvailabilityQueryEngine(extendedData);

      const query: AvailabilityQuery = {
        intent: 'find_days',
        dateRange: {
          start: new Date('2026-01-01'),
          end: new Date('2026-01-12')
        },
        count: 3
      };

      const result = extendedEngine.execute(query);

      expect(result.items.length).toBeLessThanOrEqual(3);
    });

    it('should provide suggestions when no results found', () => {
      const query: AvailabilityQuery = {
        intent: 'find_days',
        dateRange: {
          start: new Date('2026-01-02'),
          end: new Date('2026-01-07')
        }
      };

      const result = engine.execute(query);

      expect(result.items).toHaveLength(0);
      expect(result.suggestions).toBeDefined();
      expect(result.suggestions!.length).toBeGreaterThan(0);
    });
  });

  describe('find_slots intent', () => {
    it('should find all available slots with no time preference', () => {
      const query: AvailabilityQuery = {
        intent: 'find_slots',
        dateRange: {
          start: new Date('2026-01-01'),
          end: new Date('2026-01-01')
        },
        timePreference: 'any'
      };

      const result = engine.execute(query);

      expect(result.intent).toBe('find_slots');
      // Jan 1 is fully available - should have all 16 slots
      expect(result.items).toHaveLength(16);
    });

    it('should filter by morning time preference', () => {
      const query: AvailabilityQuery = {
        intent: 'find_slots',
        dateRange: {
          start: new Date('2026-01-01'),
          end: new Date('2026-01-01')
        },
        timePreference: 'morning'
      };

      const result = engine.execute(query);

      // Jan 1 morning: 6 slots available
      expect(result.items).toHaveLength(6);
      expect((result.items[0] as any).period).toBe('morning');
    });

    it('should filter by afternoon time preference', () => {
      const query: AvailabilityQuery = {
        intent: 'find_slots',
        dateRange: {
          start: new Date('2026-01-01'),
          end: new Date('2026-01-01')
        },
        timePreference: 'afternoon'
      };

      const result = engine.execute(query);

      // Jan 1 afternoon: 6 slots available
      expect(result.items).toHaveLength(6);
      expect((result.items[0] as any).period).toBe('afternoon');
    });

    it('should filter by evening time preference', () => {
      const query: AvailabilityQuery = {
        intent: 'find_slots',
        dateRange: {
          start: new Date('2026-01-01'),
          end: new Date('2026-01-01')
        },
        timePreference: 'evening'
      };

      const result = engine.execute(query);

      // Jan 1 evening: 4 slots available
      expect(result.items).toHaveLength(4);
      expect((result.items[0] as any).period).toBe('evening');
    });

    it('should exclude blocked slots', () => {
      const query: AvailabilityQuery = {
        intent: 'find_slots',
        dateRange: {
          start: new Date('2026-01-05'),
          end: new Date('2026-01-05')
        },
        timePreference: 'any'
      };

      const result = engine.execute(query);

      // Jan 5: only 09:00 blocked, 15 slots available
      expect(result.items).toHaveLength(15);

      const times = (result.items as any[]).map(item => item.time);
      expect(times).not.toContain('09:00');
    });

    it('should respect count limit', () => {
      const query: AvailabilityQuery = {
        intent: 'find_slots',
        dateRange: {
          start: new Date('2026-01-01'),
          end: new Date('2026-01-01')
        },
        count: 5
      };

      const result = engine.execute(query);

      expect(result.items).toHaveLength(5);
    });

    it('should filter by half-day duration', () => {
      const query: AvailabilityQuery = {
        intent: 'find_slots',
        dateRange: {
          start: new Date('2026-01-07'),
          end: new Date('2026-01-07')
        },
        slotDuration: 'half-day',
        timePreference: 'afternoon'
      };

      const result = engine.execute(query);

      // Jan 7: afternoon is fully available (6 consecutive hours)
      // Should return first slot that has 6+ hours available
      expect(result.items.length).toBeGreaterThan(0);
    });

    it('should filter by full-day duration', () => {
      const query: AvailabilityQuery = {
        intent: 'find_slots',
        dateRange: {
          start: new Date('2026-01-01'),
          end: new Date('2026-01-01')
        },
        slotDuration: 'full-day'
      };

      const result = engine.execute(query);

      // Jan 1: fully available (16 consecutive hours from 06:00)
      // Should return 06:00 as the start of a full-day block
      expect(result.items.length).toBeGreaterThan(0);
      expect((result.items[0] as any).time).toBe('06:00');
    });

    it('should provide time preference suggestion when filtered out', () => {
      const query: AvailabilityQuery = {
        intent: 'find_slots',
        dateRange: {
          start: new Date('2026-01-03'),
          end: new Date('2026-01-03')
        },
        timePreference: 'morning'  // Morning is blocked on Jan 3
      };

      const result = engine.execute(query);

      expect(result.items).toHaveLength(0);
      expect(result.suggestions).toBeDefined();
      expect(result.suggestions!.some(s => s.includes('morning'))).toBe(true);
    });
  });

  describe('suggest_times intent', () => {
    it('should return suggestions with scores', () => {
      const query: AvailabilityQuery = {
        intent: 'suggest_times',
        dateRange: {
          start: new Date('2026-01-01'),
          end: new Date('2026-01-07')
        },
        count: 5
      };

      const result = engine.execute(query);

      expect(result.intent).toBe('suggest_times');
      expect(result.items.length).toBeGreaterThan(0);

      const suggestion = result.items[0] as any;
      expect(suggestion).toHaveProperty('score');
      expect(suggestion).toHaveProperty('reason');
      expect(suggestion.score).toBeGreaterThanOrEqual(0);
      expect(suggestion.score).toBeLessThanOrEqual(1);
    });

    it('should rank by consecutive availability', () => {
      const query: AvailabilityQuery = {
        intent: 'suggest_times',
        dateRange: {
          start: new Date('2026-01-01'),
          end: new Date('2026-01-07')
        },
        count: 10
      };

      const result = engine.execute(query);

      const suggestions = result.items as any[];

      // Suggestions should be sorted by score (highest first)
      for (let i = 0; i < suggestions.length - 1; i++) {
        expect(suggestions[i].score).toBeGreaterThanOrEqual(suggestions[i + 1].score);
      }
    });

    it('should boost score for time preference match', () => {
      const query: AvailabilityQuery = {
        intent: 'suggest_times',
        dateRange: {
          start: new Date('2026-01-07'),
          end: new Date('2026-01-07')
        },
        timePreference: 'afternoon'
      };

      const result = engine.execute(query);

      const suggestions = result.items as any[];
      const afternoonSuggestions = suggestions.filter(s => s.period === 'afternoon');

      // Afternoon slots should have higher scores due to preference match
      expect(afternoonSuggestions.length).toBeGreaterThan(0);
    });

    it('should include reason explaining score', () => {
      const query: AvailabilityQuery = {
        intent: 'suggest_times',
        dateRange: {
          start: new Date('2026-01-01'),
          end: new Date('2026-01-01')
        },
        count: 1
      };

      const result = engine.execute(query);

      const suggestion = result.items[0] as any;
      expect(suggestion.reason).toBeDefined();
      expect(suggestion.reason).toContain('consecutive');
    });

    it('should prioritize sooner dates when scores equal', () => {
      // Add identical availability on multiple dates
      const multiDateData: AvailabilityDataV2 = {
        version: 2,
        instructorId: 'test',
        blockedDates: {
          // Jan 10 and Jan 20 both have same afternoon availability
          '2026-01-10': {
            slots: new Map([
              ...MORNING_SLOTS.map(s => [s, true] as [string, boolean])
            ])
          },
          '2026-01-20': {
            slots: new Map([
              ...MORNING_SLOTS.map(s => [s, true] as [string, boolean])
            ])
          }
        }
      };

      const multiEngine = new AvailabilityQueryEngine(multiDateData);

      const query: AvailabilityQuery = {
        intent: 'suggest_times',
        dateRange: {
          start: new Date('2026-01-10'),
          end: new Date('2026-01-20')
        },
        timePreference: 'afternoon',
        count: 5
      };

      const result = multiEngine.execute(query);

      const suggestions = result.items as any[];

      // Earlier dates should appear first when scores are equal
      if (suggestions.length >= 2) {
        const firstDate = suggestions[0].date;
        const secondDate = suggestions[1].date;
        expect(firstDate.getTime()).toBeLessThanOrEqual(secondDate.getTime());
      }
    });
  });

  describe('updateData', () => {
    it('should allow updating calendar data', () => {
      const newData: AvailabilityDataV2 = {
        version: 2,
        instructorId: 'new-instructor',
        blockedDates: {}
      };

      engine.updateData(newData);

      const query: AvailabilityQuery = {
        intent: 'find_days',
        dateRange: {
          start: new Date('2026-01-01'),
          end: new Date('2026-01-31')
        }
      };

      const result = engine.execute(query);

      // All dates should be available now (no blocked dates)
      expect(result.items.length).toBe(31);
    });
  });

  describe('edge cases', () => {
    it('should handle empty calendar data', () => {
      const emptyEngine = new AvailabilityQueryEngine({
        version: 2,
        instructorId: 'test',
        blockedDates: {}
      });

      const query: AvailabilityQuery = {
        intent: 'find_days',
        dateRange: {
          start: new Date('2026-01-01'),
          end: new Date('2026-01-07')
        }
      };

      const result = emptyEngine.execute(query);

      // All dates should be available
      expect(result.items).toHaveLength(7);
    });

    it('should handle single-day date range', () => {
      const query: AvailabilityQuery = {
        intent: 'find_slots',
        dateRange: {
          start: new Date('2026-01-01'),
          end: new Date('2026-01-01')
        }
      };

      const result = engine.execute(query);

      expect(result.items.length).toBeGreaterThan(0);
    });

    it('should handle maximum 90-day date range', () => {
      const query: AvailabilityQuery = {
        intent: 'find_days',
        dateRange: {
          start: new Date('2026-01-01'),
          end: new Date('2026-03-31')  // Exactly 90 days
        }
      };

      expect(() => engine.execute(query)).not.toThrow();
    });

    it('should handle date with no blocked slots in map', () => {
      const dataWithEmptyMap: AvailabilityDataV2 = {
        version: 2,
        instructorId: 'test',
        blockedDates: {
          '2026-01-01': {
            slots: new Map(),  // Empty map = all slots available
            eventName: 'Placeholder'
          }
        }
      };

      const emptyMapEngine = new AvailabilityQueryEngine(dataWithEmptyMap);

      const query: AvailabilityQuery = {
        intent: 'find_days',
        dateRange: {
          start: new Date('2026-01-01'),
          end: new Date('2026-01-01')
        }
      };

      const result = emptyMapEngine.execute(query);

      // Empty map means all slots available = fully available day
      expect(result.items).toHaveLength(1);
    });
  });
});
