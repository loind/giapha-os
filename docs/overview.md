# Kiến trúc Kỹ thuật — Gia Phả OS

**Project:** giapha-os  
**Version:** 0.1.0  
**Ngày:** 2026-06-12  
**Repository:** https://github.com/homielab/giapha-os

---

## 1. Tổng quan

**Gia Phả OS** là hệ thống quản lý gia phả dòng họ, thiết kế cho người Việt Nam. Cho phép nhiều thế hệ cùng cập nhật thông tin (sinh, tử, hôn nhân, quan hệ) và xem sơ đồ gia phả trực quan.

**Use case chính:**
- Con cháu ở nhiều nơi cùng cập nhật thông tin gia đình
- Xem sơ đồ gia phả dạng Tree/Mindmap
- Tự động tính danh xưng (Bác, Chú, Cô, Dì...) theo văn hóa Việt
- Theo dõi ngày giỗ, thống kê nhân khẩu
- Sao lưu/xuất dữ liệu (JSON, CSV, GEDCOM)

---

## 2. Tech Stack

| Tầng | Công nghệ | Version |
|------|-----------|---------|
| **Framework** | Next.js (App Router) | 16.2.6 |
| **Language** | TypeScript | 5.x |
| **UI** | React | 19.2.6 |
| **Styling** | Tailwind CSS | 4.x |
| **Animations** | Framer Motion | 12.x |
| **Database** | Supabase (PostgreSQL) | @supabase/supabase-js 2.x |
| **Auth** | Supabase Auth | @supabase/ssr 0.10.x |
| **Charts/Viz** | D3.js | 7.x |
| **Export** | jsPDF, html-to-image, JSZip | - |
| **Import** | PapaParse (CSV) | 5.x |
| **Lunar Calendar** | lunar-javascript | 1.7.7 |
| **Icons** | lucide-react | 1.16.x |
| **Package Manager** | Bun | - |

---

## 3. Kiến trúc tổng thể

```
┌─────────────────────────────────────────────────────────────┐
│                        Next.js App                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                   Pages (app/)                        │  │
│  │  /                     Landing page                   │  │
│  │  /login                Authentication                 │  │
│  │  /dashboard            Main app layout                │  │
│  │    /dashboard/members  Member list + detail           │  │
│  │    /dashboard/lineage  Generation management          │  │
│  │    /dashboard/kinship  Kinship finder                 │  │
│  │    /dashboard/events   Death anniversaries            │  │
│  │    /dashboard/stats    Statistics                     │  │
│  │    /dashboard/gallery  Photo gallery                  │  │
│  │    /dashboard/data     Import/Export                  │  │
│  │    /dashboard/users    User management (admin)        │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Components (components/)                 │  │
│  │  RelationshipManager   Quan hệ cha/mẹ/con/vợ-chồng   │  │
│  │  LineageManager        Tính generation/birth_order    │  │
│  │  FamilyTree            Sơ đồ cây (D3)                 │  │
│  │  MindmapTree           Sơ đồ tư duy                   │  │
│  │  BubbleMapTree         Bubble map visualization       │  │
│  │  KinshipFinder         Tìm danh xưng                  │  │
│  │  MemberForm            Form thêm/sửa thành viên       │  │
│  │  DataImportExport      Import/Export JSON/CSV/GEDCOM  │  │
│  │  ...                                                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Server Actions (app/actions/)               │  │
│  │  data.ts      Import/Export backup                    │  │
│  │  lineage.ts   Auto-recompute generation/birth_order   │  │
│  │  member.ts    Delete member profile                   │  │
│  │  user.ts      User management (admin)                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            Utils (utils/)                             │  │
│  │  lineage.ts         Compute generation/birth_order    │  │
│  │  kinshipHelpers.ts  Tính danh xưng Việt Nam           │  │
│  │  treeHelpers.ts     Xây dựng tree structure           │  │
│  │  eventHelpers.ts    Tính toán sự kiện/ngày giỗ        │  │
│  │  dateHelpers.ts     Xử lý ngày tháng (solar/lunar)    │  │
│  │  gedcom.ts          GEDCOM format parser               │  │
│  │  csv.ts             CSV export helpers                 │  │
│  │  supabase/          Supabase client/server/queries    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │      Supabase Cloud     │
              │  ┌───────────────────┐  │
              │  │   PostgreSQL DB   │  │
              │  │  - persons        │  │
              │  │  - relationships  │  │
              │  │  - profiles       │  │
              │  │  - gallery        │  │
              │  │  - custom_events  │  │
              │  └───────────────────┘  │
              │  ┌───────────────────┐  │
              │  │   Auth (SSO)      │  │
              │  └───────────────────┘  │
              │  ┌───────────────────┐  │
              │  │   Storage         │  │
              │  │  - avatars        │  │
              │  │  - gallery images │  │
              │  └───────────────────┘  │
              └─────────────────────────┘
```

---

## 4. Data Model

### Bảng `persons`

| Column | Type | Mô tả |
|--------|------|-------|
| `id` | UUID | Primary key |
| `full_name` | TEXT | Họ tên đầy đủ |
| `gender` | ENUM | `male`, `female`, `other` |
| `birth_year` | INT | Năm sinh (dương lịch) |
| `birth_month` | INT | Tháng sinh |
| `birth_day` | INT | Ngày sinh |
| `death_year` | INT | Năm mất |
| `death_month` | INT | Tháng mất |
| `death_day` | INT | Ngày mất |
| `death_lunar_year` | INT | Năm mất (âm lịch) |
| `death_lunar_month` | INT | Tháng mất (âm lịch) |
| `death_lunar_day` | INT | Ngày mất (âm lịch) |
| `is_deceased` | BOOLEAN | Đã mất hay còn sống |
| `generation` | INT | Thế hệ (1 = đời đầu tiên) |
| `birth_order` | INT | Thứ tự sinh trong cùng cha/mẹ |
| `is_in_law` | BOOLEAN | Dâu/Rể (true) hay Máu thịt (false) |
| `avatar_url` | TEXT | URL ảnh đại diện (Storage) |
| `note` | TEXT | Ghi chú |
| `other_names` | TEXT | Tên khác / tên ở nhà |
| `phone_number` | TEXT | Số điện thoại (private) |
| `occupation` | TEXT | Nghề nghiệp (private) |
| `current_residence` | TEXT | Nơi ở hiện tại (private) |
| `created_at` | TIMESTAMP | Ngày tạo |
| `updated_at` | TIMESTAMP | Ngày cập nhật |

### Bảng `relationships`

| Column | Type | Mô tả |
|--------|------|-------|
| `id` | UUID | Primary key |
| `type` | ENUM | `marriage`, `biological_child`, `adopted_child` |
| `person_a` | UUID | FK → persons.id (cha/mẹ/vợ/chồng) |
| `person_b` | UUID | FK → persons.id (con/chồng/vợ) |
| `note` | TEXT | Ghi chú quan hệ |
| `created_at` | TIMESTAMP | Ngày tạo |
| `updated_at` | TIMESTAMP | Ngày cập nhật |

**Quy ước:**
- `biological_child` / `adopted_child`: person_a = cha/mẹ, person_b = con
- `marriage`: person_a và person_b là vợ/chồng (không phân biệt thứ tự)

### Bảng `profiles`

| Column | Type | Mô tả |
|--------|------|-------|
| `id` | UUID | FK → auth.users.id |
| `role` | ENUM | `admin`, `editor`, `member` |
| `is_active` | BOOLEAN | Tài khoản aktif |
| `created_at` | TIMESTAMP | Ngày tạo |
| `updated_at` | TIMESTAMP | Ngày cập nhật |

### Bảng `gallery`

| Column | Type | Mô tả |
|--------|------|-------|
| `id` | UUID | Primary key |
| `title` | TEXT | Tiêu đề ảnh |
| `description` | TEXT | Mô tả |
| `image_url` | TEXT | URL ảnh (Storage) |
| `event_date` | DATE | Ngày sự kiện |
| `created_by` | UUID | FK → profiles.id |
| `created_at` | TIMESTAMP | Ngày tạo |

### Bảng `custom_events`

| Column | Type | Mô tả |
|--------|------|-------|
| `id` | UUID | Primary key |
| `name` | TEXT | Tên sự kiện |
| `content` | TEXT | Nội dung |
| `event_date` | DATE | Ngày sự kiện |
| `location` | TEXT | Địa điểm |
| `created_by` | UUID | FK → profiles.id |
| `created_at` | TIMESTAMP | Ngày tạo |

---

## 5. Algorithms quan trọng

### 5.1 computeGenerations

**Input:** persons[], relationships[]  
**Output:** Map<personId, generation>

**Algorithm:**
1. Build child→parents map và parent→children map (chỉ biological/adopted)
2. Build spouse map (marriage relationships)
3. Tìm **roots**: persons không có parents VÀ không có spouses (hoặc spouses cũng không có parents)
4. **BFS từ roots** (generation = 1):
   - Children: generation = parent.generation + 1
   - Spouses: generation = spouse.generation (cùng đời)
5. Fallback: persons không reachable từ root → generation = null

**Edge cases:**
- Disconnected families (nhiều root) → mỗi root = gen 1
- Orphan persons → gen = null
- Cycles → BFS visited check, không infinite loop

### 5.2 computeBirthOrders

**Input:** persons[], relationships[]  
**Output:** Map<personId, birthOrder>

**Algorithm:**
1. Group children by parent (person_a trong biological_child/adopted_child)
2. Sort children by birth_year (ASC), fallback by full_name (Vietnamese locale)
3. Assign order 1, 2, 3... cho non-in-law children
4. Nếu child có 2 parents → lấy max order từ cả 2

### 5.3 computeInLaws

**Input:** persons[], relationships[]  
**Output:** Map<personId, isInLaw>

**Rules:**
- Có parents trong tree → `is_in_law = false` (máu thịt)
- Không parents, có spouse (spouse có parents) → `is_in_law = true` (dâu/rể)
- Root (không parents, không spouse) → `is_in_law = false`
- 2 roots married, không ai có parents → male = bloodline, female = in-law (fallback)

### 5.4 Kinship Finder (Tính danh xưng)

**Input:** personA, personB, persons[], relationships[]  
**Output:** { aCallsB, bCallsA, distance, pathLabels }

**Algorithm:**
1. Build graph (adjacency list) từ relationships
2. BFS tìm shortest path từ A → B
3. Dựa vào path labels (cha/mẹ/con/vợ/chồng) + gender + generation diff → tra bảng danh xưng Việt Nam
4. Bảng danh xưng: ~100+ rules cover các trường hợp phức tạp (cô dì, bác chú, cháu gọi bằng gì...)

---

## 6. Phân quyền (RBAC)

| Role | Quyền |
|------|-------|
| **Admin** | Toàn quyền: quản lý users, thêm/sửa/xóa persons, relationships, gallery, events |
| **Editor** | Thêm/sửa/xóa persons, relationships, gallery, events. KHÔNG quản lý users |
| **Member** | Chỉ xem. Không thêm/sửa/xóa |

**Implementation:**
- `utils/supabase/queries.ts`: `getProfile()`, `getIsAdmin()`
- Server Actions check role trước khi thực hiện
- UI components hide/disable buttons dựa trên role

---

## 7. API Patterns

### Server Actions

```typescript
// app/actions/member.ts
"use server";

export async function deleteMemberProfile(memberId: string) {
  const profile = await getProfile();  // Auth check
  const supabase = await getSupabase();
  
  if (profile?.role !== "admin" && profile?.role !== "editor") {
    return { error: "Từ chối truy cập..." };
  }
  
  // ... business logic
  
  revalidatePath("/dashboard/members");
  redirect("/dashboard/members");
}
```

**Convention:**
- Mọi server action đều check auth (`getProfile()`)
- Return `{ error: string }` on failure, hoặc void/redirect on success
- `revalidatePath()` sau mutations để refresh Next.js cache

### Client Components

```typescript
"use client";

export default function RelationshipManager({ person, isAdmin, canEdit }) {
  const supabase = createClient();
  // ... state + handlers
  
  // Direct Supabase calls for mutations
  await supabase.from("relationships").insert({...});
  
  // Then refresh
  router.refresh();
}
```

---

## 8. File Structure Conventions

```
app/
├── actions/          # Server Actions (mutations)
├── dashboard/        # Main app pages (protected)
├── login/            # Auth pages
├── layout.tsx        # Root layout
└── page.tsx          # Landing page

components/
├── modal/            # Modal components
├── [Name].tsx        # Feature components
└── [Name]Views.tsx   # View variants (list/grid)

utils/
├── supabase/         # Supabase client/server/queries
├── [name].ts         # Pure utility functions
└── [name]Helpers.ts  # Helper functions (can have side effects)

types/
└── index.ts          # TypeScript interfaces

context/              # React Context providers
hooks/                # Custom React hooks
```

---

## 9. Testing Strategy

**Test framework:** Vitest (configured)  
**Tests:** 77 passing (30 lineage compute + 47 other utils)  
**Coverage target:** 98% for utils + server actions

| Layer | Test type | Priority |
|-------|-----------|----------|
| `utils/*.ts` | Unit tests (pure functions) | P0 |
| `app/actions/*.ts` | Integration tests (mock Supabase) | P1 |
| Critical components | Component tests (@testing-library/react) | P2 |
| Pages | E2E tests (future) | P3 |

**Test file location:** `utils/__tests__/[name].test.ts`

---

## 10. Development Commands

```bash
# Install dependencies
bun install

# Dev server
bun run dev

# Build
bun run build

# Lint
bun run lint

# Test
bun test
# or
npx vitest run

# Test with coverage
npx vitest run --coverage
```

---

## 11. Environment Variables

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-anon-key

# Optional
SITE_NAME="Gia Phả Nguyễn Danh - Xuân Đỉnh"
DEMO_DOMAIN=giapha-os.homielab.com
```

---

## 12. Known Limitations

1. **No real-time sync** — Users need to refresh to see changes from others
2. **No offline support** — Requires internet connection
3. **Single language** — Vietnamese only (no i18n)
4. **No audit log** — Cannot track who changed what

---

## 13. Future Roadmap

- [x] Auto-recompute generation on relationship change (✅ 2026-06-12)
- [ ] Real-time collaboration (Supabase Realtime)
- [ ] Audit log / change history
- [ ] Offline support (PWA)
- [ ] Multi-language support (i18n)
- [ ] Advanced search / filters
- [ ] Mobile app (React Native)

---

**Last updated:** 2026-06-12
