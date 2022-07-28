const bcrypt = require('bcryptjs')
const PrismaClient = require('@prisma/client').PrismaClient

/**
 *
 * 初始化管理员账号 admin - admin
 */
const init = async () => {
    const prisma = new PrismaClient()

    const user = await prisma.user.findUnique({
        where: {
            username: 'admin',
        },
    })

    if (user) return

    await prisma.user.create({
        data: {
            // 密码是经过 bcrypt 加密的
            passwordHash: bcrypt.hashSync('admin', 8),
            username: 'admin',
            roles: ['admin'],
            email: 'dg70946@163.com',
        },
    })

    await prisma.$disconnect()
}

init()
