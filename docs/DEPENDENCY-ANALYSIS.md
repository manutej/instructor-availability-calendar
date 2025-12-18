# Calendar Availability System - Dependency Analysis

**Version**: 1.0.0
**Created**: 2025-12-16
**Timeline**: 11 hours to MVP
**Bundle Target**: < 200KB gzipped

## Executive Summary

This document provides a comprehensive analysis of all dependencies required for the Calendar Availability System MVP. Every feature from SPEC.md has been mapped to specific dependencies with clear recommendations on what to add, when to add it, and what to avoid.

**Key Findings**:
- ✅ **Core stack is sufficient** for 80% of MVP features
- ✅ **Native implementations recommended** for drag selection (no react-dnd needed)
- ✅ **Radix UI Context Menu required** for accessibility-compliant half-day blocking
- ✅ **MCP TypeScript SDK** is the only additional major dependency
- ⚠️ **Testing libraries deferred** to Phase 6 (optional)
- 📦 **Estimated bundle**: 180KB gzipped (within target)

---

## Table of Contents

1. [Core Dependencies (Confirmed)](#core-dependencies-confirmed)
2. [Additional Dependencies Needed](#additional-dependencies-needed)
3. [Optional Dependencies (Nice-to-Have)](#optional-dependencies-nice-to-have)
4. [Dependencies to AVOID](#dependencies-to-avoid)
5. [Feature-to-Dependency Mapping](#feature-to-dependency-mapping)
6. [Installation Strategy](#installation-strategy)
7. [Bundle Size Analysis](#bundle-size-analysis)
8. [Timeline Impact Analysis](#timeline-impact-analysis)
9. [Complete package.json Template](#complete-packagejson-template)

---

## Core Dependencies (Confirmed)

These dependencies are **already specified** in TECHNICAL-PLAN.md and are essential for the MVP.

| Package | Version | Purpose | Bundle Impact | Status |
|---------|---------|---------|---------------|--------|
| **next** | 14.2.x | Framework (App Router) | ~0KB (framework) | ✅ Required |
| **react** | 18.3.x | UI library | ~0KB (framework) | ✅ Required |
| **react-dom** | 18.3.x | React rendering | ~0KB (framework) | ✅ Required |
| **typescript** | 5.3.x | Type safety | 0KB (dev only) | ✅ Required |
| **tailwindcss** | 3.4.x | Styling | ~10KB | ✅ Required |
| **date-fns** | 3.0.x | Date utilities | ~15KB (tree-shakeable) | ✅ Required |
| **@types/node** | 20.x | Node.js types | 0KB (dev only) | ✅ Required |
| **@types/react** | 18.x | React types | 0KB (dev only) | ✅ Required |
| **@types/react-dom** | 18.x | React DOM types | 0KB (dev only) | ✅ Required |
| **eslint** | 8.x | Code linting | 0KB (dev only) | ✅ Required |
| **eslint-config-next** | 14.x | Next.js linting | 0KB (dev only) | ✅ Required |
| **autoprefixer** | 10.x | CSS prefixing | 0KB (dev only) | ✅ Required |
| **postcss** | 8.x | CSS processing | 0KB (dev only) | ✅ Required |

**Total Core Bundle Impact**: ~25KB gzipped

---

## Additional Dependencies Needed

These dependencies are **essential** for implementing features from SPEC.md that aren't covered by the core stack.

### 1. MCP Integration (P0 - Critical)

**Required for**: Google Calendar sync (US4)

| Package | Version | Purpose | Bundle Impact | Add When |
|---------|---------|---------|---------------|----------|
| **@modelcontextprotocol/sdk** | ^1.0.2 | MCP client/server SDK | ~25KB | Phase 1 |
| **zod** | ^3.22.0 | Schema validation (MCP dependency) | ~15KB | Phase 1 |

**Installation**:
```bash
npm install @modelcontextprotocol/sdk zod
```

**Integration Example**:
```typescript
// app/api/calendar/route.ts
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

export async function GET(request: Request) {
  const transport = new StdioClientTransport({
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-google-calendar']
  });

  const client = new Client({
    name: 'cal-availability',
    version: '1.0.0'
  }, {
    capabilities: {}
  });

  await client.connect(transport);
  // Fetch events...
}
```

**Rationale**: Official MCP SDK is the only supported way to integrate with Google Calendar via MCP. No alternatives exist.

**Timeline Impact**: +30 min (Phase 5.1 - already budgeted)

---

### 2. Class Name Utilities (P0 - Critical)

**Required for**: Conditional styling, component composition

| Package | Version | Purpose | Bundle Impact | Add When |
|---------|---------|---------|---------------|----------|
| **clsx** | ^2.1.0 | Conditional class names | ~1KB | Phase 1 |
| **tailwind-merge** | ^2.2.0 | Tailwind class conflict resolution | ~8KB | Phase 1 |

**Installation**:
```bash
npm install clsx tailwind-merge
```

**Integration Example**:
```typescript
// lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Usage in DayCell component
<div className={cn(
  "p-4 rounded",
  isBlocked && "bg-red-500",
  isToday && "border-2 border-blue-500",
  props.className // Allow overrides without conflicts
)} />
```

**Rationale**:
- `clsx` is the fastest conditional class utility (faster than `classnames`)
- `tailwind-merge` prevents Tailwind class conflicts (e.g., `p-4 p-6` → `p-6`)
- Combined, they're the standard approach for shadcn/ui components

**Timeline Impact**: +15 min (Phase 1.2 - already budgeted)

---

### 3. shadcn/ui Components (P0 - Critical)

**Required for**: UI components (buttons, cards, tooltips, context menu)

| Package | Version | Purpose | Bundle Impact | Add When |
|---------|---------|---------|---------------|----------|
| **@radix-ui/react-context-menu** | ^2.1.5 | Accessible context menu | ~12KB | Phase 1 |
| **@radix-ui/react-tooltip** | ^1.0.7 | Accessible tooltips | ~8KB | Phase 1 |
| **@radix-ui/react-slot** | ^1.0.2 | Composition primitive | ~2KB | Phase 1 |
| **class-variance-authority** | ^0.7.0 | Variant API for components | ~3KB | Phase 1 |

**Installation**:
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card tooltip context-menu
```

**What This Installs**:
- Copies component files to `components/ui/`
- Installs Radix UI primitives as dependencies
- Sets up Tailwind config with CSS variables
- No runtime overhead (just primitives)

**Rationale**:
- shadcn/ui is copy-paste components (not a package)
- Uses Radix UI primitives underneath
- Radix Context Menu provides WAI-ARIA compliant, keyboard-accessible right-click menus
- Native browser context menus can't be customized for our AM/PM selection UI

**Timeline Impact**: +15 min (Phase 1.3 - already budgeted)

---

### 4. Icon Library (P0 - Critical)

**Required for**: Toolbar icons (chevrons, refresh, calendar)

| Package | Version | Purpose | Bundle Impact | Add When |
|---------|---------|---------|---------------|----------|
| **lucide-react** | ^0.344.0 | Icon components | ~5KB (tree-shakeable) | Phase 1 |

**Installation**:
```bash
npm install lucide-react
```

**Integration Example**:
```typescript
// components/calendar/CalendarToolbar.tsx
import { ChevronLeft, ChevronRight, Calendar, RefreshCw } from 'lucide-react';

export function CalendarToolbar() {
  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="icon">
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon">
        <ChevronRight className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon">
        <RefreshCw className="h-4 w-4" />
      </Button>
    </div>
  );
}
```

**Rationale**:
- lucide-react is the standard icon library for shadcn/ui
- Tree-shakeable (only imports icons you use)
- React components (not SVG sprite sheets)
- 1,400+ icons with consistent design

**Alternative Considered**: Heroicons (also good, but lucide has more icons and better TypeScript support)

**Timeline Impact**: +5 min (Phase 2.4 - already budgeted)

---

## Optional Dependencies (Nice-to-Have)

These dependencies are **recommended** but not critical for MVP. Add if time permits.

### 1. Testing Libraries (P1 - Phase 6 Optional)

**Required for**: Unit and integration tests (6.4)

| Package | Version | Purpose | Bundle Impact | Add When |
|---------|---------|---------|---------------|----------|
| **vitest** | ^1.2.0 | Fast test runner | 0KB (dev only) | Phase 6 |
| **@testing-library/react** | ^14.1.0 | React testing utilities | 0KB (dev only) | Phase 6 |
| **@testing-library/jest-dom** | ^6.2.0 | DOM matchers | 0KB (dev only) | Phase 6 |
| **@testing-library/user-event** | ^14.5.0 | User interaction simulation | 0KB (dev only) | Phase 6 |
| **@vitejs/plugin-react** | ^4.2.0 | Vite React plugin | 0KB (dev only) | Phase 6 |

**Installation**:
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event @vitejs/plugin-react
```

**Configuration**:
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts']
  }
});
```

**Rationale**:
- **Vitest** is faster than Jest (Vite-powered, ESM-native)
- Already configured if you use Vite for development
- Compatible with Jest's API (easy migration)
- Recommended for **Phase 6 only** (after core features work)

**Timeline Impact**: +30 min setup + 30 min writing tests = **1 hour total**

**Recommendation**: ⚠️ **Skip for 11-hour timeline**, add post-MVP if time remains

---

### 2. Type Utilities (P2 - Not Needed)

**Required for**: Advanced TypeScript utilities

| Package | Version | Purpose | Bundle Impact | Add When |
|---------|---------|---------|---------------|----------|
| ~~**type-fest**~~ | N/A | TypeScript utilities | 0KB (types only) | ❌ Not needed |
| ~~**utility-types**~~ | N/A | More TypeScript utilities | 0KB (types only) | ❌ Not needed |

**Rationale**: TypeScript 5.x has built-in utilities (`Partial`, `Pick`, `Omit`, `Record`, etc.). Our types are simple enough to not need external utilities.

**Recommendation**: ❌ **Skip entirely**

---

### 3. localStorage Wrapper (P2 - Not Needed)

**Required for**: Better localStorage API

| Package | Version | Purpose | Bundle Impact | Add When |
|---------|---------|---------|---------------|----------|
| ~~**localforage**~~ | N/A | IndexedDB/localStorage wrapper | ~10KB | ❌ Not needed |

**Rationale**:
- Native `localStorage` is sufficient for storing blocked dates (< 50KB data)
- IndexedDB is overkill for our use case
- Adding complexity for no benefit

**Native Implementation**:
```typescript
// lib/utils/storage.ts
const STORAGE_KEY = 'cal_blocked_dates_v1';

export function saveBlockedDates(dates: BlockedDate[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dates));
  } catch (error) {
    console.error('Failed to save blocked dates:', error);
  }
}

export function loadBlockedDates(): BlockedDate[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load blocked dates:', error);
    return [];
  }
}
```

**Recommendation**: ❌ **Skip entirely** - native API is sufficient

---

## Dependencies to AVOID

These dependencies were considered but are **not recommended** for the MVP.

### 1. ❌ react-dnd / react-beautiful-dnd

**Why avoid**:
- **Overkill** for our use case (designed for complex drag-and-drop like Trello boards)
- **Bundle bloat**: 40-60KB gzipped
- **Complexity**: Requires providers, backends, drop targets, drag sources
- **Event conflicts**: Known issues when combining with native mouse events
- **Performance overhead**: Mutates DOM on every position change

**Native alternative**:
```typescript
// hooks/useDragSelection.ts
export function useDragSelection() {
  const [isDragging, setIsDragging] = useState(false);
  const [startCell, setStartCell] = useState<string | null>(null);
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());

  const handleMouseDown = (cellId: string) => {
    setIsDragging(true);
    setStartCell(cellId);
    setSelectedCells(new Set([cellId]));
  };

  const handleMouseEnter = (cellId: string) => {
    if (isDragging && startCell) {
      // Calculate range from startCell to cellId
      const range = calculateDateRange(startCell, cellId);
      setSelectedCells(new Set(range));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    // Apply selection to context
  };

  return { isDragging, selectedCells, handleMouseDown, handleMouseEnter, handleMouseUp };
}
```

**Bundle savings**: 50KB
**Timeline savings**: 30 min
**Complexity reduction**: Significant

---

### 2. ❌ Redux / Zustand / Jotai

**Why avoid**:
- **Overkill** for single-page app with simple state
- **Bundle bloat**: 8-15KB gzipped
- **Learning curve**: Adds complexity for minimal benefit
- **React Context is sufficient** for our needs

**Native alternative**:
```typescript
// contexts/AvailabilityContext.tsx (already planned in Phase 3.1)
export const AvailabilityProvider: React.FC = ({ children }) => {
  const [blockedDates, setBlockedDates] = useState<Map<string, BlockedDate>>(new Map());
  const [googleEvents, setGoogleEvents] = useState<GoogleEvent[]>([]);

  const blockDate = (date: Date) => {
    const key = formatDateKey(date);
    setBlockedDates(prev => new Map(prev).set(key, { date: key, status: 'full' }));
    // Save to localStorage
  };

  return (
    <AvailabilityContext.Provider value={{ blockedDates, googleEvents, blockDate }}>
      {children}
    </AvailabilityContext.Provider>
  );
};
```

**Bundle savings**: 10KB
**Timeline savings**: 20 min
**Complexity reduction**: Moderate

---

### 3. ❌ Moment.js / Day.js

**Why avoid**:
- **Moment.js is deprecated** (120KB, not tree-shakeable)
- **Day.js is smaller** (7KB) but less type-safe than date-fns
- **date-fns is already chosen** (tree-shakeable, TypeScript-first)

**Stick with date-fns**:
```typescript
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay, isToday } from 'date-fns';

// Only the functions you use are bundled (~15KB total)
```

**Bundle savings**: 105KB (vs Moment.js)

---

## Feature-to-Dependency Mapping

Every feature from SPEC.md mapped to specific dependencies.

| Feature | User Story | Dependencies Required | Status |
|---------|-----------|----------------------|--------|
| **Calendar View** | US1 | Next.js, React, Tailwind, date-fns | ✅ Core |
| **Month Navigation** | US1 | lucide-react (chevron icons) | ✅ Add |
| **Google Calendar Sync** | US4 | @modelcontextprotocol/sdk, zod | ✅ Add |
| **Click to Block** | US2 | React (native events), clsx | ✅ Core |
| **Drag Selection** | US5 | React (native events), custom hook | ✅ Native |
| **Half-Day Blocking** | US3 | @radix-ui/react-context-menu | ✅ Add |
| **Visual States** | US2 | Tailwind, clsx, tailwind-merge | ✅ Core |
| **State Persistence** | US2 | localStorage (native API) | ✅ Native |
| **Loading States** | 6.1 | React (Suspense), Tailwind | ✅ Core |
| **Error Boundaries** | 6.2 | React (ErrorBoundary) | ✅ Core |
| **Keyboard Navigation** | 4.4 | React (native events) | ✅ Native |
| **Toolbar Controls** | 2.4 | lucide-react, shadcn/ui Button | ✅ Add |
| **Today Highlighting** | US1 | date-fns (isToday), Tailwind | ✅ Core |
| **Event Display** | US4 | @radix-ui/react-tooltip (optional) | ⚠️ Optional |

**Summary**:
- ✅ **Core dependencies**: Cover 70% of features
- ✅ **4 additional packages**: Cover remaining 30%
- ❌ **Zero bloat**: No unnecessary libraries

---

## Installation Strategy

Recommended installation order to match development phases.

### Phase 1: Project Setup (1 hour)

```bash
# 1. Initialize Next.js project
npx create-next-app@latest cal --typescript --tailwind --app --no-src-dir
cd cal

# 2. Install core utilities
npm install date-fns clsx tailwind-merge lucide-react

# 3. Install MCP SDK
npm install @modelcontextprotocol/sdk zod

# 4. Install shadcn/ui
npx shadcn-ui@latest init
# Choose: Default style, Slate color, CSS variables

# 5. Add shadcn/ui components
npx shadcn-ui@latest add button card tooltip context-menu

# 6. Verify installation
npm run dev
```

**Total time**: 30 min
**Dependencies installed**: 14 packages
**Bundle size**: ~180KB gzipped

---

### Phase 6: Testing (Optional)

```bash
# Only if time permits after core MVP
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event @vitejs/plugin-react
```

**Total time**: 10 min
**Bundle impact**: 0KB (dev dependencies)

---

## Bundle Size Analysis

Detailed breakdown of production bundle size.

### Core Framework (Next.js)
| Component | Size (gzipped) | Notes |
|-----------|---------------|-------|
| Next.js runtime | Framework | Not counted (base framework) |
| React runtime | Framework | Not counted (base framework) |
| React DOM | Framework | Not counted (base framework) |

### CSS
| Component | Size (gzipped) | Notes |
|-----------|---------------|-------|
| Tailwind CSS (purged) | ~10KB | Only used utilities |

### JavaScript Libraries
| Package | Size (gzipped) | Tree-shakeable? | Actual Usage |
|---------|---------------|-----------------|--------------|
| date-fns | ~15KB | ✅ Yes | ~10KB (8 functions) |
| clsx | ~1KB | N/A | 1KB |
| tailwind-merge | ~8KB | ❌ No | 8KB |
| lucide-react | ~5KB | ✅ Yes | ~2KB (5 icons) |
| @radix-ui/react-context-menu | ~12KB | ❌ No | 12KB |
| @radix-ui/react-tooltip | ~8KB | ❌ No | 8KB |
| @radix-ui/react-slot | ~2KB | ❌ No | 2KB |
| class-variance-authority | ~3KB | ❌ No | 3KB |
| @modelcontextprotocol/sdk | ~25KB | ⚠️ Partial | ~15KB (client only) |
| zod | ~15KB | ✅ Yes | ~10KB (schemas) |

### Application Code
| Component | Size (gzipped) | Notes |
|-----------|---------------|-------|
| React components | ~20KB | CalendarGrid, DayCell, Toolbar, etc. |
| Hooks | ~5KB | useDragSelection, useKeyboardNav, useCalendar |
| Utilities | ~5KB | Date helpers, storage helpers |
| Contexts | ~5KB | AvailabilityContext |
| API routes | ~10KB | MCP bridge |

### Total Bundle Size Estimate

| Category | Size (gzipped) |
|----------|---------------|
| **CSS** | 10KB |
| **JavaScript Libraries** | 71KB |
| **Application Code** | 45KB |
| **Buffer (20%)** | 25KB |
| **TOTAL** | **151KB** |

**Status**: ✅ **49KB under budget** (target: 200KB)

**Bundle optimization tips**:
1. Tree-shake date-fns imports: `import { format } from 'date-fns'` ✅
2. Use dynamic imports for heavy components (calendar grid) if needed
3. Enable Next.js built-in minification and compression
4. Use `next/dynamic` for code splitting if bundle grows

---

## Timeline Impact Analysis

Impact of each dependency on the 11-hour timeline.

| Dependency | Installation Time | Integration Time | Learning Curve | Total Impact |
|------------|------------------|------------------|----------------|--------------|
| **date-fns** | 2 min | 10 min | Low | 12 min ✅ |
| **clsx + tailwind-merge** | 2 min | 5 min | Low | 7 min ✅ |
| **lucide-react** | 2 min | 5 min | Low | 7 min ✅ |
| **@modelcontextprotocol/sdk** | 3 min | 30 min | Medium | 33 min ✅ |
| **shadcn/ui components** | 5 min | 10 min | Low | 15 min ✅ |
| **Radix UI Context Menu** | Included | 15 min | Medium | 15 min ✅ |

**Total dependency overhead**: **1 hour 29 minutes**
**Already budgeted in phases**: ✅ Yes (Phase 1: 1 hour, Phase 5: 30 min)

### Time Saved by NOT Using

| Avoided Dependency | Time Saved | Complexity Avoided |
|-------------------|------------|-------------------|
| react-dnd | 45 min | High |
| Redux/Zustand | 30 min | Medium |
| localforage | 15 min | Low |
| Jest (vs Vitest) | 20 min | Medium |

**Total time saved**: **1 hour 50 minutes**

**Net timeline impact**: ✅ **+21 minutes saved** (more time for core features)

---

## Complete package.json Template

Ready-to-paste `package.json` for the MVP.

```json
{
  "name": "cal-availability",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "next": "14.2.15",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "typescript": "^5.3.3",

    "@modelcontextprotocol/sdk": "^1.0.2",
    "zod": "^3.22.4",

    "date-fns": "^3.0.6",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.1",
    "lucide-react": "^0.344.0",

    "@radix-ui/react-context-menu": "^2.1.5",
    "@radix-ui/react-tooltip": "^1.0.7",
    "@radix-ui/react-slot": "^1.0.2",
    "class-variance-authority": "^0.7.0"
  },
  "devDependencies": {
    "@types/node": "^20.11.16",
    "@types/react": "^18.2.52",
    "@types/react-dom": "^18.2.18",

    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.33",
    "tailwindcss": "^3.4.1",

    "eslint": "^8.56.0",
    "eslint-config-next": "14.2.15"
  }
}
```

**Installation command**:
```bash
npm install
```

**Production build size check**:
```bash
npm run build
# Check: .next/static/**/*.js sizes
```

---

## Installation Script

Complete setup script for Phase 1.

```bash
#!/bin/bash
# cal-setup.sh - Complete project setup

set -e  # Exit on error

echo "🚀 Setting up Calendar Availability System..."

# 1. Create Next.js project
echo "📦 Creating Next.js project..."
npx create-next-app@latest cal \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*" \
  --use-npm

cd cal

# 2. Install dependencies
echo "📦 Installing dependencies..."
npm install \
  date-fns \
  clsx \
  tailwind-merge \
  lucide-react \
  @modelcontextprotocol/sdk \
  zod

# 3. Setup shadcn/ui
echo "🎨 Setting up shadcn/ui..."
npx shadcn-ui@latest init -y -d

# 4. Add shadcn/ui components
echo "🎨 Adding UI components..."
npx shadcn-ui@latest add button -y
npx shadcn-ui@latest add card -y
npx shadcn-ui@latest add tooltip -y
npx shadcn-ui@latest add context-menu -y

# 5. Create directory structure
echo "📁 Creating directory structure..."
mkdir -p lib/{mcp,utils}
mkdir -p hooks
mkdir -p contexts
mkdir -p types
mkdir -p components/calendar

# 6. Verify installation
echo "✅ Verifying installation..."
npm run type-check

echo "✨ Setup complete! Run 'npm run dev' to start development."
```

**Usage**:
```bash
chmod +x cal-setup.sh
./cal-setup.sh
```

---

## Testing Dependency Decision Matrix

If you decide to add testing in Phase 6 (optional).

### Vitest vs Jest

| Factor | Vitest | Jest | Winner |
|--------|--------|------|--------|
| **Speed** | 10x faster (Vite-powered) | Slower (babel transform) | ✅ Vitest |
| **Setup** | Minimal (5 min) | Complex (20 min) | ✅ Vitest |
| **Next.js integration** | Good | Native | ⚠️ Jest |
| **Bundle size** | Same | Same | Tie |
| **Learning curve** | Low (Jest-compatible API) | Low | Tie |
| **Ecosystem** | Growing | Mature | Jest |

**Recommendation**: ✅ **Vitest** for greenfield projects (our case)

**Configuration**:
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    css: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './')
    }
  }
});
```

```typescript
// vitest.setup.ts
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
```

**Example test**:
```typescript
// components/calendar/__tests__/DayCell.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DayCell } from '../DayCell';

describe('DayCell', () => {
  it('renders date number', () => {
    render(<DayCell date={new Date('2025-01-15')} />);
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('applies blocked styling', () => {
    const { container } = render(
      <DayCell date={new Date('2025-01-15')} blockStatus="blocked" />
    );
    expect(container.firstChild).toHaveClass('bg-red-500');
  });
});
```

---

## Recommendations Summary

### ✅ Add Immediately (Phase 1)

1. **@modelcontextprotocol/sdk** + **zod** - Required for Google Calendar sync
2. **clsx** + **tailwind-merge** - Required for conditional styling
3. **lucide-react** - Required for toolbar icons
4. **shadcn/ui components** (Radix UI) - Required for accessible context menu

**Total**: 8 packages, ~70KB bundle, 30 min integration time

---

### ⚠️ Add Later (Phase 6, if time permits)

1. **Vitest** + **@testing-library/react** - Testing infrastructure

**Total**: 5 packages, 0KB bundle (dev only), 1 hour setup + testing time

---

### ❌ Skip Entirely

1. **react-dnd / react-beautiful-dnd** - Native mouse events are sufficient
2. **Redux / Zustand** - React Context is sufficient
3. **localforage** - Native localStorage is sufficient
4. **type-fest / utility-types** - TypeScript built-ins are sufficient
5. **Moment.js / Day.js** - date-fns already chosen

**Total savings**: 100KB bundle, 2 hours development time

---

## Final Verdict

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| **Bundle size** | < 200KB | ~151KB | ✅ 49KB under |
| **Dependencies** | Minimal | 18 total | ✅ Lean |
| **Timeline impact** | Neutral | +21 min saved | ✅ Faster |
| **Complexity** | Low | Low | ✅ Simple |
| **MVP completeness** | 100% | 100% | ✅ Complete |

**Ready to ship**: ✅ All P0 features covered with minimal, battle-tested dependencies.

---

## Quick Reference: Installation Commands

```bash
# Phase 1 (30 min) - Complete setup
npx create-next-app@latest cal --typescript --tailwind --app --no-src-dir
cd cal
npm install date-fns clsx tailwind-merge lucide-react @modelcontextprotocol/sdk zod
npx shadcn-ui@latest init -y
npx shadcn-ui@latest add button card tooltip context-menu -y

# Phase 6 (optional) - Testing
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event @vitejs/plugin-react
```

**That's it.** No bloat, no complexity, no wasted time.

---

**Document Status**: ✅ Ready for implementation
**Next Step**: Run installation script and begin Phase 2 (Core Calendar Component)
