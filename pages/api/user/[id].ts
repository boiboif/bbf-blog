/* eslint-disable no-case-declarations */
import { authMiddleware } from "@/utils/jwt";
import prisma from "@/utils/prismaClient";
import { NextApiRequest, NextApiResponse } from "next";

export default async function index(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "GET":
      await authMiddleware(req, res);

      const { id } = req.query;
      const userInfo = await prisma.user.findUnique({
        where: { id: Number(id) },
        include: { contactInfo: true },
      });
      res.status(200).json({
        data: { ...userInfo, passwordHash: undefined },
        success: true,
      });
      break;

    default:
      res.status(405).json({ error: "Method not allowed" });
  }
}
