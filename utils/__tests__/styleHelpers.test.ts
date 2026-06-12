import { describe, expect, it } from 'vitest'
import { getAvatarBg } from '../styleHelprs'

describe('getAvatarBg', () => {
  it('returns sky gradient for male', () => {
    expect(getAvatarBg('male')).toBe('bg-linear-to-br from-sky-400 to-sky-500')
  })

  it('returns rose gradient for female', () => {
    expect(getAvatarBg('female')).toBe('bg-linear-to-br from-rose-400 to-rose-500')
  })

  it('returns stone gradient for other/unknown', () => {
    expect(getAvatarBg('other')).toBe('bg-linear-to-br from-stone-400 to-stone-500')
    expect(getAvatarBg('')).toBe('bg-linear-to-br from-stone-400 to-stone-500')
    expect(getAvatarBg('unknown')).toBe('bg-linear-to-br from-stone-400 to-stone-500')
  })
})
