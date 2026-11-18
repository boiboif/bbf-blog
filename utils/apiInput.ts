import type { NextApiRequest } from 'next'

const maxInt = 2_147_483_647

export function isRecordId(value: unknown): value is number {
    return typeof value === 'number' && Number.isInteger(value) && value > 0 && value <= maxInt
}

type NamedRecordChange =
    | { method: 'POST'; name: string }
    | { method: 'PUT'; id: number; name: string }
    | { method: 'DELETE'; id: number }

export function namedRecordChange(req: NextApiRequest, maxNameLength: number): NamedRecordChange | null {
    const { id, name } = req.body ?? {}
    if (req.method === 'DELETE') return isRecordId(id) ? { method: 'DELETE', id } : null
    if (typeof name !== 'string' || !name.trim() || [...name.trim()].length > maxNameLength) return null
    if (req.method === 'POST') return { method: 'POST', name: name.trim() }
    return req.method === 'PUT' && isRecordId(id) ? { method: 'PUT', id, name: name.trim() } : null
}

export function listParams(query: NextApiRequest['query'], searchField: 'name' | 'title') {
    // Existing API callers use "page" as a row offset.
    const { page, size, [searchField]: search } = query
    const skip = page === undefined ? undefined : Number(page)
    const take = size === undefined ? undefined : Number(size)
    if (page !== undefined && (typeof page !== 'string' || !/^\d+$/.test(page) || skip! > maxInt)) return null
    if (size !== undefined && (typeof size !== 'string' || !/^\d+$/.test(size) || !isRecordId(take))) return null
    if (search !== undefined && typeof search !== 'string') return null
    return { skip, take, search: search?.trim() || undefined }
}
