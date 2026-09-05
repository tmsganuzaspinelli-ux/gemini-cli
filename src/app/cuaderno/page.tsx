import { redirect } from 'next/navigation';
import Cabecera from '@/components/Cabecera';
import Cuaderno from '@/components/Cuaderno';
import { usuarioActual } from '@/lib/session';

export const dynamic = 'force-dynamic';

export default async function PaginaCuaderno() {
  const usuario = await usuarioActual();
  if (!usuario) redirect('/');

  return (
    <>
      <Cabecera nombreAlumna={usuario.displayName} />

      <main id="contenido" className="mx-auto max-w-4xl px-5 py-8">
        <h1 className="mb-2 text-3xl font-bold text-charles">
          Mi Cuaderno de Frases y Películas
        </h1>
        <p className="mb-8 text-lg text-tintaSuave">
          Todo lo que ha querido guardar, siempre a mano y siempre con su audio.
        </p>

        <Cuaderno />
      </main>
    </>
  );
}
