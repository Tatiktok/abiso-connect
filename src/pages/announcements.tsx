// src/pages/announcements.tsx
import { GetServerSideProps } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Head from "next/head"
import Navbar from "@/components/Navbar"
import AnnouncementCard from "@/components/AnnouncementCard"
import { Announcement } from "@/types"
import { useState } from "react"

export default function AnnouncementsPage({ announcements: init }: { announcements: Announcement[] }) {
  const [filter, setFilter] = useState("")
  const filtered = filter
    ? init.filter(a => a.affectedAreas.some(ar => ar.toLowerCase().includes(filter.toLowerCase())) || a.title.toLowerCase().includes(filter.toLowerCase()))
    : init

  return (
    <>
      <Head><title>Announcements – ABISO CONNECT</title></Head>
      <Navbar />
      <main style={{ paddingTop: "64px", minHeight: "100vh" }}>
        <div style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "32px 0 24px", background: "rgba(15,32,64,0.5)" }}>
          <div className="container">
            <h1 style={{ fontFamily: "Syne", fontSize: "28px", fontWeight: 800, color: "#f1f5f9", letterSpacing: "-1px", marginBottom: "6px" }}>All Announcements</h1>
            <p style={{ color: "#64748b", fontSize: "14px" }}>All SORECO II power interruption notices for Sorsogon City</p>
          </div>
        </div>
        <div className="container" style={{ padding: "28px 24px" }}>
          <div style={{ position: "relative", marginBottom: "24px", maxWidth: "480px" }}>
            <i className="bx bx-search" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "18px", color: "#475569" }}></i>
            <input type="text" className="input" placeholder="Search barangay or keyword..." value={filter} onChange={e => setFilter(e.target.value)} style={{ paddingLeft: "44px" }} />
          </div>
          <p style={{ color: "#475569", fontSize: "14px", marginBottom: "20px" }}>
            {filtered.length} announcement{filtered.length !== 1 ? "s" : ""} found
            {filter && <> for "<span style={{ color: "#f59e0b" }}>{filter}</span>"</>}
          </p>
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "20px" }}>
              <i className="bx bx-search-alt" style={{ fontSize: "40px", color: "#334155", display: "block", marginBottom: "16px" }}></i>
              <h3 style={{ fontFamily: "Syne", fontSize: "18px", color: "#64748b" }}>No results found</h3>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {filtered.map((ann, i) => <div key={ann.id} style={{ animation: `fadeIn 0.35s ease ${i * 0.05}s both` }}><AnnouncementCard announcement={ann} /></div>)}
            </div>
          )}
        </div>
      </main>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions)
  if (!session) return { redirect: { destination: "/login", permanent: false } }
  const announcements = await prisma.announcement.findMany({ orderBy: { createdAt: "desc" }, take: 50 })
  return { props: { announcements: JSON.parse(JSON.stringify(announcements)) } }
}
