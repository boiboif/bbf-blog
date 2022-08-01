import { signToken } from '@/utils/jwt'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function regiter(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        // 如果对这个路径发起 POST 请求，代表他想要注册一个账号
        case 'POST':
            try {
                // 建立一个 Prisma 客户端，他可以帮助我们连线到数据库
                const prisma = new PrismaClient()

                // 在数据库的 User 表中建立一个新的数据
                const user = await prisma.user.create({
                    data: {
                        email: req.body.email,
                        // 密码是经过 bcrypt 加密的
                        passwordHash: bcrypt.hashSync(req.body.password, 8),
                        username: req.body.username,
                        nickName: req.body.nickName,
                        roles: req.body.roles,
                        gender: req.body.gender,
                        introduce: req.body.introduce,
                        birthDate: req.body.birthDate,
                        experience: req.body.experience,
                    },
                })

                await prisma.contactInfo.create({
                    data: {
                        userId: user.id,
                        tel: req.body.tel,
                        wechat: req.body.webchat,
                    },
                })

                const token = await signToken({ id: user.id, username: user.username })

                // 把建立成功的用户数据（不包含密码）和 JWT 回传给前端
                res.status(201).json({
                    data: { ...user, passwordHash: undefined, token },
                    success: true,
                })

                // 处理完请求以后记得断开数据库链接
                await prisma.$disconnect()
            } catch (e: any) {
                console.log(e)
                // 如果发生未预期的错误，将对应的错误说明的 Prisma 文档发给用户
                res.status(500).json({
                    result: false,
                    message:
                        typeof e.code === 'string'
                            ? 'https://www.prisma.io/docs/reference/api-reference/error-reference#' + e.code.toLowerCase()
                            : e,
                })
            }
            break
        default:
            // 如果不是 POST 请求，代表他正在用错误的方式访问这个 API
            res.status(405).json({ error: 'Method not allowed' })
    }
}
