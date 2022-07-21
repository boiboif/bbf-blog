/* eslint-disable no-case-declarations */
import { PrismaClient } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function index(req: NextApiRequest, res: NextApiResponse) {
    let prisma: PrismaClient
    switch (req.method) {
        case 'GET':
            prisma = new PrismaClient()
            const allUsers = await prisma.user.findMany()
            res.status(200).json(allUsers)
            await prisma.$disconnect()
            break

        default:
            res.status(405).json({ error: 'Method not allowed' })
    }
}
