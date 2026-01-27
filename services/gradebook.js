// Gradebook Service - Grade Management & Reporting
const { Pool } = require('pg');

class GradebookService {
  constructor(pool) {
    this.pool = pool;
  }

  /**
   * Create gradebook structure for course
   */
  async createGradebook(courseId, structure) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Create gradebook
      const gradebook = await client.query(
        `INSERT INTO gradebooks 
         (course_id, settings, calculation_method)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [
          courseId,
          JSON.stringify(structure.settings || {
            displayType: 'percentage', // percentage, points, letter
            dropLowest: 0,
            latePenalty: 0,
            extraCredit: true
          }),
          structure.calculationMethod || 'weighted_categories' // weighted_categories, points_based, custom
        ]
      );

      const gradebookId = gradebook.rows[0].id;

      // Create categories if using weighted system
      if (structure.categories) {
        for (const category of structure.categories) {
          await client.query(
            `INSERT INTO grade_categories 
             (gradebook_id, name, weight, drop_lowest, sort_order)
             VALUES ($1, $2, $3, $4, $5)`,
            [
              gradebookId,
              category.name,
              category.weight,
              category.dropLowest || 0,
              category.sortOrder
            ]
          );
        }
      }

      await client.query('COMMIT');
      return gradebook.rows[0];

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Create grade item (assignment, quiz, etc.)
   */
  async createGradeItem(data) {
    const result = await this.pool.query(
      `INSERT INTO grade_items 
       (gradebook_id, category_id, name, description, type,
        points_possible, due_date, weight, is_extra_credit, 
        grading_type, rubric_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        data.gradebookId,
        data.categoryId || null,
        data.name,
        data.description,
        data.type, // assignment, quiz, exam, discussion, project
        data.pointsPossible,
        data.dueDate,
        data.weight || null,
        data.isExtraCredit || false,
        data.gradingType || 'points', // points, percentage, letter, pass_fail, rubric
        data.rubricId || null
      ]
    );

    return result.rows[0];
  }

  /**
   * Record grade for student
   */
  async recordGrade(data) {
    const result = await this.pool.query(
      `INSERT INTO grades 
       (grade_item_id, user_id, score, points_possible, 
        percentage, letter_grade, status, graded_by, graded_at, 
        feedback, late_submission, submission_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), $9, $10, $11)
       ON CONFLICT (grade_item_id, user_id)
       DO UPDATE SET 
         score = $3,
         points_possible = $4,
         percentage = $5,
         letter_grade = $6,
         status = $7,
         graded_by = $8,
         graded_at = NOW(),
         feedback = $9,
         late_submission = $10
       RETURNING *`,
      [
        data.gradeItemId,
        data.userId,
        data.score,
        data.pointsPossible,
        data.percentage,
        data.letterGrade,
        data.status || 'graded',
        data.gradedBy,
        data.feedback,
        data.lateSubmission || false,
        data.submissionDate
      ]
    );

    // Recalculate overall grade
    await this.calculateOverallGrade(data.userId, data.gradeItemId);

    return result.rows[0];
  }

  /**
   * Calculate overall grade for student in course
   */
  async calculateOverallGrade(userId, gradeItemId) {
    // Get gradebook and calculation method
    const gradebookQuery = await this.pool.query(
      `SELECT gb.* FROM gradebooks gb
       JOIN grade_items gi ON gi.gradebook_id = gb.id
       WHERE gi.id = $1`,
      [gradeItemId]
    );

    if (gradebookQuery.rows.length === 0) return;

    const gradebook = gradebookQuery.rows[0];

    let overallGrade;

    if (gradebook.calculation_method === 'weighted_categories') {
      overallGrade = await this.calculateWeightedGrade(userId, gradebook.id);
    } else if (gradebook.calculation_method === 'points_based') {
      overallGrade = await this.calculatePointsBasedGrade(userId, gradebook.id);
    }

    // Update or create overall grade record
    await this.pool.query(
      `INSERT INTO overall_grades 
       (gradebook_id, user_id, overall_score, overall_percentage, 
        overall_letter, calculated_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (gradebook_id, user_id)
       DO UPDATE SET 
         overall_score = $3,
         overall_percentage = $4,
         overall_letter = $5,
         calculated_at = NOW()`,
      [
        gradebook.id,
        userId,
        overallGrade.score,
        overallGrade.percentage,
        this.percentageToLetter(overallGrade.percentage)
      ]
    );

    return overallGrade;
  }

  /**
   * Calculate weighted grade by categories
   */
  async calculateWeightedGrade(userId, gradebookId) {
    // Get all categories with their weights
    const categories = await this.pool.query(
      `SELECT * FROM grade_categories WHERE gradebook_id = $1`,
      [gradebookId]
    );

    let totalWeightedScore = 0;
    let totalWeight = 0;

    for (const category of categories.rows) {
      // Get all grades in this category for user
      const grades = await this.pool.query(
        `SELECT g.*, gi.points_possible as item_points, gi.is_extra_credit
         FROM grades g
         JOIN grade_items gi ON g.grade_item_id = gi.id
         WHERE gi.category_id = $1 AND g.user_id = $2 AND g.status = 'graded'
         ORDER BY g.percentage DESC`,
        [category.id, userId]
      );

      if (grades.rows.length === 0) continue;

      let categoryGrades = grades.rows;

      // Drop lowest if configured
      if (category.drop_lowest > 0 && categoryGrades.length > category.drop_lowest) {
        categoryGrades.sort((a, b) => a.percentage - b.percentage);
        categoryGrades = categoryGrades.slice(category.drop_lowest);
      }

      // Separate regular and extra credit
      const regularGrades = categoryGrades.filter(g => !g.is_extra_credit);
      const extraCreditGrades = categoryGrades.filter(g => g.is_extra_credit);

      // Calculate category average
      const categoryTotal = regularGrades.reduce((sum, g) => sum + parseFloat(g.score), 0);
      const categoryPossible = regularGrades.reduce((sum, g) => sum + parseFloat(g.item_points), 0);

      // Add extra credit
      const extraCreditPoints = extraCreditGrades.reduce((sum, g) => sum + parseFloat(g.score), 0);

      const categoryPercentage = categoryPossible > 0 
        ? ((categoryTotal + extraCreditPoints) / categoryPossible) * 100
        : 0;

      totalWeightedScore += (categoryPercentage * category.weight);
      totalWeight += category.weight;
    }

    const overallPercentage = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;

    return {
      score: overallPercentage,
      percentage: overallPercentage,
      method: 'weighted_categories'
    };
  }

  /**
   * Calculate points-based grade
   */
  async calculatePointsBasedGrade(userId, gradebookId) {
    const result = await this.pool.query(
      `SELECT 
         SUM(CASE WHEN gi.is_extra_credit = false THEN g.score ELSE 0 END) as total_score,
         SUM(CASE WHEN gi.is_extra_credit = false THEN g.points_possible ELSE 0 END) as total_possible,
         SUM(CASE WHEN gi.is_extra_credit = true THEN g.score ELSE 0 END) as extra_credit_score
       FROM grades g
       JOIN grade_items gi ON g.grade_item_id = gi.id
       WHERE gi.gradebook_id = $1 AND g.user_id = $2 AND g.status = 'graded'`,
      [gradebookId, userId]
    );

    const totalScore = parseFloat(result.rows[0].total_score || 0);
    const totalPossible = parseFloat(result.rows[0].total_possible || 0);
    const extraCredit = parseFloat(result.rows[0].extra_credit_score || 0);

    const finalScore = totalScore + extraCredit;
    const percentage = totalPossible > 0 ? (finalScore / totalPossible) * 100 : 0;

    return {
      score: finalScore,
      percentage: percentage,
      method: 'points_based'
    };
  }

  /**
   * Get student gradebook view
   */
  async getStudentGradebook(userId, courseId) {
    // Get gradebook
    const gradebook = await this.pool.query(
      `SELECT * FROM gradebooks WHERE course_id = $1`,
      [courseId]
    );

    if (gradebook.rows.length === 0) {
      return null;
    }

    const gradebookId = gradebook.rows[0].id;

    // Get overall grade
    const overallGrade = await this.pool.query(
      `SELECT * FROM overall_grades WHERE gradebook_id = $1 AND user_id = $2`,
      [gradebookId, userId]
    );

    // Get categories with grades
    const categories = await this.pool.query(
      `SELECT 
         gc.*,
         COALESCE(
           (SELECT AVG(g.percentage)
            FROM grades g
            JOIN grade_items gi ON g.grade_item_id = gi.id
            WHERE gi.category_id = gc.id AND g.user_id = $2 AND g.status = 'graded'),
           0
         ) as category_average
       FROM grade_categories gc
       WHERE gc.gradebook_id = $1
       ORDER BY gc.sort_order`,
      [gradebookId, userId]
    );

    // Get all grade items with grades
    const gradeItems = await this.pool.query(
      `SELECT 
         gi.*,
         g.score,
         g.percentage,
         g.letter_grade,
         g.status as grade_status,
         g.feedback,
         g.graded_at,
         g.late_submission,
         gc.name as category_name
       FROM grade_items gi
       LEFT JOIN grades g ON gi.id = g.grade_item_id AND g.user_id = $2
       LEFT JOIN grade_categories gc ON gi.category_id = gc.id
       WHERE gi.gradebook_id = $1
       ORDER BY gi.due_date DESC NULLS LAST`,
      [gradebookId, userId]
    );

    return {
      gradebook: gradebook.rows[0],
      overallGrade: overallGrade.rows[0] || null,
      categories: categories.rows,
      gradeItems: gradeItems.rows
    };
  }

  /**
   * Get instructor gradebook view (all students)
   */
  async getInstructorGradebook(courseId) {
    // Get all enrolled students
    const students = await this.pool.query(
      `SELECT u.id, u.name, u.email
       FROM users u
       JOIN enrollments e ON u.id = e.user_id
       WHERE e.course_id = $1 AND e.status = 'active'
       ORDER BY u.name`,
      [courseId]
    );

    // Get gradebook
    const gradebook = await this.pool.query(
      `SELECT * FROM gradebooks WHERE course_id = $1`,
      [courseId]
    );

    if (gradebook.rows.length === 0) {
      return { students: students.rows, gradeItems: [], grades: [] };
    }

    const gradebookId = gradebook.rows[0].id;

    // Get all grade items
    const gradeItems = await this.pool.query(
      `SELECT gi.*, gc.name as category_name
       FROM grade_items gi
       LEFT JOIN grade_categories gc ON gi.category_id = gc.id
       WHERE gi.gradebook_id = $1
       ORDER BY gi.due_date`,
      [gradebookId]
    );

    // Get all grades
    const grades = await this.pool.query(
      `SELECT g.*, og.overall_percentage
       FROM grades g
       LEFT JOIN overall_grades og ON g.user_id = og.user_id AND og.gradebook_id = $1
       WHERE g.grade_item_id IN (
         SELECT id FROM grade_items WHERE gradebook_id = $1
       )`,
      [gradebookId]
    );

    // Organize grades by student and item
    const gradeMatrix = {};
    students.rows.forEach(student => {
      gradeMatrix[student.id] = {
        student: student,
        grades: {},
        overall: null
      };
    });

    grades.rows.forEach(grade => {
      if (gradeMatrix[grade.user_id]) {
        gradeMatrix[grade.user_id].grades[grade.grade_item_id] = grade;
        if (grade.overall_percentage !== null) {
          gradeMatrix[grade.user_id].overall = grade.overall_percentage;
        }
      }
    });

    return {
      gradebook: gradebook.rows[0],
      gradeItems: gradeItems.rows,
      students: Object.values(gradeMatrix)
    };
  }

  /**
   * Create grading rubric
   */
  async createRubric(data) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      const rubric = await client.query(
        `INSERT INTO rubrics (title, description, course_id, total_points)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [data.title, data.description, data.courseId, data.totalPoints]
      );

      const rubricId = rubric.rows[0].id;

      // Add criteria
      for (const criterion of data.criteria) {
        const criterionResult = await client.query(
          `INSERT INTO rubric_criteria 
           (rubric_id, description, points, sort_order)
           VALUES ($1, $2, $3, $4)
           RETURNING *`,
          [rubricId, criterion.description, criterion.points, criterion.sortOrder]
        );

        const criterionId = criterionResult.rows[0].id;

        // Add levels for criterion
        if (criterion.levels) {
          for (const level of criterion.levels) {
            await client.query(
              `INSERT INTO rubric_levels 
               (criterion_id, description, points, sort_order)
               VALUES ($1, $2, $3, $4)`,
              [criterionId, level.description, level.points, level.sortOrder]
            );
          }
        }
      }

      await client.query('COMMIT');
      return rubricId;

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Grade using rubric
   */
  async gradeWithRubric(gradeItemId, userId, rubricScores) {
    let totalScore = 0;
    const feedback = [];

    // Calculate score from rubric
    for (const score of rubricScores) {
      totalScore += score.points;
      if (score.feedback) {
        feedback.push({
          criterion: score.criterionId,
          feedback: score.feedback
        });
      }
    }

    // Get grade item to find total possible
    const gradeItem = await this.pool.query(
      `SELECT points_possible FROM grade_items WHERE id = $1`,
      [gradeItemId]
    );

    const pointsPossible = gradeItem.rows[0].points_possible;
    const percentage = (totalScore / pointsPossible) * 100;

    // Record grade
    return await this.recordGrade({
      gradeItemId,
      userId,
      score: totalScore,
      pointsPossible,
      percentage,
      letterGrade: this.percentageToLetter(percentage),
      status: 'graded',
      feedback: JSON.stringify(feedback),
      gradedBy: null // Would come from authenticated user
    });
  }

  /**
   * Export gradebook to CSV
   */
  async exportGradebook(courseId) {
    const data = await this.getInstructorGradebook(courseId);

    // Create CSV header
    const headers = ['Student Name', 'Student Email'];
    data.gradeItems.forEach(item => {
      headers.push(`${item.name} (${item.points_possible})`);
    });
    headers.push('Overall Grade');

    // Create rows
    const rows = [headers];

    data.students.forEach(studentData => {
      const row = [
        studentData.student.name,
        studentData.student.email
      ];

      data.gradeItems.forEach(item => {
        const grade = studentData.grades[item.id];
        row.push(grade ? grade.score : '-');
      });

      row.push(studentData.overall || '-');
      rows.push(row);
    });

    // Convert to CSV string
    const csv = rows.map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');

    return csv;
  }

  /**
   * Convert percentage to letter grade
   */
  percentageToLetter(percentage) {
    if (percentage >= 93) return 'A';
    if (percentage >= 90) return 'A-';
    if (percentage >= 87) return 'B+';
    if (percentage >= 83) return 'B';
    if (percentage >= 80) return 'B-';
    if (percentage >= 77) return 'C+';
    if (percentage >= 73) return 'C';
    if (percentage >= 70) return 'C-';
    if (percentage >= 67) return 'D+';
    if (percentage >= 63) return 'D';
    if (percentage >= 60) return 'D-';
    return 'F';
  }

  /**
   * Get grade statistics for item
   */
  async getGradeStatistics(gradeItemId) {
    const result = await this.pool.query(
      `SELECT 
         COUNT(*) as total_submissions,
         AVG(percentage) as average,
         MIN(percentage) as minimum,
         MAX(percentage) as maximum,
         STDDEV(percentage) as std_deviation,
         PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY percentage) as median
       FROM grades
       WHERE grade_item_id = $1 AND status = 'graded'`,
      [gradeItemId]
    );

    return result.rows[0];
  }
}

module.exports = GradebookService;
