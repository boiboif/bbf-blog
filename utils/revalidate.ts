import type { NextApiResponse } from 'next'

const indexPaths = ['/', '/category', '/tag']

export function isBlogPage(path: string) {
    return indexPaths.includes(path) || /^\/article\/[1-9]\d*$/.test(path)
}

export async function refreshBlogPages(res: NextApiResponse, postId?: number) {
    const paths = postId === undefined ? indexPaths : [...indexPaths, `/article/${postId}`]
    // The write is committed. Keep the response successful if an ISR retry is needed.
    await Promise.all(paths.map(async (path) => {
        try {
            await res.revalidate(path)
        } catch (error) {
            console.error('Failed to refresh blog page', path, error)
        }
    }))
}
