#!/usr/bin/env node

/**
 * Import DTS NETWORKING BASIC course with HTML labs
 * Creates course, modules, and labs from HTML files in Downloads folder
 */

const pool = require('./db');
const fs = require('fs');
const path = require('path');

const DOWNLOADS_PATH = path.join(require('os').homedir(), 'Downloads');
const DTS_COURSE_FILES = [
  'firewall&ports.html',
  'nmapLab.html',
  'device simulator 1.html'
];

async function importDTSCourse() {
  try {
    console.log('🚀 Starting DTS NETWORKING BASIC course import...\n');

    // 1. Create course
    console.log('📚 Creating course: DTS NETWORKING BASIC');
    const courseResult = await pool.query(`
      INSERT INTO courses (title, description, instructor_id, created_by)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [
      'DTS NETWORKING BASIC',
      'Comprehensive networking fundamentals course with interactive labs covering firewalls, network scanning, and device simulation.',
        1, // instructor_id = 1 (default instructor)
        1  // created_by = 1 (admin user)
      ]);

    const course = courseResult.rows[0];
    console.log(`✅ Course created: ID ${course.id}\n`);

    // 2. Import each HTML file as a lab
    let labCount = 0;
    for (const filename of DTS_COURSE_FILES) {
      const filePath = path.join(DOWNLOADS_PATH, filename);
      
      if (!fs.existsSync(filePath)) {
        console.warn(`⚠️  File not found: ${filename}`);
        continue;
      }

      try {
        const htmlContent = fs.readFileSync(filePath, 'utf-8');
        const labTitle = filename.replace('.html', '').replace(/[_-]/g, ' ');

        console.log(`📝 Importing lab: "${labTitle}"`);

        // Create module first
        const moduleResult = await pool.query(`
          INSERT INTO modules (course_id, title, description)
          VALUES ($1, $2, $3)
          RETURNING *
        `, [
          course.id,
          labTitle,
          `Interactive lab: ${labTitle}`
        ]);

        const module = moduleResult.rows[0];

        // Create lesson
        const lessonResult = await pool.query(`
          INSERT INTO lessons (module_id, title, content_html, lesson_type)
          VALUES ($1, $2, $3, $4)
          RETURNING *
        `, [
          module.id,
          labTitle,
          htmlContent,
          'lab'
        ]);

        const lesson = lessonResult.rows[0];

        // Create lab record
        const labResult = await pool.query(`
          INSERT INTO labs (course_id, module_id, title, description, html_content, status)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT DO NOTHING
          RETURNING *
        `, [
          course.id,
          module.id,
          labTitle,
          `Interactive lab for ${labTitle}`,
          htmlContent,
          'published'
        ]);

        labCount++;
        console.log(`   ✅ Lab imported successfully\n`);

      } catch (err) {
        console.error(`   ❌ Error importing ${filename}:`, err.message);
      }
    }

    // 3. Enroll test student
    console.log('👨‍🎓 Enrolling test student...');
    try {
      await pool.query(`
        INSERT INTO enrollments (user_id, course_id, status)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id, course_id) DO UPDATE SET status = $3
      `, [3, course.id, 'active']); // user_id 3 = student@test.com
      
      console.log('✅ Student enrolled successfully\n');
    } catch (err) {
      console.warn('⚠️  Could not enroll student:', err.message);
    }

    // 4. Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ DTS NETWORKING BASIC COURSE IMPORT COMPLETE');
    console.log('='.repeat(60));
    console.log(`
📊 Summary:
  • Course ID: ${course.id}
  • Course: ${course.title}
  • Labs imported: ${labCount}
  • Student enrolled: student@test.com

🎓 Access via:
  • Admin: https://protexxalearn-production.up.railway.app/admin/labs
  • Student: https://protexxalearn-production.up.railway.app/courses/${course.id}

🧪 Test the lab:
  • Login as: student@test.com / Password123
  • Navigate to: Courses > DTS NETWORKING BASIC
  • Click any lab to view and interact with HTML content
    `);

    process.exit(0);
  } catch (err) {
    console.error('❌ Fatal error:', err.message);
    console.error(err);
    process.exit(1);
  }
}

importDTSCourse();
