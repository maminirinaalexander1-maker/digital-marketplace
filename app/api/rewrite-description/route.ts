import { NextResponse } from 'next/server';
import { rewriteProductDescription } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description } = body ?? {};

    if (!title || !description) {
      return NextResponse.json({ error: 'Titre et description requis.' }, { status: 400 });
    }

    const rewritten = await rewriteProductDescription(String(title), String(description));

    return NextResponse.json({ description: rewritten });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur de génération de description.' },
      { status: 500 },
    );
  }
}
