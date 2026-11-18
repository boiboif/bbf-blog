import prisma from "@/utils/prismaClient";
import { formatDate } from "@/utils/time";
import { Prisma } from "@prisma/client";

interface GetPostManyParam {
  skip?: number;
  take?: number;
  title?: string;
}

export const getPostSummaries = async ({ take, skip, title }: GetPostManyParam = {}): Promise<API.ArticleSummary[]> => {
  const posts = await prisma.post.findMany({
    select: {
      id: true,
      title: true,
      createdAt: true,
      cateId: true,
      cate: { select: { name: true } },
      tags: { select: { id: true, name: true } },
      viewCount: true,
    },
    where: { title: title ? { contains: title } : undefined },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    skip,
    take,
  });
  return posts.map(post => ({ ...post, createdAt: formatDate(post.createdAt.toISOString()) }));
};

export const getPostIds = () => prisma.post.findMany({ select: { id: true } });

export function parsePostId(value: string | string[] | undefined): number | null {
  if (typeof value !== 'string' || !/^\d+$/.test(value)) return null;
  const id = Number(value);
  return id > 0 && id <= 2147483647 ? id : null;
}

export const getPostById = async (id: number): Promise<API.Article | null> => {
  const post = await prisma.post.findUnique({
    include: {
      author: { select: { username: true } },
      cate: true,
      tags: true,
    },
    where: { id },
  });
  if (!post) return null;
  return {
    ...post,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    cate: { ...post.cate, createdAt: post.cate.createdAt.toISOString(), updatedAt: post.cate.updatedAt.toISOString() },
    tags: post.tags.map(tag => ({ ...tag, createdAt: tag.createdAt.toISOString(), updatedAt: tag.updatedAt.toISOString() })),
  };
};

export const incrementPostView = async (id: number) => {
  try {
    return await prisma.post.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
      select: { viewCount: true },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') return null;
    throw error;
  }
};
