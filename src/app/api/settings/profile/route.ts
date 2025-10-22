import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authenticateRequest } from '@/lib/api-auth';
import { profileSettingsSchema } from '@/lib/validations';
import { hashPassword } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { user } = authResult;

    const body = await request.json();
    const data = profileSettingsSchema.parse(body);

    // If password is provided, hash it
    let updateData: any = {};
    if (data.password) {
      updateData.passwordHash = await hashPassword(data.password);
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
