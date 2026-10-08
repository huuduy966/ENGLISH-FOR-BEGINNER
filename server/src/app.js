require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const lessonRoutes = require('./routes/lessonRoutes');
const vocabRoutes = require('./routes/vocabRoutes');
const testRoutes = require('./routes/testRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Logging in non-test mode
if (process.env.NODE_ENV !== 'test') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString().substring(11, 19)} [${req.method}] ${req.path}`);
    next();
  });
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', name: 'English for Beginner API', timestamp: new Date() });
});

// App Routes
app.use('/api/auth', authRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/vocabulary', vocabRoutes);
app.use('/api', testRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
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
