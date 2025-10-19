/**
 * End-to-End Survey Flow Tests
 * @rule 380 "Comprehensive testing standards with visual organization"
 * @rule 054 "Accessibility testing requirements"
 */

import { test, expect } from '@playwright/test';

test.describe('🔐 Survey Submission Flow', () => {
  test.beforeEach(async ({ page }) => {
    console.log('🧪 Setting up E2E survey flow test');
    await page.goto('/');
  });

  test('✅ Should complete full survey flow successfully', async ({ page }) => {
    console.log('🎯 Testing complete survey submission flow');

    // Step 1: Landing page should be accessible
    await expect(page.getByText('AI in Education Survey')).toBeVisible();
    await expect(page.getByText('Help us understand perspectives')).toBeVisible();
    console.log('✅ Step 1: Landing page loaded');

    // Step 2: Request OTP with valid email
    await page.getByLabel('Email Address').fill('teacher@example.com');
    await page.getByRole('button', { name: /request access code/i }).click();

    // Wait for OTP step
    await expect(page.getByText('Enter 6-Digit Access Code')).toBeVisible();
    console.log('✅ Step 2: OTP request successful');

    // Step 3: Enter OTP (look for dev code in page or use known test code)
    const devCodeElement = page.locator('text=Development code:');
    let otpCode = '123456'; // fallback
    
    if (await devCodeElement.isVisible()) {
      const devCodeText = await devCodeElement.textContent();
      const match = devCodeText?.match(/Development code: (\d{6})/);
      if (match) {
        otpCode = match[1];
        console.log('🔧 Using development OTP code:', otpCode);
      }
    }

    // Fill OTP slots
    const otpSlots = page.locator('[data-input-otp-slot]');
    for (let i = 0; i < 6; i++) {
      await otpSlots.nth(i).fill(otpCode[i]);
    }

    // Check consent
    await page.getByLabel(/I consent to participate/i).check();
    console.log('✅ Step 3: OTP entered and consent given');

    // Step 4: Continue to survey
    await page.getByRole('button', { name: /continue/i }).click();

    // Should redirect to survey page
    await expect(page).toHaveURL(/\/survey\//);
    await expect(page.getByText('Question 1')).toBeVisible();
    console.log('✅ Step 4: Survey page loaded');

    // Step 5: Answer survey questions
    await expect(page.getByText(/How do you currently use technology/i)).toBeVisible();
    
    // Fill first question (open-ended)
    await page.getByRole('textbox').fill(
      'I currently use tablets, interactive whiteboards, and educational apps extensively in my classroom. ' +
      'I see AI as a powerful tool for creating personalized learning experiences and automating administrative tasks.'
    );

    // Navigate to next question
    await page.getByRole('button', { name: /next/i }).click();
    await expect(page.getByText('Question 2')).toBeVisible();
    console.log('✅ Step 5: First question answered, navigation working');

    // Fill second question
    await page.getByRole('textbox').fill(
      'Benefits include personalized learning paths and instant feedback for students. ' +
      'Challenges include ensuring academic integrity and managing the learning curve for both teachers and students.'
    );

    // Navigate to next question
    await page.getByRole('button', { name: /next/i }).click();
    await expect(page.getByText('Question 3')).toBeVisible();

    // Answer multiple choice question
    await page.getByLabel('Hands-on workshops').check();
    console.log('✅ Step 6: Multiple choice question answered');

    // Step 6: Submit survey
    await page.getByRole('button', { name: /submit survey/i }).click();

    // Should redirect to success page
    await expect(page.getByText('Thank You!')).toBeVisible();
    await expect(page.getByText(/survey has been submitted successfully/i)).toBeVisible();
    console.log('✅ Step 7: Survey submitted successfully');

    console.log('🎉 Complete survey flow test passed');
  });

  test('❌ Should validate required fields', async ({ page }) => {
    console.log('📝 Testing form validation');

    // Try to request OTP without email
    await page.getByRole('button', { name: /request access code/i }).click();
    
    // Button should be disabled or show validation
    const button = page.getByRole('button', { name: /request access code/i });
    await expect(button).toBeDisabled();

    console.log('✅ Email validation working');
  });

  test('❌ Should handle invalid OTP codes', async ({ page }) => {
    console.log('🔐 Testing invalid OTP handling');

    // Request OTP
    await page.getByLabel('Email Address').fill('teacher@example.com');
    await page.getByRole('button', { name: /request access code/i }).click();
    await expect(page.getByText('Enter 6-Digit Access Code')).toBeVisible();

    // Enter invalid OTP
    const otpSlots = page.locator('[data-input-otp-slot]');
    for (let i = 0; i < 6; i++) {
      await otpSlots.nth(i).fill('9');
    }

    // Check consent and try to continue
    await page.getByLabel(/I consent to participate/i).check();
    await page.getByRole('button', { name: /continue/i }).click();

    // Should show error message
    await expect(page.getByText(/invalid/i)).toBeVisible();
    console.log('✅ Invalid OTP correctly rejected');
  });

  test('🔍 Should be accessible via keyboard navigation', async ({ page }) => {
    console.log('♿ Testing keyboard accessibility');

    // Navigate using Tab key
    await page.keyboard.press('Tab'); // Focus email input
    await expect(page.getByLabel('Email Address')).toBeFocused();

    await page.keyboard.type('teacher@example.com');
    await page.keyboard.press('Tab'); // Focus submit button
    await expect(page.getByRole('button', { name: /request access code/i })).toBeFocused();

    // Submit with Enter key
    await page.keyboard.press('Enter');
    await expect(page.getByText('Enter 6-Digit Access Code')).toBeVisible();

    console.log('✅ Keyboard navigation working correctly');
  });

  test('📱 Should work on mobile devices', async ({ page, isMobile }) => {
    if (!isMobile) {
      test.skip('Skipping mobile test on desktop browser');
    }

    console.log('📱 Testing mobile responsiveness');

    // Check mobile layout
    await expect(page.getByText('AI in Education Survey')).toBeVisible();
    
    // Touch targets should be large enough (44px minimum)
    const submitButton = page.getByRole('button', { name: /request access code/i });
    const buttonBox = await submitButton.boundingBox();
    
    if (buttonBox) {
      expect(buttonBox.height).toBeGreaterThanOrEqual(44);
      expect(buttonBox.width).toBeGreaterThanOrEqual(44);
    }

    console.log('✅ Mobile layout and touch targets verified');
  });
});
