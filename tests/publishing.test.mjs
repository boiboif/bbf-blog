import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import test from 'node:test'

// Run against a local production build backed by a disposable database.
const origin = new URL(process.env.TEST_BLOG_ORIGIN ?? 'http://127.0.0.1:8010')
assert.ok(['127.0.0.1', 'localhost', '[::1]'].includes(origin.hostname), 'Use a local test server')

async function api(path, { method = 'GET', token, data } = {}) {
    const headers = { 'Content-Type': 'application/json' }
    if (token) headers.Authorization = token
    const res = await fetch(new URL(path, origin), { method, headers, body: JSON.stringify(data) })
    assert.ok(res.ok, `${method} ${path} returned HTTP ${res.status}`)
    const result = await res.json()
    assert.equal(result.success, true, result.message)
    return result.data
}

async function html(path) {
    const res = await fetch(new URL(path, origin))
    assert.equal(res.status, 200, path)
    return (await res.text()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
}

test('publishing refreshes the public pages and preserves independent article views', async (t) => {
    const password = process.env.TEST_ADMIN_PASSWORD
    assert.ok(password, 'Set TEST_ADMIN_PASSWORD for the disposable database')
    const { token } = await api('/api/login', {
        method: 'POST', data: { username: process.env.TEST_ADMIN_USERNAME ?? 'admin', password },
    })
    const label = randomUUID()
    const fixtures = []
    async function create(path, data) {
        const item = await api(path, { method: 'POST', token, data })
        fixtures.push({ path, id: item.id })
        return item
    }
    try {
        const articles = []
        for (const suffix of ['A', 'B']) {
            const name = `${label}-${suffix}`
            const cate = await create('/api/cate', { name: `Category-${name}` })
            const tag = await create('/api/tag', { name: `Tag-${name}` })
            const post = await create('/api/post', {
                title: name, content: `## Heading-${name}\n\nBody-${name}`,
                cateId: cate.id, tags: [tag.id],
            })
            articles.push(post)
            assert.ok((await html(`/article/${post.id}`)).includes(`Body-${name}`))
        }

        const [first, second] = articles
        const summaries = await api('/api/post')
        assert.ok(summaries.some(item => item.id === first.id))
        assert.ok(summaries.every(item => !('content' in item)))
        for (const path of ['/', '/category', '/tag']) {
            const page = await html(path)
            assert.ok(page.includes(first.title), path)
            assert.ok(page.includes(second.title), path)
        }

        await t.test('desktop and mobile readers can navigate and hydrate the same articles', {
            skip: !process.env.TEST_BROWSER_PATH && 'Set TEST_BROWSER_PATH to a Chromium executable for browser checks',
        }, async () => {
            const { chromium } = await import('playwright-core')
            const browser = await chromium.launch({ executablePath: process.env.TEST_BROWSER_PATH })
            try {
                for (const width of [1280, 390]) {
                    const page = await browser.newPage({ viewport: { width, height: 850 } })
                    const errors = []
                    page.on('pageerror', error => errors.push(error.message))
                    for (const article of articles) {
                        await page.goto(new URL(`/category?cateId=${article.cateId}`, origin).href)
                        const path = `/article/${article.id}`
                        await page.waitForFunction(expected => {
                            const links = document.querySelectorAll('a[href^="/article/"]')
                            return links.length === 1 && links[0].getAttribute('href') === expected
                        }, path)
                        const title = page.locator(`a[href="${path}"]`).getByText(article.title, { exact: true })
                        await Promise.all([page.waitForURL(new URL(path, origin).href), title.click()])
                        await page.locator('.markdown-body').getByText(`Body-${article.title}`, { exact: true }).waitFor()
                        assert.ok((await page.title()).includes(article.title))
                    }
                    assert.deepEqual(errors, [])
                    await page.close()
                }
                const page = await browser.newPage({ javaScriptEnabled: false })
                await page.goto(new URL(`/article/${first.id}`, origin).href)
                assert.ok(await page.locator('.markdown-body').getByText(`Body-${first.title}`).isVisible())
                // The server-rendered tag row relies on Ant Design's stylesheet.
                assert.equal(await page.locator('.ant-space').first().evaluate(el => getComputedStyle(el).display), 'inline-flex')
            } finally {
                await browser.close()
            }
        })

        const before = await api(`/api/post/${first.id}`)
        const viewed = await api(`/api/post/${first.id}/view`, { method: 'POST' })
        assert.equal(viewed.viewCount, before.viewCount + 1)
        const detail = await api(`/api/post/${first.id}`)
        assert.equal(detail.viewCount, viewed.viewCount)

        const title = `Updated-${label}`
        await api('/api/post', { method: 'PUT', token, data: { id: first.id, title } })
        assert.ok((await html(`/article/${first.id}`)).includes(title))
        assert.ok((await html('/')).includes(title))
        await api('/api/post', { method: 'DELETE', token, data: { id: first.id } })
        fixtures.splice(fixtures.findIndex(item => item.path === '/api/post' && item.id === first.id), 1)
        assert.equal((await fetch(new URL(`/article/${first.id}`, origin))).status, 404)
        assert.ok(!(await html('/')).includes(title))
    } finally {
        // Remove each article before its related tag and category.
        const errors = []
        for (const { path, id } of fixtures.reverse()) {
            try { await api(path, { method: 'DELETE', token, data: { id } }) }
            catch (error) { errors.push(error) }
        }
        if (errors.length) throw new AggregateError(errors, 'Test fixture cleanup failed')
    }
})
