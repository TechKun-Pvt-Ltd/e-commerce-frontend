// app/forgot-password/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const externalRes = await fetch(`${process.env.SERVER_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const result = await externalRes.json();

    if (!externalRes.ok) {
      return NextResponse.json({ error: result.message || 'Failed to send reset link' }, { status: externalRes.status });
    }

    return NextResponse.json({ message: 'Reset link sent successfully' }, { status: 200 });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
