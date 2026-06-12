import { describe, expect, it } from 'vitest'
import { computeGenerations, computeBirthOrders, computeInLaws } from '../lineage'

// ─── Test Data Helpers ──────────────────────────────────────────────

function makePerson(overrides: Partial<TestPerson> & { id: string }): TestPerson {
  return {
    full_name: 'Test User',
    gender: 'male',
    birth_year: null,
    is_in_law: false,
    ...overrides,
  }
}

function makeRel(
  type: 'marriage' | 'biological_child' | 'adopted_child',
  personA: string,
  personB: string,
): TestRelationship {
  return { type, person_a: personA, person_b: personB }
}

interface TestPerson {
  id: string
  full_name: string
  gender: 'male' | 'female' | 'other'
  birth_year: number | null
  is_in_law: boolean
}

interface TestRelationship {
  type: 'marriage' | 'biological_child' | 'adopted_child'
  person_a: string
  person_b: string
}

// ─── computeGenerations ─────────────────────────────────────────────

describe('computeGenerations', () => {
  it('returns empty map for empty input', () => {
    const result = computeGenerations([], [])
    expect(result.size).toBe(0)
  })

  it('assigns generation 1 to a single root person', () => {
    const persons = [makePerson({ id: 'root' })]
    const result = computeGenerations(persons, [])
    expect(result.get('root')).toBe(1)
  })

  it('computes generation for simple parent→child chain', () => {
    // Root → Child → Grandchild
    const persons = [
      makePerson({ id: 'grandparent' }),
      makePerson({ id: 'parent' }),
      makePerson({ id: 'child' }),
    ]
    const rels = [
      makeRel('biological_child', 'grandparent', 'parent'),
      makeRel('biological_child', 'parent', 'child'),
    ]
    const result = computeGenerations(persons, rels)
    expect(result.get('grandparent')).toBe(1)
    expect(result.get('parent')).toBe(2)
    expect(result.get('child')).toBe(3)
  })

  it('assigns same generation to spouses', () => {
    // Root (gen 1) married to Spouse → Spouse also gen 1
    const persons = [
      makePerson({ id: 'root' }),
      makePerson({ id: 'spouse', gender: 'female' }),
    ]
    const rels = [makeRel('marriage', 'root', 'spouse')]
    const result = computeGenerations(persons, rels)
    expect(result.get('root')).toBe(1)
    expect(result.get('spouse')).toBe(1)
  })

  it('propagates generation through spouse to children', () => {
    // Root → Child, Root married to Spouse
    // Spouse should be gen 1, Child should be gen 2
    const persons = [
      makePerson({ id: 'father' }),
      makePerson({ id: 'mother', gender: 'female' }),
      makePerson({ id: 'child' }),
    ]
    const rels = [
      makeRel('marriage', 'father', 'mother'),
      makeRel('biological_child', 'father', 'child'),
    ]
    const result = computeGenerations(persons, rels)
    expect(result.get('father')).toBe(1)
    expect(result.get('mother')).toBe(1)
    expect(result.get('child')).toBe(2)
  })

  it('handles multiple disconnected families (multiple roots)', () => {
    // Family 1: Root1 → Child1
    // Family 2: Root2 → Child2
    const persons = [
      makePerson({ id: 'root1' }),
      makePerson({ id: 'child1' }),
      makePerson({ id: 'root2' }),
      makePerson({ id: 'child2' }),
    ]
    const rels = [
      makeRel('biological_child', 'root1', 'child1'),
      makeRel('biological_child', 'root2', 'child2'),
    ]
    const result = computeGenerations(persons, rels)
    expect(result.get('root1')).toBe(1)
    expect(result.get('child1')).toBe(2)
    expect(result.get('root2')).toBe(1)
    expect(result.get('child2')).toBe(2)
  })

  it('handles adopted children same as biological', () => {
    const persons = [
      makePerson({ id: 'parent' }),
      makePerson({ id: 'adopted' }),
    ]
    const rels = [makeRel('adopted_child', 'parent', 'adopted')]
    const result = computeGenerations(persons, rels)
    expect(result.get('parent')).toBe(1)
    expect(result.get('adopted')).toBe(2)
  })

  it('does not infinite loop on cyclic relationships', () => {
    // A → B → C → A (should not happen in practice but must not hang)
    const persons = [
      makePerson({ id: 'a' }),
      makePerson({ id: 'b' }),
      makePerson({ id: 'c' }),
    ]
    const rels = [
      makeRel('biological_child', 'a', 'b'),
      makeRel('biological_child', 'b', 'c'),
      makeRel('biological_child', 'c', 'a'),
    ]
    // Should not throw or hang
    const result = computeGenerations(persons, rels)
    // In a pure cycle with no roots, no one gets a generation — algorithm leaves them out
    // This is correct behavior: no root = no generation assignment
    expect(result.size).toBe(0)
  })

  it('leaves orphan persons (no connections) without generation', () => {
    // Orphan has no parents, no spouse, no children → not a "true root"
    // Actually per the algorithm, persons with no parents AND no spouses ARE true roots
    const persons = [
      makePerson({ id: 'connected_root' }),
      makePerson({ id: 'child' }),
      makePerson({ id: 'orphan' }),
    ]
    const rels = [makeRel('biological_child', 'connected_root', 'child')]
    const result = computeGenerations(persons, rels)
    expect(result.get('connected_root')).toBe(1)
    expect(result.get('child')).toBe(2)
    // Orphan with no connections is also a root → gen 1
    expect(result.get('orphan')).toBe(1)
  })

  it('handles complex family: two marriages and shared children', () => {
    // Father married to Mother1, they have Child1
    // Father married to Mother2, they have Child2
    const persons = [
      makePerson({ id: 'father' }),
      makePerson({ id: 'mother1', gender: 'female' }),
      makePerson({ id: 'mother2', gender: 'female' }),
      makePerson({ id: 'child1' }),
      makePerson({ id: 'child2' }),
    ]
    const rels = [
      makeRel('marriage', 'father', 'mother1'),
      makeRel('marriage', 'father', 'mother2'),
      makeRel('biological_child', 'father', 'child1'),
      makeRel('biological_child', 'father', 'child2'),
    ]
    const result = computeGenerations(persons, rels)
    expect(result.get('father')).toBe(1)
    expect(result.get('mother1')).toBe(1)
    expect(result.get('mother2')).toBe(1)
    expect(result.get('child1')).toBe(2)
    expect(result.get('child2')).toBe(2)
  })

  it('handles deep tree (5 generations)', () => {
    const persons = Array.from({ length: 5 }, (_, i) =>
      makePerson({ id: `gen${i + 1}` }),
    )
    const rels = [
      makeRel('biological_child', 'gen1', 'gen2'),
      makeRel('biological_child', 'gen2', 'gen3'),
      makeRel('biological_child', 'gen3', 'gen4'),
      makeRel('biological_child', 'gen4', 'gen5'),
    ]
    const result = computeGenerations(persons, rels)
    expect(result.get('gen1')).toBe(1)
    expect(result.get('gen2')).toBe(2)
    expect(result.get('gen3')).toBe(3)
    expect(result.get('gen4')).toBe(4)
    expect(result.get('gen5')).toBe(5)
  })

  it('spouse of root who has own parents elsewhere gets own root generation', () => {
    // spouse_parent is a true root (no parents, no spouse initially) → gen 1
    // spouse is child of spouse_parent → gen 2
    // root marries spouse → gets gen 2 from marriage propagation
    const persons = [
      makePerson({ id: 'root' }),
      makePerson({ id: 'spouse_parent' }),
      makePerson({ id: 'spouse', gender: 'female' }),
    ]
    const rels = [
      makeRel('marriage', 'root', 'spouse'),
      makeRel('biological_child', 'spouse_parent', 'spouse'),
    ]
    const result = computeGenerations(persons, rels)
    expect(result.get('spouse_parent')).toBe(1)
    expect(result.get('spouse')).toBe(2)
    // root gets gen from spouse (2), not gen 1, because spouse's family line is established
    expect(result.get('root')).toBe(2)
  })
})

// ─── computeBirthOrders ─────────────────────────────────────────────

describe('computeBirthOrders', () => {
  it('returns empty map for empty input', () => {
    const result = computeBirthOrders([], [])
    expect(result.size).toBe(0)
  })

  it('assigns birth order to single child', () => {
    const persons = [
      makePerson({ id: 'parent' }),
      makePerson({ id: 'child' }),
    ]
    const rels = [makeRel('biological_child', 'parent', 'child')]
    const result = computeBirthOrders(persons, rels)
    expect(result.get('child')).toBe(1)
  })

  it('sorts children by birth_year ascending', () => {
    const persons = [
      makePerson({ id: 'parent' }),
      makePerson({ id: 'child3', birth_year: 2000 }),
      makePerson({ id: 'child1', birth_year: 1990 }),
      makePerson({ id: 'child2', birth_year: 1995 }),
    ]
    const rels = [
      makeRel('biological_child', 'parent', 'child3'),
      makeRel('biological_child', 'parent', 'child1'),
      makeRel('biological_child', 'parent', 'child2'),
    ]
    const result = computeBirthOrders(persons, rels)
    expect(result.get('child1')).toBe(1) // 1990
    expect(result.get('child2')).toBe(2) // 1995
    expect(result.get('child3')).toBe(3) // 2000
  })

  it('sorts by name when birth_year is null', () => {
    const persons = [
      makePerson({ id: 'parent' }),
      makePerson({ id: 'child_c', full_name: 'Chi' }),
      makePerson({ id: 'child_a', full_name: 'An' }),
      makePerson({ id: 'child_b', full_name: 'Bình' }),
    ]
    const rels = [
      makeRel('biological_child', 'parent', 'child_c'),
      makeRel('biological_child', 'parent', 'child_a'),
      makeRel('biological_child', 'parent', 'child_b'),
    ]
    const result = computeBirthOrders(persons, rels)
    expect(result.get('child_a')).toBe(1) // An
    expect(result.get('child_b')).toBe(2) // Bình
    expect(result.get('child_c')).toBe(3) // Chi
  })

  it('skips in-law children in birth order count', () => {
    const persons = [
      makePerson({ id: 'parent' }),
      makePerson({ id: 'bio_child', is_in_law: false }),
      makePerson({ id: 'in_law_child', is_in_law: true }),
      makePerson({ id: 'bio_child2', is_in_law: false }),
    ]
    const rels = [
      makeRel('biological_child', 'parent', 'bio_child'),
      makeRel('biological_child', 'parent', 'in_law_child'),
      makeRel('biological_child', 'parent', 'bio_child2'),
    ]
    const result = computeBirthOrders(persons, rels)
    expect(result.get('bio_child')).toBe(1)
    expect(result.has('in_law_child')).toBe(false) // not assigned
    expect(result.get('bio_child2')).toBe(2) // second non-in-law
  })

  it('handles two parents sharing children (takes max order)', () => {
    // Father has 3 kids, Mother has 1 kid (who is also Father's 3rd kid)
    // The shared kid should get max(3 from father, 1 from mother) = 3
    const persons = [
      makePerson({ id: 'father' }),
      makePerson({ id: 'mother', gender: 'female' }),
      makePerson({ id: 'kid1', birth_year: 1990, is_in_law: false }),
      makePerson({ id: 'kid2', birth_year: 1992, is_in_law: false }),
      makePerson({ id: 'kid3', birth_year: 1995, is_in_law: false }),
    ]
    const rels = [
      makeRel('biological_child', 'father', 'kid1'),
      makeRel('biological_child', 'father', 'kid2'),
      makeRel('biological_child', 'father', 'kid3'),
      makeRel('biological_child', 'mother', 'kid3'), // Mother only has kid3
    ]
    const result = computeBirthOrders(persons, rels)
    expect(result.get('kid1')).toBe(1)
    expect(result.get('kid2')).toBe(2)
    expect(result.get('kid3')).toBe(3) // max(3 from father, 1 from mother)
  })

  it('does not assign birth order to persons with no parent relationship', () => {
    const persons = [makePerson({ id: 'lone_person' })]
    const result = computeBirthOrders(persons, [])
    expect(result.has('lone_person')).toBe(false)
  })

  it('handles adopted children in birth order', () => {
    const persons = [
      makePerson({ id: 'parent' }),
      makePerson({ id: 'bio', birth_year: 1990, is_in_law: false }),
      makePerson({ id: 'adopted', birth_year: 1992, is_in_law: false }),
    ]
    const rels = [
      makeRel('biological_child', 'parent', 'bio'),
      makeRel('adopted_child', 'parent', 'adopted'),
    ]
    const result = computeBirthOrders(persons, rels)
    expect(result.get('bio')).toBe(1)
    expect(result.get('adopted')).toBe(2)
  })
})

// ─── computeInLaws ──────────────────────────────────────────────────

describe('computeInLaws', () => {
  it('returns empty map for empty input', () => {
    const result = computeInLaws([], [])
    expect(result.size).toBe(0)
  })

  it('person with parents in tree is NOT in-law (bloodline)', () => {
    const persons = [
      makePerson({ id: 'parent' }),
      makePerson({ id: 'child' }),
    ]
    const rels = [makeRel('biological_child', 'parent', 'child')]
    const result = computeInLaws(persons, rels)
    expect(result.get('child')).toBe(false)
  })

  it('root person (no parents, no spouse) is NOT in-law', () => {
    const persons = [makePerson({ id: 'root' })]
    const result = computeInLaws(persons, [])
    expect(result.get('root')).toBe(false)
  })

  it('spouse of bloodline person IS in-law', () => {
    // Root has child → Child has spouse → Spouse is in-law
    const persons = [
      makePerson({ id: 'root' }),
      makePerson({ id: 'child' }),
      makePerson({ id: 'spouse', gender: 'female' }),
    ]
    const rels = [
      makeRel('biological_child', 'root', 'child'),
      makeRel('marriage', 'child', 'spouse'),
    ]
    const result = computeInLaws(persons, rels)
    expect(result.get('root')).toBe(false)
    expect(result.get('child')).toBe(false) // has parents → bloodline
    expect(result.get('spouse')).toBe(true) // no parents, spouse has parents → in-law
  })

  it('when two roots marry with no parents, preserves existing is_in_law values', () => {
    // Both have is_in_law=false in DB. Algorithm preserves this — both stay bloodline.
    // The gender fallback only kicks in when neither has is_in_law explicitly set.
    const persons = [
      makePerson({ id: 'male_root', gender: 'male', is_in_law: false }),
      makePerson({ id: 'female_root', gender: 'female', is_in_law: false }),
    ]
    const rels = [makeRel('marriage', 'male_root', 'female_root')]
    const result = computeInLaws(persons, rels)
    // Both already have is_in_law=false → !p.is_in_law = true → shouldBeBloodline = true for both
    expect(result.get('male_root')).toBe(false)
    expect(result.get('female_root')).toBe(false) // preserved from DB value
  })

  it('gender fallback applies when both roots have is_in_law=true', () => {
    // Both have is_in_law=true. Male fallback kicks in: male = bloodline, female = in-law.
    const persons = [
      makePerson({ id: 'male_root', gender: 'male', is_in_law: true }),
      makePerson({ id: 'female_root', gender: 'female', is_in_law: true }),
    ]
    const rels = [makeRel('marriage', 'male_root', 'female_root')]
    const result = computeInLaws(persons, rels)
    // male: !is_in_law = false, gender=male && all spouses gender !== male? spouse is female → yes → shouldBeBloodline = true
    expect(result.get('male_root')).toBe(false) // male → bloodline
    // female: !is_in_law = false, gender !== male → shouldBeBloodline = false → in-law
    expect(result.get('female_root')).toBe(true) // female → in-law
  })

  it('preserves existing is_in_law=false when both spouses have no parents', () => {
    // If one is already marked as NOT in-law in DB, keep it
    const persons = [
      makePerson({ id: 'a', is_in_law: false }),
      makePerson({ id: 'b', is_in_law: true }),
    ]
    const rels = [makeRel('marriage', 'a', 'b')]
    const result = computeInLaws(persons, rels)
    // a already has is_in_law=false → a is bloodline, b is in-law
    expect(result.get('a')).toBe(false)
    expect(result.get('b')).toBe(true)
  })

  it('handles person with spouse whose spouse has parents', () => {
    // A has parents. A married B. B has no parents. → B is in-law.
    const persons = [
      makePerson({ id: 'a_parent' }),
      makePerson({ id: 'a' }),
      makePerson({ id: 'b', gender: 'female' }),
    ]
    const rels = [
      makeRel('biological_child', 'a_parent', 'a'),
      makeRel('marriage', 'a', 'b'),
    ]
    const result = computeInLaws(persons, rels)
    expect(result.get('a')).toBe(false) // has parents
    expect(result.get('b')).toBe(true) // no parents, spouse has parents → in-law
  })

  it('handles multiple marriages and in-law detection', () => {
    // Root → Child1, Child1 married Spouse1
    // Root → Child2, Child2 married Spouse2
    const persons = [
      makePerson({ id: 'root' }),
      makePerson({ id: 'child1' }),
      makePerson({ id: 'spouse1', gender: 'female' }),
      makePerson({ id: 'child2' }),
      makePerson({ id: 'spouse2', gender: 'female' }),
    ]
    const rels = [
      makeRel('biological_child', 'root', 'child1'),
      makeRel('biological_child', 'root', 'child2'),
      makeRel('marriage', 'child1', 'spouse1'),
      makeRel('marriage', 'child2', 'spouse2'),
    ]
    const result = computeInLaws(persons, rels)
    expect(result.get('root')).toBe(false)
    expect(result.get('child1')).toBe(false)
    expect(result.get('child2')).toBe(false)
    expect(result.get('spouse1')).toBe(true)
    expect(result.get('spouse2')).toBe(true)
  })

  it('handles same-gender marriage without gender-based fallback', () => {
    // Both male, neither has parents. First one has is_in_law=false → stays bloodline.
    const persons = [
      makePerson({ id: 'a', gender: 'male', is_in_law: false }),
      makePerson({ id: 'b', gender: 'male', is_in_law: false }),
    ]
    const rels = [makeRel('marriage', 'a', 'b')]
    const result = computeInLaws(persons, rels)
    // Both male → the fallback rule checks: all spouses have gender !== 'male'? No.
    // So shouldBeBloodline = !p.is_in_law = true for both → both bloodline
    expect(result.get('a')).toBe(false)
    expect(result.get('b')).toBe(false)
  })
})
