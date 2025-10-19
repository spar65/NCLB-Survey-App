/**
 * Admin Survey Responses API Endpoint
 * @rule 060 "API standards for admin data retrieval"
 * @rule 130 "Error handling for admin operations"
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching survey responses for admin');

    // Verify admin session
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all survey responses with related data
    const responses = await prisma.surveyResponse.findMany({
      select: {
        id: true,
        email: true,
        group: true,
        versionId: true,
        responses: true,
        submittedAt: true,
        completionTime: true,
        partial: true,
        userAgent: true,
        deviceType: true,
        ipAddressHash: true,
        version: {
          select: {
            version: true,
            group: true,
            description: true,
          },
        },
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });

    // Transform data for frontend
    const transformedResponses = responses.map(response => ({
      id: response.id,
      email: response.email.replace(/(.{2}).*(@.*)/, '$1***$2'), // Mask email for privacy
      group: response.group,
      submittedAt: response.submittedAt.toISOString(),
      completionTime: response.completionTime,
      partial: response.partial,
      deviceType: response.deviceType || 'unknown',
      userAgent: response.userAgent || 'unknown',
      questionsAnswered: response.responses ? Object.keys(response.responses).length : 0,
      version: {
        version: response.version?.version || 'v1.0',
        group: response.version?.group || response.group,
        description: response.version?.description || 'Survey version',
      },
      // Check if this is a resubmission
      submissionNumber: responses.filter(r => r.email === response.email).length,
    }));

    console.log('✅ Survey responses loaded:', transformedResponses.length, 'responses');

    return NextResponse.json({
      success: true,
      responses: transformedResponses,
      total: transformedResponses.length,
      stats: {
        totalResponses: transformedResponses.length,
        completedResponses: transformedResponses.filter(r => !r.partial).length,
        partialResponses: transformedResponses.filter(r => r.partial).length,
        byGroup: transformedResponses.reduce((acc, r) => {
          acc[r.group] = (acc[r.group] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      },
    });

  } catch (error) {
    console.error('❌ Admin responses fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch survey responses' },
      { status: 500 }
    );
  }
}

