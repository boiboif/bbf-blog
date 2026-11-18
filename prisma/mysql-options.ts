import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// Prisma CLI reads the original DSN. The MariaDB driver uses different TLS and pool option names.
export function mysqlOptions(connectionString: string | undefined) {
    if (!connectionString) throw new Error('DATABASE_URL is required')
    if (!URL.canParse(connectionString)) throw new Error('Invalid DATABASE_URL')
    const url = new URL(connectionString)
    if (url.protocol !== 'mysql:') throw new Error('DATABASE_URL must use mysql://')
    const params = url.searchParams

    function integer(name: string) {
        const value = params.get(name)
        if (value === null) return undefined
        if (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value))) {
            throw new Error(`Invalid ${name} in DATABASE_URL`)
        }
        return Number(value)
    }

    const mode = params.get('sslaccept')
    if (mode !== null && mode !== 'strict' && mode !== 'accept_invalid_certs') {
        throw new Error('Invalid sslaccept in DATABASE_URL')
    }
    const caFile = params.get('sslcert')
    const identityFile = params.get('sslidentity')
    const ssl = params.get('ssl')
    if (ssl !== null && ssl !== 'true' && ssl !== 'false') throw new Error('Invalid ssl in DATABASE_URL')
    const useTLS = mode !== null || params.has('sslcert') || params.has('sslidentity') || params.has('sslpassword') || ssl === 'true'
    const readCertificate = (file: string) => readFileSync(resolve('prisma', file))

    return {
        host: url.hostname.replace(/^\[|\]$/g, ''),
        port: Number(url.port || 3306),
        user: decodeURIComponent(url.username),
        password: decodeURIComponent(url.password),
        database: decodeURIComponent(url.pathname.slice(1)),
        socketPath: params.get('socket')?.replace(/^\((.*)\)$/, '$1'),
        connectionLimit: integer('connection_limit'),
        minimumIdle: 0,
        idleTimeout: integer('max_idle_connection_lifetime') ?? 300,
        prepareCacheLength: integer('statement_cache_size'),
        connectTimeout: (integer('connect_timeout') ?? 5) * 1000,
        acquireTimeout: (integer('pool_timeout') ?? 10) * 1000,
        socketTimeout: (integer('socket_timeout') ?? 0) * 1000,
        timezone: '+00:00',
        ssl: useTLS ? {
            rejectUnauthorized: mode !== 'accept_invalid_certs',
            ca: caFile ? readCertificate(caFile) : undefined,
            pfx: identityFile ? readCertificate(identityFile) : undefined,
            passphrase: params.get('sslpassword') ?? undefined,
        } : undefined,
    }
}
