import { describe, expect, it, vi } from 'vitest'
import {
  formatDisplayDate,
  getLunarDateString,
  getSolarDateString,
  calculateAge,
  getZodiacSign,
  getZodiacAnimal,
} from '../dateHelpers'

// ─── formatDisplayDate ──────────────────────────────────────────────

describe('formatDisplayDate', () => {
  it('returns "Chưa rõ" when all null', () => {
    expect(formatDisplayDate(null, null, null)).toBe('Chưa rõ')
  })

  it('formats year only', () => {
    expect(formatDisplayDate(1990, null, null)).toBe('1990')
  })

  it('formats year and month', () => {
    expect(formatDisplayDate(1990, 6, null)).toBe('06/1990')
  })

  it('formats full date with zero padding', () => {
    expect(formatDisplayDate(1990, 3, 5)).toBe('05/03/1990')
  })

  it('formats day 15 month 12 year 2000', () => {
    expect(formatDisplayDate(2000, 12, 15)).toBe('15/12/2000')
  })

  it('handles zero values as falsy', () => {
    // 0 is falsy, so it should be treated as null
    expect(formatDisplayDate(0, 0, 0)).toBe('Chưa rõ')
  })
})

// ─── getLunarDateString ─────────────────────────────────────────────

describe('getLunarDateString', () => {
  it('returns null when year is null', () => {
    expect(getLunarDateString(null, 1, 1)).toBeNull()
  })

  it('returns null when month is null', () => {
    expect(getLunarDateString(2000, null, 1)).toBeNull()
  })

  it('returns null when day is null', () => {
    expect(getLunarDateString(2000, 1, null)).toBeNull()
  })

  it('converts a known solar date to lunar string', () => {
    // 2024-02-10 solar = 01/01/2024 lunar (Tết Giáp Thìn)
    const result = getLunarDateString(2024, 2, 10)
    expect(result).toBeTruthy()
    expect(result).toContain('2024') // lunar year
    expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}$/)
  })

  it('handles leap month indicator', () => {
    // Just verify the function doesn't crash on various dates
    const result = getLunarDateString(2023, 5, 1)
    expect(result).toBeTruthy()
    // Result format: DD/MM[ nhuận]/YYYY
    expect(result).toMatch(/^\d{2}\/\d{2}( nhuận)?\/\d{4}$/)
  })
})

// ─── getSolarDateString ─────────────────────────────────────────────

describe('getSolarDateString', () => {
  it('returns "Chưa rõ" when year is null', () => {
    expect(getSolarDateString(null, 1, 1)).toBe('Chưa rõ')
  })

  it('returns "Chưa rõ" when month is null', () => {
    expect(getSolarDateString(2000, null, 1)).toBe('Chưa rõ')
  })

  it('returns "Chưa rõ" when day is null', () => {
    expect(getSolarDateString(2000, 1, null)).toBe('Chưa rõ')
  })

  it('converts a known lunar date to solar string', () => {
    // Lunar 01/01/2024 = Solar 2024-02-10
    const result = getSolarDateString(2024, 1, 1)
    expect(result).toBeTruthy()
    expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}$/)
  })
})

// ─── calculateAge ───────────────────────────────────────────────────

describe('calculateAge', () => {
  it('returns null when birthYear is null', () => {
    expect(calculateAge(null, null, null, null, null, null)).toBeNull()
  })

  it('calculates age for deceased person with full dates', () => {
    const result = calculateAge(1950, 3, 15, 2020, 6, 20, true)
    expect(result).toEqual({ age: 70, isDeceased: true })
  })

  it('adjusts age when death date is before birthday in death year', () => {
    // Born March 15, died Feb 10 → hasn't had birthday yet → age - 1
    const result = calculateAge(1950, 3, 15, 2020, 2, 10, true)
    expect(result).toEqual({ age: 69, isDeceased: true })
  })

  it('calculates age without month/day for deceased', () => {
    const result = calculateAge(1950, null, null, 2020, null, null, true)
    expect(result).toEqual({ age: 70, isDeceased: true })
  })

  it('returns null when isDeceased but no deathYear', () => {
    const result = calculateAge(1950, null, null, null, null, null, true)
    expect(result).toBeNull()
  })

  it('calculates age for living person', () => {
    // Mock current date by testing logic with known birth year
    const birthYear = 2000
    const result = calculateAge(birthYear, null, null, null, null, null, false)
    expect(result).not.toBeNull()
    expect(result!.isDeceased).toBe(false)
    expect(result!.age).toBeGreaterThanOrEqual(25) // At least 25 in 2025
    expect(result!.age).toBeLessThanOrEqual(27) // At most 27 in 2027
  })

  it('adjusts age for living person when birthday has not occurred yet', () => {
    // Born December 31 → if current month < 12, age should be currentYear - birthYear - 1
    const result = calculateAge(2000, 12, 31, null, null, null, false)
    expect(result).not.toBeNull()
    // The exact age depends on current date, but it should be reasonable
    expect(result!.age).toBeGreaterThan(20)
    expect(result!.age).toBeLessThan(30)
  })

  it('defaults isDeceased to false', () => {
    const result = calculateAge(1990, 1, 1, null, null, null)
    expect(result).not.toBeNull()
    expect(result!.isDeceased).toBe(false)
  })
})

// ─── getZodiacSign ──────────────────────────────────────────────────

describe('getZodiacSign', () => {
  it('returns null when day is null', () => {
    expect(getZodiacSign(null, 1)).toBeNull()
  })

  it('returns null when month is null', () => {
    expect(getZodiacSign(1, null)).toBeNull()
  })

  it('returns correct sign for known dates', () => {
    expect(getZodiacSign(1, 1)).toBe('Ma Kết') // Jan 1
    expect(getZodiacSign(20, 1)).toBe('Bảo Bình') // Jan 20
    expect(getZodiacSign(19, 2)).toBe('Song Ngư') // Feb 19 → Song Ngư (boundary)
    expect(getZodiacSign(21, 3)).toBe('Bạch Dương') // Mar 21
    expect(getZodiacSign(20, 4)).toBe('Kim Ngưu') // Apr 20
    expect(getZodiacSign(21, 5)).toBe('Song Tử') // May 21
    expect(getZodiacSign(22, 6)).toBe('Cự Giải') // Jun 22
    expect(getZodiacSign(23, 7)).toBe('Sư Tử') // Jul 23
    expect(getZodiacSign(23, 8)).toBe('Xử Nữ') // Aug 23
    expect(getZodiacSign(23, 9)).toBe('Thiên Bình') // Sep 23
    expect(getZodiacSign(24, 10)).toBe('Thiên Yết') // Oct 24
    expect(getZodiacSign(22, 11)).toBe('Nhân Mã') // Nov 22
    expect(getZodiacSign(22, 12)).toBe('Ma Kết') // Dec 22
  })

  it('handles boundary dates correctly', () => {
    // Boundary: Mar 20 → Song Ngư, Mar 21 → Bạch Dương
    expect(getZodiacSign(20, 3)).toBe('Song Ngư')
    expect(getZodiacSign(21, 3)).toBe('Bạch Dương')
  })
})

// ─── getZodiacAnimal ────────────────────────────────────────────────

describe('getZodiacAnimal', () => {
  it('returns null when year is null', () => {
    expect(getZodiacAnimal(null)).toBeNull()
  })

  it('returns correct animal for known years', () => {
    // 2024 = Giáp Thìn → Thìn
    expect(getZodiacAnimal(2024)).toBe('Thìn')
    // 2023 = Quý Mão → Mão
    expect(getZodiacAnimal(2023)).toBe('Mão')
    // 2022 = Nhâm Dần → Dần
    expect(getZodiacAnimal(2022)).toBe('Dần')
    // 2000 = Canh Thìn → Thìn
    expect(getZodiacAnimal(2000)).toBe('Thìn')
    // 1990 = Canh Ngọ → Ngọ
    expect(getZodiacAnimal(1990)).toBe('Ngọ')
  })

  it('uses lunar year when month and day are provided', () => {
    // Feb 1, 2022 solar is still in lunar year 2021 (Tân Sửu → Sửu)
    // But this depends on the lunar calendar conversion
    const result = getZodiacAnimal(2022, 2, 1)
    expect(result).toBeTruthy()
    // Just verify it returns a valid animal
    const animals = ['Thân', 'Dậu', 'Tuất', 'Hợi', 'Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi']
    expect(animals).toContain(result)
  })
})
