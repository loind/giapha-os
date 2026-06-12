---
mode: eng
reviewed_at: 2026-06-12
reviewer: be-plan --review=eng (validate)
target_plan: ./plan.md
verdict: PASS
---

# Engineering Review — Tự động tính đời khi cập nhật cha con

## Summary

**Verdict: PASS** (sau revision). Plan bổ sung đầy đủ: Data Flow Diagram, Partial Failure Strategy, Idempotency, Server Action Test Cases, Assumptions section. Sẵn sàng ship.

## Checklist

### 1. Data Flow Diagram — PASS ✅
- **Evidence:** plan.md "Data Flow (Hot Path)" section — mermaid sequence diagram đầy đủ: User → RelationshipManager → Supabase mutation → recomputeLineage() → utils/lineage.ts → batch update → revalidate → toast.
- Sync boundaries rõ ràng. Không async/event-driven.

### 2. State Machine — N/A ✅
- Không introduce stateful entities mới. generation/birth_order/is_in_law là computed properties.

### 3. Error Paths & Resilience — PASS ✅
- **Evidence:** Phase 2 "Partial Failure Strategy" — decision: accept partial update, log error, continue remaining chunks. Return partialError.
- **Idempotency:** Explicitly documented — double-call safe (lần 2 updatedCount=0).
- **Timeout:** Implicit qua chunk 20 + Promise.all. Không có explicit timeout nhưng acceptable cho tree <1000 persons.

### 4. Test Matrix — PASS ✅
- **Evidence:** Test Plan bổ sung "Server Action — Manual Test Script" — 7 test cases cho server action (auth, empty, consistent, needs update, partial failure, idempotent, disconnected).
- Pure function tests: 14 test cases (giữ nguyên).
- Coverage target 90%+ cho pure functions. Server action test qua manual script.

### 5. Mobio Failure Modes — N/A ✅
- Không áp dụng (single-tenant, không Kafka/Redis/ES/trace_id).

### 6. Hidden Assumptions — PASS ✅
- **Evidence:** plan.md "Assumptions" section — 6 items:
  - A1: Tree < 1000 persons → performance
  - A2: 1 editor → race condition
  - A3: Supabase connection pool
  - A4: Data inconsistent window OK
  - A5: Auto-toast UX
  - A6: Supabase auth session valid
- Mỗi item có "If False → Impact" + Mitigation.

## Changes from v1 → v2

| Review Item | Fix Applied | Location |
|-------------|-------------|----------|
| Data Flow Diagram missing | Added mermaid sequence diagram | plan.md "Data Flow (Hot Path)" |
| Partial failure not addressed | Accept partial update strategy + partialError return | plan.md Phase 2 |
| Idempotency unclear | Explicitly documented: double-call safe | plan.md Phase 2 "Idempotency" |
| Server action tests missing | 7 manual test cases added | plan.md Test Plan |
| Assumptions not surfaced | 6 assumptions with impact/mitigation | plan.md "Assumptions" |

## Final Assessment

- **Strengths:** Clear approach, DRY (shared utility), pragmatic error handling, thorough test plan for pure functions.
- **Remaining notes:** 
  - Monitor performance if tree grows >1000 persons.
  - Server action manual tests should be run during Phase 4 verification.
  - Consider adding explicit timeout (e.g., AbortController) if needed in future.

**Ready to ship.**
