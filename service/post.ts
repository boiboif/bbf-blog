import prisma from "@/utils/prismaClient";
import { formatObjArrDate } from "@/utils/time";

interface GetPostManyParam {
  cateId?: string;
  cateName?: string;
  skip?: number;
  take?: number;
  title?: string;
}

/** 分页查询文章 */
export const getPostMany = async (param?: GetPostManyParam) => {
  const { cateId, skip, take, title, cateName } = param ?? {};

  const allPost = await prisma.post.findMany({
    include: {
      author: { select: { username: true } },
      cate: { select: { name: true } },
      tags: true,
    },
    where: {
      cateId: Number(cateId) || undefined,
      title,
      cate: { name: cateName },
    },
    orderBy: { createdAt: "desc" },
    skip,
    take,
  });

  return formatObjArrDate<(typeof allPost)[0]>(
    JSON.parse(JSON.stringify(allPost))
  );
};

/** 根据ID查询文章详情 */
export const getPostById = async (id: string, updateCount: boolean = false) => {
  try {
    if (updateCount) {
      await prisma.post.update({
        data: {
          viewCount: {
            increment: 1,
          },
        },
        where: { id: Number(id) },
      });
    }

    let post = await prisma.post.findUnique({
      include: {
        author: { select: { username: true } },
        cate: true,
        tags: true,
      },
      where: { id: Number(id) || undefined },
    });

    return JSON.parse(JSON.stringify(post)) as typeof post;
  } catch (error) {
    return null;
  }
};
