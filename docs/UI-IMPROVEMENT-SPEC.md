# Calendar Availability System - UI Improvement Specification

**Date**: 2025-12-16
**Version**: 2.0 (Post-Meta-Review)
**Design Framework**: Design Mastery + LibreUIUX Principles
**Target Quality**: ≥0.85 (RMP threshold)

---

## Executive Summary

Transform the Calendar Availability System from functional MVP to **design-mastery-grade UI** using:
1. **Principle-driven design** (not decoration)
2. **Modern glassmorphism + shadows** (LibreUIUX patterns)
3. **Mobile-first responsive** (systematic breakpoints)
4. **Accessibility-first** (WCAG AAA where possible)
5. **Micro-interactions** (delight + feedback)

**Current State**: Functional shadcn/ui components (7.5/10 UX)
**Target State**: Production-grade modern UI (9.0/10+ UX)

---

## Design Philosophy Integration

### From design-mastery-claude-code:

**Core Principles**:
1. **"Design is communication"** - Every UI element communicates purpose
2. **"Principles trump trends"** - Gestalt, hierarchy, color theory foundations
3. **"Specificity beats vagueness"** - Precise design language (no "make it pretty")
4. **Historical wisdom** - Dieter Rams' 10 principles, Saul Bass clarity

**Applied to Calendar**:
- **Gestalt Proximity**: Group related dates visually (week rows)
- **Gestalt Similarity**: Consistent colors for blocked/available states
- **Visual Hierarchy**: Primary action (block date) > Secondary (view) > Tertiary (settings)
- **Dieter Rams "Less, but better"**: Remove decorative elements, focus on function

### From LibreUIUX-Claude-Code:

**Modern UI Patterns**:
1. **Glassmorphism cards** with `backdrop-blur-md`
2. **Layered shadows** for depth (not flat design)
3. **Micro-animations** using `framer-motion`
4. **Design tokens** (spacing, colors, typography from system)
5. **Mobile-first** with systematic breakpoints

**Applied to Calendar**:
- Calendar grid: Glassmorphic card with soft shadows
- Day cells: Hover states with backdrop blur
- Blocked dates: Gradient overlay with glass effect
- Drag selection: Animated selection rectangle
- Toast notifications: Glass morphism with slide-in animation

---

## Design System Tokens

### Color Palette (Refined)

```typescript
const colors = {
  // Primary (Calendar actions)
  primary: {
    50: 'hsl(215, 100%, 97%)',   // Very light blue
    100: 'hsl(215, 96%, 91%)',
    200: 'hsl(215, 94%, 82%)',
    300: 'hsl(215, 91%, 73%)',
    400: 'hsl(215, 89%, 64%)',
    500: 'hsl(215, 84%, 55%)',   // Base primary
    600: 'hsl(215, 76%, 46%)',
    700: 'hsl(215, 68%, 37%)',
    800: 'hsl(215, 61%, 28%)',
    900: 'hsl(215, 55%, 19%)',
  },

  // Semantic (State colors)
  blocked: {
    am: 'hsl(25, 95%, 63%)',      // Warm orange
    pm: 'hsl(280, 65%, 60%)',     // Purple
    full: 'hsl(0, 84%, 60%)',     // Red
  },

  available: {
    light: 'hsl(142, 76%, 96%)',  // Very light green
    base: 'hsl(142, 71%, 45%)',   // Green
    dark: 'hsl(142, 76%, 36%)',
  },

  // Glassmorphism
  glass: {
    white: 'rgba(255, 255, 255, 0.1)',
    dark: 'rgba(0, 0, 0, 0.1)',
    border: 'rgba(255, 255, 255, 0.18)',
  },

  // Shadows (depth system)
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  }
};
```

### Typography Scale

```typescript
const typography = {
  // Headings (Inter font family)
  h1: 'text-4xl font-bold tracking-tight',      // 36px
  h2: 'text-3xl font-semibold tracking-tight',  // 30px
  h3: 'text-2xl font-semibold tracking-tight',  // 24px
  h4: 'text-xl font-medium',                    // 20px

  // Body (Inter font family)
  body: 'text-base font-normal',                // 16px
  bodySmall: 'text-sm font-normal',             // 14px
  caption: 'text-xs font-normal',               // 12px

  // Special
  mono: 'font-mono text-sm',                    // Code/dates
  emphasis: 'font-medium',
};
```

### Spacing System (Tailwind scale)

```typescript
const spacing = {
  // 0, 0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 64
  // Applied as: p-4 (16px), m-6 (24px), gap-2 (8px)

  // Common patterns:
  cardPadding: 'p-6',           // 24px inside cards
  sectionGap: 'space-y-8',      // 32px between sections
  gridGap: 'gap-1',             // 4px between calendar cells
  buttonPadding: 'px-4 py-2',   // 16px horizontal, 8px vertical
};
```

### Border Radius

```typescript
const borderRadius = {
  sm: 'rounded-sm',    // 2px
  base: 'rounded',     // 4px
  md: 'rounded-md',    // 6px
  lg: 'rounded-lg',    // 8px
  xl: 'rounded-xl',    // 12px
  '2xl': 'rounded-2xl', // 16px
  full: 'rounded-full', // 9999px (circles)
};
```

---

## Component-Level Improvements

### 1. CalendarView (Main Container)

**Current Issues**:
- Flat design (no depth)
- No glassmorphism
- Harsh edges
- No ambient shadows

**Design Mastery Application**:
- **Dieter Rams "Honesty"**: Make calendar boundaries clear with glass effect
- **Gestalt Continuity**: Visual flow from header → grid → legend

**Improved Design**:
```tsx
<div className="relative">
  {/* Ambient background gradient */}
  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 -z-10 rounded-3xl" />

  {/* Main calendar card with glassmorphism */}
  <div className={cn(
    "relative overflow-hidden",
    "bg-white/70 backdrop-blur-md",
    "border border-white/20",
    "rounded-2xl shadow-glass",
    "p-6 lg:p-8"
  )}>
    {/* Header */}
    <CalendarHeader />

    {/* Grid */}
    <CalendarGrid />

    {/* Legend */}
    <CalendarLegend />
  </div>
</div>
```

**Key Changes**:
- Gradient background (depth)
- Glassmorphic card (`bg-white/70 backdrop-blur-md`)
- Soft rounded corners (`rounded-2xl`)
- Glass shadow (`shadow-glass`)
- Generous padding (`p-6 lg:p-8`)

---

### 2. CalendarGrid (Date Grid)

**Current Issues**:
- Dense grid (no breathing room)
- No cell hover states
- Harsh blocked date colors
- No transition animations

**LibreUIUX Application**:
- **Mobile-first**: Responsive cell sizing (touch targets ≥44px)
- **Micro-interactions**: Smooth hover states with scale transform
- **Glassmorphism**: Blocked dates get glass overlay

**Improved Design**:
```tsx
<div className="grid grid-cols-7 gap-1 lg:gap-2">
  {/* Weekday headers */}
  {WEEKDAYS.map((day) => (
    <div
      key={day}
      className={cn(
        "text-center text-xs font-semibold text-gray-600",
        "py-2 uppercase tracking-wider"
      )}
    >
      {day.slice(0, 3)}
    </div>
  ))}

  {/* Date cells */}
  {dates.map((date) => (
    <DayCell
      key={date.toISOString()}
      date={date}
      className={cn(
        // Base styling
        "relative aspect-square rounded-lg",
        "flex items-center justify-center",
        "transition-all duration-200 ease-out",

        // Interactive states
        "hover:scale-105 hover:shadow-md hover:z-10",
        "active:scale-95",

        // Glassmorphism for blocked dates
        isBlocked && "bg-gradient-to-br from-red-500/20 to-orange-500/20 backdrop-blur-sm",

        // Available dates
        !isBlocked && "hover:bg-blue-50/50",

        // Current date highlight
        isToday && "ring-2 ring-blue-500 ring-offset-2"
      )}
    />
  ))}
</div>
```

**Key Changes**:
- Increased gap (`gap-1 lg:gap-2`)
- Aspect ratio square (`aspect-square`)
- Hover scale (`hover:scale-105`)
- Smooth transitions (`transition-all duration-200`)
- Glassmorphic blocked state
- Current date ring indicator

---

### 3. DayCell (Individual Date)

**Current Issues**:
- No visual feedback on click
- Blocked state is just color change
- No half-day visual distinction
- Missing accessibility labels

**Design Mastery Application**:
- **Gestalt Figure-Ground**: Clear separation between date number and background
- **Affordance**: Visual cues that cells are clickable
- **Feedback**: Immediate visual response to interaction

**Improved Design**:
```tsx
export function DayCell({ date, isBlocked, blockStatus, editable }: DayCellProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      className={cn(
        // Base cell
        "relative w-full aspect-square rounded-lg",
        "flex flex-col items-center justify-center",
        "text-sm font-medium",
        "transition-all duration-200",

        // Glassmorphic background
        "bg-white/40 backdrop-blur-sm",
        "border border-white/20",

        // Interactive states
        editable && "cursor-pointer hover:shadow-lg hover:scale-105",
        editable && "active:scale-95",

        // Disabled state
        !editable && "cursor-default opacity-60"
      )}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: editable ? 1.05 : 1 }}
      whileTap={{ scale: editable ? 0.95 : 1 }}
      aria-label={`${format(date, 'EEEE, MMMM d, yyyy')}${isBlocked ? ' - Blocked' : ' - Available'}`}
    >
      {/* Date number */}
      <span className={cn(
        "relative z-10",
        isToday && "text-blue-600 font-bold",
        isBlocked && "text-white"
      )}>
        {format(date, 'd')}
      </span>

      {/* Blocked overlay with gradient */}
      {isBlocked && (
        <motion.div
          className={cn(
            "absolute inset-0 rounded-lg",
            blockStatus.AM && blockStatus.PM
              ? "bg-gradient-to-br from-red-500/80 to-orange-500/80"
              : blockStatus.AM
              ? "bg-gradient-to-b from-orange-500/80 to-transparent"
              : "bg-gradient-to-t from-purple-500/80 to-transparent"
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Hover indicator */}
      <AnimatePresence>
        {isHovered && editable && (
          <motion.div
            className="absolute inset-0 rounded-lg bg-blue-500/10 backdrop-blur-sm border-2 border-blue-500/50"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
          />
        )}
      </AnimatePresence>

      {/* Half-day indicators */}
      {blockStatus.AM && !blockStatus.PM && (
        <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-orange-500 shadow-sm" />
      )}
      {!blockStatus.AM && blockStatus.PM && (
        <div className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-purple-500 shadow-sm" />
      )}
    </motion.button>
  );
}
```

**Key Changes**:
- `framer-motion` for smooth animations
- Glassmorphic base (`bg-white/40 backdrop-blur-sm`)
- Gradient overlays for blocked states
- Half-day visual indicators (dots)
- Hover state with border glow
- Accessibility labels (ARIA)
- Scale animations on interaction

---

### 4. CalendarHeader (Month Navigation)

**Current Issues**:
- Basic button styling
- No month transition animation
- Cluttered layout

**LibreUIUX Application**:
- **Visual hierarchy**: Month/year is primary (larger font)
- **Micro-interactions**: Arrow buttons with hover effects
- **Glassmorphism**: Header has subtle glass background

**Improved Design**:
```tsx
<div className={cn(
  "flex items-center justify-between",
  "mb-6 p-4 rounded-xl",
  "bg-white/30 backdrop-blur-sm border border-white/20"
)}>
  {/* Previous month button */}
  <Button
    variant="ghost"
    size="icon"
    onClick={handlePrevMonth}
    className={cn(
      "rounded-full hover:bg-blue-500/10 hover:scale-110",
      "transition-all duration-200"
    )}
    aria-label="Previous month"
  >
    <ChevronLeft className="w-5 h-5" />
  </Button>

  {/* Month/Year display with transition */}
  <AnimatePresence mode="wait">
    <motion.h2
      key={currentMonth.toISOString()}
      className="text-2xl font-semibold text-gray-900"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
    >
      {format(currentMonth, 'MMMM yyyy')}
    </motion.h2>
  </AnimatePresence>

  {/* Next month button */}
  <Button
    variant="ghost"
    size="icon"
    onClick={handleNextMonth}
    className={cn(
      "rounded-full hover:bg-blue-500/10 hover:scale-110",
      "transition-all duration-200"
    )}
    aria-label="Next month"
  >
    <ChevronRight className="w-5 h-5" />
  </Button>
</div>
```

**Key Changes**:
- Glassmorphic container
- Circular navigation buttons
- Month name fade transition
- Hover scale on buttons
- Generous padding and spacing

---

### 5. DragSelection Rectangle

**Current Issues**:
- Basic dashed border
- No gradient or glass effect
- No pulse animation

**Improved Design**:
```tsx
{isDragging && (
  <motion.div
    className={cn(
      "absolute pointer-events-none z-20",
      "bg-gradient-to-br from-blue-500/20 to-purple-500/20",
      "backdrop-blur-sm",
      "border-2 border-blue-500/60 rounded-lg",
      "shadow-lg"
    )}
    style={{
      left: selectionRect.left,
      top: selectionRect.top,
      width: selectionRect.width,
      height: selectionRect.height,
    }}
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{ duration: 0.15 }}
  />
)}
```

**Key Changes**:
- Gradient fill (`from-blue-500/20 to-purple-500/20`)
- Backdrop blur
- Fade-in animation
- Soft border (`border-blue-500/60`)

---

### 6. Legend Component

**Current Issues**:
- Plain text labels
- No visual samples
- Bottom alignment (easy to miss)

**Improved Design**:
```tsx
<div className={cn(
  "mt-6 p-4 rounded-xl",
  "bg-gradient-to-r from-gray-50 to-blue-50/30",
  "border border-gray-200"
)}>
  <h3 className="text-sm font-semibold text-gray-700 mb-3">Legend</h3>

  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {/* Available */}
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-md bg-white border border-gray-200 shadow-sm" />
      <span className="text-sm text-gray-600">Available</span>
    </div>

    {/* Blocked AM */}
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-md bg-gradient-to-b from-orange-500/80 to-transparent shadow-sm" />
      <span className="text-sm text-gray-600">AM Blocked</span>
    </div>

    {/* Blocked PM */}
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-md bg-gradient-to-t from-purple-500/80 to-transparent shadow-sm" />
      <span className="text-sm text-gray-600">PM Blocked</span>
    </div>

    {/* Blocked Full */}
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-md bg-gradient-to-br from-red-500/80 to-orange-500/80 shadow-sm" />
      <span className="text-sm text-gray-600">Full Day</span>
    </div>
  </div>
</div>
```

**Key Changes**:
- Gradient background container
- Visual color samples (actual gradients)
- Grid layout (responsive)
- Improved hierarchy

---

## Animation Specifications

### Using framer-motion

**Install**:
```bash
npm install framer-motion
```

**Animation Patterns**:

```tsx
// 1. Scale on hover (DayCell)
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  transition={{ duration: 0.2 }}
/>

// 2. Fade-in on mount (CalendarGrid)
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4 }}
/>

// 3. Stagger children (Date cells)
<motion.div
  variants={{
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.02
      }
    }
  }}
  initial="hidden"
  animate="show"
>
  {dates.map((date) => (
    <motion.div
      key={date}
      variants={{
        hidden: { opacity: 0, scale: 0.8 },
        show: { opacity: 1, scale: 1 }
      }}
    />
  ))}
</motion.div>

// 4. Month transition (Header)
<AnimatePresence mode="wait">
  <motion.h2
    key={currentMonth.toISOString()}
    initial={{ opacity: 0, x: direction > 0 ? 20 : -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: direction > 0 ? -20 : 20 }}
    transition={{ duration: 0.2 }}
  />
</AnimatePresence>
```

---

## Responsive Design (Mobile-First)

### Breakpoint Strategy

```tsx
// Tailwind breakpoints
sm: '640px'   // Small tablets
md: '768px'   // Tablets
lg: '1024px'  // Laptops
xl: '1280px'  // Desktops
2xl: '1536px' // Large desktops

// Applied to calendar
<div className={cn(
  // Mobile (default)
  "p-4 text-sm gap-1",

  // Tablet
  "md:p-6 md:text-base md:gap-2",

  // Desktop
  "lg:p-8 lg:text-lg lg:gap-3"
)}>
```

### Touch Target Sizes

```tsx
// Minimum 44x44px for touch targets (Apple HIG / Material Design)
<button className="min-h-[44px] min-w-[44px]">
  {/* Content */}
</button>

// Calendar cells
<div className="aspect-square min-h-[44px]">
  {/* Date */}
</div>
```

---

## Accessibility Improvements

### WCAG AAA Compliance

**Color Contrast**:
```tsx
// Text on blocked dates (red background)
// Red: #EF4444 (hsl(0, 84%, 60%))
// White text: #FFFFFF
// Contrast ratio: 5.47:1 ✅ WCAG AA (4.5:1 required)

// Improve to AAA (7:1):
const blockedText = "text-white drop-shadow-sm";  // Add shadow for better contrast
```

**Keyboard Navigation**:
```tsx
<div
  role="grid"
  aria-label="Calendar availability grid"
  onKeyDown={handleKeyNavigation}
>
  {dates.map((date) => (
    <div
      role="gridcell"
      tabIndex={0}
      aria-selected={isSelected}
      aria-label={`${format(date, 'EEEE, MMMM d')}${isBlocked ? ', blocked' : ', available'}`}
    />
  ))}
</div>
```

**Screen Reader Support**:
```tsx
// Announce state changes
const [announcement, setAnnouncement] = useState('');

const blockDate = (date: Date) => {
  // ... block logic
  setAnnouncement(`Blocked ${format(date, 'MMMM d')}`);
};

// Live region for announcements
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
  className="sr-only"
>
  {announcement}
</div>
```

---

## Implementation Checklist

### Phase 1: Design Tokens (2 hours)
- [ ] Create `lib/design-tokens.ts` with colors, spacing, typography
- [ ] Update Tailwind config with custom theme
- [ ] Create utility classes for glassmorphism
- [ ] Test color contrast ratios (WCAG AAA)

### Phase 2: Component Refactoring (4 hours)
- [ ] Install `framer-motion`
- [ ] Refactor `CalendarView` with glassmorphism
- [ ] Refactor `CalendarGrid` with responsive gaps
- [ ] Refactor `DayCell` with animations + accessibility
- [ ] Refactor `CalendarHeader` with month transitions
- [ ] Update `Legend` component with visual samples

### Phase 3: Interactions (2 hours)
- [ ] Add hover states to all interactive elements
- [ ] Implement drag selection glass rectangle
- [ ] Add micro-animations (scale on click)
- [ ] Add loading states with skeleton screens

### Phase 4: Responsive Testing (1 hour)
- [ ] Test on mobile (375px - iPhone SE)
- [ ] Test on tablet (768px - iPad)
- [ ] Test on desktop (1440px - MacBook)
- [ ] Verify touch targets ≥44px

### Phase 5: Accessibility Audit (1 hour)
- [ ] Keyboard navigation (Tab, Arrow keys, Enter, Space)
- [ ] Screen reader testing (VoiceOver, NVDA)
- [ ] Color contrast validation (WebAIM checker)
- [ ] ARIA labels and roles
- [ ] Focus visible states

---

## Quality Gates (RMP Thresholds)

### Iteration 1 Target: 0.75
- ✅ Design tokens implemented
- ✅ Basic glassmorphism applied
- ✅ Responsive grid working
- ⚠️ Animations missing
- ⚠️ Accessibility incomplete

### Iteration 2 Target: 0.85
- ✅ All animations implemented
- ✅ Hover states polished
- ✅ Keyboard navigation working
- ✅ WCAG AA compliance
- ⚠️ Some micro-interactions missing

### Iteration 3 Target: 0.90+
- ✅ Complete accessibility (WCAG AAA)
- ✅ All micro-interactions polished
- ✅ Cross-browser tested
- ✅ Performance optimized (60fps animations)

---

## Expected Outcomes

**Before (Current State)**:
- Functional but basic shadcn/ui styling
- Flat design (no depth)
- Minimal animations
- Good accessibility foundation
- **UX Score**: 7.5/10

**After (Target State)**:
- Modern glassmorphism design system
- Layered depth with shadows + blur
- Smooth micro-interactions (framer-motion)
- WCAG AAA accessibility
- Mobile-first responsive
- **UX Score**: 9.0+/10

**Design Mastery Compliance**:
- ✅ Principle-driven (Gestalt, hierarchy)
- ✅ Specific design language (no vagueness)
- ✅ Historical wisdom (Dieter Rams)
- ✅ Communication-focused (every element has purpose)

**LibreUIUX Compliance**:
- ✅ Glassmorphism patterns
- ✅ Modern UI components (Shadcn + custom)
- ✅ Systematic design tokens
- ✅ Accessibility-first
- ✅ Mobile-first responsive

---

## References

**Design Mastery Principles**:
- Gestalt Theory (proximity, similarity, continuity)
- Dieter Rams' 10 Principles
- Saul Bass clarity and simplicity
- Visual hierarchy and flow

**LibreUIUX Patterns**:
- Glassmorphism: `backdrop-blur-md` + `bg-white/70`
- Shadows: Layered elevation system
- Animations: `framer-motion` transitions
- Tokens: Systematic spacing/color/typography

**Tools**:
- Tailwind CSS 3.4+ (design tokens)
- framer-motion (animations)
- shadcn/ui (base components)
- WCAG Color Contrast Checker

---

**Next Steps**: Launch frontend-architect agent with this specification to implement improvements.
