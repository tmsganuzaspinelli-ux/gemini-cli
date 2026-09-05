/**
 * Arranca la aplicación en casa de la abuela.
 *
 *   npm run casa
 *
 * `next dev` compila cada pantalla la primera vez que ella la abre: por eso el
 * navegador se queda en blanco varios segundos. El modo de producción ya viene
 * compilado, así que abre al instante. Este script se encarga de la parte
 * aburrida: mira si el código ha cambiado desde la última compilación y sólo
 * vuelve a compilar cuando hace falta. La familia siempre escribe lo mismo.
 */
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);

// Sin telemetría: en el primer arranque evita una llamada a Internet que, con
// una conexión lenta, se nota en la espera.
process.env.NEXT_TELEMETRY_DISABLED ??= '1';

/** Fecha del fichero más reciente de una ruta (carpeta o fichero suelto). */
function masReciente(ruta) {
  let info;
  try {
    info = statSync(ruta);
  } catch {
    return 0; // No existe: no cuenta.
  }

  if (!info.isDirectory()) return info.mtimeMs;

  let ultima = info.mtimeMs;
  for (const entrada of readdirSync(ruta, { withFileTypes: true })) {
    ultima = Math.max(ultima, masReciente(join(ruta, entrada.name)));
  }
  return ultima;
}

// Todo lo que, al cambiar, obliga a recompilar.
const fuentes = [
  'src',
  'prisma/schema.prisma',
  'package.json',
  'package-lock.json',
  'next.config.mjs',
  'tailwind.config.ts',
  'postcss.config.mjs',
  'tsconfig.json',
];

const compilado = masReciente(join(raiz, '.next', 'BUILD_ID'));
const codigo = Math.max(...fuentes.map((f) => masReciente(join(raiz, f))));

if (compilado === 0 || codigo > compilado) {
  console.log(
    compilado === 0
      ? '\nPreparando la aplicación por primera vez. Tarda un par de minutos, y sólo pasa hoy.\n'
      : '\nHay cambios nuevos: preparando la aplicación. Tarda un par de minutos.\n',
  );

  const build = spawnSync('npm', ['run', 'build'], {
    cwd: raiz,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  if (build.status !== 0) process.exit(build.status ?? 1);
}

console.log('\nTodo listo. Abra el navegador en http://localhost:3000\n');

// Arrancamos con `node` y el ejecutable de Next directamente: así funciona
// igual en Windows, macOS y Linux, sin depender del intérprete de órdenes.
const next = require.resolve('next/dist/bin/next');
const start = spawnSync(process.execPath, [next, 'start'], { cwd: raiz, stdio: 'inherit' });
process.exit(start.status ?? 0);
