# Brainstorm: Đổi default auto-collapse level thành 100

**Ngày:** 2026-06-12
**Lane:** tiny
**Commit:** `030df3c`

---

## Vấn đề

Mặc định sơ đồ gia phả (FamilyTree, MindmapTree) chỉ expand 2 đời đầu, các đời sau bị collapse. User muốn ban đầu tree mở hết tất cả thế hệ để không phải thao tác thêm.

## Stack Context

- **Framework:** Next.js 16.2.6 (App Router)
- **UI:** React 19, Tailwind CSS 4, Framer Motion 12
- **Visualization:** D3.js 7

## Code liên quan

- `components/FamilyTree.tsx` — `DEFAULT_AUTO_COLLAPSE_LEVEL = 2` (line 20)
- `components/MindmapTree.tsx` — `DEFAULT_AUTO_COLLAPSE_LEVEL = 2` (line 12)
- `components/BaseToolbar.tsx` — input `type="number"` với `max={99}`, hiển thị label "Số thế hệ" (line 137-152)
- `autoCollapseLevel` truyền xuống từ `TreeToolbar` / `MindmapToolbar` → `BaseToolbar` → `getFilteredTreeData()`

## Hướng tiếp cận

| Hướng | Mô tả | Pro | Con |
|-------|-------|-----|-----|
| **A (chọn)** | Đổi hằng `DEFAULT_AUTO_COLLAPSE_LEVEL` 2 → 100, max input 99 → 100 | 1-line change per file, reversibility cao, zero risk | Tree render nhiều node hơn lúc đầu |
| B | Remove auto-collapse, luôn expand all | Đơn giản nhất | Mất tính năng collapse, user không control được |
| C | Persist last-used level vào localStorage | UX tốt hơn về sau | Scope creep, không cần thiết cho yêu cầu hiện tại |

## Quyết định

**Hướng A** — đổi 3 giá trị:
- `FamilyTree.tsx`: `DEFAULT_AUTO_COLLAPSE_LEVEL = 100`
- `MindmapTree.tsx`: `DEFAULT_AUTO_COLLAPSE_LEVEL = 100`
- `BaseToolbar.tsx`: `max={100}`

## Self-Review

- [x] Không over-engineer (chỉ đổi constant)
- [x] Không ảnh hưởng tenant isolation (frontend-only)
- [x] Không breaking change
- [x] Performance: gia phả thực tế < 20 đời, 100 = effectively "all", không impact
- [x] User vẫn có thể giảm số thế hệ qua toolbar

## Kết quả

Commit `030df3c` pushed to `feature/ui-ux-improvements`. Vercel sẽ auto-deploy.
