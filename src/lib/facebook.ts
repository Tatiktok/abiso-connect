// src/lib/facebook.ts
export const SORSOGON_BARANGAYS = [
  "Abuyog", "Almendras", "Añon", "Ariman", "Bacon", "Balete", "Bario", "Basud", "Bato",
  "Bibincahan", "Bitan-o/Dalipay", "Bogña", "Buenavista", "Buhatan", "Bulabog", "Burabod",
  "Busing", "Cabarbuhan", "Cabid-an", "Cahigue", "Campostela", "Capuy", "Carrera", "Casili",
  "Castithan", "Cogon", "Dará", "Del Rosario", "Dolos", "Gate", "Gatbo", "Genova", "Gimaloto",
  "Gubat", "Guinlajon", "Harbon", "Igbaras", "Irosin", "Jupi", "Kaiba", "Kasipitan", "Laban",
  "Lagonoy", "Languidon", "Lidong", "Lourdes", "Macabog", "Macasidor", "Magallanes", "Magsaysay",
  "Maharlika", "Manlabas", "Marinab", "Mercedes", "Milagrosa", "Namantao", "Napo", "Osiao",
  "Palanas", "Panlayaan", "Pangpang", "Panganiban", "Piot", "Poblacion", "Prieto Diaz", "Rawis",
  "Rizal", "Salog", "San Isidro", "San Juan", "San Pascual", "Santa Barbara", "Santa Cruz",
  "Sawanga", "Sibago", "Sirangan", "Tagas", "Talisay", "Tancol", "Tigkan", "Tongdol", "Tulay",
  "Tugos", "Verde"
]

export interface FBPost {
  id: string
  message: string
  created_time: string
}

export function isInterruptionPost(post: FBPost): boolean {
  if (!post.message) return false
  const msg = post.message.toLowerCase()
  return ["power interruption", "scheduled interruption", "power outage", "walang kuryente",
    "maintenance interruption", "interruption notice", "power supply interruption"].some(k => msg.includes(k))
}

export function parseInterruptionPost(post: FBPost) {
  const content = post.message || ""
  const lines = content.split("\n").map(l => l.trim()).filter(Boolean)
  const title = lines[0]?.slice(0, 120) || "Power Interruption Notice"

  const affectedAreas: string[] = []
  SORSOGON_BARANGAYS.forEach(b => {
    if (content.toUpperCase().includes(b.toUpperCase())) affectedAreas.push(b)
  })

  let interruptionDate: Date | null = null
  const dateMatch = content.match(/(\w+ \d{1,2},?\s*\d{4})/i)
  if (dateMatch) { const d = new Date(dateMatch[1]); if (!isNaN(d.getTime())) interruptionDate = d }

  let startTime: string | null = null
  let endTime: string | null = null
  const timeMatch = content.match(/(\d{1,2}(?::\d{2})?\s*(?:AM|PM))\s*(?:to|-)\s*(\d{1,2}(?::\d{2})?\s*(?:AM|PM))/i)
  if (timeMatch) { startTime = timeMatch[1]; endTime = timeMatch[2] }

  return { title, content, affectedAreas: affectedAreas.length > 0 ? affectedAreas : ["Sorsogon City"], interruptionDate, startTime, endTime }
}

export async function fetchSorecoPagePosts(): Promise<FBPost[]> {
  const pageId = process.env.FB_PAGE_ID
  const accessToken = process.env.FB_PAGE_ACCESS_TOKEN
  if (!pageId || !accessToken || pageId === "placeholder") return []
  try {
    const url = `https://graph.facebook.com/v19.0/${pageId}/feed?fields=id,message,created_time&limit=10&access_token=${accessToken}`
    const res = await fetch(url, { cache: "no-store" })
    const data = await res.json()
    if (data.error) {
      console.error("FB API error:", JSON.stringify(data.error))
      return []
    }
    console.log("FB API response:", JSON.stringify(data).slice(0, 500))
    return data.data || []
  } catch { return [] }
}
