import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { Role } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(Role.VIEWER);
    const { id } = await params;
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const size = parseInt(searchParams.get('size') || '10');
    const skip = (page - 1) * size;

    const [activities, total] = await Promise.all([
      prisma.activityLog.findMany({
        where: { employeeId: id },
        skip,
        take: size,
        orderBy: { createdAt: 'desc' },
        include: {
          actor: {
            select: {
              email: true,
            },
          },
        },
      }),
      prisma.activityLog.count({
        where: { employeeId: id },
      }),
    ]);

    return NextResponse.json({
      activities,
      pagination: {
        page,
        size,
        total,
        pages: Math.ceil(total / size),
      },
    });
  } catch (error) {
    console.error('Get activity log error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity log' },
      { status: 500 }
    );
  }
}
