<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **giapha-os** (1029 symbols, 1851 relationships, 60 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> Index stale? Run `node .gitnexus/run.cjs analyze` from the project root — it auto-selects an available runner. No `.gitnexus/run.cjs` yet? `npx gitnexus analyze` (npm 11 crash → `npm i -g gitnexus`; #1939).

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows. For regression review, compare against the default branch: `detect_changes({scope: "compare", base_ref: "main"})`.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `rename` which understands the call graph.
- NEVER commit changes without running `detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/giapha-os/context` | Codebase overview, check index freshness |
| `gitnexus://repo/giapha-os/clusters` | All functional areas |
| `gitnexus://repo/giapha-os/processes` | All execution flows |
| `gitnexus://repo/giapha-os/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->

## Architecture Quick Reference (from GitNexus exploration)

### Critical Hubs — blast radius khi thay đổi

| Symbol | File | Risk | Dependents | Ghi chú |
|--------|------|------|------------|---------|
| `createClient` (server) | `utils/supabase/server.ts` | 🔴 CRITICAL | 33 symbols, 22 processes | Mọi page + server action phụ thuộc |
| `recomputeLineage` | `app/actions/lineage.ts` | 🟠 HIGH | 6 symbols, 4 processes | Core lineage. Impact: addRel, bulkAdd, quickAddSpouse, delete |
| `createClient` (browser) | `utils/supabase/client.ts` | 🟡 MEDIUM | 12 symbols, 2 processes | Client-side Supabase |
| `Person` interface | `types/index.ts` | 🟡 MEDIUM | 27 files import | Core data model — thay đổi = impact toàn app |
| `computeKinship` | `utils/kinshipHelpers.ts` | 🟡 MEDIUM | KinshipFinder flow | 293 dòng logic quan hệ |
| `exportData` | `app/actions/data.ts` | 🟢 LOW | 2 symbols, 1 process | Chỉ DataImportExport dùng |

### Execution Flows quan trọng

| Flow | Steps | Type |
|------|-------|------|
| DataImportExport → CreateClient | 8 | cross-community (dài nhất) |
| HandleAddRelationship → CreateClient | 7 | cross-community |
| HandleBulkAdd → CreateClient | 7 | cross-community |
| HandleQuickAddSpouse → CreateClient | 7 | cross-community |
| HandleDelete → CreateClient | 7 | cross-community |

**Nhận xét:** 4 relationship operations dùng chung pattern 7 bước. Thay đổi 1 bước trong chain → impact tất cả.

### Cộng đồng chức năng

| Community | # Symbols | Cohesion |
|-----------|-----------|----------|
| Supabase (data layer) | 20 | 0.82 |
| Components (core UI) | 16 | 0.97 |
| Components (tree viz) | 12 | 0.76 |
| Components (relationships) | 10 | 0.85 |
| Actions (server) | 15 | 0.54-0.83 |
| Dashboard (pages) | 6 | 0.83 |

## Tool Priority — GitNexus First

**Khi cần hiểu code, LUÔN dùng GitNexus TRƯỚC khi grep/read:**

| Tình huống | Tool GitNexus | Ví dụ |
|------------|---------------|-------|
| "Symbol này ảnh hưởng gì?" | `impact()` | Trước khi sửa BẤT KỲ function nào |
| "Concept X hoạt động thế nào?" | `query()` | Tìm execution flows liên quan |
| "Chi tiết symbol này?" | `context()` | Callers, callees, process membership |
| "Cấu trúc code thế nào?" | `cypher()` | Structural queries, community analysis |
| "Ai gọi function này?" | `context()` incoming refs | Xem categorized references |
| "Sắp rename?" | `rename()` (dry_run=true) | Graph-aware rename |
| Before commit | `detect_changes()` | Verify scope |
| After commit | `detect_changes({scope:"compare", base_ref:"main"})` | Regression check |

**KHÔNG:** grep toàn codebase → đọc file → tự suy luận call graph.
**HÃY:** GitNexus query → biết ngay callers/callees/impact → đọc đúng file cần thiết.

### Cypher queries hữu ích

```cypher
// Tìm tất cả callers của một function
MATCH (a)-[:CodeRelation {type: 'CALLS'}]->(b:Function {name: "targetFn"})
RETURN a.name, a.filePath

// Tìm communities lớn nhất
MATCH (c:Community)
RETURN c.label, c.symbolCount, c.cohesion
ORDER BY c.symbolCount DESC LIMIT 10

// Tìm execution flows dài nhất (phức tạp nhất)
MATCH (p:Process)
RETURN p.label, p.processType, p.stepCount
ORDER BY p.stepCount DESC LIMIT 10

// Tìm tất cả methods của một class
MATCH (c:Class {name: "ClassName"})-[r:CodeRelation {type: 'HAS_METHOD'}]->(m:Method)
RETURN m.name, m.parameterCount, m.returnType
```

## Workflow theo loại task

### Trước khi SỬA code (bất kỳ thay đổi nào)
1. `impact({target: "symbolName", direction: "upstream"})` — biết blast radius
2. Nếu HIGH/CRITICAL → cảnh báo user, discuss approach trước khi code
3. `context({name: "symbolName"})` — hiểu callers/callees nếu cần

### Trước khi THÊM code mới
1. `query({query: "concept"})` — tìm flow/pattern tương tự đã có
2. `context()` trên symbols liên quan — biết interface để integrate đúng
3. Follow patternexisting (cùng community, cùng execution flow)

### Trước khi RENAME/REFACTOR
1. `rename({symbol_name, new_name, dry_run: true})` — preview tất cả references
2. `impact()` — biết blast radius
3. `detect_changes()` sau khi áp dụng — verify scope

### Trước khi COMMIT
1. `detect_changes()` — verify chỉ expected symbols bị ảnh hưởng
2. `detect_changes({scope: "compare", base_ref: "main"})` — regression check
3. Review affected processes — đặc biệt cross-community flows

## Key Architectural Facts

- **Không có REST API** — app dùng Next.js Server Actions + direct Supabase client calls
- **Dual Supabase client:** `client.ts` (browser) và `server.ts` (server) — cả hai đều critical hubs
- **MemberForm là leaf component** — Next.js App Router render qua routing, không qua import trực tiếp (graph không track page rendering)
- **Single-tenant** — không có `merchant_id` filter (family tree app, không multi-tenant SaaS)
- **Tất cả mutations** qua Server Actions → `revalidatePath()` → `router.refresh()`
