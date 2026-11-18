import { sessionUserSelect, signToken } from '@/utils/jwt'
import prisma from '@/utils/prismaClient'
import { Prisma } from '@/generated/prisma/client'
import bcrypt from 'bcryptjs'
import type { NextApiRequest, NextApiResponse } from 'next'

class ReservedUsernameError extends Error {}

export default async function register(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST')
        return res.status(405).json({ success: false, message: 'Method not allowed' })
    }
    const body = req.body ?? {}
    if (typeof body.username !== 'string' || !body.username.trim() ||
        typeof body.password !== 'string' || !body.password || Buffer.byteLength(body.password) > 72) {
        return res.status(400).json({ success: false, message: '用户名或密码格式无效' })
    }
    const passwordHash = await bcrypt.hash(body.password, 12)
    try {
        const account = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    username: body.username,
                    passwordHash,
                    roles: [],
                    email: body.email,
                    nickName: body.nickName,
                    gender: body.gender,
                    introduce: body.introduce,
                    birthDate: body.birthDate,
                    experience: body.experience,
                    contactInfo: { create: { tel: body.tel, wechat: body.wechat ?? body.webchat } },
                },
                select: sessionUserSelect,
            })
            // Use the username column's own collation, including case and accent rules.
            const reserved = await tx.user.findFirst({
                where: { id: user.id, username: process.env.ADMIN_USERNAME || 'admin' },
                select: { id: true },
            })
            if (reserved) throw new ReservedUsernameError()
            return { ...user, token: signToken(user.id) }
        })
        return res.status(201).json({ success: true, data: account })
    } catch (error) {
        if (error instanceof ReservedUsernameError || (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')) {
            return res.status(409).json({ success: false, message: '用户名不可用' })
        }
        if (error instanceof Prisma.PrismaClientValidationError || (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2000')) {
            return res.status(400).json({ success: false, message: '注册资料格式无效' })
        }
        console.error('Failed to register account', error instanceof Prisma.PrismaClientKnownRequestError ? error.code : 'server error')
        return res.status(500).json({ success: false, message: '注册失败，请稍后重试' })
    }
}
