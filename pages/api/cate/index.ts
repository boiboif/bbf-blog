import type { NextApiRequest, NextApiResponse } from 'next'
import { Prisma } from '@/generated/prisma/client'
import { getCateMany, getPostIds } from '@/service'
import { listParams, namedRecordChange } from '@/utils/apiInput'
import { requireUser } from '@/utils/jwt'
import prisma from '@/utils/prismaClient'
import { refreshBlogPages } from '@/utils/revalidate'

export default async function index(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const filters = listParams(req.query, 'name')
        if (!filters) return res.status(400).json({ success: false, message: '查询参数无效' })
        const data = await getCateMany({ skip: filters.skip, take: filters.take, name: filters.search })
        return res.status(200).json({ success: true, data })
    }
    if (!['POST', 'PUT', 'DELETE'].includes(req.method ?? '')) {
        res.setHeader('Allow', 'GET, POST, PUT, DELETE')
        return res.status(405).json({ success: false, message: 'Method not allowed' })
    }
    if (!(await requireUser(req, res, 'admin'))) return
    const change = namedRecordChange(req, 191)
    if (!change) return res.status(400).json({ success: false, message: '分类参数无效' })

    try {
        let data
        switch (change.method) {
            case 'POST':
                data = await prisma.post_cate.create({ data: { name: change.name } })
                break
            case 'PUT':
                data = await prisma.post_cate.update({ where: { id: change.id }, data: { name: change.name } })
                break
            case 'DELETE': {
                const deleted = await prisma.post_cate.deleteMany({ where: { id: change.id, posts: { none: {} } } })
                if (!deleted.count) {
                    const existing = await prisma.post_cate.findUnique({ where: { id: change.id }, select: { id: true } })
                    if (!existing) return res.status(404).json({ success: false, message: '分类不存在' })
                    return res.status(200).json({ success: false, message: '该分类下存在文章，请先删除文章后进行删除！' })
                }
                break
            }
        }
        // Every article detail includes the full category list.
        const posts = await getPostIds().catch(error => {
            console.error('Failed to find article pages for category refresh', error)
            return []
        })
        await refreshBlogPages(res, posts.map(post => post.id))
        return res.status(200).json({ success: true, data })
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return res.status(404).json({ success: false, message: '分类不存在' })
        }
        throw error
    }
}
