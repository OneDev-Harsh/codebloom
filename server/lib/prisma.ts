import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg'
import prismaPkg from "../generated/prisma/index.js"
const { PrismaClient } = prismaPkg

const connectionString = `${process.env.DATABASE_URL}`

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

export default prisma;