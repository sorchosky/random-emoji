import { describe, it, expect } from 'vitest'
import {
  CATEGORY_KEYS,
  CATEGORY_META,
  EMOJI,
  EMOJI_CATEGORIES,
  emojiForCategories,
  pickRandomEmoji,
} from './emoji.js'

const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' })
const graphemeCount = (str) => [...segmenter.segment(str)].length

const ZWJ = '‍'
const SKIN_TONES = /[\u{1F3FB}-\u{1F3FF}]/u
const REGIONAL_INDICATOR = /[\u{1F1E6}-\u{1F1FF}]/u

// Emoji that must never reach the stage. Not exhaustive — the real defense is
// the curated list itself — but it catches an accidental paste during an edit.
const BANNED = [
  '🔪', '🗡', '🔫', '💣', '💊', '💉', '🩸', '🚬', '🍺', '🍻',
  '🍷', '🥃', '🍸', '🍾', '⚰', '💀', '☠', '🤮', '🤢', '💩',
]

describe('emoji dataset', () => {
  it('is a reasonably large pool', () => {
    expect(EMOJI.length).toBeGreaterThanOrEqual(250)
  })

  it('contains no duplicates', () => {
    expect(new Set(EMOJI).size).toBe(EMOJI.length)
  })

  it('renders every entry as a single grapheme cluster', () => {
    const multiCluster = EMOJI.filter((e) => graphemeCount(e) !== 1)
    expect(multiCluster).toEqual([])
  })

  it('uses no ZWJ sequences, skin tones, or flags', () => {
    const offenders = EMOJI.filter(
      (e) =>
        e.includes(ZWJ) || SKIN_TONES.test(e) || REGIONAL_INDICATOR.test(e),
    )
    expect(offenders).toEqual([])
  })

  it('excludes weapons, alcohol, and other non-kid-safe emoji', () => {
    const found = EMOJI.filter((e) =>
      BANNED.some((banned) => e.startsWith(banned)),
    )
    expect(found).toEqual([])
  })

  it('groups every emoji under a category', () => {
    const categorised = Object.values(EMOJI_CATEGORIES).flat().length
    expect(categorised).toBe(EMOJI.length)
  })
})

describe('CATEGORY_META', () => {
  it('has exactly one entry per EMOJI_CATEGORIES key', () => {
    expect(Object.keys(CATEGORY_META).sort()).toEqual(CATEGORY_KEYS.sort())
  })

  it('gives every category a non-empty label and sample glyph', () => {
    for (const key of CATEGORY_KEYS) {
      expect(CATEGORY_META[key].label).toBeTruthy()
      expect(CATEGORY_META[key].sample).toBeTruthy()
    }
  })
})

describe('emojiForCategories', () => {
  it('returns exactly one category untouched', () => {
    expect(emojiForCategories(['food'])).toEqual(EMOJI_CATEGORIES.food)
  })

  it('flattens multiple categories in declaration order', () => {
    const pool = emojiForCategories(['hearts', 'animals'])
    expect(pool).toEqual([...EMOJI_CATEGORIES.animals, ...EMOJI_CATEGORIES.hearts])
  })

  it('ignores unknown keys', () => {
    expect(emojiForCategories(['food', 'not-a-category'])).toEqual(EMOJI_CATEGORIES.food)
  })

  it('returns an empty pool for an empty selection', () => {
    expect(emojiForCategories([])).toEqual([])
  })

  it('falls back to the full set for non-array input', () => {
    expect(emojiForCategories(undefined)).toEqual(EMOJI)
  })
})

describe('pickRandomEmoji', () => {
  it('always returns an emoji from the pool', () => {
    for (let i = 0; i < 500; i++) {
      expect(EMOJI).toContain(pickRandomEmoji())
    }
  })

  it('never repeats the previous emoji across 1000 draws', () => {
    let previous = pickRandomEmoji()
    for (let i = 0; i < 1000; i++) {
      const next = pickRandomEmoji(previous)
      expect(next).not.toBe(previous)
      previous = next
    }
  })

  it('still returns something when the previous emoji is unknown', () => {
    expect(EMOJI).toContain(pickRandomEmoji('not-an-emoji'))
  })

  it('spreads draws across the pool rather than favouring one emoji', () => {
    const counts = new Map()
    let previous
    for (let i = 0; i < 20000; i++) {
      previous = pickRandomEmoji(previous)
      counts.set(previous, (counts.get(previous) ?? 0) + 1)
    }
    // Every emoji should show up, and none should dominate.
    expect(counts.size).toBe(EMOJI.length)
    const expected = 20000 / EMOJI.length
    for (const count of counts.values()) {
      expect(count).toBeLessThan(expected * 3)
    }
  })

  it('never returns outside a narrowed pool', () => {
    const pool = EMOJI_CATEGORIES.food
    let previous
    for (let i = 0; i < 500; i++) {
      previous = pickRandomEmoji(previous, pool)
      expect(pool).toContain(previous)
    }
  })

  it('still returns something when previous is outside the narrowed pool', () => {
    const pool = EMOJI_CATEGORIES.food
    expect(pool).toContain(pickRandomEmoji(EMOJI_CATEGORIES.animals[0], pool))
  })

  it('returns the sole entry for a pool of one', () => {
    expect(pickRandomEmoji(undefined, ['🍎'])).toBe('🍎')
  })
})
