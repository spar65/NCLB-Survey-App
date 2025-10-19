/**
 * Jest Setup File
 * @rule 380 "Comprehensive testing standards setup"
 */

import '@testing-library/jest-dom';

// Extend Jest matchers with Testing Library matchers
expect.extend(require('@testing-library/jest-dom/matchers'));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '/';
  },
}));

// Mock environment variables
process.env.SESSION_SECRET = 'test-secret-key-for-testing-only';
process.env.NODE_ENV = 'test';

// Global test utilities
global.console = {
  ...console,
  // Suppress console.log in tests unless explicitly needed
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
