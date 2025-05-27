import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  const { path, method = 'GET', body } = await req.json();
  const token = (await cookies()).get('token')?.value;

  const res = await fetch(`${process.env.SERVER_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept-Encoding': 'identity'
    },
    body: JSON.stringify(body)
  });

  return new NextResponse(res.body,  {
    status: res.status,
    statusText: res.statusText,
    headers: res.headers
  });
};