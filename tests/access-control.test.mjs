import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import test from 'node:test'
import { compileFunction } from 'node:vm'
import jwt from 'jsonwebtoken'
import ts from 'typescript'

// Execute the repository's TypeScript handlers with an in-memory Prisma adapter.
const requirePackage = createRequire(import.meta.url)
function loadModule(path, dependencies) {
    const source = readFileSync(new URL('../' + path, import.meta.url), 'utf8')
    const { outputText } = ts.transpileModule(source, {
        compilerOptions: { target: ts.ScriptTarget.ES2017, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
    })
    const exports = {}
    const resolve = (name) => dependencies[name] ?? requirePackage(name)
    compileFunction(outputText, ['exports', 'require'])(exports, resolve)
    return exports
}

function response() {
    return {
        code: 200,
        status(code) { this.code = code; return this },
        json(body) { this.body = body; return this },
    }
}

test('user endpoints enforce current account roles and expose only session fields', async (t) => {
    const previousSecret = process.env.JWT_SECRET
    process.env.JWT_SECRET = randomBytes(32).toString('hex')
    t.after(() => {
        if (previousSecret === undefined) delete process.env.JWT_SECRET
        else process.env.JWT_SECRET = previousSecret
    })

    const user = { id: 1, username: 'reader', nickName: null, roles: [] }
    let listReads = 0
    const prisma = { user: {
        findUnique: async () => user,
        findMany: async ({ select }) => {
            listReads++
            assert.deepEqual(Object.keys(select).sort(), ['id', 'nickName', 'roles', 'username'])
            return [user]
        },
    } }
    const dependencies = { '@/utils/prismaClient': prisma }
    const auth = loadModule('utils/jwt.ts', dependencies)
    dependencies['@/utils/jwt'] = auth
    const list = loadModule('pages/api/user/index.ts', dependencies).default
    const detail = loadModule('pages/api/user/[id].ts', dependencies).default
    const token = auth.signToken(user.id)
    async function read(handler, authorization, id) {
        const res = response()
        await handler({ method: 'GET', headers: { authorization }, query: { id } }, res)
        return res
    }
    assert.equal((await read(list, '')).code, 401)
    const expired = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: -1 })
    assert.equal((await read(list, expired)).code, 401)
    assert.equal((await read(list, token)).code, 403)
    assert.equal(listReads, 0)
    assert.equal((await read(detail, token, '1')).body.data.username, 'reader')
    assert.equal((await read(detail, token, '2')).code, 403)
    user.roles = ['admin']
    assert.equal((await read(list, token)).code, 200)
    user.roles = []
    assert.equal((await read(list, token)).code, 403)
    assert.equal(listReads, 1)
})

test('registration assigns a reader role and reserves the bootstrap username', async () => {
    const account = { id: 3, username: 'reader', nickName: null, roles: [] }
    const writes = []
    let reserved = false
    const register = loadModule('pages/api/register.ts', {
        '@/utils/jwt': { signToken: () => 'session', sessionUserSelect: {} },
        'bcryptjs': { hash: async () => 'test hash' },
        '@/utils/prismaClient': { $transaction: async (work) => work({ user: {
            create: async ({ data }) => { writes.push(data); return account },
            findFirst: async () => reserved ? { id: account.id } : null,
        } }) },
    }).default
    const req = { method: 'POST', body: { username: 'reader', password: 'test password', roles: ['editor'] } }
    const created = response()
    await register(req, created)
    assert.equal(created.code, 201)
    assert.deepEqual(writes[0].roles, [])
    reserved = true
    const conflict = response()
    await register(req, conflict)
    assert.equal(conflict.code, 409)
    assert.equal(conflict.body.success, false)
})

test('content changes and manual revalidation require an administrator', async () => {
    const dependencies = {
        '@/service': {},
        '@/service/tag': {},
        '@/utils/apiInput': {},
        '@/utils/prismaClient': {},
        '@/utils/revalidate': {},
        '@/utils/jwt': {
            requireUser: async (_req, res, role) => {
                assert.equal(role, 'admin')
                res.status(403).json({ success: false })
                return null
            },
        },
    }
    for (const route of ['post/index', 'cate/index', 'tag/index', 'revalidate']) {
        const handler = loadModule('pages/api/' + route + '.ts', dependencies).default
        const methods = route === 'revalidate' ? ['GET', 'POST'] : ['POST', 'PUT', 'DELETE']
        for (const method of methods) {
            const res = response()
            await handler({ method, body: {}, query: {} }, res)
            assert.equal(res.code, 403, method + ' ' + route)
        }
    }
})
