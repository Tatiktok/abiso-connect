// src/pages/api/announcements/index.ts
import { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/lib/prisma"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" })
  const announcements = await prisma.announcement.findMany({ orderBy: { createdAt: "desc" }, take: 50 })
  const total = await prisma.announcement.count()
  return res.status(200).json({ announcements, total })
}
