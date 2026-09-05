'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import BotonMicrofono from '@/components/BotonMicrofono';
import BurbujaMensaje, { type MensajeVista } from '@/components/BurbujaMensaje';
import { useSpeech } from '@/hooks/useSpeech';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { saludoInicial } from '@/lib/charles/prompt';
import { analizarRespuesta } from '@/lib/charles/parse';

/** La pantalla principal: "La Tertulia con Charles". */
export default function Tertulia({ nombreAlumna }: { nombreAlumna: string }) {
  const [mensajes, setMensajes] = useState<MensajeVista[]>([]);
  const [texto, setTexto] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [esperando, setEsperando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const voz = useSpeech();
  const finRef = useRef<HTMLDivElement>(null);
  const cuadroRef = useRef<HTMLTextAreaElement>(null);

  // Lo dictado se añade al cuadro de texto; ella lo revisa y decide enviarlo.
  const recogerDictado = useCallback((dicho: string) => {
    setTexto((actual) => (actual ? `${actual} ${dicho}` : dicho));
    cuadroRef.current?.focus();
  }, []);
  const microfono = useSpeechRecognition(recogerDictado);

  // Al entrar, recuperamos la tertulia de días anteriores.
  useEffect(() => {
    let cancelado = false;

    (async () => {
      try {
        const respuesta = await fetch('/api/chat');
        if (!respuesta.ok) throw new Error('sin historial');
        const datos = await respuesta.json();
        if (cancelado) return;

        setConversationId(datos.conversationId ?? null);
        setMensajes(
          (datos.mensajes ?? []).map(
            (m: {
              id: string;
              role: string;
              charla: string;
              leccion: MensajeVista['leccion'];
              pelicula: MensajeVista['pelicula'];
            }) => ({
              id: m.id,
              role: m.role === 'user' ? 'user' : 'charles',
              charla: m.charla,
              leccion: m.leccion,
              pelicula: m.pelicula,
            }),
          ),
        );
      } catch {
        // Sin historial no pasa nada: Charles saluda y empezamos de cero.
      } finally {
        if (!cancelado) setCargando(false);
      }
    })();

    return () => {
      cancelado = true;
    };
  }, []);

  // Cada mensaje nuevo se trae a la vista sin que ella tenga que buscarlo.
  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [mensajes, esperando]);

  async function enviar(evento?: React.FormEvent) {
    evento?.preventDefault();
    const mensaje = texto.trim();
    if (!mensaje || esperando) return;

    if (microfono.escuchando) microfono.parar();
    voz.callar();
    setError(null);
    setTexto('');
    setEsperando(true);

    setMensajes((previos) => [
      ...previos,
      { id: `local-${Date.now()}`, role: 'user', charla: mensaje, leccion: null, pelicula: null },
    ]);

    try {
      const respuesta = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje, conversationId: conversationId ?? undefined }),
      });

      if (respuesta.status === 401) {
        setError('Su sesión ha caducado. Vuelva a entrar y seguimos donde lo dejamos.');
        setEsperando(false);
        return;
      }

      const datos = await respuesta.json();
      if (!respuesta.ok) throw new Error(datos.error ?? 'fallo');

      setConversationId(datos.conversationId);
      setMensajes((previos) => [
        ...previos,
        {
          id: `charles-${Date.now()}`,
          role: 'charles',
          charla: datos.charla,
          leccion: datos.leccion,
          pelicula: datos.pelicula,
        },
      ]);
    } catch {
      setError(
        'El Profesor Charles se ha quedado un momento sin línea. Inténtelo otra vez, por favor.',
      );
    } finally {
      setEsperando(false);
    }
  }

  // Enter envía; Mayúsculas+Enter hace un párrafo nuevo.
  function alPulsarTecla(evento: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (evento.key === 'Enter' && !evento.shiftKey) {
      evento.preventDefault();
      void enviar();
    }
  }

  const saludo = analizarRespuesta(saludoInicial(nombreAlumna));

  return (
    <div className="space-y-6">
      <div className="space-y-5" aria-live="polite" aria-busy={esperando}>
        {cargando ? (
          <p className="text-lg text-tintaSuave">Preparando el té…</p>
        ) : mensajes.length === 0 ? (
          <BurbujaMensaje
            mensaje={{
              id: 'saludo',
              role: 'charles',
              charla: saludo.charla,
              leccion: saludo.leccion,
              pelicula: null,
            }}
            voz={voz}
            nombreAlumna={nombreAlumna}
          />
        ) : (
          mensajes.map((m) => (
            <BurbujaMensaje key={m.id} mensaje={m} voz={voz} nombreAlumna={nombreAlumna} />
          ))
        )}

        {esperando && (
          <p className="text-lg italic text-tintaSuave">
            El Profesor Charles está pensando su respuesta…
          </p>
        )}

        <div ref={finRef} />
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-suave border-2 border-alerta bg-alertaSuave p-4 text-base text-alerta"
        >
          {error}
        </p>
      )}

      <form onSubmit={enviar} className="tarjeta space-y-4">
        <BotonMicrofono microfono={microfono} />

        {microfono.parcial && (
          <p className="text-base italic text-tintaSuave">Le oigo: “{microfono.parcial}”</p>
        )}

        {microfono.error && (
          <p role="alert" className="text-base text-alerta">
            {microfono.error}
          </p>
        )}

        <div>
          <label htmlFor="mensaje" className="etiqueta">
            O escríbale aquí a Charles
          </label>
          <textarea
            id="mensaje"
            ref={cuadroRef}
            rows={3}
            className="campo resize-y"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={alPulsarTecla}
            placeholder="Cuéntele cómo va su día…"
          />
        </div>

        <button type="submit" className="boton-principal" disabled={esperando || !texto.trim()}>
          {esperando ? 'Enviando…' : 'Enviar a Charles'}
        </button>
      </form>
    </div>
  );
}
