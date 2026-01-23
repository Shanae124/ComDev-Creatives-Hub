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
// Trust the proxy (Railway/Nginx) so rate-limit and IP detection work
app.set('trust proxy', 1);

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
      "INSERT INTO users (name, email, password_hash, role, verification_token, verification_token_expires, email_verified) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, name, email, role, email_verified",
      [name, email, hashedPassword, role || "student", verificationToken, tokenExpiry, true]
    );

    // Email sending disabled for testing
    // const emailResult = await sendVerificationEmail(email, name, verificationToken);
    
    const response = {
      user: result.rows[0],
      message: "Registration successful! You can now log in.",
    };

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
            // Email sending disabled
            const response = {
              user: { id: user.id, name: user.name, email: user.email, role: user.role, email_verified: true },
              message: "Account already exists. You can now log in.",
            };
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

    // Email verification temporarily disabled for development
    // Users can now log in without email verification

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

    // Email sending disabled
    const response = {
      message: "Email service temporarily disabled. You are verified.",
    };

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

// Public: Featured instructors for homepage
app.get("/instructors", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        COALESCE(u.bio, '') AS bio,
        COALESCE(u.avatar_url, '') AS avatar_url,
        (SELECT COUNT(*) FROM courses c WHERE c.created_by = u.id) AS course_count,
        (
          SELECT COUNT(DISTINCT e.user_id)
          FROM enrollments e
          JOIN courses c ON c.id = e.course_id
          WHERE c.created_by = u.id
        ) AS student_count
      FROM users u
      WHERE u.role = 'instructor'
      ORDER BY u.created_at DESC
      LIMIT 12
    `);
    res.json(result.rows);
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
  let { user_id, course_id } = req.body;

  // Default to authenticated user when user_id not provided
  user_id = user_id || req.user.id;

  if (!course_id) {
    return res.status(400).json({ error: "course_id is required" });
  }

  // Prevent enrolling other users unless admin
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

// ==================== ADMIN ENDPOINTS ====================

// System Statistics
app.get("/admin/stats", authenticate, authorize("admin"), async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM users WHERE role = 'student') as total_students,
        (SELECT COUNT(*) FROM users WHERE role = 'instructor') as total_instructors,
        (SELECT COUNT(*) FROM courses) as total_courses,
        (SELECT COUNT(*) FROM courses WHERE status = 'published') as published_courses,
        (SELECT COUNT(*) FROM enrollments) as total_enrollments,
        (SELECT COUNT(*) FROM assignments) as total_assignments,
        (SELECT COUNT(*) FROM submissions) as total_submissions,
        (SELECT COUNT(*) FROM announcements) as total_announcements
    `);
    res.json(stats.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// User Management - Get all users with detailed info
app.get("/admin/users", authenticate, authorize("admin"), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.name, u.email, u.role, u.email_verified, u.created_at,
        (SELECT COUNT(*) FROM enrollments WHERE user_id = u.id) as courses_enrolled,
        (SELECT MAX(created_at) FROM submissions WHERE user_id = u.id) as last_activity
      FROM users u
      ORDER BY u.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Impersonation: issue a token to act as another user
app.post("/admin/impersonate", authenticate, authorize("admin", "instructor"), async (req, res) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: "user_id is required" });
  }

  try {
    const result = await pool.query("SELECT id, name, email, role FROM users WHERE id = $1", [user_id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const target = result.rows[0];

    if (req.user.role === "instructor" && target.role !== "student") {
      return res.status(403).json({ error: "Instructors may only impersonate students" });
    }

    const original_id = req.user.impersonator_id || req.user.id;
    const original_role = req.user.impersonator_role || req.user.role;

    const token = jwt.sign(
      {
        id: target.id,
        role: target.role,
        impersonating: true,
        impersonator_id: original_id,
        impersonator_role: original_role,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      impersonated: { id: target.id, name: target.name, email: target.email, role: target.role },
      original: { id: original_id, role: original_role },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Stop impersonation: return to original identity
app.post("/admin/impersonate/stop", authenticate, authorize("admin", "instructor"), async (req, res) => {
  try {
    const original_id = req.user.impersonator_id || req.user.id;
    const original_role = req.user.impersonator_role || req.user.role;

    const token = jwt.sign(
      { id: original_id, role: original_role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, user: { id: original_id, role: original_role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user role
app.put("/admin/users/:id/role", authenticate, authorize("admin"), async (req, res) => {
  const { role } = req.body;
  
  if (!['student', 'instructor', 'admin'].includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }

  try {
    const result = await pool.query(
      "UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING id, name, email, role",
      [role, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Suspend/Activate user
app.put("/admin/users/:id/status", authenticate, authorize("admin"), async (req, res) => {
  const { status } = req.body; // 'active' or 'suspended'
  
  try {
    // You can add a status column to users table, for now we'll just respond
    res.json({ message: `User ${status}`, userId: req.params.id, status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete user
app.delete("/admin/users/:id", authenticate, authorize("admin"), async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM users WHERE id = $1 RETURNING name, email", [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "User deleted successfully", user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Attendance Management
app.get("/admin/courses/:course_id/attendance", authenticate, authorize("admin", "instructor"), async (req, res) => {
  try {
    const { date } = req.query;
    const result = await pool.query(`
      SELECT u.id, u.name, u.email, 
        e.enrolled_at,
        COALESCE(a.status, 'not_recorded') as status,
        a.notes
      FROM enrollments e
      JOIN users u ON u.id = e.user_id
      LEFT JOIN attendance a ON a.user_id = u.id AND a.course_id = e.course_id AND DATE(a.date) = $2
      WHERE e.course_id = $1 AND e.status = 'active'
      ORDER BY u.name ASC
    `, [req.params.course_id, date || new Date().toISOString().split('T')[0]]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/admin/attendance", authenticate, authorize("admin", "instructor"), async (req, res) => {
  const { user_id, course_id, date, status, notes } = req.body;

  if (!user_id || !course_id || !status) {
    return res.status(400).json({ error: "user_id, course_id, and status are required" });
  }

  try {
    const result = await pool.query(`
      INSERT INTO attendance (user_id, course_id, date, status, notes, recorded_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (user_id, course_id, date) DO UPDATE
      SET status = $4, notes = $5, recorded_by = $6, updated_at = NOW()
      RETURNING *
    `, [user_id, course_id, date || new Date().toISOString().split('T')[0], status, notes || '', req.user.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Student Groups
app.post("/admin/groups", authenticate, authorize("admin", "instructor"), async (req, res) => {
  const { course_id, name, description } = req.body;

  if (!course_id || !name) {
    return res.status(400).json({ error: "course_id and name are required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO groups (course_id, name, description, created_by) VALUES ($1, $2, $3, $4) RETURNING *",
      [course_id, name, description || '', req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/admin/courses/:course_id/groups", authenticate, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT g.*, u.name as created_by_name,
        (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) as member_count
      FROM groups g
      LEFT JOIN users u ON u.id = g.created_by
      WHERE g.course_id = $1
      ORDER BY g.created_at DESC
    `, [req.params.course_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/admin/groups/:group_id/members", authenticate, authorize("admin", "instructor"), async (req, res) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: "user_id is required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO group_members (group_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *",
      [req.params.group_id, user_id]
    );
    res.json(result.rows[0] || { message: "Already a member" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Quizzes Management
app.post("/admin/quizzes", authenticate, authorize("admin", "instructor"), async (req, res) => {
  const { course_id, title, description, duration_minutes, due_date, attempts_allowed } = req.body;

  if (!course_id || !title) {
    return res.status(400).json({ error: "course_id and title are required" });
  }

  try {
    const result = await pool.query(`
      INSERT INTO quizzes (course_id, title, description, duration_minutes, due_date, attempts_allowed, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
    `, [course_id, title, description || '', duration_minutes || 30, due_date, attempts_allowed || 3, req.user.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/admin/courses/:course_id/quizzes", authenticate, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT q.*, u.name as created_by_name,
        (SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = q.id) as question_count,
        (SELECT COUNT(DISTINCT user_id) FROM quiz_attempts WHERE quiz_id = q.id) as attempt_count
      FROM quizzes q
      LEFT JOIN users u ON u.id = q.created_by
      WHERE q.course_id = $1
      ORDER BY q.created_at DESC
    `, [req.params.course_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rubrics Management
app.post("/admin/rubrics", authenticate, authorize("admin", "instructor"), async (req, res) => {
  const { course_id, title, description, criteria } = req.body;

  if (!course_id || !title) {
    return res.status(400).json({ error: "course_id and title are required" });
  }

  try {
    const result = await pool.query(`
      INSERT INTO rubrics (course_id, title, description, criteria, created_by)
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `, [course_id, title, description || '', JSON.stringify(criteria || []), req.user.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/admin/courses/:course_id/rubrics", authenticate, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.*, u.name as created_by_name
      FROM rubrics r
      LEFT JOIN users u ON u.id = r.created_by
      WHERE r.course_id = $1
      ORDER BY r.created_at DESC
    `, [req.params.course_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Surveys Management
app.post("/admin/surveys", authenticate, authorize("admin", "instructor"), async (req, res) => {
  const { course_id, title, description, questions, due_date } = req.body;

  if (!course_id || !title) {
    return res.status(400).json({ error: "course_id and title are required" });
  }

  try {
    const result = await pool.query(`
      INSERT INTO surveys (course_id, title, description, questions, due_date, created_by)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
    `, [course_id, title, description || '', JSON.stringify(questions || []), due_date, req.user.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// System Settings
app.get("/admin/settings", authenticate, authorize("admin"), async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM system_settings ORDER BY key ASC");
    
    // Convert to key-value object
    const settings = {};
    result.rows.forEach(row => {
      settings[row.key] = row.value;
    });
    
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Read-only external tools for authenticated users (students/instructors/admin)
app.get("/settings/external-tools", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT key, value FROM system_settings WHERE key = ANY($1)",
      [[
        'zoom_meeting_url',
        'google_meet_url',
        'whiteboard_url',
        'boards_provider'
      ]]
    );

    const out = {};
    result.rows.forEach(row => { out[row.key] = row.value; });
    res.json(out);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/admin/settings", authenticate, authorize("admin"), async (req, res) => {
  const settings = req.body;

  try {
    for (const [key, value] of Object.entries(settings)) {
      await pool.query(`
        INSERT INTO system_settings (key, value)
        VALUES ($1, $2)
        ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()
      `, [key, value]);
    }
    res.json({ message: "Settings updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Analytics
app.get("/admin/analytics/overview", authenticate, authorize("admin"), async (req, res) => {
  try {
    const [userGrowth, courseEngagement, assignmentStats] = await Promise.all([
      pool.query(`
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM users
        WHERE created_at > NOW() - INTERVAL '30 days'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `),
      pool.query(`
        SELECT c.title, COUNT(e.id) as enrollment_count
        FROM courses c
        LEFT JOIN enrollments e ON e.course_id = c.id
        WHERE c.status = 'published'
        GROUP BY c.id, c.title
        ORDER BY enrollment_count DESC
        LIMIT 10
      `),
      pool.query(`
        SELECT 
          COUNT(*) as total_assignments,
          COUNT(DISTINCT s.user_id) as students_submitted,
          ROUND(AVG(g.points_earned), 2) as avg_score
        FROM assignments a
        LEFT JOIN submissions s ON s.assignment_id = a.id
        LEFT JOIN grades g ON g.assignment_id = a.id
      `)
    ]);

    res.json({
      userGrowth: userGrowth.rows,
      courseEngagement: courseEngagement.rows,
      assignmentStats: assignmentStats.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Class Progress Report
app.get("/admin/courses/:course_id/progress-report", authenticate, authorize("admin", "instructor"), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        u.id, u.name, u.email,
        COUNT(DISTINCT lp.lesson_id) FILTER (WHERE lp.status = 'completed') as completed_lessons,
        COUNT(DISTINCT l.id) as total_lessons,
        ROUND(AVG(lp.progress_percent), 2) as avg_progress,
        COUNT(DISTINCT s.id) as submissions_count,
        ROUND(AVG(g.points_earned), 2) as avg_grade
      FROM enrollments e
      JOIN users u ON u.id = e.user_id
      LEFT JOIN lesson_progress lp ON lp.user_id = u.id
      LEFT JOIN lessons l ON l.id = lp.lesson_id
      LEFT JOIN modules m ON m.id = l.module_id AND m.course_id = e.course_id
      LEFT JOIN submissions s ON s.user_id = u.id
      LEFT JOIN assignments a ON a.id = s.assignment_id AND a.course_id = e.course_id
      LEFT JOIN grades g ON g.user_id = u.id AND g.course_id = e.course_id
      WHERE e.course_id = $1 AND e.status = 'active'
      GROUP BY u.id, u.name, u.email
      ORDER BY u.name ASC
    `, [req.params.course_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bulk Email (placeholder - integrate with email service)
app.post("/admin/bulk-email", authenticate, authorize("admin", "instructor"), async (req, res) => {
  const { recipients, subject, message, course_id } = req.body;

  if (!subject || !message) {
    return res.status(400).json({ error: "subject and message are required" });
  }

  try {
    // Log the email intent
    const result = await pool.query(`
      INSERT INTO email_logs (sent_by, recipients, subject, message, course_id)
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `, [req.user.id, JSON.stringify(recipients || []), subject, message, course_id || null]);
    
    // TODO: Actually send emails using emailService
    res.json({ message: "Emails queued for delivery", log: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// FAQ Management
app.post("/admin/faq", authenticate, authorize("admin", "instructor"), async (req, res) => {
  const { course_id, question, answer, category } = req.body;

  if (!question || !answer) {
    return res.status(400).json({ error: "question and answer are required" });
  }

  try {
    const result = await pool.query(`
      INSERT INTO faq (course_id, question, answer, category, created_by)
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `, [course_id || null, question, answer, category || 'general', req.user.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/admin/faq", authenticate, async (req, res) => {
  const { course_id } = req.query;
  
  try {
    let query = `
      SELECT f.*, u.name as created_by_name
      FROM faq f
      LEFT JOIN users u ON u.id = f.created_by
    `;
    
    const params = [];
    if (course_id) {
      query += ` WHERE f.course_id = $1 OR f.course_id IS NULL`;
      params.push(course_id);
    }
    
    query += ` ORDER BY f.created_at DESC`;
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Glossary Management
app.post("/admin/glossary", authenticate, authorize("admin", "instructor"), async (req, res) => {
  const { course_id, term, definition } = req.body;

  if (!term || !definition) {
    return res.status(400).json({ error: "term and definition are required" });
  }

  try {
    const result = await pool.query(`
      INSERT INTO glossary (course_id, term, definition, created_by)
      VALUES ($1, $2, $3, $4) RETURNING *
    `, [course_id || null, term, definition, req.user.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/admin/glossary", authenticate, async (req, res) => {
  const { course_id } = req.query;
  
  try {
    let query = `
      SELECT g.*, u.name as created_by_name
      FROM glossary g
      LEFT JOIN users u ON u.id = g.created_by
    `;
    
    const params = [];
    if (course_id) {
      query += ` WHERE g.course_id = $1 OR g.course_id IS NULL`;
      params.push(course_id);
    }
    
    query += ` ORDER BY g.term ASC`;
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== LABS & INTERACTIVE CONTENT ====================

// Get all labs for a course/module
const listLabs = async (req, res) => {
  const { course_id, module_id } = req.query;
  
  try {
    let query = `
      SELECT l.id, l.title, l.description, l.lab_type, l.status, l.difficulty,
             l.duration_minutes, l.sort_order, u.name as created_by_name
      FROM labs l
      LEFT JOIN users u ON u.id = l.created_by
      WHERE l.status = 'published'
    `;
    
    const params = [];
    if (course_id) {
      query += ` AND l.course_id = $${params.length + 1}`;
      params.push(course_id);
    }
    if (module_id) {
      query += ` AND l.module_id = $${params.length + 1}`;
      params.push(module_id);
    }
    
    query += ` ORDER BY l.sort_order ASC`;
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

app.get("/labs", listLabs);
app.get("/api/labs", listLabs);

// Get single lab with full content
const getLabById = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT l.*, u.name as created_by_name
       FROM labs l
       LEFT JOIN users u ON u.id = l.created_by
       WHERE l.id = $1`,
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Lab not found" });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

app.get("/api/labs/:id", getLabById);
app.get("/labs/:id", getLabById);

// Create lab
app.post("/admin/labs", authenticate, authorize("admin", "instructor"), async (req, res) => {
  const {
    course_id,
    module_id,
    title,
    description,
    lab_type,
    html_content,
    html_file_url,
    duration_minutes,
    difficulty,
    objectives,
    resources,
    sort_order
  } = req.body;

  if (!course_id || !title) {
    return res.status(400).json({ error: "course_id and title are required" });
  }

  try {
    const result = await pool.query(`
      INSERT INTO labs (course_id, module_id, title, description, lab_type, html_content,
                       html_file_url, duration_minutes, difficulty, objectives, resources,
                       sort_order, created_by, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'draft')
      RETURNING *
    `, [
      course_id,
      module_id || null,
      title,
      description || "",
      lab_type || "interactive",
      html_content || "",
      html_file_url || null,
      duration_minutes || null,
      difficulty || "intermediate",
      JSON.stringify(objectives || []),
      JSON.stringify(resources || []),
      sort_order || 1,
      req.user.id
    ]);

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update lab
app.put("/admin/labs/:id", authenticate, authorize("admin", "instructor"), async (req, res) => {
  const {
    title,
    description,
    html_content,
    status,
    difficulty,
    objectives,
    resources,
    duration_minutes
  } = req.body;

  try {
    const result = await pool.query(`
      UPDATE labs
      SET title = COALESCE($1, title),
          description = COALESCE($2, description),
          html_content = COALESCE($3, html_content),
          status = COALESCE($4, status),
          difficulty = COALESCE($5, difficulty),
          objectives = COALESCE($6, objectives),
          resources = COALESCE($7, resources),
          duration_minutes = COALESCE($8, duration_minutes),
          updated_at = NOW()
      WHERE id = $9
      RETURNING *
    `, [
      title,
      description,
      html_content,
      status,
      difficulty,
      JSON.stringify(objectives),
      JSON.stringify(resources),
      duration_minutes,
      req.params.id
    ]);

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete lab
app.delete("/admin/labs/:id", authenticate, authorize("admin", "instructor"), async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM labs WHERE id = $1 RETURNING *", [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Lab not found" });
    }
    res.json({ message: "Lab deleted successfully", lab: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Track lab attempt
app.post("/labs/:id/attempt", authenticate, async (req, res) => {
  const { completion_percent, notes } = req.body;

  try {
    const result = await pool.query(`
      INSERT INTO lab_attempts (lab_id, user_id, completion_percent, notes, status)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (lab_id, user_id) DO UPDATE
      SET completion_percent = $3, notes = $4, updated_at = NOW()
      RETURNING *
    `, [
      req.params.id,
      req.user.id,
      completion_percent || 0,
      JSON.stringify(notes || {}),
      completion_percent >= 100 ? 'completed' : 'in_progress'
    ]);

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get lab attempts
app.get("/admin/labs/:id/attempts", authenticate, authorize("admin", "instructor"), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT la.*, u.name, u.email
      FROM lab_attempts la
      JOIN users u ON u.id = la.user_id
      WHERE la.lab_id = $1
      ORDER BY la.started_at DESC
    `, [req.params.id]);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create course from HTML pages
app.post("/admin/import-html-course", authenticate, authorize("admin"), async (req, res) => {
  const { course_title, course_description, modules_html } = req.body;

  if (!course_title || !modules_html || modules_html.length === 0) {
    return res.status(400).json({ error: "course_title and modules_html are required" });
  }

  try {
    // Create course
    const courseResult = await pool.query(
      `INSERT INTO courses (title, description, created_by, status)
       VALUES ($1, $2, $3, 'published') RETURNING *`,
      [course_title, course_description || "", req.user.id]
    );

    const courseId = courseResult.rows[0].id;
    const createdModules = [];

    // Create modules from HTML pages
    for (let i = 0; i < modules_html.length; i++) {
      const moduleData = modules_html[i];
      
      const moduleResult = await pool.query(
        `INSERT INTO modules (course_id, title, description, sort_order)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [courseId, moduleData.title || `Module ${i + 1}`, moduleData.description || "", i + 1]
      );

      const moduleId = moduleResult.rows[0].id;

      // Create lab from HTML content
      await pool.query(
        `INSERT INTO labs (course_id, module_id, title, description, lab_type, html_content,
                          difficulty, objectives, created_by, status, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'published', 1)`,
        [
          courseId,
          moduleId,
          moduleData.title || `Module ${i + 1}`,
          moduleData.description || "",
          "interactive",
          moduleData.html_content || "",
          "beginner",
          JSON.stringify(moduleData.objectives || []),
          req.user.id
        ]
      );

      createdModules.push(moduleResult.rows[0]);
    }

    res.json({
      message: "Course imported successfully",
      course: courseResult.rows[0],
      modules: createdModules
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== ERROR HANDLING ====================
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${new Date().toISOString()} - ${err.message}`);
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

// 404 Handler (must be after all routes)
app.use(notFoundHandler);

// Error Handler (must be last)
app.use(errorHandler);

// ==================== START SERVER ====================
// Railway deployment: Always use Railway's PORT
// Local dev: Falls back to 3001
const PORT = process.env.PORT || 3001;
console.log(`[Server] Starting on PORT ${PORT}`);

app.listen(PORT, '0.0.0.0', async () => {
  console.log('\n================================================');
  console.log('🚀 ProtexxaLearn LMS - Production Ready');
  console.log('================================================');
  console.log(`✅ Server:        http://0.0.0.0:${PORT}`);
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
