import { NextResponse } from 'next/server';
import prisma from '../../prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { target, latency } = body;

    if (!target || typeof latency !== 'number') {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    await prisma.pingLog.create({
      data: { target, latency },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ping log error:', error);
    return NextResponse.json({ error: 'Failed to save ping' }, { status: 500 });
  }
}
