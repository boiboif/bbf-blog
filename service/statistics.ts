import prisma from "@/utils/prismaClient";

/** 统计文章、分类、标签数量 */
export const getPortalStatisticsCount = async () => {
  const tagCount = await prisma.tag.count();

  const cateCount = await prisma.post_cate.count();

  const postCount = await prisma.post.count();

  return {
    tagCount,
    cateCount,
    postCount,
  };
};
