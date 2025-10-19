/**
 * Admin Invites API Endpoint - GET method
 * @rule 060 "API standards for admin data retrieval"
 * @rule 130 "Error handling for admin operations"
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    console.log('📋 Fetching invited users for admin');

    // Verify admin session
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all invited users with their response counts
    const invitedUsers = await prisma.invitedUser.findMany({
      select: {
        id: true,
        email: true,
        group: true,
        invitedAt: true,
        hasTaken: true,
        consented: true,
        remindersSent: true,
        lastReminderAt: true,
      },
      orderBy: {
        invitedAt: 'desc',
      },
    });

    // Get response counts for each user
    const usersWithResponseCounts = await Promise.all(
      invitedUsers.map(async (user) => {
        const responseCount = await prisma.surveyResponse.count({
          where: { email: user.email },
        });
        
        return {
          ...user,
          responseCount,
          hasEverSubmitted: responseCount > 0, // True if they have any responses
        };
      })
    );

    console.log('✅ Invited users loaded:', invitedUsers.length, 'users');

    return NextResponse.json({
      success: true,
      invites: usersWithResponseCounts.map(user => ({
        id: user.id,
        email: user.email,
        group: user.group,
        invitedAt: user.invitedAt.toISOString(),
        hasTaken: user.hasTaken,
        consented: user.consented,
        remindersSent: user.remindersSent || 0,
        lastReminderAt: user.lastReminderAt?.toISOString() || null,
        responseCount: user.responseCount,
        hasEverSubmitted: user.hasEverSubmitted,
        // Determine if resubmit button should show
        canResubmit: user.hasEverSubmitted && !user.hasTaken, // Has responses but can currently retake
        showResubmitButton: user.hasEverSubmitted, // Show button if they have any responses
      })),
      total: usersWithResponseCounts.length,
    });

  } catch (error) {
    console.error('❌ Admin invites fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invited users' },
      { status: 500 }
    );
  }
}