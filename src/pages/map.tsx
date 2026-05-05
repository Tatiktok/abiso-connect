// src/pages/map.tsx
import { GetServerSideProps } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Head from "next/head"
import Navbar from "@/components/Navbar"
import { useState, useEffect, useRef } from "react"
import Script from "next/script"

interface Announcement {
  id: string
  title: string
  content: string
  affectedAreas: string[]
  interruptionDate?: string | null
  startTime?: string | null
  endTime?: string | null
  status: string
  createdAt: string
}

declare global { interface Window { google: any } }

export default function MapPage({ announcements, apiKey }: { announcements: Announcement[]; apiKey: string }) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)
  const [loaded, setLoaded] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [geocoding, setGeocoding] = useState(false)

  const affectedAreas = new Set<string>()
  announcements.filter(a => a.status === "ACTIVE").forEach(a => a.affectedAreas.forEach(area => affectedAreas.add(area)))

  const initMap = () => {
    if (!mapRef.current || !window.google) return

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 12.9734, lng: 124.0057 },
      zoom: 13,
      mapTypeId: "roadmap",
      styles: [
        { elementType: "geometry", stylers: [{ color: "#0d1f3c" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#0a1628" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
        { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d4af37" }] },
        { featureType: "administrative.neighborhood", elementType: "labels.text.fill", stylers: [{ color: "#8899bb" }] },
        { featureType: "road", elementType: "geometry", stylers: [{ color: "#1a3460" }] },
        { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#0f2447" }] },
        { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#1e4080" }] },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#0a1220" }] },
        { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3d5a8a" }] },
        { featureType: "poi", stylers: [{ visibility: "off" }] },
        { featureType: "transit", stylers: [{ visibility: "off" }] },
      ],
      zoomControl: true,
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: true,
    })
    mapInstance.current = map

    // Use Google Geocoding API to get accurate coordinates for each affected barangay
    if (affectedAreas.size === 0) return

    const geocoder = new window.google.maps.Geocoder()
    setGeocoding(true)
    let completed = 0
    const total = affectedAreas.size

    affectedAreas.forEach(barangay => {
      const query = `Barangay ${barangay}, Sorsogon City, Sorsogon, Philippines`
      
      geocoder.geocode({ address: query }, (results: any, status: any) => {
        completed++
        if (completed === total) setGeocoding(false)

        if (status !== "OK" || !results || results.length === 0) {
          console.warn(`Could not geocode: ${barangay}`)
          return
        }

        const location = results[0].geometry.location
        const lat = location.lat()
        const lng = location.lng()

        // Validate it's within Sorsogon area (roughly)
        if (lat < 12.8 || lat > 13.2 || lng < 123.8 || lng > 124.3) {
          console.warn(`Out of bounds result for ${barangay}: ${lat}, ${lng}`)
          return
        }

        const marker = new window.google.maps.Marker({
          position: { lat, lng },
          map,
          title: barangay,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 18,
            fillColor: "#f59e0b",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2.5,
          },
          animation: window.google.maps.Animation.DROP,
        })

        const iw = new window.google.maps.InfoWindow({
          content: `
            <div style="background:#0f2040;border-radius:10px;padding:14px 18px;min-width:200px;color:#f8fafc;font-family:sans-serif;">
              <div style="font-weight:700;font-size:15px;margin-bottom:6px;color:#f1f5f9;">Brgy. ${barangay}</div>
              <div style="display:flex;align-items:center;gap:8px;color:#f59e0b;font-size:13px;font-weight:600;">
                <span style="width:8px;height:8px;border-radius:50%;background:#f59e0b;display:inline-block;"></span>
                Power Interruption Active
              </div>
            </div>
          `,
        })

        marker.addListener("click", () => {
          iw.open(map, marker)
          setSelected(barangay)
        })
      })
    })
  }

  useEffect(() => { if (loaded) initMap() }, [loaded])

  const sidebarAnnouncements = selected
    ? announcements.filter(a => a.affectedAreas.includes(selected))
    : announcements.filter(a => a.status === "ACTIVE")

  return (
    <>
      <Head><title>Map – ABISO CONNECT</title></Head>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geocoding`}
        onLoad={() => setLoaded(true)}
      />
      <Navbar />
      <main style={{ paddingTop: "64px", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <div style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "20px 0", background: "rgba(15,32,64,0.6)" }}>
          <div className="container">
            <h1 style={{ fontFamily: "Syne", fontSize: "26px", fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.5px" }}>
              Sorsogon City Outage Map
            </h1>
            <p style={{ color: "#64748b", fontSize: "13px", marginTop: "4px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#f59e0b", fontWeight: 700 }}>●</span>
              <span style={{ color: "#94a3b8" }}>Gold markers show barangays with active power interruptions</span>
              {geocoding && <span style={{ color: "#3b82f6", fontSize: "12px" }}>· Locating barangays...</span>}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", flex: 1, height: "calc(100vh - 160px)" }}>
          {/* Map */}
          <div ref={mapRef} style={{ flex: 1, position: "relative" }}>
            {!loaded && (
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--navy-light)", flexDirection: "column", gap: "12px" }}>
                <i className="bx bx-loader-alt" style={{ fontSize: "40px", color: "#334155", animation: "spin 1s linear infinite" }}></i>
                <p style={{ color: "#475569" }}>Loading map...</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ width: "380px", flexShrink: 0, background: "#0d1f3c", borderLeft: "1px solid rgba(255,255,255,0.07)", overflowY: "auto", padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontFamily: "Syne", fontSize: "16px", fontWeight: 700, color: "#f1f5f9" }}>
                {selected ? `Brgy. ${selected}` : "Active Interruptions"}
              </h3>
              {selected && (
                <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: "#3b82f6", cursor: "pointer", fontSize: "13px", display: "flex", alignItems: "center", gap: "4px" }}>
                  <i className="bx bx-arrow-back"></i> Show all
                </button>
              )}
            </div>

            {sidebarAnnouncements.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 20px" }}>
                <i className="bx bx-check-shield" style={{ fontSize: "36px", color: "#10b981", display: "block", marginBottom: "12px" }}></i>
                <p style={{ color: "#64748b", fontSize: "14px" }}>
                  No active interruptions{selected ? ` in Brgy. ${selected}` : ""}.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {sidebarAnnouncements.map(ann => (
                  <div key={ann.id} style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "12px", padding: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                      <i className="bx bx-bolt-circle" style={{ color: "#f59e0b", fontSize: "16px" }}></i>
                      <span style={{ fontSize: "11px", color: "#f59e0b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>SORECO II</span>
                    </div>
                    <p style={{ fontSize: "14px", color: "#f1f5f9", fontWeight: 600, marginBottom: "10px", lineHeight: 1.4 }}>{ann.title}</p>
                    {ann.interruptionDate && (
                      <p style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                        <i className="bx bx-calendar" style={{ color: "#3b82f6" }}></i>
                        {new Date(ann.interruptionDate).toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" })}
                        {ann.startTime && ` · ${ann.startTime}${ann.endTime ? ` – ${ann.endTime}` : ""}`}
                      </p>
                    )}
                    <div style={{ marginTop: "10px" }}>
                      <p style={{ fontSize: "11px", color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
                        Affected Areas
                      </p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {ann.affectedAreas.map(area => (
                          <span key={area} style={{
                            fontSize: "12px",
                            color: "#fbbf24",
                            background: "rgba(245,158,11,0.2)",
                            border: "1px solid rgba(245,158,11,0.4)",
                            borderRadius: "6px",
                            padding: "4px 10px",
                            fontWeight: 600,
                          }}>
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions)
  if (!session) return { redirect: { destination: "/login", permanent: false } }
  const announcements = await prisma.announcement.findMany({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    take: 20,
  })
  return {
    props: {
      announcements: JSON.parse(JSON.stringify(announcements)),
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    }
  }
}
