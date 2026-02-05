declare module "../generated/prisma/index.js" {
  import { PrismaClient } from "@prisma/client"

  const prismaPkg: {
    PrismaClient: typeof PrismaClient
  }

  export default prismaPkg
}
