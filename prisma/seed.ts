// prisma/seed.ts
// Run with: npx ts-node prisma/seed.ts
// This creates the default admin account

const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")

const prisma = new PrismaClient()

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@abisoconnect.com"
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@2024!"

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } })

  if (existing) {
    console.log(`✅ Admin already exists: ${adminEmail}`)
    return
  }

  const hashed = await bcrypt.hash(adminPassword, 12)

  await prisma.user.create({
    data: {
      name: "ABISO Admin",
      email: adminEmail,
      password: hashed,
      role: "admin",
      municipality: "Sorsogon City",
    },
  })

  console.log(`✅ Admin created successfully!`)
  console.log(`📧 Email: ${adminEmail}`)
  console.log(`🔑 Password: ${adminPassword}`)
  console.log(`\n⚠️  Change your password after first login!`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
