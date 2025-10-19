/**
 * Survey User Info API Endpoint
 * @rule 060 "API standards for user data retrieval"
 * @rule 130 "Error handling for user lookup"
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const UserInfoSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export async function POST(request: NextRequest) {
  try {
    console.log('👤 Fetching user info for survey');

    // Parse and validate request body
    const body = await request.json();
    const validation = UserInfoSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const { email } = validation.data;

    // Find user in database
    const user = await prisma.invitedUser.findUnique({
      where: { email },
      select: {
        email: true,
        group: true,
        consented: true,
        hasTaken: true,
      },
    });

    if (!user) {
      console.log('❌ User not found:', email.replace(/(.{2}).*(@.*)/, '$1***$2'));
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('✅ User info retrieved for group:', user.group);

    return NextResponse.json({
      email: user.email,
      group: user.group,
      consented: user.consented,
      hasTaken: user.hasTaken,
    });

  } catch (error) {
    console.error('❌ User info error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
