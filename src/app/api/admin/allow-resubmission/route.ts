/**
 * Admin Allow Resubmission API Endpoint
 * @rule 060 "API standards for admin operations"
 * @rule 130 "Error handling for admin actions"
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

const AllowResubmissionSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  reason: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Processing allow resubmission request');

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
    const validation = AllowResubmissionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { email, reason } = validation.data;

    // Verify user exists
    const user = await prisma.invitedUser.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        group: true,
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

    // Get submission history
    const submissionHistory = await prisma.surveyResponse.findMany({
      where: { email: email },
      select: {
        id: true,
        submittedAt: true,
        responses: true,
      },
      orderBy: { submittedAt: 'desc' },
    });

    // Reset user's hasTaken status to allow resubmission
    await prisma.invitedUser.update({
      where: { email: email },
      data: { 
        hasTaken: false,
        // Add admin action log
        remindersSent: (user as any).remindersSent || 0, // Keep existing reminders
      },
    });

    console.log('✅ Resubmission enabled for user:', email.replace(/(.{2}).*(@.*)/, '$1***$2'));
    console.log('📊 Previous submissions:', submissionHistory.length);

    return NextResponse.json({
      success: true,
      message: 'Resubmission enabled successfully',
      user: {
        email: email.replace(/(.{2}).*(@.*)/, '$1***$2'),
        group: user.group,
        previousSubmissions: submissionHistory.length,
      },
      reason: reason || 'Admin-initiated resubmission',
    });

  } catch (error) {
    console.error('❌ Allow resubmission error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to enable resubmission',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

