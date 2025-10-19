/**
 * Crypto Utilities Tests
 * @rule 380 "Comprehensive testing standards with visual organization"
 * @rule 105 "TypeScript strict typing for tests"
 */

import { generateOTP, hashEmail, validateOTP } from '@/lib/crypto';

describe('🔐 Crypto Utilities Tests', () => {
  beforeEach(() => {
    console.log('🧪 Setting up crypto test environment');
  });

  describe('generateOTP', () => {
    test('✅ Should generate 6-digit code', () => {
      console.log('🔢 Testing OTP generation format');
      
      const otp = generateOTP();
      
      expect(otp).toMatch(/^\d{6}$/);
      expect(otp.length).toBe(6);
      
      console.log('✅ OTP format validation passed');
    });

    test('✅ Should generate unique codes', () => {
      console.log('🔄 Testing OTP uniqueness');
      
      const codes = new Set();
      for (let i = 0; i < 100; i++) {
        codes.add(generateOTP());
      }
      
      // Allow some collisions but expect mostly unique codes
      expect(codes.size).toBeGreaterThan(90);
      
      console.log(`✅ Generated ${codes.size}/100 unique codes`);
    });

    test('✅ Should generate codes within valid range', () => {
      console.log('📊 Testing OTP range validation');
      
      for (let i = 0; i < 50; i++) {
        const otp = parseInt(generateOTP());
        expect(otp).toBeGreaterThanOrEqual(100000);
        expect(otp).toBeLessThanOrEqual(999999);
      }
      
      console.log('✅ All OTP codes within valid range');
    });
  });

  describe('hashEmail', () => {
    test('✅ Should produce consistent hash', () => {
      console.log('🔒 Testing email hash consistency');
      
      const email = 'test@example.com';
      const hash1 = hashEmail(email);
      const hash2 = hashEmail(email);
      
      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(16);
      
      console.log('✅ Email hashing consistency verified');
    });

    test('✅ Should produce different hashes for different emails', () => {
      console.log('🔀 Testing email hash uniqueness');
      
      const hash1 = hashEmail('test1@example.com');
      const hash2 = hashEmail('test2@example.com');
      
      expect(hash1).not.toBe(hash2);
      expect(hash1).toHaveLength(16);
      expect(hash2).toHaveLength(16);
      
      console.log('✅ Email hash uniqueness verified');
    });

    test('✅ Should not be reversible', () => {
      console.log('🛡️ Testing email hash security');
      
      const email = 'secret@example.com';
      const hash = hashEmail(email);
      
      expect(hash).not.toContain('secret');
      expect(hash).not.toContain('@example.com');
      expect(hash).not.toContain('example');
      
      console.log('✅ Email hash security verified');
    });
  });

  describe('validateOTP', () => {
    test('✅ Should validate correct OTP', () => {
      console.log('✅ Testing valid OTP validation');
      
      const code = '123456';
      const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes future
      const result = validateOTP(code, code, expiry, 0);
      
      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
      
      console.log('✅ Valid OTP correctly accepted');
    });

    test('❌ Should reject incorrect OTP', () => {
      console.log('❌ Testing invalid OTP rejection');
      
      const expiry = new Date(Date.now() + 10 * 60 * 1000);
      const result = validateOTP('123456', '654321', expiry, 0);
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid OTP code');
      
      console.log('✅ Invalid OTP correctly rejected');
    });

    test('❌ Should reject expired OTP', () => {
      console.log('⏰ Testing expired OTP rejection');
      
      const expiry = new Date(Date.now() - 1000); // 1 second ago
      const result = validateOTP('123456', '123456', expiry, 0);
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('OTP has expired');
      
      console.log('✅ Expired OTP correctly rejected');
    });

    test('❌ Should reject after too many attempts', () => {
      console.log('🚫 Testing attempt limit enforcement');
      
      const expiry = new Date(Date.now() + 10 * 60 * 1000);
      const result = validateOTP('123456', '123456', expiry, 5);
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Too many failed attempts');
      
      console.log('✅ Attempt limit correctly enforced');
    });

    test('❌ Should handle missing OTP data', () => {
      console.log('🔍 Testing missing OTP data handling');
      
      const result = validateOTP('123456', null, null, 0);
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('No valid OTP found');
      
      console.log('✅ Missing OTP data correctly handled');
    });
  });
});
