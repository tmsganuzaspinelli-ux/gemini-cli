'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';

/** Barra superior con las dos únicas secciones y el botón de salir. */
export default function Cabecera({ nombreAlumna }: { nombreAlumna: string }) {
  const router = useRouter();
  const ruta = usePathname();

  async function salir() {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    router.push('/');
    router.refresh();
  }

  const enlace = (destino: string, etiqueta: string) => {
    const activo = ruta === destino;
    return (
      <Link
        href={destino}
        aria-current={activo ? 'page' : undefined}
        className={`inline-flex min-h-control items-center rounded-suave border-2 px-5 py-2 text-base font-semibold transition ${
          activo
            ? 'border-white bg-white text-charles'
            : 'border-white/60 text-white hover:bg-white/10'
        }`}
      >
        {etiqueta}
      </Link>
    );
  };

  return (
    <header className="bg-charles text-white">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 px-5 py-5">
        <p className="text-lg font-bold">
          Buenas, {nombreAlumna}
        </p>

        <nav className="flex flex-wrap gap-3" aria-label="Secciones">
          {enlace('/tertulia', 'La Tertulia')}
          {enlace('/cuaderno', 'Mi Cuaderno')}
          <button
            type="button"
            onClick={salir}
            className="inline-flex min-h-control items-center rounded-suave border-2 border-white/60 px-5 py-2 text-base font-semibold text-white transition hover:bg-white/10"
          >
            Salir
          </button>
        </nav>
      </div>
    </header>
  );
}
