import { redirect } from 'next/navigation';
import Cabecera from '@/components/Cabecera';
import Tertulia from '@/components/Tertulia';
import { usuarioActual } from '@/lib/session';

export const dynamic = 'force-dynamic';

export default async function PaginaTertulia() {
  const usuario = await usuarioActual();
  if (!usuario) redirect('/');

  return (
    <>
      <Cabecera nombreAlumna={usuario.displayName} />

      <main id="contenido" className="mx-auto max-w-4xl px-5 py-8">
        <h1 className="mb-6 text-3xl font-bold text-charles">La Tertulia con Charles</h1>
        <Tertulia nombreAlumna={usuario.displayName} />
      </main>
    </>
  );
}
