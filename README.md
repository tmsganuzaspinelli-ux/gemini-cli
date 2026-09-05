# 🎩 Profesor Charles

Una aplicación de clases de inglés hecha para **una sola persona**: la abuela.

El Profesor Charles es un caballero británico, profesor particular y cinéfilo
empedernido. Charla con ella en español, le enseña **una frase de inglés cada
vez** —con su significado y su pronunciación escrita a la española— y le
recomienda películas según lo que ella le cuenta de su día: cine tierno si pasa
la tarde con los nietos, un clásico reconfortante si llueve y está sola.

Jamás le dice que se ha equivocado. Sólo celebra sus intentos.

---

## Puesta en marcha

Necesita Node.js 20 o superior.

```bash
npm install

cp .env.example .env
# Genere el secreto de sesión y péguelo en SESSION_SECRET:
openssl rand -base64 48

npm run setup
```

`npm run setup` prepara la base de datos. Después, dé de alta a la abuela
eligiendo su usuario, su contraseña y el nombre con el que Charles la saludará:

```bash
ABUELA_USUARIO=abuela \
ABUELA_CLAVE="tres palabras sueltas" \
ABUELA_NOMBRE="Doña Carmen" \
npm run db:seed
```

> Para la contraseña, tres palabras corrientes ("mesa camino jardín") son más
> seguras y muchísimo más fáciles de recordar que `Abc123!`.

Y a andar:

```bash
npm run dev     # http://localhost:3000
```

### La API de Gemini es opcional

Sin `GEMINI_API_KEY` la aplicación funciona **entera**, con un servicio simulado
que responde con el mismo tono, el mismo formato de lección y las mismas
películas. Para que Charles conteste de verdad, consiga una clave gratuita en
[Google AI Studio](https://aistudio.google.com/apikey) y póngala en `.env`.

Ese servicio simulado es además la red de seguridad: si Google falla en mitad de
una tertulia, Charles sigue respondiendo y ella nunca ve un error.

---

## Las tres pantallas

**Entrar.** Campos de 56 píxeles de alto, letra de 20, un botón grande de
*Mostrar contraseña* y mensajes que explican qué hacer en lugar de soltar
códigos. La sesión dura **60 días**: no tendrá que volver a escribirla casi
nunca.

**La Tertulia con Charles.** La conversación. Puede escribir o pulsar el botón
grande del micrófono y **hablar**; lo dictado aparece en el cuadro de texto para
que lo revise antes de enviarlo. Cada frase que Charles le enseña llega en una
tarjeta con su traducción, su pronunciación y dos botones de audio:

- **🔊 Escuchar** — voz masculina inglesa, velocidad normal.
- **🐢 Despacito** — la misma frase al 0,75x, para repetirla sin agobio.

**Mi Cuaderno de Frases y Películas.** Lo que ella decide guardar, con su audio
siempre a mano y la película de la que salió cada frase.

---

## Accesibilidad

No es una capa de barniz: es el punto de partida.

| | |
|---|---|
| Tipografía base | 20 px (`html { font-size: 125% }`) |
| Altura mínima de controles | 56 px · el micrófono, 88 px |
| Contraste | WCAG AAA (7:1), colores medidos uno a uno |
| Botones | Siempre con texto, nunca sólo un icono |
| Foco de teclado | Anillo grueso y visible, jamás oculto |
| Zoom del navegador | Nunca bloqueado |
| Lectores de pantalla | Regiones `aria-live`, `role="alert"`, enlace de salto |
| Movimiento | Respeta `prefers-reduced-motion` |

El audio usa la Web Speech API del propio navegador: no viaja nada a ningún
servidor y funciona sin conexión. Va mejor en Chrome, Edge y Safari.

---

## Cómo está hecho

Next.js 15 (App Router) · Tailwind CSS · SQLite con Prisma · bcrypt · JWT de
sesión con `jose` · API de Gemini.

```
src/
  app/           Páginas y rutas de API
  lib/charles/   El profesor: prompt, cinemateca, detección de contexto
  lib/auth.ts    bcrypt, firma de sesión, cookies httpOnly
  components/    Interfaz
  hooks/         Voz (leer en alto) y micrófono (dictar)
```

Para los detalles de arquitectura y las reglas del personaje, lea
[`CLAUDE.md`](./CLAUDE.md).

### Seguridad

- Contraseñas con **bcrypt** (coste 12). Nunca en claro, nunca en los logs.
- Cookie de sesión **httpOnly**, `sameSite: lax` y `secure` en producción:
  ningún script de la página puede leerla.
- De la sesión sólo se guarda un **SHA-256** en la base, así que se puede
  revocar sin almacenar nada reutilizable.
- El login responde **lo mismo** ante un usuario inexistente que ante una
  contraseña equivocada, y tarda lo mismo en ambos casos.
- La base de datos es un fichero en el ordenador de casa. Sus conversaciones no
  salen de ahí, salvo el mensaje que se envía a Gemini para que Charles conteste.

---

Hecho con cariño, para que aprender inglés a los ochenta sea exactamente lo que
tiene que ser: una tertulia agradable con un caballero que sabe mucho de cine.
