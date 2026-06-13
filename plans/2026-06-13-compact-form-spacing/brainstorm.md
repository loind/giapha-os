# Brainstorm: Giảm spacing MemberForm cho compact hơn

## Vấn đề

Form tạo/sửa thành viên (`MemberForm.tsx`) có nhiều khoảng trống (padding, gap, margin lớn), khiến không hiển thị được nhiều nội dung trên một màn hình. Yêu cầu thu nhỏ spacing ~30-40% cho toàn bộ form (cả phần thông tin chính + admin section).

## Stack Context

- Next.js + React + TailwindCSS
- Không có component library — dùng Tailwind utility classes trực tiếp
- `inputClasses` là biến shared cho tất cả input/select trong form

## Code hiện có liên quan

| File | Vai trò |
|------|---------|
| `components/MemberForm.tsx` | File duy nhất cần sửa |
| `inputClasses` (dòng 433-434) | Shared class cho input/select — thay đổi ở đây impact toàn form |

## Chi tiết thay đổi

### Mapping spacing cũ → mới

| Vị trí | Tailwind cũ | Tailwind mới | Giảm ~ |
|--------|-------------|-------------|--------|
| Form section gap | `space-y-6 sm:space-y-8` | `space-y-4 sm:space-y-5` | 33% |
| Card padding | `p-5 sm:p-8` | `p-4 sm:p-6` | 25% |
| Grid gap (giữa các field) | `gap-6` | `gap-4` | 33% |
| **Input padding (inputClasses)** | `px-4 py-3` | `px-3 py-2.5` | ~20% height |
| Label margin-bottom | `mb-1.5` | `mb-1` | 33% |
| Avatar label margin | `mb-2.5` | `mb-1.5` | 40% |
| Section header | `mb-6 pb-4` | `mb-4 pb-3` | 33% |
| Avatar size | `w-20 h-20 sm:w-24 sm:h-24` | `w-16 h-16 sm:w-20 sm:h-20` | 17% |
| Avatar container padding | `p-4` | `p-3` | 25% |
| Avatar container gap | `gap-5` | `gap-3` | 40% |
| Avatar section mt | `mt-2` | `mt-1` | 50% |
| Birth date gap | `gap-2` | `gap-1.5` | 25% |
| Deceased container | `p-5` | `p-4` | 20% |
| Deceased inner gap | `gap-4` | `gap-3` | 25% |
| Date cards padding | `p-3` | `p-2.5` | 17% |
| Date cards label mb | `mb-2` | `mb-1.5` | 25% |
| Italic note mb | `mb-4` | `mb-2` | 50% |
| Admin card padding | `p-5 sm:p-8` | `p-4 sm:p-6` | 25% |
| Admin header | `mb-6 pb-4` | `mb-4 pb-3` | 33% |
| Admin grid gap | `gap-6` | `gap-4` | 33% |
| In-law checkbox align | `sm:mt-7 mt-2` | `sm:mt-5 mt-1` | ~30% |
| Bottom buttons | `pt-6 gap-3 sm:gap-4` | `pt-4 gap-2 sm:gap-3` | 33% |

### Tác động ước tính

- Input height: ~44px → ~36px (giảm ~18%)
- Tổng chiều cao form ước tính giảm ~25-30%
- Vẫn đủ touch target (36px ≥ 32px minimum theo WCAG)

## Các hướng tiếp cận

### Approach A: Giảm trực tiếp Tailwind classes (đề xuất)

Sửa trực tiếp các class trong JSX. Đơn giản, không dependency, không abstraction.

| Tiêu chí | Đánh giá |
|----------|----------|
| Files | 1 |
| Complexity | Rất thấp |
| Risk | Thấp — chỉ thay đổi CSS class |
| Maintainability | Tốt — Tailwind class dễ đọc/sửa |

### Approach B: Tạo CSS variable / design token system

Tạo `--spacing-scale` CSS variable, apply qua custom class.

→ **Loại:** Over-engineering cho 1 form. Không có design system layer trong project.

### Approach C: Dùng Tailwind `@apply` trong CSS file

Tạo class `.form-compact` trong global CSS.

→ **Loại:** Thêm layer indirection không cần thiết. Tailwind inline classes đã đủ rõ ràng.

## Hướng đề xuất

**Approach A** — sửa trực tiếp Tailwind classes. Lý do:
- Smallest correct change (1 file, ~20 dòng thay đổi)
- Không abstraction mới
- Không dependency mới
- Dễ review, dễ revert

## Self-Review Checklist

- [x] Tenant isolation — N/A
- [x] Breaking changes — KHÔNG (chỉ CSS)
- [x] Over-engineering — KHÔNG
- [x] KISS — YES
- [x] DRY — sửa `inputClasses` 1 chỗ, impact toàn form
- [x] Accessibility — input height 36px vẫn ≥ WCAG 32px minimum touch target
- [x] Responsive — giữ nguyên breakpoint logic (sm: prefix)

## Rủi ro

- **Không có rủi ro chức năng.** Chỉ thay đổi visual spacing.
- **Touch target:** Input height giảm từ ~44px → ~36px. Vẫn trên 32px WCAG minimum nhưng nhỏ hơn recommended 44px. Chấp nhận được cho desktop-first app.
- **Avatar nhỏ hơn:** Preview 64-80px thay vì 80-96px. Vẫn đủ để nhận diện.

## Tiêu chí thành công

1. Form hiển thị được nhiều field hơn trên 1 màn hình (mục tiêu: giảm ~25-30% tổng chiều cao)
2. Các input/select vẫn dễ click, dễ đọc
3. Responsive giữ nguyên behavior (mobile/desktop)
4. Build pass, không lỗi type/CSS
5. Visual vẫn cân đối — không quá chật, không quá thưa

## Bước tiếp theo

Chuyển sang implement trực tiếp (bỏ qua /be-plan vì đây là CSS-only change, quá đơn giản để cần plan riêng).
