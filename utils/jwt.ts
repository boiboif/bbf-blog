import jwt from 'jsonwebtoken'
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/utils/prismaClient'

export const sessionUserSelect = {
    id: true,
    username: true,
    nickName: true,
    roles: true,
} as const

function getSecret() {
    const secret = process.env.JWT_SECRET
    if (!secret) throw new Error('JWT_SECRET is required')
    return secret
}

export function signToken(id: number) {
    return jwt.sign({ id }, getSecret(), { algorithm: 'HS256', expiresIn: '7d' })
}

export async function requireUser(req: NextApiRequest, res: NextApiResponse, role?: 'admin') {
    const secret = getSecret()
    let id: number
    try {
        const token = req.headers.authorization || ''
        const payload = jwt.verify(token, secret, { algorithms: ['HS256'], maxAge: '7d' })
        if (typeof payload === 'string' || !Number.isSafeInteger(payload.id) || payload.id <= 0) {
            throw new Error('Invalid account ID')
        }
        id = payload.id
    } catch {
        res.status(401).json({ success: false, message: '请重新登录' })
        return null
    }

    const user = await prisma.user.findUnique({ where: { id }, select: sessionUserSelect })
    if (!user) {
        res.status(401).json({ success: false, message: '请重新登录' })
        return null
    }
    // Read current roles so removing access takes effect on existing sessions.
    const roles = Array.isArray(user.roles) ? user.roles.filter((value): value is string => typeof value === 'string') : []
    if (role && !roles.includes(role)) {
        res.status(403).json({ success: false, message: '无权限' })
        return null
    }
    return { ...user, roles }
}
