import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { createRequire } from "module"

const require = createRequire(import.meta.url)

// ⬇️ THIS IS THE KEY LINE
const prismaPkg = require("../generated/prisma/index.js")

const { PrismaClient } = prismaPkg

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error("DATABASE_URL is not set")
}

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

export default prisma
