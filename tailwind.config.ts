import type { Config } from 'tailwindcss';

/**
 * Paleta y escalas pensadas "senior-first":
 * - Base tipográfica de 20px (no 16px), fijada en globals.css con `font-size: 125%`.
 * - Contrastes medidos contra WCAG AAA (7:1 para texto normal); los ratios van
 *   anotados junto a cada color.
 * - Alturas de control generosas: `min-h-control` son 3.5rem, y como la raíz va
 *   al 125% eso son 70px reales (no 56). El mínimo táctil recomendado es 44px,
 *   así que vamos holgados a propósito: manos poco firmes agradecen el margen.
 */
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Crema cálida de fondo; descansa la vista frente a un blanco puro.
        papel: '#FBF7F0',
        pergamino: '#F3EADA',
        // Texto principal: 16.38:1 sobre `papel` (AAA).
        tinta: '#1C1917',
        // Texto secundario: 9.62:1 sobre `papel`, 9.25:1 sobre `butacaSuave` (AAA).
        tintaSuave: '#44403C',
        // Verde botella del Profesor Charles: 9.11:1 con texto blanco (AAA).
        charles: '#14532D',
        charlesClaro: '#166534',
        // Dorado de sala de cine. El tono anterior (#8C5A16) daba 5.27:1 sobre
        // `butacaSuave`: suficiente para texto grande, pero por debajo del 7:1
        // que AAA pide para texto normal, y ahí va la etiqueta de la tarjeta de
        // lección. Este oscurece el mismo tono hasta 7.21:1 sobre `butacaSuave`
        // y 7.49:1 sobre `papel`.
        butaca: '#704812',
        butacaSuave: '#FDF2DC',
        // Estados: elegidos por contraste, no por saturación.
        alerta: '#7F1D1D',
        alertaSuave: '#FEF2F2',
      },
      fontSize: {
        // Escala corrida hacia arriba: `base` son 20px.
        sm: ['1.0625rem', { lineHeight: '1.6rem' }],
        base: ['1.25rem', { lineHeight: '1.95rem' }],
        lg: ['1.4375rem', { lineHeight: '2.15rem' }],
        xl: ['1.625rem', { lineHeight: '2.3rem' }],
        '2xl': ['1.9375rem', { lineHeight: '2.6rem' }],
        '3xl': ['2.375rem', { lineHeight: '2.9rem' }],
      },
      minHeight: {
        control: '3.5rem', // 70px reales (la raíz va al 125%)
      },
      borderRadius: {
        suave: '1rem',
      },
      boxShadow: {
        tarjeta: '0 2px 10px rgba(28, 25, 23, 0.08)',
        foco: '0 0 0 4px #FDE68A, 0 0 0 8px #14532D',
      },
    },
  },
  plugins: [],
};

export default config;
