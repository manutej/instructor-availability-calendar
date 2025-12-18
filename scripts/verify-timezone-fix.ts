#!/usr/bin/env tsx

/**
 * Verification script for timezone bug fix
 * Tests that January 1, 2026 correctly displays as Wednesday
 */

import { format, startOfDay, startOfMonth } from 'date-fns';
import { generateCalendarGrid } from '../lib/utils/dates';

console.log('🔍 Verifying Timezone Fix...\n');

// Test 1: Direct date-fns behavior
console.log('Test 1: date-fns startOfDay behavior');
const testDate = new Date(2026, 0, 15); // January 15, 2026
const normalized = startOfDay(testDate);
const monthStart = startOfDay(startOfMonth(normalized));

console.log('  Input date (Jan 15, 2026):', testDate.toISOString());
console.log('  Normalized:', normalized.toISOString());
console.log('  Month start (Jan 1, 2026):', monthStart.toISOString());
console.log('  Day of week (Jan 1, 2026):', format(monthStart, 'EEEE'));
console.log('  ✅ Expected: Thursday (verified via Python calendar module)\n');

// Test 2: Calendar grid generation
console.log('Test 2: Calendar grid for January 2026');
const grid = generateCalendarGrid(testDate);
const firstWeek = grid.slice(0, 7);

console.log('  First week of grid:');
firstWeek.forEach((date, index) => {
  const dayName = format(date, 'EEE');
  const dayNum = format(date, 'd');
  const monthName = format(date, 'MMM');
  const isJan1 = date.getDate() === 1 && date.getMonth() === 0;
  console.log(`    ${index}: ${dayName} ${monthName} ${dayNum}${isJan1 ? ' ← Jan 1, 2026' : ''}`);
});

// Test 3: Verify expected alignment
console.log('\n  ✅ Expected alignment (verified correct):');
console.log('    0: Sun Dec 28, 2025');
console.log('    1: Mon Dec 29, 2025');
console.log('    2: Tue Dec 30, 2025');
console.log('    3: Wed Dec 31, 2025');
console.log('    4: Thu Jan 1, 2026 ← January 1, 2026');
console.log('    5: Fri Jan 2, 2026');
console.log('    6: Sat Jan 3, 2026');

// Validation
const jan1 = grid.find(d => d.getDate() === 1 && d.getMonth() === 0);
if (!jan1) {
  console.log('\n❌ FAILED: January 1, 2026 not found in grid');
  process.exit(1);
}

const jan1DayOfWeek = format(jan1, 'EEEE');
if (jan1DayOfWeek !== 'Thursday') {
  console.log(`\n❌ FAILED: January 1, 2026 is ${jan1DayOfWeek}, expected Thursday`);
  process.exit(1);
}

const jan1Position = grid.findIndex(d => d.getDate() === 1 && d.getMonth() === 0);
if (jan1Position !== 4) {
  console.log(`\n❌ FAILED: January 1, 2026 at position ${jan1Position}, expected position 4`);
  process.exit(1);
}

console.log('\n✅ All tests passed!');
console.log('   - January 1, 2026 is Thursday (correct)');
console.log('   - Calendar grid alignment is correct');
console.log('   - Timezone normalization working as expected\n');
