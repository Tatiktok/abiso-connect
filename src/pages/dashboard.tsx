// src/pages/dashboard.tsx
import { GetServerSideProps } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Head from "next/head"
import Navbar from "@/components/Navbar"
import AnnouncementCard from "@/components/AnnouncementCard"
import { Announcement } from "@/types"
import { useState } from "react"
import { format } from "date-fns"

interface Props {
  announcements: Announcement[]
  userBarangay: string | null
  userName: string | null
  totalCount: number
}

export default function Dashboard({ announcements: init, userBarangay, userName, totalCount }: Props) {
  const [announcements, setAnnouncements] = useState(init)
  const [loading, setLoading] = useState(false)
  const now = new Date()
  const greeting = now.getHours() < 12 ? "Morning" : now.getHours() < 17 ? "Afternoon" : "Evening"
  const activeCount = announcements.filter(a => a.status === "ACTIVE").length

  const refresh = async () => {
    setLoading(true)
    const res = await fetch("/api/announcements")
    const data = await res.json()
    setAnnouncements(data.announcements)
    setLoading(false)
  }

  return (
    <>
      <Head><title>Dashboard – ABISO CONNECT</title></Head>
      <Navbar />
      <main style={{ paddingTop:"64px",minHeight:"100vh" }}>
        <div style={{ background:"linear-gradient(180deg,rgba(15,32,64,0.8) 0%,transparent 100%)",borderBottom:"1px solid rgba(255,255,255,0.05)",padding:"40px 0 32px" }}>
          <div className="container">
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:"20px" }}>
              <div>
                <p style={{ color:"#f59e0b",fontSize:"12px",fontWeight:700,textTransform:"uppercase",letterSpacing:"2px",marginBottom:"8px" }}>{format(now,"EEEE, MMMM d, yyyy")}</p>
                <h1 style={{ fontFamily:"Syne",fontSize:"32px",fontWeight:800,color:"#f1f5f9",letterSpacing:"-1px",marginBottom:"8px" }}>
                  Good {greeting}, <span style={{ color:"#f59e0b" }}>{userName?.split(" ")[0] || "Subscriber"}</span>
                </h1>
                <div style={{ display:"flex",alignItems:"center",gap:"8px" }}>
                  <i className="bx bx-map-pin" style={{ color:"#3b82f6",fontSize:"15px" }}></i>
                  <span style={{ color:"#64748b",fontSize:"14px" }}>{userBarangay ? `Brgy. ${userBarangay}, Sorsogon City` : "Sorsogon City (All Barangays)"}</span>
                </div>
              </div>
              <button onClick={refresh} disabled={loading} className="btn btn-ghost">
                <i className="bx bx-refresh" style={{ fontSize:"18px",animation:loading?"spin 1s linear infinite":"none" }}></i>Refresh
              </button>
            </div>
          </div>
        </div>

        <div className="container" style={{ padding:"32px 24px" }}>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:"16px",marginBottom:"32px" }}>
            {[
              { label:"Total Alerts",value:totalCount,icon:"bx-bell",color:"#f59e0b",bg:"rgba(245,158,11,0.1)",border:"rgba(245,158,11,0.2)" },
              { label:"Active Now",value:activeCount,icon:"bxs-circle",color:"#10b981",bg:"rgba(16,185,129,0.1)",border:"rgba(16,185,129,0.2)" },
              { label:"Today",value:announcements.filter(a=>new Date(a.createdAt).toDateString()===now.toDateString()).length,icon:"bx-calendar-check",color:"#3b82f6",bg:"rgba(59,130,246,0.1)",border:"rgba(59,130,246,0.2)" },
              { label:"Your Barangay",value:userBarangay||"All",icon:"bx-map",color:"#a78bfa",bg:"rgba(167,139,250,0.1)",border:"rgba(167,139,250,0.2)" },
            ].map((s,i) => (
              <div key={i} style={{ background:s.bg,border:`1px solid ${s.border}`,borderRadius:"14px",padding:"20px 22px",display:"flex",alignItems:"center",gap:"14px",animation:`fadeIn 0.4s ease ${i*0.08}s both` }}>
                <div style={{ width:"42px",height:"42px",borderRadius:"10px",background:"rgba(0,0,0,0.2)",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center" }}>
                  <i className={`bx ${s.icon}`} style={{ fontSize:"20px",color:s.color }}></i>
                </div>
                <div>
                  <div style={{ fontFamily:"Syne",fontSize:"26px",fontWeight:800,color:s.color,lineHeight:1 }}>{s.value}</div>
                  <div style={{ fontSize:"12px",color:"#64748b",marginTop:"4px",fontWeight:500 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {!userBarangay && (
            <div style={{ display:"flex",alignItems:"center",gap:"14px",background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.2)",borderRadius:"12px",padding:"16px 20px",marginBottom:"24px" }}>
              <i className="bx bxs-map" style={{ fontSize:"24px",color:"#f59e0b",flexShrink:0 }}></i>
              <div style={{ flex:1 }}>
                <p style={{ fontWeight:600,color:"#fbbf24",marginBottom:"2px",fontSize:"14px" }}>Set your barangay for targeted alerts</p>
                <p style={{ color:"#92400e",fontSize:"13px" }}>You're currently receiving alerts for all of Sorsogon City.</p>
              </div>
              <a href="/profile" className="btn btn-primary" style={{ padding:"8px 16px",fontSize:"13px",flexShrink:0 }}>Set Location</a>
            </div>
          )}

          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px" }}>
            <h2 style={{ fontFamily:"Syne",fontSize:"20px",fontWeight:700,color:"#f1f5f9" }}>Recent Announcements</h2>
            <a href="/announcements" style={{ fontSize:"13px",color:"#3b82f6",fontWeight:600,display:"flex",alignItems:"center",gap:"4px" }}>View all <i className="bx bx-right-arrow-alt"></i></a>
          </div>

          {announcements.length === 0 ? (
            <div style={{ textAlign:"center",padding:"80px 40px",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:"20px" }}>
              <div style={{ width:"64px",height:"64px",borderRadius:"18px",background:"rgba(16,185,129,0.1)",border:"1px solid rgba(16,185,129,0.2)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px" }}>
                <i className="bx bx-check-shield" style={{ fontSize:"30px",color:"#10b981" }}></i>
              </div>
              <h3 style={{ fontFamily:"Syne",fontSize:"20px",color:"#f1f5f9",marginBottom:"8px" }}>No interruptions announced</h3>
              <p style={{ color:"#475569",fontSize:"15px" }}>We'll notify you the moment SORECO II posts an announcement.</p>
            </div>
          ) : (
            <div style={{ display:"flex",flexDirection:"column",gap:"16px" }}>
              {announcements.map((ann,i) => <div key={ann.id} style={{ animation:`fadeIn 0.4s ease ${i*0.06}s both` }}><AnnouncementCard announcement={ann} highlight={i===0} /></div>)}
            </div>
          )}
        </div>
      </main>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions)
  if (!session) return { redirect: { destination:"/login", permanent:false } }
  const user = await prisma.user.findUnique({ where:{ id:session.user.id }, select:{ barangay:true, name:true } })
  const [announcements, totalCount] = await Promise.all([
    prisma.announcement.findMany({ orderBy:{ createdAt:"desc" }, take:10 }),
    prisma.announcement.count(),
  ])
  return { props: { announcements:JSON.parse(JSON.stringify(announcements)), userBarangay:user?.barangay||null, userName:user?.name||session.user.name||null, totalCount } }
}
