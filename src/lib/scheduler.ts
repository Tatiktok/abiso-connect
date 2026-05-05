// src/lib/scheduler.ts
import { prisma } from "./prisma"
import { sendInterruptionEmail } from "./email"
import { sendSMS, buildSMSMessage } from "./sms"
import { format, subHours, subMinutes } from "date-fns"

export async function scheduleNotifications(announcementId: string) {
  const announcement = await prisma.announcement.findUnique({ where: { id: announcementId } })
  if (!announcement) return

  const users = await prisma.user.findMany({
    where: { email: { not: null } },
    select: { id: true, email: true, name: true, barangay: true, phone: true },
  })

  const now = new Date()

  for (const user of users) {
    if (!user.email) continue

    const isAffected = !user.barangay ||
      announcement.affectedAreas.length === 0 ||
      announcement.affectedAreas.includes(user.barangay)

    if (!isAffected) continue

    // Immediate
    await prisma.notification.create({
      data: { userId: user.id, announcementId, type: "IMMEDIATE", channel: "EMAIL", scheduledFor: now, status: "PENDING" },
    })
    if (user.phone) {
      await prisma.notification.create({
        data: { userId: user.id, announcementId, type: "IMMEDIATE", channel: "SMS", scheduledFor: now, status: "PENDING" },
      })
    }

    if (announcement.interruptionDate) {
      const intDate = new Date(announcement.interruptionDate)
      const oneHour = subHours(intDate, 1)
      const tenMin = subMinutes(intDate, 10)

      if (oneHour > now) {
        await prisma.notification.create({
          data: { userId: user.id, announcementId, type: "ONE_HOUR_BEFORE", channel: "EMAIL", scheduledFor: oneHour, status: "PENDING" },
        })
        if (user.phone) {
          await prisma.notification.create({
            data: { userId: user.id, announcementId, type: "ONE_HOUR_BEFORE", channel: "SMS", scheduledFor: oneHour, status: "PENDING" },
          })
        }
      }

      if (tenMin > now) {
        await prisma.notification.create({
          data: { userId: user.id, announcementId, type: "TEN_MIN_BEFORE", channel: "EMAIL", scheduledFor: tenMin, status: "PENDING" },
        })
        if (user.phone) {
          await prisma.notification.create({
            data: { userId: user.id, announcementId, type: "TEN_MIN_BEFORE", channel: "SMS", scheduledFor: tenMin, status: "PENDING" },
          })
        }
      }
    }
  }
}

export async function sendPendingNotifications() {
  const now = new Date()
  const pending = await prisma.notification.findMany({
    where: { status: "PENDING", scheduledFor: { lte: now } },
    include: { user: true, announcement: true },
    take: 50,
  })

  let sent = 0
  for (const notif of pending) {
    const ann = notif.announcement
    const user = notif.user

    try {
      const dateStr = ann.interruptionDate
        ? format(new Date(ann.interruptionDate), "MMMM d, yyyy") : "Date not specified"

      if (notif.channel === "EMAIL" && user.email) {
        await sendInterruptionEmail({
          to: user.email,
          name: user.name || "Subscriber",
          announcementTitle: ann.title,
          announcementContent: ann.content,
          affectedAreas: ann.affectedAreas,
          interruptionDate: dateStr,
          startTime: ann.startTime,
          endTime: ann.endTime,
          notificationType: notif.type as any,
        })
      } else if (notif.channel === "SMS" && user.phone) {
        const msg = buildSMSMessage(
          notif.type as any,
          ann.title,
          ann.affectedAreas,
          dateStr !== "Date not specified" ? dateStr : null,
          ann.startTime,
          ann.endTime
        )
        await sendSMS(user.phone, msg)
      }

      await prisma.notification.update({
        where: { id: notif.id },
        data: { status: "SENT", sentAt: now },
      })
      sent++
    } catch (err) {
      console.error("Notification error:", err)
      await prisma.notification.update({
        where: { id: notif.id },
        data: { status: "FAILED" },
      })
    }
  }
  return sent
}
