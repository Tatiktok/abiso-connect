// src/components/AnnouncementCard.tsx
import { Announcement } from "@/types"

export default function AnnouncementCard({ announcement, highlight }: { announcement: Announcement; highlight?: boolean }) {
  const fmtDate = (d?: string | null) => d ? new Date(d).toLocaleDateString("en-PH", { month:"long",day:"numeric",year:"numeric" }) : null
  const fmtCreated = (d: string) => new Date(d).toLocaleDateString("en-PH", { month:"short",day:"numeric",hour:"2-digit",minute:"2-digit" })
  const isNew = (new Date().getTime() - new Date(announcement.createdAt).getTime()) < 1000*60*60*3

  return (
    <div style={{ background:highlight?"rgba(245,158,11,0.06)":"rgba(255,255,255,0.03)",border:`1px solid ${highlight?"rgba(245,158,11,0.25)":"rgba(255,255,255,0.07)"}`,borderRadius:"16px",padding:"24px",animation:"fadeIn 0.4s ease" }}>
      <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:"12px",marginBottom:"14px" }}>
        <div style={{ display:"flex",alignItems:"center",gap:"10px" }}>
          <div style={{ width:"40px",height:"40px",borderRadius:"10px",background:"rgba(245,158,11,0.1)",border:"1px solid rgba(245,158,11,0.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
            <i className="bx bx-bolt-circle" style={{ fontSize:"20px",color:"#f59e0b" }}></i>
          </div>
          <div>
            <div style={{ display:"flex",alignItems:"center",gap:"8px",marginBottom:"2px" }}>
              <span style={{ fontSize:"12px",fontWeight:700,color:"#f59e0b",textTransform:"uppercase",letterSpacing:"0.5px" }}>{announcement.source}</span>
              {isNew && <span style={{ fontSize:"10px",fontWeight:700,color:"#10b981",background:"rgba(16,185,129,0.12)",border:"1px solid rgba(16,185,129,0.25)",borderRadius:"100px",padding:"2px 8px",textTransform:"uppercase" }}>NEW</span>}
            </div>
            <span style={{ fontSize:"12px",color:"#475569" }}>{fmtCreated(announcement.createdAt)}</span>
          </div>
        </div>
        <span className={`badge ${announcement.status==="ACTIVE"?"badge-active":announcement.status==="CANCELLED"?"badge-danger":"badge-warning"}`}>
          {announcement.status}
        </span>
      </div>

      <h3 style={{ fontFamily:"Syne",fontSize:"16px",fontWeight:700,color:"#f1f5f9",marginBottom:"10px",lineHeight:1.4 }}>{announcement.title}</h3>
      <p style={{ fontSize:"14px",color:"#64748b",lineHeight:1.7,marginBottom:"16px" }}>
        {announcement.content.length > 220 ? announcement.content.slice(0,220)+"…" : announcement.content}
      </p>

      <div style={{ display:"flex",flexWrap:"wrap",gap:"8px" }}>
        {announcement.interruptionDate && (
          <div style={{ display:"flex",alignItems:"center",gap:"6px",padding:"6px 12px",borderRadius:"8px",background:"rgba(30,96,213,0.1)",border:"1px solid rgba(30,96,213,0.2)" }}>
            <i className="bx bx-calendar" style={{ fontSize:"13px",color:"#3b82f6" }}></i>
            <span style={{ fontSize:"12px",color:"#94a3b8",fontWeight:500 }}>{fmtDate(announcement.interruptionDate)}</span>
          </div>
        )}
        {announcement.startTime && announcement.endTime && (
          <div style={{ display:"flex",alignItems:"center",gap:"6px",padding:"6px 12px",borderRadius:"8px",background:"rgba(16,185,129,0.08)",border:"1px solid rgba(16,185,129,0.2)" }}>
            <i className="bx bx-time" style={{ fontSize:"13px",color:"#10b981" }}></i>
            <span style={{ fontSize:"12px",color:"#94a3b8",fontWeight:500 }}>{announcement.startTime} – {announcement.endTime}</span>
          </div>
        )}
        <div style={{ display:"flex",alignItems:"center",gap:"6px",padding:"6px 12px",borderRadius:"8px",background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.15)" }}>
          <i className="bx bx-map-pin" style={{ fontSize:"13px",color:"#f59e0b" }}></i>
          <span style={{ fontSize:"12px",color:"#94a3b8",fontWeight:500 }}>
            {announcement.affectedAreas.slice(0,3).join(", ")}{announcement.affectedAreas.length>3?` +${announcement.affectedAreas.length-3} more`:""}
          </span>
        </div>
      </div>
    </div>
  )
}
