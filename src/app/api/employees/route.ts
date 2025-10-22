import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authenticateRequest } from '@/lib/api-auth';
import { employeeSchema, employeeFiltersSchema } from '@/lib/validations';
import { Role } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { user } = authResult;
    
    const { searchParams } = new URL(request.url);
    const filters = employeeFiltersSchema.parse({
      search: searchParams.get('search') || undefined,
      department: searchParams.get('department') || undefined,
      position: searchParams.get('position') || undefined,
      status: searchParams.get('status') || undefined,
      from: searchParams.get('from') || undefined,
      to: searchParams.get('to') || undefined,
      page: searchParams.get('page') || undefined,
      size: searchParams.get('size') || undefined,
    });

    const page = parseInt(filters.page);
    const size = parseInt(filters.size);
    const skip = (page - 1) * size;

    const where: any = {};

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.department) {
      where.department = filters.department;
    }

    if (filters.position) {
      where.position = filters.position;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.from || filters.to) {
      where.dateOfJoining = {};
      if (filters.from) {
        where.dateOfJoining.gte = new Date(filters.from);
      }
      if (filters.to) {
        where.dateOfJoining.lte = new Date(filters.to);
      }
    }

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        skip,
        take: size,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.employee.count({ where }),
    ]);

    return NextResponse.json({
      employees,
      pagination: {
        page,
        size,
        total,
        pages: Math.ceil(total / size),
      },
    });
  } catch (error) {
    console.error('Get employees error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { user } = authResult;
    
    // Check if user has HR or ADMIN role
    if (user.role !== 'HR' && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const data = employeeSchema.parse(body);

    // Check if email already exists
    const existingEmployee = await prisma.employee.findUnique({
      where: { email: data.email },
    });

    if (existingEmployee) {
      return NextResponse.json(
        { error: 'Employee with this email already exists' },
        { status: 400 }
      );
    }

    const employee = await prisma.employee.create({
      data: {
        ...data,
        dateOfJoining: new Date(data.dateOfJoining),
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        employeeId: employee.id,
        action: 'CREATED',
        details: {
          changes: data,
          actor: user.email,
        },
        actorUserId: user.id,
      },
    });

    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    console.error('Create employee error:', error);
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create employee' },
      { status: 500 }
    );
  }
}
