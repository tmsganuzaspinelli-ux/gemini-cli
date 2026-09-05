'use client';

import TarjetaLeccion from '@/components/TarjetaLeccion';
import type { EstadoVoz } from '@/hooks/useSpeech';
import type { Leccion, PeliculaMencionada } from '@/lib/charles/parse';

export type MensajeVista = {
  id: string;
  role: 'user' | 'charles';
  charla: string;
  leccion: Leccion | null;
  pelicula: PeliculaMencionada | null;
};

export default function BurbujaMensaje({
  mensaje,
  voz,
  nombreAlumna,
}: {
  mensaje: MensajeVista;
  voz: EstadoVoz;
  nombreAlumna: string;
}) {
  const esDeElla = mensaje.role === 'user';

  return (
    <article
      className={`rounded-suave border-2 p-5 shadow-tarjeta ${
        esDeElla ? 'ml-auto max-w-[46rem] border-pergamino bg-pergamino' : 'max-w-[48rem] border-pergamino bg-white'
      }`}
      aria-label={esDeElla ? `Usted dijo` : 'El Profesor Charles dice'}
    >
      <p className="mb-2 text-sm font-bold uppercase tracking-wide text-tintaSuave">
        {esDeElla ? nombreAlumna : 'Profesor Charles'}
      </p>

      {/* Respetamos los saltos de línea: Charles escribe en párrafos, como en una carta. */}
      <div className="whitespace-pre-wrap text-base text-tinta">{mensaje.charla}</div>

      {mensaje.leccion && (
        <TarjetaLeccion
          leccion={mensaje.leccion}
          pelicula={mensaje.pelicula}
          id={mensaje.id}
          voz={voz}
        />
      )}
    </article>
  );
}
