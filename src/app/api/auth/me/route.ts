import { NextResponse } from 'next/server';
import { usuarioActual } from '@/lib/session';

export async function GET() {
  const usuario = await usuarioActual();
  if (!usuario) return NextResponse.json({ usuario: null }, { status: 401 });
  return NextResponse.json({ usuario });
}
