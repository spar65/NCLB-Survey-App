/**
 * OTP Request API Endpoint
 * @rule 060 "API standards with proper validation and rate limiting"
 * @rule 130 "Comprehensive error handling for email operations"
 * @rule 009 "Security considerations for OTP generation"
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { generateOTP } from '@/lib/crypto';
import { sendOTPEmail } from '@/lib/resend';
import { canAccessSurvey } from '@/lib/production-mode';

const RequestOTPSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export async function POST(request: NextRequest) {
  try {
    console.log('📧 Processing OTP request');

    // Parse and validate request body
    const body = await request.json();
    const validation = RequestOTPSchema.safeParse(body);

    if (!validation.success) {
      console.log('❌ OTP request validation failed:', validation.error.issues);
      return NextResponse.json(
        { error: 'Invalid email format', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { email } = validation.data;

    // ✅ CRITICAL: Check production mode and site admin restrictions
    const access = await canAccessSurvey(email);
    if (!access.allowed) {
      console.log('❌ Survey access blocked:', email.replace(/(.{2}).*(@.*)/, '$1***$2'), '-', access.reason);
      return NextResponse.json(
        { error: access.reason },
        { status: 403 }
      );
    }

    // Check if user is whitelisted
    const invitedUser = await prisma.invitedUser.findUnique({
      where: { email },
    });

    if (!invitedUser) {
      console.log('❌ Email not in whitelist:', email.replace(/(.{2}).*(@.*)/, '$1***$2'));
      return NextResponse.json(
        { error: 'Email not authorized for this survey' },
        { status: 404 }
      );
    }

    // Check if user already completed survey
    if (invitedUser.hasTaken) {
      console.log('⚠️ User already completed survey:', email.replace(/(.{2}).*(@.*)/, '$1***$2'));
      return NextResponse.json(
        { error: 'You have already completed this survey' },
        { status: 409 }
      );
    }

    // Generate OTP
    const otpCode = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in database
    await prisma.invitedUser.update({
      where: { email },
      data: {
        otpCode,
        otpExpiry,
        // Reset attempt counter when new OTP is generated
        remindersSent: 0,
      },
    });

    // Send email (in development, we'll skip actual email sending)
    let emailSent = true;
    if (process.env.NODE_ENV === 'production' && process.env.RESEND_API_KEY) {
      emailSent = await sendOTPEmail(email, otpCode);
    } else {
      console.log('🔧 Development mode - OTP code:', otpCode);
    }

    if (!emailSent) {
      console.log('❌ Failed to send OTP email');
      return NextResponse.json(
        { error: 'Failed to send access code. Please try again.' },
        { status: 500 }
      );
    }

    console.log('✅ OTP request processed successfully');

    return NextResponse.json({
      success: true,
      message: 'Access code sent to your email',
      expiresIn: 600, // 10 minutes in seconds
      // In development, include the code for testing
      ...(process.env.NODE_ENV === 'development' && { devCode: otpCode }),
    });

  } catch (error) {
    console.error('❌ OTP request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
