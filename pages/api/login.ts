import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { signToken } from '@/utils/jwt'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function login(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case 'POST':
            try {
                const prisma = new PrismaClient()
                const user = await prisma.user.findUnique({
                    where: { username: req.body.username },
                })
                if (!user || !bcrypt.compareSync(req.body.password, user.passwordHash)) {
                    return res.status(401).json({
                        message: 'Invalid username or password',
                    })
                }

                const token = await signToken({ id: user.id, username: user.username })

                res.status(200).json({ ...user, passwordHash: undefined, token })
                await prisma.$disconnect()
            } catch (error: any) {
                res.status(500).json(error)
            }
            break
        default:
            res.status(405).json({ error: 'Method not allowed' })
    }
}
