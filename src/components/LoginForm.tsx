'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

/**
 * Formulario de acceso pensado para unas manos que ya no son firmes
 * y unos ojos que ya no son los de antes:
 *  - campos de 70px de alto y letra de 25px;
 *  - botón grande de "Mostrar contraseña" (no un iconito diminuto);
 *  - mensajes que explican qué hacer, nunca códigos de error.
 */
export default function LoginForm() {
  const router = useRouter();
  const [usuario, setUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [verClave, setVerClave] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    setError(null);

    if (!usuario.trim() || !clave) {
      setError('Escriba su usuario y su contraseña, por favor.');
      return;
    }

    setEnviando(true);
    try {
      const respuesta = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usuario.trim(), password: clave }),
      });

      const datos = await respuesta.json().catch(() => ({}));

      if (!respuesta.ok) {
        setError(datos.error ?? 'No he podido abrirle la puerta. Inténtelo otra vez.');
        setEnviando(false);
        return;
      }

      router.push('/tertulia');
      router.refresh();
    } catch {
      setError(
        'Parece que se ha ido la conexión a internet. Compruébelo y vuelva a intentarlo.',
      );
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="tarjeta space-y-6" noValidate>
      <div>
        <label htmlFor="usuario" className="etiqueta">
          Su nombre de usuario
        </label>
        <input
          id="usuario"
          name="usuario"
          type="text"
          className="campo"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          required
          aria-describedby={error ? 'mensaje-error' : undefined}
        />
      </div>

      <div>
        <label htmlFor="clave" className="etiqueta">
          Su contraseña
        </label>
        <input
          id="clave"
          name="clave"
          type={verClave ? 'text' : 'password'}
          className="campo"
          value={clave}
          onChange={(e) => setClave(e.target.value)}
          autoComplete="current-password"
          required
          aria-describedby={error ? 'mensaje-error' : undefined}
        />

        <button
          type="button"
          onClick={() => setVerClave((v) => !v)}
          className="boton-secundario mt-3 w-full"
          aria-pressed={verClave}
        >
          {verClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        </button>
      </div>

      {error && (
        <p
          id="mensaje-error"
          role="alert"
          className="rounded-suave border-2 border-alerta bg-alertaSuave p-4 text-base text-alerta"
        >
          {error}
        </p>
      )}

      <button type="submit" className="boton-principal" disabled={enviando}>
        {enviando ? 'Abriendo la puerta…' : 'Entrar a mi clase'}
      </button>

      <p className="text-sm text-tintaSuave">
        Si no recuerda su usuario o su contraseña, no se preocupe lo más mínimo: pídaselos a su
        familia y ellos se los recordarán enseguida.
      </p>
    </form>
  );
}
