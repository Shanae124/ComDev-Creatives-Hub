require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Routes
const authRoutes = require('./routes/auth');
const coursesRoutes = require('./routes/courses');
const modulesRoutes = require('./routes/modules');
const lessonsRoutes = require('./routes/lessons');
const enrollmentsRoutes = require('./routes/enrollments');
const progressRoutes = require('./routes/progress');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads
app.use('/uploads', express.static(path.join(__dirname, process.env.UPLOAD_DIR || './uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/modules', modulesRoutes);
app.use('/api/lessons', lessonsRoutes);
app.use('/api/enrollments', enrollmentsRoutes);
app.use('/api/progress', progressRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
