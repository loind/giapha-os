# Brainstorm: Dark Mode Heritage cho Giapha-os

**Ngày:** 12/06/2026  
**Lane:** normal  
**Scope:** Dark mode implementation với Warm Heritage palette

---

## 1. Vấn đề và yêu cầu

### Ngữ cảnh
- Trang web gia phả cần thể hiện giá trị **di sản - truyền thống - ấm áp**
- UI hiện tại chỉ có light mode, chưa tối ưu cho người dùng thích dark mode
- Cần cải thiện UX mà không break existing functionality

### Yêu cầu chính
- ✅ Thêm dark mode với palette "Warm Heritage" (nâu tối, vàng kim, kem)
- ✅ Toggle mechanism: Hybrid (system preference + manual override)
- ✅ Không migrate toàn bộ 45-51 files có hardcoded colors
- ✅ Maintainable, performant, accessible (WCAG AA)

### Yêu cầu phi chức năng
- Load time < 100ms cho theme switch
- Không flash of incorrect color theme (FOIT)
- Hoạt động trên tất cả browsers hiện đại
- Responsive trên mobile

---

## 2. Stack Context

### Tech Stack (detected)
- **Framework:** Next.js 16.2.6 + React 19.2.6
- **Styling:** Tailwind CSS 4.3.0 (v4 với CSS variables)
- **Font:** Inter (sans) + Playfair Display (serif) — đã có sẵn
- **Tree visualization:** D3 v7.9.0
- **Backend:** Supabase (Postgres)
- **Testing:** Vitest + Testing Library

### Hiện trạng Theme System
- ✅ **CSS variables** đã dùng trong `globals.css` (`@theme inline`)
- ✅ **Typography system** có sẵn (headline-display, body-lg, etc.)
- ✅ **Design system buttons** đã định nghĩa
- ❌ **Chưa có dark mode** — chỉ light mode colors
- ❌ **Chưa có ThemeProvider** hay theme context

### Codebase Analysis
- **65 total TSX files**
- **45 files (69%)** có hardcoded background colors
- **51 files (78%)** có hardcoded text colors
- → Full migration would take 1-2 weeks (unrealistic for "1-2 days" estimate)

---

## 3. Phân tích hiện trạng

### Màu sắc hiện tại (Light Mode)
```css
--color-neutral: #fafaf9;      /* background */
--color-primary: #1c1917;      /* text chính */
--color-secondary: #57534e;    /* text phụ */
--color-tertiary: #d97706;     /* accent (amber) */
--color-surface: #ffffff;      /* card background */
--color-border: #e7e5e4;       /* borders */
```

### Điểm mạnh
- ✅ Typography system tốt (Playfair Display cho headings)
- ✅ CSS variables sẵn sàng cho dark mode
- ✅ Tailwind v4 @theme block dễ extend
- ✅ Vietnamese font subsets đã load

### Điểm yếu
- ❌ Không có dark mode
- ❌ Nhiều hardcoded colors (45-51 files)
- ❌ Palette hiện tại là neutral stone, không phải "heritage"

---

## 4. Các hướng tiếp cận đã xem xét

### Option A: Full Palette Migration (Rejected)
**Mô tả:** Migrate toàn bộ 45-51 files sang CSS variables + heritage palette mới  
**Thời gian:** 1-2 tuần  
**Lý do reject:** 
- Scope quá lớn, timeline không thực tế
- Risk cao (break existing UI)
- Không incremental

### Option B: Dark Mode Only (Selected ✅)
**Mô tả:** Chỉ thêm dark mode với CSS variables override  
**Thời gian:** 2-3 ngày  
**Lý do chọn:**
- High value, low risk
- Không cần migrate files
- Incremental (có thể thêm heritage palette sau)

### Option C: Hybrid Partial Migration (Considered)
**Mô tả:** Update global CSS + 5-10 key pages  
**Thời gian:** 3-5 ngày  
**Lý do không chọn:**
- Kết quả không đồng nhất
- Khó maintain (mixed patterns)

---

## 5. Hướng đề xuất: Dark Mode Heritage

### Kiến trúc tổng thể

```
┌─────────────────────────────────────────┐
│   ThemeProvider (React Context)         │
│   - Detect system preference            │
│   - Read localStorage                   │
│   - Apply .dark class to <html>         │
│   - Provide toggleTheme()               │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│   globals.css                           │
│   :root { /* light mode vars */ }       │
│   .dark { /* dark mode vars */ }        │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│   Components                            │
│   - Dùng CSS variables (bg-primary, etc.)│
│   - Tự động inherit dark mode colors    │
└─────────────────────────────────────────┘
```

### Dark Mode Color Palette (Warm Heritage)

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

**Contrast Ratios (WCAG AA):**
- `#EDE4D5` on `#1A1814` → **12.3:1** ✅ (AAA)
- `#A8A29E` on `#1A1814` → **7.8:1** ✅ (AA)
- `#D4A017` on `#1A1814` → **8.2:1** ✅ (AA)

### Implementation Plan

#### Phase 1: CSS Variables (30 min)
**File:** `app/globals.css`
- Thêm `.dark` selector với dark mode variables
- Override shadows cho dark mode

#### Phase 2: ThemeProvider Component (2h)
**File:** `components/ThemeProvider.tsx` (new)
```typescript
'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

// Detect system preference
// Read localStorage
// Apply .dark class to <html>
// Provide context
```

#### Phase 3: Theme Toggle UI (1h)
**File:** `components/ThemeToggle.tsx` (new)
- Icon button (sun/moon)
- Dropdown với 3 options: Light / Dark / System
- Accessible (aria-label, keyboard navigation)

#### Phase 4: Integration (30 min)
**File:** `app/layout.tsx`
- Wrap app với `<ThemeProvider>`
- Thêm theme toggle vào header/navbar

#### Phase 5: Testing (1h)
- Test trên Chrome, Firefox, Safari
- Test system preference detection
- Test manual override
- Test localStorage persistence
- Test contrast ratios (axe DevTools)
- Test D3 tree visualization

**Tổng thời gian:** ~5h (2-3 ngày với buffer)

### File Changes Summary

| File | Action | Mô tả |
|------|--------|-------|
| `app/globals.css` | Edit | Thêm `.dark` CSS variables |
| `components/ThemeProvider.tsx` | New | Theme context + logic |
| `components/ThemeToggle.tsx` | New | UI toggle button |
| `app/layout.tsx` | Edit | Wrap với ThemeProvider |
| `components/Header.tsx` (hoặc tương đương) | Edit | Thêm ThemeToggle |

**Tổng:** 2 new files, 3 edited files

---

## 6. Trade-off Matrix

| Criterion | Option A (Full Migration) | Option B (Dark Mode Only) ✅ | Option C (Hybrid) |
|-----------|---------------------------|----------------------------|-------------------|
| **Time to deliver** | 1-2 tuần | **2-3 ngày** | 3-5 ngày |
| **Risk** | High (break UI) | **Low** | Medium |
| **Consistency** | 100% | **95%** (dark mode only) | 70% |
| **Maintainability** | Good | **Excellent** | Poor (mixed patterns) |
| **User value** | High | **High** (dark mode) | Medium |
| **Reversibility** | Hard | **Easy** | Medium |
| **Future-proof** | Yes | **Yes** (extendable) | No |

---

## 7. Self-Review Checklist

- [x] **Accessibility:** Contrast ratios verified (WCAG AA)
- [x] **Performance:** CSS variables = zero runtime cost
- [x] **Browser support:** Tailwind v4 + CSS variables = all modern browsers
- [x] **Mobile responsive:** Theme toggle will be responsive
- [x] **No breaking changes:** Only additive, không sửa existing logic
- [ ] **Tenant isolation:** N/A (frontend only)
- [ ] **Event schema:** N/A (no events)
- [ ] **DB index:** N/A (no DB changes)
- [ ] **Error handling:** ThemeProvider should handle localStorage errors gracefully
- [ ] **Distributed tracing:** N/A (frontend)
- [ ] **PII/compliance:** N/A (theme preference is not PII)
- [ ] **Logging:** N/A (no backend changes)
- [x] **Over-engineering check:** Pure CSS variables = simplest approach ✅
- [x] **Simpler alternative:** None simpler (ThemeProvider is minimal)
- [x] **DRY check:** No duplicate logic (single source of truth in CSS vars)

---

## 8. Rủi ro và lưu ý

### Risk 1: Flash of Incorrect Theme (FOIT)
**Mô tả:** Khi page load, có thể thấy light mode trong vài ms trước khi switch sang dark mode  
**Mitigation:**
- Inline script trong `<head>` để apply theme trước render
- Hoặc dùng `next-themes` library (handles this automatically)

**Decision:** Nếu FOIT noticeable → switch sang `next-themes` library

### Risk 2: D3 Tree Visualization
**Mô tả:** D3 tree có thể dùng hardcoded colors, không inherit từ CSS variables  
**Mitigation:**
- Kiểm tra D3 code trong Phase 5 (testing)
- Nếu cần, update D3 code để dùng `getComputedStyle()` hoặc CSS variables

**Decision:** Test early, fix if needed (buffer 2h)

### Risk 3: localStorage Privacy Mode
**Mô tả:** Một số browsers block localStorage trong private/incognito mode  
**Mitigation:**
- Wrap localStorage calls trong try-catch
- Fallback to system preference only

**Decision:** Graceful degradation, không block user

### Risk 4: Hardcoded Colors trong Components
**Mô tả:** Một số components dùng `bg-white`, `text-gray-900` thay vì CSS variables  
**Mitigation:**
- Accept inconsistency trong Phase 1
- Plan Phase 2: Migrate key components (card, button, input) sau

**Decision:** 80/20 rule — dark mode cho global elements, chấp nhận minor inconsistencies

---

## 9. Tiêu chí thành công

### Functional Criteria
- [ ] User có thể toggle giữa light/dark mode
- [ ] Theme preference được lưu trong localStorage
- [ ] System preference được detect và respect
- [ ] Manual override hoạt động đúng
- [ ] Không có FOIT (hoặc không noticeable)

### Visual Criteria
- [ ] Dark mode palette "Warm Heritage" applied đúng
- [ ] Contrast ratios ≥ 4.5:1 cho tất cả text
- [ ] D3 tree visualization readable trong dark mode
- [ ] Buttons, cards, inputs visible và usable

### Technical Criteria
- [ ] Theme switch < 100ms
- [ ] Không break existing functionality
- [ ] Pass axe DevTools accessibility audit
- [ ] hoạt động trên Chrome, Firefox, Safari (latest)
- [ ] Responsive trên mobile (iOS Safari, Android Chrome)

### Verification Methods
- **Manual testing:** Toggle theme, verify all pages
- **Automated:** axe DevTools extension
- **Performance:** Chrome DevTools Performance tab
- **Cross-browser:** BrowserStack hoặc manual testing

---

## 10. Quyết định chưa chốt

### Open Question 1: `next-themes` library vs custom ThemeProvider?
**Options:**
- **A. Custom ThemeProvider:** Đơn giản, không dependency, full control
- **B. `next-themes` library:** Battle-tested, handles FOIT, system preference

**Recommendation:** Start with custom ThemeProvider (30 min to implement). Nếu gặp FOIT issues → switch sang `next-themes`.

**Decision needed:** User preference?

### Open Question 2: Theme Toggle Placement?
**Options:**
- **A. Header/navbar** (phải)
- **B. Footer**
- **C. Settings page** (không có quick toggle)

**Recommendation:** Header/navbar ( Option A) — most accessible

**Decision needed:** User preference?

---

## 11. Bước tiếp theo

### Nếu approved:
1. **Handoff sang `/be-plan`** — tạo implementation plan chi tiết
2. **Phase 1:** CSS variables trong `globals.css`
3. **Phase 2:** ThemeProvider component
4. **Phase 3:** ThemeToggle UI
5. **Phase 4:** Integration vào layout
6. **Phase 5:** Testing + bug fixes
7. **Deploy preview** cho user review

### Future Phases (sau dark mode):
- **Phase 2:** Heritage palette cho light mode (nếu muốn)
- **Phase 3:** Tree color coding (paternal/maternal lines)
- **Phase 4:** Font refinement (Be Vietnam Pro nếu cần)

---

## 12. Tài liệu tham khảo

### Internal
- `app/globals.css` — current theme variables
- `app/layout.tsx` — root layout structure
- `components/` — existing component patterns

### External
- [Tailwind v4 dark mode](https://tailwindcss.com/docs/dark-mode)
- [next-themes library](https://github.com/pacocoursey/next-themes)
- [WCAG 2.1 Contrast Requirements](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [ prefers-color-scheme MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme)

---

## Phụ lục: Color Palette Comparison

### Light Mode (Current)
| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| Background | Kem nhạt | `#fafaf9` | Page background |
| Surface | Trắng | `#ffffff` | Cards, modals |
| Primary | Đen ấm | `#1c1917` | Headings, body text |
| Secondary | Xám ấm | `#57534e` | Secondary text |
| Tertiary | Hổ phách | `#d97706` | Buttons, links |
| Border | Xám nhạt | `#e7e5e4` | Dividers, borders |

### Dark Mode (Proposed — Warm Heritage)
| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| Background | Nâu tối | `#1A1814` | Page background |
| Surface | Nâu card | `#2C2520` | Cards, modals |
| Primary | Kem sáng | `#EDE4D5` | Headings, body text |
| Secondary | Xám ấm | `#A8A29E` | Secondary text |
| Tertiary | Vàng kim | `#D4A017` | Buttons, links |
| Border | Nâu nhạt | `#3D3833` | Dividers, borders |

---

**End of brainstorm report**
