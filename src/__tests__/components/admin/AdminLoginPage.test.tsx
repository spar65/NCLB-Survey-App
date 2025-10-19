/**
 * Admin Login Page Component Tests
 * @rule 380 "Comprehensive testing standards with visual organization"
 * @rule 054 "Accessibility testing requirements"
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminLoginPage from '@/app/admin/login/page';

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock useRouter
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('🔐 Admin Login Page Component Tests', () => {
  beforeEach(() => {
    console.log('🧪 Setting up admin login component test');
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  test('✅ Should render login form correctly', () => {
    console.log('🎨 Testing login form rendering');

    render(<AdminLoginPage />);

    // Check form elements (CardTitle doesn't render as heading by default)
    expect(screen.getByText(/admin login/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();

    // Check accessibility
    expect(screen.getByText(/default credentials/i)).toBeInTheDocument();

    console.log('✅ Login form rendered correctly');
  });

  test('✅ Should handle successful login', async () => {
    console.log('🔑 Testing successful login flow');

    const user = userEvent.setup();

    // Mock successful API response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        user: {
          id: 1,
          email: 'admin@example.com',
          name: 'Test Admin',
          role: 'admin',
        },
      }),
    });

    render(<AdminLoginPage />);

    // Fill out form
    await user.type(screen.getByLabelText(/email address/i), 'admin@example.com');
    await user.type(screen.getByLabelText(/password/i), 'admin123');

    // Submit form
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    // Wait for API call
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@example.com',
          password: 'admin123',
        }),
      });
    });

    // Should redirect to dashboard
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/admin/dashboard');
    });

    console.log('✅ Successful login flow working');
  });

  test('❌ Should display error for failed login', async () => {
    console.log('🚫 Testing failed login error display');

    const user = userEvent.setup();

    // Mock failed API response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: 'Invalid email or password',
      }),
    });

    render(<AdminLoginPage />);

    // Fill out form with invalid credentials
    await user.type(screen.getByLabelText(/email address/i), 'admin@example.com');
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword');

    // Submit form
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    });

    // Should not redirect
    expect(mockPush).not.toHaveBeenCalled();

    console.log('✅ Failed login error correctly displayed');
  });

  test('✅ Should disable form during submission', async () => {
    console.log('⏳ Testing form disabled state during submission');

    const user = userEvent.setup();

    // Mock slow API response
    (global.fetch as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 1000))
    );

    render(<AdminLoginPage />);

    // Fill out form
    await user.type(screen.getByLabelText(/email address/i), 'admin@example.com');
    await user.type(screen.getByLabelText(/password/i), 'admin123');

    // Submit form
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    // Check loading state
    expect(screen.getByText(/signing in/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeDisabled();
    expect(screen.getByLabelText(/password/i)).toBeDisabled();

    console.log('✅ Form correctly disabled during submission');
  });

  test('✅ Should validate required fields', async () => {
    console.log('📝 Testing form validation');

    const user = userEvent.setup();

    render(<AdminLoginPage />);

    // Try to submit empty form
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    expect(submitButton).toBeDisabled();

    // Fill email only
    await user.type(screen.getByLabelText(/email address/i), 'admin@example.com');
    expect(submitButton).toBeDisabled();

    // Fill password - should enable button
    await user.type(screen.getByLabelText(/password/i), 'admin123');
    expect(submitButton).toBeEnabled();

    console.log('✅ Form validation working correctly');
  });

  test('🔍 Should have proper accessibility attributes', () => {
    console.log('♿ Testing accessibility compliance');

    render(<AdminLoginPage />);

    // Check form labels are properly associated
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);

    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('required');
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(passwordInput).toHaveAttribute('required');

    // Check button accessibility
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    expect(submitButton).toHaveAttribute('type', 'submit');

    console.log('✅ Accessibility attributes properly configured');
  });
});
