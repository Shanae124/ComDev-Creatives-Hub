const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./db');
const { authenticate, authorize, errorLogger, JWT_SECRET } = require('./middleware-backend');
const { sendVerificationEmail, sendPasswordResetEmail, verifyEmailConfig } = require('./emailService');
const { randomUUID } = require('crypto');
const {
  helmetConfig,
  corsOptions,
  generalLimiter,
  authLimiter,
  emailLimiter,
  requestLogger,
  errorHandler,
  notFoundHandler,
  validateRegistration,
  validateLogin,
  validateCourse,
  validateModule,
  validateAssignment,
  handleValidationErrors,
  sanitizeHTML,
} = require('./security');
require('dotenv').config();

const app = express();

// Security Middleware
console.log('[Security] Applying security middleware...');
app.use(helmetConfig);
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(requestLogger);
app.use('/api', generalLimiter);
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// ensure uploads dir exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
const upload = multer({ dest: uploadsDir });

// ==================== HEALTH CHECK ====================
app.get("/", (req, res) => {
  res.json({ 
    status: 'online',
    service: 'ProtexxaLearn LMS',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// System health check with database connectivity
app.get('/health', async (req, res) => {
  try {
    const dbCheck = await pool.query('SELECT NOW()');
    const emailService = process.env.EMAIL_SERVICE || 'ethereal';
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: 'connected',
          responseTime: dbCheck.duration
        },
        email: {
          service: emailService,
          configured: emailService !== 'ethereal'
        }
      },
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        unit: 'MB'
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: 'Database connection failed',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== AUTHENTICATION ====================
app.post('/auth/register', authLimiter, validateRegistration, handleValidationErrors, async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "name, email, and password are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = randomUUID();
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const result = await pool.query(
      "INSERT INTO users (name, email, password_hash, role, verification_token, verification_token_expires) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, role, email_verified",
      [name, email, hashedPassword, role || "student", verificationToken, tokenExpiry]
    );

    // Send verification email
    const emailResult = await sendVerificationEmail(email, name, verificationToken);
    
    // For development, include preview URL
    const response = {
      user: result.rows[0],
      message: "Registration successful! Please check your email to verify your account.",
    };

    if (emailResult.previewUrl) {
      response.emailPreviewUrl = emailResult.previewUrl;
      response.devNote = "Using test email - preview at: " + emailResult.previewUrl;
    }

    res.json(response);
  } catch (err) {
    // Handle duplicate email: resend verification if not verified
    const isUniqueViolation = err && (err.code === '23505' || (err.message || '').toLowerCase().includes('duplicate key'));
    if (isUniqueViolation) {
      try {
        const existing = await pool.query("SELECT id, name, email, role, email_verified FROM users WHERE email = $1", [email]);
        if (existing.rows.length > 0) {
          const user = existing.rows[0];
          if (!user.email_verified) {
            const newToken = randomUUID();
            const newExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
            await pool.query(
              "UPDATE users SET verification_token = $1, verification_token_expires = $2 WHERE id = $3",
              [newToken, newExpiry, user.id]
            );
            const emailResult = await sendVerificationEmail(email, user.name || name || 'User', newToken);
            const response = {
              user: { id: user.id, name: user.name, email: user.email, role: user.role, email_verified: false },
              message: "Account already exists but is not verified. We've resent the verification email.",
            };
            if (emailResult.previewUrl) {
              response.emailPreviewUrl = emailResult.previewUrl;
              response.devNote = "Using test email - preview at: " + emailResult.previewUrl;
            }
            return res.json(response);
          }
        }
        return res.status(400).json({ error: "Email already registered" });
      } catch (e) {
        return res.status(400).json({ error: "Email already registered" });
      }
    }
    res.status(500).json({ error: err.message });
  }
});

app.post('/auth/login', authLimiter, validateLogin, handleValidationErrors, async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check if email is verified
    if (!user.email_verified) {
      return res.status(403).json({ 
        error: "Please verify your email before logging in. Check your inbox for the verification link.",
        emailVerified: false 
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify email
app.get("/auth/verify-email", async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: "Verification token is required" });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE verification_token = $1 AND verification_token_expires > NOW()",
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid or expired verification token" });
    }

    const user = result.rows[0];

    // Mark email as verified
    await pool.query(
      "UPDATE users SET email_verified = TRUE, verification_token = NULL, verification_token_expires = NULL WHERE id = $1",
      [user.id]
    );

    // Generate JWT token for automatic login
    const jwtToken = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ 
      message: "Email verified successfully! You can now log in.",
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token: jwtToken
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Resend verification email
app.post("/auth/resend-verification", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = result.rows[0];

    if (user.email_verified) {
      return res.status(400).json({ error: "Email is already verified" });
    }

    // Generate new verification token
    const verificationToken = randomUUID();
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await pool.query(
      "UPDATE users SET verification_token = $1, verification_token_expires = $2 WHERE id = $3",
      [verificationToken, tokenExpiry, user.id]
    );

    // Send verification email
    const emailResult = await sendVerificationEmail(user.email, user.name, verificationToken);
    
    const response = {
      message: "Verification email sent! Please check your inbox.",
    };

    if (emailResult.previewUrl) {
      response.emailPreviewUrl = emailResult.previewUrl;
      response.devNote = "Using test email - preview at: " + emailResult.previewUrl;
    }

    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== USERS ====================
app.get("/users", authenticate, authorize("admin", "instructor"), async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name, email, role, created_at FROM users ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/users/:id", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, role, avatar_url, bio, created_at FROM users WHERE id = $1",
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/users/:id", authenticate, async (req, res) => {
  const { name, bio, avatar_url } = req.body;

  if (req.user.id !== parseInt(req.params.id) && req.user.role !== "admin") {
    return res.status(403).json({ error: "Cannot update other users" });
  }

  try {
    const result = await pool.query(
      "UPDATE users SET name = COALESCE($1, name), bio = COALESCE($2, bio), avatar_url = COALESCE($3, avatar_url), updated_at = NOW() WHERE id = $4 RETURNING *",
      [name, bio, avatar_url, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== COURSES ====================
app.post("/courses", authenticate, authorize("admin", "instructor"), async (req, res) => {
  const { title, description, content_html } = req.body;
  const cleanHtml = sanitizeHTML(content_html);

  if (!title) {
    return res.status(400).json({ error: "title is required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO courses (title, description, content_html, created_by, status) VALUES ($1, $2, $3, $4, 'draft') RETURNING *",
      [title, description || "", cleanHtml || "", req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all courses - authenticated users can see available courses
app.get("/courses", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = `
      SELECT c.*, u.name as instructor_name,
        (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id AND e.user_id = $1) as enrolled,
        (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) as total_enrollments,
        (SELECT COUNT(*) FROM modules m WHERE m.course_id = c.id) as module_count
      FROM courses c 
      LEFT JOIN users u ON u.id = c.created_by
    `;

    let params = [userId];

    // Filter based on user role
    if (userRole === 'admin') {
      // Admins see all courses
      query += ` ORDER BY c.created_at DESC`;
    } else if (userRole === 'instructor') {
      // Instructors see published courses + their own courses
      query += ` WHERE c.status = 'published' OR c.created_by = $2
                 ORDER BY c.created_at DESC`;
      params.push(userId);
    } else {
      // Students see only published courses
      query += ` WHERE c.status = 'published'
                 ORDER BY c.created_at DESC`;
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all courses (admin - includes draft and archived)
app.get("/admin/courses", authenticate, authorize("admin", "instructor"), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, u.name as instructor_name,
        (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) as enrollment_count,
        (SELECT COUNT(*) FROM modules m WHERE m.course_id = c.id) as module_count
      FROM courses c 
      LEFT JOIN users u ON u.id = c.created_by 
      ORDER BY c.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/courses/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT c.*, u.name as instructor_name FROM courses c LEFT JOIN users u ON u.id = c.created_by WHERE c.id = $1",
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Course not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/courses/:id", authenticate, authorize("admin", "instructor"), async (req, res) => {
  const { title, description, content_html, status, thumbnail_url } = req.body;
  const cleanHtml = sanitizeHTML(content_html);

  try {
    const result = await pool.query(
      `UPDATE courses 
       SET title = COALESCE($1, title), 
           description = COALESCE($2, description), 
           content_html = COALESCE($3, content_html),
           status = COALESCE($4, status),
           thumbnail_url = COALESCE($5, thumbnail_url),
           updated_at = NOW()
       WHERE id = $6 RETURNING *`,
         [title, description, cleanHtml, status, thumbnail_url, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete("/courses/:id", authenticate, authorize("admin", "instructor"), async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM courses WHERE id = $1 RETURNING *", [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Course not found" });
    }
    res.json({ message: "Course deleted successfully", course: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== ENROLLMENTS ====================
app.post("/enroll", authenticate, async (req, res) => {
  const { user_id, course_id } = req.body;

  if (!user_id || !course_id) {
    return res.status(400).json({ error: "user_id and course_id are required" });
  }

  if (req.user.id !== user_id && req.user.role !== "admin") {
    return res.status(403).json({ error: "Cannot enroll other users" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO enrollments (user_id, course_id, status) 
       VALUES ($1, $2, 'active')
       ON CONFLICT (user_id, course_id) DO UPDATE SET status='active', updated_at=NOW()
       RETURNING *`,
      [user_id, course_id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/enrollments", authenticate, async (req, res) => {
  try {
    const query = req.user.role === "admin" 
      ? `SELECT e.id, e.status, e.enrolled_at, u.id as user_id, u.name as user_name, u.email, c.id as course_id, c.title as course_title
         FROM enrollments e
         JOIN users u ON u.id = e.user_id
         JOIN courses c ON c.id = e.course_id
         ORDER BY e.id ASC`
      : `SELECT e.id, e.status, e.enrolled_at, u.id as user_id, u.name as user_name, c.id as course_id, c.title as course_title
         FROM enrollments e
         JOIN users u ON u.id = e.user_id
         JOIN courses c ON c.id = e.course_id
         WHERE e.user_id = $1
         ORDER BY e.id ASC`;

    const result = await pool.query(query, req.user.role === "admin" ? [] : [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/courses/:course_id/enrollments", authenticate, authorize("admin", "instructor"), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.id, e.status, u.id as user_id, u.name, u.email 
       FROM enrollments e
       JOIN users u ON u.id = e.user_id
       WHERE e.course_id = $1
       ORDER BY u.name ASC`,
      [req.params.course_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== MODULES ====================
app.post("/modules", authenticate, authorize("admin", "instructor"), async (req, res) => {
  const { course_id, title, description, sort_order } = req.body;

  if (!course_id || !title) {
    return res.status(400).json({ error: "course_id and title are required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO modules (course_id, title, description, sort_order) VALUES ($1, $2, $3, $4) RETURNING *",
      [course_id, title, description || "", sort_order || 1]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/courses/:course_id/modules", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM modules WHERE course_id = $1 ORDER BY sort_order ASC",
      [req.params.course_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/modules/:id", authenticate, authorize("admin", "instructor"), async (req, res) => {
  const { title, description, sort_order } = req.body;

  try {
    const result = await pool.query(
      `UPDATE modules 
       SET title = COALESCE($1, title), 
           description = COALESCE($2, description),
           sort_order = COALESCE($3, sort_order),
           updated_at = NOW()
       WHERE id = $4 RETURNING *`,
      [title, description, sort_order, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ==================== LESSONS ====================
app.post("/lessons", authenticate, authorize("admin", "instructor"), async (req, res) => {
  const { module_id, title, content_html, lesson_type, sort_order, duration_minutes } = req.body;

  if (!module_id || !title) {
    return res.status(400).json({ error: "module_id and title are required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO lessons (module_id, title, content_html, lesson_type, sort_order, duration_minutes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [module_id, title, content_html || "", lesson_type || "reading", sort_order || 1, duration_minutes || 0]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/modules/:module_id/lessons", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM lessons WHERE module_id = $1 ORDER BY sort_order ASC",
      [req.params.module_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/lessons/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM lessons WHERE id = $1", [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Lesson not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/lessons/:id", authenticate, authorize("admin", "instructor"), async (req, res) => {
  const { title, content_html, lesson_type, sort_order, duration_minutes } = req.body;

  try {
    const result = await pool.query(
      `UPDATE lessons 
       SET title = COALESCE($1, title), 
           content_html = COALESCE($2, content_html),
           lesson_type = COALESCE($3, lesson_type),
           sort_order = COALESCE($4, sort_order),
           duration_minutes = COALESCE($5, duration_minutes),
           updated_at = NOW()
       WHERE id = $6 RETURNING *`,
      [title, content_html, lesson_type, sort_order, duration_minutes, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ==================== LESSON PROGRESS ====================
app.post("/lesson-progress", authenticate, async (req, res) => {
  const { lesson_id, status, progress_percent, time_spent_seconds } = req.body;

  if (!lesson_id) {
    return res.status(400).json({ error: "lesson_id is required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO lesson_progress (user_id, lesson_id, status, progress_percent, time_spent_seconds, started_at)
       VALUES ($1, $2, $3, $4, $5, CASE WHEN $3 = 'in_progress' THEN NOW() ELSE started_at END)
       ON CONFLICT (user_id, lesson_id) DO UPDATE 
       SET status = COALESCE($3, status),
           progress_percent = COALESCE($4, progress_percent),
           time_spent_seconds = COALESCE($5, time_spent_seconds),
           completed_at = CASE WHEN $3 = 'completed' THEN NOW() ELSE completed_at END,
           updated_at = NOW()
       RETURNING *`,
      [req.user.id, lesson_id, status || "in_progress", progress_percent || 0, time_spent_seconds || 0]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/lesson-progress/:lesson_id", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM lesson_progress WHERE user_id = $1 AND lesson_id = $2",
      [req.user.id, req.params.lesson_id]
    );
    res.json(result.rows[0] || { status: "not_started", progress_percent: 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/courses/:course_id/progress", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        SUM(CASE WHEN lp.status = 'completed' THEN 1 ELSE 0 END) as completed_lessons,
        COUNT(DISTINCT lp.lesson_id) as total_lessons,
        ROUND(AVG(lp.progress_percent)) as avg_progress
       FROM lesson_progress lp
       JOIN lessons l ON l.id = lp.lesson_id
       JOIN modules m ON m.id = l.module_id
       WHERE m.course_id = $1 AND lp.user_id = $2`,
      [req.params.course_id, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== ASSIGNMENTS ====================
app.post("/assignments", authenticate, authorize("admin", "instructor"), async (req, res) => {
  const { course_id, title, description_html, due_date, points_possible, submission_type } = req.body;

  if (!course_id || !title) {
    return res.status(400).json({ error: "course_id and title are required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO assignments (course_id, title, description_html, due_date, points_possible, submission_type) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [course_id, title, description_html || "", due_date || null, points_possible || 100, submission_type || "text"]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/courses/:course_id/assignments", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM assignments WHERE course_id = $1 ORDER BY due_date ASC",
      [req.params.course_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/assignments/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM assignments WHERE id = $1", [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Assignment not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== SUBMISSIONS ====================
app.post("/submissions", authenticate, async (req, res) => {
  const { assignment_id, content_html, file_url } = req.body;

  if (!assignment_id) {
    return res.status(400).json({ error: "assignment_id is required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO submissions (assignment_id, user_id, content_html, file_url)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (assignment_id, user_id) DO UPDATE
       SET content_html = $3, file_url = $4, updated_at = NOW()
       RETURNING *`,
      [assignment_id, req.user.id, content_html || "", file_url || ""]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/assignments/:assignment_id/submissions", authenticate, authorize("admin", "instructor"), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, u.name, u.email FROM submissions s
       JOIN users u ON u.id = s.user_id
       WHERE s.assignment_id = $1
       ORDER BY s.submitted_at DESC`,
      [req.params.assignment_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/submissions/:id", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.* FROM submissions s
       WHERE s.id = $1 AND (s.user_id = $2 OR $3 IN ('admin', 'instructor'))`,
      [req.params.id, req.user.id, req.user.role]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Submission not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== GRADES ====================
app.post("/grades", authenticate, authorize("admin", "instructor"), async (req, res) => {
  const { submission_id, assignment_id, user_id, course_id, points_earned, feedback_html } = req.body;

  if (!assignment_id || !user_id || !course_id) {
    return res.status(400).json({ error: "assignment_id, user_id, and course_id are required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO grades (submission_id, assignment_id, user_id, course_id, points_earned, feedback_html, graded_by, graded_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       ON CONFLICT (assignment_id, user_id) DO UPDATE
       SET points_earned = $5, feedback_html = $6, graded_by = $7, graded_at = NOW()
       RETURNING *`,
      [submission_id || null, assignment_id, user_id, course_id, points_earned || null, feedback_html || "", req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/courses/:course_id/grades", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT g.*, a.title as assignment_title, u.name as user_name
       FROM grades g
       JOIN assignments a ON a.id = g.assignment_id
       JOIN users u ON u.id = g.user_id
       WHERE g.course_id = $1 AND (g.user_id = $2 OR $3 IN ('admin', 'instructor'))
       ORDER BY a.id, u.name`,
      [req.params.course_id, req.user.id, req.user.role]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== ANNOUNCEMENTS ====================
app.post("/announcements", authenticate, authorize("admin", "instructor"), async (req, res) => {
  const { course_id, title, content_html } = req.body;

  if (!course_id || !title || !content_html) {
    return res.status(400).json({ error: "course_id, title, and content_html are required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO announcements (course_id, created_by, title, content_html) VALUES ($1, $2, $3, $4) RETURNING *",
      [course_id, req.user.id, title, content_html]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/courses/:course_id/announcements", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, u.name as created_by_name 
       FROM announcements a
       JOIN users u ON u.id = a.created_by
       WHERE a.course_id = $1
       ORDER BY a.created_at DESC`,
      [req.params.course_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== ERROR HANDLING ====================
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${new Date().toISOString()} - ${err.message}`);
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

// ==================== START SERVER ====================
// 404 Handler (must be after all routes)
app.use(notFoundHandler);

// Error Handler (must be last)
app.use(errorHandler);

// ==================== START SERVER ====================
const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log('\n================================================');
  console.log('🚀 ProtexxaLearn LMS - Production Ready');
  console.log('================================================');
  console.log(`✅ Server:        http://localhost:${PORT}`);
  console.log(`📚 Database:      ${process.env.DB_NAME || 'Protexxalearn'}@${process.env.DB_HOST || 'localhost'}`);
  console.log(`🔐 Auth:          JWT (${process.env.JWT_EXPIRY || '7d'} expiry)`);
  console.log(`📧 Email:         ${process.env.EMAIL_SERVICE || 'ethereal'}`);
  console.log(`🌍 Environment:   ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔒 Security:      Helmet, Rate Limiting, Input Validation`);
  console.log('================================================\n');
  
  // Verify email configuration
  const emailConfigured = await verifyEmailConfig();
  if (!emailConfigured) {
    console.warn('⚠️  Email service not fully configured. Set EMAIL_SERVICE and credentials in .env');
  }
  
  // Database health check
  try {
    await pool.query('SELECT 1');
    console.log('✓ Database connection verified\n');
  } catch (err) {
    console.error('✗ Database connection failed:', err.message);
  }
});

// ==================== IMPORT IMSCC (Upload and Migrate) ====================
app.post("/import-course", authenticate, authorize("admin", "instructor"), upload.single('imscc'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded (field name: imscc)' });

  const BrightspaceMigrator = require('./brightspaceMigrator');
  const filePath = req.file.path;

  try {
    const migrator = new BrightspaceMigrator(filePath);
    const data = await migrator.migrate();

    // Create course
    const coursePayload = data.course || { title: 'Imported Course', description: '' };
    const courseRes = await pool.query(
      "INSERT INTO courses (title, description, content_html, created_by, status) VALUES ($1,$2,$3,$4,'draft') RETURNING *",
      [coursePayload.title, coursePayload.description || '', coursePayload.content_html || '', req.user.id]
    );
    const createdCourse = courseRes.rows[0];

    // Create modules
    const moduleMap = [];
    for (const [i, mod] of (data.modules || []).entries()) {
      const modRes = await pool.query(
        "INSERT INTO modules (course_id, title, description, sort_order) VALUES ($1,$2,$3,$4) RETURNING *",
        [createdCourse.id, mod.title || `Module ${i + 1}`, mod.description || '', mod.sort_order || i + 1]
      );
      moduleMap.push(modRes.rows[0].id);
    }

    // Attach lessons to modules (fallback to first module)
    for (const [i, lesson] of (data.lessons || []).entries()) {
      const module_id = moduleMap[i] || moduleMap[0] || null;
      if (!module_id) continue;
      await pool.query(
        "INSERT INTO lessons (module_id, title, content_html, lesson_type, sort_order, duration_minutes) VALUES ($1,$2,$3,$4,$5,$6)",
        [module_id, lesson.title || `Lesson ${i + 1}`, lesson.content_html || '', lesson.lesson_type || 'reading', lesson.sort_order || i + 1, lesson.duration_minutes || 0]
      );
    }

    // cleanup uploaded file
    try { fs.unlinkSync(filePath); } catch (e) { /* ignore */ }

    res.json({ message: 'Import successful', course: createdCourse });
  } catch (err) {
    try { fs.unlinkSync(filePath); } catch (e) { /* ignore */ }
    res.status(500).json({ error: err.message });
  }
});

// ==================== FILE UPLOAD ====================
app.post("/upload", authenticate, authorize("admin", "instructor"), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileExt = path.extname(req.file.originalname);
    const fileName = `${Date.now()}${fileExt}`;
    const newPath = path.join(uploadsDir, fileName);

    // Move file to uploads directory with better name
    fs.renameSync(req.file.path, newPath);

    res.json({
      url: `/uploads/${fileName}`,
      filename: fileName,
      originalName: req.file.originalname,
      size: req.file.size,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));