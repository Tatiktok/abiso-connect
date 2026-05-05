// src/pages/admin.tsx
import { GetServerSideProps } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Head from "next/head"
import Navbar from "@/components/Navbar"
import { useState } from "react"
import { SORSOGON_BARANGAYS } from "@/lib/facebook"

interface Props {
  announcements: any[]
  stats: { total: number; pending: number; sent: number; users: number }
  isAdmin: boolean
}

export default function AdminPage({ announcements: initAnn, stats, isAdmin }: Props) {
  const [announcements, setAnnouncements] = useState(initAnn)
  const [form, setForm] = useState({ title: "", content: "", affectedAreas: [] as string[], interruptionDate: "", startTime: "", endTime: "" })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const [emailsSent, setEmailsSent] = useState(0)
  const [cancelling, setCancelling] = useState<string | null>(null)

  if (!isAdmin) return (
    <>
      <Navbar />
      <div style={{ paddingTop: "64px", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", flexDirection: "column", gap: "16px" }}>
        <i className="bx bx-lock" style={{ fontSize: "48px", color: "#334155" }}></i>
        <h2 style={{ fontFamily: "Syne", color: "#64748b" }}>Access Denied</h2>
        <p style={{ color: "#334155" }}>You need admin privileges to access this page.</p>
      </div>
    </>
  )

  const toggleArea = (area: string) => setForm(f => ({ ...f, affectedAreas: f.affectedAreas.includes(area) ? f.affectedAreas.filter(a => a !== area) : [...f.affectedAreas, area] }))
  const selectAll = () => setForm(f => ({ ...f, affectedAreas: [...SORSOGON_BARANGAYS] }))
  const clearAll = () => setForm(f => ({ ...f, affectedAreas: [] }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true); setError(""); setSuccess("")
    const res = await fetch("/api/announcements/create", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
    const data = await res.json()
    setSubmitting(false)
    if (res.ok) {
      setSuccess(`Announcement created! ${data.emailsSent || 0} notification(s) sent.`)
      setEmailsSent(data.emailsSent || 0)
      setAnnouncements(prev => [data.announcement, ...prev])
      setForm({ title: "", content: "", affectedAreas: [], interruptionDate: "", startTime: "", endTime: "" })
    } else {
      setError(data.error || "Failed to create announcement")
    }
  }

  const handleCancel = async (id: string) => {
    if (!confirm("Cancel this announcement? All pending notifications will be stopped.")) return
    setCancelling(id)
    const res = await fetch("/api/announcements/cancel", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) })
    if (res.ok) {
      setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, status: "CANCELLED" } : a))
    }
    setCancelling(null)
  }

  return (
    <>
      <Head><title>Admin – ABISO CONNECT</title></Head>
      <Navbar />
      <main style={{ paddingTop: "64px", minHeight: "100vh" }}>
        <div style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "24px 0", background: "rgba(15,32,64,0.5)" }}>
          <div className="container">
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(220,38,38,0.15)", border: "1px solid rgba(220,38,38,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <i className="bx bxs-shield" style={{ color: "#dc2626", fontSize: "18px" }}></i>
              </div>
              <div>
                <h1 style={{ fontFamily: "Syne", fontSize: "24px", fontWeight: 800, color: "#f1f5f9" }}>Admin Panel</h1>
                <p style={{ color: "#64748b", fontSize: "13px" }}>Manage announcements and monitor ABISO CONNECT</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container" style={{ padding: "24px" }}>
          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: "12px", marginBottom: "24px" }}>
            {[
              { label: "Announcements", value: stats.total, icon: "bx-bell", color: "#f59e0b" },
              { label: "Notifs Pending", value: stats.pending, icon: "bx-time", color: "#3b82f6" },
              { label: "Notifs Sent", value: stats.sent, icon: "bx-check-circle", color: "#10b981" },
              { label: "Users", value: stats.users, icon: "bx-group", color: "#a78bfa" },
            ].map((s, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "18px" }}>
                <i className={`bx ${s.icon}`} style={{ fontSize: "22px", color: s.color, display: "block", marginBottom: "8px" }}></i>
                <div style={{ fontFamily: "Syne", fontSize: "26px", fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: "12px", color: "#475569", marginTop: "2px" }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            {/* Form */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px", padding: "24px" }}>
              <h2 style={{ fontFamily: "Syne", fontSize: "17px", fontWeight: 700, color: "#f1f5f9", marginBottom: "18px", display: "flex", alignItems: "center", gap: "8px" }}>
                <i className="bx bx-plus-circle" style={{ color: "#f59e0b", fontSize: "20px" }}></i> Post Announcement
              </h2>

              {success && (
                <div style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "10px", padding: "12px 16px", marginBottom: "14px", color: "#6ee7b7", fontSize: "14px" }}>
                  <i className="bx bx-check-circle"></i> {success}
                  {emailsSent > 0 && <p style={{ fontSize: "12px", color: "#34d399", marginTop: "4px" }}>Check your inbox — email & SMS notifications sent!</p>}
                </div>
              )}
              {error && (
                <div style={{ background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)", borderRadius: "10px", padding: "12px 16px", marginBottom: "14px", color: "#fca5a5", fontSize: "14px" }}>
                  <i className="bx bxs-error"></i> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Scheduled Power Interruption Notice" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Content</label>
                  <textarea className="input" value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Paste the full SORECO II announcement here..." required rows={4} style={{ resize: "vertical" }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                  <div className="form-group">
                    <label className="form-label">Date</label>
                    <input type="date" className="input" value={form.interruptionDate} onChange={e => setForm(f => ({ ...f, interruptionDate: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Start</label>
                    <input type="time" className="input" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End</label>
                    <input type="time" className="input" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <label className="form-label">Barangays ({form.affectedAreas.length} selected)</label>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button type="button" onClick={selectAll} style={{ fontSize: "11px", color: "#f59e0b", background: "none", border: "none", cursor: "pointer" }}>All</button>
                      <button type="button" onClick={clearAll} style={{ fontSize: "11px", color: "#64748b", background: "none", border: "none", cursor: "pointer" }}>Clear</button>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", maxHeight: "160px", overflowY: "auto", padding: "10px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "10px" }}>
                    {SORSOGON_BARANGAYS.map(b => (
                      <button key={b} type="button" onClick={() => toggleArea(b)} style={{ padding: "4px 10px", borderRadius: "6px", fontSize: "12px", cursor: "pointer", border: `1px solid ${form.affectedAreas.includes(b) ? "rgba(245,158,11,0.5)" : "rgba(255,255,255,0.1)"}`, background: form.affectedAreas.includes(b) ? "rgba(245,158,11,0.15)" : "transparent", color: form.affectedAreas.includes(b) ? "#f59e0b" : "#64748b", transition: "all 0.15s" }}>
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
                <button type="submit" disabled={submitting} className="btn btn-primary" style={{ justifyContent: "center", height: "46px" }}>
                  {submitting ? <><i className="bx bx-loader-alt" style={{ animation: "spin 1s linear infinite" }}></i> Sending...</> : <><i className="bx bx-send"></i> Create & Notify</>}
                </button>
              </form>
            </div>

            {/* Right side */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* SMS info */}
              <div style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "16px", padding: "20px" }}>
                <h3 style={{ fontFamily: "Syne", fontSize: "15px", fontWeight: 700, color: "#f1f5f9", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <i className="bx bx-mobile-alt" style={{ color: "#10b981", fontSize: "18px" }}></i> SMS Notifications (Semaphore)
                </h3>
                <p style={{ color: "#64748b", fontSize: "13px", marginBottom: "10px" }}>
                  Philippine SMS via Semaphore. Users with phone numbers in Settings receive SMS alerts for their barangay.
                </p>
                <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: "8px", padding: "10px 14px" }}>
                  <p style={{ color: "#10b981", fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>SMS format:</p>
                  <p style={{ color: "#64748b", fontSize: "11px", lineHeight: 1.6 }}>
                    ABISO CONNECT - ⚡ POWER INTERRUPTION ALERT<br />
                    [Title] · [Date] · [Time]<br />
                    Affected: [Barangays]
                  </p>
                </div>
              </div>

              {/* How it works */}
              <div style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: "16px", padding: "20px" }}>
                <h3 style={{ fontFamily: "Syne", fontSize: "15px", fontWeight: 700, color: "#f1f5f9", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <i className="bx bx-info-circle" style={{ color: "#f59e0b" }}></i> Notification Timeline
                </h3>
                {[
                  { icon: "bx-bell", color: "#f59e0b", label: "Instantly", desc: "Email + SMS to all affected subscribers" },
                  { icon: "bx-time", color: "#3b82f6", label: "1 Hour Before", desc: "Reminder to prepare" },
                  { icon: "bxs-alarm-exclamation", color: "#dc2626", label: "10 Min Before", desc: "Final urgent alert" },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: "10px", padding: "10px", background: "rgba(0,0,0,0.15)", borderRadius: "8px", marginBottom: "8px" }}>
                    <i className={`bx ${item.icon}`} style={{ fontSize: "16px", color: item.color, flexShrink: 0, marginTop: "2px" }}></i>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: "13px", color: "#f1f5f9", marginBottom: "1px" }}>{item.label}</p>
                      <p style={{ fontSize: "12px", color: "#64748b" }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Announcements list with Cancel button */}
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "20px", flex: 1 }}>
                <h3 style={{ fontFamily: "Syne", fontSize: "15px", fontWeight: 700, color: "#f1f5f9", marginBottom: "14px" }}>Recent Announcements</h3>
                {announcements.length === 0 ? (
                  <p style={{ color: "#475569", fontSize: "14px", textAlign: "center", padding: "20px" }}>No announcements yet</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {announcements.slice(0, 8).map(ann => (
                      <div key={ann.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", background: "rgba(255,255,255,0.02)", borderRadius: "10px" }}>
                        <i className="bx bx-bolt-circle" style={{ color: "#f59e0b", fontSize: "16px", flexShrink: 0 }}></i>
                        <div style={{ flex: 1, overflow: "hidden" }}>
                          <p style={{ fontSize: "12px", color: "#f1f5f9", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ann.title}</p>
                          <p style={{ fontSize: "11px", color: "#475569" }}>{new Date(ann.createdAt).toLocaleDateString("en-PH", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                        </div>
                        <span style={{ fontSize: "10px", padding: "3px 8px", borderRadius: "6px", background: ann.status === "ACTIVE" ? "rgba(16,185,129,0.15)" : "rgba(220,38,38,0.15)", color: ann.status === "ACTIVE" ? "#10b981" : "#dc2626", fontWeight: 600, flexShrink: 0 }}>
                          {ann.status}
                        </span>
                        {ann.status === "ACTIVE" && (
                          <button
                            onClick={() => handleCancel(ann.id)}
                            disabled={cancelling === ann.id}
                            style={{ background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)", color: "#dc2626", borderRadius: "6px", padding: "3px 8px", cursor: "pointer", fontSize: "11px", fontWeight: 600, flexShrink: 0 }}
                          >
                            {cancelling === ann.id ? "..." : "Cancel"}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions)
  if (!session) return { redirect: { destination: "/login", permanent: false } }
  const adminEmail = process.env.ADMIN_EMAIL || ""
  const isAdmin = session.user.email === adminEmail || session.user.role === "admin"
  const [announcements, pendingNotifs, sentNotifs, userCount] = await Promise.all([
    prisma.announcement.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.notification.count({ where: { status: "PENDING" } }),
    prisma.notification.count({ where: { status: "SENT" } }),
    prisma.user.count(),
  ])
  return {
    props: {
      announcements: JSON.parse(JSON.stringify(announcements)),
      stats: { total: announcements.length, pending: pendingNotifs, sent: sentNotifs, users: userCount },
      isAdmin,
    }
  }
}
