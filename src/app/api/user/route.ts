// PUT handler inside src/app/api/user/route.ts
import { NextRequest, NextResponse } from 'next/server';    

export async function PUT(req: NextRequest) {
    const body = await req.json();
  
  
    try {
      const updatedUser = await fetch(process.env.SERVER_URL + '/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });
      return new NextResponse(JSON.stringify(updatedUser), { status: 200 });
    } catch (error) {
      return new NextResponse("Failed to update profile", { status: 500 });
    }
  }

  