const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')

async function init() {
    const username = process.env.ADMIN_USERNAME || 'admin'
    const password = process.env.ADMIN_PASSWORD
    if (!password || Buffer.byteLength(password) > 72) {
        throw new Error('Set ADMIN_PASSWORD to a password of at most 72 UTF-8 bytes')
    }
    const prisma = new PrismaClient()
    try {
        const user = await prisma.user.upsert({
            where: { username },
            update: {},
            create: { username, passwordHash: await bcrypt.hash(password, 12), roles: ['admin'] },
            select: { roles: true },
        }).catch((error) => {
            if (error.code !== 'P2002') throw error
            // Another bootstrap may have completed between the lookup and insert.
            return prisma.user.findUniqueOrThrow({ where: { username }, select: { roles: true } })
        })
        if (!Array.isArray(user.roles) || !user.roles.includes('admin')) {
            throw new Error('ADMIN_USERNAME is already used by a non-admin account')
        }
    } finally {
        await prisma.$disconnect()
    }
}

init().catch((error) => {
    // A Prisma error can contain the query inputs. Print a fixed message for database failures.
    console.error(error.name === 'Error' ? error.message : 'Administrator initialization failed')
    process.exitCode = 1
})
