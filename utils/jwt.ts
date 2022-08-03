import jwt from 'jsonwebtoken'
import { NextApiRequest, NextApiResponse } from 'next'

const secret = process.env.JWT_SECRET

interface TokenUserInfo {
    id: number
    username: string
    roles: string[]
}

export function signToken(userinfo: TokenUserInfo) {
    if (!secret) throw new Error('Environment variable JWT_SECRET is not defined!')
    return new Promise<string>((resolve, reject) => {
        jwt.sign({ id: userinfo.id, username: userinfo.username, roles: userinfo.roles }, secret, {}, (err, token) => {
            if (err || !token) return reject(err)
            resolve(token)
        })
    })
}

export function verifyToken(token: string) {
    if (!secret) throw new Error('Environment variable JWT_SECRET is not defined!')
    return new Promise<TokenUserInfo>((resolve, reject) => {
        jwt.verify(token, secret, (err, payload) => {
            if (err || !payload || !payload) return reject(err)
            resolve(payload as TokenUserInfo)
        })
    })
}

export const authMiddleware = (req: NextApiRequest, res: NextApiResponse, auth?: string[]) => {
    return new Promise<TokenUserInfo>(async (resolve) => {
        try {
            const data = await verifyToken(req.headers.authorization!)
            if (auth) {
                if (data.roles.some((r) => auth?.includes(r))) {
                    resolve(data)
                } else {
                    return res.status(401).json({
                        message: '无权限',
                    })
                }
            } else {
                resolve(data)
            }
        } catch (error) {
            return res.status(401).json({
                message: 'token格式不符合规范, 请重试!',
            })
        }
    })
}
