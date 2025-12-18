/**
 * Calendar Verification Test Suite
 *
 * Purpose: Verify calendar navigation and date accuracy across all months of 2026 and leap years
 *
 * Tests:
 * 1. All 12 months of 2026 - verify day-of-week alignment
 * 2. Leap year handling (Feb 2024, Feb 2028)
 * 3. Month navigation functionality
 *
 * Expected Results:
 * - Each month starts on correct day of week
 * - February 2024/2028 shows 29 days
 * - Navigation buttons update grid correctly
 */

import { test, expect } from '@playwright/test';

// Known calendar facts for verification
const MONTH_2026_FACTS = [
  { month: 'January 2026', firstDay: 'Thursday', days: 31 },
  { month: 'February 2026', firstDay: 'Sunday', days: 28 },
  { month: 'March 2026', firstDay: 'Sunday', days: 31 },
  { month: 'April 2026', firstDay: 'Wednesday', days: 30 },
  { month: 'May 2026', firstDay: 'Friday', days: 31 },
  { month: 'June 2026', firstDay: 'Monday', days: 30 },
  { month: 'July 2026', firstDay: 'Wednesday', days: 31 },
  { month: 'August 2026', firstDay: 'Saturday', days: 31 },
  { month: 'September 2026', firstDay: 'Tuesday', days: 30 },
  { month: 'October 2026', firstDay: 'Thursday', days: 31 },
  { month: 'November 2026', firstDay: 'Sunday', days: 30 },
  { month: 'December 2026', firstDay: 'Tuesday', days: 31 }
];

const LEAP_YEAR_FACTS = [
  { month: 'February 2024', firstDay: 'Thursday', days: 29 },
  { month: 'February 2028', firstDay: 'Tuesday', days: 29 }
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

test.describe('Calendar Navigation and Date Verification', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('https://cal-firi6x7bh-manu-mulaveesalas-projects.vercel.app');
    await page.waitForLoadState('networkidle');
  });

  test('verifies all 12 months of 2026 have correct day-of-week alignment', async ({ page }) => {
    // Start from January 2026
    const nextButton = page.getByRole('button', { name: /next/i });
    const prevButton = page.getByRole('button', { name: /previous/i });

    // Navigate to January 2026
    let currentMonthText = await page.locator('h2').first().textContent();
    console.log(`Starting from: ${currentMonthText}`);

    // Navigate to January 2026 if not already there
    while (!currentMonthText?.includes('January 2026')) {
      if (currentMonthText && currentMonthText < 'January 2026') {
        await nextButton.click();
      } else {
        await prevButton.click();
      }
      await page.waitForTimeout(300);
      currentMonthText = await page.locator('h2').first().textContent();
    }

    // Verify each month of 2026
    for (const monthFact of MONTH_2026_FACTS) {
      // Verify month header
      const monthHeader = await page.locator('h2').first().textContent();
      expect(monthHeader).toContain(monthFact.month);

      console.log(`\nVerifying: ${monthFact.month}`);
      console.log(`Expected first day: ${monthFact.firstDay}`);

      // Get all day cells
      const dayCells = page.locator('[data-testid="day-cell"]');
      const dayCount = await dayCells.count();
      expect(dayCount).toBe(42); // Always 42 cells (7×6 grid)

      // Find first day of current month (not grayed out)
      let firstDayFound = false;
      let firstDayColumn = -1;

      for (let i = 0; i < dayCount; i++) {
        const cell = dayCells.nth(i);
        const cellText = await cell.textContent();
        const isGrayedOut = await cell.evaluate(el =>
          el.classList.contains('text-gray-400') ||
          el.classList.contains('opacity-50')
        );

        if (cellText === '1' && !isGrayedOut) {
          firstDayFound = true;
          firstDayColumn = i % 7; // Column in grid (0-6)
          const actualDayName = DAY_NAMES[firstDayColumn];

          console.log(`  ✓ First day (1) found at column ${firstDayColumn} (${actualDayName})`);
          expect(actualDayName).toBe(monthFact.firstDay);
          break;
        }
      }

      expect(firstDayFound).toBe(true);

      // Verify last day of month appears
      const lastDayCells = await dayCells.evaluateAll((cells, lastDay) => {
        return cells.filter(cell => {
          const text = cell.textContent;
          const isGrayedOut = cell.classList.contains('text-gray-400') ||
                             cell.classList.contains('opacity-50');
          return text === String(lastDay) && !isGrayedOut;
        });
      }, monthFact.days);

      expect(lastDayCells.length).toBeGreaterThan(0);
      console.log(`  ✓ Last day (${monthFact.days}) found in grid`);

      // Navigate to next month
      if (monthFact !== MONTH_2026_FACTS[MONTH_2026_FACTS.length - 1]) {
        await nextButton.click();
        await page.waitForTimeout(300);
      }
    }

    console.log('\n✅ All 12 months of 2026 verified successfully');
  });

  test('verifies leap year February months (2024, 2028)', async ({ page }) => {
    const nextButton = page.getByRole('button', { name: /next/i });
    const prevButton = page.getByRole('button', { name: /previous/i });

    for (const leapFact of LEAP_YEAR_FACTS) {
      // Navigate to the leap year February
      let currentMonthText = await page.locator('h2').first().textContent();

      while (!currentMonthText?.includes(leapFact.month)) {
        if (currentMonthText && currentMonthText < leapFact.month) {
          await nextButton.click();
        } else {
          await prevButton.click();
        }
        await page.waitForTimeout(300);
        currentMonthText = await page.locator('h2').first().textContent();
      }

      console.log(`\nVerifying leap year: ${leapFact.month}`);

      // Verify 29 days exist
      const dayCells = page.locator('[data-testid="day-cell"]');
      const day29Cells = await dayCells.evaluateAll(cells => {
        return cells.filter(cell => {
          const text = cell.textContent;
          const isGrayedOut = cell.classList.contains('text-gray-400') ||
                             cell.classList.contains('opacity-50');
          return text === '29' && !isGrayedOut;
        });
      });

      expect(day29Cells.length).toBeGreaterThan(0);
      console.log(`  ✓ Day 29 found (leap year confirmed)`);

      // Verify 30 does NOT exist in this month
      const day30Cells = await dayCells.evaluateAll(cells => {
        return cells.filter(cell => {
          const text = cell.textContent;
          const isGrayedOut = cell.classList.contains('text-gray-400') ||
                             cell.classList.contains('opacity-50');
          return text === '30' && !isGrayedOut;
        });
      });

      expect(day30Cells.length).toBe(0);
      console.log(`  ✓ Day 30 not found (February has only 29 days)`);
    }

    console.log('\n✅ Leap year verification passed');
  });

  test('verifies navigation buttons update the calendar grid', async ({ page }) => {
    const nextButton = page.getByRole('button', { name: /next/i });
    const prevButton = page.getByRole('button', { name: /previous/i });

    // Get initial month
    const initialMonth = await page.locator('h2').first().textContent();
    console.log(`Initial month: ${initialMonth}`);

    // Click next and verify change
    await nextButton.click();
    await page.waitForTimeout(300);
    const nextMonth = await page.locator('h2').first().textContent();
    console.log(`After next: ${nextMonth}`);
    expect(nextMonth).not.toBe(initialMonth);

    // Click prev twice and verify change
    await prevButton.click();
    await page.waitForTimeout(300);
    await prevButton.click();
    await page.waitForTimeout(300);
    const prevMonth = await page.locator('h2').first().textContent();
    console.log(`After prev twice: ${prevMonth}`);
    expect(prevMonth).not.toBe(initialMonth);
    expect(prevMonth).not.toBe(nextMonth);

    console.log('✅ Navigation buttons working correctly');
  });

  test('verifies calendar grid always has 42 cells', async ({ page }) => {
    const nextButton = page.getByRole('button', { name: /next/i });

    // Check across 5 random months
    for (let i = 0; i < 5; i++) {
      const dayCells = page.locator('[data-testid="day-cell"]');
      const count = await dayCells.count();

      const monthName = await page.locator('h2').first().textContent();
      console.log(`${monthName}: ${count} cells`);
      expect(count).toBe(42);

      await nextButton.click();
      await page.waitForTimeout(300);
    }

    console.log('✅ All months maintain 42-cell grid');
  });
});
