'use client';

import { useState } from 'react';
import BotonesDeVoz from '@/components/BotonesDeVoz';
import type { EstadoVoz } from '@/hooks/useSpeech';
import type { Leccion, PeliculaMencionada } from '@/lib/charles/parse';

/**
 * La tarjeta destacada de cada micro-lección: la frase en inglés bien grande,
 * su significado, la fonética, los botones de audio y "Guardar en mi cuaderno".
 */
export default function TarjetaLeccion({
  leccion,
  pelicula,
  id,
  voz,
}: {
  leccion: Leccion;
  pelicula: PeliculaMencionada | null;
  id: string;
  voz: EstadoVoz;
}) {
  const [estado, setEstado] = useState<'inicio' | 'guardando' | 'guardada' | 'fallo'>('inicio');

  async function guardar() {
    setEstado('guardando');
    try {
      const respuesta = await fetch('/api/cuaderno', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          english: leccion.english,
          spanish: leccion.spanish,
          phonetics: leccion.phonetics,
          movieTitle: pelicula?.title,
          movieYear: pelicula?.year,
          kind: pelicula ? 'pelicula' : 'frase',
        }),
      });
      setEstado(respuesta.ok ? 'guardada' : 'fallo');
    } catch {
      setEstado('fallo');
    }
  }

  return (
    <div className="mt-5 rounded-suave border-2 border-butaca bg-butacaSuave p-5">
      <p className="text-sm font-semibold uppercase tracking-wide text-butaca">
        Su frase de hoy
      </p>

      <p className="mt-2 text-2xl font-bold text-tinta" lang="en">
        {leccion.english}
      </p>

      <p className="mt-3 text-lg text-tinta">{leccion.spanish}</p>

      <p className="mt-1 text-lg italic text-tintaSuave">
        Se dice: {leccion.phonetics}
      </p>

      {pelicula && (
        <p className="mt-3 text-base text-tintaSuave">
          De la película <strong className="text-tinta">{pelicula.title}</strong>
          {pelicula.year ? ` (${pelicula.year})` : ''}.
        </p>
      )}

      <div className="mt-5 space-y-3">
        <BotonesDeVoz texto={leccion.english} id={id} voz={voz} />

        <button
          type="button"
          onClick={guardar}
          disabled={estado === 'guardando' || estado === 'guardada'}
          className="boton-principal"
        >
          {estado === 'guardada'
            ? '✓ Guardada en su cuaderno'
            : estado === 'guardando'
              ? 'Guardando…'
              : 'Guardar en mi cuaderno'}
        </button>

        {estado === 'fallo' && (
          <p role="alert" className="text-base text-alerta">
            No he podido guardarla ahora mismo. Pruebe otra vez en un momentito.
          </p>
        )}
      </div>
    </div>
  );
}
