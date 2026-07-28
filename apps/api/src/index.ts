import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth';
import { apiRouter } from './routes';
import { authMiddleware } from './middleware/auth';

const app = express();

// Accept JSON request bodies.
app.use(express.json());

// In dev, allow the frontend to talk to this API.
// For production, prefer restricting `origin` via an env var.
app.use(
  cors({
    origin: true,
    credentials: false,
  }),
);

// Public routes (no auth required)
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});
app.use('/v1/auth', authRouter);

// Auth middleware protects all routes below
app.use('/v1', authMiddleware);

// Protected routes
app.use('/v1', apiRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'not_found' });
});

const port = Number(process.env.PORT ?? 4001);
app.listen(port, () => {
  console.log(`[api] listening on http://localhost:${port}`);
});
