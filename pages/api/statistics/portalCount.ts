/* eslint-disable no-case-declarations */
import { getPortalStatisticsCount } from '@/service/statistics'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function index(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        res.status(405).json({ success: false, errorMessage: 'Method not allowed', errCode: '-1' })
    }

    const count = await getPortalStatisticsCount()

    res.status(200).json({
        data: count,
        success: true,
    })
}
