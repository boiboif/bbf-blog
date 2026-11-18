import { randomUUID } from 'node:crypto'
import { put } from '@vercel/blob'
import type { NextApiRequest, NextApiResponse } from 'next'
import { requireUser } from '@/utils/jwt'
import { imageExtensions, imageFormatsHelp, maxImageBytes } from '@/utils/markdownImage'

export const config = { api: { bodyParser: false } }

function imageType(bytes: Buffer): keyof typeof imageExtensions | undefined {
    if (bytes.length >= 3 && bytes.readUIntBE(0, 3) === 0xffd8ff) return 'image/jpeg'
    if (bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return 'image/png'
    const header = bytes.toString('latin1', 0, 12)
    if (header.startsWith('GIF87a') || header.startsWith('GIF89a')) return 'image/gif'
    if (header.startsWith('RIFF') && header.endsWith('WEBP')) return 'image/webp'
    if (bytes.length >= 16 && header.slice(4, 8) === 'ftyp') {
        const boxSize = bytes.readUInt32BE(0)
        if (boxSize < 16 || boxSize > bytes.length) return
        for (let offset = 8; offset + 4 <= boxSize; offset += 4) {
            if (offset === 12) continue // Minor version sits between the major brand and compatible brands.
            if (['avif', 'avis'].includes(bytes.toString('latin1', offset, offset + 4))) return 'image/avif'
        }
    }
}

export default async function uploadImage(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST')
        return res.status(405).json({ success: false, message: '请使用 POST 上传图片' })
    }
    if (!await requireUser(req, res, 'admin')) return
    if (Number(req.headers['content-length']) > maxImageBytes) {
        return res.status(413).json({ success: false, message: imageFormatsHelp })
    }

    const chunks: Buffer[] = []
    let size = 0
    for await (const chunk of req.iterator({ destroyOnReturn: false })) {
        size += chunk.length
        if (size > maxImageBytes) {
            req.resume()
            return res.status(413).json({ success: false, message: imageFormatsHelp })
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
