import { describe, expect, it, vi, beforeEach } from 'vitest';

// Mock server action dependencies BEFORE importing the action
vi.mock('@/utils/supabase/queries', () => ({
  getProfile: vi.fn(),
  getSupabase: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

import { recomputeLineage } from '../lineage';
import { getProfile, getSupabase } from '@/utils/supabase/queries';

// ─── Test Helpers ─────────────────────────────────────────────────────

function createMockSupabase(persons: any[], relationships: any[]) {
  const updateCalls: Array<{ id: string; payload: Record<string, any> }> = [];

  const mockChain = {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        then: (resolve: (value: any) => void) => {
          // Determine which table is being queried by checking the from() argument
          const lastFromCall = mockChain.from.mock.calls[mockChain.from.mock.calls.length - 1];
          const table = lastFromCall?.[0];
          const data = table === 'persons' ? persons : relationships;
          resolve({ data, error: null });
        },
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockImplementation((field: string, value: string) => {
          const updatePayload = mockChain.from.mock.results[
            mockChain.from.mock.results.length - 1
          ]?.value?.update?.mock?.calls?.slice(-1)?.[0]?.[0];
          if (updatePayload) {
            updateCalls.push({ id: value, payload: { ...updatePayload } });
          }
          return Promise.resolve({ error: null });
        }),
      }),
    }),
    _updateCalls: updateCalls,
  };

  // Override update to capture payloads
  const origFrom = mockChain.from;
  mockChain.from = vi.fn().mockImplementation((table: string) => {
    return {
      select: vi.fn().mockReturnValue({
        then: (resolve: (value: any) => void) => {
          const data = table === 'persons' ? persons : relationships;
          resolve({ data, error: null });
        },
      }),
      update: vi.fn().mockImplementation((payload: Record<string, any>) => {
        return {
          eq: vi.fn().mockImplementation((field: string, value: string) => {
            updateCalls.push({ id: value, payload: { ...payload, id: value } });
            return Promise.resolve({ error: null });
          }),
        };
      }),
    };
  });

  return mockChain;
}

// ─── Regression Tests: birth_order stability ──────────────────────────

describe('recomputeLineage — birth_order regression', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getProfile).mockResolvedValue({ id: 'admin', role: 'admin', is_active: true, created_at: '', updated_at: '' });
  });

  it('KHÔNG update birth_order khi generation thay đổi', async () => {
    // Setup: Family với generation SAI trong DB → recompute phải fix gen
    // birth_order đã set thủ công → KHÔNG được thay đổi
    const persons = [
      { id: 'dad', full_name: 'Bố', gender: 'male', birth_year: 1950, generation: 99, birth_order: null, is_in_law: false }, // Wrong gen!
      { id: 'c1', full_name: 'Con Trưởng', gender: 'male', birth_year: 1975, generation: 2, birth_order: 1, is_in_law: false },
      { id: 'c2', full_name: 'Con Thứ', gender: 'female', birth_year: 1978, generation: 2, birth_order: 2, is_in_law: false },
      { id: 'c3', full_name: 'Con Út', gender: 'male', birth_year: 1982, generation: 2, birth_order: 3, is_in_law: false },
    ];
    const relationships = [
      { type: 'biological_child', person_a: 'dad', person_b: 'c1' },
      { type: 'biological_child', person_a: 'dad', person_b: 'c2' },
      { type: 'biological_child', person_a: 'dad', person_b: 'c3' },
    ];

    const mock = createMockSupabase(persons, relationships);
    vi.mocked(getSupabase).mockResolvedValue(mock as any);

    await recomputeLineage();

    // Verify: Có update cho dad (gen 99→1), nhưng KHÔNG chứa birth_order
    const dadUpdate = mock._updateCalls.find(c => c.id === 'dad');
    expect(dadUpdate).toBeDefined(); // gen changed → must update
    expect(dadUpdate?.payload).not.toHaveProperty('birth_order');
  });

  it('KHÔNG cascade birth_order khi is_in_law thay đổi', async () => {
    // Setup: Person có is_in_law=false trong DB, birth_order=2
    // Sau recompute: is_in_law có thể flip → birth_order KHÔNG được thay đổi
    const persons = [
      { id: 'root', full_name: 'Root', gender: 'male', birth_year: 1950, generation: 1, birth_order: null, is_in_law: false },
      { id: 'c1', full_name: 'Con 1', gender: 'male', birth_year: 1975, generation: 2, birth_order: 1, is_in_law: false },
      { id: 'c2', full_name: 'Con 2', gender: 'female', birth_year: 1978, generation: 2, birth_order: 2, is_in_law: true }, // DB says in-law
      { id: 'c3', full_name: 'Con 3', gender: 'male', birth_year: 1982, generation: 2, birth_order: 3, is_in_law: false },
      { id: 'spouse2', full_name: 'Rể', gender: 'male', birth_year: 1977, generation: 2, birth_order: null, is_in_law: true },
    ];
    const relationships = [
      { type: 'biological_child', person_a: 'root', person_b: 'c1' },
      { type: 'biological_child', person_a: 'root', person_b: 'c2' },
      { type: 'biological_child', person_a: 'root', person_b: 'c3' },
      { type: 'marriage', person_a: 'c2', person_b: 'spouse2' },
    ];

    const mock = createMockSupabase(persons, relationships);
    vi.mocked(getSupabase).mockResolvedValue(mock as any);

    await recomputeLineage();

    // Verify: KHÔNG có update call nào chứa birth_order
    for (const call of mock._updateCalls) {
      expect(call.payload).not.toHaveProperty('birth_order');
    }
  });

  it('vẫn update generation và is_in_law (không bỏ sót)', async () => {
    // Setup: Person có generation sai → recompute phải fix
    const persons = [
      { id: 'root', full_name: 'Root', gender: 'male', birth_year: 1950, generation: 99, birth_order: null, is_in_law: false }, // Wrong gen
      { id: 'c1', full_name: 'Con 1', gender: 'male', birth_year: 1975, generation: 2, birth_order: 1, is_in_law: false },
    ];
    const relationships = [
      { type: 'biological_child', person_a: 'root', person_b: 'c1' },
    ];

    const mock = createMockSupabase(persons, relationships);
    vi.mocked(getSupabase).mockResolvedValue(mock as any);

    await recomputeLineage();

    // Verify: root có update cho generation (99 → 1)
    const rootUpdate = mock._updateCalls.find(c => c.id === 'root');
    expect(rootUpdate).toBeDefined();
    expect(rootUpdate?.payload.generation).toBe(1);
    // birth_order KHÔNG trong payload
    expect(rootUpdate?.payload).not.toHaveProperty('birth_order');
  });
});

// ─── Verify computeBirthOrders still works independently ──────────────

describe('computeBirthOrders — vẫn hoạt động độc lập', () => {
  it('hàm vẫn export và chạy đúng khi gọi trực tiếp', async () => {
    const { computeBirthOrders } = await import('@/utils/lineage');

    const persons = [
      { id: 'parent', full_name: 'Parent', gender: 'male', birth_year: 1950, is_in_law: false },
      { id: 'c1', full_name: 'Con 1', gender: 'male', birth_year: 1975, is_in_law: false },
      { id: 'c2', full_name: 'Con 2', gender: 'female', birth_year: 1978, is_in_law: false },
    ];
    const rels = [
      { type: 'biological_child', person_a: 'parent', person_b: 'c1' },
      { type: 'biological_child', person_a: 'parent', person_b: 'c2' },
    ];

    const result = computeBirthOrders(persons, rels);
    expect(result.get('c1')).toBe(1);
    expect(result.get('c2')).toBe(2);
  });
});
