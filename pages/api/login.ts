import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { signToken } from '@/utils/jwt'
import { setCookie } from '@/utils/cookies'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function login(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case 'POST':
            try {
                const prisma = new PrismaClient()
                const user = await prisma.user.findUnique({
                    where: { email: req.body.email },
                })
                if (!user || !bcrypt.compareSync(req.body.password, user.passwordHash)) {
                    return res.status(401).json({
                        message: 'Invalid email or password',
                    })
                }
                setCookie(res, 'token', await signToken(user.id))

                res.status(200).json({ ...user, passwordHash: undefined })
                await prisma.$disconnect()
            } catch (error: any) {
                res.status(500).json(error)
            }
            break
        default:
            res.status(405).json({ error: 'Method not allowed' })
    }
}
