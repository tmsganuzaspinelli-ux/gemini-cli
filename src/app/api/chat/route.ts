import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { usuarioActual } from '@/lib/session';
import { detectarContexto } from '@/lib/charles/context';
import { construirSystemPrompt } from '@/lib/charles/prompt';
import { pedirRespuestaACharles, type TurnoConversacion } from '@/lib/charles/gemini';
import { analizarRespuesta } from '@/lib/charles/parse';

export const dynamic = 'force-dynamic';

const esquema = z.object({
  mensaje: z.string().trim().min(1, 'Escriba algo primero.').max(2000),
  conversationId: z.string().cuid().optional(),
});

/** Cuántos turnos previos le recordamos a Charles. Suficiente para dar continuidad. */
const TURNOS_DE_MEMORIA = 12;

export async function POST(request: Request) {
  const usuario = await usuarioActual();
  if (!usuario) {
    return NextResponse.json(
      { error: 'Su sesión ha caducado. Vuelva a entrar, por favor.' },
      { status: 401 },
    );
  }

  const datos = esquema.safeParse(await request.json().catch(() => null));
  if (!datos.success) {
    return NextResponse.json(
      { error: datos.error.issues[0]?.message ?? 'No he entendido su mensaje.' },
      { status: 400 },
    );
  }

  const { mensaje } = datos.data;

  // 1. Recuperamos (o abrimos) la tertulia.
  const conversacion = await obtenerConversacion(usuario.id, datos.data.conversationId);

  const previos = await prisma.message.findMany({
    where: { conversationId: conversacion.id },
    orderBy: { createdAt: 'desc' },
    take: TURNOS_DE_MEMORIA,
  });
  const historial: TurnoConversacion[] = previos
    .reverse()
    .map((m) => ({ role: m.role === 'user' ? 'user' : 'charles', content: m.content }));

  // 2. Detección de contexto vital sobre este mensaje y el anterior de ella.
  const ultimoDeElla = [...previos].find((m) => m.role === 'user')?.content;
  const deteccion = detectarContexto(mensaje, ultimoDeElla);

  // 3. Le recordamos a Charles lo que ella ya guardó, para no repetirse.
  const guardadas = await prisma.savedPhrase.findMany({
    where: { userId: usuario.id },
    orderBy: { createdAt: 'desc' },
    take: 15,
    select: { english: true, spanish: true },
  });

  const systemPrompt = construirSystemPrompt({
    nombreAlumna: usuario.displayName,
    deteccion,
    frasesGuardadas: guardadas.map((f) => `${f.english} — ${f.spanish}`),
    primerMensaje: historial.length === 0,
  });

  // 4. Charles contesta (Gemini o el servicio simulado).
  const respuesta = await pedirRespuestaACharles({
    systemPrompt,
    historial,
    mensaje,
    deteccion,
    nombreAlumna: usuario.displayName,
  });

  const analizada = analizarRespuesta(respuesta.texto);

  // 5. Guardamos los dos turnos y actualizamos la tertulia.
  await prisma.$transaction([
    prisma.message.create({
      data: {
        conversationId: conversacion.id,
        role: 'user',
        content: mensaje,
        vitalContext: deteccion.contexto,
      },
    }),
    prisma.message.create({
      data: { conversationId: conversacion.id, role: 'charles', content: respuesta.texto },
    }),
    prisma.conversation.update({
      where: { id: conversacion.id },
      data: { updatedAt: new Date() },
    }),
  ]);

  return NextResponse.json({
    conversationId: conversacion.id,
    respuesta: respuesta.texto,
    charla: analizada.charla,
    leccion: analizada.leccion,
    pelicula: analizada.pelicula,
    contexto: deteccion.contexto,
    proveedor: respuesta.proveedor,
  });
}

/** Historial de la tertulia, para pintar la pantalla al entrar. */
export async function GET() {
  const usuario = await usuarioActual();
  if (!usuario) return NextResponse.json({ error: 'Sesión caducada.' }, { status: 401 });

  const conversacion = await prisma.conversation.findFirst({
    where: { userId: usuario.id },
    orderBy: { updatedAt: 'desc' },
    include: { messages: { orderBy: { createdAt: 'asc' }, take: 60 } },
  });

  if (!conversacion) return NextResponse.json({ conversationId: null, mensajes: [] });

  return NextResponse.json({
    conversationId: conversacion.id,
    mensajes: conversacion.messages.map((m) => {
      const analizada = m.role === 'charles' ? analizarRespuesta(m.content) : null;
      return {
        id: m.id,
        role: m.role,
        content: m.content,
        charla: analizada?.charla ?? m.content,
        leccion: analizada?.leccion ?? null,
        pelicula: analizada?.pelicula ?? null,
        createdAt: m.createdAt.toISOString(),
      };
    }),
  });
}

async function obtenerConversacion(userId: string, conversationId?: string) {
  if (conversationId) {
    const existente = await prisma.conversation.findFirst({
      where: { id: conversationId, userId },
    });
    if (existente) return existente;
  }

  const reciente = await prisma.conversation.findFirst({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
  });
  if (reciente) return reciente;

  return prisma.conversation.create({ data: { userId } });
}
