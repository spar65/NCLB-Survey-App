/**
 * Admin Toggle Production Mode API Endpoint
 * @rule 060 "API standards for admin operations"
 * @rule 012 "API security for critical operations"
 * @rule 130 "Error handling for system changes"
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

const ToggleSchema = z.object({
  confirmation: z.literal('PRODUCTION'), // Must type exactly "PRODUCTION"
});

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Processing production mode toggle request');

    // Verify admin session
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate confirmation
    const body = await request.json();
    const validation = ToggleSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Must type PRODUCTION to confirm' },
        { status: 400 }
      );
    }

    console.log('🚀 Switching to PRODUCTION MODE');
    console.log('👤 Initiated by:', session.email);

    // Check current mode
    const currentSettings = await prisma.systemSettings.findFirst();

    if (currentSettings?.productionMode) {
      return NextResponse.json(
        { error: 'Already in production mode' },
        { status: 400 }
      );
    }

    // Step 1: Delete all survey responses
    const deletedResponses = await prisma.surveyResponse.deleteMany({});
    console.log('🗑️ Deleted', deletedResponses.count, 'survey responses');

    // Step 2: Reset all invited users (clear OTP, consent, hasTaken)
    const resetUsers = await prisma.invitedUser.updateMany({
      data: {
        hasTaken: false,
        consented: false,
        otpCode: null,
        otpExpiry: null,
      },
    });
    console.log('🔄 Reset', resetUsers.count, 'invited users');

    // Step 3: Toggle production mode
    await prisma.systemSettings.updateMany({
      data: {
        productionMode: true,
        toggledAt: new Date(),
        toggledBy: session.email,
      },
    });

    console.log('✅ PRODUCTION MODE ACTIVATED');

    return NextResponse.json({
      success: true,
      message: 'Production mode activated successfully',
      deletedResponses: deletedResponses.count,
      resetUsers: resetUsers.count,
      activatedBy: session.email,
      activatedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Toggle production mode error:', error);
    return NextResponse.json(
      { error: 'Failed to toggle production mode' },
      { status: 500 }
    );
  }
}

// GET endpoint to check current mode
export async function GET() {
  try {
    const settings = await prisma.systemSettings.findFirst();
    return NextResponse.json({
      productionMode: settings?.productionMode || false,
      toggledAt: settings?.toggledAt,
      toggledBy: settings?.toggledBy,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get production mode status' },
      { status: 500 }
    );
  }
}

