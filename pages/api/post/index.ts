import { Prisma } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getPostSummaries } from '@/service'
import { isRecordId, listParams } from '@/utils/apiInput'
import { requireUser } from '@/utils/jwt'
import prisma from '@/utils/prismaClient'
import { refreshBlogPages } from '@/utils/revalidate'

function validArticle(body: NextApiRequest['body'], creating: boolean) {
    const { title, content, cateId, tags, desc, cover, enabled } = body
    if ((creating || title !== undefined) && (typeof title !== 'string' || !title.trim() || [...title].length > 255)) return false
    if ((creating || content !== undefined) && typeof content !== 'string') return false
    if ((creating || cateId !== undefined) && !isRecordId(cateId)) return false
    if (tags !== undefined && (!Array.isArray(tags) || !tags.every(isRecordId))) return false
    if (desc != null && typeof desc !== 'string') return false
    if (cover != null && typeof cover !== 'string') return false
    return enabled === undefined || typeof enabled === 'boolean'
}

export default async function index(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const filters = listParams(req.query, 'title')
        if (!filters) return res.status(400).json({ success: false, message: '查询参数无效' })
        const data = await getPostSummaries({ take: filters.take, skip: filters.skip, title: filters.search })
        return res.status(200).json({ success: true, data })
    }
    if (!['POST', 'PUT', 'DELETE'].includes(req.method ?? '')) {
        res.setHeader('Allow', 'GET, POST, PUT, DELETE')
        return res.status(405).json({ success: false, message: 'Method not allowed' })
    }
    const author = await requireUser(req, res, 'admin')
    if (!author) return
    const body = req.body ?? {}
    if (req.method !== 'POST' && !isRecordId(body.id)) {
        return res.status(400).json({ success: false, message: '文章 ID 无效' })
    }
    try {
        if (req.method === 'DELETE') {
            await prisma.$transaction([
                prisma.post.update({ where: { id: body.id }, data: { tags: { set: [] } } }),
                prisma.post.delete({ where: { id: body.id } }),
            ])
            await refreshBlogPages(res, body.id)
            return res.status(200).json({ success: true })
        }
        if (!validArticle(body, req.method === 'POST')) {
            return res.status(400).json({ success: false, message: '文章参数无效' })
        }
        const { title, content, desc, cover, enabled } = body
        const fields = { title, content, desc, cover, enabled }
        const tagIds = body.tags?.map((id: number) => ({ id }))
        let post
        if (req.method === 'POST') {
            post = await prisma.post.create({
                data: {
                    ...fields,
                    author: { connect: { id: author.id } },
                    cate: { connect: { id: body.cateId } },
                    tags: { connect: tagIds ?? [] },
                },
            })
        } else {
            post = await prisma.post.update({
                where: { id: body.id },
                data: {
                    ...fields,
                    cate: body.cateId === undefined ? undefined : { connect: { id: body.cateId } },
                    tags: tagIds === undefined ? undefined : { set: tagIds },
                },
            })
        }
        await refreshBlogPages(res, post.id)
        return res.status(200).json({ success: true, data: post })
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return res.status(404).json({ success: false, message: '文章或关联项不存在' })
        }
        throw error
    }
}
