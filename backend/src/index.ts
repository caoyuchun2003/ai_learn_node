import express from 'express';
import cors from 'cors';
import courseRoutes from './routes/courses.js';
import chapterRoutes from './routes/chapters.js';
import pathRoutes from './routes/paths.js';
import progressRoutes from './routes/progress.js';

const app = express();
const PORT = process.env.PORT || 3001;

const defaultOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://180.76.180.105',
  'https://caoyuchun2003.github.io',
  'https://ai.yuchuntest.com',
];

const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean)
  : defaultOrigins;

// Middleware
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
  })
);
app.use(express.json());

// Routes
app.use('/api/courses', courseRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/paths', pathRoutes);
app.use('/api/progress', progressRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'AI Learning Platform API' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
