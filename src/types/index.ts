// src/types/index.ts
export interface Announcement {
  id: string
  title: string
  content: string
  source: string
  affectedAreas: string[]
  interruptionDate?: string | null
  startTime?: string | null
  endTime?: string | null
  status: string
  createdAt: string
}

export interface UserProfile {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  barangay?: string | null
  municipality?: string | null
  role?: string | null
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      barangay?: string | null
      role?: string | null
    }
  }
  interface User {
    barangay?: string | null
    role?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    barangay?: string | null
    role?: string | null
  }
}
