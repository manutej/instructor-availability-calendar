# Next.js 14 App Router Implementation Guide
**Calendar Availability System**

**Version**: 1.0.0
**Timeline**: 11 hours to MVP
**Stack**: Next.js 14 App Router + TypeScript + Tailwind

---

## Table of Contents

1. [Project Setup](#project-setup)
2. [File Structure](#file-structure)
3. [Root Layout & Pages](#root-layout--pages)
4. [API Routes (MCP Bridge)](#api-routes-mcp-bridge)
5. [Server vs Client Components](#server-vs-client-components)
6. [Data Fetching Patterns](#data-fetching-patterns)
7. [Performance Optimization](#performance-optimization)
8. [Error Handling](#error-handling)
9. [Complete Code Examples](#complete-code-examples)

---

## Project Setup

### Initialize Next.js 14 Project

```bash
# Create new Next.js project with App Router
npx create-next-app@latest cal --typescript --tailwind --app --src-dir=false

# Navigate to project
cd cal

# Install dependencies
npm install date-fns
npm install @radix-ui/react-select @radix-ui/react-dropdown-menu
npm install class-variance-authority clsx tailwind-merge

# Install shadcn/ui
npx shadcn-ui@latest init
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add tooltip
```

**Official Docs**: https://nextjs.org/docs/app/getting-started/installation

### Project Configuration

**next.config.js**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable SWC for faster builds
  swcMinify: true,
  // Optimize images (if needed for instructor avatars)
  images: {
    domains: ['lh3.googleusercontent.com'], // Google profile images
  },
}

module.exports = nextConfig
```

**tsconfig.json** (auto-generated, verify these settings)
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## File Structure

Based on your `TECHNICAL-PLAN.md`, here's the complete Next.js 14 App Router structure:

```
cal/
├── app/
│   ├── layout.tsx                 # Root layout (REQUIRED)
│   ├── page.tsx                   # Main calendar page
│   ├── globals.css                # Tailwind imports
│   ├── error.tsx                  # Error boundary
│   ├── loading.tsx                # Loading UI
│   └── api/
│       └── calendar/
│           └── route.ts           # MCP bridge (GET /api/calendar)
│
├── components/
│   ├── calendar/
│   │   ├── CalendarGrid.tsx       # Main calendar grid (CLIENT)
│   │   ├── DayCell.tsx            # Individual day cell (CLIENT)
│   │   ├── CalendarToolbar.tsx    # Navigation toolbar (CLIENT)
│   │   └── index.ts               # Barrel export
│   └── ui/                        # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       └── tooltip.tsx
│
├── lib/
│   ├── mcp/
│   │   └── google-calendar.ts     # MCP integration logic
│   ├── utils/
│   │   ├── dates.ts               # date-fns helpers
│   │   └── storage.ts             # localStorage helpers
│   └── constants.ts               # App constants
│
├── hooks/
│   ├── useCalendar.ts             # Main calendar state hook
│   ├── useDragSelection.ts        # Drag selection behavior
│   └── useKeyboardNav.ts          # Keyboard shortcuts
│
├── contexts/
│   └── AvailabilityContext.tsx    # Global availability state
│
├── types/
│   ├── calendar.ts                # Type definitions
│   └── index.ts
│
├── public/
│   └── favicon.ico
│
├── specs/                         # Your existing specs
│   ├── SPEC.md
│   └── TECHNICAL-PLAN.md
│
├── next.config.js
├── tsconfig.json
├── tailwind.config.ts
├── package.json
└── README.md
```

**Official Docs**: https://nextjs.org/docs/app/guides/analytics

---

## Root Layout & Pages

### Root Layout (app/layout.tsx)

**Purpose**: Wraps ALL pages, defines HTML structure, includes providers.

```typescript
// app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import { AvailabilityProvider } from '@/contexts/AvailabilityContext'

export const metadata: Metadata = {
  title: 'Calendar Availability',
  description: 'Manage your instructor availability with ease',
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50">
        {/* Global state provider - wraps all pages */}
        <AvailabilityProvider>
          {children}
        </AvailabilityProvider>
      </body>
    </html>
  )
}
```

**Key Points**:
- ✅ **REQUIRED**: Must include `<html>` and `<body>` tags
- ✅ Root layout is a **Server Component** by default
- ✅ Use `Metadata` API for SEO (replaces manual `<head>` tags)
- ✅ Providers go here to wrap entire app
- ✅ Layout persists across navigation (doesn't remount)

**Official Docs**: https://nextjs.org/docs/app/api-reference/file-conventions/layout

### Main Page (app/page.tsx)

**Purpose**: Server Component that loads initial data and renders the calendar UI.

```typescript
// app/page.tsx
import { Suspense } from 'react'
import CalendarGrid from '@/components/calendar/CalendarGrid'
import CalendarToolbar from '@/components/calendar/CalendarToolbar'
import { Card } from '@/components/ui/card'

// This is a SERVER COMPONENT (default)
export default function CalendarPage() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Instructor Availability
        </h1>
        <p className="text-gray-600 mt-2">
          Manage your schedule and availability
        </p>
      </header>

      <Card className="p-6">
        {/* Toolbar is a Client Component (has interactivity) */}
        <CalendarToolbar />

        {/* Suspense boundary for streaming calendar data */}
        <Suspense fallback={<CalendarSkeleton />}>
          <CalendarGrid />
        </Suspense>
      </Card>
    </main>
  )
}

// Loading skeleton component
function CalendarSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 42 }).map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded" />
        ))}
      </div>
    </div>
  )
}
```

**Key Points**:
- ✅ Server Component by default (no `'use client'` directive)
- ✅ Can be `async` to fetch data server-side
- ✅ Use `<Suspense>` for streaming and loading states
- ✅ Keep interactive components separate (Client Components)

**Official Docs**: https://nextjs.org/docs/app/getting-started/layouts-and-pages

### Loading UI (app/loading.tsx)

```typescript
// app/loading.tsx
export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-96 bg-gray-200 rounded" />
      </div>
    </div>
  )
}
```

**Official Docs**: https://nextjs.org/docs/app/api-reference/file-conventions/loading

---

## API Routes (MCP Bridge)

### Route Handler (app/api/calendar/route.ts)

**Purpose**: Bridge between frontend and MCP Google Calendar server.

```typescript
// app/api/calendar/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getGoogleCalendarEvents } from '@/lib/mcp/google-calendar'

// GET /api/calendar?start=2025-01-01&end=2025-01-31
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const start = searchParams.get('start')
    const end = searchParams.get('end')

    // Validate parameters
    if (!start || !end) {
      return NextResponse.json(
        { error: 'Missing required parameters: start, end' },
        { status: 400 }
      )
    }

    // Call MCP server to get Google Calendar events
    const events = await getGoogleCalendarEvents(start, end)

    // Return success response with caching
    return NextResponse.json(
      {
        events,
        syncedAt: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
        },
      }
    )
  } catch (error) {
    console.error('Calendar API error:', error)

    // Return error response
    return NextResponse.json(
      {
        error: 'Failed to fetch calendar events',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// Revalidate cache every 60 seconds
export const revalidate = 60
```

**Key Points**:
- ✅ File must be named `route.ts` (not `index.ts`)
- ✅ Export async functions for HTTP methods: `GET`, `POST`, `PUT`, `DELETE`
- ✅ Use `NextRequest` for request object, `NextResponse` for responses
- ✅ Access query params via `request.nextUrl.searchParams`
- ✅ Set `revalidate` export for automatic cache revalidation
- ✅ Use proper HTTP status codes (200, 400, 500)

**Official Docs**: https://nextjs.org/docs/app/api-reference/file-conventions/route

### MCP Integration Logic (lib/mcp/google-calendar.ts)

```typescript
// lib/mcp/google-calendar.ts
import { GoogleEvent } from '@/types/calendar'

/**
 * Fetch Google Calendar events via MCP server
 * This is a placeholder - actual MCP integration depends on your MCP setup
 */
export async function getGoogleCalendarEvents(
  startDate: string,
  endDate: string
): Promise<GoogleEvent[]> {
  // TODO: Replace with actual MCP server call
  // For now, this is a mock implementation

  // Example MCP call (adjust based on your MCP server setup):
  // const response = await mcpClient.call('google-calendar', 'list-events', {
  //   timeMin: startDate,
  //   timeMax: endDate,
  // })

  // Mock data for development
  const mockEvents: GoogleEvent[] = [
    {
      id: '1',
      title: 'Team Meeting',
      start: new Date('2025-01-15T10:00:00'),
      end: new Date('2025-01-15T11:00:00'),
      isAllDay: false,
    },
    {
      id: '2',
      title: 'Lunch Break',
      start: new Date('2025-01-15T12:00:00'),
      end: new Date('2025-01-15T13:00:00'),
      isAllDay: false,
    },
  ]

  return mockEvents
}
```

---

## Server vs Client Components

### Understanding the Boundary

**Server Components (Default)**:
- ✅ Fetch data directly from databases/APIs
- ✅ Keep sensitive data on server (API keys)
- ✅ Reduce JavaScript bundle size
- ✅ Better SEO (content is server-rendered)
- ❌ Cannot use browser APIs (localStorage, window)
- ❌ Cannot use React hooks (useState, useEffect)
- ❌ Cannot use event handlers (onClick, onChange)

**Client Components (Opt-in with `'use client'`)**:
- ✅ Use React hooks (useState, useEffect, useContext)
- ✅ Use browser APIs (localStorage, window, document)
- ✅ Handle user interactions (onClick, onDrag)
- ✅ Access Context providers
- ❌ Increase JavaScript bundle size
- ❌ Cannot directly access server-side resources

**Official Docs**: https://nextjs.org/docs/app/getting-started/server-and-client-components

### Pattern: Server Component with Client Children

```typescript
// app/page.tsx (SERVER COMPONENT - no 'use client')
import { CalendarGrid } from '@/components/calendar/CalendarGrid'
import { getInitialEvents } from '@/lib/calendar'

export default async function CalendarPage() {
  // Fetch data on server
  const initialEvents = await getInitialEvents()

  return (
    <main>
      <h1>Calendar</h1>
      {/* Pass server data to client component */}
      <CalendarGrid initialEvents={initialEvents} />
    </main>
  )
}
```

```typescript
// components/calendar/CalendarGrid.tsx (CLIENT COMPONENT)
'use client'

import { useState } from 'react'
import { GoogleEvent } from '@/types/calendar'

interface CalendarGridProps {
  initialEvents: GoogleEvent[]
}

export function CalendarGrid({ initialEvents }: CalendarGridProps) {
  // Now we can use hooks!
  const [events, setEvents] = useState(initialEvents)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
  }

  return (
    <div className="calendar-grid">
      {/* Interactive calendar UI */}
    </div>
  )
}
```

**Key Pattern**:
1. Server Component fetches data
2. Passes data as props to Client Component
3. Client Component handles interactivity

### Component Decision Matrix

For your calendar app:

| Component | Type | Reason |
|-----------|------|--------|
| `app/layout.tsx` | Server | Root layout, no interactivity |
| `app/page.tsx` | Server | Initial data loading |
| `CalendarGrid` | **Client** | Drag selection, click handlers |
| `DayCell` | **Client** | Click handlers, hover states |
| `CalendarToolbar` | **Client** | Button clicks, month navigation |
| `AvailabilityProvider` | **Client** | Context with useState |

---

## Data Fetching Patterns

### Pattern 1: API Route + Client Fetch

**Use Case**: Calendar needs to refresh Google events on demand.

```typescript
// components/calendar/CalendarGrid.tsx
'use client'

import { useState, useEffect } from 'react'
import { GoogleEvent } from '@/types/calendar'

export function CalendarGrid() {
  const [events, setEvents] = useState<GoogleEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  useEffect(() => {
    async function fetchEvents() {
      setIsLoading(true)

      // Calculate month start/end
      const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
      const end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

      try {
        // Call your API route
        const response = await fetch(
          `/api/calendar?start=${start.toISOString()}&end=${end.toISOString()}`
        )

        if (!response.ok) {
          throw new Error('Failed to fetch events')
        }

        const data = await response.json()
        setEvents(data.events)
      } catch (error) {
        console.error('Error fetching events:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [currentMonth]) // Re-fetch when month changes

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="calendar-grid">
      {/* Render calendar with events */}
    </div>
  )
}
```

### Pattern 2: Server Component Initial Data

**Use Case**: Load initial month data server-side for better performance.

```typescript
// app/page.tsx (Server Component)
import { CalendarGrid } from '@/components/calendar/CalendarGrid'

async function getInitialEvents() {
  // Direct server-side fetch (no API route needed)
  const start = new Date()
  start.setDate(1) // First of month
  const end = new Date(start.getFullYear(), start.getMonth() + 1, 0)

  // Call MCP directly from server
  const events = await getGoogleCalendarEvents(
    start.toISOString(),
    end.toISOString()
  )

  return events
}

export default async function CalendarPage() {
  const initialEvents = await getInitialEvents()

  return (
    <main>
      <CalendarGrid initialEvents={initialEvents} />
    </main>
  )
}
```

```typescript
// components/calendar/CalendarGrid.tsx
'use client'

import { useState } from 'react'

interface Props {
  initialEvents: GoogleEvent[]
}

export function CalendarGrid({ initialEvents }: Props) {
  const [events, setEvents] = useState(initialEvents)

  // Can refresh via API route when needed
  const refreshEvents = async () => {
    const response = await fetch('/api/calendar?...')
    const data = await response.json()
    setEvents(data.events)
  }

  return (
    <div>
      <button onClick={refreshEvents}>Refresh</button>
      {/* Calendar UI */}
    </div>
  )
}
```

### Pattern 3: Optimistic Updates for Blocking

**Use Case**: Instant feedback when blocking dates, sync to localStorage.

```typescript
// contexts/AvailabilityContext.tsx
'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import { BlockedDate } from '@/types/calendar'
import { saveToLocalStorage } from '@/lib/utils/storage'

interface AvailabilityContextValue {
  blockedDates: Map<string, BlockedDate>
  blockDate: (date: Date) => void
  unblockDate: (date: Date) => void
}

const AvailabilityContext = createContext<AvailabilityContextValue | null>(null)

export function AvailabilityProvider({ children }: { children: React.ReactNode }) {
  const [blockedDates, setBlockedDates] = useState<Map<string, BlockedDate>>(new Map())

  const blockDate = useCallback((date: Date) => {
    const dateKey = date.toISOString().split('T')[0]

    // Optimistic update - UI updates immediately
    setBlockedDates(prev => {
      const next = new Map(prev)
      next.set(dateKey, { date: dateKey, status: 'full' })
      return next
    })

    // Persist to localStorage asynchronously
    setTimeout(() => {
      saveToLocalStorage('blocked-dates', Array.from(blockedDates.entries()))
    }, 0)
  }, [blockedDates])

  const unblockDate = useCallback((date: Date) => {
    const dateKey = date.toISOString().split('T')[0]

    setBlockedDates(prev => {
      const next = new Map(prev)
      next.delete(dateKey)
      return next
    })

    setTimeout(() => {
      saveToLocalStorage('blocked-dates', Array.from(blockedDates.entries()))
    }, 0)
  }, [blockedDates])

  return (
    <AvailabilityContext.Provider value={{ blockedDates, blockDate, unblockDate }}>
      {children}
    </AvailabilityContext.Provider>
  )
}

export function useAvailability() {
  const context = useContext(AvailabilityContext)
  if (!context) throw new Error('useAvailability must be used within AvailabilityProvider')
  return context
}
```

**Official Docs**: https://nextjs.org/docs/app/getting-started/fetching-data

---

## Performance Optimization

### 1. Streaming with Suspense

**Purpose**: Show loading UI while data fetches, improve perceived performance.

```typescript
// app/page.tsx
import { Suspense } from 'react'

export default function CalendarPage() {
  return (
    <main>
      <h1>Calendar</h1>

      {/* Immediately show header, stream calendar */}
      <Suspense fallback={<CalendarSkeleton />}>
        <CalendarGrid />
      </Suspense>

      {/* Other sections can load independently */}
      <Suspense fallback={<div>Loading stats...</div>}>
        <CalendarStats />
      </Suspense>
    </main>
  )
}
```

**Official Docs**: https://nextjs.org/docs/app/getting-started/linking-and-navigating

### 2. Caching with Revalidation

**Strategy**: Cache Google Calendar data for 60 seconds to reduce API calls.

```typescript
// app/api/calendar/route.ts
export const revalidate = 60 // Revalidate every 60 seconds

export async function GET(request: NextRequest) {
  const events = await getGoogleCalendarEvents(start, end)

  return NextResponse.json(
    { events },
    {
      headers: {
        // Cache in browser for 30s, revalidate in background
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=30',
      },
    }
  )
}
```

**Official Docs**: https://nextjs.org/docs/app/guides/caching

### 3. Component Memoization

**Purpose**: Prevent unnecessary re-renders of DayCell components.

```typescript
// components/calendar/DayCell.tsx
'use client'

import { memo } from 'react'

interface DayCellProps {
  date: Date
  isBlocked: boolean
  hasEvents: boolean
  onClick: (date: Date) => void
}

function DayCellComponent({ date, isBlocked, hasEvents, onClick }: DayCellProps) {
  return (
    <button
      onClick={() => onClick(date)}
      className={cn(
        'h-24 p-2 border rounded',
        isBlocked && 'bg-red-100',
        hasEvents && 'border-blue-500'
      )}
    >
      {date.getDate()}
    </button>
  )
}

// Only re-render if props actually change
export const DayCell = memo(DayCellComponent)
```

### 4. Code Splitting with Dynamic Imports

**Purpose**: Load heavy components only when needed.

```typescript
// app/page.tsx
import dynamic from 'next/dynamic'

// Lazy load CalendarGrid (only when page loads)
const CalendarGrid = dynamic(
  () => import('@/components/calendar/CalendarGrid'),
  {
    loading: () => <CalendarSkeleton />,
    ssr: false, // Disable server-side rendering if using browser APIs
  }
)

export default function CalendarPage() {
  return (
    <main>
      <CalendarGrid />
    </main>
  )
}
```

### Performance Checklist

- ✅ Use `<Suspense>` boundaries for streaming
- ✅ Set `revalidate` on API routes
- ✅ Memoize expensive components with `memo()`
- ✅ Use `useCallback` for event handlers
- ✅ Keep Client Components small and focused
- ✅ Server Components for data fetching
- ✅ Lazy load heavy components with `dynamic()`

---

## Error Handling

### Error Boundary (app/error.tsx)

```typescript
// app/error.tsx
'use client' // Error boundaries must be Client Components

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to monitoring service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-red-900 mb-4">
          Something went wrong!
        </h2>
        <p className="text-red-700 mb-4">
          {error.message || 'An unexpected error occurred'}
        </p>
        <button
          onClick={() => reset()}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
```

**Official Docs**: https://nextjs.org/docs/app/getting-started/error-handling

### Not Found Page (app/not-found.tsx)

```typescript
// app/not-found.tsx
export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <h2 className="text-2xl mb-4">Page Not Found</h2>
      <p className="text-gray-600 mb-8">
        The page you're looking for doesn't exist.
      </p>
      <a href="/" className="text-blue-600 hover:underline">
        Return to Calendar
      </a>
    </div>
  )
}
```

### API Error Handling

```typescript
// app/api/calendar/route.ts
export async function GET(request: NextRequest) {
  try {
    const events = await getGoogleCalendarEvents(start, end)
    return NextResponse.json({ events })
  } catch (error) {
    // Log error
    console.error('Calendar API error:', error)

    // Return structured error response
    return NextResponse.json(
      {
        error: 'Failed to fetch calendar events',
        code: 'CALENDAR_FETCH_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
```

---

## Complete Code Examples

### Example 1: CalendarGrid Component

```typescript
// components/calendar/CalendarGrid.tsx
'use client'

import { useState, useEffect } from 'react'
import { startOfMonth, endOfMonth, eachDayOfInterval, format } from 'date-fns'
import { DayCell } from './DayCell'
import { useAvailability } from '@/contexts/AvailabilityContext'
import { GoogleEvent } from '@/types/calendar'

interface CalendarGridProps {
  initialEvents?: GoogleEvent[]
}

export default function CalendarGrid({ initialEvents = [] }: CalendarGridProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [events, setEvents] = useState<GoogleEvent[]>(initialEvents)
  const [isLoading, setIsLoading] = useState(false)
  const { blockedDates, blockDate, unblockDate } = useAvailability()

  // Generate days for current month
  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  })

  // Fetch events when month changes
  useEffect(() => {
    async function fetchEvents() {
      setIsLoading(true)
      try {
        const start = startOfMonth(currentMonth)
        const end = endOfMonth(currentMonth)

        const response = await fetch(
          `/api/calendar?start=${start.toISOString()}&end=${end.toISOString()}`
        )
        const data = await response.json()
        setEvents(data.events)
      } catch (error) {
        console.error('Failed to fetch events:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [currentMonth])

  const handleDateClick = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd')

    if (blockedDates.has(dateKey)) {
      unblockDate(date)
    } else {
      blockDate(date)
    }
  }

  if (isLoading) {
    return <div className="animate-pulse">Loading calendar...</div>
  }

  return (
    <div className="space-y-4">
      {/* Month navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setCurrentMonth(prev => {
            const newDate = new Date(prev)
            newDate.setMonth(prev.getMonth() - 1)
            return newDate
          })}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Previous
        </button>

        <h2 className="text-xl font-semibold">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>

        <button
          onClick={() => setCurrentMonth(prev => {
            const newDate = new Date(prev)
            newDate.setMonth(prev.getMonth() + 1)
            return newDate
          })}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Next
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center font-semibold text-gray-700">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map(day => {
          const dateKey = format(day, 'yyyy-MM-dd')
          const isBlocked = blockedDates.has(dateKey)
          const dayEvents = events.filter(event =>
            format(new Date(event.start), 'yyyy-MM-dd') === dateKey
          )

          return (
            <DayCell
              key={dateKey}
              date={day}
              isBlocked={isBlocked}
              events={dayEvents}
              onClick={handleDateClick}
            />
          )
        })}
      </div>
    </div>
  )
}
```

### Example 2: Type Definitions

```typescript
// types/calendar.ts

// Google Calendar Event
export interface GoogleEvent {
  id: string
  title: string
  start: Date
  end: Date
  isAllDay: boolean
}

// Blocked Date
export interface BlockedDate {
  date: string // ISO date string (YYYY-MM-DD)
  status: 'full' | 'am' | 'pm'
}

// Application State
export interface CalendarState {
  currentMonth: Date
  blockedDates: Map<string, BlockedDate>
  googleEvents: GoogleEvent[]
  isLoading: boolean
  lastSync: Date | null
}

// localStorage Schema
export interface StorageSchema {
  version: number
  blockedDates: BlockedDate[]
  lastSync: string
  preferences: {
    defaultView: 'month' | 'week'
    workingHours: { start: number; end: number }
  }
}

// API Responses
export interface CalendarEventsResponse {
  events: GoogleEvent[]
  syncedAt: string
  nextSyncToken?: string
}

export interface ErrorResponse {
  error: string
  code: string
  message: string
}
```

---

## Implementation Checklist

### Phase 1: Foundation (3 hours)

- [ ] Initialize Next.js project with TypeScript and Tailwind
- [ ] Set up file structure (app/, components/, lib/, types/)
- [ ] Install dependencies (date-fns, shadcn/ui)
- [ ] Create root layout with metadata
- [ ] Configure Tailwind and global CSS
- [ ] Create type definitions (calendar.ts)

### Phase 2: Core Calendar (4 hours)

- [ ] Build CalendarGrid component (Client)
- [ ] Build DayCell component (Client)
- [ ] Build CalendarToolbar component (Client)
- [ ] Add month navigation logic
- [ ] Style calendar with Tailwind
- [ ] Test responsiveness

### Phase 3: State Management (2 hours)

- [ ] Create AvailabilityContext
- [ ] Implement localStorage helpers
- [ ] Add optimistic updates for blocking
- [ ] Test state persistence across page refresh

### Phase 4: MCP Integration (1 hour)

- [ ] Create API route (app/api/calendar/route.ts)
- [ ] Implement MCP bridge logic
- [ ] Add error handling to API route
- [ ] Test with mock data

### Phase 5: Polish (0-2 hours)

- [ ] Add error boundary (app/error.tsx)
- [ ] Add loading states (app/loading.tsx)
- [ ] Implement keyboard navigation
- [ ] Add loading skeletons
- [ ] Final styling tweaks

---

## Common Pitfalls & Solutions

### Pitfall 1: Using hooks in Server Components

❌ **Wrong**:
```typescript
// app/page.tsx (Server Component)
export default function Page() {
  const [state, setState] = useState(0) // ERROR!
  return <div>{state}</div>
}
```

✅ **Correct**:
```typescript
// app/page.tsx (Server Component)
import { ClientCounter } from '@/components/ClientCounter'

export default function Page() {
  return <ClientCounter />
}

// components/ClientCounter.tsx
'use client'
export function ClientCounter() {
  const [state, setState] = useState(0)
  return <div>{state}</div>
}
```

### Pitfall 2: Forgetting 'use client' directive

❌ **Wrong**:
```typescript
// components/Calendar.tsx
import { useState } from 'react'

export function Calendar() {
  const [date, setDate] = useState(new Date()) // Will fail
  return <div>{date.toString()}</div>
}
```

✅ **Correct**:
```typescript
// components/Calendar.tsx
'use client' // Add this!

import { useState } from 'react'

export function Calendar() {
  const [date, setDate] = useState(new Date())
  return <div>{date.toString()}</div>
}
```

### Pitfall 3: API route not exporting HTTP method functions

❌ **Wrong**:
```typescript
// app/api/calendar/route.ts
export default function handler(req, res) { // Pages Router syntax!
  res.json({ data: [] })
}
```

✅ **Correct**:
```typescript
// app/api/calendar/route.ts
export async function GET(request: NextRequest) {
  return NextResponse.json({ data: [] })
}
```

---

## Additional Resources

### Official Next.js 14 Documentation

- **App Router Overview**: https://nextjs.org/docs/app
- **File Conventions**: https://nextjs.org/docs/app/api-reference/file-conventions
- **Server Components**: https://nextjs.org/docs/app/getting-started/server-and-client-components
- **Route Handlers**: https://nextjs.org/docs/app/api-reference/file-conventions/route
- **Data Fetching**: https://nextjs.org/docs/app/getting-started/fetching-data
- **Caching**: https://nextjs.org/docs/app/guides/caching
- **Error Handling**: https://nextjs.org/docs/app/getting-started/error-handling

### Related Guides

- **TypeScript**: https://nextjs.org/docs/app/building-your-application/configuring/typescript
- **Tailwind CSS**: https://tailwindcss.com/docs/guides/nextjs
- **date-fns**: https://date-fns.org/docs/Getting-Started

---

## Next Steps

After completing this implementation guide:

1. **Phase 1-2 (4 hours)**: Follow the setup and calendar grid implementation
2. **Test**: Verify calendar renders and month navigation works
3. **Phase 3 (2 hours)**: Add state management and blocking functionality
4. **Phase 4 (1 hour)**: Integrate MCP for Google Calendar sync
5. **Phase 5 (2 hours)**: Polish, error handling, and final testing

**Total Estimated Time**: 9-11 hours to functional MVP

Good luck with your implementation! 🚀
