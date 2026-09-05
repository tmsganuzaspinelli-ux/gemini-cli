import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Profesor Charles — Su clase de inglés',
  description:
    'Clases de inglés en una tertulia tranquila, con recomendaciones de cine, pensadas para disfrutarlas sin prisa.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Nunca bloqueamos el zoom: si quiere agrandar más la letra, puede.
  maximumScale: 5,
  themeColor: '#14532D',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <a
          href="#contenido"
          className="sr-only rounded-suave bg-charles px-4 py-3 text-white focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50"
        >
          Ir al contenido
        </a>
        {children}
      </body>
    </html>
  );
}
