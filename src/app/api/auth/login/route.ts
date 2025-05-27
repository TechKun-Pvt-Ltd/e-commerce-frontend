import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  const body = await req.json();

  const response = await fetch(`${process.env.SERVER_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok)
    return NextResponse.json({ error: (await response.json()).message }, { status: 401 });

  const data = await response.json();

  (await cookies()).set({
    name: 'token',
    value: data.token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: (data.expiresAt - Date.now()) / 1000,
    path: '/',
  });

  return NextResponse.json(data);
}
