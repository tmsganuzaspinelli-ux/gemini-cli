# CLAUDE.md

Guía para trabajar en este repositorio. Léela antes de tocar código.

## Qué es esto

Una aplicación web con **un solo usuario real: una señora mayor**. Su familia la
instala en casa y le da usuario y contraseña. Dentro, un profesor de inglés de IA
llamado **Profesor Charles** conversa con ella, le enseña una frase por vez y le
recomienda películas según lo que ella cuenta de su día.

No es un producto SaaS. No hay registro público, ni planes, ni analítica. Cada
decisión de diseño se toma pensando en **una persona concreta con vista cansada,
manos poco firmes y ninguna paciencia para la informática**.

## Comandos

```bash
npm install
cp .env.example .env          # y genera SESSION_SECRET: openssl rand -base64 48
npm run setup                 # telemetría off + prisma generate + db push + seed

npm run casa                  # ← lo que corre la familia en casa de ella
npm run dev                   # ← lo que corres tú mientras programas

npm run typecheck             # tsc --noEmit
npm run build                 # prisma generate + next build
npm run db:seed               # alta o cambio de contraseña de la abuela
```

### `casa` y `dev` no son lo mismo

`next dev` compila cada pantalla **la primera vez que se abre**. Para ti es lo
correcto: recarga en caliente y ves los cambios al guardar. Para ella es el
motivo de que el navegador se quede en blanco varios segundos cada vez que entra.

`npm run casa` (`scripts/casa.mjs`) arranca el modo de producción, que ya viene
compilado, y sólo vuelve a compilar si `src/`, el esquema de Prisma o la
configuración han cambiado desde la última vez. Medido aquí:

|  | Arranque | Primera apertura de `/` |
|---|---|---|
| `npm run dev` | 1,0 s | 5,1 s |
| `npm run casa` (ya compilado) | 0,3 s | 0,07 s |

Dos consecuencias para quien toque esto:

- **La documentación para la familia nombra `casa`, nunca `dev`.** Si cambias el
  README, mantenlo así.
- Si añades una carpeta de código nueva fuera de `src/`, apúntala en la lista
  `fuentes` de `scripts/casa.mjs`, o `casa` servirá una versión vieja.

`npm run dev` usa **Turbopack**. Si alguna vez topas con un fallo del empaquetador
y necesitas descartarlo, `npm run dev:webpack` arranca con el anterior. `next build`
sigue usando webpack en los dos casos, así que CI no cambia.

Dar de alta a la abuela (o cambiarle la clave el día que la olvide):

```bash
ABUELA_USUARIO=abuela ABUELA_CLAVE="tres palabras sueltas" ABUELA_NOMBRE="Doña Carmen" npm run db:seed
```

### Qué comprueba CI

`.github/workflows/ci.yml` corre en cada push y cada PR, sin necesidad de
secretos:

- **Tipos y compilación** — `prisma validate`, `npm run typecheck` y
  `next build`. La aplicación compila **sin ninguna variable de entorno**
  (`SESSION_SECRET` y `GEMINI_API_KEY` sólo se leen en tiempo de ejecución, y
  toda página con sesión es dinámica). Si eso deja de ser cierto, este job
  falla aquí y no en casa de ella.
- **Puesta en marcha en casa** — recorre el camino exacto de la familia
  (`prisma db push` + `db:seed`) y verifica que el seed **rechaza una
  contraseña de menos de 8 caracteres**.

Antes de empujar, corre al menos `npm run typecheck` y `npm run build`.

## Arquitectura

```
src/
  app/
    page.tsx              Login (redirige a /tertulia si ya hay sesión)
    tertulia/page.tsx     "La Tertulia con Charles" — pantalla principal
    cuaderno/page.tsx     "Mi Cuaderno de Frases y Películas"
    api/auth/{login,logout,me}/route.ts
    api/chat/route.ts     POST = hablar con Charles · GET = historial
    api/cuaderno/route.ts GET · POST · DELETE
  lib/
    auth.ts               bcrypt (coste 12) + JWT de sesión (jose)
    session.ts            crearSesion / usuarioActual / cerrarSesion
    prisma.ts             cliente único (evita fugas de conexión en dev)
    charles/
      prompt.ts           System Prompt del personaje + ensamblado por mensaje
      context.ts          Detección de contexto vital (heurística)
      movies.ts           La cinemateca curada
      gemini.ts           Cliente de Gemini + servicio simulado
      parse.ts            Extrae lección y película de la respuesta
  components/             UI (toda en español, incluidos los nombres)
  hooks/
    useSpeech.ts              Text-to-Speech, voz masculina inglesa
    useSpeechRecognition.ts   Speech-to-Text, dictado en español
prisma/schema.prisma      User · Session · Conversation · Message · SavedPhrase
scripts/seed.ts           Alta de la abuela
```

### El flujo de un mensaje

1. Ella escribe o dicta → `POST /api/chat`.
2. `detectarContexto()` clasifica el mensaje: `nietos` · `soledad` · `cocina` ·
   `viaje` · `general`. Es una heurística de expresiones regulares, a propósito
   simple: **sólo decide qué películas le ponemos delante al modelo**, no
   sustituye el criterio de Charles.
3. `construirSystemPrompt()` monta la persona fija + el contexto detectado + la
   cinemateca que encaja + las frases que ella ya guardó.
4. `pedirRespuestaACharles()` llama a Gemini, o al servicio simulado si no hay
   API key (o si Google falla).
5. `analizarRespuesta()` extrae el bloque `Inglés / Español / Pronunciación`
   para pintar la tarjeta con audio y el botón de guardar.
6. Se guardan los dos turnos en SQLite.

## Reglas que no se negocian

### El personaje

- **Refuerzo positivo absoluto.** Charles no dice nunca "mal", "error" ni
  "incorrecto". Ante un desliz: celebra el intento y reformula. Si cambias el
  System Prompt, esta regla se queda.
- **Una sola frase en inglés por mensaje.** Dos la abrumarían.
- **Formato de lección exacto**, o `parse.ts` no encontrará nada que guardar:

  ```
  Inglés: **[frase]**
  Español: [significado]
  Pronunciación: [/fonética a la española/]
  ```

- **Fonética escrita como la leería una persona española** (`/Gud mórning/`),
  jamás alfabeto fonético internacional.
- Charles nunca admite ser una IA, no usa emojis ni Markdown, y trata de usted.
- Nada de cine violento, angustioso ni de terror en la cinemateca.

### La interfaz

- **Base tipográfica 20px** (`html { font-size: 125% }`). No la bajes.
- **Controles de 56px mínimo** (`min-h-control`). El micrófono, 88px.
- **Contraste WCAG AAA** (7:1). Los colores de `tailwind.config.ts` están
  medidos; si añades uno, mídelo.
- **Botones con texto, no sólo iconos.** Un icono suelto no se entiende.
- **Mensajes de error en su idioma, nunca códigos.** "No he podido guardarla,
  pruebe en un momentito" — no "Error 500".
- Nunca bloquees el zoom del navegador.

### La sesión

- **60 días** (`SESSION_DAYS`). Volver a pedirle la contraseña cada semana sería
  el motivo número uno de que dejara de usarla.
- Cookie **httpOnly**, `sameSite: lax`, `secure` en producción.
- En la base sólo se guarda el **SHA-256** del identificador de sesión, para
  poder revocarla sin almacenar nada reutilizable.
- Contraseñas con **bcrypt, coste 12**. Nunca en claro, nunca en logs.
- Login: **mismo mensaje** para usuario inexistente y contraseña equivocada, y
  comparación bcrypt de relleno para que el tiempo de respuesta no delate cuál
  de los dos falló.

## Convenciones

- **Todo el código de dominio en español**: `usuarioActual`, `crearSesion`,
  `detectarContexto`, `MensajeVista`. Las APIs de Next/React se quedan en
  inglés, claro.
- Comentarios que explican **por qué**, no qué. El qué ya se lee en el código.
- Sin librería de componentes: las clases `.boton-principal`, `.campo`,
  `.tarjeta` de `globals.css` cubren la interfaz entera.

## Trabajar sin API key

Sin `GEMINI_API_KEY` la aplicación funciona **completa**. El servicio simulado
de `gemini.ts` respeta el formato de lección, el refuerzo positivo y la
recomendación según contexto. Sirve para desarrollar, para enseñar la app y como
red de seguridad si Google falla en mitad de una tertulia — la abuela nunca ve
una pantalla de error.

Al tocar `gemini.ts`, **mantén el mock al día con el prompt real**.

## Al añadir una película

En `src/lib/charles/movies.ts`, con todos los campos: `titulo`, `anio`, `frase`
(en inglés, corta y decible), `significado`, `fonetica` (a la española), `porQue`
(cálido y dirigido a ella) y los `contextos` en que encaja. Amable, sin
violencia, y con una frase que se pueda aprender de verdad.
