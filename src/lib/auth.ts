import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { createHash, randomBytes } from 'node:crypto';

/** 60 días: la abuela no debería volver a ver la pantalla de login casi nunca. */
export const SESSION_DAYS = 60;
export const SESSION_MAX_AGE = SESSION_DAYS * 24 * 60 * 60; // segundos
export const SESSION_COOKIE = 'charles_sesion';

/** Coste 12: seguro y todavía imperceptible en un login manual. */
const BCRYPT_ROUNDS = 12;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

function secretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      'Falta SESSION_SECRET (mínimo 32 caracteres). Copia .env.example a .env y genera uno con: openssl rand -base64 48',
    );
  }
  return new TextEncoder().encode(secret);
}

/**
 * El token que viaja en la cookie es un JWT firmado que incluye un `jti`
 * aleatorio. En la base sólo guardamos el SHA-256 de ese `jti`, de modo que
 * la sesión se puede revocar sin almacenar nada reutilizable.
 */
export function newSessionId(): string {
  return randomBytes(32).toString('base64url');
}

export function hashSessionId(sessionId: string): string {
  return createHash('sha256').update(sessionId).digest('hex');
}

export async function signSessionToken(userId: string, sessionId: string): Promise<string> {
  return new SignJWT({ uid: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setJti(sessionId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secretKey());
}

export async function readSessionToken(
  token: string,
): Promise<{ userId: string; sessionId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ['HS256'] });
    if (typeof payload.uid !== 'string' || typeof payload.jti !== 'string') return null;
    return { userId: payload.uid, sessionId: payload.jti };
  } catch {
    // Token caducado, manipulado o firmado con otro secreto: no hay sesión.
    return null;
  }
}

/** Opciones de la cookie: httpOnly para que ningún script pueda leerla. */
export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  };
}
