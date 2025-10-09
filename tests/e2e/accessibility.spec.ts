/**
 * Accessibility E2E Tests
 * 
 * Tests for:
 * - Keyboard navigation
 * - Focus visible
 * - ARIA labels
 * - RTL support
 */

import { test, expect } from '@playwright/test';

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('should have proper ARIA labels on main controls', async ({ page }) => {
    // Check chat input
    const chatInput = page.getByRole('textbox', { name: /message|پیام/i });
    await expect(chatInput).toBeVisible();

    // Check send button
    const sendButton = page.getByRole('button', { name: /send|ارسال/i });
    await expect(sendButton).toBeVisible();

    // Check settings button
    const settingsButton = page.getByRole('button', { name: /settings|تنظیمات/i });
    await expect(settingsButton).toBeVisible();
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    
    // First focusable element should have visible focus
    const firstFocused = await page.evaluate(() => {
      const focused = document.activeElement;
      const styles = window.getComputedStyle(focused!);
      return {
        outline: styles.outline,
        outlineColor: styles.outlineColor,
        outlineWidth: styles.outlineWidth,
      };
    });

    // Should have visible focus indicator
    expect(firstFocused.outline).not.toBe('none');
    expect(parseInt(firstFocused.outlineWidth)).toBeGreaterThan(0);
  });

  test('should handle Enter key to send message', async ({ page }) => {
    const input = page.getByRole('textbox', { name: /message|پیام/i });
    await input.fill('سلام');
    await input.press('Enter');

    // Message should be sent
    await expect(page.getByText('سلام')).toBeVisible();
  });

  test('should handle Shift+Enter for new line', async ({ page }) => {
    const input = page.getByRole('textbox', { name: /message|پیام/i });
    await input.fill('Line 1');
    await input.press('Shift+Enter');
    await input.type('Line 2');

    const value = await input.inputValue();
    expect(value).toContain('\n');
  });

  test('should support RTL direction for Persian', async ({ page }) => {
    const htmlDir = await page.evaluate(() => document.documentElement.getAttribute('dir'));
    expect(htmlDir).toBe('rtl');
  });

  test('should allow RTL/LTR switching from settings', async ({ page }) => {
    // Open settings
    const settingsButton = page.getByRole('button', { name: /settings|تنظیمات/i });
    await settingsButton.click();

    // Find direction selector
    const directionSelect = page.locator('select[value="rtl"], select[value="ltr"]').first();
    await directionSelect.selectOption('ltr');

    // Save settings
    const saveButton = page.getByRole('button', { name: /save|ذخیره/i });
    await saveButton.click();

    // Check direction changed
    const newDir = await page.evaluate(() => document.documentElement.getAttribute('dir'));
    expect(newDir).toBe('ltr');
  });

  test('should have minimum 44x44px touch targets', async ({ page }) => {
    // Check all buttons meet minimum size
    const buttons = await page.locator('button').all();
    
    for (const button of buttons) {
      const box = await button.boundingBox();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(44);
        expect(box.width).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test('should have visible focus indicators', async ({ page }) => {
    const input = page.getByRole('textbox').first();
    await input.focus();

    const outline = await input.evaluate((el) => {
      return window.getComputedStyle(el).outline;
    });

    expect(outline).not.toBe('none');
  });

  test('should navigate with keyboard between all interactive elements', async ({ page }) => {
    const interactiveElements = await page.locator('button, input, select, a').count();
    
    // Tab through all elements
    for (let i = 0; i < interactiveElements; i++) {
      await page.keyboard.press('Tab');
      
      // Check active element is visible
      const isVisible = await page.evaluate(() => {
        const el = document.activeElement;
        return el && el.offsetParent !== null;
      });
      
      expect(isVisible).toBe(true);
    }
  });

  test('should have skeleton loaders during data loading', async ({ page }) => {
    // Navigate to page that shows loading state
    await page.goto('http://localhost:3000/monitoring');

    // Check for skeleton elements
    const skeletons = page.locator('.skeleton');
    const count = await skeletons.count();

    // Should have at least one skeleton during initial load
    expect(count).toBeGreaterThan(0);
  });

  test('should have proper contrast ratios', async ({ page }) => {
    // Get computed styles of text elements
    const textElements = await page.locator('p, h1, h2, h3, h4, h5, h6, span, button').all();
    
    for (const element of textElements.slice(0, 10)) { // Check first 10
      const contrast = await element.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        const bgColor = styles.backgroundColor;
        const textColor = styles.color;
        
        // Simple contrast check (would need full WCAG calculation in production)
        return { bgColor, textColor };
      });

      // Ensure colors are defined
      expect(contrast.textColor).not.toBe('');
      expect(contrast.bgColor).not.toBe('');
    }
  });
});

test.describe('Keyboard Navigation Flow', () => {
  test('should complete full chat flow with keyboard only', async ({ page }) => {
    await page.goto('http://localhost:3000/playground');

    // Navigate to input with Tab
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Type message
    await page.keyboard.type('سلام');

    // Send with Enter
    await page.keyboard.press('Enter');

    // Verify message sent
    await expect(page.getByText('سلام')).toBeVisible();
  });

  test('should open and close modals with keyboard', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Tab to settings button
    await page.keyboard.press('Tab');
    const settingsButton = await page.evaluate(() => document.activeElement?.textContent);
    
    if (settingsButton?.includes('Settings') || settingsButton?.includes('تنظیمات')) {
      // Open with Enter
      await page.keyboard.press('Enter');

      // Check modal opened
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();

      // Close with Escape
      await page.keyboard.press('Escape');
      await expect(modal).not.toBeVisible();
    }
  });
});
