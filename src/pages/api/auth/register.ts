// src/pages/api/auth/register.ts
import { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })
  const { name, email, password, barangay } = req.body
  if (!name || !email || !password) return res.status(400).json({ error: "Name, email and password required" })
  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) return res.status(400).json({ error: "Email already registered" })
  const hashed = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: { name, email, password: hashed, barangay: barangay || null, municipality: "Sorsogon City", role: "user" },
  })
  return res.status(201).json({ message: "Account created", user: { id: user.id, name: user.name, email: user.email } })
}
