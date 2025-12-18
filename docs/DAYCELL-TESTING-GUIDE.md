# DayCell Visual Testing Guide

**Component**: `/Users/manu/Documents/LUXOR/cal/components/calendar/DayCell.tsx`
**Purpose**: Manual testing checklist for validating CVA variants and WCAG compliance

---

## 🔍 Pre-Testing Setup

### 1. Start Development Server
```bash
cd /Users/manu/Documents/LUXOR/cal
npm run dev
```

### 2. Open Browser DevTools
- **Chrome DevTools**: `Cmd + Option + I` (macOS)
- **Enable Device Toolbar**: `Cmd + Shift + M` for mobile view
- **Open Accessibility Panel**: DevTools → More Tools → Accessibility

### 3. Navigate to Calendar
```
http://localhost:3000
```

---

## ✅ Mobile Height Validation (WCAG 2.5.5)

### Test: 44px Minimum Touch Target

**Steps**:
1. Open DevTools → Device Toolbar
2. Select "iPhone 12 Pro" or similar mobile device
3. Inspect any DayCell element
4. Check Computed Styles → height

**Expected**:
- Mobile (`< 640px`): `height: 44px` ✅
- Tablet (`640px+`): `height: 48px` ✅
- Desktop (`768px+`): `height: 56px` ✅

**Pass Criteria**: Mobile height ≥ 44px

---

## ✅ Weekend Contrast Validation (WCAG 1.4.3)

### Test: Weekend Text Contrast (5.54:1)

**Steps**:
1. Locate a weekend cell (Saturday or Sunday)
2. Inspect the day number text
3. Use WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
4. Input:
   - **Foreground**: `#DC2626` (red-600)
   - **Background**: `#FFFFFF` (white)

**Expected**:
- Computed color: `rgb(220, 38, 38)` or `#DC2626`
- Contrast ratio: **5.54:1**
- WCAG AA: ✅ PASS
- WCAG AAA: ❌ FAIL (requires 7:1 for small text, but AA is sufficient)

**Pass Criteria**: Contrast ratio ≥ 4.5:1 (WCAG AA)

---

## ✅ Border Contrast Validation (WCAG 1.4.11)

### Test: Available Border Contrast (4.54:1)

**Steps**:
1. Locate an available (unblocked) cell
2. Inspect the border
3. Use WebAIM Contrast Checker
4. Input:
   - **Foreground**: `#6B7280` (gray-500)
   - **Background**: `#FFFFFF` (white)

**Expected**:
- Border color: `rgb(107, 114, 128)` or `#6B7280`
- Contrast ratio: **4.54:1**
- WCAG AA (Non-Text): ✅ PASS (requires 3:1)

**Pass Criteria**: Contrast ratio ≥ 3:1 (WCAG AA Non-Text)

---

## ✅ CVA Variant Testing (All 4 Variants)

### 1. Availability Variant (4 States)

#### a) **available** (Default)
**Action**: View any unblocked date
**Expected Styles**:
- Background: `bg-white/40` (semi-transparent white)
- Border: `border border-gray-500` (#6B7280)
- Hover: Shadow increases (`hover:shadow-lg`)
- Cursor: `cursor-pointer`

**Visual Check**: ✅ Glass effect visible, gray border, hover shadow

---

#### b) **blocked** (Full Day)
**Action**: Click a date to block it
**Expected Styles**:
- Background: `bg-gradient-to-br from-red-500/80 to-orange-500/80`
- Text: `text-white drop-shadow-sm`
- Border: `border-white/20`

**Visual Check**: ✅ Red-orange gradient, white text, no border visible

---

#### c) **tentative** (AM Blocked)
**Action**: Right-click → "Block Morning (AM)"
**Expected Styles**:
- Background: `bg-gradient-to-b from-orange-500/80 to-transparent`
- Text: `text-white drop-shadow-sm`
- Indicator: Orange dot in top-right corner

**Visual Check**: ✅ Orange gradient from top, white text, orange dot

---

#### d) **busy** (PM Blocked)
**Action**: Right-click → "Block Afternoon (PM)"
**Expected Styles**:
- Background: `bg-gradient-to-t from-purple-500/80 to-transparent`
- Text: `text-white drop-shadow-sm`
- Indicator: Purple dot in bottom-right corner

**Visual Check**: ✅ Purple gradient from bottom, white text, purple dot

---

### 2. State Variant (3 States)

#### a) **default**
**Action**: View any date that's not today/selected
**Expected Styles**: No ring

**Visual Check**: ✅ No ring, base styles only

---

#### b) **today**
**Action**: View today's date
**Expected Styles**:
- Ring: `ring-2 ring-blue-500 ring-offset-2`
- Text: `font-bold`

**Visual Check**: ✅ Blue ring with 2px offset, bold text

---

#### c) **selected**
**Action**: Click a date (if selection feature enabled)
**Expected Styles**:
- Ring: `ring-2 ring-green-500 ring-offset-2`

**Visual Check**: ✅ Green ring with 2px offset

---

### 3. Month Variant (2 States)

#### a) **current** (Current Month)
**Action**: View any date in current month
**Expected Styles**: `opacity-100`

**Visual Check**: ✅ Full opacity, no fading

---

#### b) **other** (Previous/Next Month)
**Action**: View dates from previous/next month (grid edges)
**Expected Styles**: `opacity-50`

**Visual Check**: ✅ 50% opacity, faded appearance

---

### 4. Weekend Variant (2 States)

#### a) **true** (Saturday/Sunday)
**Action**: View a weekend date
**Expected Styles**: `text-red-600` (#DC2626)

**Visual Check**: ✅ Red text, 5.54:1 contrast

---

#### b) **false** (Monday-Friday)
**Action**: View a weekday date
**Expected Styles**: Default text color (`text-slate-900`)

**Visual Check**: ✅ Dark gray/black text

---

## ✅ Compound Variant Testing

### 1. Weekend + Today
**Action**: Navigate to a weekend that is today
**Expected**:
- Text: `text-red-600 font-bold` (weekend red preserved)
- Ring: `ring-2 ring-blue-500` (today ring)

**Visual Check**: ✅ Red bold text + blue ring

---

### 2. Blocked + Weekend
**Action**: Block a weekend date
**Expected**:
- Text: `text-white drop-shadow-sm` (white overrides red)
- Background: Red-orange gradient

**Visual Check**: ✅ White text on gradient (weekend red suppressed)

---

### 3. Other Month + Weekend
**Action**: View a weekend from previous/next month
**Expected**:
- Text: `text-red-400` (faded red)
- Opacity: 50%

**Visual Check**: ✅ Light red text, faded

---

## ✅ ARIA Testing (Accessibility)

### 1. Roving tabIndex Pattern

**Steps**:
1. Open DevTools → Accessibility panel
2. Tab into calendar
3. Press Tab key

**Expected**:
- Focus lands on **today** or **first selected cell** only
- `tabIndex="0"` on today/selected
- `tabIndex="-1"` on all other cells

**Visual Check**: ✅ Only one cell is tab-accessible

---

### 2. ARIA Labels

**Steps**:
1. Inspect any DayCell
2. Check Accessibility panel → Computed Properties

**Expected Attributes**:
```html
role="gridcell"
aria-label="Monday, December 17, 2025 - Blocked"
aria-current="date"          (if today)
aria-selected="true"         (if selected)
aria-disabled="false"        (if editable)
```

**Visual Check**: ✅ All ARIA attributes present

---

### 3. Screen Reader Testing (Optional)

**macOS VoiceOver**:
1. Enable: `Cmd + F5`
2. Navigate to calendar
3. Use `VO + Arrow Keys` to navigate cells

**Expected Announcements**:
- "Monday, December 17, 2025, Blocked, gridcell"
- "Today, December 17, 2025, gridcell, current date"

**Visual Check**: ✅ Full date + state announced

---

## ✅ Micro-Interaction Testing

### 1. Hover Animation (Editable Cells)

**Steps**:
1. Hover over a current-month, editable cell
2. Observe scale animation

**Expected**:
- Scale: `1.05` (5% larger)
- Duration: `200ms`
- Shadow: Increases on hover

**Visual Check**: ✅ Smooth scale-up animation

---

### 2. Click Animation (Editable Cells)

**Steps**:
1. Click a current-month cell
2. Observe scale animation

**Expected**:
- Scale: `0.95` (5% smaller)
- Duration: `200ms`
- Returns to normal after release

**Visual Check**: ✅ Smooth scale-down then up

---

### 3. No Animation (Read-Only)

**Steps**:
1. Navigate to public calendar view (if available)
2. Hover over cells

**Expected**: No hover/click animations

**Visual Check**: ✅ Static cells, no interactions

---

## 🔧 DevTools Console Tests

### Variant Computation Check

**Open Console**:
```javascript
// Find today's cell
const todayCell = document.querySelector('[aria-current="date"]');

// Check computed variant classes
console.log(todayCell.className);

// Expected output (example):
// "relative w-full h-11 sm:h-12 md:h-14 ... ring-2 ring-blue-500 ring-offset-2 text-red-600 font-bold ..."
```

### Height Validation

```javascript
// Check mobile height
const cell = document.querySelector('[data-testid="day-cell"]');
console.log(window.getComputedStyle(cell).height);

// Expected: "44px" (mobile), "48px" (tablet), "56px" (desktop)
```

---

## 📊 Testing Checklist Summary

| Test | Description | Status |
|------|-------------|--------|
| **Mobile Height** | 44px minimum (WCAG) | ☐ |
| **Weekend Contrast** | 5.54:1 ratio (#DC2626) | ☐ |
| **Border Contrast** | 4.54:1 ratio (#6B7280) | ☐ |
| **Available Variant** | Glass effect, gray border | ☐ |
| **Blocked Variant** | Red-orange gradient, white text | ☐ |
| **Tentative Variant** | Orange gradient top, orange dot | ☐ |
| **Busy Variant** | Purple gradient bottom, purple dot | ☐ |
| **Today State** | Blue ring, bold text | ☐ |
| **Selected State** | Green ring | ☐ |
| **Current Month** | 100% opacity | ☐ |
| **Other Month** | 50% opacity | ☐ |
| **Weekend Styling** | Red text (#DC2626) | ☐ |
| **Weekend + Today** | Red text + blue ring | ☐ |
| **Blocked + Weekend** | White text overrides red | ☐ |
| **Other + Weekend** | Faded red (text-red-400) | ☐ |
| **Roving tabIndex** | Only today/selected tabbable | ☐ |
| **ARIA Labels** | Full date + state announced | ☐ |
| **Hover Animation** | Scale 1.05, shadow increase | ☐ |
| **Click Animation** | Scale 0.95, smooth feedback | ☐ |

---

## 🐛 Common Issues & Fixes

### Issue: Height not 44px on mobile
**Fix**: Check Tailwind breakpoints, ensure `h-11` class applies

### Issue: Weekend text not red
**Fix**: Check `isWeekend()` from date-fns is working

### Issue: Gradient not showing
**Fix**: Ensure Tailwind CSS processed gradient classes

### Issue: Multiple cells tabbable
**Fix**: Check roving tabIndex logic, only one cell should have `tabIndex={0}`

### Issue: ARIA labels incomplete
**Fix**: Verify `format()` from date-fns is formatting correctly

---

## ✅ Final Validation

Once all tests pass:

1. **Build for Production**:
   ```bash
   npm run build
   ```
   Expected: ✅ No TypeScript errors

2. **Lighthouse Accessibility Audit**:
   - Open Chrome DevTools → Lighthouse
   - Run Accessibility audit
   - Expected: Score ≥ 90

3. **axe-core Validation** (Optional):
   ```bash
   npx @axe-core/cli http://localhost:3000
   ```
   Expected: ✅ No critical accessibility violations

---

**Testing Complete**: Mark all ☐ as ✅ when tests pass
**Component**: `/Users/manu/Documents/LUXOR/cal/components/calendar/DayCell.tsx`
**Status**: Ready for production when all tests pass
