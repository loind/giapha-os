import { describe, expect, it } from 'vitest'
import { buildAdjacencyLists, getFilteredTreeData } from '../treeHelpers'
import type { Person, Relationship } from '@/types'

// ─── Test Helpers ───────────────────────────────────────────────────

function makePerson(overrides: Partial<Person> & { id: string }): Person {
  return {
    full_name: 'Test User',
    gender: 'male',
    birth_year: null,
    birth_month: null,
    birth_day: null,
    death_year: null,
    death_month: null,
    death_day: null,
    avatar_url: null,
    note: null,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    death_lunar_year: null,
    death_lunar_month: null,
    death_lunar_day: null,
    is_deceased: false,
    is_in_law: false,
    birth_order: null,
    generation: null,
    other_names: null,
    ...overrides,
  }
}

function makeRel(
  type: Relationship['type'],
  personA: string,
  personB: string,
  note?: string | null,
): Relationship {
  return {
    id: `rel-${personA}-${personB}`,
    type,
    person_a: personA,
    person_b: personB,
    note: note || null,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  }
}

const noFilters = {
  hideDaughtersInLaw: false,
  hideSonsInLaw: false,
  hideDaughters: false,
  hideSons: false,
  hideMales: false,
  hideFemales: false,
}

// ─── buildAdjacencyLists ────────────────────────────────────────────

describe('buildAdjacencyLists', () => {
  it('returns empty maps for empty input', () => {
    const result = buildAdjacencyLists([], new Map())
    expect(result.spousesByPersonId.size).toBe(0)
    expect(result.childrenByPersonId.size).toBe(0)
  })

  it('builds spouse map from marriage relationships', () => {
    const husband = makePerson({ id: 'h', gender: 'male' })
    const wife = makePerson({ id: 'w', gender: 'female' })
    const personsMap = new Map([['h', husband], ['w', wife]])
    const rels = [makeRel('marriage', 'h', 'w')]

    const result = buildAdjacencyLists(rels, personsMap)

    expect(result.spousesByPersonId.get('h')).toHaveLength(1)
    expect(result.spousesByPersonId.get('h')![0].person.id).toBe('w')
    expect(result.spousesByPersonId.get('w')).toHaveLength(1)
    expect(result.spousesByPersonId.get('w')![0].person.id).toBe('h')
  })

  it('includes marriage note in spouse data', () => {
    const a = makePerson({ id: 'a' })
    const b = makePerson({ id: 'b' })
    const personsMap = new Map([['a', a], ['b', b]])
    const rels = [makeRel('marriage', 'a', 'b', 'married in 2020')]

    const result = buildAdjacencyLists(rels, personsMap)

    expect(result.spousesByPersonId.get('a')![0].note).toBe('married in 2020')
  })

  it('builds children map from biological_child relationships', () => {
    const parent = makePerson({ id: 'p' })
    const child = makePerson({ id: 'c' })
    const personsMap = new Map([['p', parent], ['c', child]])
    const rels = [makeRel('biological_child', 'p', 'c')]

    const result = buildAdjacencyLists(rels, personsMap)

    expect(result.childrenByPersonId.get('p')).toHaveLength(1)
    expect(result.childrenByPersonId.get('p')![0].id).toBe('c')
  })

  it('builds children map from adopted_child relationships', () => {
    const parent = makePerson({ id: 'p' })
    const child = makePerson({ id: 'c' })
    const personsMap = new Map([['p', parent], ['c', child]])
    const rels = [makeRel('adopted_child', 'p', 'c')]

    const result = buildAdjacencyLists(rels, personsMap)

    expect(result.childrenByPersonId.get('p')).toHaveLength(1)
  })

  it('sorts children by birth_order then birth_year', () => {
    const parent = makePerson({ id: 'p' })
    const child1 = makePerson({ id: 'c1', birth_order: 2, birth_year: 1995 })
    const child2 = makePerson({ id: 'c2', birth_order: 1, birth_year: 1990 })
    const child3 = makePerson({ id: 'c3', birth_order: null, birth_year: 2000 })
    const personsMap = new Map([
      ['p', parent],
      ['c1', child1],
      ['c2', child2],
      ['c3', child3],
    ])
    const rels = [
      makeRel('biological_child', 'p', 'c1'),
      makeRel('biological_child', 'p', 'c2'),
      makeRel('biological_child', 'p', 'c3'),
    ]

    const result = buildAdjacencyLists(rels, personsMap)
    const children = result.childrenByPersonId.get('p')!

    expect(children[0].id).toBe('c2') // birth_order 1
    expect(children[1].id).toBe('c1') // birth_order 2
    expect(children[2].id).toBe('c3') // birth_order null (Infinity)
  })

  it('handles person not in personsMap gracefully', () => {
    const parent = makePerson({ id: 'p' })
    const personsMap = new Map([['p', parent]]) // child not in map
    const rels = [makeRel('biological_child', 'p', 'missing_child')]

    const result = buildAdjacencyLists(rels, personsMap)

    // Should not crash, children array should be empty (child not found)
    expect(result.childrenByPersonId.get('p')).toHaveLength(0)
  })

  it('handles multiple marriages for same person', () => {
    const a = makePerson({ id: 'a' })
    const b = makePerson({ id: 'b' })
    const c = makePerson({ id: 'c' })
    const personsMap = new Map([
      ['a', a],
      ['b', b],
      ['c', c],
    ])
    const rels = [
      makeRel('marriage', 'a', 'b'),
      makeRel('marriage', 'a', 'c'),
    ]

    const result = buildAdjacencyLists(rels, personsMap)

    expect(result.spousesByPersonId.get('a')).toHaveLength(2)
  })
})

// ─── getFilteredTreeData ────────────────────────────────────────────

describe('getFilteredTreeData', () => {
  it('returns person with spouses and children (no filters)', () => {
    const parent = makePerson({ id: 'p' })
    const spouse = makePerson({ id: 's', gender: 'female' })
    const child = makePerson({ id: 'c', gender: 'male' })
    const personsMap = new Map([
      ['p', parent],
      ['s', spouse],
      ['c', child],
    ])
    const adj = {
      spousesByPersonId: new Map([['p', [{ person: spouse }]]]),
      childrenByPersonId: new Map([['p', [child]]]),
    }

    const result = getFilteredTreeData('p', personsMap, adj, noFilters)

    expect(result.person.id).toBe('p')
    expect(result.spouses).toHaveLength(1)
    expect(result.children).toHaveLength(1)
  })

  it('filters out daughters when hideDaughters is true', () => {
    const parent = makePerson({ id: 'p' })
    const son = makePerson({ id: 'son', gender: 'male' })
    const daughter = makePerson({ id: 'dau', gender: 'female' })
    const personsMap = new Map([['p', parent], ['son', son], ['dau', daughter]])
    const adj = {
      spousesByPersonId: new Map(),
      childrenByPersonId: new Map([['p', [son, daughter]]]),
    }

    const result = getFilteredTreeData('p', personsMap, adj, {
      ...noFilters,
      hideDaughters: true,
    })

    expect(result.children).toHaveLength(1)
    expect(result.children[0].id).toBe('son')
  })

  it('filters out sons when hideSons is true', () => {
    const parent = makePerson({ id: 'p' })
    const son = makePerson({ id: 'son', gender: 'male' })
    const daughter = makePerson({ id: 'dau', gender: 'female' })
    const personsMap = new Map([['p', parent], ['son', son], ['dau', daughter]])
    const adj = {
      spousesByPersonId: new Map(),
      childrenByPersonId: new Map([['p', [son, daughter]]]),
    }

    const result = getFilteredTreeData('p', personsMap, adj, {
      ...noFilters,
      hideSons: true,
    })

    expect(result.children).toHaveLength(1)
    expect(result.children[0].id).toBe('dau')
  })

  it('filters out males when hideMales is true', () => {
    const person = makePerson({ id: 'p' })
    const maleSpouse = makePerson({ id: 'ms', gender: 'male' })
    const femaleSpouse = makePerson({ id: 'fs', gender: 'female' })
    const personsMap = new Map([
      ['p', person],
      ['ms', maleSpouse],
      ['fs', femaleSpouse],
    ])
    const adj = {
      spousesByPersonId: new Map([['p', [{ person: maleSpouse }, { person: femaleSpouse }]]]),
      childrenByPersonId: new Map(),
    }

    const result = getFilteredTreeData('p', personsMap, adj, {
      ...noFilters,
      hideMales: true,
    })

    expect(result.spouses).toHaveLength(1)
    expect(result.spouses[0].person.id).toBe('fs')
  })

  it('filters out females when hideFemales is true', () => {
    const person = makePerson({ id: 'p' })
    const maleChild = makePerson({ id: 'mc', gender: 'male' })
    const femaleChild = makePerson({ id: 'fc', gender: 'female' })
    const personsMap = new Map([
      ['p', person],
      ['mc', maleChild],
      ['fc', femaleChild],
    ])
    const adj = {
      spousesByPersonId: new Map(),
      childrenByPersonId: new Map([['p', [maleChild, femaleChild]]]),
    }

    const result = getFilteredTreeData('p', personsMap, adj, {
      ...noFilters,
      hideFemales: true,
    })

    expect(result.children).toHaveLength(1)
    expect(result.children[0].id).toBe('mc')
  })

  it('returns empty arrays when person has no spouses or children', () => {
    const person = makePerson({ id: 'p' })
    const personsMap = new Map([['p', person]])
    const adj = {
      spousesByPersonId: new Map(),
      childrenByPersonId: new Map(),
    }

    const result = getFilteredTreeData('p', personsMap, adj, noFilters)

    expect(result.person.id).toBe('p')
    expect(result.spouses).toHaveLength(0)
    expect(result.children).toHaveLength(0)
  })
})
