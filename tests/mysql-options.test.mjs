import assert from 'node:assert/strict'
import test from 'node:test'
import { require as requireTypeScript } from 'tsx/cjs/api'

const { mysqlOptions } = requireTypeScript('../prisma/mysql-options.ts', import.meta.url)

test('TiDB strict TLS and Prisma pool settings survive the driver change', () => {
    const options = mysqlOptions('mysql://qa%40local:p%3Aq@[::1]:4000/blog?sslaccept=strict&connection_limit=2&connect_timeout=8&pool_timeout=12&socket_timeout=3')
    assert.equal(options.host, '::1')
    assert.equal(options.port, 4000)
    assert.equal(options.user, 'qa@local')
    assert.equal(options.password, 'p:q')
    assert.equal(options.ssl.rejectUnauthorized, true)
    assert.equal(options.connectionLimit, 2)
    assert.equal(options.connectTimeout, 8000)
    assert.equal(options.acquireTimeout, 12000)
    assert.equal(options.socketTimeout, 3000)
})

test('a plain local URL still works and malformed TLS settings fail before connecting', () => {
    assert.equal(mysqlOptions('mysql://localhost/blog').ssl, undefined)
    assert.throws(() => mysqlOptions('mysql://localhost/blog?sslaccept=typo'), /Invalid sslaccept/)
    assert.throws(() => mysqlOptions('mysql://localhost/blog?ssl=typo'), /Invalid ssl/)
})

test('the MariaDB pool uses a bounded, positive acquisition timeout', () => {
    assert.equal(mysqlOptions('mysql://localhost/blog').acquireTimeout, 10000)
    assert.equal(mysqlOptions('mysql://localhost/blog?pool_timeout=1').acquireTimeout, 1000)
    assert.equal(mysqlOptions('mysql://localhost/blog?pool_timeout=2147483').acquireTimeout, 2147483000)
    assert.throws(() => mysqlOptions('mysql://localhost/blog?pool_timeout=0'), /Omit it to use 10 seconds/)
    assert.throws(() => mysqlOptions('mysql://localhost/blog?pool_timeout=2147484'), /between 1 and 2147483 seconds/)
})
