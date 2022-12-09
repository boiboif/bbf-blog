import { getPostById } from '@/service'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const post = await getPostById(req.query.id as string, true)

    res.status(200).json({
        data: post,
        success: true,
        message: post ? '' : '记录不存在',
    })
}
