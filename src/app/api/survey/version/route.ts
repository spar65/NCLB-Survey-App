/**
 * Survey Version API Endpoint
 * @rule 060 "API standards for survey data retrieval"
 * @rule 130 "Error handling for survey loading"
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

const GetVersionSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export async function POST(request: NextRequest) {
  try {
    console.log('📋 Fetching survey version');

    // Parse request body
    const body = await request.json();
    const validation = GetVersionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    const { email } = validation.data;

    // Get user info to determine group
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

    if (!user.consented) {
      console.log('❌ User not consented:', email.replace(/(.{2}).*(@.*)/, '$1***$2'));
      return NextResponse.json(
        { error: 'User has not provided consent' },
        { status: 403 }
      );
    }

    // Get active survey version for user's group
    const surveyVersion = await prisma.surveyVersion.findFirst({
      where: {
        group: user.group,
        isActive: true,
      },
      select: {
        id: true,
        version: true,
        group: true,
        questions: true,
        description: true,
        createdAt: true,
      },
    });

    if (!surveyVersion) {
      console.log('❌ No active survey version for group:', user.group);
      return NextResponse.json(
        { error: 'No survey available for your group' },
        { status: 404 }
      );
    }

    console.log('✅ Survey version found for group:', user.group);

    return NextResponse.json({
      id: surveyVersion.id,
      version: surveyVersion.version,
      group: surveyVersion.group,
      questions: surveyVersion.questions,
      description: surveyVersion.description,
      createdAt: surveyVersion.createdAt.toISOString(),
    });

  } catch (error) {
    console.error('❌ Survey version API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch survey version' },
      { status: 500 }
    );
  }
}
