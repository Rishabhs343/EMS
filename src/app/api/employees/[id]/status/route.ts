import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { Role, EmployeeStatus } from '@prisma/client';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(Role.HR);
    const { id } = await params;
    
    const body = await request.json();
    const { status } = body;

    if (!status || !Object.values(EmployeeStatus).includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const existingEmployee = await prisma.employee.findUnique({
      where: { id },
    });

    if (!existingEmployee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    const employee = await prisma.employee.update({
      where: { id },
      data: { status },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        employeeId: employee.id,
        action: 'STATUS_CHANGED',
        details: {
          previousStatus: existingEmployee.status,
          newStatus: status,
          actor: user.email,
        },
        actorUserId: user.id,
      },
    });

    return NextResponse.json(employee);
  } catch (error) {
    console.error('Update status error:', error);
    return NextResponse.json(
      { error: 'Failed to update status' },
      { status: 500 }
    );
  }
}
