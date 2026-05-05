// src/pages/api/announcements/cancel.ts
import { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })
  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ error: "Unauthorized" })
  const isAdmin = session.user.email === process.env.ADMIN_EMAIL || session.user.role === "admin"
  if (!isAdmin) return res.status(403).json({ error: "Forbidden" })

  const { id } = req.body
  if (!id) return res.status(400).json({ error: "Announcement ID required" })

  const announcement = await prisma.announcement.update({
    where: { id },
    data: { status: "CANCELLED" },
  })

  // Cancel all pending notifications for this announcement
  await prisma.notification.updateMany({
    where: { announcementId: id, status: "PENDING" },
    data: { status: "FAILED" },
  })

  return res.status(200).json({ success: true, announcement })
}
