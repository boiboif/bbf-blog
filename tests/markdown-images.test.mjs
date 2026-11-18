import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { Readable } from 'node:stream'
import test from 'node:test'
import { compileFunction } from 'node:vm'
import ts from 'typescript'
import { getProcessor } from 'bytemd'

const png = readFileSync(new URL('../public/img/logo.png', import.meta.url))
const jpeg = readFileSync(new URL('../public/img/tab-00_on.jpg', import.meta.url))

function load(path, dependencies = {}) {
    const source = readFileSync(new URL('../' + path, import.meta.url), 'utf8')
    const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } })
    const exports = {}
    compileFunction(outputText, ['exports', 'require'])(exports, name => dependencies[name])
    return exports
}

const images = load('utils/markdownImage.ts')

test('image links preserve their URL and alt text in the published Markdown renderer', () => {
    const markdown = images.imageMarkdown('https://example.org/(图 1).jpg?x=1&y=2', '照片 [1] \\')
    const html = getProcessor({}).processSync(markdown).toString()
    assert.match(html, /src="https:\/\/example.org\/%28%E5%9B%BE%201%29.jpg\?x=1(?:&amp;|&#x26;)y=2"/)
    assert.ok(html.includes('alt="照片 [1] \\"'))
    for (const url of ['data:image/png;base64,aa', 'file:///a.png', 'https://user:password@example.org/a', '/relative.png']) {
        assert.throws(() => images.imageMarkdown(url, 'photo'))
    }
})

test('only administrators upload bounded raster files to public, randomized Blob URLs', async t => {
    const calls = []
    let allowed = false
    let offline = false
    const handler = load('pages/api/images.ts', {
        'node:crypto': await import('node:crypto'),
        '@/utils/markdownImage': images,
        '@/utils/jwt': { requireUser: async (_req, res, role) => {
            assert.equal(role, 'admin')
            if (allowed) return { id: 1 }
            res.status(403).json({ success: false })
            return null
        } },
        '@vercel/blob': { put: async (path, bytes, options) => {
            if (offline) throw new Error('service unavailable')
            calls.push({ path, bytes, options })
            return { url: 'https://images.example.org/' + path }
        } },
    }).default
    async function request(method, chunks, headers = {}) {
        const req = Object.assign(Readable.from(chunks), { method, headers })
        const res = { status(code) { this.code = code; return this }, json(body) { this.body = body }, setHeader() {} }
        await handler(req, res)
        return res
    }
    const original = [process.env.BLOB_STORE_ID, process.env.BLOB_READ_WRITE_TOKEN]
    t.after(() => {
        for (const [index, key] of ['BLOB_STORE_ID', 'BLOB_READ_WRITE_TOKEN'].entries()) {
            if (original[index] === undefined) delete process.env[key]
            else process.env[key] = original[index]
        }
    })
    delete process.env.BLOB_STORE_ID
    delete process.env.BLOB_READ_WRITE_TOKEN
    assert.equal((await request('GET', [])).code, 405)
    assert.equal((await request('POST', [png])).code, 403)
    allowed = true
    assert.equal((await request('POST', [png])).code, 503)
    process.env.BLOB_STORE_ID = 'store_test'
    assert.equal((await request('POST', [], { 'content-length': images.maxImageBytes + 1 })).code, 413)
    assert.equal((await request('POST', [Buffer.alloc(images.maxImageBytes), png])).code, 413)
    assert.equal((await request('POST', [Buffer.from('<svg/>')], { 'content-type': 'image/png' })).code, 415)
    assert.equal(calls.length, 0)
    const samples = [
        [png, 'png', 'image/png'], [jpeg, 'jpg', 'image/jpeg'],
        [Buffer.from('R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==', 'base64'), 'gif', 'image/gif'],
        [Buffer.from('UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA', 'base64'), 'webp', 'image/webp'],
        // AVIF can identify itself through a compatible brand following a generic major brand.
        [Buffer.from('00000014667479706d6966310000000061766966', 'hex'), 'avif', 'image/avif'],
    ]
    for (const [bytes, ext, mime] of samples) {
        const res = await request('POST', [bytes.subarray(0, 4), bytes.subarray(4)])
        assert.equal(res.code, 201)
        const saved = calls.at(-1)
        assert.match(saved.path, new RegExp('^markdown/[0-9a-f-]{36}\\.' + ext + '$'))
        assert.ok(res.body.data.url.endsWith('/' + saved.path))
        assert.deepEqual(saved.bytes, bytes)
        assert.deepEqual(saved.options, { access: 'public', contentType: mime })
    }
    offline = true
    assert.equal((await request('POST', [png])).code, 502)
})

test('the editor inserts links, uploads, pasted and dropped images and saves their Markdown', {
    skip: !process.env.TEST_BROWSER_PATH && 'Set TEST_BROWSER_PATH to a Chromium executable',
}, async t => {
    const { chromium } = await import('playwright-core')
    const origin = new URL(process.env.TEST_BLOG_ORIGIN ?? 'http://127.0.0.1:8010')
    assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(origin.hostname))
    const browser = await chromium.launch({ executablePath: process.env.TEST_BROWSER_PATH })
    t.after(() => browser.close())
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
    let saved, uploads = 0
    await page.addInitScript(() => {
        localStorage.setItem('token', 'fixture')
        localStorage.setItem('userId', '1')
    })
    await page.route('**/*', async route => {
        const req = route.request()
        const url = new URL(req.url())
        if (url.origin !== origin.origin) return route.abort()
        if (!url.pathname.startsWith('/api/')) return route.continue()
        let data = []
        if (url.pathname === '/api/user/1') data = { id: 1, username: 'test', roles: ['admin'] }
        if (url.pathname === '/api/cate') data = [{ id: 1, name: '插图测试' }]
        if (url.pathname === '/api/post' && req.method() === 'POST') saved = req.postDataJSON()
        if (url.pathname === '/api/images') {
            assert.equal(req.headers().authorization, 'fixture')
            if (!req.postDataBuffer()?.equals(png)) {
                return route.fulfill({ status: 415, json: { success: false, message: '不支持此图片格式' } })
            }
            data = { url: new URL('/img/logo.png?upload=' + ++uploads, origin).href }
        }
        return route.fulfill({ json: { success: true, data } })
    })
    await page.goto(new URL('/manager/article', origin).href)
    await page.getByRole('button', { name: /新\s*增/ }).click()
    const article = page.getByRole('dialog', { name: '新增' })
    await article.getByLabel('文章标题').fill('图片测试')
    await article.getByLabel('分类').click()
    await page.getByText('插图测试', { exact: true }).click()
    await page.getByRole('button', { name: '插入网络图片' }).press('Enter')
    const dialog = page.getByRole('dialog', { name: '插入网络图片' })
    await dialog.getByLabel('图片地址').fill('file:///example.png')
    await dialog.getByRole('button', { name: /插\s*入/ }).click()
    await dialog.getByText('请输入有效的 HTTP 或 HTTPS 图片地址').waitFor()
    await dialog.getByLabel('图片地址').fill(new URL('/img/logo.png?external=1', origin).href)
    await dialog.getByLabel('图片说明').fill('外链 [图]')
    await dialog.getByRole('button', { name: /插\s*入/ }).click()
    const preview = page.locator('.bytemd-preview')
    await preview.getByRole('img', { name: '外链 [图]' }).evaluate(img => img.decode())

    const chooser = page.waitForEvent('filechooser')
    await page.getByRole('button', { name: '上传本地图片' }).click()
    await (await chooser).setFiles({ name: '本地.png', mimeType: 'image/png', buffer: png })
    await preview.getByRole('img', { name: '本地' }).evaluate(img => img.decode())
    const input = page.locator('.CodeMirror textarea')
    for (const kind of ['paste', 'drop']) {
        await input.press('Control+End')
        await input.press('Enter')
        await input.evaluate((element, { kind, bytes }) => {
            const transfer = new DataTransfer()
            transfer.items.add(new File([new Uint8Array(bytes)], kind + '.png', { type: 'image/png' }))
            if (kind === 'paste') {
                element.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: transfer }))
            } else {
                const scroll = element.closest('.CodeMirror').querySelector('.CodeMirror-scroll')
                const { left, bottom } = scroll.getBoundingClientRect()
                scroll.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: transfer, clientX: left + 5, clientY: bottom - 5 }))
            }
        }, { kind, bytes: [...png] })
        await preview.getByRole('img', { name: kind }).evaluate(img => img.decode())
    }

    const badFile = page.waitForEvent('filechooser')
    await page.getByRole('button', { name: '上传本地图片' }).click()
    await (await badFile).setFiles({ name: 'invalid.png', mimeType: 'image/png', buffer: Buffer.from('invalid') })
    await page.getByText('invalid.png：不支持此图片格式').waitFor()
    await page.getByRole('button', { name: /提\s*交/ }).click()
    await page.getByText('提交成功！').waitFor()
    assert.equal(uploads, 3)
    const html = getProcessor({}).processSync(saved.content).toString()
    for (const label of ['外链 [图]', '本地', 'paste', 'drop']) assert.ok(html.includes('alt="' + label + '"'))
    assert.ok(!saved.content.includes('invalid'))
})
