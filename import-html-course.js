const fs = require('fs');
const path = require('path');
const pool = require('./db');

/**
 * Parse HTML course file and extract modules
 * @param {string} filePath - Path to HTML file
 * @returns {Object} Object with course info and modules array
 */
function parseHTMLCourse(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');

  // Extract title from title tag or h1
  const titleMatch = content.match(/<title>([^<]+)<\/title>/) || 
                     content.match(/<h1[^>]*>([^<]+)<\/h1>/);
  const courseTitle = titleMatch ? titleMatch[1].trim() : path.basename(filePath);

  // Extract description from meta description or first paragraph
  const descMatch = content.match(/<meta\s+name="description"\s+content="([^"]+)"/i) ||
                    content.match(/<p[^>]*class="subtitle"[^>]*>([^<]+)<\/p>/);
  const courseDesc = descMatch ? descMatch[1].trim() : '';

  // Split into modules by h2 or nav sections
  const modules = [];
  
  // Try to split by h2 tags (main sections)
  const h2Sections = content.split(/<h2[^>]*>/);
  
  for (let i = 1; i < h2Sections.length; i++) {
    const section = h2Sections[i];
    
    // Extract title
    const title = section.match(/^([^<]+)</)?.[1]?.trim() || `Module ${i}`;
    
    // Get all content until next h2 or end
    let htmlContent = '<h2>' + section;
    
    // Clean up incomplete h2 tags
    if (!htmlContent.includes('</h2>')) {
      htmlContent = htmlContent.replace('<h2>', '<h2>' + title + '</h2>');
    }
    
    modules.push({
      title: title,
      description: '',
      html_content: htmlContent,
      objectives: [],
      lab_type: 'interactive'
    });
  }

  // If no h2 sections found, treat entire content as one module
  if (modules.length === 0) {
    modules.push({
      title: courseTitle || 'Module 1',
      description: courseDesc,
      html_content: content,
      objectives: [],
      lab_type: 'interactive'
    });
  }

  return {
    title: courseTitle,
    description: courseDesc,
    modules: modules
  };
}

/**
 * Import HTML course into database
 */
async function importHTMLCourse(htmlFilePath, courseData = null) {
  try {
    console.log(`\n📚 Importing HTML course from: ${htmlFilePath}`);
    
    // Parse HTML file
    const courseInfo = courseData || parseHTMLCourse(htmlFilePath);
    console.log(`📖 Course: ${courseInfo.title}`);
    console.log(`📑 Modules: ${courseInfo.modules.length}`);

    // Create course
    const courseRes = await pool.query(
      `INSERT INTO courses (title, description, status) 
       VALUES ($1, $2, 'published') 
       RETURNING id`,
      [courseInfo.title, courseInfo.description || '']
    );
    
    const courseId = courseRes.rows[0].id;
    console.log(`✅ Created course with ID: ${courseId}`);

    // Create modules and labs
    let moduleCount = 0;
    let labCount = 0;

    for (const [index, module] of courseInfo.modules.entries()) {
      // Create module
      const moduleRes = await pool.query(
        `INSERT INTO modules (course_id, title, description, sort_order) 
         VALUES ($1, $2, $3, $4) 
         RETURNING id`,
        [courseId, module.title, module.description || '', index + 1]
      );
      
      const moduleId = moduleRes.rows[0].id;
      moduleCount++;
      console.log(`  ✅ Module ${index + 1}: "${module.title}"`);

      // Create lab for this module
      const labRes = await pool.query(
        `INSERT INTO labs (
          course_id, module_id, title, description, 
          lab_type, html_content, status, objectives, difficulty
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
        RETURNING id`,
        [
          courseId,
          moduleId,
          module.title,
          module.description || '',
          module.lab_type || 'interactive',
          module.html_content,
          'published',
          JSON.stringify(module.objectives || []),
          'intermediate'
        ]
      );
      
      const labId = labRes.rows[0].id;
      labCount++;
      console.log(`    ✅ Lab created with ID: ${labId}`);
    }

    console.log(`\n✨ Successfully imported course!`);
    console.log(`   Course ID: ${courseId}`);
    console.log(`   Modules: ${moduleCount}`);
    console.log(`   Labs: ${labCount}`);

    return {
      courseId,
      moduleCount,
      labCount
    };

  } catch (error) {
    console.error('❌ Error importing course:', error.message);
    throw error;
  }
}

/**
 * Import all HTML files from a directory
 */
async function importHTMLCoursesFromDirectory(dirPath) {
  try {
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.html'));
    
    if (files.length === 0) {
      console.log(`❌ No HTML files found in ${dirPath}`);
      return;
    }

    console.log(`\n📂 Found ${files.length} HTML course file(s)\n`);

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      await importHTMLCourse(filePath);
    }

    console.log(`\n✅ All courses imported successfully!`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

// CLI Usage
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`
Usage:
  node import-html-course.js <file.html>       - Import single HTML file
  node import-html-course.js <directory>       - Import all HTML files in directory

Example:
  node import-html-course.js ./courses/course.html
  node import-html-course.js ./course-content/
  `);
  process.exit(0);
}

const target = args[0];

if (fs.statSync(target).isDirectory()) {
  console.log(`📂 Importing from directory: ${target}`);
  importHTMLCoursesFromDirectory(target);
} else {
  importHTMLCourse(target).then(() => {
    pool.end();
    process.exit(0);
  }).catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
}
