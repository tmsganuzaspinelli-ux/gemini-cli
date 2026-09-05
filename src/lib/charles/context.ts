import type { ContextoVital } from '@/lib/charles/movies';

/**
 * Detección de contexto vital.
 *
 * Charles "escucha" lo que cuenta la abuela para deducir con quién está y cómo
 * se siente. Es una heurística deliberadamente sencilla: sólo sirve para
 * decidir qué películas le ponemos delante al modelo. La interpretación fina
 * la hace siempre Charles con el texto completo.
 */

type Regla = { contexto: ContextoVital; patrones: RegExp[]; peso: number };

const REGLAS: Regla[] = [
  {
    contexto: 'nietos',
    peso: 3,
    patrones: [
      /\bniet[oa]s?\b/i,
      /\bbeb[ée]s?\b/i,
      /\bnin[ñn][oa]s?\b/i,
      /\bcri[oa]s?\b/i,
      /\bpeque[ñn][oa]s?\b/i,
      /\bhij[oa]s? de mi\b/i,
      /\bcuid(?:ar|ando|o)\b/i,
      /\bme la dejan\b/i,
      /\bmerienda\b/i,
      /\bcolegio\b/i,
      /\bparque\b/i,
    ],
  },
  {
    contexto: 'soledad',
    peso: 3,
    patrones: [
      /\bsol[ao]\b/i,
      /\bsolit[ao]\b/i,
      /\btarde tranquila\b/i,
      /\btranquil[ao]\b/i,
      /\bllov(?:er|iendo|izna)\b/i,
      /\blluvia\b/i,
      /\bnadie\b/i,
      /\baburr\w*/i,
      /\bme acuerdo de\b/i,
      /\bechar? de menos\b/i,
      /\bextra[ñn]o\b/i,
      /\bsilencio\b/i,
      /\bmanta\b/i,
      /\bsof[áa]\b/i,
    ],
  },
  {
    contexto: 'cocina',
    peso: 2,
    patrones: [
      /\bcocin\w+/i,
      /\bguis\w+/i,
      /\breceta\b/i,
      /\bhorno\b/i,
      /\bpuchero\b/i,
      /\bcroquetas?\b/i,
      /\bpostre\b/i,
      /\btarta\b/i,
      /\bcomida\b/i,
      /\bcomiendo\b/i,
      /\balmuerzo\b/i,
      /\bcena\b/i,
      /\bmerendar\b/i,
    ],
  },
  {
    contexto: 'viaje',
    peso: 2,
    patrones: [
      /\bviaj\w+/i,
      /\bpueblo\b/i,
      /\bplaya\b/i,
      /\bmontar?[ñn]a\b/i,
      /\bexcursi[óo]n\b/i,
      /\btren\b/i,
      /\bavi[óo]n\b/i,
      /\bcuando era joven\b/i,
      /\bfui a\b/i,
      /\bestuve en\b/i,
      /\bvacaciones\b/i,
    ],
  },
];

export type DeteccionContexto = {
  contexto: ContextoVital;
  /** Cuántas señales encontró: 0 significa "no hay pistas, charla normal". */
  senales: number;
  /** Las palabras concretas que dispararon la detección (para depurar). */
  pistas: string[];
};

/**
 * Analiza el mensaje de la abuela (y, con menos peso, el anterior) y decide
 * el contexto dominante.
 */
export function detectarContexto(mensaje: string, mensajePrevio?: string): DeteccionContexto {
  const puntos = new Map<ContextoVital, number>();
  const pistas: string[] = [];

  const evaluar = (texto: string, factor: number) => {
    for (const regla of REGLAS) {
      for (const patron of regla.patrones) {
        const encontrado = texto.match(patron);
        if (encontrado) {
          puntos.set(regla.contexto, (puntos.get(regla.contexto) ?? 0) + regla.peso * factor);
          if (factor === 1) pistas.push(encontrado[0].toLowerCase());
        }
      }
    }
  };

  evaluar(mensaje, 1);
  // El mensaje anterior cuenta a media voz: da continuidad sin secuestrar el tema.
  if (mensajePrevio) evaluar(mensajePrevio, 0.5);

  let mejor: ContextoVital = 'general';
  let mejorPuntos = 0;
  for (const [contexto, valor] of puntos) {
    if (valor > mejorPuntos) {
      mejor = contexto;
      mejorPuntos = valor;
    }
  }

  return { contexto: mejor, senales: mejorPuntos, pistas: [...new Set(pistas)] };
}

/** Una frase corta que le explica a Charles qué hemos intuido. */
export function describirContexto(deteccion: DeteccionContexto): string {
  switch (deteccion.contexto) {
    case 'nietos':
      return 'Parece que hoy está o estará con nietos o criaturas pequeñas. Recomiéndele cine familiar tierno y enséñele una frase bonita para decirle a la criatura.';
    case 'soledad':
      return 'Parece que hoy pasa una tarde tranquila, quizá sola o con nostalgia. Acompáñela con calidez y sugiérale un clásico reconfortante; nada de lástima, sólo buena compañía.';
    case 'cocina':
      return 'Está hablando de cocina o de comida. Conéctelo con una película de buena mesa y con vocabulario de cocina.';
    case 'viaje':
      return 'Está recordando viajes o lugares. Conéctelo con una película de paisajes o de viaje, y con una frase de viajera.';
    default:
      return 'Es una charla cotidiana, sin un contexto claro. Converse con naturalidad y deslice una micro-lección; sólo mencione cine si viene a cuento.';
  }
}
