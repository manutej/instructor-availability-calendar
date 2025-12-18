# Calendar UI Quick Reference

**Date**: 2025-12-16
**Purpose**: Quick reference for developers working with the new glassmorphic UI

---

## Design Token Usage

### Import Tokens
```tsx
import {
  glassmorphicCard,
  borderRadius,
  colors,
  shadows,
  staggerVariants,
  cellVariants
} from '@/lib/design-tokens';
```

### Common Patterns

**Glassmorphic Card**:
```tsx
<div className={cn(glassmorphicCard, borderRadius['2xl'], 'p-6')}>
  {/* Content */}
</div>
```

**Responsive Padding**:
```tsx
<div className="p-4 sm:p-6 lg:p-8">
  {/* Mobile → Tablet → Desktop */}
</div>
```

**Responsive Gaps**:
```tsx
<div className="grid grid-cols-7 gap-1 md:gap-2 lg:gap-3">
  {/* Progressive gap increase */}
</div>
```

---

## Animation Patterns

### Scale on Hover (Interactive Elements)
```tsx
import { motion } from 'framer-motion';

<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  transition={{ duration: 0.2 }}
>
  {/* Content */}
</motion.button>
```

### Fade-in Overlay
```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
  className="absolute inset-0"
>
  {/* Overlay content */}
</motion.div>
```

### Stagger Children Animation
```tsx
import { staggerVariants, cellVariants } from '@/lib/design-tokens';

<motion.div
  variants={staggerVariants}
  initial="hidden"
  animate="show"
>
  {items.map((item) => (
    <motion.div key={item.id} variants={cellVariants}>
      {/* Child content */}
    </motion.div>
  ))}
</motion.div>
```

### Slide Transition (Month Navigation)
```tsx
import { AnimatePresence } from 'framer-motion';

const [direction, setDirection] = useState(0);

<AnimatePresence mode="wait" custom={direction}>
  <motion.h2
    key={currentMonth.toISOString()}
    custom={direction}
    initial={{ opacity: 0, x: direction > 0 ? 20 : -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: direction > 0 ? -20 : 20 }}
    transition={{ duration: 0.2 }}
  >
    {format(currentMonth, 'MMMM yyyy')}
  </motion.h2>
</AnimatePresence>
```

---

## Component Quick Reference

### CalendarView (Main Container)
**Location**: `/components/calendar/CalendarView.tsx`
**Key Features**:
- Ambient gradient background
- Glassmorphic card container
- Responsive padding system
- Integrates Legend component

**Usage**:
```tsx
// Private calendar (editable)
<CalendarView />

// Public calendar (read-only)
<CalendarView editable={false} />
```

---

### CalendarToolbar (Header)
**Location**: `/components/calendar/CalendarToolbar.tsx`
**Key Features**:
- Glassmorphic header container
- Circular navigation buttons with hover scale
- Month name slide transition
- Save indicator with animations

**Props**:
```tsx
interface CalendarToolbarProps {
  currentMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  onRefresh?: () => void;
  isLoading?: boolean;
  isSaving?: boolean;
  lastSaved?: Date | null;
}
```

---

### CalendarGrid (Date Grid)
**Location**: `/components/calendar/CalendarGrid.tsx`
**Key Features**:
- Progressive gap sizing (gap-1 → gap-2 → gap-3)
- Stagger animations on mount/month change
- Uppercase day headers with tracking
- Motion.div wrapper for coordinated animations

**Props**:
```tsx
interface CalendarGridProps {
  calendarWeeks: CalendarDay[][];
  currentMonth: Date;
  editable?: boolean;
}
```

---

### DayCell (Individual Date)
**Location**: `/components/calendar/DayCell.tsx`
**Key Features**:
- Glassmorphic base with backdrop blur
- Hover scale animation
- Gradient overlays for blocked states
- Half-day indicator dots
- Today ring indicator
- Aspect-square for consistent sizing

**Props**:
```tsx
interface DayCellProps {
  day: CalendarDay;
  editable?: boolean;
}
```

**Visual States**:
- Available: `bg-white/40 backdrop-blur-sm`
- Blocked AM: `bg-gradient-to-b from-orange-500/80 to-transparent`
- Blocked PM: `bg-gradient-to-t from-purple-500/80 to-transparent`
- Blocked Full: `bg-gradient-to-br from-red-500/80 to-orange-500/80`
- Today: `ring-2 ring-blue-500 ring-offset-2`

---

### Legend (Visual Guide)
**Location**: `/components/calendar/Legend.tsx`
**Key Features**:
- Visual color samples matching DayCell states
- Responsive grid (2 cols mobile, 4 cols desktop)
- Gradient background container

**Legend Items**:
1. Available (white background)
2. AM Blocked (orange gradient top)
3. PM Blocked (purple gradient bottom)
4. Full Day (red-orange gradient)

---

## Color Reference

### Blocked States
```tsx
// AM Blocked (Morning)
const amBlocked = 'hsl(25, 95%, 63%)';  // Warm orange

// PM Blocked (Afternoon)
const pmBlocked = 'hsl(280, 65%, 60%)'; // Purple

// Full Day Blocked
const fullBlocked = 'hsl(0, 84%, 60%)'; // Red
```

### Gradient Overlays
```tsx
// AM Blocked (top half)
className="bg-gradient-to-b from-orange-500/80 to-transparent"

// PM Blocked (bottom half)
className="bg-gradient-to-t from-purple-500/80 to-transparent"

// Full Day Blocked
className="bg-gradient-to-br from-red-500/80 to-orange-500/80"
```

---

## Accessibility Quick Reference

### ARIA Labels
```tsx
// DayCell
aria-label={`${format(date, 'MMMM d, yyyy')} - ${status}${eventName ? ` - ${eventName}` : ''}`}

// Navigation buttons
aria-label="Previous month"
aria-label="Next month"
aria-label="Go to today"
aria-label="Sync with Google Calendar"
```

### Focus States
```tsx
// Apply to all interactive elements
className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
```

### Keyboard Navigation
- **Tab**: Move between interactive elements
- **Space/Enter**: Activate button/cell
- **Arrow keys**: Navigate grid (context menu)
- **Shift+F10**: Open context menu

---

## Responsive Breakpoints

| Breakpoint | Width | Use Case |
|------------|-------|----------|
| Default | < 640px | Mobile (iPhone, Android) |
| sm | 640px+ | Small tablets (iPad Mini) |
| md | 768px+ | Tablets (iPad) |
| lg | 1024px+ | Laptops (MacBook) |
| xl | 1280px+ | Desktops |
| 2xl | 1536px+ | Large desktops |

### Common Patterns
```tsx
// Padding
className="p-4 sm:p-6 lg:p-8"

// Gap
className="gap-1 md:gap-2 lg:gap-3"

// Typography
className="text-sm lg:text-base"

// Hide/show text
className="hidden sm:inline"  // Show on tablet+
className="sm:hidden"          // Hide on tablet+
```

---

## Common Tasks

### Add New Animation
1. Define variant in `/lib/design-tokens.ts`:
```tsx
export const myAnimation = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 }
};
```

2. Use in component:
```tsx
import { myAnimation } from '@/lib/design-tokens';

<motion.div
  variants={myAnimation}
  initial="hidden"
  animate="visible"
>
  {/* Content */}
</motion.div>
```

### Add New Color Token
1. Add to `/lib/design-tokens.ts`:
```tsx
export const colors = {
  // ...existing colors
  newColor: {
    light: 'hsl(...)',
    base: 'hsl(...)',
    dark: 'hsl(...)',
  }
};
```

2. Use in Tailwind classes:
```tsx
// Note: Use inline styles for custom HSL colors
style={{ backgroundColor: colors.newColor.base }}

// Or extend Tailwind config for class usage
```

### Test Accessibility
```bash
# Install axe-core (if not already)
npm install --save-dev @axe-core/react

# Run manual tests
1. Keyboard navigation (Tab, Space, Enter, Arrows)
2. Screen reader (VoiceOver on macOS, NVDA on Windows)
3. Color contrast (WebAIM Contrast Checker)
4. Focus visible states (Tab through all elements)
```

---

## Troubleshooting

### Animations not working
1. Check framer-motion is installed: `npm list framer-motion`
2. Verify import: `import { motion } from 'framer-motion'`
3. Ensure AnimatePresence wraps exit animations
4. Check browser supports transforms (all modern browsers do)

### Glassmorphism not rendering
1. Check backdrop-filter support in browser (Safari requires -webkit prefix)
2. Verify `backdrop-blur-md` class is present
3. Ensure parent has `overflow: visible` (not `hidden`)
4. Check background has transparency (`bg-white/70` not `bg-white`)

### Build errors
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check TypeScript
npm run build
```

---

## Performance Tips

1. **Animation Performance**:
   - Use GPU-accelerated properties (transform, opacity)
   - Avoid animating layout properties (width, height, padding)
   - Keep stagger delays minimal (20ms recommended)

2. **Bundle Size**:
   - Framer-motion is tree-shakeable (import only what you use)
   - Design tokens have zero runtime cost (static objects)

3. **Rendering**:
   - Use `useCallback` for event handlers
   - Only animate on mount/interaction (not on every render)
   - Wrap expensive components in `React.memo` if needed

---

## Resources

- **Design Tokens**: `/lib/design-tokens.ts`
- **Full Spec**: `/docs/UI-IMPROVEMENT-SPEC.md`
- **Implementation Summary**: `/docs/UI-IMPLEMENTATION-SUMMARY.md`
- **Framer Motion Docs**: https://www.framer.com/motion/
- **Tailwind CSS Docs**: https://tailwindcss.com/docs
- **WCAG Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/

---

**Last Updated**: 2025-12-16
**Version**: 2.0
**Status**: Production-ready ✅
