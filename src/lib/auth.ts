/**
 * Authentication utilities for admin and survey sessions
 * @rule 060 "API standards for secure authentication"
 * @rule 009 "Security and privacy considerations"
 * @rule 105 "TypeScript strict typing"
 */

import { NextRequest } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

const JWT_SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'fallback-secret-key-for-development'
);

export interface AdminSession {
  id: number;
  email: string;
  name: string;
  role: string;
}

export interface SurveySession {
  email: string;
  group: string;
  consented: boolean;
  expiresAt: Date;
}

/**
 * Creates a JWT session token for admin users
 */
export async function createAdminSessionToken(admin: AdminSession): Promise<string> {
  return await new SignJWT({ 
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
    type: 'admin'
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
}

/**
 * Creates a JWT session token for survey participants
 */
export async function createSurveySessionToken(session: SurveySession): Promise<string> {
  return await new SignJWT({
    email: session.email,
    group: session.group,
    consented: session.consented,
    type: 'survey'
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('2h') // Shorter expiry for survey sessions
    .sign(JWT_SECRET);
}

/**
 * Validates and decodes a session token
 */
export async function validateSessionToken(token: string): Promise<any | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    console.error('Session validation failed:', error);
    return null;
  }
}

/**
 * Extracts session from request cookies
 */
export async function getSessionFromRequest(request: NextRequest): Promise<any | null> {
  const adminToken = request.cookies.get('admin-session')?.value;
  const surveyToken = request.cookies.get('survey-session')?.value;
  
  if (adminToken) {
    const session = await validateSessionToken(adminToken);
    return session?.type === 'admin' ? session : null;
  }
  
  if (surveyToken) {
    const session = await validateSessionToken(surveyToken);
    return session?.type === 'survey' ? session : null;
  }
  
  return null;
}

/**
 * Hashes password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12);
}

/**
 * Verifies password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}
