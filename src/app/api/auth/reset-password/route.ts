// app/reset-password/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    const externalRes = await fetch(`${process.env.SERVER_URL}/auth/reset-password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const result = await externalRes.json();

    if (!externalRes.ok) {
      return NextResponse.json({ error: result.message || 'Failed to reset password' }, { status: externalRes.status });
    }

    return NextResponse.json({ message: 'Password reset successfully' }, { status: 200 });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
