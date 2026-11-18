import type { NextApiResponse } from 'next'

const indexPaths = ['/', '/category', '/tag']
const revalidationConcurrency = 4

export function isBlogPage(path: string) {
    return indexPaths.includes(path) || /^\/article\/[1-9]\d*$/.test(path)
}

export async function refreshBlogPages(res: NextApiResponse, postIds: readonly number[] = []) {
    const paths = [...indexPaths, ...postIds.map(id => `/article/${id}`)]
    // The write is committed. Keep the response successful if an ISR retry is needed.
    for (let offset = 0; offset < paths.length; offset += revalidationConcurrency) {
        const batch = paths.slice(offset, offset + revalidationConcurrency)
        await Promise.all(batch.map(async (path) => {
            try {
                await res.revalidate(path)
            } catch (error) {
                console.error('Failed to refresh blog page', path, error)
            }
        }))
    }
}
