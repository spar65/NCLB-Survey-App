/**
 * Production Mode Helper Functions
 * @rule 060 "API standards for production mode checks"
 * @rule 012 "API security for access control"
 */

import { prisma } from './prisma';

/**
 * Get current production mode status
 */
export async function getProductionMode(): Promise<boolean> {
  const settings = await prisma.systemSettings.findFirst();
  return settings?.productionMode || false;
}

/**
 * Check if email is a test account
 */
export function isTestAccount(email: string): boolean {
  return email.endsWith('@example.com');
}

/**
 * Check if email belongs to a site administrator
 * Site admins are in the AdminUser table and should NEVER participate in surveys
 */
export async function isSiteAdmin(email: string): Promise<boolean> {
  const adminUser = await prisma.adminUser.findUnique({
    where: { email },
    select: { id: true },
  });
  return adminUser !== null;
}

/**
 * Check if a user can take surveys
 * ✅ CRITICAL: Async function that properly awaits isSiteAdmin()
 */
export async function canTakeSurvey(email: string): Promise<boolean> {
  // Site admin should NEVER be able to take surveys
  const isAdmin = await isSiteAdmin(email);
  if (isAdmin) {
    return false;
  }
  return true;
}

/**
 * Comprehensive check for survey access
 * Handles both site admin blocking AND production mode restrictions
 */
export async function canAccessSurvey(email: string): Promise<{
  allowed: boolean;
  reason?: string;
}> {
  // Site admin can NEVER access surveys (in any mode)
  // This checks the AdminUser table - ANY user in that table is blocked
  const isAdmin = await isSiteAdmin(email);
  if (isAdmin) {
    return {
      allowed: false,
      reason:
        'Site administrators cannot participate in surveys. To participate as an Administrator stakeholder, use a different email address (e.g., admin_survey@example.com).',
    };
  }

  const productionMode = await getProductionMode();

  if (productionMode && isTestAccount(email)) {
    return {
      allowed: false,
      reason: 'Test accounts are disabled in production mode. Please use a real email address.',
    };
  }

  return { allowed: true };
}

