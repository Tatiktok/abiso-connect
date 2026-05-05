// src/pages/api/announcements/create.ts
import { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { scheduleNotifications, sendPendingNotifications } from "@/lib/scheduler"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })

  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ error: "Unauthorized" })

  const isAdmin = session.user.email === process.env.ADMIN_EMAIL || session.user.role === "admin"
  if (!isAdmin) return res.status(403).json({ error: "Forbidden - Admin only" })

  const { title, content, affectedAreas, interruptionDate, startTime, endTime } = req.body
  if (!title || !content) return res.status(400).json({ error: "Title and content required" })

  try {
    // Create announcement
    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        source: "SORECO II",
        affectedAreas: affectedAreas || [],
        interruptionDate: interruptionDate ? new Date(interruptionDate) : null,
        startTime: startTime || null,
        endTime: endTime || null,
        status: "ACTIVE",
      },
    })

    // Schedule notifications for affected users
    await scheduleNotifications(announcement.id)

    // Send immediate notifications right away
    let emailsSent = 0
    let emailError = null
    try {
      emailsSent = await sendPendingNotifications()
    } catch (err: any) {
      emailError = err.message
      console.error("Email sending error:", err)
    }

    return res.status(201).json({
      success: true,
      announcement,
      emailsSent,
      emailError: emailError ? `Email error: ${emailError}` : null,
    })
  } catch (error: any) {
    console.error("Create announcement error:", error)
    return res.status(500).json({ error: error.message || "Failed to create announcement" })
  }
}
