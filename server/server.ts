import express, { Request, Response } from 'express'
import 'dotenv/config'
import cors from 'cors'
import { toNodeHandler } from 'better-auth/node'
import { auth } from './lib/auth.js'
import userRouter from './routes/userRoutes.js'
import projectRouter from './routes/projectRoutes.js'
import aiRouter from './routes/aiRoutes.js'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const port = process.env.PORT || 3000

const corsOptions = {
  origin: process.env.TRUSTED_ORIGINS?.split(',') || [],
  credentials: true,
}

app.use(cors(corsOptions))
app.use(express.json({ limit: '50mb' }))

/* ================================
   API ROUTES
================================ */
app.use('/api/ai', aiRouter)
app.use('/api/user', userRouter)
app.use('/api/project', projectRouter)
app.use('/api/auth', toNodeHandler(auth))

/* ================================
   FRONTEND (VITE BUILD)
================================ */

// path to client/dist
const clientDistPath = path.join(__dirname, '../../client/dist')

// serve static assets
app.use(express.static(clientDistPath))

// SPA fallback (important)
app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(clientDistPath, 'index.html'))
})

/* ================================
   START SERVER
================================ */
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
