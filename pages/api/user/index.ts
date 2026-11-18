import { requireUser, sessionUserSelect } from '@/utils/jwt'
import prisma from '@/utils/prismaClient'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function index(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET')
        return res.status(405).json({ success: false, message: 'Method not allowed' })
    }
    if (!(await requireUser(req, res, 'admin'))) return

    const users = await prisma.user.findMany({ select: sessionUserSelect })
    return res.status(200).json({ success: true, data: users })
}
