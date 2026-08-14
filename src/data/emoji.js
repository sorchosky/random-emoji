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

/**
 * Pick a random emoji, never returning the same one twice in a row.
 *
 * Picking from a pool of n-1 and skipping over the previous index keeps the
 * distribution uniform across the remaining emoji — a retry loop would bias
 * nothing but would occasionally spin, and this runs on every single tap.
 *
 * @param {string} [previous] the emoji returned by the last call, if any
 * @returns {string} a single emoji character
 */
export function pickRandomEmoji(previous) {
  const pool = EMOJI
  if (pool.length < 2) return pool[0]

  const previousIndex = previous ? pool.indexOf(previous) : -1
  if (previousIndex === -1) {
    return pool[Math.floor(Math.random() * pool.length)]
  }

  let index = Math.floor(Math.random() * (pool.length - 1))
  if (index >= previousIndex) index += 1
  return pool[index]
}
