import prisma from "@/utils/prismaClient";

export const getCateMany = async () => {
  const allCate = await prisma.post_cate.findMany({
    orderBy: { createdAt: "desc" },
  });

  return JSON.parse(JSON.stringify(allCate)) as typeof allCate;
};
