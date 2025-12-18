/**
 * Manual Calendar Verification Script
 *
 * Purpose: Quick verification tool to check calendar accuracy across months
 *
 * Usage: Run this script and manually verify the output
 * Expected: All months show correct day-of-week alignment
 */

import { generateCalendarGrid } from '../lib/utils/dates';
import { format, startOfMonth } from 'date-fns';

// Known calendar facts for verification
const MONTH_2026_FACTS = [
  { month: 'January 2026', date: new Date(2026, 0, 1), firstDay: 'Thursday', days: 31 },
  { month: 'February 2026', date: new Date(2026, 1, 1), firstDay: 'Sunday', days: 28 },
  { month: 'March 2026', date: new Date(2026, 2, 1), firstDay: 'Sunday', days: 31 },
  { month: 'April 2026', date: new Date(2026, 3, 1), firstDay: 'Wednesday', days: 30 },
  { month: 'May 2026', date: new Date(2026, 4, 1), firstDay: 'Friday', days: 31 },
  { month: 'June 2026', date: new Date(2026, 5, 1), firstDay: 'Monday', days: 30 },
  { month: 'July 2026', date: new Date(2026, 6, 1), firstDay: 'Wednesday', days: 31 },
  { month: 'August 2026', date: new Date(2026, 7, 1), firstDay: 'Saturday', days: 31 },
  { month: 'September 2026', date: new Date(2026, 8, 1), firstDay: 'Tuesday', days: 30 },
  { month: 'October 2026', date: new Date(2026, 9, 1), firstDay: 'Thursday', days: 31 },
  { month: 'November 2026', date: new Date(2026, 10, 1), firstDay: 'Sunday', days: 30 },
  { month: 'December 2026', date: new Date(2026, 11, 1), firstDay: 'Tuesday', days: 31 }
];

const LEAP_YEAR_FACTS = [
  { month: 'February 2024', date: new Date(2024, 1, 1), firstDay: 'Thursday', days: 29 },
  { month: 'February 2028', date: new Date(2028, 1, 1), firstDay: 'Tuesday', days: 29 }
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

console.log('🗓️  Calendar Verification Report\n');
console.log('=' .repeat(80));

// Verify all 2026 months
console.log('\n📅 VERIFYING ALL 12 MONTHS OF 2026\n');

let allPassed = true;

for (const monthFact of MONTH_2026_FACTS) {
  const grid = generateCalendarGrid(monthFact.date);

  // Find the first day of the month (day 1 that's not from previous/next month)
  const monthStart = startOfMonth(monthFact.date);
  const firstDayIndex = grid.findIndex(date => date.getTime() === monthStart.getTime());
  const actualDayName = DAY_NAMES[firstDayIndex % 7];

  // Check if the last day of the month appears
  const lastDay = new Date(monthFact.date.getFullYear(), monthFact.date.getMonth(), monthFact.days);
  const lastDayExists = grid.some(date => date.getTime() === lastDay.getTime());

  const passed = actualDayName === monthFact.firstDay && lastDayExists;
  const status = passed ? '✅' : '❌';

  console.log(`${status} ${monthFact.month.padEnd(20)} | Expected: ${monthFact.firstDay.padEnd(10)} | Actual: ${actualDayName.padEnd(10)} | Days: ${monthFact.days}`);

  if (!passed) {
    allPassed = false;
    console.log(`   ERROR: Mismatch detected!`);
    console.log(`   Grid position: ${firstDayIndex} (column ${firstDayIndex % 7})`);
  }
}

// Verify leap years
console.log('\n📅 VERIFYING LEAP YEARS\n');

for (const leapFact of LEAP_YEAR_FACTS) {
  const grid = generateCalendarGrid(leapFact.date);

  // Check if day 29 exists
  const day29 = new Date(leapFact.date.getFullYear(), leapFact.date.getMonth(), 29);
  const day29Exists = grid.some(date => date.getTime() === day29.getTime());

  // Check if day 30 does NOT exist
  const day30 = new Date(leapFact.date.getFullYear(), leapFact.date.getMonth(), 30);
  const day30Exists = grid.some(date =>
    date.getMonth() === leapFact.date.getMonth() && date.getDate() === 30
  );

  const passed = day29Exists && !day30Exists;
  const status = passed ? '✅' : '❌';

  console.log(`${status} ${leapFact.month.padEnd(20)} | 29 days: ${day29Exists ? 'YES' : 'NO'} | 30 days: ${day30Exists ? 'NO (correct)' : 'YES (wrong)'}`);

  if (!passed) {
    allPassed = false;
    console.log(`   ERROR: Leap year check failed!`);
  }
}

// Grid consistency check
console.log('\n📅 VERIFYING GRID CONSISTENCY\n');

const testMonths = [
  new Date(2026, 0, 1),  // Jan 2026
  new Date(2026, 6, 1),  // Jul 2026
  new Date(2024, 1, 1),  // Feb 2024 (leap)
];

for (const testDate of testMonths) {
  const grid = generateCalendarGrid(testDate);
  const count = grid.length;
  const status = count === 42 ? '✅' : '❌';

  console.log(`${status} ${format(testDate, 'MMMM yyyy').padEnd(20)} | Grid cells: ${count} (expected 42)`);

  if (count !== 42) {
    allPassed = false;
  }
}

// Final report
console.log('\n' + '='.repeat(80));
if (allPassed) {
  console.log('\n✅ ALL TESTS PASSED - Calendar is accurate!\n');
} else {
  console.log('\n❌ SOME TESTS FAILED - Review errors above\n');
  process.exit(1);
}
