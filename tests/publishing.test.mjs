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
    const { token, id: userId } = await api('/api/login', {
        method: 'POST', data: { username: process.env.TEST_ADMIN_USERNAME ?? 'admin', password },
    })
    const label = randomUUID()
    const fixtures = []
    async function create(path, data) {
        const item = await api(path, { method: 'POST', token, data })
        fixtures.push({ path, id: item.id })
        return item
    }
    async function remove(path, id) {
        await api(path, { method: 'DELETE', token, data: { id } })
        fixtures.splice(fixtures.findIndex(item => item.path === path && item.id === id), 1)
    }
    try {
        const articles = []
        for (const suffix of ['A', 'B']) {
            const name = `${label}-${suffix}`
            const cate = await create('/api/cate', { name: `Category-${name}` })
            const tag = await create('/api/tag', { name: `Tag-${name}` })
            const content = [
                `## Heading-${name}`, `Body-${name}`, '[Article link](/category)',
                '```js\nconst answer = 42\n```', '![Cover illustration](/img/avatar.jpg)',
            ].join('\n\n')
            const post = await create('/api/post', {
                title: name, content,
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

        await t.test('Markdown stays legible in both themes in the editor and the published article', {
            skip: !process.env.TEST_BROWSER_PATH && 'Set TEST_BROWSER_PATH for browser checks',
        }, async () => {
            const { chromium } = await import('playwright-core')
            const browser = await chromium.launch({ executablePath: process.env.TEST_BROWSER_PATH })
            try {
                const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
                await page.addInitScript(session => {
                    localStorage.setItem('userId', String(session.userId))
                    localStorage.setItem('token', session.token)
                }, { userId, token })

                async function checkPreview(markdown) {
                    await markdown.getByText(`Body-${first.title}`, { exact: true }).waitFor()
                    const image = markdown.getByRole('img', { name: 'Cover illustration' })
                    await image.evaluate(img => img.decode())
                    for (const theme of ['light', 'dark']) {
                        await page.emulateMedia({ colorScheme: theme })
                        const palette = await markdown.evaluate(root => {
                            const luminance = color => {
                                const [r, g, b] = color.match(/[\d.]+/g).slice(0, 3).map(Number).map(channel => {
                                    const value = channel / 255
                                    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
                                })
                                return r * 0.2126 + g * 0.7152 + b * 0.0722
                            }
                            const style = getComputedStyle(root)
                            const background = luminance(style.backgroundColor)
                            const contrast = color => {
                                const text = luminance(color)
                                return (Math.max(text, background) + 0.05) / (Math.min(text, background) + 0.05)
                            }
                            return { background: style.backgroundColor, light: background > 0.5,
                                textContrast: contrast(style.color), linkContrast: contrast(getComputedStyle(root.querySelector('a')).color) }
                        })
                        assert.notEqual(palette.background, 'rgba(0, 0, 0, 0)', 'Markdown needs an explicit surface in both themes')
                        assert.equal(palette.light, theme === 'light')
                        assert.ok(palette.textContrast >= 4.5 && palette.linkContrast >= 4.5, `${theme} ${JSON.stringify(palette)}`)
                    }
                }

                await page.goto(new URL(`/article/${first.id}`, origin).href)
                await checkPreview(page.locator('.markdown-body'))
                await page.goto(new URL('/manager/article', origin).href)
                await page.getByRole('row').filter({ hasText: first.title }).getByText('编辑', { exact: true }).click()
                await checkPreview(page.locator('.bytemd-preview .markdown-body'))
            } finally {
                await browser.close()
            }
        })

        const before = await api(`/api/post/${first.id}`)
        const viewed = await api(`/api/post/${first.id}/view`, { method: 'POST' })
        assert.equal(viewed.viewCount, before.viewCount + 1)
        const detail = await api(`/api/post/${first.id}`)
        assert.equal(detail.viewCount, viewed.viewCount)

        await t.test('taxonomy updates refresh already cached article pages', async () => {
            const firstPath = `/article/${first.id}`
            const secondPath = `/article/${second.id}`
            const originalCategoryName = `Category-${label}-A`
            assert.ok((await html(firstPath)).includes(originalCategoryName))
            assert.ok((await html(secondPath)).includes(originalCategoryName), 'unrelated article includes the category list')

            const alias = await fetch(new URL(`/article/0${first.id}`, origin), { redirect: 'manual' })
            assert.equal(alias.status, 308)
            assert.equal(new URL(alias.headers.get('location'), origin).pathname, firstPath)

            const added = await create('/api/cate', { name: `Extra-Category-${label}` })
            assert.ok((await html(firstPath)).includes(added.name))
            assert.ok((await html(secondPath)).includes(added.name))
            await remove('/api/cate', added.id)
            assert.ok(!(await html(firstPath)).includes(added.name))
            assert.ok(!(await html(secondPath)).includes(added.name))

            const categoryName = `Renamed-Category-${label}`
            await api('/api/cate', { method: 'PUT', token, data: { id: first.cateId, name: categoryName } })
            for (const path of [firstPath, secondPath]) {
                const page = await html(path)
                assert.ok(page.includes(categoryName), path)
                assert.ok(!page.includes(originalCategoryName), path)
            }

            const [tag] = detail.tags
            assert.ok((await html(firstPath)).includes(tag.name))
            const tagName = `Renamed-Tag-${label}`
            await api('/api/tag', { method: 'PUT', token, data: { id: tag.id, name: tagName } })
            const renamed = await html(firstPath)
            assert.ok(renamed.includes(tagName))
            assert.ok(!renamed.includes(tag.name))
            await remove('/api/tag', tag.id)
            assert.ok(!(await html(firstPath)).includes(tagName))
            assert.ok((await html(secondPath)).includes(`Tag-${label}-B`))
        })

        const title = `Updated-${label}`
        await api('/api/post', { method: 'PUT', token, data: { id: first.id, title } })
        assert.ok((await html(`/article/${first.id}`)).includes(title))
        assert.ok((await html('/')).includes(title))
        await remove('/api/post', first.id)
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
