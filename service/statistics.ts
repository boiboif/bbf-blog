import prisma from "@/utils/prismaClient";

/** 统计文章、分类、标签数量 */
export const getPortalStatisticsCount = async () => {
  const [tagCount, cateCount, postCount] = await Promise.all([
    prisma.tag.count(), prisma.post_cate.count(), prisma.post.count(),
  ]);

  return {
    tagCount,
    cateCount,
    postCount,
  };
};
