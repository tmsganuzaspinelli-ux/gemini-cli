import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  hashSessionId,
  newSessionId,
  readSessionToken,
  sessionCookieOptions,
  signSessionToken,
} from '@/lib/auth';

export type SesionUsuario = {
  id: string;
  username: string;
  displayName: string;
  speechRate: number;
};

/**
 * Crea la sesión en la base y deja la cookie httpOnly puesta.
 * Devuelve el token por si el llamante lo necesita (tests).
 */
export async function crearSesion(userId: string): Promise<string> {
  const sessionId = newSessionId();
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000);

  await prisma.session.create({
    data: { tokenHash: hashSessionId(sessionId), userId, expiresAt },
  });

  const token = await signSessionToken(userId, sessionId);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, sessionCookieOptions());
  return token;
}

/**
 * Devuelve a la abuela si su cookie sigue siendo válida.
 * Comprueba las dos mitades: la firma del JWT y que la sesión siga viva en la base.
 */
export async function usuarioActual(): Promise<SesionUsuario | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const claims = await readSessionToken(token);
  if (!claims) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashSessionId(claims.sessionId) },
    include: { user: true },
  });

  if (!session || session.userId !== claims.userId) return null;
  if (session.expiresAt.getTime() < Date.now()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  // "Visto por última vez": útil para que la familia sepa si la usa.
  // Se actualiza como mucho una vez al día para no escribir en cada carga.
  const unDia = 24 * 60 * 60 * 1000;
  if (Date.now() - session.lastSeen.getTime() > unDia) {
    await prisma.session
      .update({ where: { id: session.id }, data: { lastSeen: new Date() } })
      .catch(() => {});
  }

  return {
    id: session.user.id,
    username: session.user.username,
    displayName: session.user.displayName,
    speechRate: session.user.speechRate,
  };
}

/** Cierra la sesión actual: borra la fila y vacía la cookie. */
export async function cerrarSesion(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;

  if (token) {
    const claims = await readSessionToken(token);
    if (claims) {
      await prisma.session
        .deleteMany({ where: { tokenHash: hashSessionId(claims.sessionId) } })
        .catch(() => {});
    }
  }

  store.set(SESSION_COOKIE, '', { ...sessionCookieOptions(), maxAge: 0 });
}
