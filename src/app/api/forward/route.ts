import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import axios from 'axios';

export async function POST(req: NextRequest) {
  const { path, method = 'GET', body } = await req.json();
  const token = (await cookies()).get('token')?.value;

  const res = await axios({
    method,
    url: `${process.env.SERVER_URL}${path}`,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept-Encoding': 'identity'
    },
    data: body
  }).catch((err) => {
    return err.response;
  });

  const headers = new Headers();

  for (const [key, value] of Object.entries(res.headers)) {
    if (typeof value === 'string') {
      headers.set(key, value);
    } else if (Array.isArray(value)) {
      headers.set(key, value.join(','));
    }
  }

  // Handle 204 No Content status code explicitly without a body
  if (res.status === 204) {
    return new NextResponse(null, {
      status: res.status,
      statusText: res.statusText,
      headers,
    });
  }
  
  return new NextResponse(JSON.stringify(res.data), {
    status: res.status,
    statusText: res.statusText,
    headers,
  });
};
