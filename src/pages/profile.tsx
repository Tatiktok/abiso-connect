// src/pages/profile.tsx
import { GetServerSideProps } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Head from "next/head"
import Navbar from "@/components/Navbar"
import { useState } from "react"
import { SORSOGON_BARANGAYS } from "@/lib/facebook"

export default function ProfilePage({ user }: { user: any }) {
  const [barangay, setBarangay] = useState(user?.barangay || "")
  const [phone, setPhone] = useState(user?.phone || "")

  if (!user) return (
    <><Navbar /><div style={{ paddingTop:"64px", display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh" }}>
      <p style={{ color:"#64748b" }}>Loading...</p>
    </div></>
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  const handleSave = async () => {
    setSaving(true); setError("")
    const res = await fetch("/api/user/update-location", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ barangay, municipality: "Sorsogon City", phone }),
    })
    setSaving(false)
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000) }
    else setError("Failed to save. Please try again.")
  }

  return (
    <>
      <Head><title>Settings – ABISO CONNECT</title></Head>
      <Navbar />
      <main style={{ paddingTop: "64px", minHeight: "100vh" }}>
        <div style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "32px 0 24px", background: "rgba(15,32,64,0.5)" }}>
          <div className="container">
            <h1 style={{ fontFamily: "Syne", fontSize: "28px", fontWeight: 800, color: "#f1f5f9", letterSpacing: "-1px" }}>Profile & Settings</h1>
            <p style={{ color: "#64748b", fontSize: "14px", marginTop: "4px" }}>Manage your account and notification preferences</p>
          </div>
        </div>

        <div className="container" style={{ padding: "40px 24px", maxWidth: "680px" }}>
          {/* Profile card */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px", padding: "28px", marginBottom: "20px" }}>
            <h2 style={{ fontFamily: "Syne", fontSize: "17px", fontWeight: 700, color: "#f1f5f9", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
              <i className="bx bx-user-circle" style={{ color: "#f59e0b", fontSize: "22px" }}></i>Account Info
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: "18px", marginBottom: "20px" }}>
              <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "linear-gradient(135deg,#1e60d5,#0f2447)", display: "flex", alignItems: "center", justifyContent: "center", border: "3px solid rgba(30,96,213,0.3)", overflow: "hidden", flexShrink: 0 }}>
                {user.image ? <img src={user.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <i className="bx bx-user" style={{ fontSize: "26px", color: "#94a3b8" }}></i>}
              </div>
              <div>
                <div style={{ fontFamily: "Syne", fontSize: "18px", fontWeight: 700, color: "#f1f5f9" }}>{user.name || "User"}</div>
                <div style={{ color: "#64748b", fontSize: "14px", display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                  <i className="bx bx-envelope" style={{ fontSize: "14px" }}></i>{user.email}
                </div>
                {user.role === "admin" && (
                  <span style={{ fontSize: "11px", color: "#dc2626", background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)", borderRadius: "6px", padding: "2px 8px", marginTop: "6px", display: "inline-block", fontWeight: 700 }}>ADMIN</span>
                )}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: "10px", padding: "14px 18px" }}>
                <p style={{ fontSize: "11px", color: "#475569", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>City</p>
                <p style={{ fontSize: "15px", color: "#f1f5f9", fontWeight: 500 }}>Sorsogon City</p>
              </div>
              <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: "10px", padding: "14px 18px" }}>
                <p style={{ fontSize: "11px", color: "#475569", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>Barangay</p>
                <p style={{ fontSize: "15px", color: user.barangay ? "#f1f5f9" : "#475569", fontWeight: 500 }}>{user.barangay || "Not set"}</p>
              </div>
            </div>
          </div>

          {/* Location & Contact Settings */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px", padding: "28px", marginBottom: "20px" }}>
            <h2 style={{ fontFamily: "Syne", fontSize: "17px", fontWeight: 700, color: "#f1f5f9", marginBottom: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
              <i className="bx bx-map-alt" style={{ color: "#3b82f6", fontSize: "22px" }}></i>Notification Settings
            </h2>
            <p style={{ color: "#475569", fontSize: "14px", marginBottom: "20px" }}>Set your barangay and phone number to receive targeted alerts.</p>

            <div className="form-group" style={{ marginBottom: "14px" }}>
              <label className="form-label">Your Barangay</label>
              <div style={{ position: "relative" }}>
                <i className="bx bx-map-pin" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "18px", color: "#475569", zIndex: 1 }}></i>
                <select className="input" value={barangay} onChange={e => setBarangay(e.target.value)} style={{ paddingLeft: "44px" }}>
                  <option value="">All of Sorsogon City</option>
                  {SORSOGON_BARANGAYS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: "20px" }}>
              <label className="form-label">
                Phone Number <span style={{ color: "#10b981", fontSize: "11px", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>for SMS alerts (optional)</span>
              </label>
              <div style={{ position: "relative" }}>
                <i className="bx bx-phone" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "18px", color: "#475569" }}></i>
                <input
                  type="tel"
                  className="input"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+639XXXXXXXXX"
                  style={{ paddingLeft: "44px" }}
                />
              </div>
              <p style={{ fontSize: "12px", color: "#475569", marginTop: "6px" }}>
                Enter in international format: +639XXXXXXXXX. You'll receive SMS alerts for your barangay.
              </p>
            </div>

            {error && <p style={{ color: "#fca5a5", fontSize: "14px", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}><i className="bx bxs-error"></i>{error}</p>}

            <button onClick={handleSave} disabled={saving} className="btn btn-primary">
              {saving ? <><i className="bx bx-loader-alt" style={{ animation: "spin 1s linear infinite" }}></i> Saving...</>
                : saved ? <><i className="bx bx-check"></i> Saved!</>
                : <><i className="bx bx-save"></i> Save Settings</>}
            </button>
          </div>

          {/* Notification info */}
          <div style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: "20px", padding: "28px" }}>
            <h2 style={{ fontFamily: "Syne", fontSize: "17px", fontWeight: 700, color: "#f1f5f9", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
              <i className="bx bx-bell-ring" style={{ color: "#f59e0b", fontSize: "22px" }}></i>How Notifications Work
            </h2>
            {[
              { icon: "bx-bell", color: "#f59e0b", label: "Instant Alert", desc: "Email + SMS sent immediately when SORECO II posts an announcement" },
              { icon: "bx-time", color: "#3b82f6", label: "1 Hour Before", desc: "Email + SMS reminder 1 hour before the scheduled interruption" },
              { icon: "bxs-alarm-exclamation", color: "#dc2626", label: "10 Minutes Before", desc: "Final urgent Email + SMS 10 minutes before power goes out" },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "14px", background: "rgba(0,0,0,0.2)", borderRadius: "12px", marginBottom: "10px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <i className={`bx ${item.icon}`} style={{ fontSize: "18px", color: item.color }}></i>
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: "14px", color: "#f1f5f9", marginBottom: "3px" }}>{item.label}</p>
                  <p style={{ fontSize: "13px", color: "#64748b" }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions)
  if (!session) return { redirect: { destination: "/login", permanent: false } }
  let user = null
  try {
    user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, image: true, barangay: true, municipality: true, role: true, phone: true },
    })
  } catch {
    user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, image: true, barangay: true, municipality: true, role: true },
    })
  }
  return { props: { user: user ? JSON.parse(JSON.stringify(user)) : null } }
}
