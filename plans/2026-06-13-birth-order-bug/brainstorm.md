# Brainstorm: Fix Bug Birth Order (Con Trưởng/Thứ) Bị Thay Đổi

**Ngày:** 2026-06-13
**Lane:** normal
**Trạng thái:** Approved — handoff sang `/be-plan`

---

## 1. Mô tả vấn đề

**User report:** "Thuật toán tính đời đang sai, set rồi mà vẫn nhảy loạn lên"
**Triệu chứng cụ thể:** Con trưởng, con thứ (birth_order) bị thay đổi sau mỗi lần recompute.

### Root Cause đã xác nhận (reproduced)

**3 nguyên nhân gây "nhảy loạn":**

#### RC1: Bug cascade `is_in_law` → `birth_order` (CRITICAL)

Trong `recomputeLineage()` (app/actions/lineage.ts), 3 hàm compute chạy theo thứ tự:

```
1. computeGenerations(persons, rels)  → genMap
2. computeBirthOrders(persons, rels)  → orderMap   ← ĐỌC is_in_law từ DB
3. computeInLaws(persons, rels)       → inLawMap    ← CÓ THỂ THAY ĐỔI is_in_law
```

`computeBirthOrders` **skip** children có `is_in_law = true` khi đánh số thứ tự. Nhưng `is_in_law` được **read từ DB** — có thể do user set thủ công, hoặc do lần recompute trước ghi vào. Khi `is_in_law` flip → birth_order của TẤT CẢ anh chị em bị cascade thay đổi.

**Kết quả test thực tế:**

```
=== BEFORE: child2 is_in_law=false ===
  child1 (Con Trưởng): birth_order=1
  child2 (Con Thứ):    birth_order=2
  child3 (Con Út):     birth_order=3

=== AFTER: child2 flips to is_in_law=true ===
  child1 (Con Trưởng): birth_order=1
  child2 (Con Thứ):    birth_order=undefined  ← MẤT!
  child3 (Con Út):     birth_order=2          ← SHIFTED từ 3 → 2!
```

#### RC2: Max logic over-shift khi con có 2 cha/mẹ (MODERATE)

Khi 1 người con có quan hệ với CẢ CHA và MẸ, `computeBirthOrders` lấy `max(order từ cha, order từ mẹ)`. Nếu cha/mẹ có thêm con riêng → tất cả con chung bị shift.

Ví dụ: Cha có 3 con (A=1, B=2, C=3). Mẹ cũng có 3 con đó + 1 con riêng (sinh năm giữa B và C). → Mẹ's group: A=1, B=2, step=3, C=4. → C bị shift từ 3 → 4 do max logic.

#### RC3: Batch update ghi đè thủ công (MODERATE)

`recomputeLineage()` UPDATE cả 3 fields (generation, birth_order, is_in_law) mỗi lần chạy — ngay cả khi chỉ 1 field thay đổi. User set `birth_order` thủ công → recompute đổi → "nhảy".

---

## 2. Stack Context

| Tầng | Công nghệ |
|------|-----------|
| Framework | Next.js 16 (App Router, Server Actions) |
| Database | Supabase (PostgreSQL) |
| UI | React 19, Tailwind CSS |
| Testing | Vitest |

---

## 3. Code hiện có liên quan

| File | Vai trò | Vấn đề |
|------|---------|--------|
| `utils/lineage.ts` | 3 pure functions: computeGenerations, computeBirthOrders, computeInLaws | `computeBirthOrders` skip in-laws → cascade bug |
| `app/actions/lineage.ts` | Server action `recomputeLineage()` | Batch update overwrite cả 3 fields |
| `components/RelationshipManager.tsx` | CRUD relationships → trigger recompute | Gọi triggerRecompute sau mỗi mutation |
| `components/LineageManager.tsx` | Manual recompute UI (preview + apply) | Dùng cùng utils/lineage.ts |
| `utils/__tests__/lineage.test.ts` | 30 tests — TẤT CẢ PASS | Chưa cover bug cascade (is_in_law → birth_order) |

### Design flaw cốt lõi

`computeBirthOrders` có logic: **"skip in-law children khi đánh số thứ tự"**.

Điều này có nghĩa: birth_order của 1 người PHỤ THUỘC vào is_in_law. Khi is_in_law thay đổi → birth_order thay đổi theo → cascade.

Trong khi đó, `birth_order` nên phản ánh **thứ tự sinh thực tế** (ai sinh trước, ai sinh sau), KHÔNG phụ thuộc vào việc người đó là dâu/rể hay máu thịt.

---

## 4. Các hướng tiếp cận

### Hướng A: Tách birth_order khỏi is_in_law ✓ ĐỀ XUẤT

**Nguyên tắc:** `birth_order` = thứ tự sinh thực tế, đánh số TẤT CẢ children (không skip in-laws).

**Thay đổi:**

1. **`computeBirthOrders`** (utils/lineage.ts):
   - Bỏ check `if (p && !p.is_in_law)` — đánh số TẤT CẢ children
   - Sort theo birth_year, fallback theo name

2. **`recomputeLineage`** (app/actions/lineage.ts):
   - Chỉ update fields THAY ĐỔI (field-level diff thay vì always-update)
   - birth_order chỉ update khi giá trị computed KHÁC giá trị DB

**Trade-off:**

| Tiêu chí | Đánh giá |
|----------|----------|
| Đúng nghiệp vụ | ✅ Thứ tự sinh không phụ thuộc is_in_law |
| Ổn định | ✅ birth_order không nhảy khi is_in_law thay đổi |
| Phức tạp | ✅ Thấp — sửa 1 điều kiện + thêm field-level diff |
| Regression risk | ⚠️ Thay đổi semantics: in-laws sẽ có birth_order |

### Hướng B: Không recompute birth_order tự động

Giữ nguyên logic `computeBirthOrders` (skip in-laws), nhưng KHÔNG update birth_order trong `recomputeLineage()`. Chỉ update khi user bấm "Tính toán" thủ công trong LineageManager.

**Trade-off:**

| Tiêu chí | Đánh giá |
|----------|----------|
| Đúng nghiệp vụ | ❌ birth_order vẫn phụ thuộc is_in_law |
| Ổn định | ✅ birth_order không bao giờ tự thay đổi |
| Phức tạp | ✅ Rất thấp — chỉ bỏ 1 dòng |
| Regression risk | ✅ Thấp |
|Nhược điểm | ❌ birth_order không tự động cập nhật khi thêm/xóa con |

### Hướng C: Preserve manual values — chỉ recompute nếu null

`computeBirthOrders` chỉ gán birth_order cho người CHƯA có (birth_order = null). Người đã có birth_order (do user set) → giữ nguyên.

**Trade-off:**

| Tiêu chí | Đánh giá |
|----------|----------|
| Đúng nghiệp vụ | ⚠️ birth_order không tự fix khi sai |
| Ổn định | ✅ Manual values preserved |
| Phức tạp | ⚠️ Trung bình — cần logic merge |
| Regression risk | ⚠️ Thêm/xóa con không update birth_order của người cũ |

---

## 5. Hướng đề xuất: B (Bỏ auto birth_order, giữ auto generation + is_in_law)

### Quyết định đã chốt (user confirm)

- **birth_order:** BỎ auto-compute hoàn toàn. User tự đánh thủ công.
- **is_in_law:** GIỮ auto-compute (cần cho hiển thị dâu/rể).
- **generation:** GIỮ auto-compute (cần cho cây gia phả).
- **Migration:** Manual từ LineageManager.

### Lý do

1. **User muốn kiểm soát birth_order:** Thứ tự con trưởng/thứ thường do gia đình quyết định, không thể auto từ birth_year (sinh cùng năm, thứ tự thực tế khác).
2. **Eliminate cascade:** Bỏ computeBirthOrders khỏi recompute flow → triệt tiêu hoàn toàn bug cascade is_in_law → birth_order.
3. **Đơn giản nhất:** Giảm 1/3 logic trong recompute, không cần fix algorithm phức tạp.

### Thay đổi cụ thể

#### 5.1 `app/actions/lineage.ts` — Bỏ birth_order khỏi recompute flow

```diff
  // Compute lineage values
  const genMap = computeGenerations(persons, relationships ?? []);
- const orderMap = computeBirthOrders(persons, relationships ?? []);
  const inLawMap = computeInLaws(persons, relationships ?? []);
```

```diff
  for (const p of persons) {
    const newGen = genMap.has(p.id) ? genMap.get(p.id)! : null;
-   const newOrder = orderMap.has(p.id) ? orderMap.get(p.id)! : null;
    const newInLaw = inLawMap.get(p.id) ?? false;

-   const genChanged = newGen !== p.generation;
-   const orderChanged = newOrder !== p.birth_order;
+   const genChanged = newGen !== p.generation;
    const inLawChanged = newInLaw !== p.is_in_law;

-   if (genChanged || orderChanged || inLawChanged) {
+   if (genChanged || inLawChanged) {
      updatePayloads.push({
        id: p.id,
        generation: newGen,
-       birth_order: newOrder,
        is_in_law: newInLaw,
      });
    }
  }
```

#### 5.2 `utils/lineage.ts` — Giữ nguyên computeBirthOrders

Hàm `computeBirthOrders` vẫn tồn tại (không xóa) — có thể dùng trong tương lai nếu user muốn auto-compute. Nhưng hiện tại KHÔNG gọi từ `recomputeLineage()`.

#### 5.3 Test cases cần update

- **Update test:** "skips in-law children in birth order count" → vẫn pass (hàm không đổi)
- **Thêm test:** `recomputeLineage()` KHÔNG thay đổi birth_order (integration test hoặc unit test verify rằng birth_order không bị touched)
- **Thêm test:** `recomputeLineage()` chỉ update generation + is_in_law

---

## 6. Self-Review Checklist

| Check | Kết quả |
|-------|---------|
| Tenant isolation | ✅ N/A — single-tenant family tree |
| Event schema | ✅ N/A |
| DB index strategy | ✅ Không thay đổi schema |
| Error handling | ✅ Không thay đổi error flow |
| Breaking changes | ✅ Không breaking — bỏ auto birth_order, giữ manual |
| PII/compliance | ✅ Không thay đổi PII |
| Logging | ✅ Không thay đổi |
| Over-engineering (YAGNI) | ✅ Chỉ xóa logic, không thêm gì |
| Simpler alternative (KISS) | ✅ Đơn giản nhất có thể — xóa 1 hàm gọi |
| Duplicate logic (DRY) | ✅ computeBirthOrders giữ lại nhưng không gọi từ recompute |

---

## 7. Rủi ro và lưu ý

### R1: birth_order không tự động cập nhật
- **Risk:** Khi thêm/xóa con, birth_order của anh chị em KHÔNG tự cập nhật.
- **Mitigation:** Đây là behavior mong muốn — user tự đánh thủ công. LineageManager vẫn có nút "Tính toán" nếu user muốn auto-compute trong tương lai.

### R2: Data cũ cần migration
- **Risk:** Data trong DB có thể có birth_order sai (do bug cũ).
- **Mitigation:** User chạy manual recompute từ LineageManager. Hoặc sửa tay từng người.

### R3: computeBirthOrders trở thành dead code
- **Risk:** Hàm `computeBirthOrders` vẫn tồn tại nhưng không được gọi từ `recomputeLineage()`.
- **Mitigation:** Giữ lại — có thể dùng trong tương lai nếu user muốn auto-compute. Hoặc xóa nếu không cần.

---

## 8. Tiêu chí thành công

| # | Tiêu chí | Cách xác minh |
|---|----------|---------------|
| 1 | `recomputeLineage()` KHÔNG thay đổi birth_order | Test: set birth_order=3 → thêm/xóa relationship → recompute → birth_order vẫn = 3 |
| 2 | `recomputeLineage()` vẫn auto-compute generation | Test: thêm cha-con → generation tự cập nhật |
| 3 | `recomputeLineage()` vẫn auto-compute is_in_law | Test: thêm marriage → is_in_law tự cập nhật |
| 4 | Tất cả tests hiện tại vẫn pass | `npx vitest run` |
| 5 | `computeBirthOrders` vẫn tồn tại (không bị xóa) | Grep: function vẫn export từ utils/lineage.ts |
| 6 | No regression — thêm/xóa quan hệ vẫn hoạt động bình thường | Test: toàn bộ CRUD relationships |

---

## 9. Quyết định đã chốt

| # | Quyết định | Kết quả |
|---|-----------|---------|
| 1 | In-laws có nên có birth_order không? | **KHÔNG** — giữ skip in-laws, user tự đánh |
| 2 | Max logic (2 cha/mẹ) | **BỎ** auto birth_order hoàn toàn, user tự đánh |
| 3 | Migration data | **Manual** từ LineageManager |

---

## 10. Bước tiếp theo

1. **`/be-plan`** → Tạo implementation plan (user đã approve)
2. **`/be-ship`** → Implement theo plan
