export const maxImageBytes = 3 * 1024 * 1024
export const imageExtensions = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/avif': 'avif',
} as const
export const imageFormatsHelp = '支持 PNG、JPEG、GIF、WebP、AVIF，每张最多 3 MiB'

export function imageMarkdown(url: string, alt: string) {
    const parsed = new URL(url.trim())
    if (!['https:', 'http:'].includes(parsed.protocol) || parsed.username || parsed.password) {
        throw new Error('请输入 HTTP 或 HTTPS 图片地址')
    }
    const source = parsed.href.replaceAll('(', '%28').replaceAll(')', '%29').replaceAll('&', '\\&')
    const label = alt.replace(/[\\[\]*_`~&<>]/g, '\\$&').replace(/[\r\n]+/g, ' ')
    return `![${label}](${source})`
}
