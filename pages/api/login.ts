import bcrypt from 'bcryptjs'
import { sessionUserSelect, signToken } from '@/utils/jwt'
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/utils/prismaClient'

export default async function login(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST')
        return res.status(405).json({ success: false, message: 'Method not allowed' })
    }
    const { username, password } = req.body ?? {}
    if (typeof username !== 'string' || !username || typeof password !== 'string' || !password) {
        return res.status(400).json({ success: false, message: '请输入用户名和密码' })
    }
    const user = await prisma.user.findUnique({
        where: { username },
        select: { ...sessionUserSelect, passwordHash: true },
    })
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        return res.status(401).json({ success: false, message: 'Invalid username or password' })
    }
    const { id, nickName, roles } = user
    return res.status(200).json({
        success: true,
        data: { id, username: user.username, nickName, roles, token: signToken(id) },
    })
}
