/* eslint-disable no-case-declarations */
import { PrismaClient } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function index(req: NextApiRequest, res: NextApiResponse) {
    let prisma: PrismaClient
    switch (req.method) {
        case 'GET':
            prisma = new PrismaClient()
            const allCate = await prisma.post_cate.findMany()
            res.status(200).json({
                data: allCate,
                success: true,
            })
            await prisma.$disconnect()
            break

        case 'POST':
            prisma = new PrismaClient()
            const cate = await prisma.post_cate.create({ data: { name: req.body.name } })
            res.status(200).json({
                data: cate,
                success: true,
            })
            await prisma.$disconnect()
            break

        default:
            res.status(405).json({ error: 'Method not allowed' })
    }
}
