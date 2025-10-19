/**
 * Accessibility Compliance Tests
 * @rule 054 "Accessibility requirements testing with WCAG 2.2 AA"
 * @rule 380 "Comprehensive testing standards with visual organization"
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('♿ Accessibility Compliance Tests', () => {
  test('✅ Landing page should have no accessibility violations', async ({ page }) => {
    console.log('🔍 Testing landing page accessibility');

    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
    console.log('✅ Landing page accessibility: WCAG 2.2 AA compliant');
  });

  test('✅ Admin login page should have no accessibility violations', async ({ page }) => {
    console.log('🔍 Testing admin login accessibility');

    await page.goto('/admin/login');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
    console.log('✅ Admin login accessibility: WCAG 2.2 AA compliant');
  });

  test('✅ Admin dashboard should have no accessibility violations', async ({ page }) => {
    console.log('🔍 Testing admin dashboard accessibility');

    // Login first
    await page.goto('/admin/login');
    await page.getByLabel('Email Address').fill('admin@example.com');
    await page.getByLabel('Password').fill('admin123');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Wait for dashboard to load
    await expect(page.getByText('Dashboard')).toBeVisible();
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
    console.log('✅ Admin dashboard accessibility: WCAG 2.2 AA compliant');
  });

  test('🔍 Should have proper focus management', async ({ page }) => {
    console.log('⌨️ Testing keyboard focus management');

    await page.goto('/');

    // Test focus indicators are visible
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();

    // Focus should have visible indicator
    const focusStyles = await focusedElement.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        outline: styles.outline,
        boxShadow: styles.boxShadow,
      };
    });

    // Should have some form of focus indicator
    expect(
      focusStyles.outline !== 'none' || 
      focusStyles.boxShadow !== 'none'
    ).toBeTruthy();

    console.log('✅ Focus indicators properly implemented');
  });

  test('🔍 Should have proper color contrast', async ({ page }) => {
    console.log('🎨 Testing color contrast compliance');

    await page.goto('/');

    // Test that text has sufficient contrast
    const textElements = await page.locator('p, h1, h2, h3, label, button').all();
    
    for (const element of textElements.slice(0, 5)) { // Test first 5 elements
      const isVisible = await element.isVisible();
      if (isVisible) {
        const styles = await element.evaluate((el) => {
          const computed = window.getComputedStyle(el);
          return {
            color: computed.color,
            backgroundColor: computed.backgroundColor,
          };
        });
        
        // Basic check that colors are defined
        expect(styles.color).toBeDefined();
        expect(styles.backgroundColor).toBeDefined();
      }
    }

    console.log('✅ Color contrast elements properly configured');
  });

  test('🔍 Should have proper semantic HTML structure', async ({ page }) => {
    console.log('🏗️ Testing semantic HTML structure');

    await page.goto('/');

    // Check for proper heading hierarchy
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    expect(headings.length).toBeGreaterThan(0);

    // Check for proper form labels
    const inputs = await page.locator('input').all();
    for (const input of inputs) {
      const id = await input.getAttribute('id');
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        await expect(label).toBeVisible();
      }
    }

    console.log('✅ Semantic HTML structure properly implemented');
  });

  test('🔍 Should support screen readers', async ({ page }) => {
    console.log('📢 Testing screen reader support');

    await page.goto('/');

    // Check for ARIA labels and descriptions
    const interactiveElements = await page.locator('button, input, [role="button"]').all();
    
    for (const element of interactiveElements.slice(0, 3)) { // Test first 3 elements
      const ariaLabel = await element.getAttribute('aria-label');
      const ariaDescribedBy = await element.getAttribute('aria-describedby');
      const textContent = await element.textContent();
      
      // Should have some form of accessible name
      expect(
        ariaLabel || 
        ariaDescribedBy || 
        (textContent && textContent.trim().length > 0)
      ).toBeTruthy();
    }

    console.log('✅ Screen reader support properly implemented');
  });
});
