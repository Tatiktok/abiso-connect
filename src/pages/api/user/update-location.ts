// src/pages/api/user/update-location.ts
import { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.id) return res.status(401).json({ error: "Unauthorized" })

  const { barangay, municipality, phone } = req.body

  try {
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        barangay: barangay || null,
        municipality: municipality || "Sorsogon City",
        phone: phone || null,
      },
    })
    return res.status(200).json({ success: true, user: { barangay: user.barangay } })
  } catch (err: any) {
    // If phone column doesn't exist yet, update without it
    if (err.message?.includes("phone")) {
      const user = await prisma.user.update({
        where: { id: session.user.id },
        data: {
          barangay: barangay || null,
          municipality: municipality || "Sorsogon City",
        },
      })
      return res.status(200).json({ success: true, user: { barangay: user.barangay } })
    }
    return res.status(500).json({ error: "Failed to update" })
  }
}
