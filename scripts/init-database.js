const db = require('../database/db');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
  console.log('🔧 Initializing ComDev Creatives Hub Database...\n');

  try {
    // Read and execute schema
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await db.query(schema);
    console.log('✅ Database schema created');

    console.log('✅ User tables initialized (no default credentials seeded)');

    // Create sample course
    const courseResult = await db.query(`
      INSERT INTO courses (title, description, instructor_id, is_published)
      VALUES ($1, $2, NULL, true)
      RETURNING id
    `, [
      'Social Media Marketing with Cricut Design',
      'Learn to build a thriving creative business by combining stunning Cricut designs with powerful social media marketing strategies. No slides - just hands-on projects!'
    ]);
    const courseId = courseResult.rows[0].id;
    console.log('✅ Sample course created');

    // Create modules
    const modules = [
      {
        title: 'Brand Identity & Visual Design',
        description: 'Create your brand foundation with Cricut designs',
        lessons: [
          { title: 'Defining Your Creative Brand', content: 'Workshop: Discover your unique style and target audience' },
          { title: 'Design Principles for Social Media', content: 'Learn composition, color theory, and visual hierarchy' },
          { title: 'Cricut Design Space Mastery', content: 'Video tutorial series on creating branded designs' }
        ],
        projects: [
          {
            title: 'Brand Identity Kit',
            description: 'Create 3 Cricut designs that represent your brand. Include logo, pattern, and product mock-up.',
            type: 'design',
            instructions: 'Design in Cricut Design Space, create physical prototypes, photograph your work, and upload high-quality images.'
          }
        ]
      },
      {
        title: 'Content Creation Strategy',
        description: 'Plan and create engaging social media content',
        lessons: [
          { title: 'Content Pillars for Creative Businesses', content: 'Framework for consistent posting' },
          { title: 'Filming & Photography Basics', content: 'Capture your Cricut creations professionally' },
          { title: 'Storytelling on Social Media', content: 'Connect with your audience authentically' }
        ],
        projects: [
          {
            title: '30-Day Content Calendar',
            description: 'Plan a month of social media posts showcasing your Cricut work',
            type: 'content_calendar',
            instructions: 'Use the built-in calendar tool to plan posts across Instagram, TikTok, and Pinterest. Include captions, hashtags, and posting times.'
          }
        ]
      },
      {
        title: 'Platform Mastery',
        description: 'Master Instagram, TikTok, and Pinterest for craft businesses',
        lessons: [
          { title: 'Instagram for Product Businesses', content: 'Reels, Stories, and Shopping features' },
          { title: 'TikTok Trends for Creators', content: 'Go viral with your design process' },
          { title: 'Pinterest as a Sales Engine', content: 'Drive traffic to your shop' }
        ],
        projects: [
          {
            title: 'Platform-Specific Content',
            description: 'Create and post 5 pieces of content tailored to each platform',
            type: 'campaign',
            instructions: 'Post real content to your social accounts. Submit screenshots showing posts + analytics (views, likes, comments).'
          }
        ]
      },
      {
        title: 'Launch Your Business',
        description: 'Put it all together with a real product launch',
        lessons: [
          { title: 'Pre-Launch Strategies', content: 'Build anticipation and audience' },
          { title: 'Launch Day Tactics', content: 'Maximize your first 24 hours' },
          { title: 'Post-Launch Growth', content: 'Sustain momentum and analyze results' }
        ],
        projects: [
          {
            title: 'Final Portfolio & Launch Campaign',
            description: 'Launch a real product or collection with a comprehensive social media campaign',
            type: 'portfolio',
            instructions: 'Create a portfolio showcasing your best work from this course. Design a new product, launch it on social media with a 7-day campaign, and present your results with analytics.'
          }
        ]
      }
    ];

    for (let i = 0; i < modules.length; i++) {
      const module = modules[i];
      const moduleResult = await db.query(`
        INSERT INTO modules (course_id, title, description, order_index)
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `, [courseId, module.title, module.description, i + 1]);
      const moduleId = moduleResult.rows[0].id;

      // Add lessons
      for (let j = 0; j < module.lessons.length; j++) {
        await db.query(`
          INSERT INTO lessons (module_id, title, content, order_index)
          VALUES ($1, $2, $3, $4)
        `, [moduleId, module.lessons[j].title, module.lessons[j].content, j + 1]);
      }

      // Add projects
      for (const project of module.projects) {
        await db.query(`
          INSERT INTO projects (module_id, title, description, instructions, project_type, max_points)
          VALUES ($1, $2, $3, $4, $5, 100)
        `, [moduleId, project.title, project.description, project.instructions, project.type]);
      }
    }
    console.log('✅ Course content created (4 modules with lessons & projects)');

    console.log('✅ Course ready for user self-registration and enrollment');

    // Create uploads directory
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      fs.writeFileSync(path.join(uploadsDir, '.gitkeep'), '');
    }
    console.log('✅ Uploads directory created');

    console.log('\n🎉 Database initialized successfully!\n');
    console.log('📝 No default login credentials were created.\n');
    console.log('🚀 Run "npm run dev" to start the platform');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

initializeDatabase();
