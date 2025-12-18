/**
 * Legend Component
 *
 * Visual guide showing calendar state colors with actual gradient samples.
 *
 * @module components/calendar/Legend
 * @see docs/UI-IMPROVEMENT-SPEC.md Lines 498-546 for specification
 *
 * Design Features:
 * - Gradient background container
 * - Visual color samples matching DayCell states
 * - Responsive grid layout (2 cols mobile, 4 cols desktop)
 * - Clear labeling for accessibility
 *
 * States Displayed:
 * - Available: White/glassmorphism background
 * - AM Blocked: Yellow/amber gradient (tentative state)
 * - PM Blocked: Blue/indigo gradient (busy state)
 * - Full Day: Red gradient with diagonal stripes
 */

'use client';

import { cn } from '@/lib/utils';
import { borderRadius } from '@/lib/design-tokens';

export default function Legend() {
  const legendItems = [
    {
      id: 'available',
      label: 'Available',
      colorClass: 'bg-white/80 backdrop-blur-sm border border-gray-200 shadow-sm',
    },
    {
      id: 'am-blocked',
      label: 'AM Blocked',
      colorClass: 'bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-50 border-2 border-amber-400/50 shadow-sm',
    },
    {
      id: 'pm-blocked',
      label: 'PM Blocked',
      colorClass: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 border border-blue-300/50 shadow-sm',
    },
    {
      id: 'full-day',
      label: 'Full Day',
      colorClass: 'bg-gradient-to-br from-red-50 via-red-100 to-red-50 border-2 border-red-300 shadow-sm relative before:absolute before:inset-0 before:bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(239,68,68,0.1)_10px,rgba(239,68,68,0.1)_20px)] before:rounded-md',
    },
  ];

  return (
    <div
      className={cn(
        'mt-6 p-4',
        borderRadius.xl,
        'bg-gradient-to-r from-gray-50 to-blue-50/30',
        'border border-gray-200'
      )}
    >
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Legend</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {legendItems.map((item) => (
          <div key={item.id} className="flex items-center gap-2">
            {/* Visual color sample */}
            <div
              className={cn(
                'w-8 h-8',
                borderRadius.md,
                item.colorClass
              )}
              aria-hidden="true"
            />

            {/* Label */}
            <span className="text-sm text-gray-600">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
