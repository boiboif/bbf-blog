export const maxServerImageBytes = 3 * 1024 * 1024
export const maxImageBytes = 20 * 1024 * 1024
export const imageHeaderBytes = 4096
export const imageExtensions = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/avif': 'avif',
} as const
export type ImageType = keyof typeof imageExtensions
export const imageFormatsHelp = '支持 PNG、JPEG、GIF、WebP、AVIF，每张最多 20 MiB'

// A large AVIF file-type box can list its compatible brand beyond the initial prefix.
function avifHeaderSize(bytes: Uint8Array, fileSize: number) {
    if (bytes.length < 16 || String.fromCharCode(...bytes.subarray(4, 8)) !== 'ftyp') return 0
    const size = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(0)
    return size >= 16 && size <= fileSize ? size : 0
}

export function imageType(bytes: Uint8Array, fileSize = bytes.length): ImageType | undefined {
    const text = (offset: number, count: number) => String.fromCharCode(...bytes.subarray(offset, offset + count))
    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg'
    if (text(0, 8) === '\x89PNG\r\n\x1a\n') return 'image/png'
    if (['GIF87a', 'GIF89a'].includes(text(0, 6))) return 'image/gif'
    if (text(0, 4) === 'RIFF' && text(8, 4) === 'WEBP') return 'image/webp'
    const limit = Math.min(avifHeaderSize(bytes, fileSize), bytes.length)
    for (let i = 8; i + 4 <= limit; i += 4) {
        if (i !== 12 && bytes[i] === 97 && bytes[i + 1] === 118 && bytes[i + 2] === 105 &&
            (bytes[i + 3] === 102 || bytes[i + 3] === 115)) return 'image/avif' // 'avif' or 'avis'
    }
}

export async function readImageType(size: number, read: (length: number) => Promise<Uint8Array>) {
    const bytes = await read(Math.min(imageHeaderBytes, size))
    const type = imageType(bytes, size)
    const boxSize = avifHeaderSize(bytes, size)
    if (!type && boxSize > bytes.length) return imageType(await read(boxSize), size)
    return type
}

export function imageMarkdown(url: string, alt: string) {
    const parsed = new URL(url.trim())
    if (!['https:', 'http:'].includes(parsed.protocol) || parsed.username || parsed.password) {
        throw new Error('请输入 HTTP 或 HTTPS 图片地址')
    }
    const source = parsed.href.replaceAll('(', '%28').replaceAll(')', '%29').replaceAll('&', '\\&')
    const label = alt.replace(/[\\[\]*_`~&<>]/g, '\\$&').replace(/[\r\n]+/g, ' ')
    return `![${label}](${source})`
}
