import { PrismaClient } from '@prisma/client'

/** 统计文章、分类、标签数量 */
export const getPortalStatisticsCount = async () => {
    const prisma = new PrismaClient()

    const tagCount = await prisma.tag.count()

    const cateCount = await prisma.post_cate.count()

    const postCount = await prisma.post.count()

    prisma.$disconnect()

    return {
        tagCount,
        cateCount,
        postCount,
    }
}
