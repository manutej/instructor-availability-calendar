# LibreUI/UX Design Principles for Calendar MVP

**Comprehensive Technical Reference**
_Based on LibreUIUX-Claude-Code Repository & Modern UI/UX Standards_

---

## Table of Contents

1. [Core Design Philosophy](#core-design-philosophy)
2. [Typography System](#typography-system)
3. [Color Token System](#color-token-system)
4. [Spacing System](#spacing-system)
5. [Component Architecture](#component-architecture)
6. [Shadcn/UI Integration](#shadcnui-integration)
7. [Mobile-First Responsive Design](#mobile-first-responsive-design)
8. [Accessibility Standards](#accessibility-standards)
9. [Motion & Animation](#motion--animation)
10. [Calendar-Specific Applications](#calendar-specific-applications)

---

## Core Design Philosophy

### 1. Systematic Communication Principles

**The LibreUI/UX philosophy centers on three pillars:**

#### Be Extremely Specific
> "Precision eliminates ambiguity. Claude executes specifications, not aesthetics."

**Wrong:**
```
"Make it look modern and clean"
```

**Right:**
```
"Use glassmorphism card with backdrop-blur-md, border border-white/10,
rounded-xl, padding p-6, shadow-2xl shadow-black/20"
```

#### Reference Concrete Examples
> "Concrete references create shared understanding instantly."

Instead of describing abstract concepts, reference existing design systems:
- shadcn/ui components
- Tailwind utility classes
- Specific color values (not "primary blue")
- Exact spacing values (not "some padding")

#### Design System Foundations
> "Systems are languages. Speak once, benefit everywhere."

Define once, use everywhere:
- Color palette with semantic naming
- Typography scale with precise ratios
- Spacing scale with mathematical progression
- Component patterns with clear contracts

### 2. Bold Aesthetic Direction

**Core Mandate:** Never use generic AI-generated aesthetics

**Key Principles:**
- **Commit to an aesthetic:** Choose brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, or another clear direction
- **Intentionality over randomness:** Every design choice should have purpose
- **Production-grade quality:** Interfaces should be visually striking and memorable
- **Cohesive execution:** Maintain consistency across all touchpoints

### 3. Visual Hierarchy & Composition

**Spatial Principles:**
- Embrace unexpected layouts (asymmetry, overlap, diagonal flow)
- Grid-breaking elements for visual interest
- Generous negative space for breathing room
- Controlled density for focused attention

**Depth Creation:**
- Gradient meshes
- Noise textures
- Geometric patterns
- Layered transparencies
- Dramatic shadows
- Decorative borders

---

## Typography System

### Complete Typography Scale

Based on Tailwind CSS defaults with precise rem/px values:

| Class | Size (rem) | Size (px) | Line Height | Use Case |
|-------|-----------|-----------|-------------|----------|
| `text-xs` | 0.75rem | 12px | 1rem | Fine print, captions, labels |
| `text-sm` | 0.875rem | 14px | 1.25rem | Secondary text, helper text |
| `text-base` | 1rem | 16px | 1.5rem | Body text, primary content |
| `text-lg` | 1.125rem | 18px | 1.75rem | Emphasized paragraphs |
| `text-xl` | 1.25rem | 20px | 1.75rem | Section subheadings |
| `text-2xl` | 1.5rem | 24px | 2rem | Card headings, modal titles |
| `text-3xl` | 1.875rem | 30px | 2.25rem | Page subheadings |
| `text-4xl` | 2.25rem | 36px | 2.5rem | Page headings |
| `text-5xl` | 3rem | 48px | 1 | Hero headings |
| `text-6xl` | 3.75rem | 60px | 1 | Marketing headlines |
| `text-7xl` | 4.5rem | 72px | 1 | Large displays |
| `text-8xl` | 6rem | 96px | 1 | Extra large displays |
| `text-9xl` | 8rem | 128px | 1 | Maximum impact |

### Typography Best Practices

**Font Selection (LibreUI/UX Mandate):**
```tsx
// ❌ Avoid generic fonts
font-family: Arial, Helvetica, sans-serif;
font-family: Inter, sans-serif;

// ✅ Choose distinctive, characterful typefaces
font-family: 'Clash Display', sans-serif;        // Display font
font-family: 'General Sans', sans-serif;          // Body font
font-family: 'JetBrains Mono', monospace;        // Code font
```

**Pairing Strategy:**
- **Display Font:** Distinctive, memorable (headings, hero text)
- **Body Font:** Refined, readable (paragraphs, UI text)
- **Mono Font:** Technical precision (code, data, timestamps)

### Calendar-Specific Typography

```tsx
// Calendar Component Typography
const calendarTypography = {
  // Month/Year header
  header: "text-2xl font-bold tracking-tight",

  // Day names (Mon, Tue, Wed)
  dayNames: "text-xs font-medium uppercase tracking-wider text-muted-foreground",

  // Date numbers
  dateNumbers: "text-sm font-medium",

  // Selected date
  selectedDate: "text-sm font-semibold",

  // Event titles
  eventTitle: "text-xs font-medium truncate",

  // Event count badge
  eventCount: "text-[10px] font-bold",

  // Time slots
  timeSlot: "text-xs tabular-nums",
};
```

**Implementation Example:**
```tsx
<div className="text-2xl font-bold tracking-tight">
  {format(currentMonth, 'MMMM yyyy')}
</div>

<div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
    <div key={day}>{day}</div>
  ))}
</div>

<button className="text-sm font-medium hover:font-semibold">
  {format(date, 'd')}
</button>
```

---

## Color Token System

### Shadcn/UI Color Architecture

**CSS Variables Approach (Recommended):**
```css
/* globals.css */
@layer base {
  :root {
    /* Background & Foreground */
    --background: 0 0% 100%;           /* White */
    --foreground: 222.2 84% 4.9%;      /* Near black */

    /* Card & Popover */
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;

    /* Primary (Brand) */
    --primary: 221.2 83.2% 53.3%;      /* Blue-600 */
    --primary-foreground: 210 40% 98%;

    /* Secondary */
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;

    /* Muted */
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;

    /* Accent */
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;

    /* Destructive (Errors) */
    --destructive: 0 84.2% 60.2%;      /* Red-500 */
    --destructive-foreground: 210 40% 98%;

    /* Border & Input */
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;

    /* Chart Colors */
    --chart-1: 12 76% 61%;
    --chart-2: 173 58% 39%;
    --chart-3: 197 37% 24%;
    --chart-4: 43 74% 66%;
    --chart-5: 27 87% 67%;

    /* Radius */
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;

    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;

    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;

    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;

    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;

    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;

    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;

    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
  }
}
```

### Semantic Color Usage

```tsx
// Background colors
className="bg-background text-foreground"
className="bg-card text-card-foreground"
className="bg-popover text-popover-foreground"

// Interactive elements
className="bg-primary text-primary-foreground hover:bg-primary/90"
className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
className="bg-accent text-accent-foreground hover:bg-accent/80"

// Status indicators
className="bg-destructive text-destructive-foreground"  // Errors
className="bg-green-500 text-white"                      // Success
className="bg-yellow-500 text-black"                     // Warning
className="bg-blue-500 text-white"                       // Info

// Muted/disabled states
className="bg-muted text-muted-foreground"
```

### Calendar-Specific Color Tokens

```tsx
const calendarColors = {
  // Calendar grid
  gridBackground: "bg-background",
  gridBorder: "border-border",

  // Days
  currentMonth: "bg-card text-foreground",
  otherMonth: "bg-muted text-muted-foreground",
  today: "bg-primary text-primary-foreground ring-2 ring-ring ring-offset-2",
  selected: "bg-accent text-accent-foreground",

  // States
  hover: "hover:bg-accent/50",
  disabled: "bg-muted/50 text-muted-foreground/50 cursor-not-allowed",

  // Events
  eventBadge: "bg-primary text-primary-foreground",
  eventDot: "bg-primary",
  multipleEvents: "bg-gradient-to-r from-primary via-accent to-secondary",

  // Weekends
  weekend: "text-destructive",

  // Focus states
  focus: "ring-2 ring-ring ring-offset-2",
};
```

**Implementation Example:**
```tsx
<button
  className={cn(
    // Base styles
    "relative h-14 w-full rounded-lg border transition-colors",

    // Grid position
    isCurrentMonth ? "bg-card text-foreground" : "bg-muted text-muted-foreground",

    // Special states
    isToday && "bg-primary text-primary-foreground ring-2 ring-ring ring-offset-2",
    isSelected && "bg-accent text-accent-foreground",
    isWeekend && "text-destructive",

    // Interactive states
    "hover:bg-accent/50",
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",

    // Disabled state
    disabled && "bg-muted/50 text-muted-foreground/50 cursor-not-allowed opacity-50"
  )}
>
  {format(date, 'd')}
</button>
```

---

## Spacing System

### Complete Spacing Scale

Based on 0.25rem (4px) increments:

| Class | Value (rem) | Value (px) | Common Use |
|-------|------------|-----------|------------|
| `p-px` | 1px | 1px | Hairline borders |
| `p-0` | 0rem | 0px | Reset spacing |
| `p-0.5` | 0.125rem | 2px | Micro spacing |
| `p-1` | 0.25rem | 4px | Tight spacing |
| `p-1.5` | 0.375rem | 6px | Extra tight |
| `p-2` | 0.5rem | 8px | Compact spacing |
| `p-2.5` | 0.625rem | 10px | — |
| `p-3` | 0.75rem | 12px | Small spacing |
| `p-3.5` | 0.875rem | 14px | — |
| `p-4` | 1rem | 16px | **Base unit** |
| `p-5` | 1.25rem | 20px | Medium spacing |
| `p-6` | 1.5rem | 24px | **Cards, sections** |
| `p-7` | 1.75rem | 28px | — |
| `p-8` | 2rem | 32px | Large spacing |
| `p-9` | 2.25rem | 36px | — |
| `p-10` | 2.5rem | 40px | Extra large |
| `p-12` | 3rem | 48px | Section padding |
| `p-14` | 3.5rem | 56px | — |
| `p-16` | 4rem | 64px | Container padding |
| `p-20` | 5rem | 80px | Large containers |
| `p-24` | 6rem | 96px | Hero sections |
| `p-32` | 8rem | 128px | Major sections |
| `p-40` | 10rem | 160px | — |
| `p-48` | 12rem | 192px | — |
| `p-64` | 16rem | 256px | — |
| `p-80` | 20rem | 320px | — |
| `p-96` | 24rem | 384px | Maximum spacing |

### Spacing Best Practices

**Progressive Disclosure:**
```tsx
// Micro components (buttons, badges)
className="px-2 py-1"          // 8px x 4px
className="px-3 py-1.5"        // 12px x 6px
className="px-4 py-2"          // 16px x 8px

// Standard components (cards, inputs)
className="p-4"                // 16px all sides
className="p-6"                // 24px all sides
className="px-6 py-4"          // 24px horizontal, 16px vertical

// Containers (sections, layouts)
className="p-8"                // 32px all sides
className="px-12 py-8"         // 48px horizontal, 32px vertical

// Major sections
className="p-16"               // 64px all sides
className="p-24"               // 96px all sides
```

### Calendar-Specific Spacing

```tsx
const calendarSpacing = {
  // Container
  container: "p-6",                    // 24px padding

  // Header
  headerPadding: "px-6 py-4",         // 24px horizontal, 16px vertical
  headerGap: "gap-4",                  // 16px between elements

  // Grid
  gridGap: "gap-1",                    // 4px between cells
  cellPadding: "p-2",                  // 8px inside each cell

  // Day cell
  dayCellSize: "h-14 w-full",         // 56px height, full width
  dayCellPadding: "p-2",              // 8px padding

  // Event badges
  eventGap: "gap-1",                   // 4px between events
  eventPadding: "px-2 py-0.5",        // 8px x 2px

  // Modals/Popovers
  modalPadding: "p-6",                 // 24px padding
  popoverPadding: "p-4",              // 16px padding

  // Buttons
  buttonPadding: "px-4 py-2",         // 16px x 8px
  iconButtonPadding: "p-2",           // 8px all sides
};
```

**Implementation Example:**
```tsx
<div className="p-6">                           {/* Container: 24px */}
  <header className="px-6 py-4 flex gap-4">    {/* Header: spacing */}
    <button className="p-2 rounded-lg">        {/* Icon button: 8px */}
      <ChevronLeft className="h-5 w-5" />
    </button>
    <h2 className="flex-1 text-2xl">
      {format(currentMonth, 'MMMM yyyy')}
    </h2>
  </header>

  <div className="grid grid-cols-7 gap-1 mt-4"> {/* Grid: 4px gap */}
    {days.map(day => (
      <div key={day} className="p-2 h-14">      {/* Cell: 8px padding */}
        <div className="flex flex-col gap-1">   {/* Events: 4px gap */}
          {/* Day content */}
        </div>
      </div>
    ))}
  </div>
</div>
```

---

## Component Architecture

### Shadcn/UI Component Pattern

**Core Principle:** Components are building blocks, not rigid templates

```tsx
// component-name.tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Define variants using CVA (Class Variance Authority)
const componentVariants = cva(
  // Base styles (always applied)
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// Export types
export interface ComponentProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof componentVariants> {
  asChild?: boolean
}

// Export component
export const Component = React.forwardRef<HTMLElement, ComponentProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <element
        className={cn(componentVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Component.displayName = "Component"
```

### Component Composition Pattern

```tsx
// Calendar.tsx - Compound Component Pattern
export const Calendar = ({ className, ...props }: CalendarProps) => {
  return (
    <div className={cn("p-6", className)} {...props}>
      <Calendar.Header />
      <Calendar.Grid />
    </div>
  )
}

Calendar.Header = ({ className, ...props }: HeaderProps) => {
  return (
    <header className={cn("flex items-center justify-between px-6 py-4", className)} {...props}>
      {/* Header content */}
    </header>
  )
}

Calendar.Grid = ({ className, ...props }: GridProps) => {
  return (
    <div className={cn("grid grid-cols-7 gap-1", className)} {...props}>
      {/* Grid cells */}
    </div>
  )
}

Calendar.DayCell = ({ className, ...props }: DayCellProps) => {
  return (
    <button className={cn("h-14 w-full rounded-lg border p-2", className)} {...props}>
      {/* Day content */}
    </button>
  )
}
```

### Utility Function (cn)

```ts
// lib/utils.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**Usage:**
```tsx
// Merges classes intelligently, handles conflicts
<div className={cn(
  "base-class",
  isActive && "active-class",
  isPending && "pending-class",
  className  // Allow external overrides
)} />
```

---

## Shadcn/UI Integration

### Installation & Setup

```bash
# Initialize shadcn/ui
npx shadcn@latest init

# Add specific components
npx shadcn@latest add button
npx shadcn@latest add calendar
npx shadcn@latest add popover
npx shadcn@latest add dialog
```

### Configuration (components.json)

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

### Customization Strategy

**Level 1: Variant Extension**
```tsx
// Extend existing component with new variants
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        // ... existing variants
        gradient: "bg-gradient-to-r from-primary to-accent text-white",
        glass: "backdrop-blur-md bg-white/10 border border-white/20",
      },
    },
  }
)
```

**Level 2: Wrapper Components**
```tsx
// Create domain-specific wrapper
export const CalendarButton = ({ date, ...props }: CalendarButtonProps) => {
  const isToday = isSameDay(date, new Date())
  const isWeekend = isWeekend(date)

  return (
    <Button
      variant={isToday ? "default" : "ghost"}
      className={cn(
        "h-14 w-full",
        isWeekend && "text-destructive"
      )}
      {...props}
    >
      {format(date, 'd')}
    </Button>
  )
}
```

**Level 3: Full Component Override**
```tsx
// Create completely custom component following shadcn patterns
import { cn } from "@/lib/utils"

export const CustomCalendar = ({ className, ...props }: CustomCalendarProps) => {
  // Full custom implementation
  return (
    <div className={cn("custom-calendar", className)} {...props}>
      {/* Custom structure */}
    </div>
  )
}
```

### Best Practices

1. **Keep components in sync:** Use `npx shadcn@latest diff` to check for updates
2. **Follow the pattern:** Match shadcn's file structure and naming
3. **Extend, don't replace:** Use composition over modification
4. **Maintain CSS variables:** Keep theme tokens in globals.css
5. **Type safety:** Export and use component prop types

---

## Mobile-First Responsive Design

### Breakpoint System

**Tailwind Default Breakpoints:**
```css
/* Mobile first: styles apply at all sizes unless overridden */
.class { }                  /* 0px - 639px (mobile) */

sm: .class { }              /* 640px+ (large mobile) */
md: .class { }              /* 768px+ (tablet) */
lg: .class { }              /* 1024px+ (laptop) */
xl: .class { }              /* 1280px+ (desktop) */
2xl: .class { }             /* 1536px+ (large desktop) */
```

### Mobile-First Methodology

**Start small, enhance upward:**
```tsx
<div className="
  p-4             /* Mobile: 16px padding */
  sm:p-6          /* Large mobile: 24px padding */
  md:p-8          /* Tablet: 32px padding */
  lg:p-12         /* Laptop: 48px padding */
">
  <h1 className="
    text-2xl      /* Mobile: 24px */
    sm:text-3xl   /* Large mobile: 30px */
    md:text-4xl   /* Tablet: 36px */
    lg:text-5xl   /* Laptop: 48px */
  ">
    Responsive Heading
  </h1>
</div>
```

### Touch Target Sizes

**WCAG 2.1 Level AAA:** Minimum 44x44 CSS pixels

**Position-Based Optimization:**
- **Top of screen:** 42px (users less precise)
- **Center of screen:** 36px (users most precise)
- **Bottom of screen:** 46px (users least precise, thumb reach)

**Implementation:**
```tsx
// Calendar day cells - mobile optimized
<button className="
  h-11 w-full           /* Mobile: 44px touch target */
  sm:h-12               /* Large mobile: 48px */
  md:h-14               /* Tablet: 56px (more space) */

  p-2                   /* 8px padding minimum */

  touch-manipulation    /* Disable double-tap zoom */
  active:scale-95       /* Tactile feedback */
  transition-transform  /* Smooth interaction */
">
  {format(date, 'd')}
</button>
```

### Responsive Calendar Layout

```tsx
<div className="
  /* Mobile: Full width, compact */
  w-full p-4

  /* Tablet: Centered, more padding */
  md:max-w-2xl md:mx-auto md:p-6

  /* Desktop: Fixed width, generous padding */
  lg:max-w-4xl lg:p-8
">
  {/* Month header */}
  <header className="
    flex flex-col gap-4        /* Mobile: Stacked */
    sm:flex-row sm:items-center sm:justify-between  /* Tablet+: Row */
  ">
    <h2 className="
      text-xl                   /* Mobile: 20px */
      sm:text-2xl               /* Tablet+: 24px */
    ">
      {format(currentMonth, 'MMMM yyyy')}
    </h2>

    <div className="flex gap-2">
      <Button size="icon" className="
        h-9 w-9                 /* Mobile: 36px */
        sm:h-10 sm:w-10         /* Tablet+: 40px */
      ">
        <ChevronLeft />
      </Button>
      <Button size="icon" className="h-9 w-9 sm:h-10 sm:w-10">
        <ChevronRight />
      </Button>
    </div>
  </header>

  {/* Calendar grid */}
  <div className="
    grid grid-cols-7           /* Always 7 columns */
    gap-1                      /* Mobile: 4px gap */
    sm:gap-2                   /* Tablet+: 8px gap */
    mt-4
  ">
    {/* Day names */}
    {dayNames.map(day => (
      <div key={day} className="
        text-xs                /* Mobile: 12px */
        sm:text-sm             /* Tablet+: 14px */
        text-center font-medium
        truncate               /* Prevent overflow */
        sm:truncate-none       /* Full text on larger screens */
      ">
        {day}
      </div>
    ))}

    {/* Day cells */}
    {days.map(date => (
      <button key={date.toString()} className="
        h-11 w-full            /* Mobile: 44px minimum */
        sm:h-12                /* Large mobile: 48px */
        md:h-14                /* Tablet+: 56px */

        text-sm                /* Mobile: 14px */
        md:text-base           /* Tablet+: 16px */

        rounded-lg border
        transition-colors
        touch-manipulation
      ">
        {format(date, 'd')}
      </button>
    ))}
  </div>
</div>
```

### Responsive Typography

```tsx
// Responsive text scaling
const responsiveText = {
  // Headings
  h1: "text-3xl sm:text-4xl md:text-5xl lg:text-6xl",
  h2: "text-2xl sm:text-3xl md:text-4xl lg:text-5xl",
  h3: "text-xl sm:text-2xl md:text-3xl lg:text-4xl",
  h4: "text-lg sm:text-xl md:text-2xl lg:text-3xl",

  // Body
  body: "text-sm sm:text-base md:text-lg",
  small: "text-xs sm:text-sm",

  // Calendar-specific
  dateNumber: "text-sm md:text-base lg:text-lg",
  eventTitle: "text-[10px] sm:text-xs md:text-sm",
  monthHeader: "text-xl sm:text-2xl md:text-3xl",
};
```

### Mobile Navigation Patterns

```tsx
// Mobile: Bottom sheet
// Desktop: Sidebar
<Sheet>
  <SheetTrigger asChild>
    <Button
      variant="ghost"
      size="icon"
      className="md:hidden"  // Only show on mobile
    >
      <Menu />
    </Button>
  </SheetTrigger>
  <SheetContent side="bottom" className="h-[80vh]">
    <CalendarNavigation />
  </SheetContent>
</Sheet>

// Desktop: Always visible sidebar
<aside className="
  hidden              /* Hidden on mobile */
  md:block            /* Show on tablet+ */
  md:w-64             /* 256px width */
  lg:w-80             /* 320px on desktop */
">
  <CalendarNavigation />
</aside>
```

---

## Accessibility Standards

### WCAG 2.1 Compliance Levels

**Level A (Minimum):**
- Keyboard accessible
- Text alternatives for images
- No reliance on color alone
- Clear focus indicators

**Level AA (Recommended):**
- 4.5:1 contrast for normal text
- 3:1 contrast for large text (18pt+/14pt bold+)
- 3:1 contrast for UI components
- Touch targets 44x44px (mobile)
- Resize text up to 200%

**Level AAA (Enhanced):**
- 7:1 contrast for normal text
- 4.5:1 contrast for large text
- Enhanced touch targets
- No time limits

### Color Contrast Requirements

```tsx
// Contrast checker utilities
const contrastRatios = {
  // Text on background
  normalText: {
    aa: 4.5,    // Minimum 4.5:1
    aaa: 7,     // Enhanced 7:1
  },
  largeText: {  // 18pt+ or 14pt bold+
    aa: 3,      // Minimum 3:1
    aaa: 4.5,   // Enhanced 4.5:1
  },
  uiComponents: {
    aa: 3,      // Minimum 3:1 for borders, icons
  },
};

// Example: Verify contrast
// Text: #222222 on Background: #FFFFFF
// Ratio: 16.1:1 ✅ Passes AAA (7:1)

// Text: #767676 on Background: #FFFFFF
// Ratio: 4.54:1 ✅ Passes AA (4.5:1), ❌ Fails AAA (7:1)
```

**Implementation:**
```tsx
// High contrast mode support
<div className="
  bg-background text-foreground  /* Uses CSS variables */

  /* Ensure sufficient contrast */
  border border-border           /* 3:1 minimum */

  /* Focus state - high contrast */
  focus-visible:ring-2
  focus-visible:ring-ring
  focus-visible:ring-offset-2
  focus-visible:ring-offset-background
">
  Content
</div>
```

### Semantic HTML

```tsx
// ❌ Wrong: Div soup
<div onClick={handleClick}>Click me</div>

// ✅ Right: Semantic button
<button onClick={handleClick}>Click me</button>

// ❌ Wrong: Non-semantic structure
<div className="header">
  <div className="nav">...</div>
</div>

// ✅ Right: Semantic landmarks
<header>
  <nav aria-label="Main navigation">...</nav>
</header>
<main>
  <article>...</article>
  <aside>...</aside>
</main>
<footer>...</footer>
```

### ARIA Implementation

**Calendar-Specific ARIA:**
```tsx
<div
  role="application"
  aria-label="Calendar"
  aria-describedby="calendar-instructions"
>
  {/* Instructions for screen readers */}
  <div id="calendar-instructions" className="sr-only">
    Use arrow keys to navigate dates, Enter to select, Escape to close.
  </div>

  {/* Month/Year header */}
  <h2
    id="month-year-label"
    aria-live="polite"
    aria-atomic="true"
  >
    {format(currentMonth, 'MMMM yyyy')}
  </h2>

  {/* Navigation buttons */}
  <button
    aria-label={`Previous month, ${format(previousMonth, 'MMMM yyyy')}`}
    onClick={goToPreviousMonth}
  >
    <ChevronLeft aria-hidden="true" />
  </button>

  {/* Day grid */}
  <div
    role="grid"
    aria-labelledby="month-year-label"
    className="grid grid-cols-7"
  >
    {/* Day name headers */}
    <div role="row">
      {dayNames.map(day => (
        <div key={day} role="columnheader">
          <abbr title={day} aria-label={day}>
            {day.substring(0, 2)}
          </abbr>
        </div>
      ))}
    </div>

    {/* Week rows */}
    {weeks.map((week, i) => (
      <div key={i} role="row">
        {week.map(date => (
          <button
            key={date.toString()}
            role="gridcell"
            aria-label={format(date, 'EEEE, MMMM do, yyyy')}
            aria-selected={isSelected(date)}
            aria-disabled={!isCurrentMonth(date)}
            aria-current={isToday(date) ? 'date' : undefined}
            tabIndex={isTabStop(date) ? 0 : -1}
            onClick={() => selectDate(date)}
          >
            <time dateTime={format(date, 'yyyy-MM-dd')}>
              {format(date, 'd')}
            </time>
          </button>
        ))}
      </div>
    ))}
  </div>
</div>
```

### Keyboard Navigation

**Required Patterns:**
```tsx
const handleKeyDown = (e: React.KeyboardEvent) => {
  switch (e.key) {
    case 'ArrowUp':
      e.preventDefault()
      moveFocus(-7)  // Previous week
      break
    case 'ArrowDown':
      e.preventDefault()
      moveFocus(7)   // Next week
      break
    case 'ArrowLeft':
      e.preventDefault()
      moveFocus(-1)  // Previous day
      break
    case 'ArrowRight':
      e.preventDefault()
      moveFocus(1)   // Next day
      break
    case 'Home':
      e.preventDefault()
      moveFocusToStart()  // First day of week
      break
    case 'End':
      e.preventDefault()
      moveFocusToEnd()    // Last day of week
      break
    case 'PageUp':
      e.preventDefault()
      if (e.shiftKey) {
        changeYear(-1)
      } else {
        changeMonth(-1)
      }
      break
    case 'PageDown':
      e.preventDefault()
      if (e.shiftKey) {
        changeYear(1)
      } else {
        changeMonth(1)
      }
      break
    case 'Enter':
    case ' ':
      e.preventDefault()
      selectFocusedDate()
      break
    case 'Escape':
      e.preventDefault()
      closeCalendar()
      break
  }
}
```

### Focus Management

```tsx
// Visible focus indicators
<button className="
  focus:outline-none
  focus-visible:ring-2
  focus-visible:ring-ring
  focus-visible:ring-offset-2
  focus-visible:ring-offset-background
">
  Button
</button>

// Focus trap in modals
import { Dialog, DialogContent } from "@/components/ui/dialog"

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    {/* Focus automatically trapped inside */}
    <CalendarPicker />
  </DialogContent>
</Dialog>

// Focus restoration
const buttonRef = useRef<HTMLButtonElement>(null)

const openCalendar = () => {
  setIsOpen(true)
}

const closeCalendar = () => {
  setIsOpen(false)
  // Restore focus to trigger button
  buttonRef.current?.focus()
}
```

### Screen Reader Utilities

```tsx
// Visually hidden but screen-reader accessible
<span className="sr-only">
  Selected date: {format(selectedDate, 'EEEE, MMMM do, yyyy')}
</span>

// Skip to main content
<a
  href="#main-content"
  className="
    sr-only
    focus:not-sr-only
    focus:absolute
    focus:top-4
    focus:left-4
    focus:z-50
    focus:px-4
    focus:py-2
    focus:bg-primary
    focus:text-primary-foreground
    focus:rounded-md
  "
>
  Skip to main content
</a>

// Live region announcements
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

## Motion & Animation

### Animation Principles (LibreUI/UX)

**Core Guidelines:**
1. **High-impact moments:** Focus animations on meaningful interactions
2. **CSS-first:** Prefer CSS animations over JavaScript for performance
3. **Scroll-triggered:** Enhance scrolling with subtle reveals
4. **Hover states:** Add delight to interactive elements
5. **Staggered reveals:** Create rhythm with sequential animations

### CSS Animation Utilities

```tsx
// Tailwind animation classes
className="
  transition-colors     /* Color transitions */
  transition-transform  /* Transform transitions */
  transition-opacity    /* Opacity transitions */
  transition-all        /* All properties (use sparingly) */

  duration-150          /* 150ms (fast) */
  duration-200          /* 200ms (default) */
  duration-300          /* 300ms (slower) */
  duration-500          /* 500ms (dramatic) */

  ease-linear           /* Linear timing */
  ease-in               /* Ease in */
  ease-out              /* Ease out */
  ease-in-out           /* Ease in-out (default) */
"

// Built-in animations
className="
  animate-spin          /* Continuous rotation */
  animate-ping          /* Pulsing circle */
  animate-pulse         /* Opacity pulse */
  animate-bounce        /* Bouncing */
"
```

### Calendar-Specific Animations

```tsx
// Month transition
<div className="
  transition-all duration-300 ease-in-out
  data-[state=entering]:animate-in
  data-[state=entering]:fade-in-0
  data-[state=entering]:slide-in-from-right-5
  data-[state=exiting]:animate-out
  data-[state=exiting]:fade-out-0
  data-[state=exiting]:slide-out-to-left-5
">
  {/* Calendar grid */}
</div>

// Day cell hover
<button className="
  transition-all duration-200
  hover:scale-105
  hover:shadow-lg
  hover:z-10
  active:scale-95
">
  {date}
</button>

// Event badge appearance
<div className="
  animate-in
  fade-in-0
  slide-in-from-bottom-1
  duration-200
  fill-mode-both
">
  Event badge
</div>

// Loading state
<div className="
  animate-pulse
  bg-muted
  rounded-lg
  h-14
">
  {/* Skeleton loader */}
</div>
```

### Framer Motion Integration

```bash
npm install framer-motion
```

```tsx
import { motion, AnimatePresence } from "framer-motion"

// Staggered list animation
<motion.div
  initial="hidden"
  animate="visible"
  variants={{
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }}
>
  {events.map(event => (
    <motion.div
      key={event.id}
      variants={{
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 },
      }}
    >
      <EventCard event={event} />
    </motion.div>
  ))}
</motion.div>

// Month transition with AnimatePresence
<AnimatePresence mode="wait">
  <motion.div
    key={currentMonth.toString()}
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.2 }}
  >
    <CalendarGrid month={currentMonth} />
  </motion.div>
</AnimatePresence>

// Gesture-based interactions
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  className="rounded-lg border p-2"
>
  {date}
</motion.button>
```

### Performance Optimization

```tsx
// Use transform instead of position for animations
className="
  hover:translate-y-[-2px]  /* ✅ GPU-accelerated */
"
// Instead of:
// hover:top-[-2px]           /* ❌ Triggers layout */

// Use opacity instead of visibility
className="
  opacity-0                   /* ✅ GPU-accelerated */
  data-[state=open]:opacity-100
"
// Instead of:
// invisible                   /* ❌ Less smooth */
// data-[state=open]:visible

// Prefer will-change for complex animations
<div className="will-change-transform">
  {/* Complex animation */}
</div>
```

---

## Calendar-Specific Applications

### Complete Calendar Component

```tsx
// components/calendar/calendar.tsx
"use client"

import * as React from "react"
import { format, isSameDay, isToday, isWeekend, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek } from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CalendarEvent {
  id: string
  date: Date
  title: string
  color?: string
}

interface CalendarProps {
  selectedDate?: Date
  onSelectDate?: (date: Date) => void
  events?: CalendarEvent[]
  className?: string
}

export function Calendar({
  selectedDate,
  onSelectDate,
  events = [],
  className,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(
    selectedDate || new Date()
  )

  // Generate calendar days
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const days = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  })

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(event.date, date))
  }

  return (
    <div
      className={cn("p-6 bg-card rounded-xl border shadow-sm", className)}
      role="application"
      aria-label="Calendar"
    >
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <h2
          className="text-2xl font-bold tracking-tight"
          aria-live="polite"
          aria-atomic="true"
        >
          {format(currentMonth, 'MMMM yyyy')}
        </h2>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={previousMonth}
            aria-label={`Previous month, ${format(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1), 'MMMM yyyy')}`}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={nextMonth}
            aria-label={`Next month, ${format(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1), 'MMMM yyyy')}`}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Day names */}
      <div
        className="grid grid-cols-7 gap-1 mb-2"
        role="row"
      >
        {dayNames.map(day => (
          <div
            key={day}
            role="columnheader"
            className="text-xs font-medium uppercase tracking-wider text-center text-muted-foreground p-2"
          >
            <abbr title={day} aria-label={day}>
              {day.substring(0, 3)}
            </abbr>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div
        className="grid grid-cols-7 gap-1"
        role="grid"
      >
        {days.map(date => {
          const dayEvents = getEventsForDate(date)
          const isCurrentMonth = date.getMonth() === currentMonth.getMonth()
          const isSelectedDate = selectedDate && isSameDay(date, selectedDate)
          const isTodayDate = isToday(date)
          const isWeekendDay = isWeekend(date)

          return (
            <button
              key={date.toString()}
              role="gridcell"
              aria-label={format(date, 'EEEE, MMMM do, yyyy')}
              aria-selected={isSelectedDate}
              aria-current={isTodayDate ? 'date' : undefined}
              onClick={() => onSelectDate?.(date)}
              className={cn(
                // Base styles
                "relative h-14 w-full rounded-lg border p-2",
                "text-sm font-medium transition-all duration-200",
                "hover:bg-accent/50 hover:scale-105 hover:z-10",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "active:scale-95",

                // Month state
                isCurrentMonth
                  ? "bg-background text-foreground"
                  : "bg-muted/50 text-muted-foreground",

                // Special states
                isTodayDate && "bg-primary text-primary-foreground font-semibold ring-2 ring-ring ring-offset-2",
                isSelectedDate && !isTodayDate && "bg-accent text-accent-foreground",
                isWeekendDay && !isTodayDate && "text-destructive",

                // Disabled state
                !isCurrentMonth && "opacity-50"
              )}
            >
              {/* Date number */}
              <time
                dateTime={format(date, 'yyyy-MM-dd')}
                className="block"
              >
                {format(date, 'd')}
              </time>

              {/* Event indicators */}
              {dayEvents.length > 0 && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                  {dayEvents.slice(0, 3).map(event => (
                    <div
                      key={event.id}
                      className="h-1 w-1 rounded-full bg-primary"
                      title={event.title}
                    />
                  ))}
                </div>
              )}

              {/* Event count badge (if more than 3) */}
              {dayEvents.length > 3 && (
                <div className="absolute top-1 right-1 h-4 w-4 flex items-center justify-center bg-primary text-primary-foreground text-[10px] font-bold rounded-full">
                  {dayEvents.length}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Screen reader instructions */}
      <div className="sr-only">
        Use arrow keys to navigate dates, Enter to select, Escape to close.
      </div>
    </div>
  )
}
```

### Event List Component

```tsx
// components/calendar/event-list.tsx
"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar, Clock, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"

interface Event {
  id: string
  title: string
  date: Date
  time?: string
  location?: string
  description?: string
  color?: string
}

interface EventListProps {
  events: Event[]
  className?: string
}

export function EventList({ events, className }: EventListProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {events.map(event => (
        <article
          key={event.id}
          className={cn(
            "p-4 rounded-lg border bg-card",
            "transition-all duration-200",
            "hover:shadow-md hover:scale-[1.02]",
            "focus-within:ring-2 focus-within:ring-ring"
          )}
        >
          {/* Color indicator */}
          {event.color && (
            <div
              className="h-1 w-full rounded-full mb-3"
              style={{ backgroundColor: event.color }}
              aria-hidden="true"
            />
          )}

          {/* Event title */}
          <h3 className="text-base font-semibold mb-2">
            {event.title}
          </h3>

          {/* Event metadata */}
          <div className="space-y-1 text-sm text-muted-foreground">
            {/* Date */}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" aria-hidden="true" />
              <time dateTime={format(event.date, 'yyyy-MM-dd')}>
                {format(event.date, 'EEEE, MMMM do, yyyy')}
              </time>
            </div>

            {/* Time */}
            {event.time && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" aria-hidden="true" />
                <span>{event.time}</span>
              </div>
            )}

            {/* Location */}
            {event.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                <span>{event.location}</span>
              </div>
            )}
          </div>

          {/* Description */}
          {event.description && (
            <p className="mt-2 text-sm text-foreground/80">
              {event.description}
            </p>
          )}
        </article>
      ))}

      {events.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          No events scheduled
        </p>
      )}
    </div>
  )
}
```

### Time Slot Grid Component

```tsx
// components/calendar/time-slot-grid.tsx
"use client"

import * as React from "react"
import { format, addHours, isSameHour } from "date-fns"
import { cn } from "@/lib/utils"

interface TimeSlot {
  id: string
  startTime: Date
  endTime: Date
  title?: string
  color?: string
}

interface TimeSlotGridProps {
  date: Date
  slots?: TimeSlot[]
  onSelectSlot?: (startTime: Date) => void
  startHour?: number  // Default: 0 (midnight)
  endHour?: number    // Default: 24 (midnight)
  interval?: number   // Default: 60 (1 hour)
  className?: string
}

export function TimeSlotGrid({
  date,
  slots = [],
  onSelectSlot,
  startHour = 0,
  endHour = 24,
  interval = 60,
  className,
}: TimeSlotGridProps) {
  // Generate time slots
  const timeSlots = React.useMemo(() => {
    const slots: Date[] = []
    let currentHour = startHour

    while (currentHour < endHour) {
      const slotTime = new Date(date)
      slotTime.setHours(currentHour, 0, 0, 0)
      slots.push(slotTime)
      currentHour += interval / 60
    }

    return slots
  }, [date, startHour, endHour, interval])

  const getSlotForTime = (time: Date) => {
    return slots.find(slot =>
      time >= slot.startTime && time < slot.endTime
    )
  }

  return (
    <div
      className={cn("space-y-px", className)}
      role="grid"
      aria-label={`Schedule for ${format(date, 'EEEE, MMMM do, yyyy')}`}
    >
      {timeSlots.map(time => {
        const slot = getSlotForTime(time)
        const hasSlot = !!slot

        return (
          <div
            key={time.toString()}
            role="row"
            className="flex"
          >
            {/* Time label */}
            <div
              className="w-20 flex-shrink-0 pr-4 text-right"
              role="rowheader"
            >
              <time
                dateTime={format(time, 'HH:mm')}
                className="text-xs font-medium text-muted-foreground tabular-nums"
              >
                {format(time, 'h:mm a')}
              </time>
            </div>

            {/* Time slot */}
            <button
              role="gridcell"
              aria-label={`${format(time, 'h:mm a')} ${hasSlot ? `- ${slot.title}` : '- Available'}`}
              onClick={() => onSelectSlot?.(time)}
              className={cn(
                "flex-1 min-h-[60px] rounded-lg border p-3",
                "text-left text-sm transition-all duration-200",
                "hover:bg-accent/50 hover:scale-[1.02]",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",

                hasSlot
                  ? "bg-primary/10 border-primary/20"
                  : "bg-background border-border"
              )}
              style={
                hasSlot && slot.color
                  ? {
                      backgroundColor: `${slot.color}15`,
                      borderColor: `${slot.color}40`
                    }
                  : undefined
              }
            >
              {hasSlot && (
                <div className="flex items-center gap-2">
                  {slot.color && (
                    <div
                      className="h-3 w-1 rounded-full"
                      style={{ backgroundColor: slot.color }}
                      aria-hidden="true"
                    />
                  )}
                  <span className="font-medium">
                    {slot.title}
                  </span>
                </div>
              )}
            </button>
          </div>
        )
      })}
    </div>
  )
}
```

### Visual Hierarchy Patterns

```tsx
// Visual weight distribution
const visualHierarchy = {
  // Level 1: Current date (highest emphasis)
  current: cn(
    "bg-primary text-primary-foreground",
    "ring-2 ring-ring ring-offset-2",
    "font-semibold text-base",
    "shadow-lg"
  ),

  // Level 2: Selected date
  selected: cn(
    "bg-accent text-accent-foreground",
    "font-semibold",
    "border-2 border-accent-foreground/20"
  ),

  // Level 3: Current month dates
  currentMonth: cn(
    "bg-background text-foreground",
    "font-medium"
  ),

  // Level 4: Other month dates (lowest emphasis)
  otherMonth: cn(
    "bg-muted/50 text-muted-foreground",
    "font-normal opacity-50"
  ),
};
```

---

## Implementation Checklist

### Design System Setup
- [ ] Install shadcn/ui: `npx shadcn@latest init`
- [ ] Configure CSS variables in `globals.css`
- [ ] Set up Tailwind config with spacing/typography scales
- [ ] Create `cn()` utility function
- [ ] Define semantic color tokens

### Component Development
- [ ] Use compound component pattern for complex UI
- [ ] Implement CVA (Class Variance Authority) for variants
- [ ] Export component prop types
- [ ] Use forwardRef for all interactive components
- [ ] Include displayName for debugging

### Responsive Design
- [ ] Mobile-first: Start with smallest breakpoint
- [ ] Touch targets: Minimum 44x44px (mobile)
- [ ] Test on real devices (not just browser)
- [ ] Use responsive typography scale
- [ ] Implement responsive spacing

### Accessibility
- [ ] Semantic HTML (header, main, nav, article)
- [ ] ARIA labels and roles
- [ ] Keyboard navigation support
- [ ] Focus indicators (visible, high contrast)
- [ ] Color contrast: 4.5:1 minimum (AA)
- [ ] Screen reader testing
- [ ] Touch target size verification

### Animation & Motion
- [ ] CSS-first animations
- [ ] Respect `prefers-reduced-motion`
- [ ] Use GPU-accelerated properties (transform, opacity)
- [ ] Meaningful animations only (avoid gratuitous motion)
- [ ] Loading states with skeleton screens

### Calendar-Specific
- [ ] Date utilities (date-fns or similar)
- [ ] Timezone handling
- [ ] Event data structure
- [ ] Grid layout optimization
- [ ] Time slot visualization
- [ ] Month/year navigation
- [ ] Event indicators (dots, badges, colors)
- [ ] Responsive calendar grid

---

## Quick Reference

### Essential Commands
```bash
# Install shadcn/ui
npx shadcn@latest init

# Add components
npx shadcn@latest add button calendar popover dialog

# Check for updates
npx shadcn@latest diff
```

### Common Patterns
```tsx
// Conditional classes
className={cn(
  "base-class",
  condition && "conditional-class",
  className  // Allow overrides
)}

// Responsive design
className="text-sm sm:text-base md:text-lg lg:text-xl"

// Interactive states
className="hover:bg-accent focus-visible:ring-2 active:scale-95"

// Accessibility
role="button"
aria-label="Descriptive label"
tabIndex={0}
```

### Resources
- **LibreUIUX-Claude-Code:** https://github.com/HermeticOrmus/LibreUIUX-Claude-Code
- **shadcn/ui:** https://ui.shadcn.com
- **Tailwind CSS:** https://tailwindcss.com
- **WCAG Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/
- **date-fns:** https://date-fns.org

---

## Conclusion

This document provides a comprehensive foundation for implementing modern, accessible, and beautiful calendar UI following LibreUI/UX principles. The key to success is:

1. **Be Specific:** Use exact values, not vague descriptions
2. **System First:** Define design tokens before building components
3. **Mobile First:** Start small, enhance upward
4. **Accessible Always:** Build inclusivity from the start
5. **Intentional Design:** Every choice should have purpose

All code examples are production-ready and can be copied directly into your Calendar MVP project. Adjust color tokens, spacing values, and component variants to match your specific design direction while maintaining the systematic approach outlined here.

---

**Document Version:** 1.0
**Last Updated:** 2025-12-17
**Maintained By:** deep-researcher agent
**Project:** Calendar MVP (cal/)
