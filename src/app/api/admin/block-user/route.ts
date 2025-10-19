/**
 * Admin Block/Unblock User API Endpoint
 * @rule 060 "API standards for admin operations"
 * @rule 130 "Error handling for user management"
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

const BlockUserSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  action: z.enum(['block', 'unblock']),
  reason: z.string().min(1, 'Reason is required'),
});

export async function POST(request: NextRequest) {
  try {
    console.log('🚫 Processing user block/unblock request');

    // Verify admin session
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = BlockUserSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { email, action, reason } = validation.data;

    // Verify user exists
    const user = await prisma.invitedUser.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        group: true,
        isBlocked: true,
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

    // Get admin info from session
    const adminEmail = session.email || 'system';

    if (action === 'block') {
      // Block the user
      await prisma.invitedUser.update({
        where: { email: email },
        data: {
          isBlocked: true,
          blockedAt: new Date(),
          blockedReason: reason,
          blockedBy: adminEmail,
        },
      });

      console.log('🚫 User blocked:', email.replace(/(.{2}).*(@.*)/, '$1***$2'));

      return NextResponse.json({
        success: true,
        message: 'User blocked successfully',
        action: 'blocked',
        user: {
          email: email.replace(/(.{2}).*(@.*)/, '$1***$2'),
          group: user.group,
          reason: reason,
          blockedBy: adminEmail,
        },
      });

    } else {
      // Unblock the user
      await prisma.invitedUser.update({
        where: { email: email },
        data: {
          isBlocked: false,
          blockedAt: null,
          blockedReason: null,
          blockedBy: null,
        },
      });

      console.log('✅ User unblocked:', email.replace(/(.{2}).*(@.*)/, '$1***$2'));

      return NextResponse.json({
        success: true,
        message: 'User unblocked successfully',
        action: 'unblocked',
        user: {
          email: email.replace(/(.{2}).*(@.*)/, '$1***$2'),
          group: user.group,
        },
      });
    }

  } catch (error) {
    console.error('❌ Block/unblock user error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update user status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

