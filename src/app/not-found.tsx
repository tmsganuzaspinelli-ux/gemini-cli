import Link from 'next/link';

export default function NoEncontrado() {
  return (
    <main id="contenido" className="mx-auto max-w-2xl px-5 py-16 text-center">
      <h1 className="text-3xl font-bold text-charles">Esta página no está por aquí</h1>
      <p className="mt-4 text-lg text-tintaSuave">
        No se preocupe, no ha roto usted nada. Vuelva a la tertulia y seguimos charlando.
      </p>
      <Link href="/tertulia" className="boton-principal mt-8">
        Volver con el Profesor Charles
      </Link>
    </main>
  );
}
