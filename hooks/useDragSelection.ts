// hooks/useDragSelection.ts
import { useState, useCallback, useRef, useEffect } from 'react';
import { isInRange } from '@/lib/utils/dates';

/**
 * Drag selection state machine
 */
export type DragState = 'idle' | 'dragging';

/**
 * Drag selection data
 */
export interface DragSelection {
  startDate: Date | null;
  endDate: Date | null;
  state: DragState;
}

/**
 * useDragSelection Hook
 *
 * Purpose: Handle drag-to-select date ranges
 *
 * Features:
 * - Mouse down to start drag
 * - Mouse enter to extend selection
 * - Mouse up to finalize (global handler)
 * - Escape key to cancel
 * - Selection range preview
 *
 * Pattern: State machine for drag interactions
 *
 * Usage:
 * ```tsx
 * const { handleDragStart, handleDragMove, isDateInSelection } = useDragSelection(
 *   (start, end) => blockDateRange(start, end)
 * );
 *
 * <div
 *   onMouseDown={(e) => {
 *     e.preventDefault();
 *     handleDragStart(date);
 *   }}
 *   onMouseEnter={() => handleDragMove(date)}
 *   className={isDateInSelection(date) ? 'selected' : ''}
 * >
 *   {date.getDate()}
 * </div>
 * ```
 */
export function useDragSelection(
  onRangeComplete?: (start: Date, end: Date) => void
) {
  const [selection, setSelection] = useState<DragSelection>({
    startDate: null,
    endDate: null,
    state: 'idle',
  });

  // useRef for mutable state that doesn't trigger re-renders
  const dragStartRef = useRef<Date | null>(null);

  // Start drag selection
  const handleDragStart = useCallback((date: Date) => {
    dragStartRef.current = date;
    setSelection({
      startDate: date,
      endDate: date,
      state: 'dragging',
    });
  }, []);

  // Update drag selection as mouse moves over cells
  const handleDragMove = useCallback((date: Date) => {
    if (dragStartRef.current) {
      setSelection(prev => ({
        ...prev,
        endDate: date,
      }));
    }
  }, []);

  // Complete drag selection
  const handleDragEnd = useCallback(() => {
    if (selection.startDate && selection.endDate && onRangeComplete) {
      // Ensure start <= end
      const [start, end] = [selection.startDate, selection.endDate].sort(
        (a, b) => a.getTime() - b.getTime()
      );
      onRangeComplete(start, end);
    }

    // Reset state
    dragStartRef.current = null;
    setSelection({
      startDate: null,
      endDate: null,
      state: 'idle',
    });
  }, [selection.startDate, selection.endDate, onRangeComplete]);

  // Cancel drag (e.g., on Escape key)
  const cancelDrag = useCallback(() => {
    dragStartRef.current = null;
    setSelection({
      startDate: null,
      endDate: null,
      state: 'idle',
    });
  }, []);

  // Check if a date is in current selection
  const isDateInSelection = useCallback((date: Date): boolean => {
    if (!selection.startDate || !selection.endDate) return false;

    // Use Layer 0 utility for range checking
    const start = selection.startDate.getTime() < selection.endDate.getTime()
      ? selection.startDate
      : selection.endDate;
    const end = selection.startDate.getTime() < selection.endDate.getTime()
      ? selection.endDate
      : selection.startDate;

    return isInRange(date, start, end);
  }, [selection.startDate, selection.endDate]);

  // Global mouse up handler - completes drag even if mouse leaves grid
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (selection.state === 'dragging') {
        handleDragEnd();
      }
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [selection.state, handleDragEnd]);

  // Escape key handler - cancel drag
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selection.state === 'dragging') {
        cancelDrag();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [selection.state, cancelDrag]);

  return {
    selection,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    cancelDrag,
    isDateInSelection,
  };
}

/**
 * Key Patterns:
 * - ✅ useRef for mutable state: dragStartRef doesn't trigger re-renders
 * - ✅ State machine: Explicit 'idle' | 'dragging' states
 * - ✅ Event prevention: e.preventDefault() stops text selection during drag
 * - ✅ Global event listeners: Cleanup on unmount via useEffect
 * - ✅ Layer 0 utilities: Uses isInRange() from dates.ts
 *
 * Performance:
 * - O(1) selection state updates
 * - Minimal re-renders (only when selection bounds change)
 */
