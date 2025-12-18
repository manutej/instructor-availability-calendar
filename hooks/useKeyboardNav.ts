// hooks/useKeyboardNav.ts
import { useCallback, useEffect } from 'react';

/**
 * Keyboard navigation options
 */
export interface KeyboardNavOptions {
  onNavigate: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onSelect: () => void;
  onCancel: () => void;
  enabled?: boolean;
}

/**
 * useKeyboardNav Hook
 *
 * Purpose: Navigate calendar with arrow keys
 *
 * Features:
 * - Arrow keys: Navigate between days (left/right = ±1 day, up/down = ±7 days)
 * - Space/Enter: Toggle block on focused date
 * - Escape: Clear focus or cancel drag
 * - Global window event listeners
 * - Automatic cleanup on unmount
 *
 * Pattern: Keyboard event handling with focus management
 *
 * Usage:
 * ```tsx
 * const [focusedDate, setFocusedDate] = useState<Date>(new Date());
 *
 * useKeyboardNav({
 *   onNavigate: (direction) => {
 *     setFocusedDate(prev => {
 *       const next = new Date(prev);
 *       switch (direction) {
 *         case 'left': return getPreviousDay(next);
 *         case 'right': return getNextDay(next);
 *         case 'up': return getPreviousWeek(next);
 *         case 'down': return getNextWeek(next);
 *       }
 *     });
 *   },
 *   onSelect: () => blockDate(focusedDate),
 *   onCancel: () => cancelDrag(),
 *   enabled: true,
 * });
 * ```
 */
export function useKeyboardNav({
  onNavigate,
  onSelect,
  onCancel,
  enabled = true,
}: KeyboardNavOptions) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault(); // Prevent page scroll
        onNavigate('up');
        break;
      case 'ArrowDown':
        e.preventDefault();
        onNavigate('down');
        break;
      case 'ArrowLeft':
        e.preventDefault();
        onNavigate('left');
        break;
      case 'ArrowRight':
        e.preventDefault();
        onNavigate('right');
        break;
      case ' ':
      case 'Enter':
        e.preventDefault();
        onSelect();
        break;
      case 'Escape':
        e.preventDefault();
        onCancel();
        break;
    }
  }, [enabled, onNavigate, onSelect, onCancel]);

  // Global keydown listener with cleanup
  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, handleKeyDown]);
}

/**
 * Key Patterns:
 * - ✅ useEffect cleanup: Removes event listener on unmount
 * - ✅ e.preventDefault(): Stops default scrolling behavior
 * - ✅ Conditional subscription: Only listens when enabled={true}
 * - ✅ useCallback: Stable handleKeyDown reference
 *
 * Accessibility:
 * - Supports full keyboard navigation
 * - Prevents default browser scrolling
 * - Works with screen readers (when combined with ARIA labels)
 *
 * Performance:
 * - Single global listener (not per-cell)
 * - Cleanup on unmount prevents memory leaks
 * - O(1) event handling
 */
