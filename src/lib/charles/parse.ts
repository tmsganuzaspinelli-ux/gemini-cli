/**
 * Lee la respuesta de Charles y extrae lo que la interfaz necesita:
 *  - la lección (inglés / español / fonética), para el botón de audio y "Guardar en mi cuaderno";
 *  - la película mencionada, para guardarla también.
 *
 * Es tolerante a propósito: si el modelo se sale un poco del formato, la
 * conversación no se rompe; simplemente no habrá tarjeta de lección.
 */

export type Leccion = {
  english: string;
  spanish: string;
  phonetics: string;
};

export type PeliculaMencionada = {
  title: string;
  year?: number;
};

export type RespuestaAnalizada = {
  /** El texto de la charla, sin el bloque de la lección. */
  charla: string;
  leccion: Leccion | null;
  pelicula: PeliculaMencionada | null;
};

const RE_INGLES = /^\s*Ingl[ée]s\s*:\s*(.+?)\s*$/im;
const RE_ESPANOL = /^\s*Espa[ñn]ol\s*:\s*(.+?)\s*$/im;
const RE_FONETICA = /^\s*Pronunciaci[óo]n\s*:\s*(.+?)\s*$/im;

/** Quita los asteriscos de negrita y las comillas sobrantes. */
function limpiar(texto: string): string {
  return texto
    .replace(/\*\*/g, '')
    .replace(/^["“”'‘’]+|["“”'‘’]+$/g, '')
    .trim();
}

export function analizarRespuesta(texto: string): RespuestaAnalizada {
  const ingles = texto.match(RE_INGLES);
  const espanol = texto.match(RE_ESPANOL);
  const fonetica = texto.match(RE_FONETICA);

  let leccion: Leccion | null = null;
  let charla = texto;

  // Exigimos las tres líneas: una lección a medias no sirve para el cuaderno.
  if (ingles && espanol && fonetica) {
    leccion = {
      english: limpiar(ingles[1]),
      spanish: limpiar(espanol[1]),
      phonetics: limpiar(fonetica[1]),
    };

    charla = texto
      .replace(RE_INGLES, '')
      .replace(RE_ESPANOL, '')
      .replace(RE_FONETICA, '')
      // Colapsa los huecos que dejan las líneas eliminadas.
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  return { charla, leccion, pelicula: detectarPelicula(texto) };
}

/**
 * Busca un título entrecomillado seguido de un año: «"Casablanca" (1942)».
 * Es el formato que el System Prompt le pide a Charles.
 */
function detectarPelicula(texto: string): PeliculaMencionada | null {
  const conAnio = texto.match(/["“']([^"“”']{2,80})["”']\s*\((\d{4})\)/);
  if (conAnio) {
    const year = Number(conAnio[2]);
    return { title: conAnio[1].trim(), year: year >= 1900 && year <= 2100 ? year : undefined };
  }

  const soloTitulo = texto.match(/["“']([^"“”']{2,80})["”']/);
  if (soloTitulo && /pel[íi]cula|film|cinta|ver\b|recomiendo/i.test(texto)) {
    return { title: soloTitulo[1].trim() };
  }

  return null;
}

/**
 * Texto que se manda al lector de voz.
 * Sólo la frase en inglés: leer el castellano con voz inglesa sonaría fatal.
 */
export function textoParaVoz(leccion: Leccion): string {
  return leccion.english;
}
