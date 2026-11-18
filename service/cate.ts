import prisma from "@/utils/prismaClient";

export const getCateMany = async ({ name, skip, take }: { name?: string; skip?: number; take?: number } = {}) => {
  const allCate = await prisma.post_cate.findMany({
    where: name ? { name: { contains: name } } : undefined,
    skip,
    take,
    orderBy: { createdAt: "desc" },
  });

  return JSON.parse(JSON.stringify(allCate)) as typeof allCate;
};
