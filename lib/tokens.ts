/** DR.CRIPTO design tokens — fonte única para JS/TS.
 * Espelha as CSS vars em `styles/globals.css`. Atualize os dois juntos.
 * Nota: a chave `green` é mantida (= escala de marca) mas os valores são violeta. */

export const palette = {
  green: {
    900: '#3b0764',
    700: '#7c2fd6',
    500: '#9d2bed',
    300: '#cf9bf5',
    100: '#f1e3fc',
  },
  ink: {
    900: '#1a0f2e',
    700: '#382b4a',
    500: '#6a5f7a',
    300: '#c0b8cc',
    200: '#e8e3ef',
    100: '#f4f1f8',
  },
  white: '#ffffff',
  offWhite: '#faf8fc',
} as const;

export const radius = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const easing = {
  /** Movimento orgânico — entrada de elementos */
  out: [0.16, 1, 0.3, 1],
  /** Estável — saídas / colapsos */
  inOut: [0.65, 0, 0.35, 1],
} as const;
