/* eslint-disable no-case-declarations */
import { getPostMany } from "@/service";
import { authMiddleware } from "@/utils/jwt";
import prisma from "@/utils/prismaClient";
import { NextApiRequest, NextApiResponse } from "next";

export default async function index(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "GET":
      const allPost = await getPostMany({
        take: Number(req.query.size) || undefined,
        skip: Number(req.query.page) || undefined,
      });
      res.status(200).json({
        data: allPost,
        success: true,
      });
      break;

    case "POST":
      const { id: authorId } = await authMiddleware(req, res);

      const post = await prisma.post.create({
        data: {
          ...req.body,
          authorId,
          tags: {
            connect: req.body.tags?.map((t: number) => ({ id: t })) || [],
          },
        },
      });
      res.status(200).json({
        data: post,
        success: true,
      });
      break;

    case "PUT":
      await authMiddleware(req, res);

      const newPost = await prisma.post.update({
        data: {
          ...req.body,
          tags: {
            set: [],
            connect: req.body.tags.map((t: number) => ({ id: t })) || [],
          },
        },
        where: {
          id: req.body.id,
        },
      });
      res.status(200).json({
        data: newPost,
        success: true,
      });
      break;

    case "DELETE":
      await authMiddleware(req, res);

      await prisma.post.update({
        where: { id: req.body.id },
        data: {
          tags: {
            set: [],
          },
        },
      });

      await prisma.post.delete({ where: { id: req.body.id } });
      res.status(200).json({ success: true });
      break;

    default:
      res.status(405).json({ error: "Method not allowed" });
  }
}
