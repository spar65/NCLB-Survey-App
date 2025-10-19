/**
 * Admin Logout API Endpoint
 * @rule 060 "API standards for session management"
 * @rule 130 "Error handling with proper cleanup"
 */

import { NextResponse } from 'next/server';

export async function POST() {
  try {
    console.log('🔓 Processing admin logout');

    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });

    // Clear session cookie
    response.cookies.set('admin-session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // Expire immediately
      path: '/',
    });

    console.log('✅ Admin logout successful');
    return response;

  } catch (error) {
    console.error('❌ Admin logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
