import assert from 'node:assert/strict'
import test from 'node:test'
import { chromium } from 'playwright-core'

const origin = new URL(process.env.TEST_BLOG_ORIGIN ?? 'http://127.0.0.1:8010')
assert.ok(['127.0.0.1', 'localhost', '[::1]'].includes(origin.hostname), 'Use a local test server')

async function openHome(browser, options) {
    const page = await browser.newPage({ viewport: { width: 390, height: 640 }, ...options })
    await page.route('**/*', route => new URL(route.request().url()).origin === origin.origin ? route.continue() : route.abort())
    await page.goto(origin.href)
    return page
}

async function changeCover(page) {
    const inactive = page.getByRole('button', { name: /^切换到第 \d+ 张封面$/, pressed: false }).first()
    const name = await inactive.getAttribute('aria-label')
    await page.getByRole('button', { name, exact: true }).click()
    await page.getByRole('button', { name, exact: true, pressed: true }).waitFor()
}

// Give intersection callbacks and style changes time to reach the next paint.
async function settleViewport(locator) {
    await locator.evaluate(async element => {
        await new Promise(resolve => {
            const observer = new IntersectionObserver(() => { observer.disconnect(); resolve() })
            observer.observe(element)
        })
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))
    })
}

const readable = element => element.checkVisibility({ opacityProperty: true, visibilityProperty: true })
const center = element => element.scrollIntoView({ block: 'center', behavior: 'instant' })

test('home page carousel and viewport animations', {
    skip: !process.env.TEST_BROWSER_PATH && 'Set TEST_BROWSER_PATH to a Chromium executable',
}, async (t) => {
    const browser = await chromium.launch({ executablePath: process.env.TEST_BROWSER_PATH })
    t.after(() => browser.close())

    for (const width of [390, 1280]) {
        await t.test(`switching the cover fits the page at ${width}px throughout the transition`, async (t) => {
            const page = await openHome(browser, { viewport: { width, height: 640 } })
            t.after(() => page.close())
            await page.evaluate(() => {
                const viewport = document.documentElement
                window.coverWidths = { before: viewport.scrollWidth, max: viewport.scrollWidth, sampling: true }
                function sample() {
                    window.coverWidths.max = Math.max(window.coverWidths.max, viewport.scrollWidth)
                    if (window.coverWidths.sampling) requestAnimationFrame(sample)
                }
                sample()
            })
            await changeCover(page)
            const result = await page.evaluate(async () => {
                const animations = document.getAnimations().filter(animation => {
                    const target = animation.effect?.target
                    return target instanceof HTMLImageElement && animation.effect.getTiming().iterations !== Infinity
                })
                await Promise.allSettled(animations.map(animation => animation.finished))
                window.coverWidths.sampling = false
                const viewport = document.documentElement
                return { before: window.coverWidths.before, during: window.coverWidths.max, after: viewport.scrollWidth,
                    available: viewport.clientWidth, animated: animations.length > 0 }
            })
            assert.ok(result.animated, 'The selected cover image should animate')
            assert.ok(Math.max(result.before, result.during, result.after) <= result.available + 1,
                `Viewport ${result.available}px; page before/during/after: ${result.before}/${result.during}/${result.after}px`)
        })
    }

    for (const mode of ['normal', 'reduced', 'no JavaScript']) {
        await t.test(`the Links title is readable with ${mode} motion behavior`, async (t) => {
            const page = await openHome(browser, { javaScriptEnabled: mode !== 'no JavaScript',
                reducedMotion: mode === 'reduced' ? 'reduce' : 'no-preference' })
            t.after(() => page.close())
            const title = page.getByText('Links', { exact: true })
            if (mode === 'no JavaScript') {
                assert.ok(await title.evaluate(readable), 'Server-rendered title is visible without hydration')
                await title.evaluate(center)
                assert.ok(await title.evaluate(el => {
                    const bounds = el.getBoundingClientRect()
                    return bounds.top >= 0 && bounds.bottom <= innerHeight
                }))
                assert.ok(await title.evaluate(readable))
                return
            }
            // A working control confirms hydration before inspecting the offscreen state.
            await changeCover(page)
            await settleViewport(title)
            assert.ok(await title.evaluate(el => el.getBoundingClientRect().top >= innerHeight), 'Title must start below the fold')
            assert.equal(await title.evaluate(readable), mode !== 'normal', 'Offscreen title visibility')
            await title.evaluate(el => {
                window.titleAnimations = { started: 0, ended: 0 }
                el.addEventListener('animationstart', event => { if (event.target === el) window.titleAnimations.started++ })
                el.addEventListener('animationend', event => { if (event.target === el) window.titleAnimations.ended++ })
            })
            // A sliver appearing at the bottom should not spend the one-shot entrance.
            await title.evaluate(el => window.scrollBy({ top: el.getBoundingClientRect().top - innerHeight + 2, behavior: 'instant' }))
            await settleViewport(title)
            const sliver = await title.evaluate(el => innerHeight - el.getBoundingClientRect().top)
            assert.ok(sliver > 0 && sliver <= 3, `Expected a sliver of the title, saw ${sliver}px`)
            assert.equal(await page.evaluate(() => window.titleAnimations.started), 0)
            await title.evaluate(center)
            await settleViewport(title)
            if (mode === 'normal') await page.waitForFunction(() => window.titleAnimations.ended >= 1, null, { timeout: 5000 })
            assert.ok(await title.evaluate(readable), 'Title is readable after entering the viewport')
            await page.getByText("BBF's Blog", { exact: true }).evaluate(center)
            await settleViewport(title)
            assert.ok(await title.evaluate(el => el.getBoundingClientRect().top >= innerHeight), 'Title left the viewport')
            await title.evaluate(center)
            await settleViewport(title)
            assert.equal(await page.evaluate(() => window.titleAnimations.started), mode === 'normal' ? 1 : 0)
            assert.ok(await title.evaluate(readable), 'Title stays readable on the second visit')
        })
    }
})
