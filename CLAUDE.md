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
npm run setup                 # prisma generate + db push + seed
npm run dev                   # http://localhost:3000

npm run typecheck             # tsc --noEmit
npm run build                 # prisma generate + next build
npm run db:seed               # alta o cambio de contraseña de la abuela
```

Dar de alta a la abuela (o cambiarle la clave el día que la olvide):

```bash
ABUELA_USUARIO=abuela ABUELA_CLAVE="tres palabras sueltas" ABUELA_NOMBRE="Doña Carmen" npm run db:seed
```

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
