'use client';

import type { EstadoMicrofono } from '@/hooks/useSpeechRecognition';

/**
 * Un micrófono grande y evidente. La abuela prefiere hablar antes que teclear,
 * así que este botón ocupa lo que tiene que ocupar: 88px de alto.
 */
export default function BotonMicrofono({ microfono }: { microfono: EstadoMicrofono }) {
  if (!microfono.disponible) return null;

  return (
    <button
      type="button"
      onClick={microfono.escuchando ? microfono.parar : microfono.empezar}
      aria-pressed={microfono.escuchando}
      className={`flex min-h-[5.5rem] w-full items-center justify-center gap-4 rounded-suave
        border-4 px-6 py-4 text-xl font-bold shadow-tarjeta transition
        ${
          microfono.escuchando
            ? 'animate-pulse border-alerta bg-alerta text-white'
            : 'border-charles bg-white text-charles hover:bg-butacaSuave'
        }`}
    >
      <span aria-hidden="true" className="text-3xl">
        🎤
      </span>
      {microfono.escuchando ? 'Le estoy escuchando… (pulse para terminar)' : 'Hablar en vez de escribir'}
    </button>
  );
}
