// End-to-end checks for the things unit tests can't reach: multi-touch
// spawning, animation cleanup, the concurrency cap, and the parent gesture.
//
// Usage:
//   npm run build && npm run preview -- --port 4173 &
//   node scripts/verify-app.mjs
//
// Set CHROMIUM_PATH if Playwright's bundled browser isn't installed.

import { chromium } from 'playwright'

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

// 4. Parent gesture: a brief corner tap must NOT open settings.
await tapAt([{ x: 20, y: 20, pointerId: 40 }])
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
await tapAt([{ x: 20, y: 20, pointerId: 41 }])
await page.waitForTimeout(2900)
settingsVisible = await page.locator('[data-testid="settings"]').count()
record('a 2.5s corner hold opens settings', settingsVisible === 1)

// 6. Settings persist across a reload.
if (settingsVisible === 1) {
  await page.locator('.toggle__input').first().uncheck({ force: true })
  await page.waitForTimeout(100)
  const stored = await page.evaluate(() =>
    localStorage.getItem('emoji-pop:settings'),
  )
  record(
    'sound toggle persists to localStorage',
    stored?.includes('"sound":false') ?? false,
    stored ?? 'nothing stored',
  )

  await page.keyboard.press('Escape')
  await page.waitForTimeout(150)
  settingsVisible = await page.locator('[data-testid="settings"]').count()
  record('Escape closes the settings panel', settingsVisible === 0)
}

// 7. Keyboard spawns an emoji.
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
