import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authenticateRequest } from '@/lib/api-auth';
import { departmentSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // Get stored departments from settings
    const departmentsSetting = await prisma.settings.findUnique({
      where: { key: 'departments' },
    });

    let departmentList: string[] = [];
    
    if (departmentsSetting) {
      departmentList = departmentsSetting.value as string[];
    } else {
      // Fallback: get unique departments from existing employees
      const departments = await prisma.employee.findMany({
        select: { department: true },
        distinct: ['department'],
      });

      departmentList = departments
        .map(d => d.department)
        .filter(Boolean)
        .sort();
      
      // Store the initial list in settings
      if (departmentList.length > 0) {
        await prisma.settings.upsert({
          where: { key: 'departments' },
          update: { value: departmentList },
          create: { key: 'departments', value: departmentList },
        });
      }
    }

    return NextResponse.json(departmentList);
  } catch (error) {
    console.error('Get departments error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch departments' },
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
    const data = departmentSchema.parse(body);

    // Get current departments list
    const departmentsSetting = await prisma.settings.findUnique({
      where: { key: 'departments' },
    });

    let departmentList: string[] = departmentsSetting ? (departmentsSetting.value as string[]) : [];

    // Check if department already exists
    if (departmentList.includes(data.name)) {
      return NextResponse.json(
        { error: 'Department already exists' },
        { status: 409 }
      );
    }

    // Add new department to the list
    departmentList.push(data.name);
    departmentList.sort();

    // Update or create the departments setting
    await prisma.settings.upsert({
      where: { key: 'departments' },
      update: { value: departmentList },
      create: { key: 'departments', value: departmentList },
    });

    return NextResponse.json({
      message: 'Department added successfully',
      department: data.name,
    });
  } catch (error) {
    console.error('Add department error:', error);
    return NextResponse.json(
      { error: 'Failed to add department' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const departmentName = searchParams.get('name');

    if (!departmentName) {
      return NextResponse.json(
        { error: 'Department name is required' },
        { status: 400 }
      );
    }

    // Get current departments list
    const departmentsSetting = await prisma.settings.findUnique({
      where: { key: 'departments' },
    });

    let departmentList: string[] = departmentsSetting ? (departmentsSetting.value as string[]) : [];

    // Check if department exists
    if (!departmentList.includes(departmentName)) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }

    // Check if department is in use by any employees
    const employeesUsingDepartment = await prisma.employee.findFirst({
      where: { department: departmentName },
    });

    if (employeesUsingDepartment) {
      return NextResponse.json(
        { error: 'Cannot remove department that is in use by employees' },
        { status: 409 }
      );
    }

    // Remove department from the list
    departmentList = departmentList.filter(dept => dept !== departmentName);

    // Update the departments setting
    await prisma.settings.upsert({
      where: { key: 'departments' },
      update: { value: departmentList },
      create: { key: 'departments', value: departmentList },
    });

    return NextResponse.json({
      message: 'Department removed successfully',
      department: departmentName,
    });
  } catch (error) {
    console.error('Remove department error:', error);
    return NextResponse.json(
      { error: 'Failed to remove department' },
      { status: 500 }
    );
  }
}
