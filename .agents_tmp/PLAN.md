# 1. OBJECTIVE

Cải thiện UI/UX của ứng dụng GiaPha-OS để tăng tính khả dụng, giảm độ phức tạp, và cải thiện trải nghiệm người dùng trên tất cả các trang chính: Dashboard, Cây gia phả, Danh sách thành viên, và Form nhập liệu.

**Các vấn đề UX hiện tại đã xác định:**
1. **Dashboard:** Quá nhiều thông tin, không có breadcrumb, khó định hướng
2. **Form thành viên:** Quá dài, phức tạp, date picker rời rạc (ngày/tháng/năm riêng), thiếu visual hierarchy
3. **Cây gia phả:** Toolbar quá nhiều tùy chọn, nút thu gọn nhỏ khó bấm, thiếu minimap và search
4. **Danh sách thành viên:** Search/filter không rõ ràng, sort options khó tìm, nút thêm thành viên không nổi bật
5. **Navigation:** Không có top nav bar rõ ràng, breadcrumbs, và điều hướng kém

# 2. CONTEXT SUMMARY

**Các thành phần cần cải thiện:**
- `app/dashboard/page.tsx` - Trang chính với sự kiện và tính năng
- `app/dashboard/members/page.tsx` - Trang cây gia phả và danh sách
- `components/HeaderMenu.tsx` - Menu người dùng (cần thêm navigation)
- `components/MemberForm.tsx` - Form nhập liệu thành viên
- `components/FamilyTree.tsx` - Component cây gia phả
- `components/TreeToolbar.tsx` - Toolbar của cây
- `components/MemberList.tsx` - Danh sách thành viên
- `components/ViewToggle.tsx` - Toggle view mode
- `app/globals.css` - Design tokens
- `DESIGN.md` - Tài liệu design system

# 3. APPROACH OVERVIEW

**Nguyên tắc cải thiện:**
1. **Đơn giản hóa:** Giảm độ phức tạp của form và giao diện
2. **Tăng khả dụng:** Cải thiện navigation, search, và các control
3. **Visual hierarchy:** Phân biệt rõ ràng các mức độ ưu tiên của thông tin
4. **Mobile-first:** Đảm bảo trải nghiệm tốt trên thiết bị di động
5. **Consistency:** Áp dụng design tokens đồng nhất

# 4. IMPLEMENTATION STEPS

## Bước 1: Cải thiện Navigation & Layout (Foundation)
**Mục tiêu:** Thêm top navigation bar và breadcrumbs để cải thiện định hướng

1. **Tạo DashboardHeader component** (`components/DashboardHeader.tsx`)
   - Thêm top navigation với các section: Trang chủ, Cây gia phả, Sự kiện, Thống kê
   - Thêm breadcrumbs ở dưới header để show vị trí hiện tại
   - Giữ user menu ở phía phải
   - Responsive: hamburger menu trên mobile

2. **Cập nhật dashboard layout** (`app/dashboard/page.tsx`)
   - Wrap với DashboardHeader
   - Thêm breadcrumb navigation
   - Simplify layout: giảm visual clutter

## Bước 2: Cải thiện Form nhập liệu (MemberForm)
**Mục tiêu:** Đơn giản hóa form, cải thiện date inputs và visual hierarchy

1. **Restructure form layout**
   - Chuyển từ single-column dài sang multi-column grid
   - Sử dụng tabs hoặc sections để nhóm thông tin logic
   - Thêm progress indicator nếu có nhiều sections

2. **Cải thiện Date inputs**
   - Thay đổi từ 3 separate inputs (day/month/year) → single date input với picker
   - Hoặc sử dụng combined input field như "15/03/1990"
   - Auto-calculate lunar date khi user nhập solar date

3. **Cải thiện Visual Hierarchy**
   - Section headers rõ ràng với icons
   - Required fields marked với asterisk
   - Inline validation messages
   - Primary action button nổi bật hơn

4. **Simplify Death Information Section**
   - Default collapsed, chỉ expand khi user click "Đã mất"
   - Giữ 1 date system (lunar) và auto-calculate solar

## Bước 3: Cải thiện Family Tree View
**Mục tiêu:** Cải thiện toolbar, navigation và controls

1. **Restructure TreeToolbar** (`components/TreeToolbar.tsx`)
   - Group controls vào collapsible sections
   - Di chuyển zoom controls ra vị trí fixed corner
   - Thêm "Quick Search" để tìm người trên cây
   - Thêm "Center" button để quay về root

2. **Cải thiện Expand/Collapse Controls**
   - Thay đổi từ small button → larger touch target
   - Thêm visual indicator (chevron) trên node khi có children
   - Thêm hover state để show expand option

3. **Thêm Mini-map** (optional - low priority)
   - Small overview panel để show vị trí hiện tại trên cây lớn

## Bước 4: Cải thiện Member List View
**Mục tiêu:** Tăng tính khả dụng của search, filter và sort

1. **Restructure Search/Filter Bar**
   - Tách search box và filter controls riêng biệt
   - Thêm clear button cho search
   - Sử dụng chips/tags cho active filters
   - Thêm "Advanced Filter" toggle

2. **Cải thiện Sort Options**
   - Thêm visible sort dropdown với icon
   - Hiển thị current sort option rõ ràng
   - Thêm keyboard shortcut hints

3. **Nổi bật "Add Member" button**
   - Di chuyển lên vị trí prominent (top-right)
   - Sử dụng primary button style
   - Thêm keyboard shortcut (Ctrl+N)

## Bước 5: Cải thiện Overall Visual Design
**Mục tiêu:** Tăng tính nhất quán và professional look

1. **Update Design System** (`DESIGN.md`)
   - Thêm spacing guidelines cho navigation
   - Thêm component patterns mới

2. **Cải thiện Responsive Design**
   - Kiểm tra và fix layout trên mobile
   - Ensure touch targets ≥ 44px
   - Simplify complex components trên mobile

3. **Cải thiện Empty States**
   - Thêm helpful empty states với illustrations
   - Clear CTAs để guide user

## Bước 6: Testing & Polish
**Mục tiêu:** Đảm bảo quality và fix any issues

1. Manual testing trên các browsers
2. Test responsive breakpoints
3. Fix any animation/transition issues
4. Optimize performance

# 5. TESTING AND VALIDATION

**Các criteria để verify thành công:**

1. **Navigation Test:**
   - [ ] User có thể navigate giữa các pages dễ dàng
   - [ ] Breadcrumbs hoạt động chính xác
   - [ ] Mobile menu mở/đóng đúng

2. **Form Test:**
   - [ ] User có thể nhập date bằng nhiều cách (typing, picker)
   - [ ] Validation messages hiển thị đúng
   - [ ] Form submit thành công và show success feedback

3. **Tree View Test:**
   - [ ] Zoom in/out hoạt động mượt
   - [ ] Expand/collapse nodes dễ dàng
   - [ ] Search tìm thấy đúng người

4. **Member List Test:**
   - [ ] Search/filter hoạt động realtime
   - [ ] Sort options đúng
   - [ ] Add member button visible và hoạt động

5. **Visual Check:**
   - [ ] Consistent design across all pages
   - [ ] Responsive trên mobile/tablet/desktop
   - [ ] Animations mượt, không lag
