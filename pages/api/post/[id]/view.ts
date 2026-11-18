import { incrementPostView, parsePostId } from '@/service'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    res.setHeader('Cache-Control', 'no-store')
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST')
        return res.status(405).json({ success: false, message: 'Method not allowed' })
    }
    const id = parsePostId(req.query.id)
    const data = id === null ? null : await incrementPostView(id)
    if (!data) return res.status(404).json({ success: false, message: '记录不存在' })
    return res.status(200).json({ success: true, data })
}
