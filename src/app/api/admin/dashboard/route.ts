/**
 * Admin Dashboard API Endpoint
 * @rule 060 "API standards with proper data aggregation"
 * @rule 130 "Error handling for dashboard data"
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching dashboard statistics');

    // Verify admin session
    const session = await getSessionFromRequest(request);
    if (!session || session.type !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get total invites
    const totalInvites = await prisma.invitedUser.count();

    // Get total responses
    const totalResponses = await prisma.surveyResponse.count();

    // Calculate completion rate
    const completionRate = totalInvites > 0 
      ? Math.round((totalResponses / totalInvites) * 100 * 10) / 10 
      : 0;

    // Get responses by group
    const responsesByGroup = await prisma.surveyResponse.groupBy({
      by: ['group'],
      _count: {
        id: true,
      },
    });

    const groupStats = responsesByGroup.reduce((acc, item) => {
      acc[item.group] = item._count.id;
      return acc;
    }, {} as Record<string, number>);

    // Get recent responses (last 10)
    const recentResponses = await prisma.surveyResponse.findMany({
      take: 10,
      orderBy: { submittedAt: 'desc' },
      select: {
        id: true,
        email: true,
        group: true,
        submittedAt: true,
        completionTime: true,
        partial: true,
      },
    });

    // Calculate average completion time
    const completedResponses = await prisma.surveyResponse.findMany({
      where: { 
        partial: false,
        completionTime: { not: null }
      },
      select: { completionTime: true },
    });

    const averageCompletionTime = completedResponses.length > 0
      ? Math.round(
          completedResponses.reduce((sum, r) => sum + (r.completionTime || 0), 0) / 
          completedResponses.length
        )
      : 0;

    const stats = {
      totalInvites,
      totalResponses,
      completionRate,
      responsesByGroup: groupStats,
      averageCompletionTime,
      partialSubmissions: await prisma.surveyResponse.count({ where: { partial: true } }),
      recentResponses: recentResponses.map(response => ({
        ...response,
        email: response.email.replace(/(.{2}).*(@.*)/, '$1***$2'), // Partially mask email
      })),
    };

    console.log('✅ Dashboard statistics compiled');

    return NextResponse.json({ stats });

  } catch (error) {
    console.error('❌ Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
