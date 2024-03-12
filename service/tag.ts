import prisma from "@/utils/prismaClient";
import { formatObjArrDate } from "@/utils/time";
import { Prisma } from "@prisma/client";

interface GetTagPageParam {
  name?: string;
  skip?: number;
  take?: number;
}

/** 新增标签 */
export const addTag = async (param: Prisma.tagCreateInput) => {
  const res = await prisma.tag.create({
    data: param,
  });

  return res;
};

/** 更新标签 */
export const updateTag = async (
  param: Prisma.tagCreateInput & { id: number }
) => {
  const res = await prisma.tag.update({
    where: {
      id: param.id,
    },
    data: param,
  });

  return res;
};

/** 删除标签 */
export const deleteTag = async (param: { id: number }) => {
  const res = await prisma.tag.delete({
    where: {
      id: param.id,
    },
  });

  return res;
};

/** 获取所有标签 */
export const getTagAll = async () => {
  const res = await prisma.tag.findMany({
    orderBy: { createdAt: "desc" },
  });

  return formatObjArrDate<(typeof res)[0]>(JSON.parse(JSON.stringify(res)));
};

/** 分页查询标签 */
export const getTagPage = async (param: GetTagPageParam) => {
  const res = await prisma.tag.findMany({
    where: {
      name: {
        contains: param.name,
      },
    },
    take: param.take,
    skip: param.skip,
    orderBy: { createdAt: "desc" },
  });

  return formatObjArrDate<(typeof res)[0]>(JSON.parse(JSON.stringify(res)));
};
