export const PALETTE = {
  oracle: {
    50: '#EEF3EF',
    100: '#D8E3DA',
    200: '#B1C6B6',
    300: '#7FA081',
    400: '#5D7B61',
    500: '#33553C',
    600: '#2B4732',
    700: '#213626',
    800: '#18271C',
    900: '#111B13',
  },

  bark: {
    50: '#F7F5F2',
    100: '#ECE7E1',
    200: '#DDD7D0',
    300: '#C9C1B8',
    400: '#AAA298',
    500: '#857E76',
    600: '#66635E',
    700: '#4D4A45',
    800: '#2B2A27',
    900: '#161513',
  },

  neutral: {
    0: '#FFFFFF',
    50: '#FBFAF8',
    100: '#F5F2EE',
    200: '#E2DDD6',
    300: '#D3CDC5',
    400: '#B5AEA6',
    500: '#8B857E',
    600: '#6C6760',
    700: '#514D47',
    800: '#302E2A',
    900: '#161513',
  },

  success: {
    50: '#EEF3EF',
    100: '#D8E3DA',
    500: '#33553C',
    600: '#2B4732',
    700: '#213626',
  },

  warning: {
    50: '#FFF7DE',
    100: '#F7E1A0',
    500: '#F0CC71',
    600: '#CAA94B',
    700: '#8C7126',
  },

  danger: {
    50: '#FEF3F2',
    100: '#FAD8D3',
    500: '#C15B52',
    600: '#A24A43',
    700: '#7D3833',
  },

  info: {
    50: '#EAF5F9',
    100: '#C9E4EE',
    500: '#006B8F',
    600: '#005E7D',
    700: '#00475E',
  },
} as const

export const TOKENS = {
  text: {
    primary: 'text-[#161513]',
    secondary: 'text-[#66635E]',
    muted: 'text-[#8B857E]',
    inverse: 'text-white',
    brand: 'text-[#33553C]',
    success: 'text-[#213626]',
    warning: 'text-[#8C7126]',
    danger: 'text-[#7D3833]',
    info: 'text-[#00475E]',
  },

  bg: {
    page: 'bg-white',
    pageSubtle: 'bg-[#FBFAF8]',
    surface: 'bg-white',
    surfaceSubtle: 'bg-[#FBFAF8]',
    surfaceMuted: 'bg-[#F5F2EE]',
    brand: 'bg-[#33553C]',
    brandHover: 'hover:bg-[#2B4732]',
    brandSoft: 'bg-[#EEF3EF]',
    dark: 'bg-[#161513]',
    darkHover: 'hover:bg-[#2B2A27]',
    neutral: 'bg-[#F5F2EE]',
    success: 'bg-[#33553C]',
    successSoft: 'bg-[#EEF3EF]',
    warning: 'bg-[#F0CC71]',
    warningSoft: 'bg-[#FFF7DE]',
    danger: 'bg-[#C15B52]',
    dangerSoft: 'bg-[#FEF3F2]',
    info: 'bg-[#006B8F]',
    infoSoft: 'bg-[#EAF5F9]',
  },

  border: {
    subtle: 'border-[#E2DDD6]',
    base: 'border-[#D3CDC5]',
    strong: 'border-[#B5AEA6]',
    brand: 'border-[#33553C]',
    brandSoft: 'border-[#D8E3DA]',
    dark: 'border-[#161513]',
    success: 'border-[#33553C]',
    warning: 'border-[#F0CC71]',
    danger: 'border-[#C15B52]',
    info: 'border-[#006B8F]',
  },

  ring: {
    brand: 'focus:ring-2 focus:ring-[#D8E3DA]',
    neutral: 'focus:ring-2 focus:ring-[#ECE7E1]',
    success: 'focus:ring-2 focus:ring-[#D8E3DA]',
    warning: 'focus:ring-2 focus:ring-[#F7E1A0]',
    danger: 'focus:ring-2 focus:ring-[#FAD8D3]',
    info: 'focus:ring-2 focus:ring-[#C9E4EE]',
  },

  focus: {
    brand: 'focus:border-[#33553C] focus:ring-2 focus:ring-[#D8E3DA]',
    neutral: 'focus:border-[#B5AEA6] focus:ring-2 focus:ring-[#ECE7E1]',
    success: 'focus:border-[#33553C] focus:ring-2 focus:ring-[#D8E3DA]',
    warning: 'focus:border-[#F0CC71] focus:ring-2 focus:ring-[#F7E1A0]',
    danger: 'focus:border-[#C15B52] focus:ring-2 focus:ring-[#FAD8D3]',
    info: 'focus:border-[#006B8F] focus:ring-2 focus:ring-[#C9E4EE]',
  },
} as const

export const LAYOUT = {
  PAGE_CONTAINER: 'mx-auto max-w-7xl px-6 py-6',
  PAGE_CONTAINER_SM: 'mx-auto max-w-3xl px-6 py-6',
  SECTION_STACK: 'space-y-6',
  CARD_STACK: 'space-y-4',
  INLINE_STACK: 'flex items-center gap-3',
} as const

export const SURFACE = {
  PAGE: 'bg-white',
  PAGE_SUBTLE: 'bg-[#FBFAF8]',
  CARD:
    'rounded-[4px] border border-[#E2DDD6] bg-white shadow-[0_1px_2px_rgba(22,21,19,0.04)]',
  CARD_HOVER:
    'rounded-[4px] border border-[#E2DDD6] bg-white shadow-[0_1px_2px_rgba(22,21,19,0.04)] transition hover:border-[#D3CDC5] hover:shadow-[0_2px_4px_rgba(22,21,19,0.06)]',
  CARD_MUTED:
    'rounded-[4px] border border-[#E2DDD6] bg-[#FBFAF8] shadow-[0_1px_2px_rgba(22,21,19,0.03)]',
  PANEL: 'rounded-[4px] border border-[#E2DDD6] bg-white',
  DIVIDER: 'border-t border-[#E2DDD6]',
} as const

export const TYPO = {
  DISPLAY: 'text-[28px] font-medium leading-tight text-[#161513]',
  H1: 'text-[20px] font-medium leading-7 text-[#161513]',
  H2: 'text-[20px] font-medium leading-7 text-[#161513]',
  H3: 'text-[20px] font-medium leading-7 text-[#161513]',
  H4: 'text-[18px] font-medium leading-6 text-[#161513]',
  METRIC: 'text-[24px] font-medium leading-none text-[#161513]',
  BODY: 'text-[16px] leading-6 text-[#161513]',
  BODY_MUTED: 'text-[16px] leading-6 text-[#66635E]',
  CAPTION: 'text-[14px] leading-5 text-[#8B857E]',
  LABEL: 'text-[14px] font-medium leading-5 text-[#161513]',
  LINK: 'text-[#8C7126] underline underline-offset-4 hover:text-[#33553C]',
} as const

export const INPUT = {
  BASE:
    'h-12 w-full rounded-[4px] border bg-white px-4 text-[16px] shadow-none outline-none transition disabled:cursor-not-allowed disabled:opacity-60',

  DEFAULT:
    'border-[#D3CDC5] bg-white text-[#161513] placeholder:text-[#8B857E] focus:border-[#33553C] focus:ring-2 focus:ring-[#D8E3DA]',

  SUBTLE:
    'border-[#D3CDC5] bg-[#FBFAF8] text-[#161513] placeholder:text-[#8B857E] focus:border-[#33553C] focus:ring-2 focus:ring-[#D8E3DA]',

  ERROR:
    'border-[#C15B52] bg-white text-[#161513] placeholder:text-[#8B857E] focus:border-[#A24A43] focus:ring-2 focus:ring-[#FAD8D3]',

  SUCCESS:
    'border-[#33553C] bg-white text-[#161513] placeholder:text-[#8B857E] focus:border-[#2B4732] focus:ring-2 focus:ring-[#D8E3DA]',

  ICON_LEFT: 'pl-10',
  ICON_RIGHT: 'pr-10',
} as const

export const TEXTAREA = {
  BASE:
    'min-h-[120px] w-full rounded-[4px] border bg-white px-4 py-3 text-[16px] leading-6 shadow-none outline-none transition disabled:cursor-not-allowed disabled:opacity-60',
  DEFAULT:
    'border-[#D3CDC5] bg-white text-[#161513] placeholder:text-[#8B857E] focus:border-[#33553C] focus:ring-2 focus:ring-[#D8E3DA]',
} as const

export const SELECT = {
  BASE:
    'h-12 w-full rounded-[4px] border bg-white px-4 text-[16px] shadow-none outline-none transition disabled:cursor-not-allowed disabled:opacity-60',
  DEFAULT:
    'border-[#D3CDC5] bg-white text-[#161513] focus:border-[#33553C] focus:ring-2 focus:ring-[#D8E3DA]',
} as const

export const BUTTON = {
  BASE:
    'inline-flex items-center justify-center gap-2 rounded-[4px] px-4 py-2 text-[16px] font-medium transition outline-none disabled:pointer-events-none disabled:opacity-60',

  PRIMARY:
    'border border-[#33553C] bg-[#33553C] text-white hover:bg-[#2B4732] focus:ring-2 focus:ring-[#D8E3DA]',

  SECONDARY:
    'border border-[#D3CDC5] bg-white text-[#161513] hover:bg-[#FBFAF8] hover:text-[#33553C] focus:ring-2 focus:ring-[#ECE7E1]',

  TERTIARY:
    'border border-transparent bg-transparent text-[#161513] hover:bg-[#FBFAF8] hover:text-[#33553C] focus:ring-2 focus:ring-[#ECE7E1]',

  DARK:
    'border border-[#161513] bg-[#161513] text-white hover:bg-[#2B2A27] focus:ring-2 focus:ring-[#ECE7E1]',

  SUCCESS:
    'border border-[#33553C] bg-[#33553C] text-white hover:bg-[#2B4732] focus:ring-2 focus:ring-[#D8E3DA]',

  WARNING:
    'border border-[#F0CC71] bg-[#F0CC71] text-[#161513] hover:bg-[#CAA94B] hover:text-[#161513] focus:ring-2 focus:ring-[#F7E1A0]',

  DANGER:
    'border border-[#C15B52] bg-[#C15B52] text-white hover:bg-[#A24A43] focus:ring-2 focus:ring-[#FAD8D3]',

  GHOST:
    'border border-transparent bg-transparent text-[#8C7126] hover:bg-[#FFF7DE] hover:text-[#33553C] focus:ring-2 focus:ring-[#F7E1A0]',

  LINK:
    'bg-transparent px-0 py-0 text-[#8C7126] hover:text-[#33553C] hover:underline focus:ring-0',

  SM: 'h-9 px-3 text-[14px]',
  MD: 'h-10 px-4 text-[16px]',
  LG: 'h-12 px-5 text-[16px]',
  ICON: 'h-10 w-10 p-0',
} as const

export const BADGE = {
  BASE:
    'inline-flex items-center rounded-[4px] px-2.5 py-1 text-[13px] font-medium',

  BRAND: 'bg-[#EEF3EF] text-[#213626]',
  DARK: 'bg-[#161513] text-white',
  NEUTRAL: 'bg-[#F5F2EE] text-[#514D47]',
  SUCCESS: 'bg-[#EEF3EF] text-[#213626]',
  WARNING: 'bg-[#FFF7DE] text-[#8C7126]',
  DANGER: 'bg-[#FEF3F2] text-[#7D3833]',
  INFO: 'bg-[#EAF5F9] text-[#00475E]',
} as const

export const TABLE = {
  WRAPPER:
    'overflow-hidden rounded-[4px] border border-[#E2DDD6] bg-white shadow-[0_1px_2px_rgba(22,21,19,0.04)]',
  TABLE: 'min-w-full divide-y divide-[#E2DDD6]',
  THEAD: 'bg-[#FBFAF8]',
  TH: 'px-4 py-3 text-left text-[12px] font-medium uppercase tracking-[0.08em] text-[#8B857E]',
  TD: 'px-4 py-3 text-[16px] text-[#161513]',
  TR: 'border-t border-[#ECE7E1] hover:bg-[#FBFAF8]',
} as const

export const LIST = {
  ITEM: 'rounded-[4px] px-3 py-3 transition hover:bg-[#FBFAF8]',
  ITEM_ACTIVE: 'rounded-[4px] bg-[#EEF3EF] px-3 py-3',
} as const

export const NAV = {
  SIDEBAR_ITEM:
    'flex items-center gap-3 rounded-[4px] px-3 py-2 text-[16px] font-medium text-[#161513] transition hover:bg-[#FBFAF8]',
  SIDEBAR_ITEM_ACTIVE:
    'flex items-center gap-3 rounded-[4px] bg-[#EEF3EF] px-3 py-2 text-[16px] font-medium text-[#213626]',
  TAB:
    'inline-flex items-center border-b-2 border-transparent px-0 py-2 text-[16px] font-medium text-[#66635E] transition hover:text-[#161513]',
  TAB_ACTIVE:
    'inline-flex items-center border-b-2 border-[#33553C] px-0 py-2 text-[16px] font-medium text-[#33553C]',
} as const

export const ALERT = {
  BASE: 'rounded-[4px] border px-4 py-3 text-[14px]',
  INFO: 'border-[#C9E4EE] bg-[#EAF5F9] text-[#00475E]',
  SUCCESS: 'border-[#D8E3DA] bg-[#EEF3EF] text-[#213626]',
  WARNING: 'border-[#F7E1A0] bg-[#FFF7DE] text-[#8C7126]',
  DANGER: 'border-[#FAD8D3] bg-[#FEF3F2] text-[#7D3833]',
} as const

export const AVATAR = {
  BASE:
    'flex h-10 w-10 items-center justify-center rounded-[4px] text-[14px] font-medium',

  BRAND: 'bg-[#33553C] text-white',
  DARK: 'bg-[#161513] text-white',
  LIGHT: 'bg-[#EEF3EF] text-[#213626]',
  NEUTRAL: 'bg-[#F5F2EE] text-[#161513]',
  WHITE: 'border border-[#D3CDC5] bg-white text-[#161513]',
} as const

export const INPUT_BASE = `${INPUT.BASE} ${INPUT.DEFAULT}`

export const CARD_BASE = SURFACE.CARD

export const PAGE_CONTAINER = LAYOUT.PAGE_CONTAINER

export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}
