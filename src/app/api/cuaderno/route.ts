import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { usuarioActual } from '@/lib/session';

export const dynamic = 'force-dynamic';

const esquemaGuardar = z.object({
  english: z.string().trim().min(1).max(300),
  spanish: z.string().trim().min(1).max(300),
  phonetics: z.string().trim().max(300).default(''),
  movieTitle: z.string().trim().max(200).optional(),
  movieYear: z.number().int().min(1880).max(2100).optional(),
  movieNote: z.string().trim().max(500).optional(),
  kind: z.enum(['frase', 'pelicula']).default('frase'),
});

/** Todo lo que la abuela ha ido guardando, lo último arriba. */
export async function GET() {
  const usuario = await usuarioActual();
  if (!usuario) return NextResponse.json({ error: 'Sesión caducada.' }, { status: 401 });

  const frases = await prisma.savedPhrase.findMany({
    where: { userId: usuario.id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({
    frases: frases.map((f) => ({ ...f, createdAt: f.createdAt.toISOString() })),
  });
}

export async function POST(request: Request) {
  const usuario = await usuarioActual();
  if (!usuario) return NextResponse.json({ error: 'Sesión caducada.' }, { status: 401 });

  const datos = esquemaGuardar.safeParse(await request.json().catch(() => null));
  if (!datos.success) {
    return NextResponse.json({ error: 'No he podido guardar eso.' }, { status: 400 });
  }

  // Si ya la tenía guardada, no duplicamos: le confirmamos igual, con alegría.
  const yaEstaba = await prisma.savedPhrase.findFirst({
    where: { userId: usuario.id, english: datos.data.english },
  });
  if (yaEstaba) {
    return NextResponse.json({ frase: yaEstaba, yaEstaba: true });
  }

  const frase = await prisma.savedPhrase.create({
    data: { ...datos.data, userId: usuario.id },
  });

  return NextResponse.json({ frase, yaEstaba: false }, { status: 201 });
}

export async function DELETE(request: Request) {
  const usuario = await usuarioActual();
  if (!usuario) return NextResponse.json({ error: 'Sesión caducada.' }, { status: 401 });

  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Falta indicar qué borrar.' }, { status: 400 });

  // deleteMany con userId: nadie puede borrar el cuaderno de otra persona.
  const { count } = await prisma.savedPhrase.deleteMany({ where: { id, userId: usuario.id } });
  if (count === 0) return NextResponse.json({ error: 'No he encontrado esa frase.' }, { status: 404 });

  return NextResponse.json({ ok: true });
}
