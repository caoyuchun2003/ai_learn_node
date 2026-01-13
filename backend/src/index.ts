import express from 'express';
import cors from 'cors';
import courseRoutes from './routes/courses.js';
import chapterRoutes from './routes/chapters.js';
import pathRoutes from './routes/paths.js';
import progressRoutes from './routes/progress.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
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
