'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Dictado por micrófono (Web Speech Recognition).
 *
 * La abuela habla en español la mayor parte del tiempo, así que el idioma por
 * defecto es es-ES. El resultado se va escribiendo en el cuadro de texto para
 * que ella pueda revisarlo antes de enviarlo: nada se manda sin que lo vea.
 */

type ReconocimientoNativo = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((evento: SpeechRecognitionLikeEvent) => void) | null;
  onerror: ((evento: { error: string }) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
};

type SpeechRecognitionLikeEvent = {
  resultIndex: number;
  results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>;
};

function crearReconocimiento(): ReconocimientoNativo | null {
  if (typeof window === 'undefined') return null;
  const Constructor =
    (window as unknown as { SpeechRecognition?: new () => ReconocimientoNativo }).SpeechRecognition ??
    (window as unknown as { webkitSpeechRecognition?: new () => ReconocimientoNativo })
      .webkitSpeechRecognition;
  return Constructor ? new Constructor() : null;
}

export type EstadoMicrofono = {
  disponible: boolean;
  escuchando: boolean;
  /** Lo que va oyendo antes de darlo por definitivo. */
  parcial: string;
  error: string | null;
  empezar: () => void;
  parar: () => void;
};

export function useSpeechRecognition(
  alTerminarFrase: (texto: string) => void,
  idioma = 'es-ES',
): EstadoMicrofono {
  const [disponible, setDisponible] = useState(false);
  const [escuchando, setEscuchando] = useState(false);
  const [parcial, setParcial] = useState('');
  const [error, setError] = useState<string | null>(null);
  const reconocimientoRef = useRef<ReconocimientoNativo | null>(null);
  // Guardamos el callback en una ref: así el reconocimiento no se recrea
  // cada vez que el componente padre se vuelve a renderizar.
  const callbackRef = useRef(alTerminarFrase);
  callbackRef.current = alTerminarFrase;

  useEffect(() => {
    const reconocimiento = crearReconocimiento();
    if (!reconocimiento) return;

    setDisponible(true);
    reconocimiento.lang = idioma;
    reconocimiento.continuous = false;
    reconocimiento.interimResults = true;
    reconocimiento.maxAlternatives = 1;

    reconocimiento.onstart = () => {
      setEscuchando(true);
      setError(null);
    };

    reconocimiento.onresult = (evento) => {
      let enCurso = '';
      for (let i = evento.resultIndex; i < evento.results.length; i += 1) {
        const resultado = evento.results[i];
        const texto = resultado[0].transcript;
        if (resultado.isFinal) {
          callbackRef.current(texto.trim());
        } else {
          enCurso += texto;
        }
      }
      setParcial(enCurso);
    };

    reconocimiento.onerror = (evento) => {
      setEscuchando(false);
      setParcial('');
      // Mensajes en el idioma de la abuela, no códigos técnicos.
      const mensajes: Record<string, string> = {
        'not-allowed': 'Su navegador no me deja usar el micrófono. Puede escribir tranquilamente aquí abajo.',
        'service-not-allowed': 'El micrófono no está disponible ahora mismo. Puede escribir sin problema.',
        'no-speech': 'No he llegado a oírla. Pruebe otra vez, sin prisa.',
        'audio-capture': 'No encuentro ningún micrófono conectado.',
        network: 'Me he quedado sin conexión un momento. Inténtelo de nuevo.',
      };
      setError(mensajes[evento.error] ?? 'No he podido escucharla. Puede escribir aquí abajo.');
    };

    reconocimiento.onend = () => {
      setEscuchando(false);
      setParcial('');
    };

    reconocimientoRef.current = reconocimiento;

    return () => {
      reconocimiento.onresult = null;
      reconocimiento.onerror = null;
      reconocimiento.onend = null;
      reconocimiento.onstart = null;
      reconocimiento.abort();
      reconocimientoRef.current = null;
    };
  }, [idioma]);

  const empezar = useCallback(() => {
    const reconocimiento = reconocimientoRef.current;
    if (!reconocimiento) return;
    setError(null);
    try {
      reconocimiento.start();
    } catch {
      // start() lanza si ya estaba escuchando: no es nada que deba ver la abuela.
    }
  }, []);

  const parar = useCallback(() => {
    reconocimientoRef.current?.stop();
  }, []);

  return { disponible, escuchando, parcial, error, empezar, parar };
}
