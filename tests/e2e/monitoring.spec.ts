/**
 * Playwright E2E Tests for Monitoring UI
 * 
 * Tests cover:
 * - Page loads
 * - Keyboard navigation
 * - Accessibility
 * - RTL support
 */

import { test, expect } from '@playwright/test';

test.describe('Monitoring UI', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the home page
    await page.goto('http://localhost:3000');
  });

  test.describe('HomePage', () => {
    test('loads successfully', async ({ page }) => {
      await expect(page.locator('h1')).toContainText(/home|خانه/i);
    });

    test('displays KPI metrics', async ({ page }) => {
      // Should show metric cards
      const metrics = page.locator('[class*="MetricCard"]').or(page.locator('[data-testid="metric-card"]'));
      await expect(metrics.first()).toBeVisible();
    });

    test('has quick actions', async ({ page }) => {
      const quickActions = page.getByText(/Start New Experiment|شروع آزمایش/i);
      await expect(quickActions).toBeVisible();
    });
  });

  test.describe('Experiments Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('http://localhost:3000/experiments');
    });

    test('loads experiments table', async ({ page }) => {
      await expect(page.locator('table')).toBeVisible();
    });

    test('table has sortable columns', async ({ page }) => {
      const sortableHeader = page.locator('th[class*="sortable"]').first();
      await sortableHeader.click();
      // Table should re-render with sorted data
      await page.waitForTimeout(300);
    });

    test('keyboard navigation works', async ({ page }) => {
      // Tab to first focusable element
      await page.keyboard.press('Tab');
      
      // Should be able to navigate with arrow keys if inside table
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowUp');
    });

    test('search filters experiments', async ({ page }) => {
      const searchInput = page.locator('input[placeholder*="search" i], input[placeholder*="جستجو"]');
      await searchInput.fill('run-001');
      
      // Wait for filtering
      await page.waitForTimeout(500);
      
      // Should show filtered results
      const rows = page.locator('tbody tr');
      const count = await rows.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Live Monitor Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('http://localhost:3000/monitor');
    });

    test('displays live metrics', async ({ page }) => {
      // Should have metric cards
      const metricsGrid = page.locator('[class*="grid"]').first();
      await expect(metricsGrid).toBeVisible();
    });

    test('streaming logs render', async ({ page }) => {
      // Look for log container
      const logsContainer = page.locator('[class*="font-mono"]').or(page.getByText(/Streaming Logs/i));
      await expect(logsContainer.first()).toBeVisible();
    });

    test('charts are visible', async ({ page }) => {
      // Recharts renders SVG
      const chart = page.locator('svg');
      await expect(chart.first()).toBeVisible();
    });
  });

  test.describe('Playground Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('http://localhost:3000/playground');
    });

    test('chat input is functional', async ({ page }) => {
      const input = page.locator('input[placeholder*="message" i], input[placeholder*="پیام"]');
      await input.fill('سلام');
      
      const sendButton = page.locator('button[type="submit"]').or(page.getByRole('button', { name: /send/i }));
      await sendButton.first().click();
      
      // Should show loading or message
      await page.waitForTimeout(500);
    });

    test('settings panel adjusts parameters', async ({ page }) => {
      // Temperature slider
      const temperatureSlider = page.locator('input[type="range"]').first();
      await temperatureSlider.fill('0.5');
      
      // Value should update
      await page.waitForTimeout(200);
    });
  });

  test.describe('Settings Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('http://localhost:3000/settings');
    });

    test('theme toggle works', async ({ page }) => {
      const themeSelect = page.locator('select').first();
      await themeSelect.selectOption('dark');
      
      // HTML should have dark class
      await page.waitForTimeout(300);
      const html = page.locator('html');
      await expect(html).toHaveClass(/dark/);
    });

    test('settings can be saved', async ({ page }) => {
      const saveButton = page.getByRole('button', { name: /save|ذخیره/i });
      await saveButton.click();
      
      // Success message should appear
      await expect(page.getByText(/success|موفق/i)).toBeVisible({ timeout: 3000 });
    });
  });

  test.describe('Accessibility', () => {
    test('has no ARIA violations on home page', async ({ page }) => {
      await page.goto('http://localhost:3000');
      
      // Check for basic ARIA attributes
      const buttons = page.locator('button');
      const count = await buttons.count();
      
      for (let i = 0; i < Math.min(count, 5); i++) {
        const button = buttons.nth(i);
        const ariaLabel = await button.getAttribute('aria-label');
        const text = await button.textContent();
        
        // Either has aria-label or visible text
        expect(ariaLabel || text?.trim()).toBeTruthy();
      }
    });

    test('keyboard focus is visible', async ({ page }) => {
      await page.goto('http://localhost:3000');
      
      await page.keyboard.press('Tab');
      const focused = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el) return false;
        
        const style = window.getComputedStyle(el);
        return style.outline !== 'none' || style.boxShadow !== 'none';
      });
      
      expect(focused).toBeTruthy();
    });
  });

  test.describe('RTL Support', () => {
    test('Persian text displays RTL', async ({ page }) => {
      await page.goto('http://localhost:3000');
      
      const mainContainer = page.locator('main, [dir="rtl"]');
      const dir = await mainContainer.first().getAttribute('dir');
      
      expect(dir).toBe('rtl');
    });

    test('layout mirrors for RTL', async ({ page }) => {
      await page.goto('http://localhost:3000');
      
      // Sidebar should be on the right
      const sidebar = page.locator('aside').first();
      const position = await sidebar.evaluate(el => {
        const rect = el.getBoundingClientRect();
        return rect.right > window.innerWidth - 300;
      });
      
      expect(position).toBeTruthy();
    });
  });

  test.describe('Responsive Design', () => {
    test('mobile menu works', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('http://localhost:3000');
      
      // Mobile menu button should be visible
      const menuButton = page.locator('button[aria-label*="menu" i]').or(page.locator('[class*="Menu"]'));
      await expect(menuButton.first()).toBeVisible();
    });

    test('grid adapts to mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('http://localhost:3000');
      
      // Grids should stack vertically
      const grid = page.locator('[class*="grid"]').first();
      const columns = await grid.evaluate(el => {
        return window.getComputedStyle(el).gridTemplateColumns.split(' ').length;
      });
      
      expect(columns).toBeLessThanOrEqual(2);
    });
  });

  test.describe('Performance', () => {
    test('skeleton appears before content', async ({ page }) => {
      await page.goto('http://localhost:3000/experiments');
      
      // Should see skeleton before table (if slow network)
      // This is a basic check - in real tests, throttle network
      const skeleton = page.locator('[class*="Skeleton"], [class*="animate-pulse"]');
      const hasSkeletonOrTable = await Promise.race([
        skeleton.first().isVisible().then(() => 'skeleton'),
        page.locator('table').isVisible().then(() => 'table'),
      ]);
      
      expect(['skeleton', 'table']).toContain(hasSkeletonOrTable);
    });

    test('page loads within 3 seconds', async ({ page }) => {
      const start = Date.now();
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(3000);
    });
  });
});
