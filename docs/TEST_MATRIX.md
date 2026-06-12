# Test Matrix

Mapping từ behavior đến proof (tests). Manual document — update khi thêm/xóa/sửa tests.

## utils/lineage.ts — Lineage Compute Functions

| Behavior | Test File | Test Cases | Coverage |
|----------|-----------|------------|----------|
| computeGenerations: simple chain | `utils/__tests__/lineage.test.ts` | 11 tests | ✅ |
| computeGenerations: marriage propagation | `utils/__tests__/lineage.test.ts` | included above | ✅ |
| computeGenerations: cycle detection | `utils/__tests__/lineage.test.ts` | included above | ✅ |
| computeGenerations: disconnected families | `utils/__tests__/lineage.test.ts` | included above | ✅ |
| computeBirthOrders: sort by birth_year | `utils/__tests__/lineage.test.ts` | 8 tests | ✅ |
| computeBirthOrders: in-law skip | `utils/__tests__/lineage.test.ts` | included above | ✅ |
| computeBirthOrders: two parents max order | `utils/__tests__/lineage.test.ts` | included above | ✅ |
| computeInLaws: bloodline detection | `utils/__tests__/lineage.test.ts` | 11 tests | ✅ |
| computeInLaws: gender fallback | `utils/__tests__/lineage.test.ts` | included above | ✅ |
| computeInLaws: existing value preservation | `utils/__tests__/lineage.test.ts` | included above | ✅ |

## app/actions/lineage.ts — Server Action

| Behavior | Test | Status |
|----------|------|--------|
| Auth check (non-admin rejection) | Manual test script | ⏳ Pending |
| Empty tree (0 persons) | Manual test script | ⏳ Pending |
| Already consistent (no changes) | Manual test script | ⏳ Pending |
| Needs update (generation=null) | Manual test script | ⏳ Pending |
| Partial failure (mid-batch error) | Manual test script | ⏳ Pending |
| Idempotency (double-call) | Manual test script | ⏳ Pending |
| Disconnected person (no relationships) | Manual test script | ⏳ Pending |

## Other Utils

| Behavior | Test File | Test Cases |
|----------|-----------|------------|
| dateHelpers | `utils/__tests__/dateHelpers.test.ts` | existing |
| styleHelpers | `utils/__tests__/styleHelpers.test.ts` | existing |
| treeHelpers | `utils/__tests__/treeHelpers.test.ts` | existing |

**Total:** 77 tests across 4 test files (30 lineage + 47 others).
