import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './auth';
import { prisma } from './db';

export async function authenticateRequest(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    );
  }

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }

  // Verify user still exists in database
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      role: true,
    },
  });

  if (!user) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 401 }
    );
  }

  return { user };
}
