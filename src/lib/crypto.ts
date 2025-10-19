/**
 * Cryptographic utilities for OTP generation and email hashing
 * @rule 009 "Security and privacy considerations"
 * @rule 105 "TypeScript strict typing"
 */

import crypto from 'crypto';

/**
 * Generates a 6-digit one-time password (OTP) for email verification.
 * 
 * @returns A string containing exactly 6 random digits
 * 
 * @example
 * const otp = generateOTP(); // "742916"
 */
export function generateOTP(): string {
  const buffer = crypto.randomBytes(4);
  const num = buffer.readUInt32BE(0);
  return ((num % 900000) + 100000).toString();
}

/**
 * Hashes an email address for anonymization in exports
 * 
 * @param email - Email address to hash
 * @returns Consistent 16-character hash for anonymization
 */
export function hashEmail(email: string): string {
  const hash = crypto.createHash('sha256');
  hash.update(email + (process.env.ANONYMIZATION_SALT || 'default-salt'));
  return hash.digest('hex').substring(0, 16);
}

/**
 * Validates OTP code against stored values
 * 
 * @param providedCode - Code provided by user
 * @param storedCode - Code stored in database
 * @param expiry - Expiration timestamp
 * @param attempts - Number of failed attempts
 * @returns Validation result with error message if invalid
 */
export function validateOTP(
  providedCode: string,
  storedCode: string | null,
  expiry: Date | null,
  attempts: number
): { valid: boolean; error: string | null } {
  if (attempts >= 5) {
    return { valid: false, error: 'Too many failed attempts' };
  }

  if (!storedCode || !expiry) {
    return { valid: false, error: 'No valid OTP found' };
  }

  if (new Date() > expiry) {
    return { valid: false, error: 'OTP has expired' };
  }

  if (providedCode !== storedCode) {
    return { valid: false, error: 'Invalid OTP code' };
  }

  return { valid: true, error: null };
}
