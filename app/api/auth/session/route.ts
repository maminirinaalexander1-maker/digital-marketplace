import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSessionFromCookie } from '@/lib/auth';

export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('mada-market-session')?.value ?? null;
  const session = getSessionFromCookie(sessionCookie);

  if (!session) {
    return NextResponse.json({ session: null }, { status: 401 });
  }

  return NextResponse.json({ session });
}
