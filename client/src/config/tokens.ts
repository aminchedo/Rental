/**
 * Design Tokens - Single Source of Truth
 * 
 * All colors, spacing, typography, and other design values
 * are defined here to ensure consistency across the application.
 */

// Color System
export const colors = {
  // Primary brand colors
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  
  // Semantic status colors
  success: {
    light: '#10b981',
    DEFAULT: '#059669',
    dark: '#047857',
  },
  warning: {
    light: '#fbbf24',
    DEFAULT: '#f59e0b',
    dark: '#d97706',
  },
  danger: {
    light: '#ef4444',
    DEFAULT: '#dc2626',
    dark: '#b91c1c',
  },
  info: {
    light: '#3b82f6',
    DEFAULT: '#2563eb',
    dark: '#1d4ed8',
  },
  
  // Neutral grays (light mode)
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  
  // Dark mode specific
  dark: {
    bg: {
      primary: '#0f172a',
      secondary: '#1e293b',
      tertiary: '#334155',
    },
    text: {
      primary: '#f1f5f9',
      secondary: '#cbd5e1',
      tertiary: '#94a3b8',
    },
    border: '#334155',
  },
  
  // Light mode specific
  light: {
    bg: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      tertiary: '#f1f5f9',
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
      tertiary: '#64748b',
    },
    border: '#e2e8f0',
  },
} as const;

// Typography System
export const typography = {
  // Font families with Persian support
  fontFamily: {
    sans: [
      'Vazirmatn',
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'Helvetica Neue',
      'Arial',
      'sans-serif',
    ].join(', '),
    mono: [
      'JetBrains Mono',
      'Fira Code',
      'Consolas',
      'Monaco',
      'Courier New',
      'monospace',
    ].join(', '),
  },
  
  // Type scale (minimum body 16px)
  fontSize: {
    xs: ['12px', { lineHeight: '1.5', letterSpacing: '0.01em' }],
    sm: ['14px', { lineHeight: '1.5', letterSpacing: '0.01em' }],
    base: ['16px', { lineHeight: '1.6', letterSpacing: '0' }],
    lg: ['18px', { lineHeight: '1.6', letterSpacing: '0' }],
    xl: ['20px', { lineHeight: '1.5', letterSpacing: '-0.01em' }],
    '2xl': ['24px', { lineHeight: '1.4', letterSpacing: '-0.02em' }],
    '3xl': ['30px', { lineHeight: '1.3', letterSpacing: '-0.02em' }],
    '4xl': ['36px', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
    '5xl': ['48px', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
    '6xl': ['60px', { lineHeight: '1', letterSpacing: '-0.02em' }],
  },
  
  // Heading Scale (H1-H6)
  headings: {
    h1: { fontSize: '48px', lineHeight: '1.1', fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontSize: '36px', lineHeight: '1.2', fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontSize: '30px', lineHeight: '1.3', fontWeight: 600, letterSpacing: '-0.02em' },
    h4: { fontSize: '24px', lineHeight: '1.4', fontWeight: 600, letterSpacing: '-0.01em' },
    h5: { fontSize: '20px', lineHeight: '1.5', fontWeight: 600, letterSpacing: '0' },
    h6: { fontSize: '18px', lineHeight: '1.6', fontWeight: 600, letterSpacing: '0' },
  },
  
  // Body Text Variants
  body: {
    large: { fontSize: '18px', lineHeight: '1.6', fontWeight: 400 },
    base: { fontSize: '16px', lineHeight: '1.6', fontWeight: 400 },
    small: { fontSize: '14px', lineHeight: '1.5', fontWeight: 400 },
  },
  
  // Meta/Caption Text
  meta: {
    large: { fontSize: '14px', lineHeight: '1.5', fontWeight: 400 },
    base: { fontSize: '12px', lineHeight: '1.5', fontWeight: 400 },
    small: { fontSize: '11px', lineHeight: '1.4', fontWeight: 400 },
  },
  
  // Font weights
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  // Line heights
  lineHeight: {
    tight: '1.2',
    snug: '1.4',
    normal: '1.6',
    relaxed: '1.7',
    loose: '2',
  },
} as const;

// Spacing Scale (4/8px base)
export const spacing = {
  0: '0',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
  32: '128px',
} as const;

// Border Radius
export const borderRadius = {
  none: '0',
  sm: '4px',
  base: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
  full: '9999px',
} as const;

// Shadows
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
} as const;

// Breakpoints
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Transitions
export const transitions = {
  duration: {
    fast: '120ms',
    base: '200ms',
    slow: '300ms',
  },
  easing: {
    ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// Z-index scale
export const zIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;

// Interactive element sizes (min 44x44px for accessibility)
export const interactiveSizes = {
  minTarget: '44px',
  button: {
    sm: { height: '32px', padding: '0 12px' },
    base: { height: '40px', padding: '0 16px' },
    lg: { height: '48px', padding: '0 24px' },
  },
  input: {
    sm: { height: '36px', padding: '0 12px' },
    base: { height: '44px', padding: '0 16px' },
    lg: { height: '52px', padding: '0 20px' },
  },
} as const;

// Export all tokens
export const tokens = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  breakpoints,
  transitions,
  zIndex,
  interactiveSizes,
} as const;

export default tokens;
