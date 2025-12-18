// hooks/index.ts

/**
 * Custom React Hooks for Calendar Functionality
 *
 * Re-exports all calendar hooks for convenient importing.
 *
 * Usage:
 * ```typescript
 * import { useCalendar, useDragSelection, useKeyboardNav } from '@/hooks';
 * ```
 */

export { useCalendar } from './useCalendar';
export type { CalendarDay } from '@/lib/utils/dates';

export { useDragSelection } from './useDragSelection';
export type { DragSelection, DragState } from './useDragSelection';

export { useKeyboardNav } from './useKeyboardNav';
export type { KeyboardNavOptions } from './useKeyboardNav';
