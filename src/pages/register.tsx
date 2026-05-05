// src/pages/register.tsx
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/router"
import Head from "next/head"
import Link from "next/link"
import { SORSOGON_BARANGAYS } from "@/lib/facebook"

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name:"", email:"", password:"", barangay:"" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [show, setShow] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError("")
    const res = await fetch("/api/auth/register", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form) })
    const data = await res.json()
    if (!res.ok) { setError(data.error || "Registration failed."); setLoading(false); return }
    await signIn("credentials", { email:form.email, password:form.password, callbackUrl:"/dashboard" })
  }

  return (
    <>
      <Head><title>Register – ABISO CONNECT</title></Head>
      <div style={{ minHeight:"100vh",background:"var(--navy)",display:"flex",alignItems:"center",justifyContent:"center",padding:"40px 24px" }}>
        <div style={{ width:"100%",maxWidth:"500px",background:"rgba(255,255,255,0.025)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"24px",padding:"48px",animation:"fadeIn 0.5s ease" }}>
          <div style={{ textAlign:"center",marginBottom:"32px" }}>
            <div style={{ width:"52px",height:"52px",borderRadius:"14px",background:"linear-gradient(135deg,#f59e0b,#d97706)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",boxShadow:"0 8px 24px rgba(245,158,11,0.25)" }}>
              <i className="bx bxs-bolt" style={{ fontSize:"28px",color:"#0a1628" }}></i>
            </div>
            <h1 style={{ fontFamily:"Syne",fontSize:"22px",fontWeight:800 }}>
              <span style={{ color:"#f8fafc" }}>ABISO</span><span style={{ color:"#f59e0b" }}> CONNECT</span>
            </h1>
            <p style={{ color:"#475569",fontSize:"14px",marginTop:"6px" }}>Create your free alert account</p>
          </div>

          <button onClick={() => signIn("facebook",{callbackUrl:"/dashboard"})} className="btn btn-facebook" style={{ width:"100%",justifyContent:"center",marginBottom:"20px",height:"50px" }}>
            <i className="bx bxl-facebook" style={{ fontSize:"22px" }}></i>Sign up with Facebook
          </button>
          <div className="divider" style={{ marginBottom:"20px" }}><span>or register with email</span></div>

          {error && (
            <div style={{ background:"rgba(220,38,38,0.1)",border:"1px solid rgba(220,38,38,0.3)",borderRadius:"10px",padding:"12px 16px",marginBottom:"16px",display:"flex",alignItems:"center",gap:"10px" }}>
              <i className="bx bxs-error" style={{ color:"#dc2626" }}></i>
              <span style={{ fontSize:"14px",color:"#fca5a5" }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display:"flex",flexDirection:"column",gap:"14px" }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position:"relative" }}>
                <i className="bx bx-user" style={{ position:"absolute",left:"14px",top:"50%",transform:"translateY(-50%)",fontSize:"18px",color:"#475569" }}></i>
                <input className="input" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Your full name" required style={{ paddingLeft:"44px" }} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position:"relative" }}>
                <i className="bx bx-envelope" style={{ position:"absolute",left:"14px",top:"50%",transform:"translateY(-50%)",fontSize:"18px",color:"#475569" }}></i>
                <input type="email" className="input" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="you@email.com" required style={{ paddingLeft:"44px" }} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position:"relative" }}>
                <i className="bx bx-lock-alt" style={{ position:"absolute",left:"14px",top:"50%",transform:"translateY(-50%)",fontSize:"18px",color:"#475569" }}></i>
                <input type={show?"text":"password"} className="input" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} placeholder="Min. 8 characters" required minLength={8} style={{ paddingLeft:"44px",paddingRight:"44px" }} />
                <button type="button" onClick={()=>setShow(!show)} style={{ position:"absolute",right:"14px",top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"#475569" }}>
                  <i className={`bx ${show?"bx-hide":"bx-show"}`} style={{ fontSize:"18px" }}></i>
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Your Barangay <span style={{ color:"#475569",fontWeight:400,textTransform:"none",letterSpacing:0,fontSize:"12px" }}>(for targeted alerts)</span></label>
              <div style={{ position:"relative" }}>
                <i className="bx bx-map-pin" style={{ position:"absolute",left:"14px",top:"50%",transform:"translateY(-50%)",fontSize:"18px",color:"#475569",zIndex:1 }}></i>
                <select className="input" value={form.barangay} onChange={e=>setForm(f=>({...f,barangay:e.target.value}))} style={{ paddingLeft:"44px" }}>
                  <option value="">All of Sorsogon City</option>
                  {SORSOGON_BARANGAYS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width:"100%",justifyContent:"center",height:"50px",marginTop:"8px" }}>
              {loading ? <><i className="bx bx-loader-alt" style={{ animation:"spin 1s linear infinite" }}></i> Creating account...</> : <>Create Account <i className="bx bx-right-arrow-alt"></i></>}
            </button>
          </form>
          <p style={{ textAlign:"center",color:"#475569",fontSize:"14px",marginTop:"24px" }}>
            Already have an account? <Link href="/login" style={{ color:"#f59e0b",fontWeight:600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </>
  )
}
