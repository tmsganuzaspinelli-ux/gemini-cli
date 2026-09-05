import { peliculasPara } from '@/lib/charles/movies';
import type { DeteccionContexto } from '@/lib/charles/context';

/**
 * Cliente de Gemini con "selector" de proveedor.
 *
 * Si hay GEMINI_API_KEY en el entorno, hablamos con la API de Google.
 * Si no la hay, entra el servicio simulado: la aplicación sigue siendo
 * perfectamente usable para la abuela y para desarrollar sin gastar cuota.
 */

const MODELO = process.env.GEMINI_MODEL ?? 'gemini-2.0-flash';
const ENDPOINT_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

export type TurnoConversacion = { role: 'user' | 'charles'; content: string };

export type RespuestaCharles = {
  texto: string;
  /** "gemini" cuando contestó el modelo real, "simulado" con el mock. */
  proveedor: 'gemini' | 'simulado';
};

export function hayApiKey(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

type ArgsCharles = {
  systemPrompt: string;
  historial: TurnoConversacion[];
  mensaje: string;
  deteccion: DeteccionContexto;
  nombreAlumna: string;
};

export async function pedirRespuestaACharles(args: ArgsCharles): Promise<RespuestaCharles> {
  if (!hayApiKey()) {
    return { texto: respuestaSimulada(args), proveedor: 'simulado' };
  }

  try {
    const texto = await llamarGemini(args);
    return { texto, proveedor: 'gemini' };
  } catch (error) {
    // Si Google falla, la abuela no puede quedarse mirando un error.
    // Charles responde igualmente y la tertulia continúa.
    console.error('[charles] Gemini no respondió, uso el servicio simulado:', error);
    return { texto: respuestaSimulada(args), proveedor: 'simulado' };
  }
}

async function llamarGemini({ systemPrompt, historial, mensaje }: ArgsCharles): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY!.trim();

  const contents = [
    // Gemini sólo distingue "user" y "model".
    ...historial.map((t) => ({
      role: t.role === 'user' ? 'user' : 'model',
      parts: [{ text: t.content }],
    })),
    { role: 'user', parts: [{ text: mensaje }] },
  ];

  const controlador = new AbortController();
  const tiempoLimite = setTimeout(() => controlador.abort(), 30_000);

  try {
    const respuesta = await fetch(`${ENDPOINT_BASE}/${MODELO}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      signal: controlador.signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: {
          // Cálido y con vida, pero sin desvariar del personaje.
          temperature: 0.85,
          topP: 0.95,
          maxOutputTokens: 700,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ],
      }),
    });

    if (!respuesta.ok) {
      const detalle = await respuesta.text().catch(() => '');
      throw new Error(`Gemini devolvió ${respuesta.status}: ${detalle.slice(0, 300)}`);
    }

    const datos = (await respuesta.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };

    const texto = datos.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('').trim();
    if (!texto) throw new Error('Gemini devolvió una respuesta vacía.');
    return texto;
  } finally {
    clearTimeout(tiempoLimite);
  }
}

/**
 * Servicio simulado.
 *
 * No es un "lorem ipsum": respeta el formato de tres líneas, el refuerzo
 * positivo y la recomendación de cine según el contexto, para que la
 * aplicación se pueda enseñar y probar entera sin API key.
 */
function respuestaSimulada({ deteccion, mensaje, nombreAlumna }: ArgsCharles): string {
  const pelicula = peliculasPara(deteccion.contexto)[0];
  const intentoEnIngles = /[a-z]/i.test(mensaje) && /\b(the|hello|good|i|you|my|is|are)\b/i.test(mensaje);

  const aperturas: Record<string, string> = {
    nietos: `Qué noticia tan encantadora, ${nombreAlumna}. No hay mejor plan en este mundo que una tarde con criaturas pequeñas correteando por casa.`,
    soledad: `Le confieso, ${nombreAlumna}, que las tardes tranquilas son mis favoritas. Una butaca, una manta y una buena película: poca cosa más hace falta.`,
    cocina: `¡Ah, la cocina! Me ha abierto usted el apetito sólo con contármelo, ${nombreAlumna}.`,
    viaje: `Qué bien acompaña un recuerdo de viaje, ${nombreAlumna}. Me encantaría que me contase más.`,
    general: `Qué gusto leerla, ${nombreAlumna}. Póngase cómoda, que aquí tenemos toda la tarde.`,
  };

  const felicitacion = intentoEnIngles
    ? '¡Qué magnífico esfuerzo se ha marcado usted en inglés! Ha estado sumamente cerca, y eso tiene muchísimo mérito.\n\n'
    : '';

  return `${felicitacion}${aperturas[deteccion.contexto]}

Permítame regalarle una expresión para hoy:

Inglés: **${pelicula.frase}**
Español: ${pelicula.significado}
Pronunciación: ${pelicula.fonetica}

Es una frase de "${pelicula.titulo}" (${pelicula.anio}), y se la recomiendo de corazón: ${pelicula.porQue}

Dígamela en voz alta cuando le apetezca, sin ninguna prisa. Y cuénteme: ¿qué tal ha ido su día?`;
}
