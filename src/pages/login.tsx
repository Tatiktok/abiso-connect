// src/pages/login.tsx
import { useState, useEffect } from "react"
import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/router"
import Head from "next/head"
import Link from "next/link"

export default function LoginPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [fbLoading, setFbLoading] = useState(false)
  const [error, setError] = useState("")
  const [show, setShow] = useState(false)

  useEffect(() => { if (session) router.push("/dashboard") }, [session])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError("")
    const res = await signIn("credentials", { email, password, redirect: false })
    setLoading(false)
    if (res?.error) setError("Invalid email or password.")
    else router.push("/dashboard")
  }

  return (
    <>
      <Head><title>Login – ABISO CONNECT</title></Head>
      <div style={{ minHeight:"100vh",background:"var(--navy)",display:"flex",position:"relative",overflow:"hidden" }}>
        <div style={{ position:"absolute",top:"-200px",right:"-200px",width:"600px",height:"600px",borderRadius:"50%",background:"radial-gradient(circle,rgba(245,158,11,0.06) 0%,transparent 70%)",pointerEvents:"none" }} />
        <div style={{ position:"absolute",bottom:"-100px",left:"-100px",width:"400px",height:"400px",borderRadius:"50%",background:"radial-gradient(circle,rgba(30,96,213,0.07) 0%,transparent 70%)",pointerEvents:"none" }} />

        {/* Left panel */}
        <div style={{ flex:1,display:"flex",flexDirection:"column",justifyContent:"center",padding:"60px",borderRight:"1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ animation:"fadeIn 0.6s ease" }}>
            <div style={{ display:"inline-flex",alignItems:"center",gap:"12px",marginBottom:"48px" }}>
              <div style={{ width:"48px",height:"48px",borderRadius:"14px",background:"linear-gradient(135deg,#f59e0b,#d97706)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 8px 24px rgba(245,158,11,0.3)" }}>
                <i className="bx bxs-bolt" style={{ fontSize:"26px",color:"#0a1628" }}></i>
              </div>
              <span style={{ fontFamily:"Syne",fontWeight:800,fontSize:"24px",letterSpacing:"-1px" }}>
                <span style={{ color:"#f8fafc" }}>ABISO</span><span style={{ color:"#f59e0b" }}> CONNECT</span>
              </span>
            </div>
            <h1 style={{ fontFamily:"Syne",fontSize:"44px",fontWeight:800,lineHeight:1.15,letterSpacing:"-2px",color:"#f8fafc",marginBottom:"20px" }}>
              Stay ahead of<br /><span style={{ color:"#f59e0b" }}>power outages.</span>
            </h1>
            <p style={{ fontSize:"16px",color:"#64748b",lineHeight:1.7,maxWidth:"400px",marginBottom:"40px" }}>
              Real-time power interruption alerts for Sorsogon City. Know before the lights go out.
            </p>
            {[
              { icon:"bx-bell-ring", text:"Instant alerts from SORECO II announcements" },
              { icon:"bx-time-five", text:"Reminders 1 hour and 10 minutes before outage" },
              { icon:"bx-map-alt", text:"Barangay-level targeting across Sorsogon City" },
              { icon:"bx-envelope", text:"Email notifications delivered to your inbox" },
            ].map((item, i) => (
              <div key={i} style={{ display:"flex",alignItems:"center",gap:"14px",marginBottom:"14px" }}>
                <div style={{ width:"36px",height:"36px",borderRadius:"10px",flexShrink:0,background:"rgba(245,158,11,0.1)",border:"1px solid rgba(245,158,11,0.2)",display:"flex",alignItems:"center",justifyContent:"center" }}>
                  <i className={`bx ${item.icon}`} style={{ fontSize:"16px",color:"#f59e0b" }}></i>
                </div>
                <span style={{ fontSize:"14px",color:"#94a3b8" }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div style={{ width:"460px",flexShrink:0,display:"flex",flexDirection:"column",justifyContent:"center",padding:"60px 48px" }}>
          <div style={{ animation:"fadeIn 0.5s ease 0.1s both" }}>
            <h2 style={{ fontFamily:"Syne",fontSize:"28px",fontWeight:700,marginBottom:"8px",color:"#f1f5f9" }}>Welcome back</h2>
            <p style={{ color:"#64748b",fontSize:"15px",marginBottom:"32px" }}>
              No account? <Link href="/register" style={{ color:"#f59e0b",fontWeight:600 }}>Sign up free</Link>
            </p>

            <button onClick={() => { setFbLoading(true); signIn("facebook",{callbackUrl:"/dashboard"}) }} disabled={fbLoading} className="btn btn-facebook" style={{ width:"100%",justifyContent:"center",marginBottom:"20px",height:"50px" }}>
              <i className="bx bxl-facebook" style={{ fontSize:"22px" }}></i>
              {fbLoading ? "Connecting..." : "Continue with Facebook"}
            </button>

            <div className="divider" style={{ marginBottom:"20px" }}><span>or sign in with email</span></div>

            {error && (
              <div style={{ background:"rgba(220,38,38,0.1)",border:"1px solid rgba(220,38,38,0.3)",borderRadius:"10px",padding:"12px 16px",marginBottom:"16px",display:"flex",alignItems:"center",gap:"10px" }}>
                <i className="bx bxs-error" style={{ color:"#dc2626",fontSize:"18px" }}></i>
                <span style={{ fontSize:"14px",color:"#fca5a5" }}>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} style={{ display:"flex",flexDirection:"column",gap:"14px" }}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div style={{ position:"relative" }}>
                  <i className="bx bx-envelope" style={{ position:"absolute",left:"14px",top:"50%",transform:"translateY(-50%)",fontSize:"18px",color:"#475569" }}></i>
                  <input type="email" className="input" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@email.com" required style={{ paddingLeft:"44px" }} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position:"relative" }}>
                  <i className="bx bx-lock-alt" style={{ position:"absolute",left:"14px",top:"50%",transform:"translateY(-50%)",fontSize:"18px",color:"#475569" }}></i>
                  <input type={show?"text":"password"} className="input" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Your password" required style={{ paddingLeft:"44px",paddingRight:"44px" }} />
                  <button type="button" onClick={()=>setShow(!show)} style={{ position:"absolute",right:"14px",top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"#475569" }}>
                    <i className={`bx ${show?"bx-hide":"bx-show"}`} style={{ fontSize:"18px" }}></i>
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn btn-primary" style={{ width:"100%",justifyContent:"center",height:"50px",marginTop:"4px" }}>
                {loading ? <><i className="bx bx-loader-alt" style={{ animation:"spin 1s linear infinite" }}></i> Signing in...</> : <>Sign In <i className="bx bx-right-arrow-alt"></i></>}
              </button>
            </form>
          </div>
        </div>
      </div>
      <style>{`@media(max-width:900px){.left-panel{display:none!important}}`}</style>
    </>
  )
}
