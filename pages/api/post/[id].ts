import { getPostById, parsePostId } from '@/service'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET')
        return res.status(405).json({ success: false, message: 'Method not allowed' })
    }
    const id = parsePostId(req.query.id)
    const post = id === null ? null : await getPostById(id)

    res.status(post ? 200 : 404).json({
        data: post,
        success: !!post,
        message: post ? '' : '记录不存在',
    })
}
