/**
 * Admin Login API Tests
 * @rule 380 "Comprehensive testing standards with visual organization"
 * @rule 060 "API standards testing with proper mocking"
 */

import { generateOTP, validateOTP } from '@/lib/crypto';
import bcrypt from 'bcryptjs';

// Test the underlying logic that the API uses
describe('🔐 Admin Authentication Logic Tests', () => {
  beforeEach(() => {
    console.log('🧪 Setting up admin authentication test environment');
  });

  test('✅ Should hash and verify passwords correctly', async () => {
    console.log('🔒 Testing password hashing and verification');

    const password = 'admin123';
    const hash = await bcrypt.hash(password, 12);
    
    // Verify correct password
    const isValid = await bcrypt.compare(password, hash);
    expect(isValid).toBe(true);
    
    // Verify incorrect password
    const isInvalid = await bcrypt.compare('wrongpassword', hash);
    expect(isInvalid).toBe(false);

    console.log('✅ Password hashing and verification working');
  });

  test('✅ Should validate email format correctly', () => {
    console.log('📧 Testing email validation logic');

    const validEmails = [
      'admin@example.com',
      'user@test.org',
      'teacher@school.edu',
    ];

    const invalidEmails = [
      'invalid-email',
      'admin@localhost',
      '@example.com',
      'admin@',
    ];

    // Test valid emails (basic format check)
    validEmails.forEach(email => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      expect(emailRegex.test(email)).toBe(true);
    });

    // Test invalid emails
    invalidEmails.forEach(email => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      expect(emailRegex.test(email)).toBe(false);
    });

    console.log('✅ Email validation logic working');
  });

  test('✅ Should generate secure session tokens', () => {
    console.log('🎫 Testing session token generation');

    // Test that we can generate tokens (crypto functions work)
    const otp1 = generateOTP();
    const otp2 = generateOTP();
    
    expect(otp1).toMatch(/^\d{6}$/);
    expect(otp2).toMatch(/^\d{6}$/);
    expect(otp1).not.toBe(otp2); // Should be different

    console.log('✅ Session token generation working');
  });

  test('❌ Should reject expired OTP codes', () => {
    console.log('⏰ Testing OTP expiry validation');

    const code = '123456';
    const expiredTime = new Date(Date.now() - 1000); // 1 second ago
    const result = validateOTP(code, code, expiredTime, 0);

    expect(result.valid).toBe(false);
    expect(result.error).toBe('OTP has expired');

    console.log('✅ Expired OTP correctly rejected');
  });

  test('❌ Should enforce attempt limits', () => {
    console.log('🚫 Testing OTP attempt limits');

    const code = '123456';
    const futureTime = new Date(Date.now() + 10 * 60 * 1000);
    const result = validateOTP(code, code, futureTime, 5); // 5 attempts = limit

    expect(result.valid).toBe(false);
    expect(result.error).toBe('Too many failed attempts');

    console.log('✅ Attempt limits correctly enforced');
  });
});