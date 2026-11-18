import { requireUser } from '@/utils/jwt'
import { isBlogPage } from '@/utils/revalidate'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET' && req.method !== 'POST') {
        res.setHeader('Allow', 'GET, POST')
        return res.status(405).json({ success: false, message: 'Method not allowed' })
    }
    if (!(await requireUser(req, res, 'admin'))) return
    const path = req.query.path
    if (typeof path !== 'string' || !isBlogPage(path)) {
        return res.status(400).json({ success: false, message: '页面路径无效' })
    }
    try {
        await res.revalidate(path)
        return res.json({ success: true, data: { revalidated: true } })
    } catch (error) {
        console.error('Failed to refresh blog page', path, error)
        return res.status(500).json({ success: false, message: '页面刷新失败' })
    }
}
