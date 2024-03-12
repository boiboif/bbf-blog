/* eslint-disable no-case-declarations */
import { getCateMany } from "@/service";
import { authMiddleware } from "@/utils/jwt";
import prisma from "@/utils/prismaClient";
import { NextApiRequest, NextApiResponse } from "next";

export default async function index(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "GET":
      const allCate = await getCateMany();
      res.status(200).json({
        data: allCate,
        success: true,
      });
      break;

    case "POST":
      await authMiddleware(req, res);
      const cate = await prisma.post_cate.create({
        data: { name: req.body.name },
      });
      res.status(200).json({
        data: cate,
        success: true,
      });
      break;

    case "PUT":
      await authMiddleware(req, res);
      const updateData = await prisma.post_cate.update({
        data: req.body,
        where: { id: req.body.id },
      });
      res.status(200).json({
        data: updateData,
        success: true,
      });
      break;

    case "DELETE":
      await authMiddleware(req, res);

      const hasPost = await prisma.post.findFirst({
        where: { cateId: req.body.id },
      });

      if (hasPost) {
        return res.status(200).json({
          success: false,
          message: "该分类下存在文章，请先删除文章后进行删除！",
        });
      }

      await prisma.post_cate.delete({ where: { id: req.body.id } });
      res.status(200).json({
        success: true,
      });
      break;

    default:
      res.status(405).json({ error: "Method not allowed" });
  }
}
