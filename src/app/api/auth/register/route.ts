// app/register/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const externalApiRes = await fetch(process.env.SERVER_URL + '/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    const result = await externalApiRes.json();

    if (!externalApiRes.ok) {
      return NextResponse.json({ error: result.message || 'Registration failed' }, { status: externalApiRes.status });
    }

    return NextResponse.json({ success: true, user: result.user }, { status: 200 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}