import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth';
import { crearSesion } from '@/lib/session';

const esquema = z.object({
  username: z.string().trim().min(1).max(100),
  password: z.string().min(1).max(200),
});

/**
 * Un mensaje único para usuario inexistente y contraseña equivocada:
 * no revela cuál de los dos falló, y además es más fácil de entender.
 */
const MENSAJE_CREDENCIALES =
  'Ese usuario o esa contraseña no me cuadran. Revíselos con calma; puede pulsar “Mostrar contraseña” para verla escrita.';

export async function POST(request: Request) {
  let cuerpo: unknown;
  try {
    cuerpo = await request.json();
  } catch {
    return NextResponse.json({ error: 'No he entendido los datos del formulario.' }, { status: 400 });
  }

  const datos = esquema.safeParse(cuerpo);
  if (!datos.success) {
    return NextResponse.json(
      { error: 'Por favor, escriba su usuario y su contraseña.' },
      { status: 400 },
    );
  }

  const usuario = await prisma.user.findUnique({
    where: { username: datos.data.username.toLowerCase() },
  });

  if (!usuario) {
    // Comparamos igualmente contra un hash de mentira para que el tiempo de
    // respuesta no delate si el usuario existe.
    await verifyPassword(datos.data.password, '$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvaliduu');
    return NextResponse.json({ error: MENSAJE_CREDENCIALES }, { status: 401 });
  }

  const correcta = await verifyPassword(datos.data.password, usuario.passwordHash);
  if (!correcta) {
    return NextResponse.json({ error: MENSAJE_CREDENCIALES }, { status: 401 });
  }

  await crearSesion(usuario.id);

  return NextResponse.json({
    ok: true,
    usuario: { displayName: usuario.displayName, username: usuario.username },
  });
}
