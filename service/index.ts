import { PrismaClient } from '@prisma/client'

interface GetArticleManyParam {
    cateId?: string
    skip?: number
    take?: number
    title?: string
}

export const getArticleMany = async (param?: GetArticleManyParam) => {
    const { cateId, skip, take, title } = param ?? {}
    const prisma = new PrismaClient()

    const allPost = await prisma.post.findMany({
        include: { author: { select: { username: true } }, cate: true },
        where: { cateId: Number(cateId) || undefined, title },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
    })
    prisma.$disconnect()

    return JSON.parse(JSON.stringify(allPost))
}
