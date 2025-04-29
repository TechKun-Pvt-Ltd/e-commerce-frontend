// app/register/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();

    // Optional: Validate required fields
    
console.log(body)
    // Forward data to external registration API
    const externalApiRes = await fetch('http://localhost:8080/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': Bearer ${yourToken}, // if needed
      },
      body
    });

    const result = await externalApiRes.json();

    // Handle error from external API
    if (!externalApiRes.ok) {
      return NextResponse.json({ error: result.message || 'Registration failed' }, { status: externalApiRes.status });
    }

    // Success response
    return NextResponse.json({ success: true, user: result.user }, { status: 200 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}