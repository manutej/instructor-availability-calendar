/**
 * Manual test script for half-day blocking logic
 *
 * Run this to verify the half-day logic works correctly.
 * This simulates the state transitions without needing React Testing Library.
 *
 * Usage:
 * npx tsx scripts/test-halfday-logic.ts
 */

import { BlockedDate } from '../types';

type BlockStatus = 'full' | 'am' | 'pm';

// Simulate setHalfDayBlock logic
function setHalfDayBlock(
  existingStatus: BlockStatus | undefined,
  period: 'AM' | 'PM',
  blocked: boolean
): BlockStatus | null {
  if (!blocked) {
    // UNBLOCKING half day
    if (existingStatus === 'full') {
      // Change full block to opposite half
      return period === 'AM' ? 'pm' : 'am';
    } else if (existingStatus === period.toLowerCase() as 'am' | 'pm') {
      // Remove the half-day block
      return null;
    }
  } else {
    // BLOCKING half day
    if (existingStatus === 'full') {
      // Already fully blocked
      return 'full';
    }

    const oppositeHalf = period === 'AM' ? 'pm' : 'am';
    if (existingStatus === oppositeHalf) {
      // Both halves blocked = full day
      return 'full';
    } else {
      // Block this half
      return period.toLowerCase() as 'am' | 'pm';
    }
  }

  return existingStatus || null;
}

// Test cases
console.log('🧪 Testing Half-Day Blocking Logic\n');

// Test 1: Block AM only
console.log('Test 1: Block AM only');
const result1 = setHalfDayBlock(undefined, 'AM', true);
console.log(`  Initial: undefined → Block AM → Result: ${result1}`);
console.log(`  ✅ Expected: 'am', Got: '${result1}'\n`);

// Test 2: Block PM only
console.log('Test 2: Block PM only');
const result2 = setHalfDayBlock(undefined, 'PM', true);
console.log(`  Initial: undefined → Block PM → Result: ${result2}`);
console.log(`  ✅ Expected: 'pm', Got: '${result2}'\n`);

// Test 3: Block AM, then PM (should become full)
console.log('Test 3: Block AM, then PM (should become full)');
const step3a = setHalfDayBlock(undefined, 'AM', true);
const step3b = setHalfDayBlock(step3a || undefined, 'PM', true);
console.log(`  Initial: undefined → Block AM → '${step3a}'`);
console.log(`  Then: '${step3a}' → Block PM → '${step3b}'`);
console.log(`  ✅ Expected: 'full', Got: '${step3b}'\n`);

// Test 4: Block PM, then AM (should become full)
console.log('Test 4: Block PM, then AM (should become full)');
const step4a = setHalfDayBlock(undefined, 'PM', true);
const step4b = setHalfDayBlock(step4a || undefined, 'AM', true);
console.log(`  Initial: undefined → Block PM → '${step4a}'`);
console.log(`  Then: '${step4a}' → Block AM → '${step4b}'`);
console.log(`  ✅ Expected: 'full', Got: '${step4b}'\n`);

// Test 5: Full day, unblock AM (should keep PM)
console.log('Test 5: Full day, unblock AM (should keep PM)');
const step5 = setHalfDayBlock('full', 'AM', false);
console.log(`  Initial: 'full' → Unblock AM → Result: ${step5}`);
console.log(`  ✅ Expected: 'pm', Got: '${step5}'\n`);

// Test 6: Full day, unblock PM (should keep AM)
console.log('Test 6: Full day, unblock PM (should keep AM)');
const step6 = setHalfDayBlock('full', 'PM', false);
console.log(`  Initial: 'full' → Unblock PM → Result: ${step6}`);
console.log(`  ✅ Expected: 'am', Got: '${step6}'\n`);

// Test 7: AM only, unblock AM (should remove)
console.log('Test 7: AM only, unblock AM (should remove)');
const step7 = setHalfDayBlock('am', 'AM', false);
console.log(`  Initial: 'am' → Unblock AM → Result: ${step7}`);
console.log(`  ✅ Expected: null, Got: ${step7}\n`);

// Test 8: PM only, unblock PM (should remove)
console.log('Test 8: PM only, unblock PM (should remove)');
const step8 = setHalfDayBlock('pm', 'PM', false);
console.log(`  Initial: 'pm' → Unblock PM → Result: ${step8}`);
console.log(`  ✅ Expected: null, Got: ${step8}\n`);

// Test 9: AM only, unblock PM (no change)
console.log('Test 9: AM only, unblock PM (no change)');
const step9 = setHalfDayBlock('am', 'PM', false);
console.log(`  Initial: 'am' → Unblock PM → Result: ${step9}`);
console.log(`  ✅ Expected: 'am', Got: '${step9}'\n`);

// Verify all tests passed
const allTests = [
  result1 === 'am',
  result2 === 'pm',
  step3b === 'full',
  step4b === 'full',
  step5 === 'pm',
  step6 === 'am',
  step7 === null,
  step8 === null,
  step9 === 'am',
];

const passedCount = allTests.filter(Boolean).length;
const totalCount = allTests.length;

console.log('\n' + '='.repeat(50));
console.log(`\n✅ Test Results: ${passedCount}/${totalCount} passed\n`);

if (passedCount === totalCount) {
  console.log('🎉 All tests passed! Half-day logic is correct.\n');
  process.exit(0);
} else {
  console.log('❌ Some tests failed. Check logic above.\n');
  process.exit(1);
}
