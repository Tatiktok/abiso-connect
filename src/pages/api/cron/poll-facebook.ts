// src/pages/api/cron/poll-facebook.ts
import { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/lib/prisma"
import { fetchSorecoPagePosts, isInterruptionPost, parseInterruptionPost } from "@/lib/facebook"
import { scheduleNotifications, sendPendingNotifications } from "@/lib/scheduler"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = req.headers.authorization
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) return res.status(401).json({ error: "Unauthorized" })

  try {
    const posts = await fetchSorecoPagePosts()
    let newAnnouncements = 0

    for (const post of posts) {
      if (!isInterruptionPost(post)) continue
      const existing = await prisma.announcement.findUnique({ where: { fbPostId: post.id } })
      if (existing) continue

      const parsed = parseInterruptionPost(post)
      const announcement = await prisma.announcement.create({
        data: {
          fbPostId: post.id, title: parsed.title, content: parsed.content,
          source: "SORECO II", affectedAreas: parsed.affectedAreas,
          interruptionDate: parsed.interruptionDate, startTime: parsed.startTime,
          endTime: parsed.endTime, status: "ACTIVE",
        },
      })
      await scheduleNotifications(announcement.id)
      newAnnouncements++
    }

    await sendPendingNotifications()
    return res.status(200).json({ success: true, postsChecked: posts.length, newAnnouncements })
  } catch (error) {
    console.error("Poll error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}
