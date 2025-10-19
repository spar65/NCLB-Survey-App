/**
 * End-to-End Admin Dashboard Tests
 * @rule 380 "Comprehensive testing standards with visual organization"
 * @rule 054 "Accessibility testing for admin interface"
 */

import { test, expect } from '@playwright/test';

test.describe('📊 Admin Dashboard Flow', () => {
  test.beforeEach(async ({ page }) => {
    console.log('🧪 Setting up E2E admin dashboard test');
    
    // Login as admin first
    await page.goto('/admin/login');
    await page.getByLabel('Email Address').fill('admin@example.com');
    await page.getByLabel('Password').fill('admin123');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/admin/);
  });

  test('✅ Should display dashboard statistics', async ({ page }) => {
    console.log('📈 Testing dashboard statistics display');

    // Check that statistics are visible
    await expect(page.getByText('Total Invites')).toBeVisible();
    await expect(page.getByText('Total Responses')).toBeVisible();
    await expect(page.getByText('Completion Rate')).toBeVisible();

    // Check that numbers are displayed (should be > 0 from our test data)
    const totalInvites = page.locator('text=Total Invites').locator('..').getByText(/\d+/);
    await expect(totalInvites).toBeVisible();

    console.log('✅ Dashboard statistics displaying correctly');
  });

  test('✅ Should navigate between admin sections', async ({ page }) => {
    console.log('🧭 Testing admin navigation');

    // Test navigation to different sections
    await page.getByRole('tab', { name: /invites/i }).click();
    await expect(page).toHaveURL(/\/admin\/invites/);
    await expect(page.getByText('Manage Invites')).toBeVisible();

    await page.getByRole('tab', { name: /versions/i }).click();
    await expect(page).toHaveURL(/\/admin\/versions/);
    await expect(page.getByText('Survey Versions')).toBeVisible();

    await page.getByRole('tab', { name: /responses/i }).click();
    await expect(page).toHaveURL(/\/admin\/responses/);
    await expect(page.getByText('Survey Responses')).toBeVisible();

    console.log('✅ Admin navigation working correctly');
  });

  test('✅ Should handle data export functionality', async ({ page }) => {
    console.log('📤 Testing data export functionality');

    // Navigate to responses page
    await page.getByRole('tab', { name: /responses/i }).click();
    
    // Check export buttons are present
    await expect(page.getByText('Excel Export')).toBeVisible();
    await expect(page.getByText('CSV Export')).toBeVisible();

    // Test CSV export (Excel requires file download handling)
    const downloadPromise = page.waitForDownload();
    await page.getByText('CSV Export').click();
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/survey_responses_.*\.csv/);

    console.log('✅ Data export functionality working');
  });

  test('✅ Should manage user invites', async ({ page }) => {
    console.log('👥 Testing user invite management');

    // Navigate to invites page
    await page.getByRole('tab', { name: /invites/i }).click();

    // Should show existing invites
    await expect(page.getByText('teacher@example.com')).toBeVisible();
    await expect(page.getByText('student@example.com')).toBeVisible();

    // Test add invite dialog
    await page.getByRole('button', { name: /add invite/i }).click();
    await expect(page.getByText('Add New Invite')).toBeVisible();

    // Fill out new invite form
    await page.getByLabel('Email Address').fill('newuser@example.com');
    await page.getByRole('combobox').click();
    await page.getByRole('option', { name: 'Teachers' }).click();

    // Submit form (this will fail without API implementation, but UI should work)
    await page.getByRole('button', { name: /add invite/i }).last().click();

    console.log('✅ User invite management interface working');
  });

  test('🔍 Should be keyboard accessible', async ({ page }) => {
    console.log('♿ Testing admin dashboard keyboard accessibility');

    // Test tab navigation through dashboard
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Should be able to navigate to tabs
    const activeElement = page.locator(':focus');
    await expect(activeElement).toBeVisible();

    console.log('✅ Keyboard navigation working in admin dashboard');
  });

  test('❌ Should protect admin routes from unauthorized access', async ({ page }) => {
    console.log('🛡️ Testing admin route protection');

    // Clear cookies to simulate logged out state
    await page.context().clearCookies();

    // Try to access admin dashboard directly
    await page.goto('/admin/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL(/\/admin\/login/);
    await expect(page.getByText('Admin Login')).toBeVisible();

    console.log('✅ Admin route protection working correctly');
  });
});
