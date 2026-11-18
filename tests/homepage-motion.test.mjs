import assert from 'node:assert/strict'
import test from 'node:test'
import { chromium } from 'playwright-core'

const origin = new URL(process.env.TEST_BLOG_ORIGIN ?? 'http://127.0.0.1:8010')
assert.ok(['127.0.0.1', 'localhost', '[::1]'].includes(origin.hostname), 'Use a local test server')

async function openHome(browser, options, initScript) {
    const page = await browser.newPage({ viewport: { width: 390, height: 640 }, ...options })
    if (initScript) await page.addInitScript(initScript)
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

function trackBannerEntrance() {
    window.bannerEntrance = { started: 0, ended: 0 }
    document.addEventListener('animationstart', event => {
        if (event.animationName === 'backInDown') window.bannerEntrance.started++
    })
    document.addEventListener('animationend', event => {
        if (event.animationName === 'backInDown') window.bannerEntrance.ended++
    })
}

test('home page carousel and viewport animations', {
    skip: !process.env.TEST_BROWSER_PATH && 'Set TEST_BROWSER_PATH to a Chromium executable',
}, async (t) => {
    const browser = await chromium.launch({ executablePath: process.env.TEST_BROWSER_PATH })
    t.after(() => browser.close())

    await t.test('return to top follows the scroll container after resize and yields to the portal menu', async (t) => {
        const page = await openHome(browser, { viewport: { width: 1280, height: 640 } })
        t.after(() => page.close())
        const backTop = page.getByRole('button', { name: '返回顶部' })
        const layout = page.locator('#custom-layout')
        await layout.evaluate(element => element.scrollTo(0, 500))
        await backTop.waitFor()

        await layout.evaluate(element => element.scrollTo(0, 0))
        await backTop.waitFor({ state: 'hidden' })
        await page.setViewportSize({ width: 390, height: 640 })
        await page.evaluate(() => window.scrollTo(0, 500))
        await backTop.waitFor()

        const toggle = page.locator('.menubar')
        await toggle.click()
        await page.locator('[class*=menu-wrap]').waitFor()
        assert.ok(await backTop.isDisabled())
        assert.ok(await backTop.evaluate(button => {
            const { x, y, width, height } = button.getBoundingClientRect()
            return !!document.elementFromPoint(x + width / 2, y + height / 2)?.closest('[class*=menu-wrap]')
        }))

        await toggle.click()
        await backTop.click()
        await page.waitForFunction(() => window.scrollY === 0)

        await page.setViewportSize({ width: 1280, height: 640 })
        await layout.evaluate(element => element.scrollTo(0, 500))
        await backTop.waitFor()
        await backTop.click()
        await page.waitForFunction(() => document.getElementById('custom-layout').scrollTop === 0)
    })

    await t.test('the banner title starts at its animation position while the cover and scripts load', async (t) => {
        const page = await browser.newPage({ viewport: { width: 390, height: 640 }, reducedMotion: 'no-preference' })
        t.after(() => page.close())
        await page.addInitScript(trackBannerEntrance)
        let resumeLoading
        const pendingRequests = new Promise(resolve => { resumeLoading = resolve })
        await page.route('**/*', async route => {
            const request = route.request()
            const url = new URL(request.url())
            if (url.origin !== origin.origin) return route.abort()
            if (request.resourceType() === 'script' || url.searchParams.get('url')?.includes('/img_main-00.')) {
                await pendingRequests
            }
            return route.continue()
        })
        try {
            await page.goto(origin.href, { waitUntil: 'commit' })
            await page.waitForFunction(() => window.bannerEntrance.ended >= 1, null, { timeout: 5000 })
            assert.deepEqual(await page.evaluate(() => window.bannerEntrance), { started: 1, ended: 1 })
        } finally {
            resumeLoading()
        }
        await page.waitForLoadState()
        await changeCover(page)
        assert.deepEqual(await page.evaluate(() => window.bannerEntrance), { started: 1, ended: 1 })
    })

    for (const width of [390, 1280]) {
        await t.test(`the banner title enters once on first view at ${width}px`, async (t) => {
            const page = await openHome(browser, { viewport: { width, height: 640 }, reducedMotion: 'no-preference' }, trackBannerEntrance)
            t.after(() => page.close())
            await page.waitForFunction(() => window.bannerEntrance.ended >= 1)
            await changeCover(page)
            const title = page.getByText("BBF's Blog", { exact: true })
            await settleViewport(title)
            assert.deepEqual(await page.evaluate(() => window.bannerEntrance), { started: 1, ended: 1 })
            assert.ok(await title.evaluate(readable))
        })

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

    await t.test('the banner title stays visible with reduced motion', async (t) => {
        const page = await openHome(browser, { reducedMotion: 'reduce' }, trackBannerEntrance)
        t.after(() => page.close())
        await changeCover(page)
        const title = page.getByText("BBF's Blog", { exact: true })
        await settleViewport(title)
        assert.ok(await title.evaluate(readable))
        assert.deepEqual(await page.evaluate(() => window.bannerEntrance), { started: 0, ended: 0 })
    })

    for (const mode of ['normal', 'reduced', 'no JavaScript']) {
        await t.test(`the Links title is readable with ${mode} motion behavior`, async (t) => {
            const page = await openHome(browser, { javaScriptEnabled: mode !== 'no JavaScript',
                reducedMotion: mode === 'reduced' ? 'reduce' : 'no-preference' })
            t.after(() => page.close())
            const title = page.getByText('Links', { exact: true })
            if (mode === 'no JavaScript') {
                const bannerTitle = page.getByText("BBF's Blog", { exact: true })
                assert.ok(await bannerTitle.evaluate(readable))
                assert.equal(await bannerTitle.evaluate(element => getComputedStyle(element.parentElement).animationName), 'none')
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
