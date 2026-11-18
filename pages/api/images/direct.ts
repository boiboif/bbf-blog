import { randomUUID } from 'node:crypto'
import { copy, del, get, head, issueSignedToken, presignUrl } from '@vercel/blob'
import jwt from 'jsonwebtoken'
import type { NextApiRequest, NextApiResponse } from 'next'
import { requireUser } from '@/utils/jwt'
import { imageExtensions, imageFormatsHelp, maxImageBytes, maxServerImageBytes, readImageType, type ImageType } from '@/utils/markdownImage'

export const config = { api: { bodyParser: { sizeLimit: '8kb' } } }

const binary = 'application/octet-stream'
const audience = 'markdown-image-upload'
type Upload = { uploadId: string; size: number; contentType: ImageType }

function isDirectSize(size: unknown): size is number {
    return typeof size === 'number' && Number.isSafeInteger(size) && size > maxServerImageBytes && size <= maxImageBytes
}

function isImageType(value: unknown): value is ImageType {
    return typeof value === 'string' && Object.hasOwn(imageExtensions, value)
}

async function prepare(size: number, contentType: ImageType, accountId: number, secret: string) {
    const uploadId = randomUUID()
    const pathname = `markdown-staging/${uploadId}.bin`
    const validUntil = Date.now() + 10 * 60_000
    const limits = { pathname, validUntil, maximumSizeInBytes: size, allowedContentTypes: [binary] }
    const delegation = await issueSignedToken({ ...limits, operations: ['put'] })
    const { presignedUrl } = await presignUrl(delegation, {
        ...limits, operation: 'put', access: 'public', ttlDays: 1, cacheControlMaxAge: 60, allowOverwrite: false, addRandomSuffix: false,
    })
    const ticket = jwt.sign({ uploadId, size, contentType }, secret, {
        algorithm: 'HS256', audience, subject: String(accountId), expiresIn: '30m',
    })
    return { uploadUrl: presignedUrl, ticket }
}

async function readPrefix(pathname: string, length: number, etag: string) {
    const object = await get(pathname, { access: 'public', headers: { Range: `bytes=0-${length - 1}`, 'If-Match': etag } })
    if (!object?.stream || object.blob.pathname !== pathname) throw new Error('Temporary upload unavailable')
    if (object.blob.etag && object.blob.etag !== etag) {
        await object.stream.cancel()
        throw new Error('Temporary upload changed')
    }
    // The CDN may return the full object. Stop reading as soon as the signature is available.
    const reader = object.stream.getReader()
    const bytes = new Uint8Array(length)
    let offset = 0
    try {
        while (offset < length) {
            const { value, done } = await reader.read()
            if (done) break
            const part = value.subarray(0, length - offset)
            bytes.set(part, offset)
            offset += part.length
        }
    } finally {
        await reader.cancel()
    }
    if (offset !== length) throw new Error('Temporary upload incomplete')
    return bytes
}

async function complete(upload: Upload, res: NextApiResponse) {
    const { uploadId, size, contentType } = upload
    const staging = `markdown-staging/${uploadId}.bin`
    const destination = `markdown/${uploadId}.${imageExtensions[contentType]}`
    try {
        const metadata = await head(staging)
        if (metadata.pathname !== staging || !metadata.etag) throw new Error('Temporary upload unavailable')
        // The TTL also cleans up interrupted deletes and uploads abandoned before confirmation.
        const discard = () => del(staging, { ifMatch: metadata.etag }).catch(() => {})
        if (metadata.contentType !== binary || metadata.size !== size) {
            await discard()
            return res.status(400).json({ success: false, message: '上传的图片与申请不一致，请重新选择文件' })
        }
        const actualType = await readImageType(size, length => readPrefix(staging, length, metadata.etag))
        if (actualType !== contentType) {
            await discard()
            return res.status(415).json({ success: false, message: imageFormatsHelp })
        }
        const result = await copy(staging, destination, {
            access: 'public', contentType, allowOverwrite: false, ifMatch: metadata.etag,
        })
        await discard()
        return res.status(201).json({ success: true, data: { url: result.url } })
    } catch (error) {
        // A previous confirmation may have published the same immutable image before its reply was lost.
        const published = await head(destination).catch(() => null)
        if (published?.pathname === destination && published.size === size && published.contentType === contentType) {
            return res.status(201).json({ success: true, data: { url: published.url } })
        }
        throw error
    }
}

export default async function directImage(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST')
        return res.status(405).json({ success: false, message: '请使用 POST 上传图片' })
    }
    const admin = await requireUser(req, res, 'admin')
    if (!admin) return
    res.setHeader('Cache-Control', 'no-store')
    const secret = process.env.JWT_SECRET
    if (!secret) throw new Error('JWT_SECRET is required')
    if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.BLOB_STORE_ID) {
        return res.status(503).json({ success: false, message: '请先连接公开的 Vercel Blob 存储，或使用网络图片地址' })
    }
    const { action, size, contentType, ticket } = req.body ?? {}
    try {
        if (action === 'prepare') {
            if (!isDirectSize(size)) {
                return res.status(413).json({ success: false, message: imageFormatsHelp })
            }
            if (!isImageType(contentType)) {
                return res.status(415).json({ success: false, message: imageFormatsHelp })
            }
            const data = await prepare(size, contentType, admin.id, secret)
            return res.status(200).json({ success: true, data })
        }
        if (action === 'complete') {
            let upload: Upload
            try {
                // Only tickets issued by prepare carry this audience and account.
                const payload = jwt.verify(ticket, secret, {
                    algorithms: ['HS256'], audience, subject: String(admin.id),
                })
                if (typeof payload === 'string' || typeof payload.uploadId !== 'string' ||
                    !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(payload.uploadId) ||
                    !isImageType(payload.contentType) || !isDirectSize(payload.size)) throw new Error('Invalid upload ticket')
                upload = { uploadId: payload.uploadId, contentType: payload.contentType, size: payload.size }
            } catch {
                return res.status(400).json({ success: false, message: '上传凭证无效或已过期，请重新选择文件' })
            }
            return await complete(upload, res)
        }
        return res.status(400).json({ success: false, message: '无效的上传请求' })
    } catch {
        return res.status(502).json({ success: false, message: '图片上传未能确认，请检查存储连接后重试' })
    }
}
