// src/pages/api/test-email.ts
// Test endpoint - visit /api/test-email to send a test email
import { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sendInterruptionEmail } from "@/lib/email"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ error: "Login required" })

  const isAdmin = session.user.email === process.env.ADMIN_EMAIL || session.user.role === "admin"
  if (!isAdmin) return res.status(403).json({ error: "Admin only" })

  try {
    await sendInterruptionEmail({
      to: session.user.email!,
      name: session.user.name || "Admin",
      announcementTitle: "TEST - Scheduled Power Interruption",
      announcementContent: "This is a test email from ABISO CONNECT to verify that email notifications are working correctly. If you receive this, email is configured properly!",
      affectedAreas: ["Poblacion", "Bibincahan", "Pangpang"],
      interruptionDate: "May 6, 2026",
      startTime: "8:00 AM",
      endTime: "5:00 PM",
      notificationType: "IMMEDIATE",
    })

    return res.status(200).json({
      success: true,
      message: `Test email sent to ${session.user.email}`,
      sentTo: session.user.email,
    })
  } catch (error: any) {
    console.error("Test email error:", error)
    return res.status(500).json({
      success: false,
      error: error.message,
      hint: checkEmailConfig(),
    })
  }
}

function checkEmailConfig() {
  const issues = []
  if (!process.env.EMAIL_SERVER_USER) issues.push("EMAIL_SERVER_USER is missing")
  if (!process.env.EMAIL_SERVER_PASSWORD) issues.push("EMAIL_SERVER_PASSWORD is missing")
  if (!process.env.EMAIL_SERVER_HOST) issues.push("EMAIL_SERVER_HOST is missing")
  if (process.env.EMAIL_SERVER_PASSWORD?.includes(" ")) issues.push("EMAIL_SERVER_PASSWORD has spaces - remove them!")
  return issues.length > 0 ? issues.join(", ") : "Config looks OK - check Gmail security settings"
}
