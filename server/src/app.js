require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const lessonRoutes = require('./routes/lessonRoutes');
const vocabRoutes = require('./routes/vocabRoutes');
const testRoutes = require('./routes/testRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const adminRoutes = require('./routes/adminRoutes');
const dailyPracticeRoutes = require('./routes/dailyPracticeRoutes');
const examRoutes = require('./routes/examRoutes');
const { globalLimiter } = require('./middlewares/rateLimiter');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust reverse proxy (Docker, Nginx, Render, Railway, Heroku) for accurate IP resolution
app.set('trust proxy', process.env.TRUST_PROXY === 'false' ? false : 1);

app.use(cors());
app.use(express.json());

// Logging in non-test mode
if (process.env.NODE_ENV !== 'test') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString().substring(11, 19)} [${req.method}] ${req.path}`);
    next();
  });
}

// Health check (exempt from rate limit)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', name: 'English for Beginner API', timestamp: new Date() });
});

// Global Rate Limiter for all API endpoints (120 req/min per client)
app.use('/api', globalLimiter);

// App Routes
app.use('/api/auth', authRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/vocabulary', vocabRoutes);
app.use('/api', testRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/daily-practice', dailyPracticeRoutes);
app.use('/api/exam', examRoutes);

// Serve static frontend build if present (production / deployment)
const clientDist = path.join(__dirname, '../../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// 404 handler for API routes
app.use('/api', (req, res) => {
  res.status(404).json({ message: `Đường dẫn ${req.method} ${req.path} không tồn tại.` });
});

// Fallback 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Đường dẫn ${req.method} ${req.path} không tồn tại.` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ message: 'Lỗi máy chủ nội bộ', error: err.message });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 E4B Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
