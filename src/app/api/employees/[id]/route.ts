import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { employeeSchema } from '@/lib/validations';
import { Role } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(Role.VIEWER);
    const { id } = await params;
    
    const employee = await prisma.employee.findUnique({
      where: { id },
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(employee);
  } catch (error) {
    console.error('Get employee error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employee' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(Role.HR);
    const { id } = await params;
    
    const body = await request.json();
    const data = employeeSchema.parse(body);

    const existingEmployee = await prisma.employee.findUnique({
      where: { id },
    });

    if (!existingEmployee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Check if email is being changed and if it already exists
    if (data.email !== existingEmployee.email) {
      const emailExists = await prisma.employee.findUnique({
        where: { email: data.email },
      });

      if (emailExists) {
        return NextResponse.json(
          { error: 'Employee with this email already exists' },
          { status: 400 }
        );
      }
    }

    const employee = await prisma.employee.update({
      where: { id },
      data: {
        ...data,
        dateOfJoining: new Date(data.dateOfJoining),
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        employeeId: employee.id,
        action: 'UPDATED',
        details: {
          changes: data,
          previous: existingEmployee,
          actor: user.email,
        },
        actorUserId: user.id,
      },
    });

    return NextResponse.json(employee);
  } catch (error) {
    console.error('Update employee error:', error);
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update employee' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(Role.ADMIN);
    const { id } = await params;
    
    const existingEmployee = await prisma.employee.findUnique({
      where: { id },
    });

    if (!existingEmployee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    await prisma.employee.delete({
      where: { id },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        employeeId: id,
        action: 'DELETED',
        details: {
          employee: existingEmployee,
          actor: user.email,
        },
        actorUserId: user.id,
      },
    });

    return NextResponse.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Delete employee error:', error);
    return NextResponse.json(
      { error: 'Failed to delete employee' },
      { status: 500 }
    );
  }
}
