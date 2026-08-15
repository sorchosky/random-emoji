// Curated kid-safe emoji set.
//
// Two hard rules govern what's allowed in here, both learned from emoji
// rendering badly on older tablets:
//
// 1. Every entry is a SINGLE grapheme cluster. No ZWJ sequences (👨‍👩‍👧,
//    🧑‍🚀) — older iOS versions split those into their component glyphs, so a
//    "family" emoji shows up as a man, a woman, and a girl side by side.
//    No skin-tone modifiers, no regional-indicator flags, for the same reason.
// 2. Nothing past Unicode 12.0. Anything newer risks a tofu box (☐) on a
//    tablet that hasn't seen a system update in a while.
//
// Legacy symbols from the Miscellaneous Symbols block (☀, ⭐, ⚡…) carry an
// explicit U+FE0F variation selector so they render as color emoji rather than
// monochrome text glyphs.
//
// Deliberately excluded, per the PRD: weapons, alcohol/drugs/smoking, flags,
// hand gestures (they carry different meanings across cultures and render
// inconsistently), religious symbols, and anything medical.

export const EMOJI_CATEGORIES = {
  animals: [
    '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
    '🦁', '🐮', '🐷', '🐸', '🐵', '🙈', '🙉', '🙊', '🐔', '🐧',
    '🐦', '🐤', '🐣', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴',
    '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🐢', '🐍', '🦎',
    '🐙', '🦑', '🦐', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋',
    '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🐘', '🦏', '🐪', '🐫',
    '🦒', '🦘', '🐃', '🐄', '🐎', '🐖', '🐑', '🦙', '🐐', '🦌',
    '🐕', '🐩', '🐈', '🐓', '🦃', '🦚', '🦜', '🦢', '🐇', '🦝',
    '🦡', '🐁', '🐿', '🦔', '🦥', '🦦', '🦩',
  ],
  food: [
    '🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈',
    '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🥑', '🥦', '🥬',
    '🥒', '🌽', '🥕', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨',
    '🧀', '🥚', '🍳', '🥞', '🧇', '🍔', '🍟', '🍕', '🌭', '🥪',
    '🌮', '🌯', '🥗', '🍿', '🍱', '🍙', '🍚', '🍜', '🍝', '🍣',
    '🍤', '🍥', '🍡', '🥟', '🍦', '🍧', '🍨', '🍩', '🍪', '🎂',
    '🍰', '🧁', '🥧', '🍫', '🍬', '🍭', '🍮', '🍯', '🥛', '🧃',
  ],
  vehicles: [
    '🚗', '🚕', '🚙', '🚌', '🚎', '🏎', '🚓', '🚑', '🚒', '🚐',
    '🚚', '🚛', '🚜', '🛴', '🚲', '🛵', '🏍', '🚂', '🚃', '🚄',
    '🚅', '🚆', '🚇', '🚈', '🚉', '🚊', '🚝', '🚞', '🚋', '✈️',
    '🚀', '🛸', '🚁', '🛶', '⛵️', '🚤', '🛳', '⛴', '🚢', '🎠',
  ],
  nature: [
    '☀️', '⛅️', '☁️', '❄️', '⛄️', '🌪', '🌈', '☂️', '☔️', '⚡️',
    '🔥', '💧', '🌊', '🌙', '⭐️', '🌟', '✨', '🌍', '🌎', '🌏',
    '🌕', '🌗', '🌑', '🌓', '🌚', '🌝', '🌞', '🌛', '🌜', '🌸',
    '🌺', '🌻', '🌷', '🌹', '🌼', '💐', '🍀', '🌿', '🍃', '🌱',
    '🌳', '🌲', '🌴', '🌵', '🍄', '🌾', '🍁', '🍂', '🌰', '🐚',
  ],
  faces: [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
    '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
    '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥳',
    '🤗', '🤠', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '🤖',
    '👻', '👽', '🎃', '🤡', '🥺', '😴', '😪', '🤤',
  ],
  toys: [
    '🎈', '🎉', '🎊', '🎁', '🎀', '🧸', '🎡', '🎢', '🎪', '🎨',
    '🖍', '🎭', '🎤', '🎧', '🎵', '🎶', '🥁', '🎸', '🎹', '🎺',
    '🎻', '⚽️', '🏀', '🏈', '⚾️', '🥎', '🎾', '🏐', '🏉', '🥏',
    '🎱', '🏓', '🏸', '🏒', '🏑', '🎯', '🎮', '🕹', '🧩', '🎲',
    '🎳', '🪁', '🛹', '🎿', '⛸', '🧵', '🧶', '🔔', '💡', '🔦',
  ],
  hearts: [
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🤎', '🤍', '💕', '💞',
    '💓', '💗', '💖', '💘', '💝', '💟', '💌', '💫', '💥', '💦',
    '💤', '🔮', '🎏', '🎐',
  ],
}

/** Flat pool of every emoji, in category order. */
export const EMOJI = Object.values(EMOJI_CATEGORIES).flat()

/** Every category key, in declaration order. */
export const CATEGORY_KEYS = Object.keys(EMOJI_CATEGORIES)

/**
 * Display names and a representative glyph per category, for the parent-facing
 * picker. Lives next to the data rather than in the component so a renamed or
 * added category can't silently ship without a label — the test suite asserts
 * these keys and EMOJI_CATEGORIES' keys stay in lockstep.
 */
export const CATEGORY_META = {
  animals: { label: 'Animals', sample: '🐶' },
  food: { label: 'Food', sample: '🍎' },
  vehicles: { label: 'Vehicles', sample: '🚗' },
  nature: { label: 'Nature', sample: '🌈' },
  faces: { label: 'Faces', sample: '😀' },
  toys: { label: 'Toys', sample: '🎈' },
  hearts: { label: 'Hearts', sample: '❤️' },
}

// Memoized on the sorted key list. This runs on the tap hot path, and returning
// the *same array reference* for an unchanged selection is what keeps
// pickRandomEmoji's indexOf from walking a freshly-built array every tap.
let poolCacheKey = null
let poolCacheValue = EMOJI

/**
 * Flatten the enabled categories into a single pool.
 *
 * Unknown keys are ignored rather than throwing — a stale key left in
 * localStorage by a future rename shouldn't take the toy down.
 *
 * @param {string[]} [keys] enabled category keys
 * @returns {string[]} the emoji those categories contain, in category order
 */
export function emojiForCategories(keys) {
  if (!Array.isArray(keys)) return EMOJI

  // Filter against declaration order, not the caller's order, so the pool is
  // stable regardless of the order the parent tapped the chips in.
  const enabled = CATEGORY_KEYS.filter((key) => keys.includes(key))
  const cacheKey = enabled.join(',')
  if (cacheKey === poolCacheKey) return poolCacheValue

  poolCacheKey = cacheKey
  poolCacheValue = enabled.flatMap((key) => EMOJI_CATEGORIES[key])
  return poolCacheValue
}

/**
 * Pick a random emoji, never returning the same one twice in a row.
 *
 * Picking from a pool of n-1 and skipping over the previous index keeps the
 * distribution uniform across the remaining emoji — a retry loop would bias
 * nothing but would occasionally spin, and this runs on every single tap.
 *
 * @param {string} [previous] the emoji returned by the last call, if any
 * @param {string[]} [pool] the emoji to draw from; defaults to the whole set
 * @returns {string} a single emoji character
 */
export function pickRandomEmoji(previous, pool = EMOJI) {
  // A pool of one has no "other" emoji to pick, so the no-repeat rule can't be
  // honored — returning the single entry beats returning undefined.
  if (pool.length < 2) return pool[0]

  const previousIndex = previous ? pool.indexOf(previous) : -1
  if (previousIndex === -1) {
    return pool[Math.floor(Math.random() * pool.length)]
  }

  let index = Math.floor(Math.random() * (pool.length - 1))
  if (index >= previousIndex) index += 1
  return pool[index]
}
