import { redirect } from 'next/navigation';
import LoginForm from '@/components/LoginForm';
import { usuarioActual } from '@/lib/session';

// La sesión se lee en cada visita: nunca se cachea esta página.
export const dynamic = 'force-dynamic';

export default async function PaginaLogin() {
  // Si su sesión de 60 días sigue viva, entra directa a la tertulia.
  if (await usuarioActual()) redirect('/tertulia');

  return (
    <main id="contenido" className="mx-auto max-w-2xl px-5 py-12">
      <div className="mb-10 text-center">
        <p className="text-5xl" aria-hidden="true">
          🎩
        </p>
        <h1 className="mt-4 text-3xl font-bold text-charles">Profesor Charles</h1>
        <p className="mt-3 text-lg text-tintaSuave">
          Su clase de inglés, tranquila y con buen cine.
        </p>
      </div>

      <LoginForm />
    </main>
  );
}
