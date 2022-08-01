/* eslint-disable no-case-declarations */
import { authMiddleware, verifyToken } from '@/utils/jwt'
import { PrismaClient } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function index(req: NextApiRequest, res: NextApiResponse) {
    let prisma: PrismaClient
    switch (req.method) {
        case 'GET':
            prisma = new PrismaClient()
            const allPost = await prisma.post.findMany({ include: { author: true, cate: true } })
            res.status(200).json({
                data: allPost,
                success: true,
            })
            await prisma.$disconnect()
            break

        case 'POST':
            prisma = new PrismaClient()

            const { id: authorId } = await authMiddleware(req, res)

            const post = await prisma.post.create({
                data: {
                    authorId,
                    ...req.body,
                },
            })
            res.status(200).json({
                data: post,
                success: true,
            })
            await prisma.$disconnect()
            break

        case 'PUT':
            prisma = new PrismaClient()

            await authMiddleware(req, res)

            const newPost = await prisma.post.update({
                data: req.body,
                where: {
                    id: req.body.id,
                },
            })
            res.status(200).json({
                data: newPost,
                success: true,
            })
            await prisma.$disconnect()
            break

        case 'DELETE':
            prisma = new PrismaClient()

            await authMiddleware(req, res)

            await prisma.post.delete({ where: { id: req.body.id } })
            res.status(200).json({ success: true })
            await prisma.$disconnect()
            break

        default:
            res.status(405).json({ error: 'Method not allowed' })
    }
}
