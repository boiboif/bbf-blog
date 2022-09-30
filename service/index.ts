import { formatObjArrTime } from '@/utils/time'
import { PrismaClient } from '@prisma/client'

interface GetArticleManyParam {
    cateId?: string
    cateName?: string
    skip?: number
    take?: number
    title?: string
}

export const getArticleMany = async (param?: GetArticleManyParam) => {
    const { cateId, skip, take, title, cateName } = param ?? {}
    const prisma = new PrismaClient()

    const allPost = await prisma.post.findMany({
        include: { author: { select: { username: true } }, cate: { select: { name: true } } },
        where: { cateId: Number(cateId) || undefined, title, cate: { name: cateName } },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
    })
    prisma.$disconnect()

    return formatObjArrTime<API.Article>(JSON.parse(JSON.stringify(allPost)))
}

export const getArticleById = async (id: string) => {
    const prisma = new PrismaClient()

    const post = await prisma.post.findUnique({
        include: { author: { select: { username: true } }, cate: true },
        where: { id: Number(id) || undefined },
    })

    prisma.$disconnect()

    return JSON.parse(JSON.stringify(post))
}

export const getCateMany = async () => {
    const prisma = new PrismaClient()

    const allCate = await prisma.post_cate.findMany({
        orderBy: { createdAt: 'desc' },
    })
    prisma.$disconnect()

    return JSON.parse(JSON.stringify(allCate)) as API.Cate[]
}
