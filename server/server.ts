import express, { Request, Response } from 'express';
import 'dotenv/config';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth.js';
import userRouter from './routes/userRoutes.js';
import projectRouter from './routes/projectRoutes.js';

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const port = 3000;

const CLIENT_DIST_PATH = path.resolve(
  __dirname,
  "client"
);

// Serve frontend
app.use(
  express.static(CLIENT_DIST_PATH)
);

const corsOptions = {
    origin: process.env.TRUSTED_ORIGINS?.split(',') || [],
    credentials: true,
}

app.use(cors(corsOptions));

app.all('/api/auth/{*any}', toNodeHandler(auth));

app.use(express.json({limit: '50mb'}))

app.use('/api/user', userRouter)
app.use('/api/project', projectRouter)

// React Router fallback
app.use((req, res) => {
  res.sendFile(path.join(CLIENT_DIST_PATH, "index.html"));
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running at http://localhost:${port}`);
});