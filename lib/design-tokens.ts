/**
 * Design Tokens
 *
 * Purpose: Systematic design system tokens following LibreUIUX + Design Mastery principles
 *
 * Features:
 * - HSL color palette (primary, semantic, glassmorphism)
 * - Typography scale (Inter font family)
 * - Spacing system (Tailwind scale)
 * - Border radius tokens
 * - Shadow system (depth and glass effects)
 *
 * Principles Applied:
 * - Dieter Rams "Less, but better" - Minimal but purposeful tokens
 * - Gestalt principles - Systematic color relationships
 * - WCAG AAA compliance - High contrast ratios
 *
 * @see docs/UI-IMPROVEMENT-SPEC.md Lines 59-158 for specification
 */

// ==========================================
// COLOR PALETTE
// ==========================================

export const colors = {
  // Primary (Calendar actions) - Blue scale
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

  // Semantic (State colors) - Blocked date states
  blocked: {
    am: 'hsl(25, 95%, 63%)',      // Warm orange (morning)
    pm: 'hsl(280, 65%, 60%)',     // Purple (afternoon)
    full: 'hsl(0, 84%, 60%)',     // Red (full day)
  },

  // Available state - Green scale
  available: {
    light: 'hsl(142, 76%, 96%)',  // Very light green
    base: 'hsl(142, 71%, 45%)',   // Green
    dark: 'hsl(142, 76%, 36%)',
  },

  // Glassmorphism effects
  glass: {
    white: 'rgba(255, 255, 255, 0.1)',
    dark: 'rgba(0, 0, 0, 0.1)',
    border: 'rgba(255, 255, 255, 0.18)',
  },
} as const;

// ==========================================
// SHADOW SYSTEM (Depth + Glass)
// ==========================================

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
} as const;

// ==========================================
// TYPOGRAPHY SCALE
// ==========================================

export const typography = {
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
} as const;

// ==========================================
// SPACING SYSTEM (Tailwind scale)
// ==========================================

export const spacing = {
  // Common patterns
  cardPadding: 'p-6',           // 24px inside cards
  sectionGap: 'space-y-8',      // 32px between sections
  gridGap: 'gap-1',             // 4px between calendar cells
  buttonPadding: 'px-4 py-2',   // 16px horizontal, 8px vertical
} as const;

// ==========================================
// BORDER RADIUS
// ==========================================

export const borderRadius = {
  sm: 'rounded-sm',      // 2px
  base: 'rounded',       // 4px
  md: 'rounded-md',      // 6px
  lg: 'rounded-lg',      // 8px
  xl: 'rounded-xl',      // 12px
  '2xl': 'rounded-2xl',  // 16px
  '3xl': 'rounded-3xl',  // 24px
  full: 'rounded-full',  // 9999px (circles)
} as const;

// ==========================================
// GLASSMORPHISM UTILITIES
// ==========================================

/**
 * Glassmorphism card effect
 * Usage: <div className={glassmorphicCard}>...</div>
 */
export const glassmorphicCard = [
  'bg-white/70',
  'backdrop-blur-md',
  'border border-white/20',
  'shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]',
].join(' ');

/**
 * Glassmorphic background for blocked dates
 * Usage: <div className={glassmorphicBlocked}>...</div>
 */
export const glassmorphicBlocked = [
  'backdrop-blur-sm',
  'border border-white/20',
].join(' ');

// ==========================================
// ANIMATION VARIANTS (Framer Motion)
// ==========================================

/**
 * Stagger children animation (for grid cells)
 */
export const staggerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.02, // 20ms delay between each child
    },
  },
};

/**
 * Fade in from below (for individual cells)
 */
export const cellVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2 },
  },
};

/**
 * Month transition (slide in/out)
 */
export const monthTransitionVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 20 : -20,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -20 : 20,
    opacity: 0,
  }),
};

// ==========================================
// RESPONSIVE BREAKPOINTS
// ==========================================

/**
 * Tailwind breakpoints reference
 * sm: 640px   - Small tablets
 * md: 768px   - Tablets
 * lg: 1024px  - Laptops
 * xl: 1280px  - Desktops
 * 2xl: 1536px - Large desktops
 */
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ==========================================
// ACCESSIBILITY CONSTANTS
// ==========================================

/**
 * Minimum touch target size (Apple HIG / Material Design)
 */
export const MIN_TOUCH_TARGET = 44; // px

/**
 * WCAG AA contrast ratio requirement
 */
export const WCAG_AA_CONTRAST = 4.5;

/**
 * WCAG AAA contrast ratio requirement
 */
export const WCAG_AAA_CONTRAST = 7.0;
