import { PrismaClient } from '@prisma/client'

export const getCateMany = async () => {
    const prisma = new PrismaClient()

    const allCate = await prisma.post_cate.findMany({
        orderBy: { createdAt: 'desc' },
    })
    prisma.$disconnect()

    return JSON.parse(JSON.stringify(allCate)) as typeof allCate
}
