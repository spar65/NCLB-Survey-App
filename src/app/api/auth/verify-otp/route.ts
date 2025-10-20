/**
 * OTP Verification API Endpoint
 * @rule 060 "API standards with session management"
 * @rule 130 "Error handling for authentication flow"
 * @rule 009 "Security considerations for OTP validation"
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { validateOTP } from '@/lib/crypto';
import { createSurveySessionToken } from '@/lib/auth';
import { canAccessSurvey } from '@/lib/production-mode';

const VerifyOTPSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  code: z.string().length(6, 'Access code must be exactly 6 digits'),
  consented: z.boolean(),
});

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Processing OTP verification');

    // Parse and validate request body
    const body = await request.json();
    const validation = VerifyOTPSchema.safeParse(body);

    if (!validation.success) {
      console.log('❌ OTP verification validation failed:', validation.error.issues);
      return NextResponse.json(
        { error: 'Invalid verification data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { email, code, consented } = validation.data;

    // ✅ CRITICAL: Check production mode and site admin restrictions
    const access = await canAccessSurvey(email);
    if (!access.allowed) {
      console.log('❌ Survey access blocked:', email.replace(/(.{2}).*(@.*)/, '$1***$2'), '-', access.reason);
      return NextResponse.json(
        { error: access.reason },
        { status: 403 }
      );
    }

    if (!consented) {
      console.log('❌ Consent not provided for:', email.replace(/(.{2}).*(@.*)/, '$1***$2'));
      return NextResponse.json(
        { error: 'Consent is required to participate in this survey' },
        { status: 400 }
      );
    }

    // Find user with OTP data
    const user = await prisma.invitedUser.findUnique({
      where: { email },
    });

    if (!user) {
      console.log('❌ User not found during OTP verification:', email.replace(/(.{2}).*(@.*)/, '$1***$2'));
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Validate OTP
    const otpValidation = validateOTP(
      code,
      user.otpCode,
      user.otpExpiry,
      user.remindersSent || 0
    );

    if (!otpValidation.valid) {
      console.log('❌ OTP validation failed:', otpValidation.error);

      // Increment attempt counter
      await prisma.invitedUser.update({
        where: { email },
        data: { remindersSent: (user.remindersSent || 0) + 1 },
      });

      return NextResponse.json(
        { error: otpValidation.error },
        { status: 400 }
      );
    }

    // Update user consent and clear OTP
    await prisma.invitedUser.update({
      where: { email },
      data: {
        consented: true,
        otpCode: null,
        otpExpiry: null,
        remindersSent: 0,
      },
    });

    // Create survey session
    const sessionToken = await createSurveySessionToken({
      email: user.email,
      group: user.group,
      consented: true,
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
    });

    console.log('✅ OTP verification successful for:', email.replace(/(.{2}).*(@.*)/, '$1***$2'));

    // Create response with session cookie
    const response = NextResponse.json({
      success: true,
      message: 'Access code verified successfully',
      group: user.group,
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    });

    // Set HTTP-only session cookie
    response.cookies.set('survey-session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 2 * 60 * 60, // 2 hours
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('❌ OTP verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
