/* eslint-disable no-case-declarations */
import { authMiddleware } from '@/utils/jwt'
import { PrismaClient } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function index(req: NextApiRequest, res: NextApiResponse) {
    let prisma: PrismaClient
    switch (req.method) {
        case 'GET':
            await authMiddleware(req, res)

            prisma = new PrismaClient()
            const { id } = req.query
            const userInfo = await prisma.user.findUnique({ where: { id: Number(id) } })
            res.status(200).json({
                data: { ...userInfo, passwordHash: undefined },
                success: true,
            })
            await prisma.$disconnect()
            break

        default:
            res.status(405).json({ error: 'Method not allowed' })
    }
}
