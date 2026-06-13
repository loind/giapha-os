# Phase 01: Regression Tests — Birth Order KHÔNG bị thay đổi bởi recompute

**Status:** Pending
**blockedBy:** —
**Scope:** Test files only

---

## Mục tiêu

Viết regression tests verify rằng `recomputeLineage()` KHÔNG thay đổi `birth_order` của bất kỳ person nào. Tests phải FAIL trước khi implement fix (RED phase).

---

## Thay đổi

### File: `utils/__tests__/lineage.test.ts`

Thêm describe block mới: `recomputeLineage — birth_order stability`

**Test cases:**

#### Test 1: birth_order không thay đổi khi thêm relationship

```typescript
it('birth_order KHÔNG thay đổi khi thêm relationship', async () => {
  // Setup: Family với birth_order đã set
  // Mock Supabase trả về persons với birth_order cố định
  // Mock relationships thay đổi (thêm 1 marriage)
  // Call recomputeLineage()
  // Verify: UPDATE call KHÔNG include birth_order field
})
```

#### Test 2: birth_order không cascade khi is_in_law thay đổi

```typescript
it('birth_order KHÔNG cascade khi is_in_law flip', async () => {
  // Setup: Person có is_in_law=false, birth_order=2
  // Sau recompute: is_in_law flip thành true
  // Verify: birth_order=2 KHÔNG bị thay đổi (vẫn 2, không undefined)
})
```

#### Test 3: computeBirthOrders vẫn hoạt động độc lập

```typescript
it('computeBirthOrders vẫn chạy đúng khi gọi trực tiếp', () => {
  // Call computeBirthOrders(persons, rels) trực tiếp
  // Verify: trả về Map đúng
  // → Chứng tỏ hàm không bị xóa, chỉ không gọi từ recompute
})
```

---

## Verification

```bash
npx vitest run utils/__tests__/lineage.test.ts
```

**Expected:** Tests mới FAIL (vì recomputeLineage hiện tại vẫn update birth_order).
Tests cũ (30 tests) vẫn PASS.

---

## Acceptance Criteria

- [x] 3 test cases mới thêm vào lineage.test.ts
- [x] Tests mới FAIL với code hiện tại (RED)
- [x] 30 tests cũ vẫn PASS (không regression)
- [x] Test descriptions rõ ràng, đọc hiểu được intent
