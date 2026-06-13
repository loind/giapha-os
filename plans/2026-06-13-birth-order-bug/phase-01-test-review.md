# Phase 01 Review: User Review Regression Tests

**Status:** Pending
**blockedBy:** phase-01-test-regression

---

## Mục tiêu

User review regression tests trước khi implement fix. Đảm bảo tests cover đúng bug và kỳ vọng behavior.

---

## Review Checklist

- [ ] Test 1: "birth_order KHÔNG thay đổi khi thêm relationship" — cover đúng scenario?
- [ ] Test 2: "birth_order KHÔNG cascade khi is_in_law flip" — cover đúng cascade bug?
- [ ] Test 3: "computeBirthOrders vẫn chạy đúng khi gọi trực tiếp" — verify hàm không bị xóa?
- [ ] Mock strategy OK? (Supabase client, revalidatePath)
- [ ] Test descriptions rõ ràng?
- [ ] Missing test cases?

---

## Action

User approve → sang phase-02-impl.
User reject → revise tests theo feedback.
