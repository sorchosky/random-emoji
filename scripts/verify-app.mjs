// End-to-end checks for the things unit tests can't reach: multi-touch
// spawning, animation cleanup, the concurrency cap, and the parent gesture.
//
// Usage:
//   npm run build && npm run preview -- --port 4173 &
//   node scripts/verify-app.mjs
//
// Set CHROMIUM_PATH if Playwright's bundled browser isn't installed.

import { chromium } from 'playwright'
import { EMOJI_CATEGORIES } from '../src/data/emoji.js'

const BASE_URL = process.env.BASE_URL || 'http://localhost:4173'
const MAX_ON_SCREEN = 40

const results = []
const record = (name, passed, detail = '') => {
  results.push({ name, passed, detail })
  console.log(`${passed ? '  PASS' : '  FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)
}

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
})
const page = await browser.newPage({
  viewport: { width: 820, height: 1180 },
  hasTouch: true,
})

const consoleProblems = []
page.on('console', (msg) => {
  if (msg.type() === 'error' || msg.type() === 'warning') {
    consoleProblems.push(`${msg.type()}: ${msg.text()}`)
  }
})
page.on('pageerror', (err) => consoleProblems.push(`pageerror: ${err.message}`))

await page.goto(BASE_URL, { waitUntil: 'networkidle' })

const countEmoji = () => page.locator('[data-testid="emoji"]').count()

// Dispatch real PointerEvents so each finger carries its own pointerId,
// which is what the multi-touch path actually keys off.
const tapAt = (points) =>
  page.evaluate((pts) => {
    const stage = document.querySelector('[data-testid="stage"]')
    pts.forEach((p, i) => {
      stage.dispatchEvent(
        new PointerEvent('pointerdown', {
          bubbles: true,
          cancelable: true,
          pointerId: p.pointerId ?? i + 1,
          clientX: p.x,
          clientY: p.y,
          pointerType: 'touch',
          isPrimary: i === 0,
        }),
      )
    })
  }, points)

console.log('\nEmoji Pop — end-to-end verification\n')

// 1. A single tap spawns exactly one emoji.
await tapAt([{ x: 400, y: 500 }])
await page.waitForTimeout(120)
let count = await countEmoji()
record('single tap spawns one emoji', count === 1, `saw ${count}`)

await page.waitForTimeout(3200)
count = await countEmoji()
record('emoji clears itself after the animation', count === 0, `saw ${count}`)

// 2. Five simultaneous fingers spawn five independent emoji.
await tapAt([
  { x: 150, y: 300, pointerId: 11 },
  { x: 300, y: 400, pointerId: 12 },
  { x: 450, y: 500, pointerId: 13 },
  { x: 600, y: 600, pointerId: 14 },
  { x: 700, y: 700, pointerId: 15 },
])
await page.waitForTimeout(150)
count = await countEmoji()
record('five simultaneous fingers spawn five emoji', count === 5, `saw ${count}`)

await page.screenshot({ path: 'scripts/.verify-screenshot.png' })

await page.waitForTimeout(3200)

// 3. A sustained mash never exceeds the concurrency cap.
let peak = 0
for (let i = 0; i < 60; i++) {
  await tapAt([{ x: 100 + ((i * 37) % 600), y: 200 + ((i * 53) % 700) }])
  const current = await countEmoji()
  if (current > peak) peak = current
}
record(
  `concurrent emoji stay at or under the ${MAX_ON_SCREEN} cap`,
  peak <= MAX_ON_SCREEN,
  `peak ${peak}`,
)

await page.waitForTimeout(3400)
count = await countEmoji()
record('stage drains back to empty after the burst', count === 0, `saw ${count}`)

// The hold zone lives in the top-right now, mirroring the visible menu button.
const { width: viewportWidth } = page.viewportSize()
const cornerX = viewportWidth - 50

// 4. Parent gesture: a brief corner tap must NOT open settings.
await tapAt([{ x: cornerX, y: 20, pointerId: 40 }])
await page.evaluate(() => {
  document.querySelector('[data-testid="stage"]').dispatchEvent(
    new PointerEvent('pointerup', { bubbles: true, pointerId: 40 }),
  )
})
await page.waitForTimeout(2800)
let settingsVisible = await page.locator('[data-testid="settings"]').count()
record('a quick corner tap does not open settings', settingsVisible === 0)

await page.waitForTimeout(3000)

// 5. Parent gesture: a sustained corner hold DOES open settings.
await tapAt([{ x: cornerX, y: 20, pointerId: 41 }])
await page.waitForTimeout(2900)
settingsVisible = await page.locator('[data-testid="settings"]').count()
record('a 2.5s corner hold opens settings', settingsVisible === 1)

if (settingsVisible === 1) {
  await page.keyboard.press('Escape')
  await page.waitForTimeout(150)
  settingsVisible = await page.locator('[data-testid="settings"]').count()
  record('Escape closes the settings panel', settingsVisible === 0)
}

// 6. The visible menu button also opens settings.
await page.locator('.menu-button').click()
await page.waitForTimeout(150)
settingsVisible = await page.locator('[data-testid="settings"]').count()
record('the menu button opens settings', settingsVisible === 1)

// 7. Deselecting every category disables the primary button and blocks Esc.
if (settingsVisible === 1) {
  await page.getByRole('button', { name: 'Deselect all', exact: true }).click()
  await page.waitForTimeout(50)
  const closeDisabled = await page.locator('.settings__close').isDisabled()
  record('deselecting every category disables the primary button', closeDisabled)

  await page.keyboard.press('Escape')
  await page.waitForTimeout(150)
  settingsVisible = await page.locator('[data-testid="settings"]').count()
  record('Escape does not close with zero categories selected', settingsVisible === 1)

  // 8. Selecting only Food and committing narrows what spawns.
  await page.locator('.category-chip', { hasText: 'Food' }).click()
  await page.waitForTimeout(50)
  await page.locator('.settings__close').click()
  await page.waitForTimeout(150)
  settingsVisible = await page.locator('[data-testid="settings"]').count()
  record('the primary button closes settings once a category is selected', settingsVisible === 0)

  const stored = await page.evaluate(() =>
    localStorage.getItem('emoji-pop:settings'),
  )
  record(
    'category selection persists to localStorage',
    stored?.includes('"categories":["food"]') ?? false,
    stored ?? 'nothing stored',
  )

  await page.waitForTimeout(3200)
  const spawned = new Set()
  for (let i = 0; i < 20; i++) {
    await tapAt([{ x: 200 + i, y: 300, pointerId: 100 + i }])
    await page.waitForTimeout(20)
  }
  const glyphs = await page.locator('.emoji__glyph').allTextContents()
  glyphs.forEach((g) => spawned.add(g))
  const outOfPool = [...spawned].filter((g) => !EMOJI_CATEGORIES.food.includes(g))
  record(
    '20 taps with only Food selected spawn only food emoji',
    outOfPool.length === 0,
    outOfPool.join(' '),
  )

  // Restore every category so later checks aren't left running on a narrowed pool.
  await page.locator('.menu-button').click()
  await page.waitForTimeout(150)
  await page.getByRole('button', { name: 'Select all', exact: true }).click()
  await page.waitForTimeout(50)
  await page.locator('.settings__close').click()
  await page.waitForTimeout(150)

  // Closing returns focus to the menu button that reopened it — correct, since
  // EmojiStage deliberately ignores Space/Enter while a real control has focus.
  // Blur it so the next check exercises the ordinary "nothing focused" case.
  await page.evaluate(() => document.activeElement.blur())
}

// 9. Keyboard spawns an emoji.
await page.waitForTimeout(3200)
await page.keyboard.press('Space')
await page.waitForTimeout(150)
count = await countEmoji()
record('spacebar spawns an emoji', count === 1, `saw ${count}`)

record(
  'no console errors or warnings',
  consoleProblems.length === 0,
  consoleProblems.join(' | '),
)

await browser.close()

const failed = results.filter((r) => !r.passed)
console.log(
  `\n${results.length - failed.length}/${results.length} checks passed\n`,
)
process.exit(failed.length === 0 ? 0 : 1)
