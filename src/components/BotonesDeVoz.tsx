'use client';

import { VELOCIDAD_NORMAL, VELOCIDAD_TORTUGA, type EstadoVoz } from '@/hooks/useSpeech';

/**
 * Los dos botones de audio que acompañan a cada frase en inglés:
 * "Escuchar" a velocidad normal y "Despacito" a 0,75x.
 * Ambos de 56px de alto y con texto, no sólo iconos.
 */
export default function BotonesDeVoz({
  texto,
  id,
  voz,
}: {
  texto: string;
  id: string;
  voz: EstadoVoz;
}) {
  if (!voz.disponible) {
    return (
      <p className="text-sm text-tintaSuave">
        Su navegador no puede leer en voz alta. Pruebe con Chrome o Safari para escuchar a Charles.
      </p>
    );
  }

  const sonandoEsta = voz.hablando && voz.hablandoId?.startsWith(id);

  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        className="boton-secundario flex-1"
        onClick={() => voz.hablar(texto, { velocidad: VELOCIDAD_NORMAL, id: `${id}-normal` })}
      >
        <span aria-hidden="true">🔊</span> Escuchar
      </button>

      <button
        type="button"
        className="boton-secundario flex-1"
        onClick={() => voz.hablar(texto, { velocidad: VELOCIDAD_TORTUGA, id: `${id}-lento` })}
      >
        <span aria-hidden="true">🐢</span> Despacito
      </button>

      {sonandoEsta && (
        <button type="button" className="boton-secundario flex-1" onClick={voz.callar}>
          <span aria-hidden="true">⏹</span> Parar
        </button>
      )}
    </div>
  );
}
