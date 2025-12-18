/**
 * AvailabilityContext Tests
 *
 * Tests for half-day blocking logic and localStorage sync.
 *
 * Test Coverage:
 * - ✅ Half-day blocking transitions
 * - ✅ Full day blocking
 * - ✅ Unblocking logic
 * - ✅ Date range blocking
 */

import { renderHook, act } from '@testing-library/react';
import { ReactNode } from 'react';
import { AvailabilityProvider, useAvailability } from '../AvailabilityContext';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Test wrapper
const wrapper = ({ children }: { children: ReactNode }) => (
  <AvailabilityProvider>{children}</AvailabilityProvider>
);

describe('AvailabilityContext', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('Half-day blocking logic', () => {
    it('blocks AM only', () => {
      const { result } = renderHook(() => useAvailability(), { wrapper });
      const testDate = new Date('2026-01-15');

      act(() => {
        result.current.setHalfDayBlock(testDate, 'AM', true);
      });

      const blocked = result.current.blockedDates.get('2026-01-15');
      expect(blocked?.status).toBe('am');
    });

    it('blocks PM only', () => {
      const { result } = renderHook(() => useAvailability(), { wrapper });
      const testDate = new Date('2026-01-15');

      act(() => {
        result.current.setHalfDayBlock(testDate, 'PM', true);
      });

      const blocked = result.current.blockedDates.get('2026-01-15');
      expect(blocked?.status).toBe('pm');
    });

    it('blocking both halves creates full day block', () => {
      const { result } = renderHook(() => useAvailability(), { wrapper });
      const testDate = new Date('2026-01-15');

      act(() => {
        result.current.setHalfDayBlock(testDate, 'AM', true);
      });

      expect(result.current.blockedDates.get('2026-01-15')?.status).toBe('am');

      act(() => {
        result.current.setHalfDayBlock(testDate, 'PM', true);
      });

      // Should be 'full' now
      expect(result.current.blockedDates.get('2026-01-15')?.status).toBe('full');
    });

    it('unblocking AM from full day keeps PM blocked', () => {
      const { result } = renderHook(() => useAvailability(), { wrapper });
      const testDate = new Date('2026-01-15');

      act(() => {
        result.current.blockDate(testDate); // Full day
      });

      expect(result.current.blockedDates.get('2026-01-15')?.status).toBe('full');

      act(() => {
        result.current.setHalfDayBlock(testDate, 'AM', false);
      });

      // Should keep PM blocked
      expect(result.current.blockedDates.get('2026-01-15')?.status).toBe('pm');
    });

    it('unblocking PM from full day keeps AM blocked', () => {
      const { result } = renderHook(() => useAvailability(), { wrapper });
      const testDate = new Date('2026-01-15');

      act(() => {
        result.current.blockDate(testDate); // Full day
      });

      act(() => {
        result.current.setHalfDayBlock(testDate, 'PM', false);
      });

      // Should keep AM blocked
      expect(result.current.blockedDates.get('2026-01-15')?.status).toBe('am');
    });

    it('unblocking single half-day removes block entirely', () => {
      const { result } = renderHook(() => useAvailability(), { wrapper });
      const testDate = new Date('2026-01-15');

      act(() => {
        result.current.setHalfDayBlock(testDate, 'AM', true);
      });

      expect(result.current.blockedDates.has('2026-01-15')).toBe(true);

      act(() => {
        result.current.setHalfDayBlock(testDate, 'AM', false);
      });

      // Should be removed
      expect(result.current.blockedDates.has('2026-01-15')).toBe(false);
    });
  });

  describe('Full day blocking', () => {
    it('blocks full day', () => {
      const { result } = renderHook(() => useAvailability(), { wrapper });
      const testDate = new Date('2026-01-15');

      act(() => {
        result.current.blockDate(testDate);
      });

      expect(result.current.blockedDates.get('2026-01-15')?.status).toBe('full');
    });

    it('unblocks date', () => {
      const { result } = renderHook(() => useAvailability(), { wrapper });
      const testDate = new Date('2026-01-15');

      act(() => {
        result.current.blockDate(testDate);
        result.current.unblockDate(testDate);
      });

      expect(result.current.blockedDates.has('2026-01-15')).toBe(false);
    });
  });

  describe('Date range blocking', () => {
    it('blocks date range inclusive', () => {
      const { result } = renderHook(() => useAvailability(), { wrapper });
      const start = new Date('2026-01-15');
      const end = new Date('2026-01-17');

      act(() => {
        result.current.blockDateRange(start, end);
      });

      // Should block all 3 days
      expect(result.current.blockedDates.has('2026-01-15')).toBe(true);
      expect(result.current.blockedDates.has('2026-01-16')).toBe(true);
      expect(result.current.blockedDates.has('2026-01-17')).toBe(true);
      expect(result.current.blockedDates.size).toBe(3);
    });
  });

  describe('Clear all', () => {
    it('clears all blocked dates', () => {
      const { result } = renderHook(() => useAvailability(), { wrapper });

      act(() => {
        result.current.blockDate(new Date('2026-01-15'));
        result.current.blockDate(new Date('2026-01-16'));
      });

      expect(result.current.blockedDates.size).toBe(2);

      act(() => {
        result.current.clearAll();
      });

      expect(result.current.blockedDates.size).toBe(0);
    });
  });
});
