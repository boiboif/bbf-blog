import { requireUser, sessionUserSelect } from '@/utils/jwt'
import prisma from '@/utils/prismaClient'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function index(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET')
        return res.status(405).json({ success: false, message: 'Method not allowed' })
    }
    const session = await requireUser(req, res)
    if (!session) return

    const id = Number(req.query.id)
    if (typeof req.query.id !== 'string' || !Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({ success: false, message: '用户 ID 无效' })
    }
    if (id === session.id) return res.status(200).json({ success: true, data: session })
    if (!session.roles.includes('admin')) {
        return res.status(403).json({ success: false, message: '无权限' })
    }

    const user = await prisma.user.findUnique({ where: { id }, select: sessionUserSelect })
    if (!user) return res.status(404).json({ success: false, message: '用户不存在' })
    return res.status(200).json({ success: true, data: user })
}
