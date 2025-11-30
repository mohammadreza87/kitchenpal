/**
 * KitchenPal Color Palette
 * Material Design 3 inspired color system with warm, food-friendly tones
 */

export const colors = {
  primary: {
    0: '#1a0b07',
    10: '#33160d',
    20: '#4d2114',
    30: '#662c1b',
    40: '#994228',
    50: '#cc5835',
    60: '#ff7043', // Main
    70: '#ff8b68',
    80: '#ffa88e', // Inverse Primary
    90: '#ffc5b4', // Fixed Dim
    95: '#ffd4c6', // Container
    98: '#ffe2d9', // Fixed
    100: '#fff9f8',
  },
  secondary: {
    0: '#1a1508',
    10: '#332b10',
    20: '#4d4018',
    30: '#665620',
    40: '#99802f',
    50: '#ccab3f',
    60: '#ffd54f', // Main
    70: '#ffde72',
    80: '#ffe695',
    90: '#ffefb9', // Fixed Dim
    95: '#fff3ca', // Container
    98: '#fff7dc', // Fixed
    100: '#fffffd',
  },
  tertiary: {
    0: '#1a060d',
    10: '#330d1a',
    20: '#4d1326',
    30: '#661a33',
    40: '#99264d',
    50: '#cc3366',
    60: '#ff4081', // Main
    70: '#ff6699',
    80: '#ff8cb3',
    90: '#ffb3cc', // Fixed Dim
    95: '#ffc6d9', // Container
    98: '#ffd9e6', // Fixed
    100: '#fff6f9',
  },
  error: {
    0: '#170506',
    10: '#2d0a0b',
    20: '#440f11',
    30: '#5b1416',
    40: '#881e21',
    50: '#b6282d',
    60: '#e33338', // Main
    70: '#e9575c',
    80: '#ee7f82',
    90: '#f4a8aa',
    95: '#f7bdbf',
    99: '#fce9e9', // Container
    100: '#fffbfb',
  },
  neutral: {
    0: '#141414',
    10: '#282828',
    20: '#3c3c3c',
    30: '#515151',
    35: '#656565',
    40: '#797979', // Outline
    50: '#a1a1a1',
    60: '#c9c9c9',
    70: '#d4d4d4',
    80: '#dfdfdf',
    90: '#eaeaea',
    92: '#f2f2f2',
    95: '#efefef', // Surface Dim/Container
    96: '#fafafa',
    98: '#f4f4f4', // Surface Bright
    99: '#fafafa', // Surface
    100: '#ffffff',
  },
  neutralVariant: {
    0: '#161616',
    10: '#2c2c2c', // Inverse Surface
    20: '#434343', // On Surface Variant
    30: '#595959',
    40: '#858585',
    50: '#b1b1b1',
    55: '#c8c8c8', // Outline Variant
    60: '#dddddd',
    70: '#e4e4e4',
    80: '#ebebeb',
    90: '#f2f2f2',
    95: '#f5f5f5',
    98: '#f8f8f8',
    100: '#ffffff',
  },
} as const

export type ColorScale = keyof typeof colors
export type ColorTone = keyof typeof colors.primary

/**
 * Semantic color roles for consistent theming
 */
export const semanticColors = {
  // Surfaces
  surface: colors.neutral[99],
  surfaceBright: colors.neutral[98],
  surfaceDim: colors.neutral[95],
  surfaceContainer: colors.neutral[95],
  surfaceContainerLow: colors.neutral[96],
  surfaceContainerHigh: colors.neutral[92],
  surfaceContainerHighest: colors.neutral[90],
  surfaceContainerLowest: colors.neutral[100],
  
  // On Surface
  onSurface: colors.neutral[10],
  onSurfaceVariant: colors.neutralVariant[20],
  
  // Inverse
  inverseSurface: colors.neutralVariant[10],
  inverseOnSurface: colors.neutral[99],
  inversePrimary: colors.primary[80],
  
  // Borders
  outline: colors.neutral[40],
  outlineVariant: colors.neutralVariant[55],
  
  // Effects
  scrim: colors.neutral[10],
  shadow: colors.neutral[10],
} as const
