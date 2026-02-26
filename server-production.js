const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const next = require('next');

dotenv.config();

const PORT = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev, dir: __dirname });
const handle = nextApp.getRequestHandler();

const app = express();

// Middleware
const allowedOrigins = ['http://localhost:3000'];
if (process.env.APP_ORIGIN) allowedOrigins.push(process.env.APP_ORIGIN);
if (process.env.RAILWAY_PUBLIC_DOMAIN) {
  allowedOrigins.push(`https://${process.env.RAILWAY_PUBLIC_DOMAIN}`);
}

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  if (origin.endsWith('.up.railway.app')) return true;
  return false;
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use((req, res, next) => {
  console.log(`[REQ] ${req.method} ${req.url}`);
  next();
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// File-based mock database (persistent)
const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');

const seedDatabase = () => {
  return {
    users: [],
    courses: [
      {
        id: 1,
        title: 'Social Media Marketing for Crafters',
        description:
          'A 4‑week, hands‑on course focused on branding, promotion, and client engagement for the event décor industry using Cricut design and social platforms.',
        instructor_id: 1,
        is_published: true,
      },
    ],
    modules: [
      {
        id: 1,
        course_id: 1,
        title: 'Brand & Visual Identity',
        description: 'Define your brand and build visual consistency.',
        order_index: 1,
      },
      {
        id: 2,
        course_id: 1,
        title: 'Content Strategy & Captions',
        description: 'Plan content and write compelling copy.',
        order_index: 2,
      },
      {
        id: 3,
        course_id: 1,
        title: 'Platform Growth & Engagement',
        description: 'Grow on Instagram, TikTok, and Pinterest.',
        order_index: 3,
      },
      {
        id: 4,
        course_id: 1,
        title: 'Portfolio & Showcase',
        description: 'Build a portfolio that converts followers into customers.',
        order_index: 4,
      },
    ],
    lessons: [
      {
        id: 1,
        module_id: 1,
        title: 'Brand Voice & Ideal Customer',
        content: 'Define who you serve and how you speak to them.',
        order_index: 1,
      },
      {
        id: 2,
        module_id: 1,
        title: 'Cricut Design Identity',
        content: 'Create logo, pattern, and product mockups.',
        order_index: 2,
      },
      {
        id: 3,
        module_id: 1,
        title: 'Mobile Photography Basics',
        content: 'Lighting, background, and composition tips.',
        order_index: 3,
      },
      {
        id: 4,
        module_id: 2,
        title: 'Content Pillars',
        content: 'Build 3–5 content categories for consistency.',
        order_index: 1,
      },
      {
        id: 5,
        module_id: 2,
        title: 'Captions & Descriptions',
        content: 'Write compelling product descriptions and CTAs.',
        order_index: 2,
      },
      {
        id: 6,
        module_id: 2,
        title: 'Hashtag Strategy',
        content: 'Find and organize relevant hashtags.',
        order_index: 3,
      },
      {
        id: 7,
        module_id: 3,
        title: 'Instagram & Reels',
        content: 'Create engaging short‑form content.',
        order_index: 1,
      },
      {
        id: 8,
        module_id: 3,
        title: 'TikTok Trends',
        content: 'Leverage trends for visibility and growth.',
        order_index: 2,
      },
      {
        id: 9,
        module_id: 3,
        title: 'Pinterest for Crafters',
        content: 'Use pins to drive traffic and sales.',
        order_index: 3,
      },
      {
        id: 10,
        module_id: 3,
        title: 'Client DMs & Responses',
        content: 'Handle inquiries and convert to bookings.',
        order_index: 4,
      },
      {
        id: 11,
        module_id: 4,
        title: 'Portfolio Curation',
        content: 'Select and present your best work.',
        order_index: 1,
      },
      {
        id: 12,
        module_id: 4,
        title: 'Showcase & Evaluation',
        content: 'Prepare final presentation and review.',
        order_index: 2,
      },
    ],
    projects: [
      {
        id: 1,
        module_id: 1,
        title: 'Brand Identity Kit',
        description: 'Create 3 Cricut designs that represent your brand (logo, pattern, product mockup).',
        instructions:
          'Design in Cricut Design Space, create physical prototypes, photograph your work, and upload images.',
        project_type: 'design',
        max_points: 100,
      },
      {
        id: 2,
        module_id: 2,
        title: '30‑Day Content Calendar',
        description: 'Plan a month of posts with captions and hashtags.',
        instructions: 'Create a 30‑day schedule for Instagram, TikTok, and Pinterest.',
        project_type: 'content_calendar',
        max_points: 100,
      },
      {
        id: 3,
        module_id: 3,
        title: 'Platform Content Sprint',
        description: 'Post 5 pieces of content and share analytics.',
        instructions: 'Submit screenshots of posts and performance metrics.',
        project_type: 'campaign',
        max_points: 100,
      },
      {
        id: 4,
        module_id: 4,
        title: 'Final Portfolio Showcase',
        description: 'Curate your portfolio and present your best work.',
        instructions: 'Select 6–10 posts and create a portfolio presentation.',
        project_type: 'portfolio',
        max_points: 100,
      },
    ],
    enrollments: [{ id: 1, course_id: 1, student_id: 2, progress: 0 }],
    submissions: [],
    discussions: [],
    portfolio: [],
  };
};

const ensureDatabase = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_PATH)) {
    const seed = seedDatabase();
    fs.writeFileSync(DB_PATH, JSON.stringify(seed, null, 2));
    return seed;
  }

  const raw = fs.readFileSync(DB_PATH, 'utf8');
  return JSON.parse(raw);
};

const saveDatabase = (db) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
};

const mockDB = ensureDatabase();

// API Routes with mock DB
const authRoutes = require('./routes/auth-mock');
const coursesRoutes = require('./routes/courses-mock');
const projectsRoutes = require('./routes/projects-mock');
const submissionsRoutes = require('./routes/submissions-mock');
const discussionsRoutes = require('./routes/discussions-mock');
const portfolioRoutes = require('./routes/portfolio-mock');

app.use('/api/auth', (req, res, next) => {
  req.mockDB = mockDB;
  req.saveDB = () => saveDatabase(mockDB);
  next();
}, authRoutes);
app.use('/api/courses', (req, res, next) => {
  req.mockDB = mockDB;
  req.saveDB = () => saveDatabase(mockDB);
  next();
}, coursesRoutes);
app.use('/api/projects', (req, res, next) => {
  req.mockDB = mockDB;
  req.saveDB = () => saveDatabase(mockDB);
  next();
}, projectsRoutes);
app.use('/api/submissions', (req, res, next) => {
  req.mockDB = mockDB;
  req.saveDB = () => saveDatabase(mockDB);
  next();
}, submissionsRoutes);
app.use('/api/discussions', (req, res, next) => {
  req.mockDB = mockDB;
  req.saveDB = () => saveDatabase(mockDB);
  next();
}, discussionsRoutes);
app.use('/api/portfolio', (req, res, next) => {
  req.mockDB = mockDB;
  req.saveDB = () => saveDatabase(mockDB);
  next();
}, portfolioRoutes);

// Basic health + root response for gateway checks
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/', (req, res, next) => {
  res.setHeader('x-app-status', 'up');
  return next();
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'ComDev Creatives Hub API (Mock Mode)',
    timestamp: new Date().toISOString(),
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

nextApp
  .prepare()
  .then(() => {
    app.all('*', (req, res) => handle(req, res));

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 ComDev Creatives Hub running on port ${PORT}`);
      console.log(`🔧 PORT env: ${process.env.PORT || 'unset'}`);
      console.log(`🔧 Public domain: ${process.env.RAILWAY_PUBLIC_DOMAIN || 'unset'}`);
      console.log('📚 Mode: MOCK (Persistent file storage)');
    });
  })
  .catch((error) => {
    console.error('Failed to start Next.js:', error);
    process.exit(1);
  });
