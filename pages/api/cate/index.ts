/* eslint-disable no-case-declarations */
import { authMiddleware } from '@/utils/jwt'
import { PrismaClient } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function index(req: NextApiRequest, res: NextApiResponse) {
    let prisma: PrismaClient
    switch (req.method) {
        case 'GET':
            prisma = new PrismaClient()
            const allCate = await prisma.post_cate.findMany({
                where: {
                    name: {
                        contains: req.query.name as string,
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            })
            res.status(200).json({
                data: allCate,
                success: true,
            })
            await prisma.$disconnect()
            break

        case 'POST':
            await authMiddleware(req, res)
            prisma = new PrismaClient()
            const cate = await prisma.post_cate.create({ data: { name: req.body.name } })
            res.status(200).json({
                data: cate,
                success: true,
            })
            await prisma.$disconnect()
            break

        case 'PUT':
            await authMiddleware(req, res)
            prisma = new PrismaClient()
            const updateData = await prisma.post_cate.update({ data: req.body, where: { id: req.body.id } })
            res.status(200).json({
                data: updateData,
                success: true,
            })
            await prisma.$disconnect()
            break

        case 'DELETE':
            await authMiddleware(req, res)
            prisma = new PrismaClient()

            const hasPost = await prisma.post.findFirst({ where: { cateId: req.body.id } })

            if (hasPost) {
                return res.status(200).json({
                    success: false,
                    message: '该分类下存在文章，请先删除文章后进行删除！',
                })
            }

            await prisma.post_cate.delete({ where: { id: req.body.id } })
            res.status(200).json({
                success: true,
            })
            await prisma.$disconnect()
            break

        default:
            res.status(405).json({ error: 'Method not allowed' })
    }
}
