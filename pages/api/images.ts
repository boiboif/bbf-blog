import { randomUUID } from 'node:crypto'
import { put } from '@vercel/blob'
import type { NextApiRequest, NextApiResponse } from 'next'
import { requireUser } from '@/utils/jwt'
import { imageExtensions, imageFormatsHelp, imageType, maxServerImageBytes } from '@/utils/markdownImage'

export const config = { api: { bodyParser: false } }

const directHelp = '超过 3 MiB 的图片请通过文章编辑器直传，单张最多 20 MiB'

export default async function uploadImage(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST')
        return res.status(405).json({ success: false, message: '请使用 POST 上传图片' })
    }
    if (!await requireUser(req, res, 'admin')) return
    if (Number(req.headers['content-length']) > maxServerImageBytes) {
        return res.status(413).json({ success: false, message: directHelp })
    }

    const chunks: Buffer[] = []
    let size = 0
    for await (const chunk of req.iterator({ destroyOnReturn: false })) {
        size += chunk.length
        if (size > maxServerImageBytes) {
            req.resume()
            return res.status(413).json({ success: false, message: directHelp })
        }
        chunks.push(chunk)
    }
    const bytes = Buffer.concat(chunks, size)
    const type = imageType(bytes)
    if (!type) return res.status(415).json({ success: false, message: imageFormatsHelp })
    if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.BLOB_STORE_ID) {
        return res.status(503).json({ success: false, message: '请先在项目中连接公开的 Vercel Blob 存储，或使用网络图片地址' })
    }
    try {
        const path = `markdown/${randomUUID()}.${imageExtensions[type]}`
        const { url } = await put(path, bytes, { access: 'public', contentType: type })
        return res.status(201).json({ success: true, data: { url } })
    } catch {
        return res.status(502).json({ success: false, message: '图片未上传，请确认公开的 Vercel Blob 存储连接正常，然后重试' })
    }
}
