/**
 * Check Site Admin API Endpoint
 * @rule 060 "API standards for helper endpoints"
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const CheckAdminSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = CheckAdminSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ isSiteAdmin: false });
    }

    const { email } = validation.data;

    // Check if email exists in AdminUser table
    const adminUser = await prisma.adminUser.findUnique({
      where: { email },
      select: { id: true }
    });

    return NextResponse.json({
      isSiteAdmin: adminUser !== null
    });

  } catch (error) {
    console.error('❌ Check site admin error:', error);
    return NextResponse.json({ isSiteAdmin: false });
  }
}

