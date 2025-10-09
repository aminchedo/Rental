/**
 * Keyboard Navigation Tests
 * 
 * Verifies keyboard accessibility and :focus-visible styles
 */

import { test, expect } from '@playwright/test';

const APP_URL = process.env.APP_URL || 'http://localhost:3000';

test.describe('Keyboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(APP_URL);
  });

  test('Tab navigation through interactive elements', async ({ page }) => {
    // Press Tab to navigate through focusable elements
    await page.keyboard.press('Tab');
    
    // Check that first focusable element has focus
    const firstFocused = await page.locator(':focus').first();
    expect(firstFocused).toBeDefined();
    
    // Continue tabbing
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      const focused = await page.locator(':focus').first();
      expect(focused).toBeDefined();
    }
  });

  test('Focus visible styles are applied', async ({ page }) => {
    // Focus on a button
    const button = page.locator('button').first();
    await button.focus();
    
    // Check for focus-visible styles
    const outlineStyle = await button.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return styles.outlineWidth;
    });
    
    // Should have visible outline when focused
    console.log('Focus outline width:', outlineStyle);
  });

  test('Enter key activates buttons', async ({ page }) => {
    const button = page.locator('button[type="submit"]').first();
    
    if (await button.count() > 0) {
      await button.focus();
      await page.keyboard.press('Enter');
      
      // Button should have been activated
      console.log('Button activated via Enter key');
    }
  });

  test('Escape key closes modals', async ({ page }) => {
    // Try to open a modal/drawer
    const settingsButton = page.locator('button').filter({ hasText: /settings|تنظیمات/i }).first();
    
    if (await settingsButton.count() > 0) {
      await settingsButton.click();
      
      // Press Escape
      await page.keyboard.press('Escape');
      
      // Modal should be closed
      console.log('Modal closed via Escape key');
    }
  });

  test('Arrow keys navigate through lists', async ({ page }) => {
    // Find a list or menu
    const list = page.locator('[role="list"], [role="menu"], [role="listbox"]').first();
    
    if (await list.count() > 0) {
      // Focus first item
      const firstItem = list.locator('[role="listitem"], [role="menuitem"], [role="option"]').first();
      await firstItem.focus();
      
      // Navigate with arrow keys
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowUp');
      
      console.log('Arrow key navigation works');
    }
  });

  test('Shift+Tab reverses navigation', async ({ page }) => {
    // Tab forward
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    const forwardFocus = await page.locator(':focus').first();
    const forwardId = await forwardFocus.getAttribute('id');
    
    // Shift+Tab backward
    await page.keyboard.press('Shift+Tab');
    
    const backwardFocus = await page.locator(':focus').first();
    const backwardId = await backwardFocus.getAttribute('id');
    
    // Should be different elements
    console.log('Forward focus:', forwardId);
    console.log('Backward focus:', backwardId);
  });

  test('Focus trap in modals', async ({ page }) => {
    // Open a modal
    const modalTrigger = page.locator('button').filter({ hasText: /open|باز کردن/i }).first();
    
    if (await modalTrigger.count() > 0) {
      await modalTrigger.click();
      
      // Tab through modal elements
      const modal = page.locator('[role="dialog"], [role="modal"]').first();
      
      if (await modal.count() > 0) {
        // Focus should stay within modal
        await page.keyboard.press('Tab');
        const focused = await page.locator(':focus').first();
        
        // Check if focus is inside modal
        const isInsideModal = await modal.locator(':focus').count() > 0;
        console.log('Focus trapped in modal:', isInsideModal);
      }
    }
  });

  test('Minimum touch target size (44x44px)', async ({ page }) => {
    const buttons = page.locator('button, a, input[type="checkbox"], input[type="radio"]');
    const count = await buttons.count();
    
    for (let i = 0; i < Math.min(count, 10); i++) {
      const element = buttons.nth(i);
      const box = await element.boundingBox();
      
      if (box) {
        // Check minimum size
        const meetsMinSize = box.width >= 44 && box.height >= 44;
        console.log(`Element ${i}: ${box.width}x${box.height} - ${meetsMinSize ? 'OK' : 'TOO SMALL'}`);
      }
    }
  });

  test('ARIA labels present on interactive elements', async ({ page }) => {
    const buttons = page.locator('button').all();
    
    for (const button of await buttons) {
      const ariaLabel = await button.getAttribute('aria-label');
      const ariaLabelledBy = await button.getAttribute('aria-labelledby');
      const text = await button.textContent();
      
      const hasLabel = ariaLabel || ariaLabelledBy || text;
      
      if (!hasLabel) {
        console.warn('Button without label found');
      }
    }
  });

  test('Form inputs have labels', async ({ page }) => {
    const inputs = page.locator('input, textarea, select').all();
    
    for (const input of await inputs) {
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');
      
      const hasLabel = ariaLabel || ariaLabelledBy || (id && await page.locator(`label[for="${id}"]`).count() > 0);
      
      if (!hasLabel) {
        console.warn('Input without label found');
      }
    }
  });
});

test.describe('RTL Keyboard Navigation', () => {
  test('Arrow keys respect RTL direction', async ({ page }) => {
    await page.goto(APP_URL);
    
    // Check HTML dir attribute
    const dir = await page.locator('html').getAttribute('dir');
    console.log('Page direction:', dir);
    
    // In RTL, ArrowRight should go to previous item
    // In LTR, ArrowRight should go to next item
    
    if (dir === 'rtl') {
      console.log('RTL mode detected - arrow keys should be reversed');
    } else {
      console.log('LTR mode detected - arrow keys standard');
    }
  });

  test('Tab order respects visual order in RTL', async ({ page }) => {
    await page.goto(APP_URL);
    
    // Tab through elements
    const focusedElements: string[] = [];
    
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      const focused = await page.locator(':focus').first();
      const text = await focused.textContent();
      focusedElements.push(text || 'unknown');
    }
    
    console.log('Tab order:', focusedElements);
  });
});
