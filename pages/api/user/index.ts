/* eslint-disable no-case-declarations */
import prisma from "@/utils/prismaClient";
import { NextApiRequest, NextApiResponse } from "next";

export default async function index(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "GET":
      const allUsers = await prisma.user.findMany({
        include: { contactInfo: true },
      });
      res.status(200).json({
        data: allUsers,
        success: true,
      });
      break;

    default:
      res.status(405).json({ error: "Method not allowed" });
  }
}
