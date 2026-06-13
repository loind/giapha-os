# Brainstorm: Chuyển ô nhập "Thứ tự sinh" và "Đời thứ" thành dropdown

## Vấn đề

Trong `MemberForm.tsx`, hai trường **"Thứ tự sinh trong gia đình"** (`birthOrder`) và **"Thuộc đời thứ"** (`generation`) đang là `<input type="number">` — user phải gõ số thủ công. Yêu cầu chuyển thành `<select>` dropdown để chọn nhanh.

## Stack Context

- **Framework:** Next.js (App Router) + React
- **Styling:** TailwindCSS
- **Form:** Custom controlled form (không dùng form library)
- **DB:** Supabase (PostgreSQL) — schema không đổi

## Code hiện có liên quan

| File | Vai trò |
|------|---------|
| `components/MemberForm.tsx` (dòng 542-578) | 2 ô input cần chuyển |
| `components/MemberForm.tsx` (dòng 490-504) | Pattern `<select>` của field Giới tính — reuse |
| `types/index.ts` (dòng 52-53) | `birth_order: number \| null`, `generation: number \| null` — không đổi |

## Các hướng tiếp cận

### Approach A: Replace `<input>` → `<select>` (đề xuất)

Giữ nguyên state `number | ""`, thay input bằng select với options:
- Option rỗng "— Chọn —" (value = "")
- Options 1→15 cho birth order, 1→20 cho generation
- Reuse `inputClasses` + pattern từ gender select (appearance-none + chevron icon)

| Tiêu chí | Đánh giá |
|----------|----------|
| Files thay đổi | 1 (MemberForm.tsx) |
| Schema change | Không |
| Breaking change | Không — value type giữ nguyên `number \| ""` |
| Complexity | Thấp — pure UI swap |
| Risk | Gần như 0 |

### Approach B: Custom searchable dropdown component

Dùng library (radix-ui, headless-ui) hoặc tự build dropdown có search.

→ **Loại:** Over-engineering cho 2 field chọn số cố định. Không có use case nào cần search trong 15-20 options.

### Approach C: Number input với +/- buttons

Giữ input number, thêm stepper buttons.

→ **Loại:** Vẫn phải gõ số hoặc click nhiều lần. Dropdown 1-click nhanh hơn. Thêm complexity cho stepper UI.

## Hướng đề xuất

**Approach A** — thay input bằng select. Lý do:
- Smallest correct change (1 file, ~30 dòng thay đổi)
- Reuse existing pattern (gender select)
- Không dependency mới
- Không schema/API change

## Self-Review Checklist

- [x] Tenant isolation — N/A (frontend only)
- [x] Event schema — N/A
- [x] DB index — N/A
- [x] Error handling — giữ nguyên logic validate hiện có
- [x] Tracing — N/A
- [x] Breaking changes — KHÔNG (value type giữ nguyên)
- [x] PII/compliance — N/A
- [x] Logging — N/A
- [x] Over-engineering — KHÔNG (chọn approach đơn giản nhất)
- [x] KISS — YES
- [x] DRY — reuse gender select pattern

## Rủi ro và lưu ý

- **Không có rủi ro đáng kể.** Giá trị hiện tại (nếu user đã nhập số > range) sẽ hiển thị option rỗng khi edit — acceptable vì range đủ rộng (15, 20).
- **Placeholder text "💡 Để trống nếu không rõ"** sẽ được thay bằng option "— Để trống nếu không rõ —" trong dropdown.

## Tiêu chí thành công

1. Dropdown hiển thị đúng range (1-15 cho birth order, 1-20 cho generation)
2. Option rỗng hoạt động (clear selection)
3. Submit giữ nguyên behavior — `birthOrder === "" ? null : Number(birthOrder)`
4. Edit mode: giá trị cũ được select đúng
5. UI consistent với gender dropdown hiện có

## Bước tiếp theo

Chuyển sang `/be-plan` → tạo plan chi tiết → `/be-ship` implement.
