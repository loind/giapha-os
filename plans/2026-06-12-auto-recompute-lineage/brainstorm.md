# Brainstorm: Tự động tính đời khi cập nhật quan hệ cha con

**Ngày:** 2026-06-12  
**Lane:** normal  
**Trạng thái:** Approved — chờ handoff sang `/be-plan`

---

## 1. Mô tả vấn đề

Hiện tại khi thêm/xóa/thay đổi quan hệ cha con trong `RelationshipManager.tsx`:
- **Thêm quan hệ:** Chỉ auto-update generation cho **người trực tiếp** (target) — không cascade xuống con/cháu.
- **Xóa quan hệ:** Không recompute gì cả — generation của cả subtree có thể sai.
- **Re-parent (thay đổi cha/mẹ):** Không có cơ chế nào.

User phải thủ công vào trang Lineage (`/dashboard/lineage`) → bấm "Tính toán" → review diff → "Áp dụng". Quy trình này dễ bỏ quên, dẫn đến dữ liệu không nhất quán.

**Mục tiêu:** Mỗi khi quan hệ cha con thay đổi (thêm/xóa/re-parent), tự động recompute `generation`, `birth_order`, `is_in_law` cho toàn bộ persons bị ảnh hưởng.

---

## 2. Stack Context

| Tầng | Công nghệ |
|------|-----------|
| Framework | Next.js 15 (App Router, Server Actions) |
| Database | Supabase (PostgreSQL) |
| UI | React 19, Tailwind CSS, Framer Motion |
| State | Client components (`"use client"`) |
| Auth | Supabase Auth (admin/editor/member roles) |

---

## 3. Code hiện có liên quan

### Đã giải quyết một phần

| File | Vai trò | Tái sử dụng |
|------|---------|-------------|
| `components/LineageManager.tsx` | Chứa 3 algorithm functions: `computeGenerations`, `computeBirthOrders`, `computeInLaws` + UI preview/apply | **Extract 3 hàm này → shared utility** |
| `components/RelationshipManager.tsx` lines 360-398 | Auto-update đơn giản cho target person khi thêm quan hệ | **Thay thế bằng gọi server action** |
| `components/RelationshipManager.tsx` lines 415-520 | Bulk add children — đã set generation = parent + 1 | **Sau bulk add → gọi recompute** |
| `components/RelationshipManager.tsx` lines 598-613 | handleDelete — chỉ xóa relationship, không recompute | **Sau delete → gọi recompute** |
| `app/actions/data.ts` | Server actions cho import/export | **Pattern reference** |
| `types/index.ts` | `Person`, `Relationship` types | Không thay đổi |

### Flow hiện tại

```
User thêm/xóa quan hệ
  → RelationshipManager.mutate()
  → Supabase INSERT/DELETE relationships
  → router.refresh()
  → [_generation không được cập nhật_]
```

### Flow mong muốn

```
User thêm/xóa quan hệ
  → RelationshipManager.mutate()
  → Supabase INSERT/DELETE relationships
  → await recomputeLineage()  ← SERVER ACTION MỚI
  → router.refresh()
  → [generation/birth_order/is_in_law đã nhất quán]
```

---

## 4. Các hướng tiếp cận đã đánh giá

### Hướng A: Server Action — Full Recompute ✓ ĐÃ CHỌN

Sau mỗi relationship mutation → gọi server action `recomputeLineage()`:
1. Fetch TẤT CẢ persons + relationships
2. Chạy `computeGenerations` + `computeBirthOrders` + `computeInLaws`
3. Diff với state hiện tại trong DB
4. Batch UPDATE những người thay đổi (chunk 20 như LineageManager hiện tại)

**Tổng round-trips:** 1 fetch + 1 batch update = 2 trips.

### Hướng B: Client-side Cascade

Sau mutation, fetch all data → compute trong browser → batch update.

**Lý do không chọn:** Nhiều round-trips hơn (fetch + N updates), logic scatter giữa client components.

### Hướng C: DB Trigger / PostgreSQL Function

Algorithm viết trong PL/pgSQL, trigger fires trên INSERT/DELETE/UPDATE relationships.

**Lý do không chọn:** Over-engineering. Algorithm phức tạp (BFS + spouse propagation) khó viết đúng trong SQL. Khó debug, khó test.

---

## 5. Thiết kế chi tiết — Hướng A

### 5.1 Extract shared utility

**File mới:** `utils/lineage.ts`

```typescript
// Export 3 pure functions (không phụ thuộc React/Supabase)
export function computeGenerations(
  persons: Pick<Person, 'id'>[],
  relationships: Pick<Relationship, 'type' | 'person_a' | 'person_b'>[]
): Map<string, number>

export function computeBirthOrders(
  persons: Pick<Person, 'id' | 'birth_year' | 'full_name' | 'is_in_law'>[],
  relationships: Pick<Relationship, 'type' | 'person_a' | 'person_b'>[]
): Map<string, number>

export function computeInLaws(
  persons: Pick<Person, 'id' | 'gender' | 'is_in_law'>[],
  relationships: Pick<Relationship, 'type' | 'person_a' | 'person_b'>[]
): Map<string, boolean>
```

**Thay đổi trong `LineageManager.tsx`:**
- Xóa 3 hàm private, import từ `utils/lineage.ts`
- Component chỉ lo UI (preview, apply buttons)

### 5.2 Server Action mới

**File:** `app/actions/lineage.ts`

```typescript
"use server";

export async function recomputeLineage(): Promise<{
  updatedCount: number;
  details: Array<{
    id: string;
    full_name: string;
    generation: { old: number | null; new: number | null };
    birth_order: { old: number | null; new: number | null };
    is_in_law: { old: boolean; new: boolean };
  }>;
}>
```

**Implementation steps:**
1. `getSupabase()` → auth check (admin/editor only)
2. Fetch all `persons` (id, full_name, generation, birth_order, is_in_law, gender, birth_year)
3. Fetch all `relationships` (type, person_a, person_b)
4. Chạy 3 compute functions từ `utils/lineage.ts`
5. Diff: so sánh new values với current DB values
6. Batch UPDATE (chunk 20) cho những người có thay đổi
7. `revalidatePath("/dashboard")` để refresh cache
8. Return summary

### 5.3 Tích hợp vào RelationshipManager

Thay đổi 3 chỗ:

**a) `handleAddRelationship`** (line ~318):
- Sau khi INSERT relationship thành công
- Xóa block auto-update đơn giản (lines 360-398) — không cần nữa
- Gọi `await recomputeLineage()`
- Toast/notification: "Đã cập nhật {N} thế hệ"

**b) `handleDelete`** (line ~598):
- Sau khi DELETE relationship thành công
- Gọi `await recomputeLineage()`
- Toast/notification

**c) `handleBulkAdd`** (line ~415):
- Sau khi bulk INSERT thành công
- Gọi `await recomputeLineage()`
- Note: generation đã được set sơ bộ khi insert, recompute sẽ chính xác hóa

**d) `handleQuickAddSpouse`** (line ~522):
- Sau khi tạo spouse mới + relationship
- Gọi `await recomputeLineage()`

### 5.4 UX: Thông báo kết quả

Sau `recomputeLineage()`, nhận về `{ updatedCount, details }`. Hiển thị:

- **Toast nhẹ** (không block): "Đã đồng bộ thế hệ cho {N} người"
- KHÔNG show modal preview (khác với LineageManager manual) — lý do: auto nên cần fast, user đã intent thay đổi quan hệ rồi
- Nếu `updatedCount === 0` → không hiện gì (mọi thứ đã đúng)

### 5.5 LineageManager giữ nguyên

Trang `/dashboard/lineage` vẫn hoạt động như cũ — dành cho:
- Manual bulk recompute (không cần thay đổi quan hệ trước)
- Preview diff chi tiết trước khi apply
- Công cụ "dọn dẹp" khi nghi ngờ dữ liệu không nhất quán

Sau khi extract utility, LineageManager import từ `utils/lineage.ts` thay vì chứa algorithm inline.

---

## 6. Self-Review Checklist

| Check | Kết quả |
|-------|---------|
| Tenant isolation | ✅ Không áp dụng — app không có merchant_id (single-tenant family tree) |
| Event schema | ✅ N/A — không dùng Kafka/events |
| DB index strategy | ✅ Không thay đổi schema/index. Persons table đã có PK id. |
| Error handling & retry | ⚠️ Xem §7 — retry strategy cho batch update |
| Distributed tracing | ✅ N/A — single-server |
| Breaking changes | ✅ Không breaking — thêm behavior, không thay đổi API contract |
| PII/compliance | ✅ Không thay đổi PII flow |
| Logging/observability | ⚠️ Server action nên log updatedCount + duration |
| Over-engineering (YAGNI) | ✅ Không — chỉ extract utility + 1 server action + integrate |
| Simpler alternative (KISS) | ✅ Server action đơn giản hơn DB trigger |
| Duplicate logic (DRY) | ✅ Extract shared utility, cả LineageManager và Server Action đều reuse |

---

## 7. Rủi ro và lưu ý

### R1: Performance với tree lớn
- **Risk:** Fetch tất cả persons + relationships cho mỗi mutation. Với 5000+ persons, có thể chậm.
- **Mitigation:** Genealogy tree thường < 1000 persons. Nếu cần, optimize sau bằng incremental cascade (chỉ recompute affected subtree).
- **Monitor:** Log duration của `recomputeLineage()`. Nếu > 2s thường xuyên → xem xét optimize.

### R2: Race condition — concurrent mutations
- **Risk:** 2 editors cùng thay đổi quan hệ simultaneously → 2 recompute chạy song song, có thể ghi đè.
- **Mitigation:** Acceptable cho use case family tree (thường 1 editor tại 1 thời điểm). Nếu cần, thêm optimistic locking sau.
- **Note:** Supabase UPDATE với `.eq("id", ...)` là atomic per-row.

### R3: Thuật toán không cover disconnected components
- **Risk:** `computeGenerations` hiện tại để `null` cho persons không reachable từ root. Những người này sẽ không được update.
- **Mitigation:** Đây là behavior đúng — không nên gán generation cho người không có connection với root. LineageManager hiện tại cũng xử lý vậy.

### R4: Re-parent (thay đổi cha/mẹ cho người đã có cha/mẹ)
- **Risk:** Khi xóa quan hệ cha-con cũ + thêm quan hệ mới, generation của cả subtree cũ và mới đều cần recompute.
- **Mitigation:** Full recompute giải quyết đúng — tính lại từ đầu, không phụ thuộc vào thứ tự delete/insert.

### R5: UX — user không biết có recompute
- **Risk:** User thêm quan hệ → thấy generation thay đổi → bối rối.
- **Mitigation:** Toast notification rõ ràng: "Đã cập nhật thế hệ cho {N} người sau khi thay đổi quan hệ".

---

## 8. Tiêu chí thành công

| # | Tiêu chí | Cách xác minh |
|---|----------|---------------|
| 1 | Thêm con → generation = parent.generation + 1, cascade đúng cho grandchildren | Test: thêm con cho person gen 3 → con gen 4. Thêm con cho child → grandchild gen 5. |
| 2 | Xóa quan hệ cha-con → recompute đúng cho affected subtree | Test: xóa cha của person gen 4 → person trở thành root (gen 1) nếu không còn parent nào. |
| 3 | birth_order tự động cập nhật khi thêm/xóa con | Test: thêm con mới sinh trước → birth_order của các con khác thay đổi. |
| 4 | is_in_law tự động cập nhật khi thêm/xóa marriage | Test: thêm vợ cho con → is_in_law = true. Xóa marriage → is_in_law = false. |
| 5 | LineageManager vẫn hoạt động sau khi extract utility | Test: trang `/dashboard/lineage` vẫn compute + apply được. |
| 6 | Không regression — thêm/xóa quan hệ vẫn hoạt động bình thường | Test: toàn bộ CRUD relationships. |
| 7 | Performance OK cho tree 200 persons | Test: đo duration của recomputeLineage(). Target: < 500ms. |

---

## 9. Quyết định chưa chốt

Không có — tất cả decisions đã được user approve.

---

## 10. Bước tiếp theo

1. **`/be-plan`** — Tạo implementation plan chi tiết với phases:
   - Phase 1: Extract utility (`utils/lineage.ts`)
   - Phase 2: Server action (`app/actions/lineage.ts`)
   - Phase 3: Integrate vào RelationshipManager
   - Phase 4: Refactor LineageManager để dùng shared utility
   - Phase 5: Verification

2. **`/be-preview`** — Xem preview design trước khi implement.
