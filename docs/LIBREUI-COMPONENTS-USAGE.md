# LibreUIUX Components - Usage Guide

Production-ready calendar components with WCAG 2.1 AA compliance.

---

## CalendarToolbar

### Basic Usage

```typescript
import CalendarToolbar from '@/components/calendar/CalendarToolbar';
import { useState } from 'react';
import { addMonths, subMonths } from 'date-fns';

function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const handlePrevMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  return (
    <div>
      <CalendarToolbar
        currentMonth={currentMonth}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
      />
      {/* Calendar grid here */}
    </div>
  );
}
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `currentMonth` | `Date` | ✅ | The current month being displayed |
| `onPrevMonth` | `() => void` | ✅ | Handler for navigating to previous month |
| `onNextMonth` | `() => void` | ✅ | Handler for navigating to next month |
| `className` | `string` | ❌ | Optional CSS classes for styling |

### Design Specifications

**Layout**:
- Mobile: Vertical stacking (`flex-col`)
- Desktop: Horizontal layout (`sm:flex-row`)
- Gap: 16px (1rem)

**Typography**:
- Mobile: 20px (`text-xl`)
- Small: 24px (`sm:text-2xl`)
- Medium: 30px (`md:text-3xl`)
- Weight: Bold (700)
- Tracking: Tight (-0.025em)

**Navigation Buttons**:
- Size: 36×36px (mobile), 40×40px (desktop)
- Padding: 8px internal
- Icons: 20×20px (Lucide ChevronLeft/Right)

### Accessibility Features

✅ **Screen Reader Support**:
- Month changes announced via `aria-live="polite"`
- Descriptive button labels with month names
- Navigation landmark with `role="navigation"`

✅ **Keyboard Navigation**:
- Tab to focus buttons
- Enter/Space to activate
- Clear focus indicators

✅ **Touch Targets**:
- Minimum 36px (exceeds WCAG 2.5.5)
- Desktop enhanced to 40px

### Example: Custom Styling

```typescript
<CalendarToolbar
  currentMonth={currentMonth}
  onPrevMonth={handlePrevMonth}
  onNextMonth={handleNextMonth}
  className="bg-white shadow-lg rounded-lg"
/>
```

---

## TimeSlotGrid

### Basic Usage

```typescript
import TimeSlotGrid from '@/components/calendar/TimeSlotGrid';
import { useState } from 'react';

function DayView() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | undefined>();

  const handleSlotClick = (slot: TimeSlot) => {
    setSelectedSlot(slot.id);
    console.log('Selected:', slot.time, slot.date);
  };

  return (
    <TimeSlotGrid
      selectedDate={selectedDate}
      onSlotClick={handleSlotClick}
      selectedSlotId={selectedSlot}
    />
  );
}
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `selectedDate` | `Date` | ✅ | The date to display time slots for |
| `onSlotClick` | `(slot: TimeSlot) => void` | ❌ | Handler when a time slot is clicked |
| `selectedSlotId` | `string` | ❌ | Currently selected time slot ID (ISO string) |
| `className` | `string` | ❌ | Optional CSS classes for styling |

### TimeSlot Type

```typescript
interface TimeSlot {
  id: string;        // ISO string (e.g., "2025-12-17T14:00:00.000Z")
  time: string;      // Display time (e.g., "6:00 AM")
  date: Date;        // Full Date object for the slot
}
```

### Time Slot Configuration

```typescript
import { TIME_SLOT_CONFIG } from '@/components/calendar/TimeSlotGrid';

console.log(TIME_SLOT_CONFIG);
// {
//   START_HOUR: 6,      // 6:00 AM
//   END_HOUR: 22,       // 10:00 PM (exclusive)
//   SLOT_COUNT: 16,     // Exactly 16 slots
//   SLOT_DURATION: 1,   // 1 hour per slot
//   MIN_HEIGHT_PX: 60,  // 60px minimum
//   MIN_HEIGHT_MD_PX: 72 // 72px on medium+
// }
```

### Design Specifications

**Time Labels**:
- Width: 64px (mobile), 80px (desktop)
- Font: 12px (mobile), 14px (small+)
- Font variant: `tabular-nums` for alignment
- Alignment: Right-aligned, 16px padding-right

**Time Slots**:
- Height: 60px minimum (mobile), 72px (desktop)
- Border: Left border with hover state
- Selected state: Blue background with 2px left border
- Interactive: Cursor pointer when clickable

**Grid Structure**:
- 16 rows (6:00 AM to 10:00 PM)
- 2 columns (time label + slot)
- Semantic grid with ARIA roles

### Accessibility Features

✅ **Grid Semantics**:
- `role="grid"` on container
- `role="row"` on each time slot row
- `role="rowheader"` on time labels
- `role="gridcell"` on interactive slots

✅ **Keyboard Navigation**:
- Tab to focus slots
- Enter/Space to select slot
- Clear focus indicators
- `tabIndex` management (0 when clickable, -1 otherwise)

✅ **Screen Reader Support**:
- Descriptive labels: "Time slot 2:00 PM, available"
- Selection state: `aria-selected` attribute
- Status messages: "Showing 16 time slots from 6:00 AM to 10:00 PM"

✅ **Touch Targets**:
- All slots 60px+ height (exceeds WCAG 2.5.5)

### Example: Read-Only Display

```typescript
<TimeSlotGrid
  selectedDate={new Date()}
  // No onSlotClick - read-only mode
  className="border rounded-lg"
/>
```

### Example: With Selection and Events

```typescript
import TimeSlotGrid, { TIME_SLOT_CONFIG } from '@/components/calendar/TimeSlotGrid';

function AppointmentScheduler() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string>();
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set());

  const handleSlotClick = (slot: TimeSlot) => {
    if (bookedSlots.has(slot.id)) {
      alert('This time slot is already booked');
      return;
    }
    setSelectedSlot(slot.id);
  };

  return (
    <div>
      <h1>Schedule Appointment</h1>
      <p>Select a time slot for {format(selectedDate, 'MMMM d, yyyy')}</p>

      <TimeSlotGrid
        selectedDate={selectedDate}
        onSlotClick={handleSlotClick}
        selectedSlotId={selectedSlot}
      />

      {selectedSlot && (
        <button onClick={() => bookAppointment(selectedSlot)}>
          Confirm Booking
        </button>
      )}
    </div>
  );
}
```

---

## Integration Example

### Full Calendar with Both Components

```typescript
'use client';

import { useState } from 'react';
import { addMonths, subMonths, format } from 'date-fns';
import CalendarToolbar from '@/components/calendar/CalendarToolbar';
import TimeSlotGrid from '@/components/calendar/TimeSlotGrid';

export default function CalendarApp() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string>();

  const handlePrevMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  const handleSlotClick = (slot: TimeSlot) => {
    setSelectedSlot(slot.id);
    console.log('Appointment selected:', {
      date: format(slot.date, 'MMM d, yyyy'),
      time: slot.time
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <CalendarToolbar
        currentMonth={currentMonth}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
      />

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">
          Time Slots for {format(selectedDate, 'EEEE, MMMM d, yyyy')}
        </h3>

        <TimeSlotGrid
          selectedDate={selectedDate}
          onSlotClick={handleSlotClick}
          selectedSlotId={selectedSlot}
        />
      </div>

      {selectedSlot && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-900">
            Selected time slot ready for booking
          </p>
        </div>
      )}
    </div>
  );
}
```

---

## Styling Customization

### Tailwind CSS Classes

Both components use standard Tailwind classes and can be customized:

```typescript
// Dark mode support (built-in)
<CalendarToolbar
  className="dark:bg-gray-900 dark:border-gray-700"
/>

<TimeSlotGrid
  className="dark:bg-gray-800"
/>

// Custom borders and shadows
<CalendarToolbar
  className="border-2 border-blue-200 shadow-xl"
/>

// Responsive padding
<TimeSlotGrid
  className="px-0 md:px-4"
/>
```

### Custom Theme Colors

```typescript
// Override button colors
<CalendarToolbar
  className="[&_button]:bg-purple-500 [&_button]:hover:bg-purple-600"
/>

// Override selected slot color
<TimeSlotGrid
  className="[&_[aria-selected='true']]:bg-green-50"
/>
```

---

## Testing

### Unit Tests

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import CalendarToolbar from './CalendarToolbar';
import TimeSlotGrid from './TimeSlotGrid';

describe('CalendarToolbar', () => {
  it('should render month name', () => {
    const currentMonth = new Date(2025, 0, 1); // Jan 2025
    render(
      <CalendarToolbar
        currentMonth={currentMonth}
        onPrevMonth={() => {}}
        onNextMonth={() => {}}
      />
    );
    expect(screen.getByText('January 2025')).toBeInTheDocument();
  });

  it('should call onNextMonth when clicking next button', () => {
    const onNextMonth = jest.fn();
    render(
      <CalendarToolbar
        currentMonth={new Date()}
        onPrevMonth={() => {}}
        onNextMonth={onNextMonth}
      />
    );
    fireEvent.click(screen.getByLabelText(/Navigate to next month/));
    expect(onNextMonth).toHaveBeenCalled();
  });
});

describe('TimeSlotGrid', () => {
  it('should render exactly 16 time slots', () => {
    render(<TimeSlotGrid selectedDate={new Date()} />);
    const slots = screen.getAllByRole('gridcell');
    expect(slots).toHaveLength(16);
  });

  it('should start at 6:00 AM', () => {
    render(<TimeSlotGrid selectedDate={new Date()} />);
    expect(screen.getByText('6:00 AM')).toBeInTheDocument();
  });

  it('should call onSlotClick when clicking a slot', () => {
    const onSlotClick = jest.fn();
    render(
      <TimeSlotGrid
        selectedDate={new Date()}
        onSlotClick={onSlotClick}
      />
    );
    const firstSlot = screen.getAllByRole('gridcell')[0];
    fireEvent.click(firstSlot);
    expect(onSlotClick).toHaveBeenCalled();
  });
});
```

### Accessibility Tests

```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

it('should have no accessibility violations', async () => {
  const { container } = render(
    <CalendarToolbar
      currentMonth={new Date()}
      onPrevMonth={() => {}}
      onNextMonth={() => {}}
    />
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

---

## Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ iOS Safari 14+
- ✅ Android Chrome 90+

---

## Performance Tips

1. **Memoize handlers**: Use `useCallback` for `onPrevMonth`, `onNextMonth`, `onSlotClick`
2. **Stable date references**: Avoid creating new Date objects on every render
3. **Conditional rendering**: Only render TimeSlotGrid when needed
4. **Virtual scrolling**: For very large time ranges, consider virtualization

---

## Common Patterns

### Pattern 1: Month-Day-Time Selection Flow

```typescript
function CalendarWizard() {
  const [step, setStep] = useState<'month' | 'day' | 'time'>('month');
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();

  return (
    <div>
      {step === 'month' && (
        <CalendarToolbar
          currentMonth={selectedMonth}
          onPrevMonth={() => setSelectedMonth(prev => subMonths(prev, 1))}
          onNextMonth={() => setSelectedMonth(prev => addMonths(prev, 1))}
        />
      )}

      {step === 'time' && selectedDay && (
        <TimeSlotGrid
          selectedDate={selectedDay}
          onSlotClick={(slot) => {
            setSelectedTime(slot.id);
            setStep('confirm');
          }}
        />
      )}
    </div>
  );
}
```

### Pattern 2: Availability Checking

```typescript
function AvailabilityCalendar() {
  const [availableSlots, setAvailableSlots] = useState<Set<string>>(new Set());

  const isSlotAvailable = (slotId: string) => availableSlots.has(slotId);

  return (
    <TimeSlotGrid
      selectedDate={new Date()}
      onSlotClick={(slot) => {
        if (!isSlotAvailable(slot.id)) {
          alert('This time slot is not available');
        }
      }}
      className={cn(
        '[&_[role=gridcell]:not([aria-selected])]:opacity-50',
        '[&_[data-available=false]]:cursor-not-allowed'
      )}
    />
  );
}
```

---

## Troubleshooting

### Issue: Buttons not responding

**Solution**: Ensure handlers are defined and not undefined:
```typescript
const handlePrevMonth = () => setCurrentMonth(prev => subMonths(prev, 1));
// NOT: const handlePrevMonth = undefined;
```

### Issue: Time slots not clickable

**Solution**: Provide `onSlotClick` prop:
```typescript
<TimeSlotGrid
  selectedDate={date}
  onSlotClick={(slot) => console.log(slot)} // Required for interaction
/>
```

### Issue: Dark mode colors not working

**Solution**: Ensure dark mode is configured in Tailwind and parent has `dark` class:
```typescript
<html className="dark">
  <CalendarToolbar ... />
</html>
```

---

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Grid Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/grid/)
- [date-fns Documentation](https://date-fns.org/)
- [shadcn/ui Button](https://ui.shadcn.com/docs/components/button)

---

**Last Updated**: 2025-12-17
