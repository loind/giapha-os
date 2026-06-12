# Phase 1: CSS Variables + Tree Colors Fix

## Overview
**Priority:** P0
**Effort:** 1h
**Status:** Pending

Thêm dark mode CSS variables vào globals.css và fix hardcoded tree connector colors.

## Requirements

### Functional
- Dark mode palette "Warm Heritage" applied khi `.dark` class present
- Tree connector lines visible trong dark mode
- Contrast ratios ≥ 4.5:1 (WCAG AA)

### Non-functional
- Zero runtime cost (CSS variables only)
- No breaking changes to light mode

## Dark Mode Color Palette

```css
.dark {
  /* Backgrounds */
  --color-neutral: #1A1814;      /* nâu tối (thay #fafaf9) */
  --color-surface: #2C2520;      /* nâu card (thay #ffffff) */
  
  /* Text */
  --color-primary: #EDE4D5;      /* kem sáng (thay #1c1917) */
  --color-secondary: #A8A29E;    /* xám ấm (thay #57534e) */
  
  /* Accent */
  --color-tertiary: #D4A017;     /* vàng kim (giữ nguyên) */
  
  /* Borders */
  --color-border: #3D3833;       /* nâu nhạt (thay #e7e5e4) */
  
  /* Shadows */
  --shadow-soft: 0 8px 30px rgb(0 0 0 / 0.3);
  --shadow-soft-hover: 0 20px 40px rgb(0 0 0 / 0.4);
}
```

## Files to Modify

### 1. `app/globals.css`
**Action:** Edit  
**Mô tả:** Thêm `.dark` selector với dark mode variables

**Steps:**
1. Sau `@theme inline` block, thêm `.dark` selector
2. Override tất cả CSS variables cho dark mode
3. Override shadows cho dark mode (darker)

**Code snippet:**
```css
/* Add after @theme inline block */
.dark {
  --color-background: var(--color-neutral);
  --color-foreground: var(--color-primary);
  --color-primary: #EDE4D5;
  --color-secondary: #A8A29E;
  --color-tertiary: #D4A017;
  --color-neutral: #1A1814;
  --color-surface: #2C2520;
  --color-border: #3D3833;
  --color-error: #dc2626;
  
  --shadow-soft: 0 8px 30px rgb(0 0 0 / 0.3);
  --shadow-soft-hover: 0 20px 40px rgb(0 0 0 / 0.4);
}
```

### 2. `components/FamilyTree.tsx`
**Action:** Edit  
**Mô tả:** Fix hardcoded inline styles cho tree connectors

**Problem:**
Lines 362-410 có inline `<style>` với hardcoded `#d6d3d1` (stone-300):
```css
border-top: 2px solid #d6d3d1;
border-left: 2px solid #d6d3d1;
border-right: 2px solid #d6d3d1;
```

**Solution:**
Replace `#d6d3d1` với `var(--color-border)`

**Steps:**
1. Find all occurrences of `#d6d3d1` trong inline style block
2. Replace with `var(--color-border)`
3. Test both light and dark mode

**Code changes:**
```diff
- border-top: 2px solid #d6d3d1;
+ border-top: 2px solid var(--color-border);

- border-left: 2px solid #d6d3d1;
+ border-left: 2px solid var(--color-border);

- border-right: 2px solid #d6d3d1;
+ border-right: 2px solid var(--color-border);
```

**Also fix:**
- Line 232: `bg-white` → `bg-surface`
- Line 267: `bg-white` → `bg-surface`
- Line 330: `bg-stone-50` → `bg-neutral`

## Success Criteria

- [ ] `.dark` class triggers dark mode palette
- [ ] Tree connectors visible trong dark mode (không phải white on dark)
- [ ] Light mode không bị ảnh hưởng
- [ ] Contrast ratios verified (WCAG AA)
- [ ] No console errors

## Verification

### Manual Testing
1. Add `.dark` class manually to `<html>` trong DevTools
2. Check all pages render correctly
3. Check tree connectors visible
4. Toggle `.dark` on/off — colors switch smoothly

### Automated Testing
- None for this phase (CSS only)

## Risks

### Risk: CSS variable conflict
**Mitigation:** Verify `--color-border` exists trong `@theme inline` block (line 21 globals.css)

## Next Steps

→ Phase 2: ThemeProvider component
