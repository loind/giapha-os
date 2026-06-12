# Auto-recompute Lineage on Relationship Mutation

**Date:** 2026-06-12  
**Status:** Accepted  
**Scope:** Lineage computation (generation, birth_order, is_in_law)

## Context

Trước đây, khi thêm/xóa quan hệ cha con, generation của target person được auto-update đơn giản (chỉ 1 người). Các trường hợp phức tạp (cascade xuống grandchildren, birth_order, is_in_law) không được xử lý. User phải vào LineageManager để manually "Tính toán" + "Áp dụng".

## Decision

Mỗi relationship mutation (add/delete/bulk add spouse/quick add spouse) trong `RelationshipManager` sẽ gọi server action `recomputeLineage()` sau khi mutation thành công. Server action:

1. Fetch toàn bộ persons + relationships
2. Chạy 3 compute functions (computeGenerations, computeBirthOrders, computeInLaws)
3. Diff computed values vs current DB values
4. Batch UPDATE changed persons (chunk 20)
5. revalidatePath("/dashboard")
6. Return updatedCount → toast notification

3 compute functions được extract thành shared utility (`utils/lineage.ts`) — cả server action và LineageManager component đều reuse.

## Alternatives Considered

| Alternative | Pros | Cons | Why Rejected |
|-------------|------|------|-------------|
| Incremental cascade (chỉ update affected subtree) | Performance tốt cho tree lớn | Phức tạp, dễ bug, edge cases nhiều | Family tree < 1000 persons, full recompute đủ nhanh |
| Database trigger / computed column | Real-time, không cần server action | Supabase limits, khó debug, schema dependency | Không portable, khó test |
| Async job queue | Không block UI | Over-engineering cho use case đơn giản | Family tree không phải real-time system |

## Consequences

- **Positive:** Generation/birth_order/is_in_law luôn consistent sau mỗi mutation. User không cần manual recompute.
- **Positive:** DRY — shared utility giữa UI và server action.
- **Negative:** Full recompute fetch all persons + relationships mỗi mutation. Acceptable cho tree < 1000 persons.
- **Negative:** Race condition nếu 2 editors cùng lúc. Accept partial update — re-run sẽ fix.
- **Risk:** Nếu tree > 1000 persons, cần optimize sang incremental cascade.

## References

- Plan: `plans/2026-06-12-auto-recompute-lineage/plan.md`
- Server action: `app/actions/lineage.ts`
- Shared utility: `utils/lineage.ts`
