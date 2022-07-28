/* eslint-disable no-case-declarations */
import { PrismaClient } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'

/**
 *
 * @param req
 * @param res
 */
export default async function index(req: NextApiRequest, res: NextApiResponse) {
    let prisma: PrismaClient
    switch (req.method) {
        case 'GET':
            prisma = new PrismaClient()
            const { userId } = req.query
            const userInfo = await prisma.user.findUnique({ where: { id: Number(userId) } })
            res.status(200).json({
                data: userInfo,
                success: true,
            })
            await prisma.$disconnect()
            break

        default:
            res.status(405).json({ error: 'Method not allowed' })
    }
}
