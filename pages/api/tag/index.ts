import type { NextApiRequest, NextApiResponse } from 'next'
import { Prisma } from '@/generated/prisma/client'
import { addTag, deleteTag, getTagPage, updateTag } from '@/service/tag'
import { listParams, namedRecordChange } from '@/utils/apiInput'
import { requireUser } from '@/utils/jwt'
import { refreshBlogPages } from '@/utils/revalidate'

export default async function index(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const filters = listParams(req.query, 'name')
        if (!filters) return res.status(400).json({ success: false, message: '查询参数无效' })
        const data = await getTagPage({ skip: filters.skip, take: filters.take, name: filters.search })
        return res.status(200).json({ success: true, data })
    }
    if (!['POST', 'PUT', 'DELETE'].includes(req.method ?? '')) {
        res.setHeader('Allow', 'GET, POST, PUT, DELETE')
        return res.status(405).json({ success: false, message: 'Method not allowed' })
    }
    if (!(await requireUser(req, res, 'admin'))) return
    const change = namedRecordChange(req, 255)
    if (!change) return res.status(400).json({ success: false, message: '标签参数无效' })

    try {
        let data
        let posts: { id: number }[] = []
        switch (change.method) {
            case 'POST':
                data = await addTag({ name: change.name })
                break
            case 'PUT': {
                const updated = await updateTag({ id: change.id, name: change.name })
                data = updated.tag
                posts = updated.posts
                break
            }
            case 'DELETE':
                posts = await deleteTag({ id: change.id })
                break
        }
        await refreshBlogPages(res, posts.map(post => post.id))
        return res.status(200).json({ success: true, data })
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return res.status(404).json({ success: false, message: '标签不存在' })
        }
        throw error
    }
}
