'use client';

import { useEffect, useState } from 'react';
import BotonesDeVoz from '@/components/BotonesDeVoz';
import { useSpeech } from '@/hooks/useSpeech';

type FraseGuardada = {
  id: string;
  english: string;
  spanish: string;
  phonetics: string;
  movieTitle: string | null;
  movieYear: number | null;
  movieNote: string | null;
  kind: string;
  createdAt: string;
};

/** "Mi Cuaderno de Frases y Películas". */
export default function Cuaderno() {
  const [frases, setFrases] = useState<FraseGuardada[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const voz = useSpeech();

  useEffect(() => {
    let cancelado = false;

    (async () => {
      try {
        const respuesta = await fetch('/api/cuaderno');
        if (!respuesta.ok) throw new Error('fallo');
        const datos = await respuesta.json();
        if (!cancelado) setFrases(datos.frases ?? []);
      } catch {
        if (!cancelado) setError('No he podido abrir su cuaderno ahora mismo. Pruebe en un momentito.');
      } finally {
        if (!cancelado) setCargando(false);
      }
    })();

    return () => {
      cancelado = true;
    };
  }, []);

  async function borrar(id: string) {
    const anteriores = frases;
    setFrases((f) => f.filter((x) => x.id !== id));
    try {
      const respuesta = await fetch(`/api/cuaderno?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (!respuesta.ok) throw new Error('fallo');
    } catch {
      // Si no se pudo borrar, la devolvemos a su sitio sin dramatismos.
      setFrases(anteriores);
      setError('No he podido quitarla del cuaderno. Inténtelo otra vez.');
    }
  }

  if (cargando) return <p className="text-lg text-tintaSuave">Abriendo su cuaderno…</p>;

  if (error) {
    return (
      <p role="alert" className="rounded-suave border-2 border-alerta bg-alertaSuave p-4 text-base text-alerta">
        {error}
      </p>
    );
  }

  if (frases.length === 0) {
    return (
      <div className="tarjeta">
        <p className="text-lg">
          Su cuaderno todavía está en blanco, y eso es una buena noticia: significa que le esperan
          muchas frases bonitas por descubrir.
        </p>
        <p className="mt-4 text-base text-tintaSuave">
          Cuando el Profesor Charles le enseñe una expresión que le guste, pulse{' '}
          <strong className="text-tinta">“Guardar en mi cuaderno”</strong> y la encontrará aquí
          siempre que quiera.
        </p>
      </div>
    );
  }

  const peliculas = frases.filter((f) => f.movieTitle);

  return (
    <div className="space-y-8">
      <p className="text-lg text-tintaSuave">
        Tiene {frases.length} {frases.length === 1 ? 'frase guardada' : 'frases guardadas'}
        {peliculas.length > 0 &&
          ` y ${peliculas.length} ${peliculas.length === 1 ? 'película recomendada' : 'películas recomendadas'}`}
        . Qué bien va usted.
      </p>

      <ul className="space-y-5">
        {frases.map((frase) => (
          <li key={frase.id} className="tarjeta">
            <p className="text-2xl font-bold text-tinta" lang="en">
              {frase.english}
            </p>

            <p className="mt-2 text-lg text-tinta">{frase.spanish}</p>

            {frase.phonetics && (
              <p className="mt-1 text-lg italic text-tintaSuave">Se dice: {frase.phonetics}</p>
            )}

            {frase.movieTitle && (
              <p className="mt-3 rounded-suave bg-butacaSuave p-3 text-base text-tinta">
                <span aria-hidden="true">🎬</span> De{' '}
                <strong>{frase.movieTitle}</strong>
                {frase.movieYear ? ` (${frase.movieYear})` : ''}
                {frase.movieNote ? `. ${frase.movieNote}` : ''}
              </p>
            )}

            <div className="mt-5 space-y-3">
              <BotonesDeVoz texto={frase.english} id={frase.id} voz={voz} />

              <button
                type="button"
                onClick={() => borrar(frase.id)}
                className="boton-secundario w-full border-tintaSuave text-tintaSuave"
              >
                Quitar del cuaderno
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
