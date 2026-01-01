import express, { Request, Response } from 'express';
import 'dotenv/config';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth.js';
import userRouter from './routes/userRoutes.js';
import projectRouter from './routes/projectRoutes.js';

import path from "path";

const app = express();

const port = 3000;

const corsOptions = {
    origin: process.env.TRUSTED_ORIGINS?.split(',') || [],
    credentials: true,
}

app.use(cors(corsOptions));

app.all('/api/auth/{*any}', toNodeHandler(auth));

app.use(express.json({limit: '50mb'}))

app.get('/', (req: Request, res: Response) => {
    res.send('Server is Live!');
});
app.use('/api/user', userRouter)
app.use('/api/project', projectRouter)

// Serve frontend
app.use(
  express.static(
    path.join(__dirname, "../../client/dist")
  )
);

// React Router fallback
app.use((req, res) => {
  res.sendFile(
    path.join(__dirname, "../../client/dist/index.html")
  );
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});