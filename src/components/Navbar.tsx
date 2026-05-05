// src/components/Navbar.tsx
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/router"

export default function Navbar() {
  const { data: session } = useSession()
  const router = useRouter()
  const isAdmin = session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL || session?.user?.role === "admin"

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: "bxs-dashboard" },
    { href: "/map", label: "Map", icon: "bx-map" },
    { href: "/announcements", label: "Announcements", icon: "bx-bell" },
    { href: "/profile", label: "Settings", icon: "bx-cog" },
  ]

  return (
    <nav style={{ position:"fixed",top:0,left:0,right:0,zIndex:1000,background:"rgba(10,22,40,0.95)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(255,255,255,0.07)",height:"64px",display:"flex",alignItems:"center" }}>
      <div className="container" style={{ display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%" }}>
        <Link href="/dashboard" style={{ display:"flex",alignItems:"center",gap:"10px" }}>
          <div style={{ width:"36px",height:"36px",borderRadius:"10px",background:"linear-gradient(135deg,#f59e0b,#d97706)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 16px rgba(245,158,11,0.35)" }}>
            <i className="bx bxs-bolt" style={{ fontSize:"20px",color:"#0a1628" }}></i>
          </div>
          <span style={{ fontFamily:"Syne",fontWeight:800,fontSize:"17px",letterSpacing:"-0.5px" }}>
            <span style={{ color:"#f8fafc" }}>ABISO</span><span style={{ color:"#f59e0b" }}> CONNECT</span>
          </span>
        </Link>

        <div style={{ display:"flex",gap:"4px",alignItems:"center" }}>
          {links.map(l => (
            <Link key={l.href} href={l.href} style={{ display:"flex",alignItems:"center",gap:"6px",padding:"8px 14px",borderRadius:"8px",fontSize:"14px",fontWeight:500,color:router.pathname===l.href?"#f59e0b":"#94a3b8",background:router.pathname===l.href?"rgba(245,158,11,0.1)":"transparent",transition:"all 0.2s" }}>
              <i className={`bx ${l.icon}`} style={{ fontSize:"16px" }}></i>{l.label}
            </Link>
          ))}
          {isAdmin && (
            <Link href="/admin" style={{ display:"flex",alignItems:"center",gap:"6px",padding:"8px 14px",borderRadius:"8px",fontSize:"14px",fontWeight:500,color:router.pathname==="/admin"?"#dc2626":"#64748b",background:router.pathname==="/admin"?"rgba(220,38,38,0.1)":"transparent",transition:"all 0.2s" }}>
              <i className="bx bxs-shield" style={{ fontSize:"16px" }}></i>Admin
            </Link>
          )}
        </div>

        <div style={{ display:"flex",alignItems:"center",gap:"10px" }}>
          <div style={{ width:"34px",height:"34px",borderRadius:"50%",background:"linear-gradient(135deg,#1e60d5,#0f2447)",display:"flex",alignItems:"center",justifyContent:"center",border:"2px solid rgba(30,96,213,0.4)",overflow:"hidden" }}>
            {session?.user?.image ? <img src={session.user.image} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }} /> : <i className="bx bx-user" style={{ fontSize:"16px",color:"#94a3b8" }}></i>}
          </div>
          <span style={{ fontSize:"14px",color:"#f8fafc",fontWeight:500 }}>{session?.user?.name?.split(" ")[0]}</span>
          <button onClick={() => signOut({ callbackUrl:"/login" })} style={{ display:"flex",alignItems:"center",gap:"6px",padding:"8px 14px",borderRadius:"8px",background:"rgba(220,38,38,0.1)",border:"1px solid rgba(220,38,38,0.2)",color:"#dc2626",cursor:"pointer",fontSize:"13px",fontWeight:600 }}>
            <i className="bx bx-log-out" style={{ fontSize:"15px" }}></i>Sign Out
          </button>
        </div>
      </div>
    </nav>
  )
}
