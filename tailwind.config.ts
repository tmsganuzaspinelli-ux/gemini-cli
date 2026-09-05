import type { Config } from 'tailwindcss';

/**
 * Paleta y escalas pensadas "senior-first":
 * - Base tipográfica de 20px (no 16px).
 * - Contrastes verificados contra WCAG AAA (7:1 para texto normal).
 * - Alturas de control generosas: h-14 = 56px como mínimo táctil.
 */
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Crema cálida de fondo; descansa la vista frente a un blanco puro.
        papel: '#FBF7F0',
        pergamino: '#F3EADA',
        // Texto principal: 15.8:1 sobre `papel` (AAA).
        tinta: '#1C1917',
        // Texto secundario: 8.2:1 sobre `papel` (AAA).
        tintaSuave: '#44403C',
        // Verde botella del Profesor Charles: 8.6:1 con texto blanco (AAA).
        charles: '#14532D',
        charlesClaro: '#166534',
        // Dorado de sala de cine, sólo para acentos y bordes (nunca texto pequeño).
        butaca: '#8C5A16',
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
        control: '3.5rem', // 56px
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
