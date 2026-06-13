# Phase 02: Implementation — Bỏ birth_order khỏi recompute flow

**Status:** Pending
**blockedBy:** phase-01-test-review

---

## Mục tiêu

Sửa `app/actions/lineage.ts` để bỏ `computeBirthOrders` khỏi recompute flow. Tests từ phase-01 sẽ PASS (GREEN).

---

## Thay đổi

### File: `app/actions/lineage.ts`

#### Change 1: Bỏ import computeBirthOrders

```diff
  import {
-   computeBirthOrders,
    computeGenerations,
    computeInLaws,
  } from "@/utils/lineage";
```

#### Change 2: Bỏ computeBirthOrders khỏi flow

```diff
    // Compute lineage values
    const genMap = computeGenerations(persons, relationships ?? []);
-   const orderMap = computeBirthOrders(persons, relationships ?? []);
    const inLawMap = computeInLaws(persons, relationships ?? []);
```

#### Change 3: Bỏ birth_order khỏi diff + update payload

```diff
    for (const p of persons) {
      const newGen = genMap.has(p.id) ? genMap.get(p.id)! : null;
-     const newOrder = orderMap.has(p.id) ? orderMap.get(p.id)! : null;
      const newInLaw = inLawMap.get(p.id) ?? false;

      const genChanged = newGen !== p.generation;
-     const orderChanged = newOrder !== p.birth_order;
      const inLawChanged = newInLaw !== p.is_in_law;

-     if (genChanged || orderChanged || inLawChanged) {
+     if (genChanged || inLawChanged) {
        updatePayloads.push({
          id: p.id,
          generation: newGen,
-         birth_order: newOrder,
          is_in_law: newInLaw,
        });
      }
    }
```

#### Change 4: Update updatePayloads type

```diff
    const updatePayloads: Array<{
      id: string;
      generation: number | null;
-     birth_order: number | null;
      is_in_law: boolean;
    }> = [];
```

#### Change 5: Update batch update call

```diff
    supabase
      .from("persons")
      .update({
        generation: u.generation,
-       birth_order: u.birth_order,
        is_in_law: u.is_in_law,
      })
      .eq("id", u.id),
```

---

## Verification

```bash
npx vitest run utils/__tests__/lineage.test.ts
```

**Expected:**
- regression tests mới: PASS (GREEN)
- 30 tests cũ: vẫn PASS (không regression)

```bash
npx vitest run
```

**Expected:** Tất cả tests trong project PASS.

---

## Acceptance Criteria

- [x] `computeBirthOrders` không được import trong `app/actions/lineage.ts`
- [x] `recomputeLineage()` chỉ update `generation` + `is_in_law` (không birth_order)
- [x] `computeBirthOrders` vẫn tồn tại trong `utils/lineage.ts` (không xóa)
- [x] Tất cả tests PASS (cũ + mới) — 88/88
- [x] Type check clean cho changed files
