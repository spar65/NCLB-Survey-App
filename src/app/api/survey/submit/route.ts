/**
 * Survey Submission API Endpoint
 * @rule 060 "API standards for survey data submission"
 * @rule 130 "Error handling for survey submission"
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hashEmail } from '@/lib/crypto';
import { canAccessSurvey } from '@/lib/production-mode';

const SubmitSurveySchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  surveyVersionId: z.number().int().positive(),
  responses: z.record(z.string(), z.unknown()),
  completionTime: z.number().optional(),
  partial: z.boolean().default(false),
  userAgent: z.string().optional(),
  deviceType: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    console.log('📤 Processing survey submission');

    // Parse and validate request body
    const body = await request.json();
    const validation = SubmitSurveySchema.safeParse(body);

    if (!validation.success) {
      console.log('❌ Validation failed:', validation.error.issues);
      return NextResponse.json(
        { error: 'Invalid submission data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { email, surveyVersionId, responses, completionTime, partial, userAgent, deviceType } = validation.data;

    // ✅ CRITICAL: Check production mode and site admin restrictions
    const access = await canAccessSurvey(email);
    if (!access.allowed) {
      console.log('❌ Survey access blocked:', email.replace(/(.{2}).*(@.*)/, '$1***$2'), '-', access.reason);
      return NextResponse.json(
        { error: access.reason },
        { status: 403 }
      );
    }

    // Verify user exists and has consented
    const user = await prisma.invitedUser.findUnique({
      where: { email },
      select: {
        id: true,
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
      console.log('❌ User has not consented:', email.replace(/(.{2}).*(@.*)/, '$1***$2'));
      return NextResponse.json(
        { error: 'User consent required' },
        { status: 403 }
      );
    }

    // Check if user is allowed to resubmit
    const allowResubmission = request.headers.get('x-allow-resubmission') === 'true';
    
    if (user.hasTaken && !partial && !allowResubmission) {
      console.log('ℹ️ User has already completed survey:', email.replace(/(.{2}).*(@.*)/, '$1***$2'));
      
      // Get existing response details for the already-completed page
      const existingResponse = await prisma.surveyResponse.findFirst({
        where: { email: email },
        select: {
          id: true,
          submittedAt: true,
          group: true,
        },
        orderBy: { submittedAt: 'desc' }, // Get most recent
      });

      return NextResponse.json(
        { 
          alreadyCompleted: true,
          message: 'Survey already completed',
          redirectTo: '/survey/already-completed',
          details: {
            group: user.group,
            responseId: existingResponse?.id,
            submittedAt: existingResponse?.submittedAt?.getTime(),
          }
        },
        { status: 200 }
      );
    }

    // Verify survey version exists and matches user's group
    const surveyVersion = await prisma.surveyVersion.findUnique({
      where: { id: surveyVersionId },
      select: {
        id: true,
        group: true,
        questions: true,
      },
    });

    if (!surveyVersion) {
      console.log('❌ Survey version not found:', surveyVersionId);
      return NextResponse.json(
        { error: 'Survey version not found' },
        { status: 404 }
      );
    }

    if (surveyVersion.group !== user.group) {
      console.log('❌ Survey group mismatch:', surveyVersion.group, 'vs', user.group);
      return NextResponse.json(
        { error: 'Survey version does not match user group' },
        { status: 400 }
      );
    }

    // Get client IP and user agent for metadata
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    const clientUserAgent = userAgent || request.headers.get('user-agent') || 'unknown';

    // Hash email for anonymization
    const emailHash = hashEmail(email);

    // Always create a new response (keep historical data)
    // Count existing responses for version tracking
    const existingResponseCount = await prisma.surveyResponse.count({
      where: { email: email },
    });

    const submissionVersion = existingResponseCount + 1;
    
    // Create new response (preserving all historical data)
    const surveyResponse = await prisma.surveyResponse.create({
      data: {
        email: email,
        group: user.group,
        versionId: surveyVersionId,
        responses: {
          ...responses,
          _submissionVersion: submissionVersion, // Track which submission this is
          _isResubmission: submissionVersion > 1,
          _previousSubmissions: existingResponseCount,
        },
        completionTime: completionTime,
        partial: partial,
        userAgent: clientUserAgent,
        deviceType: deviceType || 'unknown',
        ipAddressHash: hashEmail(clientIP),
        submittedAt: new Date(),
      },
    });
    
    console.log(`✅ Created survey response #${submissionVersion} for user`);
    
    if (submissionVersion > 1) {
      console.log(`📝 This is resubmission #${submissionVersion} - historical data preserved`);
    }

    // Update user's hasTaken status if this is a complete submission
    if (!partial) {
      await prisma.invitedUser.update({
        where: { email: email },
        data: { hasTaken: true },
      });
    }

    console.log('✅ Survey submission successful:', {
      group: user.group,
      responseId: surveyResponse.id,
      questionsAnswered: Object.keys(responses).length,
      partial: partial,
    });

    return NextResponse.json({
      success: true,
      message: partial ? 'Survey progress saved' : 'Survey submitted successfully',
      responseId: surveyResponse.id,
      questionsAnswered: Object.keys(responses).length,
      totalQuestions: Array.isArray(surveyVersion.questions) ? surveyVersion.questions.length : 0,
    });

  } catch (error) {
    console.error('❌ Survey submission error:', error);
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      name: error instanceof Error ? error.name : 'Unknown error type'
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to submit survey',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}