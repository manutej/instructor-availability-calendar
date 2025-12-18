# shadcn/ui Component Library Guide

**For**: Calendar Availability System
**Version**: 1.0.0
**Last Updated**: 2025-12-16

---

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Components](#components)
  - [Button](#button)
  - [Card](#card)
  - [Tooltip](#tooltip)
  - [Context Menu](#context-menu)
  - [Spinner](#spinner)
  - [Alert](#alert)
- [Theming & Customization](#theming--customization)
- [Accessibility](#accessibility)
- [Calendar-Specific Integration](#calendar-specific-integration)
- [Radix UI Primitives](#radix-ui-primitives)

---

## Overview

### What is shadcn/ui?

shadcn/ui is a **collection of beautifully designed, accessible UI components** built with:
- **Radix UI** - Unstyled, accessible primitives
- **Tailwind CSS** - Utility-first styling
- **TypeScript** - Full type safety

**Key Philosophy**: Components are **copied into your project**, not installed as a dependency. This gives you full control over the code and styling.

### Why shadcn/ui for Calendar App?

✅ **Accessibility**: WCAG AA compliant out-of-the-box
✅ **Customization**: Full control over component styling
✅ **Composability**: Build complex UIs from simple primitives
✅ **Type Safety**: Complete TypeScript support
✅ **Tailwind Native**: Seamless Tailwind CSS integration

### Architecture

```
┌─────────────────────────────────────┐
│     Your Calendar Components       │
│  (CalendarGrid, DayCell, etc.)     │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│        shadcn/ui Components         │
│  (Button, Card, Tooltip, etc.)     │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│        Radix UI Primitives          │
│  (Unstyled, accessible base)       │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│           Tailwind CSS              │
│     (Utility-first styling)         │
└─────────────────────────────────────┘
```

---

## Installation

### Step 1: Initialize shadcn/ui

```bash
npx shadcn@latest init
```

**Interactive Prompts**:
```
✔ Would you like to use TypeScript? … yes
✔ Which style would you like to use? › Default
✔ Which color would you like to use as base color? › Slate
✔ Where is your global CSS file? … app/globals.css
✔ Would you like to use CSS variables for colors? … yes
✔ Where is your tailwind.config.js located? … tailwind.config.ts
✔ Configure the import alias for components? … @/components
✔ Configure the import alias for utils? … @/lib/utils
```

**What this does**:
1. Creates `components/ui/` directory
2. Adds `lib/utils.ts` with `cn()` utility
3. Updates `tailwind.config.ts`
4. Configures CSS variables in `globals.css`
5. Creates `components.json` configuration

### Step 2: Install Calendar Components

```bash
npx shadcn@latest add button card tooltip context-menu
```

**For additional components**:
```bash
npx shadcn@latest add spinner alert
```

**Result**:
```
components/ui/
├── button.tsx
├── card.tsx
├── tooltip.tsx
├── context-menu.tsx
├── spinner.tsx
└── alert.tsx
```

### Step 3: Install Icon Library

```bash
npm install lucide-react
```

**Usage**:
```tsx
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
```

---

## Components

### Button

#### Installation
```bash
npx shadcn@latest add button
```

**Dependencies Installed**:
- `@radix-ui/react-slot` - For composition with `asChild` prop

#### API Reference

**Props**:
```tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  asChild?: boolean
}
```

**Variants**:
- `default` - Primary action (filled, bold)
- `destructive` - Dangerous actions (red)
- `outline` - Secondary action (bordered)
- `secondary` - Tertiary action (muted)
- `ghost` - Minimal action (transparent)
- `link` - Inline link style

**Sizes**:
- `default` - h-10 px-4
- `sm` - h-9 px-3
- `lg` - h-11 px-8
- `icon` - h-10 w-10 (square for icons)

#### Calendar Usage Examples

**CalendarToolbar Navigation Buttons**:
```tsx
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar, RefreshCw } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export function CalendarToolbar({
  onPreviousMonth,
  onNextMonth,
  onToday,
  onRefresh,
  isLoading
}: CalendarToolbarProps) {
  return (
    <div className="flex items-center justify-between p-4">
      {/* Navigation */}
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={onPreviousMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Previous Month</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={onNextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Next Month</TooltipContent>
        </Tooltip>

        <Button
          variant="ghost"
          size="sm"
          onClick={onToday}
        >
          <Calendar className="mr-2 h-4 w-4" />
          Today
        </Button>
      </div>

      {/* Actions */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Refresh Google Calendar</TooltipContent>
      </Tooltip>
    </div>
  );
}
```

**DayCell Action Button**:
```tsx
<Button
  variant="ghost"
  size="sm"
  className="w-full h-full"
  onClick={() => toggleBlock(date)}
>
  <div className="flex flex-col items-center">
    <span className="text-sm font-medium">{dayNumber}</span>
    {hasEvents && <span className="text-xs text-muted-foreground">{eventCount} events</span>}
  </div>
</Button>
```

#### Customization

**Custom Variant for Calendar States**:
```tsx
// In components/ui/button.tsx, add to buttonVariants:
const buttonVariants = cva(
  "inline-flex items-center justify-center...",
  {
    variants: {
      variant: {
        // ... existing variants
        blocked: "bg-red-500 text-white hover:bg-red-600",
        available: "bg-green-500 text-white hover:bg-green-600",
        partial: "bg-yellow-500 text-white hover:bg-yellow-600",
      },
      // ...
    },
  }
);
```

**Usage**:
```tsx
<Button variant="blocked">Fully Blocked</Button>
<Button variant="available">Available</Button>
<Button variant="partial">Partial</Button>
```

---

### Card

#### Installation
```bash
npx shadcn@latest add card
```

**Dependencies**: None (pure composition)

#### API Reference

**Components**:
```tsx
<Card>                    {/* Container */}
  <CardHeader>            {/* Header section */}
    <CardTitle>           {/* Main heading */}
    <CardDescription>     {/* Subheading */}
    <CardAction>          {/* Action button in header */}
  </CardHeader>
  <CardContent>           {/* Main content */}
  <CardFooter>            {/* Footer section */}
</Card>
```

**Props**:
```tsx
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}
```

**Variants**:
- `default` - White background, subtle border
- `outline` - Clear borders, transparent background
- `muted` - Muted background color

#### Calendar Usage Examples

**Calendar Container**:
```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function CalendarView() {
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            {format(currentMonth, 'MMMM yyyy')}
          </CardTitle>
          <CalendarToolbar {...toolbarProps} />
        </div>
      </CardHeader>
      <CardContent>
        <CalendarGrid currentMonth={currentMonth} />
      </CardContent>
    </Card>
  );
}
```

**Event Preview Card**:
```tsx
<Card variant="outline" className="max-w-sm">
  <CardHeader>
    <CardTitle className="text-sm">Google Calendar Events</CardTitle>
  </CardHeader>
  <CardContent>
    {events.map(event => (
      <div key={event.id} className="flex items-center gap-2 py-2">
        <div className="w-2 h-2 rounded-full bg-blue-500" />
        <span className="text-sm">{event.title}</span>
      </div>
    ))}
  </CardContent>
</Card>
```

#### Customization

**Custom Card for Day Details**:
```tsx
// Custom color based on status
<Card
  className={cn(
    "transition-colors",
    status === 'blocked' && "border-red-500 bg-red-50",
    status === 'available' && "border-green-500 bg-green-50",
    status === 'partial' && "border-yellow-500 bg-yellow-50"
  )}
>
  <CardContent className="p-4">
    {/* Day details */}
  </CardContent>
</Card>
```

---

### Tooltip

#### Installation
```bash
npx shadcn@latest add tooltip
```

**Dependencies Installed**:
- `@radix-ui/react-tooltip` - Tooltip primitives

#### API Reference

**Components**:
```tsx
<TooltipProvider>               {/* Required wrapper (usually in root) */}
  <Tooltip>                     {/* Individual tooltip */}
    <TooltipTrigger asChild>    {/* Element that triggers tooltip */}
      <Button>Hover me</Button>
    </TooltipTrigger>
    <TooltipContent>            {/* Tooltip popup */}
      <p>Tooltip text</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

**TooltipContent Props**:
```tsx
interface TooltipContentProps {
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  sideOffset?: number
}
```

#### Calendar Usage Examples

**Wrap App with TooltipProvider**:
```tsx
// app/layout.tsx
import { TooltipProvider } from '@/components/ui/tooltip';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <TooltipProvider delayDuration={200}>
          {children}
        </TooltipProvider>
      </body>
    </html>
  );
}
```

**DayCell Date Information**:
```tsx
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

function DayCell({ date, events, blockedStatus }: DayCellProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button className="w-full h-full">
          {format(date, 'd')}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" align="center">
        <div className="space-y-1">
          <p className="font-medium">{format(date, 'EEEE, MMMM d')}</p>
          {blockedStatus !== 'available' && (
            <p className="text-sm text-red-400">
              {blockedStatus === 'full' ? 'Fully Blocked' : `Blocked ${blockedStatus.toUpperCase()}`}
            </p>
          )}
          {events.length > 0 && (
            <div className="text-sm text-muted-foreground">
              <p>{events.length} event{events.length !== 1 ? 's' : ''}</p>
              {events.slice(0, 3).map(event => (
                <p key={event.id} className="truncate">• {event.title}</p>
              ))}
            </div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
```

**Toolbar Button Tooltips**:
```tsx
<Tooltip>
  <TooltipTrigger asChild>
    <Button variant="outline" size="icon">
      <RefreshCw className="h-4 w-4" />
    </Button>
  </TooltipTrigger>
  <TooltipContent>
    <div className="flex items-center gap-2">
      Refresh Calendar
      <kbd className="px-2 py-1 text-xs bg-muted rounded">⌘R</kbd>
    </div>
  </TooltipContent>
</Tooltip>
```

#### Customization

**Custom Tooltip Styles**:
```tsx
<TooltipContent
  className="bg-slate-900 text-white border-slate-700"
  sideOffset={8}
>
  Custom styled tooltip
</TooltipContent>
```

---

### Context Menu

#### Installation
```bash
npx shadcn@latest add context-menu
```

**Dependencies Installed**:
- `@radix-ui/react-context-menu` - Context menu primitives

#### API Reference

**Components**:
```tsx
<ContextMenu>
  <ContextMenuTrigger>        {/* Right-click target */}
    <div>Right-click me</div>
  </ContextMenuTrigger>
  <ContextMenuContent>        {/* Menu popup */}
    <ContextMenuItem>         {/* Menu item */}
    <ContextMenuSeparator />  {/* Divider */}
    <ContextMenuSub>          {/* Submenu */}
      <ContextMenuSubTrigger>
      <ContextMenuSubContent>
    </ContextMenuSub>
  </ContextMenuContent>
</ContextMenu>
```

**ContextMenuItem Props**:
```tsx
interface ContextMenuItemProps {
  inset?: boolean               // Indent for alignment
  disabled?: boolean
  onSelect?: (event: Event) => void
}
```

#### Calendar Usage Examples

**Half-Day Blocking Menu**:
```tsx
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';

function DayCell({ date, onBlock }: DayCellProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <button className="w-full h-full p-2">
          {format(date, 'd')}
        </button>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onSelect={() => onBlock(date, 'full')}>
          🔴 Block Full Day
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onSelect={() => onBlock(date, 'am')}>
          🌅 Block Morning (AM)
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => onBlock(date, 'pm')}>
          🌆 Block Afternoon (PM)
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          onSelect={() => onBlock(date, 'available')}
          className="text-green-600"
        >
          ✅ Mark Available
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
```

**Advanced Context Menu with Submenus**:
```tsx
<ContextMenu>
  <ContextMenuTrigger asChild>
    <div className="day-cell">{/* ... */}</div>
  </ContextMenuTrigger>
  <ContextMenuContent className="w-52">
    {/* Quick Actions */}
    <ContextMenuItem onSelect={() => blockDay('full')}>
      Block Full Day
    </ContextMenuItem>

    {/* Half-Day Submenu */}
    <ContextMenuSub>
      <ContextMenuSubTrigger>Block Half Day</ContextMenuSubTrigger>
      <ContextMenuSubContent>
        <ContextMenuItem onSelect={() => blockDay('am')}>
          Morning (12am - 12pm)
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => blockDay('pm')}>
          Afternoon (12pm - 12am)
        </ContextMenuItem>
      </ContextMenuSubContent>
    </ContextMenuSub>

    <ContextMenuSeparator />

    {/* Recurring Actions */}
    <ContextMenuSub>
      <ContextMenuSubTrigger>Block Recurring</ContextMenuSubTrigger>
      <ContextMenuSubContent>
        <ContextMenuItem>Every Week</ContextMenuItem>
        <ContextMenuItem>Every 2 Weeks</ContextMenuItem>
        <ContextMenuItem>Every Month</ContextMenuItem>
      </ContextMenuSubContent>
    </ContextMenuSub>

    <ContextMenuSeparator />

    {/* Clear */}
    <ContextMenuItem
      onSelect={() => clearBlock(date)}
      className="text-green-600"
    >
      Clear Block
    </ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>
```

#### Customization

**Keyboard Shortcuts in Menu**:
```tsx
import { ContextMenuShortcut } from '@/components/ui/context-menu';

<ContextMenuItem onSelect={() => blockDay('full')}>
  Block Full Day
  <ContextMenuShortcut>⌘B</ContextMenuShortcut>
</ContextMenuItem>
```

---

### Spinner

#### Installation
```bash
npx shadcn@latest add spinner
```

**Dependencies Installed**:
- Uses `lucide-react` for `LoaderIcon`

#### API Reference

**Props**:
```tsx
interface SpinnerProps extends React.SVGProps<SVGSVGElement> {
  className?: string
}
```

**Default Styling**:
- Size: 16px (h-4 w-4)
- Animation: Infinite spin
- Accessible: `role="status"` and `aria-label="Loading"`

#### Calendar Usage Examples

**Loading State in Toolbar**:
```tsx
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';

function CalendarToolbar({ isLoading, onRefresh }: CalendarToolbarProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={isLoading}
      onClick={onRefresh}
    >
      {isLoading ? (
        <>
          <Spinner className="mr-2" />
          Syncing...
        </>
      ) : (
        <>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </>
      )}
    </Button>
  );
}
```

**Full Calendar Loading State**:
```tsx
function CalendarGrid({ isLoading, events }: CalendarGridProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="h-8 w-8" />
          <p className="text-sm text-muted-foreground">
            Loading Google Calendar events...
          </p>
        </div>
      </div>
    );
  }

  return <div className="calendar-grid">{/* ... */}</div>;
}
```

**Inline Loading in DayCell**:
```tsx
function DayCell({ date, isLoadingEvents }: DayCellProps) {
  return (
    <div className="day-cell">
      <span className="day-number">{format(date, 'd')}</span>
      {isLoadingEvents && (
        <Spinner className="h-3 w-3 text-muted-foreground" />
      )}
    </div>
  );
}
```

#### Customization

**Custom Size**:
```tsx
<Spinner className="h-6 w-6" />       {/* Medium */}
<Spinner className="h-8 w-8" />       {/* Large */}
<Spinner className="h-12 w-12" />     {/* Extra Large */}
```

**Custom Color**:
```tsx
<Spinner className="text-blue-500" />
<Spinner className="text-red-500" />
```

---

### Alert

#### Installation
```bash
npx shadcn@latest add alert
```

**Dependencies**: None

#### API Reference

**Components**:
```tsx
<Alert variant="default | destructive">
  <AlertIcon />           {/* Optional icon */}
  <AlertTitle>           {/* Main heading */}
  <AlertDescription>     {/* Description text */}
</Alert>
```

**Variants**:
- `default` - Informational (blue)
- `destructive` - Error/warning (red)

#### Calendar Usage Examples

**Error Boundary Fallback**:
```tsx
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

function CalendarError({ error }: { error: Error }) {
  return (
    <Alert variant="destructive" className="m-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Failed to Load Calendar</AlertTitle>
      <AlertDescription>
        {error.message}
        <div className="mt-2">
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
```

**Google Calendar Sync Status**:
```tsx
import { CheckCircle2 } from 'lucide-react';

function SyncSuccess({ timestamp }: { timestamp: Date }) {
  return (
    <Alert>
      <CheckCircle2 className="h-4 w-4" />
      <AlertTitle>Calendar Synced</AlertTitle>
      <AlertDescription>
        Last updated {format(timestamp, 'PPpp')}
      </AlertDescription>
    </Alert>
  );
}
```

**Warning for Conflicts**:
```tsx
import { AlertTriangle } from 'lucide-react';

function ConflictWarning({ conflicts }: { conflicts: number }) {
  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Schedule Conflicts Detected</AlertTitle>
      <AlertDescription>
        {conflicts} blocked date{conflicts !== 1 ? 's' : ''} overlap with Google Calendar events.
        <ul className="list-inside list-disc text-sm mt-2">
          <li>Review your blocked dates</li>
          <li>Check Google Calendar events</li>
        </ul>
      </AlertDescription>
    </Alert>
  );
}
```

---

## Theming & Customization

### CSS Variables System

shadcn/ui uses CSS variables for theming, defined in `globals.css`:

```css
:root {
  --background: oklch(1 0 0);           /* White */
  --foreground: oklch(0.145 0 0);       /* Near-black */
  --primary: oklch(0.205 0 0);          /* Primary brand color */
  --muted: oklch(0.97 0 0);             /* Light gray backgrounds */
  --border: oklch(0.922 0 0);           /* Border color */
  --radius: 0.625rem;                    /* Border radius (10px) */
}

.dark {
  --background: oklch(0.145 0 0);       /* Dark background */
  --foreground: oklch(0.985 0 0);       /* Light text */
  /* ... dark mode overrides */
}
```

### Custom Calendar Theme

**Add Calendar-Specific Colors**:
```css
/* globals.css */
:root {
  /* ... existing variables */

  /* Calendar availability states */
  --calendar-blocked: oklch(0.577 0.245 27.325);       /* Red */
  --calendar-available: oklch(0.646 0.222 142.495);    /* Green */
  --calendar-partial: oklch(0.828 0.189 84.429);       /* Yellow */
  --calendar-today: oklch(0.488 0.243 264.376);        /* Blue */
}

.dark {
  --calendar-blocked: oklch(0.704 0.191 22.216);
  --calendar-available: oklch(0.696 0.17 162.48);
  --calendar-partial: oklch(0.769 0.188 70.08);
  --calendar-today: oklch(0.488 0.243 264.376);
}

/* Expose to Tailwind */
@theme inline {
  --color-calendar-blocked: var(--calendar-blocked);
  --color-calendar-available: var(--calendar-available);
  --color-calendar-partial: var(--calendar-partial);
  --color-calendar-today: var(--calendar-today);
}
```

**Usage in Components**:
```tsx
<div className="bg-calendar-blocked text-white">Blocked</div>
<div className="bg-calendar-available text-white">Available</div>
<div className="bg-calendar-partial text-white">Partial</div>
<div className="border-calendar-today">Today</div>
```

### Component Customization Patterns

**Button Variants for Calendar States**:
```tsx
// components/ui/button.tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center...",
  {
    variants: {
      variant: {
        // ... existing variants
        blocked: "bg-calendar-blocked hover:bg-calendar-blocked/90 text-white",
        available: "bg-calendar-available hover:bg-calendar-available/90 text-white",
        partial: "bg-calendar-partial hover:bg-calendar-partial/90 text-white",
      },
    },
  }
);
```

**DayCell Custom Styling**:
```tsx
import { cn } from '@/lib/utils';

function DayCell({ date, status }: DayCellProps) {
  return (
    <button
      className={cn(
        "relative h-full w-full p-2 text-sm rounded-md transition-colors",
        "hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring",
        status === 'blocked' && "bg-calendar-blocked/10 text-calendar-blocked hover:bg-calendar-blocked/20",
        status === 'partial' && "bg-calendar-partial/10 text-calendar-partial hover:bg-calendar-partial/20",
        status === 'available' && "bg-calendar-available/10 text-calendar-available hover:bg-calendar-available/20",
        isToday(date) && "ring-2 ring-calendar-today"
      )}
    >
      {format(date, 'd')}
    </button>
  );
}
```

---

## Accessibility

### WCAG AA Compliance

shadcn/ui components meet **WCAG 2.1 Level AA** standards out-of-the-box:

✅ **Color Contrast**: 4.5:1 for normal text, 3:1 for large text
✅ **Keyboard Navigation**: Full keyboard support
✅ **Screen Readers**: Proper ARIA labels and roles
✅ **Focus Management**: Visible focus indicators

### Calendar-Specific Accessibility

#### Keyboard Navigation

**Required Keyboard Shortcuts**:
```tsx
import { useEffect } from 'react';

function useKeyboardNav() {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        case 'ArrowLeft':
          // Move focus to previous day
          break;
        case 'ArrowRight':
          // Move focus to next day
          break;
        case 'ArrowUp':
          // Move focus up one week
          break;
        case 'ArrowDown':
          // Move focus down one week
          break;
        case ' ':
        case 'Enter':
          // Toggle blocked state
          e.preventDefault();
          break;
        case 'Escape':
          // Clear selection
          break;
        case 'PageUp':
          // Previous month
          break;
        case 'PageDown':
          // Next month
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
```

#### ARIA Labels

**CalendarGrid**:
```tsx
<div
  role="grid"
  aria-label={`Calendar for ${format(currentMonth, 'MMMM yyyy')}`}
>
  <div role="row" aria-label="Days of the week">
    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
      <div key={day} role="columnheader" aria-label={day}>
        {day}
      </div>
    ))}
  </div>
  {/* ... day cells */}
</div>
```

**DayCell**:
```tsx
<button
  role="gridcell"
  aria-label={`${format(date, 'EEEE, MMMM d, yyyy')}${
    status === 'blocked' ? ', blocked' : ''
  }${events.length > 0 ? `, ${events.length} events` : ''}`}
  aria-pressed={status === 'blocked'}
  tabIndex={isInCurrentMonth ? 0 : -1}
>
  {format(date, 'd')}
</button>
```

#### Screen Reader Announcements

**Live Region for State Changes**:
```tsx
function Calendar() {
  const [announcement, setAnnouncement] = useState('');

  function handleBlockToggle(date: Date, newStatus: string) {
    // Update state...
    setAnnouncement(
      `${format(date, 'MMMM d')} ${newStatus === 'blocked' ? 'blocked' : 'unblocked'}`
    );
  }

  return (
    <>
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>
      {/* Calendar UI */}
    </>
  );
}
```

### Checklist

- [ ] All interactive elements have focus indicators
- [ ] Color is not the only visual means of conveying information
- [ ] All buttons have descriptive labels
- [ ] Context menus are keyboard accessible
- [ ] Loading states announced to screen readers
- [ ] Error messages are clear and actionable
- [ ] All text meets 4.5:1 contrast ratio
- [ ] Calendar can be navigated with keyboard only

---

## Calendar-Specific Integration

### Complete DayCell Component

```tsx
import { format, isToday, isSameMonth } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Spinner } from '@/components/ui/spinner';

interface DayCellProps {
  date: Date;
  currentMonth: Date;
  status: 'available' | 'blocked' | 'am' | 'pm';
  events: GoogleEvent[];
  isLoading?: boolean;
  onBlock: (date: Date, status: 'full' | 'am' | 'pm' | 'available') => void;
}

export function DayCell({
  date,
  currentMonth,
  status,
  events,
  isLoading,
  onBlock
}: DayCellProps) {
  const isCurrentMonth = isSameMonth(date, currentMonth);
  const isDateToday = isToday(date);
  const dayNumber = format(date, 'd');

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className={cn(
                "relative h-20 w-full p-2 text-sm rounded-md transition-all",
                "hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring",
                !isCurrentMonth && "text-muted-foreground opacity-50",
                isDateToday && "ring-2 ring-calendar-today",
                status === 'blocked' && "bg-calendar-blocked/10 hover:bg-calendar-blocked/20",
                status === 'am' && "bg-calendar-partial/10 hover:bg-calendar-partial/20",
                status === 'pm' && "bg-calendar-partial/10 hover:bg-calendar-partial/20",
              )}
              onClick={() => onBlock(date, status === 'blocked' ? 'available' : 'full')}
            >
              {/* Day Number */}
              <span className={cn(
                "font-medium",
                isDateToday && "bg-calendar-today text-white rounded-full px-2 py-1"
              )}>
                {dayNumber}
              </span>

              {/* Event Indicators */}
              {events.length > 0 && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
                  {events.slice(0, 3).map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  ))}
                </div>
              )}

              {/* Loading Spinner */}
              {isLoading && (
                <div className="absolute top-1 right-1">
                  <Spinner className="h-3 w-3" />
                </div>
              )}

              {/* Half-Day Indicators */}
              {status === 'am' && (
                <div className="absolute top-0 left-0 w-full h-1/2 bg-calendar-partial/20 rounded-t-md" />
              )}
              {status === 'pm' && (
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-calendar-partial/20 rounded-b-md" />
              )}
            </button>
          </TooltipTrigger>

          {/* Tooltip Content */}
          <TooltipContent side="top" align="center">
            <div className="space-y-1">
              <p className="font-medium">{format(date, 'EEEE, MMMM d, yyyy')}</p>

              {status !== 'available' && (
                <p className="text-sm text-calendar-blocked">
                  {status === 'blocked' && '🔴 Fully Blocked'}
                  {status === 'am' && '🌅 Morning Blocked'}
                  {status === 'pm' && '🌆 Afternoon Blocked'}
                </p>
              )}

              {events.length > 0 && (
                <div className="text-sm text-muted-foreground border-t pt-1 mt-1">
                  <p className="font-medium">{events.length} event{events.length !== 1 ? 's' : ''}</p>
                  {events.slice(0, 3).map(event => (
                    <p key={event.id} className="truncate">• {event.title}</p>
                  ))}
                  {events.length > 3 && (
                    <p className="text-xs italic">+{events.length - 3} more</p>
                  )}
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </ContextMenuTrigger>

      {/* Context Menu */}
      <ContextMenuContent className="w-48">
        <ContextMenuItem onSelect={() => onBlock(date, 'full')}>
          🔴 Block Full Day
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onSelect={() => onBlock(date, 'am')}>
          🌅 Block Morning (AM)
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => onBlock(date, 'pm')}>
          🌆 Block Afternoon (PM)
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          onSelect={() => onBlock(date, 'available')}
          className="text-calendar-available"
        >
          ✅ Mark Available
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
```

### Complete CalendarToolbar Component

```tsx
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Spinner } from '@/components/ui/spinner';

interface CalendarToolbarProps {
  currentMonth: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

export function CalendarToolbar({
  currentMonth,
  onPreviousMonth,
  onNextMonth,
  onToday,
  onRefresh,
  isLoading = false,
}: CalendarToolbarProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      {/* Current Month Display */}
      <h2 className="text-2xl font-semibold">
        {format(currentMonth, 'MMMM yyyy')}
      </h2>

      {/* Navigation & Actions */}
      <div className="flex items-center gap-2">
        {/* Previous Month */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={onPreviousMonth}
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Previous Month</TooltipContent>
        </Tooltip>

        {/* Next Month */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={onNextMonth}
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Next Month</TooltipContent>
        </Tooltip>

        {/* Today */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToday}
        >
          <Calendar className="mr-2 h-4 w-4" />
          Today
        </Button>

        {/* Refresh */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={onRefresh}
              disabled={isLoading}
              aria-label="Refresh calendar"
            >
              {isLoading ? (
                <Spinner className="h-4 w-4" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Sync Google Calendar
            {!isLoading && <kbd className="ml-2 px-1.5 py-0.5 text-xs bg-muted rounded">⌘R</kbd>}
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
```

---

## Radix UI Primitives

### Understanding the Foundation

shadcn/ui components are built on **Radix UI primitives**, which provide:

✅ **Accessibility**: ARIA-compliant, keyboard navigation
✅ **Unstyled**: Complete styling control
✅ **Composable**: Build complex patterns
✅ **Type-safe**: Full TypeScript support

### Direct Radix UI Access

You can access Radix primitives directly for advanced customization:

**Example: Custom Tooltip Trigger**:
```tsx
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

<TooltipPrimitive.Root delayDuration={100}>
  <TooltipPrimitive.Trigger asChild>
    <button>Custom trigger</button>
  </TooltipPrimitive.Trigger>
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content className="custom-tooltip">
      Advanced tooltip
    </TooltipPrimitive.Content>
  </TooltipPrimitive.Portal>
</TooltipPrimitive.Root>
```

### Component Primitive Mapping

| shadcn Component | Radix Primitive | Package |
|-----------------|----------------|---------|
| Button | Slot | `@radix-ui/react-slot` |
| Tooltip | Tooltip | `@radix-ui/react-tooltip` |
| Context Menu | Context Menu | `@radix-ui/react-context-menu` |
| Alert | - | Pure HTML/CSS |
| Card | - | Pure HTML/CSS |
| Spinner | - | lucide-react |

### Advanced Customization Example

**Custom Context Menu with Radix**:
```tsx
import * as ContextMenuPrimitive from '@radix-ui/react-context-menu';
import { CheckIcon } from 'lucide-react';

function AdvancedDayCell({ date, onBlock }: DayCellProps) {
  const [selectedOption, setSelectedOption] = useState<string>('available');

  return (
    <ContextMenuPrimitive.Root>
      <ContextMenuPrimitive.Trigger asChild>
        <button className="day-cell">
          {format(date, 'd')}
        </button>
      </ContextMenuPrimitive.Trigger>

      <ContextMenuPrimitive.Portal>
        <ContextMenuPrimitive.Content
          className="w-56 rounded-md border bg-popover p-1 shadow-md"
          sideOffset={5}
        >
          {/* Radio Group for Blocking Options */}
          <ContextMenuPrimitive.RadioGroup
            value={selectedOption}
            onValueChange={setSelectedOption}
          >
            <ContextMenuPrimitive.RadioItem
              value="full"
              className="flex items-center px-2 py-1.5 rounded hover:bg-accent"
            >
              <ContextMenuPrimitive.ItemIndicator className="mr-2">
                <CheckIcon className="h-4 w-4" />
              </ContextMenuPrimitive.ItemIndicator>
              Block Full Day
            </ContextMenuPrimitive.RadioItem>

            {/* ... more options */}
          </ContextMenuPrimitive.RadioGroup>

          <ContextMenuPrimitive.Separator className="my-1 h-px bg-border" />

          <ContextMenuPrimitive.Item
            className="px-2 py-1.5 rounded hover:bg-accent cursor-pointer"
            onSelect={() => onBlock(date, selectedOption as any)}
          >
            Apply
          </ContextMenuPrimitive.Item>
        </ContextMenuPrimitive.Content>
      </ContextMenuPrimitive.Portal>
    </ContextMenuPrimitive.Root>
  );
}
```

---

## Quick Reference

### Installation Commands

```bash
# Initialize shadcn/ui
npx shadcn@latest init

# Install calendar components
npx shadcn@latest add button card tooltip context-menu spinner alert

# Install dependencies
npm install date-fns lucide-react
```

### Import Patterns

```tsx
// Components
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

// Utils
import { cn } from '@/lib/utils';

// Icons
import { ChevronLeft, ChevronRight, Calendar, RefreshCw } from 'lucide-react';

// Dates
import { format, isToday, isSameMonth } from 'date-fns';
```

### Common Patterns

**Conditional Styling**:
```tsx
className={cn(
  "base-classes",
  condition && "conditional-classes",
  status === 'blocked' && "blocked-classes"
)}
```

**Button with Icon**:
```tsx
<Button variant="outline" size="icon">
  <Icon className="h-4 w-4" />
</Button>
```

**Loading State**:
```tsx
{isLoading ? <Spinner /> : <Content />}
```

**Tooltip with Keyboard Shortcut**:
```tsx
<TooltipContent>
  Action Name
  <kbd className="ml-2 px-1.5 py-0.5 text-xs bg-muted rounded">⌘K</kbd>
</TooltipContent>
```

---

## Resources

- **Official Docs**: https://ui.shadcn.com/
- **Component Examples**: https://ui.shadcn.com/docs/components
- **Radix UI**: https://www.radix-ui.com/
- **Tailwind CSS**: https://tailwindcss.com/
- **Lucide Icons**: https://lucide.dev/

---

**Ready for Phase 1, Task 1.3** ✅
