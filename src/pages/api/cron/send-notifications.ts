// src/pages/api/cron/send-notifications.ts
import { NextApiRequest, NextApiResponse } from "next"
import { sendPendingNotifications } from "@/lib/scheduler"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = req.headers.authorization
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) return res.status(401).json({ error: "Unauthorized" })
  try {
    const sent = await sendPendingNotifications()
    return res.status(200).json({ success: true, sent })
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" })
  }
}
