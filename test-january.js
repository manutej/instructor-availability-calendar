const { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval } = require('date-fns');

// Test January 2026 grid generation
const januaryDate = new Date('2026-01-15');
const monthStart = startOfMonth(januaryDate);
const monthEnd = endOfMonth(januaryDate);

console.log('January 2026 Test:');
console.log('Month Start:', format(monthStart, 'yyyy-MM-dd EEEE'));
console.log('Month End:', format(monthEnd, 'yyyy-MM-dd EEEE'));

const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

console.log('Grid Start:', format(gridStart, 'yyyy-MM-dd EEEE'));
console.log('Grid End:', format(gridEnd, 'yyyy-MM-dd EEEE'));

const allDates = eachDayOfInterval({ start: gridStart, end: gridEnd });
console.log(`\nTotal dates: ${allDates.length}`);

// Show first week
console.log('\nFirst Week (should start with Sunday):');
allDates.slice(0, 7).forEach(d => {
  console.log(`  ${format(d, 'yyyy-MM-dd EEEE')} (day ${format(d, 'd')})`);
});

// Show week with Jan 1
const jan1Index = allDates.findIndex(d => format(d, 'yyyy-MM-dd') === '2026-01-01');
console.log(`\nWeek containing Jan 1 (index ${jan1Index}):`);
const weekStart = Math.floor(jan1Index / 7) * 7;
allDates.slice(weekStart, weekStart + 7).forEach(d => {
  console.log(`  ${format(d, 'yyyy-MM-dd EEEE')} (day ${format(d, 'd')})`);
});
