/* eslint-disable no-case-declarations */
import { addTag, deleteTag, getTagPage, updateTag } from '@/service/tag'
import { authMiddleware } from '@/utils/jwt'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function index(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case 'GET':
            const allCate = await getTagPage({ skip: Number(req.query.page) || undefined, take: Number(req.query.size) || undefined })
            res.status(200).json({
                data: allCate,
                success: true,
            })
            break

        case 'POST':
            await authMiddleware(req, res)
            const cate = await addTag(req.body)
            res.status(200).json({
                data: cate,
                success: true,
            })

            break

        case 'PUT':
            await authMiddleware(req, res)
            const updateData = await updateTag(req.body)
            res.status(200).json({
                data: updateData,
                success: true,
            })
            break

        case 'DELETE':
            await authMiddleware(req, res)
            await deleteTag({ id: req.body.id })
            res.status(200).json({
                success: true,
            })
            break

        default:
            res.status(405).json({ error: 'Method not allowed' })
    }
}
