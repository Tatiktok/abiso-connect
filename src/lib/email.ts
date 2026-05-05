// src/lib/email.ts
import nodemailer from "nodemailer"

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST || "smtp.gmail.com",
    port: Number(process.env.EMAIL_SERVER_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD?.replace(/\s/g, ""), // Remove any spaces
    },
    tls: {
      rejectUnauthorized: false,
      ciphers: "SSLv3",
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  })
}

interface EmailPayload {
  to: string
  name: string
  announcementTitle: string
  announcementContent: string
  affectedAreas: string[]
  interruptionDate: string
  startTime: string | null
  endTime: string | null
  notificationType: "IMMEDIATE" | "ONE_HOUR_BEFORE" | "TEN_MIN_BEFORE"
}

const LABELS = {
  IMMEDIATE: "⚡ Power Interruption Alert",
  ONE_HOUR_BEFORE: "⏰ Power Interruption in 1 Hour",
  TEN_MIN_BEFORE: "🚨 Power Interruption in 10 Minutes",
}

const COLORS = {
  IMMEDIATE: "#1e40af",
  ONE_HOUR_BEFORE: "#d97706",
  TEN_MIN_BEFORE: "#dc2626",
}

export async function sendInterruptionEmail(payload: EmailPayload) {
  const {
    to, name, announcementTitle, announcementContent,
    affectedAreas, interruptionDate, startTime, endTime, notificationType
  } = payload

  const subject = LABELS[notificationType]
  const color = COLORS[notificationType]

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

  <!-- Header -->
  <div style="background:linear-gradient(135deg,#1e3a5f,#0f2447);padding:32px 40px;text-align:center;">
    <div style="font-size:36px;margin-bottom:8px;">⚡</div>
    <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;letter-spacing:-0.5px;">ABISO CONNECT</h1>
    <p style="color:rgba(255,255,255,0.6);margin:4px 0 0;font-size:12px;letter-spacing:2px;text-transform:uppercase;">Sorsogon Power Interruption Alert</p>
  </div>

  <!-- Alert Badge -->
  <div style="background:${color};padding:14px 40px;text-align:center;">
    <p style="color:#fff;margin:0;font-size:15px;font-weight:700;">${subject}</p>
  </div>

  <!-- Body -->
  <div style="padding:36px 40px;">
    <p style="color:#64748b;margin:0 0 20px;font-size:15px;">Hello, <strong style="color:#1e293b;">${name}</strong></p>

    <div style="background:#f8fafc;border-left:4px solid ${color};border-radius:0 8px 8px 0;padding:20px 24px;margin-bottom:24px;">
      <h2 style="margin:0 0 8px;color:#0f172a;font-size:17px;font-weight:700;">${announcementTitle}</h2>
      <p style="margin:0;color:#475569;font-size:14px;line-height:1.7;">${announcementContent.slice(0, 400)}${announcementContent.length > 400 ? "..." : ""}</p>
    </div>

    ${interruptionDate && interruptionDate !== "Date not specified" ? `
    <div style="background:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:16px 20px;margin-bottom:12px;display:flex;align-items:center;gap:12px;">
      <span style="font-size:22px;">📅</span>
      <div>
        <p style="margin:0;color:#92400e;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Date of Interruption</p>
        <p style="margin:4px 0 0;color:#1e293b;font-size:15px;font-weight:600;">${interruptionDate}</p>
      </div>
    </div>` : ""}

    ${startTime && endTime ? `
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px 20px;margin-bottom:12px;display:flex;align-items:center;gap:12px;">
      <span style="font-size:22px;">⏰</span>
      <div>
        <p style="margin:0;color:#166534;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Time</p>
        <p style="margin:4px 0 0;color:#1e293b;font-size:15px;font-weight:600;">${startTime} – ${endTime}</p>
      </div>
    </div>` : ""}

    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px 20px;margin-bottom:24px;display:flex;align-items:center;gap:12px;">
      <span style="font-size:22px;">📍</span>
      <div>
        <p style="margin:0;color:#1e40af;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Affected Areas</p>
        <p style="margin:4px 0 0;color:#1e293b;font-size:14px;font-weight:600;">${affectedAreas.join(", ")}</p>
      </div>
    </div>

    <!-- Tips -->
    <div style="background:#0f172a;border-radius:10px;padding:20px 24px;margin-bottom:24px;">
      <p style="color:#f59e0b;margin:0 0 12px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">💡 Preparation Tips</p>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="color:#94a3b8;font-size:13px;padding:4px 0;">✓ Charge all devices and power banks</td></tr>
        <tr><td style="color:#94a3b8;font-size:13px;padding:4px 0;">✓ Prepare flashlights and candles</td></tr>
        <tr><td style="color:#94a3b8;font-size:13px;padding:4px 0;">✓ Store water in containers</td></tr>
        <tr><td style="color:#94a3b8;font-size:13px;padding:4px 0;">✓ Unplug sensitive electronics</td></tr>
      </table>
    </div>

    <p style="color:#94a3b8;font-size:12px;margin:0;">Source: SORECO II (Sorsogon II Electric Cooperative)</p>
  </div>

  <!-- Footer -->
  <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
    <p style="color:#64748b;font-size:12px;margin:0 0 6px;">You received this because you subscribed to ABISO CONNECT power interruption alerts.</p>
    <p style="color:#94a3b8;font-size:11px;margin:0;">ABISO CONNECT &bull; Sorsogon City, Sorsogon &bull; Philippines</p>
  </div>
</div>
</body>
</html>`

  const transporter = createTransporter()

  // Verify connection first
  await transporter.verify()

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `ABISO CONNECT <${process.env.EMAIL_SERVER_USER}>`,
    to,
    subject,
    html,
  })

  console.log(`Email sent to ${to}: ${subject}`)
}
