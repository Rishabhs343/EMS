import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/api-auth';
import { organizationSettingsSchema } from '@/lib/validations';

// For now, we'll store organization settings in a simple way
// In a real app, you'd have an Organization table in the database
let organizationSettings = {
  name: 'Employee Management System',
  email: 'admin@company.com',
  address: '',
};

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    return NextResponse.json(organizationSettings);
  } catch (error) {
    console.error('Get organization settings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organization settings' },
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

    // Check if user has ADMIN role
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const data = organizationSettingsSchema.parse(body);

    // Update organization settings
    organizationSettings = {
      name: data.name,
      email: data.email,
      address: data.address || '',
    };

    return NextResponse.json({
      message: 'Organization settings updated successfully',
      settings: organizationSettings,
    });
  } catch (error) {
    console.error('Update organization settings error:', error);
    return NextResponse.json(
      { error: 'Failed to update organization settings' },
      { status: 500 }
    );
  }
}
