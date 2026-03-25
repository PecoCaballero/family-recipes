import express from 'express';
import cors from 'cors';

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

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use((_req, res) => {
  res.status(404).json({ error: 'not_found' });
});

const port = Number(process.env.PORT ?? 4001);
app.listen(port, () => {
  console.log(`[api] listening on http://localhost:${port}`);
});
