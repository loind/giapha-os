# Phase 5: Testing & Validation

## Overview
**Priority:** P0
**Effort:** 1h
**Status:** Pending
**Blocked by:** Phase 1, Phase 2, Phase 3, Phase 4

Testing toàn bộ dark mode implementation: manual + automated + accessibility.

## Requirements

### Functional
- Tất cả test cases pass
- Accessibility audit pass (WCAG AA)
- Cross-browser compatibility verified
- No regression in existing functionality

### Non-functional
- Performance: theme switch < 100ms
- No console errors
- No visual glitches

## Test Plan

### 1. Unit Tests (Vitest)

**Run all tests:**
```bash
npx vitest run
```

**Expected results:**
- ThemeProvider tests: 4/4 pass
- ThemeToggle tests: 3/3 pass
- All existing tests: still pass (no regression)

**Coverage target:** 60% for new components

### 2. Manual Testing Checklist

#### Light Mode
- [ ] Background: `#fafaf9` (neutral)
- [ ] Text: `#1c1917` (primary)
- [ ] Cards: `#ffffff` (surface)
- [ ] Borders: `#e7e5e4` (border)
- [ ] Tree connectors: `#d6d3d1` (stone-300)

#### Dark Mode
- [ ] Background: `#1A1814` (nâu tối)
- [ ] Text: `#EDE4D5` (kem sáng)
- [ ] Cards: `#2C2520` (nâu card)
- [ ] Borders: `#3D3833` (nâu nhạt)
- [ ] Tree connectors: `#3D3833` (var(--color-border))

#### Toggle Behavior
- [ ] Click toggle — icon changes
- [ ] Theme persists sau refresh
- [ ] Theme persists sau navigation
- [ ] System preference detected (test với OS dark mode)
- [ ] localStorage override hoạt động

#### Accessibility
- [ ] Tab navigation: focus visible
- [ ] Enter/Space: toggle theme
- [ ] aria-label correct
- [ ] Contrast ratios ≥ 4.5:1 (check với axe DevTools)

#### Cross-Browser
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] iOS Safari
- [ ] Android Chrome

#### Responsive
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

### 3. Accessibility Audit

**Tool:** axe DevTools extension

**Run audit:**
1. Install axe DevTools Chrome extension
2. Open page trong both light and dark mode
3. Run "Scan all of page"
4. Fix any critical/serious violations

**Expected:** 0 critical, 0 serious violations

**Check specifically:**
- Color contrast (WCAG AA)
- Focus indicators
- ARIA labels
- Keyboard navigation

### 4. Performance Testing

**Tool:** Chrome DevTools Performance tab

**Measure:**
1. Open Performance tab
2. Toggle theme
3. Record frame rate + duration

**Expected:**
- Theme switch: < 100ms
- No layout shift
- No jank (60fps)

### 5. Visual Regression Testing

**Manual comparison:**
1. Open page trong light mode
2. Take screenshot
3. Toggle to dark mode
4. Take screenshot
5. Compare — all elements should be visible + readable

**Check specifically:**
- Tree visualization: connectors visible
- Cards: borders visible
- Buttons: contrast sufficient
- Text: readable

## Success Criteria

- [ ] All unit tests pass
- [ ] Manual checklist 100% complete
- [ ] Accessibility audit: 0 critical violations
- [ ] Performance: < 100ms theme switch
- [ ] Cross-browser: all pass
- [ ] Responsive: all breakpoints OK
- [ ] No console errors
- [ ] No visual glitches

## Verification Commands

```bash
# Run all tests
npx vitest run

# Run with coverage
npx vitest run --coverage

# Run specific test file
npx vitest run components/__tests__/ThemeProvider.test.tsx

# Build check
npm run build

# Lint check
npm run lint
```

## Bug Fix Process

Nếu phát hiện bug:
1. Document bug (screenshot + steps to reproduce)
2. Fix trong appropriate phase file
3. Re-test
4. Update success criteria

## Deliverables

- Test results screenshot/report
- Accessibility audit report
- Performance metrics
- Bug list (nếu có) + fixes

## Next Steps

→ Deploy preview cho user review
→ Gather feedback
→ Plan Phase 2: Heritage palette cho light mode (optional)
