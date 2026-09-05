'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Lectura en voz alta con la Web Speech API.
 *
 * Dos detalles importantes para nuestra alumna:
 *  - la voz debe ser masculina y en inglés (es Charles quien habla);
 *  - hay dos velocidades: normal (1.0) y "tortuga" (0.75), para poder repetir
 *    despacio hasta que la frase se le quede.
 */

export const VELOCIDAD_NORMAL = 1.0;
export const VELOCIDAD_TORTUGA = 0.75;

/**
 * Nombres de voces masculinas inglesas habituales en Windows, macOS, iOS y
 * Android. Se prueban en orden; si no hay ninguna, caemos en cualquier voz
 * en inglés antes que quedarnos sin audio.
 */
const VOCES_MASCULINAS = [
  'Google UK English Male',
  'Microsoft George',
  'Microsoft Ryan',
  'Microsoft Guy',
  'Daniel',
  'Alex',
  'Fred',
  'Arthur',
  'Oliver',
  'Rishi',
  'en-gb-x-gbb-network',
  'English United Kingdom',
];

function esProbablementeMasculina(voz: SpeechSynthesisVoice): boolean {
  const nombre = voz.name.toLowerCase();
  if (/female|mujer|woman|samantha|karen|moira|tessa|zira|hazel|susan|fiona/.test(nombre)) {
    return false;
  }
  return /male|hombre|man|daniel|alex|fred|george|ryan|guy|arthur|oliver|rishi|james|thomas/.test(
    nombre,
  );
}

function elegirVoz(voces: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const inglesas = voces.filter((v) => v.lang.toLowerCase().startsWith('en'));
  if (inglesas.length === 0) return voces[0] ?? null;

  for (const preferida of VOCES_MASCULINAS) {
    const encontrada = inglesas.find((v) =>
      v.name.toLowerCase().includes(preferida.toLowerCase()),
    );
    if (encontrada) return encontrada;
  }

  // Charles es británico: si hay que adivinar, que sea con acento de Londres.
  const britanicaMasculina = inglesas.find(
    (v) => v.lang.toLowerCase().startsWith('en-gb') && esProbablementeMasculina(v),
  );
  if (britanicaMasculina) return britanicaMasculina;

  return inglesas.find(esProbablementeMasculina) ?? inglesas[0];
}

export type EstadoVoz = {
  disponible: boolean;
  hablando: boolean;
  /** Identificador del fragmento que suena ahora, para resaltar su botón. */
  hablandoId: string | null;
  hablar: (texto: string, opciones?: { velocidad?: number; id?: string }) => void;
  callar: () => void;
};

export function useSpeech(): EstadoVoz {
  const [disponible, setDisponible] = useState(false);
  const [hablando, setHablando] = useState(false);
  const [hablandoId, setHablandoId] = useState<string | null>(null);
  const vozRef = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    setDisponible(true);

    const cargarVoces = () => {
      const voces = window.speechSynthesis.getVoices();
      if (voces.length > 0) vozRef.current = elegirVoz(voces);
    };

    cargarVoces();
    // En Chrome la lista llega vacía la primera vez y se rellena después.
    window.speechSynthesis.addEventListener('voiceschanged', cargarVoces);

    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', cargarVoces);
      window.speechSynthesis.cancel();
    };
  }, []);

  const callar = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setHablando(false);
    setHablandoId(null);
  }, []);

  const hablar = useCallback<EstadoVoz['hablar']>(
    (texto, opciones) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
      if (!texto.trim()) return;

      // Si ya estaba sonando algo, se corta: nunca dos voces a la vez.
      window.speechSynthesis.cancel();

      const frase = new SpeechSynthesisUtterance(texto);
      const voz = vozRef.current;
      if (voz) {
        frase.voice = voz;
        frase.lang = voz.lang;
      } else {
        frase.lang = 'en-GB';
      }
      frase.rate = opciones?.velocidad ?? VELOCIDAD_NORMAL;
      // Un pelín grave: la voz de un caballero, no la de un locutor de anuncios.
      frase.pitch = 0.9;
      frase.volume = 1;

      frase.onstart = () => {
        setHablando(true);
        setHablandoId(opciones?.id ?? null);
      };
      const terminar = () => {
        setHablando(false);
        setHablandoId(null);
      };
      frase.onend = terminar;
      frase.onerror = terminar;

      window.speechSynthesis.speak(frase);
    },
    [],
  );

  return { disponible, hablando, hablandoId, hablar, callar };
}
