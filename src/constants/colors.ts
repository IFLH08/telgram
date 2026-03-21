  export const PALETTE = {
  oracle: {
    50: '#F9EEEB',
    100: '#F2D5CE',
    200: '#E7B5A9',
    300: '#DB9483',
    400: '#CF735E',
    500: '#C74634', // Oracle red principal
    600: '#A93B2C',
    700: '#8A3024',
    800: '#6C251C',
    900: '#4D1A14',
  },

  bark: {
    50: '#F6F5F5',
    100: '#E7E5E4',
    200: '#D6D3D1',
    300: '#B8B3AF',
    400: '#8F8883',
    500: '#5C5652',
    600: '#45403D',
    700: '#312D2A', // Oracle bark principal
    800: '#262220',
    900: '#1A1716',
  },

  neutral: {
    0: '#FFFFFF',
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  success: {
    50: '#ECFDF3',
    100: '#D1FADF',
    500: '#12B76A',
    600: '#039855',
    700: '#027A48',
  },

  warning: {
    50: '#FFFAEB',
    100: '#FEF0C7',
    500: '#F79009',
    600: '#DC6803',
    700: '#B54708',
  },

  danger: {
    50: '#FEF3F2',
    100: '#FEE4E2',
    500: '#F04438',
    600: '#D92D20',
    700: '#B42318',
  },

  info: {
    50: '#EFF8FF',
    100: '#D1E9FF',
    500: '#2E90FA',
    600: '#1570EF',
    700: '#175CD3',
  },
} as const

export const TOKENS = {
  text: {
    primary: 'text-[#312D2A]',
    secondary: 'text-gray-600',
    muted: 'text-gray-400',
    inverse: 'text-white',
    brand: 'text-[#C74634]',
    success: 'text-[#027A48]',
    warning: 'text-[#B54708]',
    danger: 'text-[#B42318]',
    info: 'text-[#175CD3]',
  },

  bg: {
    page: 'bg-white',
    pageSubtle: 'bg-gray-50',
    surface: 'bg-white',
    surfaceSubtle: 'bg-gray-50',
    surfaceMuted: 'bg-gray-100',
    brand: 'bg-[#C74634]',
    brandHover: 'hover:bg-[#A93B2C]',
    brandSoft: 'bg-[#F9EEEB]',
    dark: 'bg-[#312D2A]',
    darkHover: 'hover:bg-[#262220]',
    neutral: 'bg-[#CBCECE]',
    success: 'bg-[#12B76A]',
    successSoft: 'bg-[#ECFDF3]',
    warning: 'bg-[#F79009]',
    warningSoft: 'bg-[#FFFAEB]',
    danger: 'bg-[#F04438]',
    dangerSoft: 'bg-[#FEF3F2]',
    info: 'bg-[#2E90FA]',
    infoSoft: 'bg-[#EFF8FF]',
  },

  border: {
    subtle: 'border-gray-200',
    base: 'border-gray-300',
    strong: 'border-gray-400',
    brand: 'border-[#C74634]',
    brandSoft: 'border-[#F2D5CE]',
    dark: 'border-[#312D2A]',
    success: 'border-[#12B76A]',
    warning: 'border-[#F79009]',
    danger: 'border-[#F04438]',
    info: 'border-[#2E90FA]',
  },

  ring: {
    brand: 'focus:ring-4 focus:ring-[#F2D5CE]',
    neutral: 'focus:ring-4 focus:ring-gray-100',
    success: 'focus:ring-4 focus:ring-[#D1FADF]',
    warning: 'focus:ring-4 focus:ring-[#FEF0C7]',
    danger: 'focus:ring-4 focus:ring-[#FEE4E2]',
    info: 'focus:ring-4 focus:ring-[#D1E9FF]',
  },

  focus: {
    brand: 'focus:border-[#C74634] focus:ring-4 focus:ring-[#F2D5CE]',
    neutral: 'focus:border-gray-300 focus:ring-4 focus:ring-gray-100',
    success: 'focus:border-[#12B76A] focus:ring-4 focus:ring-[#D1FADF]',
    warning: 'focus:border-[#F79009] focus:ring-4 focus:ring-[#FEF0C7]',
    danger: 'focus:border-[#F04438] focus:ring-4 focus:ring-[#FEE4E2]',
    info: 'focus:border-[#2E90FA] focus:ring-4 focus:ring-[#D1E9FF]',
  },
} as const

export const LAYOUT = {
  PAGE_CONTAINER: 'mx-auto max-w-7xl px-4 py-8',
  PAGE_CONTAINER_SM: 'mx-auto max-w-3xl px-4 py-6',
  SECTION_STACK: 'space-y-6',
  CARD_STACK: 'space-y-4',
  INLINE_STACK: 'flex items-center gap-3',
} as const

export const SURFACE = {
  PAGE: 'bg-white',
  PAGE_SUBTLE: 'bg-gray-50',
  CARD: 'rounded-2xl border border-gray-200 bg-white shadow-sm',
  CARD_HOVER:
    'rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md',
  CARD_MUTED: 'rounded-2xl border border-gray-200 bg-gray-50 shadow-sm',
  PANEL: 'rounded-xl border border-gray-200 bg-white',
  DIVIDER: 'border-t border-gray-200',
} as const

export const TYPO = {
  DISPLAY: 'text-4xl font-bold tracking-tight text-[#312D2A]',
  H1: 'text-3xl font-bold tracking-tight text-[#312D2A]',
  H2: 'text-2xl font-semibold tracking-tight text-[#312D2A]',
  H3: 'text-xl font-semibold text-[#312D2A]',
  H4: 'text-lg font-semibold text-[#312D2A]',
  BODY: 'text-sm text-[#312D2A]',
  BODY_MUTED: 'text-sm text-gray-600',
  CAPTION: 'text-xs text-gray-500',
  LABEL: 'text-sm font-medium text-[#312D2A]',
  LINK: 'text-[#C74634] underline-offset-4 hover:underline',
} as const

export const INPUT = {
  BASE:
    'h-11 w-full rounded-xl border bg-white px-3 text-sm shadow-sm outline-none transition disabled:cursor-not-allowed disabled:opacity-60',

  DEFAULT:
    'border-gray-200 bg-white text-[#312D2A] placeholder:text-gray-400 focus:border-[#C74634] focus:ring-4 focus:ring-[#F2D5CE]',

  SUBTLE:
    'border-gray-200 bg-gray-50 text-[#312D2A] placeholder:text-gray-400 focus:border-[#C74634] focus:ring-4 focus:ring-[#F2D5CE]',

  ERROR:
    'border-[#F04438] bg-white text-[#312D2A] placeholder:text-gray-400 focus:border-[#D92D20] focus:ring-4 focus:ring-[#FEE4E2]',

  SUCCESS:
    'border-[#12B76A] bg-white text-[#312D2A] placeholder:text-gray-400 focus:border-[#039855] focus:ring-4 focus:ring-[#D1FADF]',

  ICON_LEFT: 'pl-10',
  ICON_RIGHT: 'pr-10',
} as const

export const TEXTAREA = {
  BASE:
    'min-h-[120px] w-full rounded-xl border bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition disabled:cursor-not-allowed disabled:opacity-60',
  DEFAULT:
    'border-gray-200 bg-white text-[#312D2A] placeholder:text-gray-400 focus:border-[#C74634] focus:ring-4 focus:ring-[#F2D5CE]',
} as const

export const SELECT = {
  BASE:
    'h-11 w-full rounded-xl border bg-white px-3 text-sm shadow-sm outline-none transition disabled:cursor-not-allowed disabled:opacity-60',
  DEFAULT:
    'border-gray-200 bg-white text-[#312D2A] focus:border-[#C74634] focus:ring-4 focus:ring-[#F2D5CE]',
} as const

export const BUTTON = {
  BASE:
    'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition outline-none disabled:pointer-events-none disabled:opacity-60',

  PRIMARY:
    'bg-[#C74634] text-white hover:bg-[#A93B2C] focus:ring-4 focus:ring-[#F2D5CE]',

  SECONDARY:
    'border border-gray-200 bg-white text-[#312D2A] hover:bg-gray-50 focus:ring-4 focus:ring-gray-100',

  TERTIARY:
    'bg-transparent text-[#312D2A] hover:bg-gray-50 focus:ring-4 focus:ring-gray-100',

  DARK:
    'bg-[#312D2A] text-white hover:bg-[#262220] focus:ring-4 focus:ring-gray-200',

  SUCCESS:
    'bg-[#12B76A] text-white hover:bg-[#039855] focus:ring-4 focus:ring-[#D1FADF]',

  WARNING:
    'bg-[#F79009] text-white hover:bg-[#DC6803] focus:ring-4 focus:ring-[#FEF0C7]',

  DANGER:
    'bg-[#F04438] text-white hover:bg-[#D92D20] focus:ring-4 focus:ring-[#FEE4E2]',

  GHOST:
    'bg-transparent text-[#C74634] hover:bg-[#F9EEEB] focus:ring-4 focus:ring-[#F2D5CE]',

  LINK:
    'bg-transparent px-0 py-0 text-[#C74634] hover:underline focus:ring-0',

  SM: 'h-9 rounded-lg px-3 text-xs',
  MD: 'h-11 px-4 text-sm',
  LG: 'h-12 px-5 text-sm',
  ICON: 'h-11 w-11 rounded-xl p-0',
} as const

export const BADGE = {
  BASE:
    'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',

  BRAND: 'bg-[#F9EEEB] text-[#312D2A]',
  DARK: 'bg-[#312D2A] text-white',
  NEUTRAL: 'bg-gray-100 text-gray-700',
  SUCCESS: 'bg-[#ECFDF3] text-[#027A48]',
  WARNING: 'bg-[#FFFAEB] text-[#B54708]',
  DANGER: 'bg-[#FEF3F2] text-[#B42318]',
  INFO: 'bg-[#EFF8FF] text-[#175CD3]',
} as const

export const TABLE = {
  WRAPPER: 'overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm',
  TABLE: 'min-w-full divide-y divide-gray-200',
  THEAD: 'bg-gray-50',
  TH: 'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500',
  TD: 'px-4 py-3 text-sm text-[#312D2A]',
  TR: 'border-t border-gray-100 hover:bg-gray-50',
} as const

export const LIST = {
  ITEM: 'rounded-xl px-3 py-3 transition hover:bg-gray-50',
  ITEM_ACTIVE: 'rounded-xl bg-[#F9EEEB] px-3 py-3',
} as const

export const NAV = {
  SIDEBAR_ITEM:
    'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-[#312D2A] transition hover:bg-gray-100',
  SIDEBAR_ITEM_ACTIVE:
    'flex items-center gap-3 rounded-xl bg-[#F9EEEB] px-3 py-2 text-sm font-semibold text-[#312D2A]',
  TAB:
    'inline-flex items-center border-b-2 border-transparent px-3 py-2 text-sm font-medium text-gray-600 transition hover:text-[#312D2A]',
  TAB_ACTIVE:
    'inline-flex items-center border-b-2 border-[#C74634] px-3 py-2 text-sm font-semibold text-[#312D2A]',
} as const

export const ALERT = {
  BASE: 'rounded-xl border px-4 py-3 text-sm',
  INFO: 'border-[#D1E9FF] bg-[#EFF8FF] text-[#175CD3]',
  SUCCESS: 'border-[#D1FADF] bg-[#ECFDF3] text-[#027A48]',
  WARNING: 'border-[#FEF0C7] bg-[#FFFAEB] text-[#B54708]',
  DANGER: 'border-[#FEE4E2] bg-[#FEF3F2] text-[#B42318]',
} as const

export const AVATAR = {
  BASE:
    'flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold',

  BRAND: 'bg-[#C74634] text-white',
  DARK: 'bg-[#312D2A] text-white',
  LIGHT: 'bg-[#F9EEEB] text-[#312D2A]',
  NEUTRAL: 'bg-[#CBCECE] text-black',
  WHITE: 'border border-gray-300 bg-white text-[#312D2A]',
} as const

export const INPUT_BASE = `${INPUT.BASE} ${INPUT.DEFAULT}`

export const CARD_BASE = SURFACE.CARD

export const PAGE_CONTAINER = LAYOUT.PAGE_CONTAINER

export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}
