---
title: "Dark Mode Heritage Implementation"
description: "Thêm dark mode với Warm Heritage palette cho trang gia phả"
status: completed
priority: P2
effort: 5.5h
issue: null
branch: feat/dark-mode-heritage
tags: [frontend, feature]
blockedBy: []
blocks: []
created: 2026-06-12
---

# Dark Mode Heritage Implementation

## Overview

Thêm dark mode với Warm Heritage palette (nâu tối, vàng kim, kem) cho trang web gia phả. Sử dụng CSS variables + ThemeProvider hybrid approach (system preference + manual override).

## Chosen Approach

**Dark Mode Only** (từ brainstorm 2026-06-12):
- CSS variables override (không migrate 45-51 files có hardcoded colors)
- ThemeProvider với system preference detection + localStorage override
- Warm Heritage palette: `#1A1814` (bg), `#2C2520` (card), `#EDE4D5` (text), `#D4A017` (accent)
- Toggle button trong header (DashboardHeader)

## Scope

**In scope:**
- Dark mode CSS variables
- ThemeProvider component
- ThemeToggle UI component
- Integration vào layout + header
- Fix hardcoded tree connector colors (FamilyTree.tsx inline styles)
- Testing & validation

**Out of scope:**
- Heritage palette cho light mode (future phase)
- Tree color coding paternal/maternal (future phase)
- Migrate toàn bộ hardcoded colors (Phase 2)

## Phases

| Phase | Name | Effort | Status |
|-------|------|--------|--------|
| 1 | [CSS Variables + Tree Colors](./phase-01-css-variables.md) | 1h | ✅ Completed |
| 2 | [ThemeProvider](./phase-02-theme-provider.md) | 2h | ✅ Completed |
| 3 | [ThemeToggle UI](./phase-03-theme-toggle.md) | 1h | ✅ Completed |
| 4 | [Integration](./phase-04-integration.md) | 30min | ✅ Completed |
| 5 | [Testing & Validation](./phase-05-testing.md) | 1h | ✅ Completed |

**Total:** 5.5h (2-3 ngày với buffer)

## File Changes

| File | Action | Mô tả |
|------|--------|-------|
| `app/globals.css` | Edit | Thêm `.dark` CSS variables |
| `components/ThemeProvider.tsx` | New | Theme context + system detection |
| `components/ThemeToggle.tsx` | New | UI toggle button |
| `app/layout.tsx` | Edit | Wrap với ThemeProvider |
| `components/DashboardHeader.tsx` | Edit | Thêm ThemeToggle vào header |
| `components/FamilyTree.tsx` | Edit | Fix hardcoded inline styles |

**Total:** 2 new files, 4 edited files

## Test Plan

### Test Strategy
- **Test type**: Manual + Unit tests cho ThemeProvider logic
- **Coverage target**: 60% (ThemeProvider + ThemeToggle)
- **Test runner**: Vitest + jsdom

### Test Cases (outline)

| # | Component | Scenario | Expected | Priority |
|---|-----------|----------|----------|----------|
| 1 | ThemeProvider | System preference dark | Apply `.dark` class to `<html>` | P0 |
| 2 | ThemeProvider | System preference light | No `.dark` class | P0 |
| 3 | ThemeProvider | localStorage override | Use localStorage value | P0 |
| 4 | ThemeProvider | Toggle theme | Switch `.dark` class + update localStorage | P0 |
| 5 | ThemeToggle | Click button | Toggle theme | P1 |
| 6 | ThemeToggle | Keyboard navigation | Accessible (Tab, Enter) | P1 |
| 7 | FamilyTree | Dark mode | Connector lines visible (not white on dark) | P0 |

### Mock Dependencies
- `window.matchMedia` — mock system preference
- `localStorage` — mock storage (jsdom provides)

### Test Data
- Fixtures: light/dark system preferences
- Mock user preferences in localStorage

### Prerequisites
- No conftest changes needed
- Use existing vitest setup

## Dependencies

- Tailwind CSS v4 (đã có)
- React 19 (đã có)
- Lucide React icons (đã có)
- Vitest (đã có)

## Risks

### Risk 1: Flash of Incorrect Theme (FOIT)
**Mitigation:** Inline script trong `<head>` hoặc switch sang `next-themes` nếu cần

### Risk 2: Hardcoded colors trong components
**Mitigation:** Accept inconsistency cho Phase 1. Plan Phase 2 migration sau.

### Risk 3: Tree connector colors không đổi
**Mitigation:** Phase 5 fix inline styles (priority P0)

## Success Criteria

- [ ] User toggle giữa light/dark mode
- [ ] System preference detected + respected
- [ ] localStorage persistence hoạt động
- [ ] Warm Heritage palette applied đúng
- [ ] Contrast ratios ≥ 4.5:1 (WCAG AA)
- [ ] Tree connectors visible trong dark mode
- [ ] Không break existing functionality
- [ ] Test pass (Vitest)

## Next Steps

Sau khi complete:
- Phase 2: Heritage palette cho light mode (optional)
- Phase 3: Tree color coding paternal/maternal
- Phase 4: Migrate hardcoded colors (nếu cần)
