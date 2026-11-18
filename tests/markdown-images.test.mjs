import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { Readable } from 'node:stream'
import test from 'node:test'
import { compileFunction } from 'node:vm'
import { crc32 } from 'node:zlib'
import ts from 'typescript'
import { getProcessor } from 'bytemd'

const png = readFileSync(new URL('../public/img/logo.png', import.meta.url))
const jpeg = readFileSync(new URL('../public/img/tab-00_on.jpg', import.meta.url))
const MiB = 1024 * 1024
const requirePackage = createRequire(import.meta.url)

// A valid PNG of an exact size. Insert a tEXt chunk immediately before IEND.
function pngOfSize(size) {
    const data = Buffer.alloc(size - png.length - 12, 65)
    data.write('Comment\0')
    const chunk = Buffer.concat([Buffer.alloc(4), Buffer.from('tEXt'), data, Buffer.alloc(4)])
    chunk.writeUInt32BE(data.length)
    chunk.writeUInt32BE(crc32(chunk.subarray(4, -4)), chunk.length - 4)
    return Buffer.concat([png.subarray(0, -12), chunk, png.subarray(-12)])
}

function load(path, dependencies = {}) {
    const source = readFileSync(new URL('../' + path, import.meta.url), 'utf8')
    const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } })
    const exports = {}
    compileFunction(outputText, ['exports', 'require'])(exports, name => dependencies[name] ?? requirePackage(name))
    return exports
}

function setEnv(t, values) {
    for (const [key, value] of Object.entries(values)) {
        const previous = process.env[key]
        if (value === undefined) delete process.env[key]
        else process.env[key] = value
        t.after(() => {
            if (previous === undefined) delete process.env[key]
            else process.env[key] = previous
        })
    }
}

function response() {
    return { code: 200, status(code) { this.code = code; return this }, json(body) { this.body = body }, setHeader() {} }
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
        const res = response()
        await handler(req, res)
        return res
    }
    setEnv(t, { BLOB_STORE_ID: undefined, BLOB_READ_WRITE_TOKEN: undefined })
    assert.equal((await request('GET', [])).code, 405)
    assert.equal((await request('POST', [png])).code, 403)
    allowed = true
    assert.equal((await request('POST', [png])).code, 503)
    process.env.BLOB_STORE_ID = 'store_test'
    assert.equal(images.maxServerImageBytes, 3 * MiB)
    assert.equal(images.maxImageBytes, 20 * MiB)
    assert.equal((await request('POST', [], { 'content-length': 3 * MiB + 1 })).code, 413)
    assert.equal((await request('POST', [Buffer.alloc(3 * MiB), png])).code, 413)
    assert.equal((await request('POST', [Buffer.from('<svg/>')], { 'content-type': 'image/png' })).code, 415)
    assert.equal(calls.length, 0)
    const samples = [
        [pngOfSize(3 * MiB), 'png', 'image/png'], [jpeg, 'jpg', 'image/jpeg'],
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

test('direct uploads issue a bounded PUT and publish only a verified administrator-owned image', async t => {
    setEnv(t, { JWT_SECRET: 'fixture-markdown-image-secret', BLOB_STORE_ID: 'store_fixture', BLOB_READ_WRITE_TOKEN: undefined })
    const accounts = [{ id: 1, roles: ['admin'] }, { id: 2, roles: ['admin'] }, { id: 3, roles: [] }]
    const auth = load('utils/jwt.ts', { '@/utils/prismaClient': { user: {
        findUnique: async ({ where }) => accounts.find(account => account.id === where.id),
    } } })
    const [admin, otherAdmin, reader] = accounts.map(account => auth.signToken(account.id))
    const objects = new Map()
    const grants = []
    const ranges = []
    let signature, published, removed
    const blob = {
        issueSignedToken: async limits => { grants.push(limits); return { delegationToken: 'fixture' } },
        presignUrl: async (_token, options) => {
            signature = options
            return { presignedUrl: 'https://blob.example.test/put' }
        },
        head: async path => {
            const object = objects.get(path)
            if (!object) throw new Error('not found')
            return object
        },
        get: async (path, { headers }) => {
            const object = objects.get(path)
            assert.equal(headers['If-Match'], object.etag)
            const end = Number(/^bytes=0-(\d+)$/.exec(headers.Range)[1]) + 1
            ranges.push(end)
            return { blob: object, stream: new Blob([object.prefix.subarray(0, end)]).stream() }
        },
        copy: async (source, path, options) => {
            assert.equal(objects.has(path), false)
            assert.equal(options.access, 'public')
            assert.equal(options.allowOverwrite, false)
            assert.equal(options.contentType, 'image/png')
            assert.equal(options.ifMatch, objects.get(source).etag)
            published = { ...objects.get(source), pathname: path, contentType: options.contentType, url: 'https://blob.example.test/' + path }
            objects.set(path, published)
            return published
        },
        del: async (path, options) => { removed = { path, options }; objects.delete(path) },
    }
    const handler = load('pages/api/images/direct.ts', { '@vercel/blob': blob, '@/utils/jwt': auth, '@/utils/markdownImage': images }).default
    async function request(authorization, body, method = 'POST') {
        const res = response()
        await handler({ method, headers: { authorization }, body }, res)
        return res
    }
    const prepare = { action: 'prepare', size: 20 * MiB, contentType: 'image/png' }
    assert.equal((await request(admin, prepare, 'GET')).code, 405)
    assert.equal((await request('', prepare)).code, 401)
    assert.equal((await request(reader, prepare)).code, 403)
    for (const size of [3 * MiB, 20 * MiB + 1]) {
        assert.equal((await request(admin, { ...prepare, size })).code, 413)
    }
    assert.equal((await request(admin, { ...prepare, contentType: 'image/svg+xml' })).code, 415)
    assert.equal(grants.length, 0)

    assert.equal((await request(admin, { ...prepare, size: 3 * MiB + 1 })).code, 200)
    const issued = await request(admin, prepare)
    assert.equal(issued.code, 200)
    assert.equal(issued.body.data.uploadUrl, 'https://blob.example.test/put')
    const grant = grants.at(-1)
    const staging = grant.pathname
    assert.match(staging, /^markdown-staging\/[0-9a-f-]{36}\.bin$/)
    assert.deepEqual(grant.operations, ['put'])
    assert.equal(grant.maximumSizeInBytes, prepare.size)
    assert.ok(grant.validUntil > Date.now() && grant.validUntil <= Date.now() + 60 * 60_000)
    assert.deepEqual(grant.allowedContentTypes, ['application/octet-stream'])
    assert.equal(signature.pathname, staging)
    assert.equal(signature.operation, 'put')
    assert.equal(signature.allowOverwrite, false)
    assert.equal(signature.ttlDays, 1)

    const complete = { action: 'complete', ticket: issued.body.data.ticket }
    assert.equal((await request('', complete)).code, 401)
    assert.equal((await request(reader, complete)).code, 403)
    assert.equal((await request(otherAdmin, complete)).code, 400)
    assert.equal((await request(admin, { ...complete, ticket: 'invalid' })).code, 400)
    const staged = { pathname: staging, size: prepare.size - 1, contentType: 'application/octet-stream', etag: 'test-etag', prefix: Buffer.alloc(images.imageHeaderBytes) }
    objects.set(staging, staged)
    assert.equal((await request(admin, complete)).code, 400)
    assert.equal(ranges.length, 0)
    assert.ok(!objects.has(staging))
    staged.size = prepare.size
    objects.set(staging, staged)
    assert.equal((await request(admin, complete)).code, 415)
    assert.equal(published, undefined)
    assert.ok(!objects.has(staging))

    png.copy(staged.prefix)
    objects.set(staging, staged)
    const saved = await request(admin, complete)
    assert.equal(saved.code, 201)
    assert.match(saved.body.data.url, /^https:\/\/blob\.example\.test\/markdown\/[0-9a-f-]{36}\.png$/)
    assert.deepEqual(removed, { path: staging, options: { ifMatch: staged.etag } })
    assert.ok(ranges.every(length => length <= images.imageHeaderBytes))
    assert.deepEqual((await request(admin, complete)).body, saved.body)
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
    const large = pngOfSize(5 * MiB)
    const uploadUrl = 'https://blob.example.test/authorized-upload'
    const direct = []
    let putRequest
    await page.addInitScript(() => {
        localStorage.setItem('token', 'fixture')
        localStorage.setItem('userId', '1')
    })
    await page.route('**/*', async route => {
        const req = route.request()
        const url = new URL(req.url())
        if (url.href === uploadUrl) {
            const headers = {
                'access-control-allow-origin': origin.origin,
                'access-control-allow-methods': 'PUT',
                'access-control-allow-headers': 'content-type',
            }
            if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers })
            putRequest = { method: req.method(), headers: req.headers(), bytes: req.postDataBuffer() }
            direct.push('put')
            return route.fulfill({ status: 200, headers, body: '' })
        }
        if (url.origin !== origin.origin) return route.abort()
        if (!url.pathname.startsWith('/api/')) return route.continue()
        let data = []
        if (url.pathname === '/api/user/1') data = { id: 1, username: 'test', roles: ['admin'] }
        if (url.pathname === '/api/cate') data = [{ id: 1, name: '插图测试' }]
        if (url.pathname === '/api/post' && req.method() === 'POST') saved = req.postDataJSON()
        if (url.pathname === '/api/images') {
            assert.equal(req.headers().authorization, 'fixture')
            const bytes = req.postDataBuffer()
            assert.ok(bytes.length <= 3 * MiB, 'large files must bypass the raw image endpoint')
            if (!bytes.equals(png)) {
                return route.fulfill({ status: 415, json: { success: false, message: '不支持此图片格式' } })
            }
            data = { url: new URL('/img/logo.png?upload=' + ++uploads, origin).href }
        }
        if (url.pathname === '/api/images/direct') {
            assert.equal(req.headers().authorization, 'fixture')
            assert.ok(req.postDataBuffer().length < 4096, 'only upload metadata should reach the blog')
            const body = req.postDataJSON()
            direct.push(body.action)
            if (body.action === 'prepare') {
                assert.equal(body.size, large.length)
                assert.equal(body.contentType, 'image/png')
                data = { uploadUrl, ticket: 'fixture-ticket' }
            } else {
                assert.equal(body.action, 'complete')
                assert.equal(body.ticket, 'fixture-ticket')
                data = { url: new URL('/img/logo.png?direct=1', origin).href }
            }
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

    await input.press('Control+End')
    await input.press('Enter')
    const largeFile = page.waitForEvent('filechooser')
    await page.getByRole('button', { name: '上传本地图片' }).click()
    await (await largeFile).setFiles({ name: 'large.png', mimeType: 'image/png', buffer: large })
    await preview.getByRole('img', { name: 'large' }).evaluate(img => img.decode())
    assert.deepEqual(direct, ['prepare', 'put', 'complete'])
    assert.equal(putRequest.method, 'PUT')
    assert.equal(putRequest.headers.authorization, undefined)
    assert.equal(putRequest.headers['content-type'], 'application/octet-stream')
    assert.ok(putRequest.bytes?.equals(large), 'the complete original file must reach Blob')

    // Create this file inside Chromium; the editor should reject it before making a request.
    await input.evaluate((element, size) => {
        const transfer = new DataTransfer()
        transfer.items.add(new File([new Uint8Array(size)], 'oversize.png', { type: 'image/png' }))
        element.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: transfer }))
    }, 20 * MiB + 1)
    await page.getByText(/oversize\.png.*20 MiB/).waitFor()

    const badFile = page.waitForEvent('filechooser')
    await page.getByRole('button', { name: '上传本地图片' }).click()
    await (await badFile).setFiles({ name: 'invalid.png', mimeType: 'image/png', buffer: Buffer.from('invalid') })
    await page.getByText('invalid.png：不支持此图片格式').waitFor()
    await page.getByRole('button', { name: /提\s*交/ }).click()
    await page.getByText('提交成功！').waitFor()
    assert.equal(uploads, 3)
    const html = getProcessor({}).processSync(saved.content).toString()
    for (const label of ['外链 [图]', '本地', 'paste', 'drop', 'large']) assert.ok(html.includes('alt="' + label + '"'))
    assert.ok(!saved.content.includes('invalid'))
    assert.ok(!saved.content.includes('oversize'))
    assert.ok(!saved.content.includes(uploadUrl))
    assert.deepEqual(direct, ['prepare', 'put', 'complete'])

    await t.test('a narrow editor can open the file chooser and the image URL dialog', async () => {
        await page.setViewportSize({ width: 390, height: 820 })
        await page.getByRole('button', { name: /新\s*增/ }).click()
        const narrowArticle = page.getByRole('dialog', { name: '新增' })
        const narrowEditor = narrowArticle.locator('.bytemd')
        assert.ok(await narrowEditor.evaluate(editor =>
            editor.querySelector('.bytemd-status').getBoundingClientRect().bottom <= editor.getBoundingClientRect().bottom
        ), 'a wrapping toolbar should leave room for the status row')
        const [chooser] = await Promise.all([
            page.waitForEvent('filechooser'),
            narrowArticle.getByRole('button', { name: '上传本地图片' }).click(),
        ])
        await chooser.setFiles([])
        await narrowArticle.getByRole('button', { name: '插入网络图片' }).click()
        await page.getByRole('dialog', { name: '插入网络图片' }).waitFor()
    })
})
