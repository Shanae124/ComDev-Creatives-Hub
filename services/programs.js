// Programs Service - Hierarchical learning paths
const { Pool } = require('pg');

class ProgramsService {
  constructor(pool) {
    this.pool = pool;
  }

  /**
   * Create a learning program
   */
  async createProgram(data) {
    const result = await this.pool.query(
      `INSERT INTO programs 
       (title, description, created_by, duration_weeks, credits, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        data.title,
        data.description,
        data.createdBy,
        data.durationWeeks || null,
        data.credits || null,
        data.status || 'draft'
      ]
    );

    return result.rows[0];
  }

  /**
   * Add course to program with prerequisites and drip schedule
   */
  async addCourseToProgram(programId, courseId, options = {}) {
    const result = await this.pool.query(
      `INSERT INTO program_courses 
       (program_id, course_id, sort_order, is_required, unlock_after_days, 
        drip_schedule, prerequisites)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        programId,
        courseId,
        options.sortOrder || 0,
        options.isRequired !== false,
        options.unlockAfterDays || 0,
        options.dripSchedule ? JSON.stringify(options.dripSchedule) : null,
        options.prerequisites ? JSON.stringify(options.prerequisites) : null
      ]
    );

    return result.rows[0];
  }

  /**
   * Get program with nested structure
   */
  async getProgramStructure(programId) {
    // Get program details
    const program = await this.pool.query(
      'SELECT * FROM programs WHERE id = $1',
      [programId]
    );

    if (program.rows.length === 0) {
      throw new Error('Program not found');
    }

    // Get courses in program
    const courses = await this.pool.query(
      `SELECT 
        pc.*,
        c.title, c.description, c.thumbnail_url, c.status as course_status,
        (SELECT COUNT(*) FROM modules WHERE course_id = c.id) as module_count
       FROM program_courses pc
       JOIN courses c ON pc.course_id = c.id
       WHERE pc.program_id = $1
       ORDER BY pc.sort_order`,
      [programId]
    );

    // Get modules and lessons for each course
    const coursesWithContent = await Promise.all(
      courses.rows.map(async (course) => {
        const modules = await this.pool.query(
          `SELECT 
            m.*,
            (SELECT COUNT(*) FROM lessons WHERE module_id = m.id) as lesson_count
           FROM modules m
           WHERE m.course_id = $1
           ORDER BY m.sort_order`,
          [course.course_id]
        );

        const modulesWithLessons = await Promise.all(
          modules.rows.map(async (module) => {
            const lessons = await this.pool.query(
              `SELECT * FROM lessons WHERE module_id = $1 ORDER BY sort_order`,
              [module.id]
            );

            return {
              ...module,
              lessons: lessons.rows
            };
          })
        );

        return {
          ...course,
          modules: modulesWithLessons
        };
      })
    );

    return {
      ...program.rows[0],
      courses: coursesWithContent
    };
  }

  /**
   * Check if course is unlocked for user based on prerequisites and drip schedule
   */
  async isCourseUnlocked(userId, programId, courseId) {
    // Get enrollment date
    const enrollment = await this.pool.query(
      `SELECT enrolled_at FROM program_enrollments 
       WHERE user_id = $1 AND program_id = $2`,
      [userId, programId]
    );

    if (enrollment.rows.length === 0) {
      return { unlocked: false, reason: 'Not enrolled in program' };
    }

    const enrolledAt = enrollment.rows[0].enrolled_at;

    // Get course requirements
    const courseReqs = await this.pool.query(
      `SELECT unlock_after_days, drip_schedule, prerequisites 
       FROM program_courses 
       WHERE program_id = $1 AND course_id = $2`,
      [programId, courseId]
    );

    if (courseReqs.rows.length === 0) {
      return { unlocked: false, reason: 'Course not in program' };
    }

    const reqs = courseReqs.rows[0];

    // Check drip schedule (days since enrollment)
    const daysSinceEnrollment = Math.floor(
      (Date.now() - new Date(enrolledAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceEnrollment < reqs.unlock_after_days) {
      return {
        unlocked: false,
        reason: `Unlocks in ${reqs.unlock_after_days - daysSinceEnrollment} days`,
        daysRemaining: reqs.unlock_after_days - daysSinceEnrollment
      };
    }

    // Check prerequisites
    if (reqs.prerequisites) {
      const prereqs = JSON.parse(reqs.prerequisites);
      const prereqResults = await Promise.all(
        prereqs.map(prereqId => this.isCourseCompleted(userId, prereqId))
      );

      const unmetPrereqs = prereqResults.filter(r => !r.completed);
      if (unmetPrereqs.length > 0) {
        return {
          unlocked: false,
          reason: 'Prerequisites not met',
          unmetPrerequisites: unmetPrereqs
        };
      }
    }

    return { unlocked: true };
  }

  /**
   * Check if user has completed a course
   */
  async isCourseCompleted(userId, courseId) {
    const result = await this.pool.query(
      `SELECT 
        e.id,
        c.title,
        COALESCE(
          (SELECT COUNT(*) FROM lesson_progress lp
           JOIN lessons l ON lp.lesson_id = l.id
           JOIN modules m ON l.module_id = m.id
           WHERE m.course_id = $2 AND lp.user_id = $1 AND lp.status = 'completed'),
          0
        ) as completed_lessons,
        COALESCE(
          (SELECT COUNT(*) FROM lessons l
           JOIN modules m ON l.module_id = m.id
           WHERE m.course_id = $2),
          0
        ) as total_lessons
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       WHERE e.user_id = $1 AND e.course_id = $2`,
      [userId, courseId]
    );

    if (result.rows.length === 0) {
      return { completed: false, enrolled: false };
    }

    const row = result.rows[0];
    const completed = row.total_lessons > 0 && 
                     row.completed_lessons === row.total_lessons;

    return {
      completed,
      enrolled: true,
      progress: row.total_lessons > 0 
        ? (row.completed_lessons / row.total_lessons) * 100 
        : 0
    };
  }

  /**
   * Enroll user in program
   */
  async enrollInProgram(userId, programId) {
    const result = await this.pool.query(
      `INSERT INTO program_enrollments (user_id, program_id, enrolled_at, status)
       VALUES ($1, $2, NOW(), 'active')
       ON CONFLICT (user_id, program_id) 
       DO UPDATE SET status = 'active'
       RETURNING *`,
      [userId, programId]
    );

    return result.rows[0];
  }

  /**
   * Get user's program progress
   */
  async getProgramProgress(userId, programId) {
    const structure = await this.getProgramStructure(programId);
    
    const coursesWithProgress = await Promise.all(
      structure.courses.map(async (course) => {
        const completed = await this.isCourseCompleted(userId, course.course_id);
        const unlocked = await this.isCourseUnlocked(userId, programId, course.course_id);
        
        return {
          ...course,
          ...completed,
          ...unlocked
        };
      })
    );

    const totalCourses = coursesWithProgress.length;
    const completedCourses = coursesWithProgress.filter(c => c.completed).length;
    const programProgress = totalCourses > 0 
      ? (completedCourses / totalCourses) * 100 
      : 0;

    return {
      ...structure,
      courses: coursesWithProgress,
      totalCourses,
      completedCourses,
      programProgress
    };
  }

  /**
   * Get all programs for user
   */
  async getUserPrograms(userId) {
    const result = await this.pool.query(
      `SELECT 
        p.*,
        pe.enrolled_at,
        pe.status as enrollment_status,
        (SELECT COUNT(*) FROM program_courses WHERE program_id = p.id) as course_count
       FROM programs p
       LEFT JOIN program_enrollments pe ON p.id = pe.program_id AND pe.user_id = $1
       WHERE p.status = 'published' OR pe.user_id IS NOT NULL
       ORDER BY pe.enrolled_at DESC NULLS LAST, p.title`,
      [userId]
    );

    return result.rows;
  }

  /**
   * Set course prerequisites
   */
  async setPrerequisites(programId, courseId, prerequisiteCourseIds) {
    await this.pool.query(
      `UPDATE program_courses 
       SET prerequisites = $1
       WHERE program_id = $2 AND course_id = $3`,
      [JSON.stringify(prerequisiteCourseIds), programId, courseId]
    );

    return { success: true };
  }

  /**
   * Set drip schedule for course
   */
  async setDripSchedule(programId, courseId, schedule) {
    // Schedule format: { type: 'days_after_enrollment', value: 7 }
    // or: { type: 'date', value: '2026-02-01' }
    // or: { type: 'after_completion', prerequisite: courseId, days: 3 }

    await this.pool.query(
      `UPDATE program_courses 
       SET drip_schedule = $1, unlock_after_days = $2
       WHERE program_id = $3 AND course_id = $4`,
      [
        JSON.stringify(schedule),
        schedule.type === 'days_after_enrollment' ? schedule.value : 0,
        programId,
        courseId
      ]
    );

    return { success: true };
  }
}

module.exports = ProgramsService;
