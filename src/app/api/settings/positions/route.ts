import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authenticateRequest } from '@/lib/api-auth';
import { positionSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // Get stored positions from settings
    const positionsSetting = await prisma.settings.findUnique({
      where: { key: 'positions' },
    });

    let positionList: string[] = [];
    
    if (positionsSetting) {
      positionList = positionsSetting.value as string[];
    } else {
      // Fallback: get unique positions from existing employees
      const positions = await prisma.employee.findMany({
        select: { position: true },
        distinct: ['position'],
      });

      positionList = positions
        .map(p => p.position)
        .filter(Boolean)
        .sort();
      
      // Store the initial list in settings
      if (positionList.length > 0) {
        await prisma.settings.upsert({
          where: { key: 'positions' },
          update: { value: positionList },
          create: { key: 'positions', value: positionList },
        });
      }
    }

    return NextResponse.json(positionList);
  } catch (error) {
    console.error('Get positions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch positions' },
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
    const data = positionSchema.parse(body);

    // Get current positions list
    const positionsSetting = await prisma.settings.findUnique({
      where: { key: 'positions' },
    });

    let positionList: string[] = positionsSetting ? (positionsSetting.value as string[]) : [];

    // Check if position already exists
    if (positionList.includes(data.name)) {
      return NextResponse.json(
        { error: 'Position already exists' },
        { status: 409 }
      );
    }

    // Add new position to the list
    positionList.push(data.name);
    positionList.sort();

    // Update or create the positions setting
    await prisma.settings.upsert({
      where: { key: 'positions' },
      update: { value: positionList },
      create: { key: 'positions', value: positionList },
    });

    return NextResponse.json({
      message: 'Position added successfully',
      position: data.name,
    });
  } catch (error) {
    console.error('Add position error:', error);
    return NextResponse.json(
      { error: 'Failed to add position' },
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
    const positionName = searchParams.get('name');

    if (!positionName) {
      return NextResponse.json(
        { error: 'Position name is required' },
        { status: 400 }
      );
    }

    // Get current positions list
    const positionsSetting = await prisma.settings.findUnique({
      where: { key: 'positions' },
    });

    let positionList: string[] = positionsSetting ? (positionsSetting.value as string[]) : [];

    // Check if position exists
    if (!positionList.includes(positionName)) {
      return NextResponse.json(
        { error: 'Position not found' },
        { status: 404 }
      );
    }

    // Check if position is in use by any employees
    const employeesUsingPosition = await prisma.employee.findFirst({
      where: { position: positionName },
    });

    if (employeesUsingPosition) {
      return NextResponse.json(
        { error: 'Cannot remove position that is in use by employees' },
        { status: 409 }
      );
    }

    // Remove position from the list
    positionList = positionList.filter(pos => pos !== positionName);

    // Update the positions setting
    await prisma.settings.upsert({
      where: { key: 'positions' },
      update: { value: positionList },
      create: { key: 'positions', value: positionList },
    });

    return NextResponse.json({
      message: 'Position removed successfully',
      position: positionName,
    });
  } catch (error) {
    console.error('Remove position error:', error);
    return NextResponse.json(
      { error: 'Failed to remove position' },
      { status: 500 }
    );
  }
}
