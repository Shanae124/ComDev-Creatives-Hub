// Question Bank Service for assessments
const { Pool } = require('pg');

class QuestionBankService {
  constructor(pool) {
    this.pool = pool;
  }

  /**
   * Create a question in the bank
   */
  async createQuestion(data) {
    const result = await this.pool.query(
      `INSERT INTO question_bank 
       (title, type, content, options, correct_answer, points, difficulty, 
        tags, created_by, category_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        data.title,
        data.type, // multiple_choice, true_false, short_answer, essay, matching, fill_blank
        data.content,
        data.options ? JSON.stringify(data.options) : null,
        data.correctAnswer ? JSON.stringify(data.correctAnswer) : null,
        data.points || 1,
        data.difficulty || 'medium', // easy, medium, hard
        data.tags ? JSON.stringify(data.tags) : null,
        data.createdBy,
        data.categoryId || null
      ]
    );

    return result.rows[0];
  }

  /**
   * Create a quiz from question bank
   */
  async createQuiz(data) {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      // Create quiz
      const quizResult = await client.query(
        `INSERT INTO quizzes 
         (course_id, title, description, time_limit_minutes, max_attempts, 
          passing_score, shuffle_questions, show_feedback, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [
          data.courseId,
          data.title,
          data.description,
          data.timeLimitMinutes || null,
          data.maxAttempts || null,
          data.passingScore || 70,
          data.shuffleQuestions !== false,
          data.showFeedback !== false,
          data.createdBy
        ]
      );

      const quizId = quizResult.rows[0].id;

      // Add questions to quiz
      if (data.questionIds && data.questionIds.length > 0) {
        for (let i = 0; i < data.questionIds.length; i++) {
          await client.query(
            `INSERT INTO quiz_questions (quiz_id, question_id, sort_order, points_override)
             VALUES ($1, $2, $3, $4)`,
            [quizId, data.questionIds[i], i, null]
          );
        }
      }

      // Or create from question pool with randomization
      if (data.questionPool) {
        await this.addQuestionsFromPool(client, quizId, data.questionPool);
      }

      await client.query('COMMIT');
      return quizResult.rows[0];

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Add questions from pool with filters
   */
  async addQuestionsFromPool(client, quizId, poolConfig) {
    // poolConfig: { category, difficulty, tags, count, randomize }
    let query = 'SELECT id FROM question_bank WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (poolConfig.category) {
      query += ` AND category_id = $${paramCount}`;
      params.push(poolConfig.category);
      paramCount++;
    }

    if (poolConfig.difficulty) {
      query += ` AND difficulty = $${paramCount}`;
      params.push(poolConfig.difficulty);
      paramCount++;
    }

    if (poolConfig.tags && poolConfig.tags.length > 0) {
      query += ` AND tags @> $${paramCount}`;
      params.push(JSON.stringify(poolConfig.tags));
      paramCount++;
    }

    if (poolConfig.randomize) {
      query += ' ORDER BY RANDOM()';
    }

    if (poolConfig.count) {
      query += ` LIMIT $${paramCount}`;
      params.push(poolConfig.count);
    }

    const questions = await client.query(query, params);

    // Add selected questions to quiz
    for (let i = 0; i < questions.rows.length; i++) {
      await client.query(
        `INSERT INTO quiz_questions (quiz_id, question_id, sort_order)
         VALUES ($1, $2, $3)`,
        [quizId, questions.rows[i].id, i]
      );
    }

    return questions.rows.length;
  }

  /**
   * Start quiz attempt
   */
  async startQuizAttempt(userId, quizId) {
    // Check if user has exceeded max attempts
    const quiz = await this.pool.query(
      'SELECT max_attempts FROM quizzes WHERE id = $1',
      [quizId]
    );

    if (quiz.rows[0].max_attempts) {
      const attempts = await this.pool.query(
        'SELECT COUNT(*) FROM quiz_attempts WHERE user_id = $1 AND quiz_id = $2',
        [userId, quizId]
      );

      if (parseInt(attempts.rows[0].count) >= quiz.rows[0].max_attempts) {
        throw new Error('Maximum attempts exceeded');
      }
    }

    // Create new attempt
    const result = await this.pool.query(
      `INSERT INTO quiz_attempts 
       (user_id, quiz_id, started_at, status)
       VALUES ($1, $2, NOW(), 'in_progress')
       RETURNING *`,
      [userId, quizId]
    );

    const attemptId = result.rows[0].id;

    // Load quiz questions (shuffled if needed)
    const questions = await this.pool.query(
      `SELECT qq.*, qb.type, qb.content, qb.options, qb.points
       FROM quiz_questions qq
       JOIN question_bank qb ON qq.question_id = qb.id
       WHERE qq.quiz_id = $1
       ORDER BY ${quiz.rows[0].shuffle_questions ? 'RANDOM()' : 'qq.sort_order'}`,
      [quizId]
    );

    // Store question order for this attempt
    for (let i = 0; i < questions.rows.length; i++) {
      await this.pool.query(
        `INSERT INTO quiz_attempt_questions 
         (attempt_id, question_id, sort_order)
         VALUES ($1, $2, $3)`,
        [attemptId, questions.rows[i].question_id, i]
      );
    }

    return {
      attemptId,
      questions: questions.rows.map(q => ({
        id: q.question_id,
        type: q.type,
        content: q.content,
        options: q.options,
        points: q.points_override || q.points
      }))
    };
  }

  /**
   * Submit answer for quiz question
   */
  async submitAnswer(attemptId, questionId, answer) {
    await this.pool.query(
      `INSERT INTO quiz_answers (attempt_id, question_id, answer, answered_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (attempt_id, question_id)
       DO UPDATE SET answer = $3, answered_at = NOW()`,
      [attemptId, questionId, JSON.stringify(answer)]
    );

    return { success: true };
  }

  /**
   * Complete and grade quiz attempt
   */
  async completeQuizAttempt(attemptId) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Get quiz settings
      const attempt = await client.query(
        `SELECT qa.*, q.show_feedback, q.passing_score
         FROM quiz_attempts qa
         JOIN quizzes q ON qa.quiz_id = q.id
         WHERE qa.id = $1`,
        [attemptId]
      );

      if (attempt.rows[0].status === 'completed') {
        throw new Error('Quiz already completed');
      }

      // Grade all answers
      const answers = await client.query(
        `SELECT 
          qa.question_id, qa.answer,
          qb.correct_answer, qb.type,
          COALESCE(qq.points_override, qb.points) as points
         FROM quiz_answers qa
         JOIN question_bank qb ON qa.question_id = qb.id
         JOIN quiz_questions qq ON qa.question_id = qq.question_id
         WHERE qa.attempt_id = $1`,
        [attemptId]
      );

      let totalPoints = 0;
      let earnedPoints = 0;
      const gradedAnswers = [];

      for (const row of answers.rows) {
        totalPoints += row.points;
        const isCorrect = this.gradeAnswer(row.type, row.answer, row.correct_answer);
        const pointsEarned = isCorrect ? row.points : 0;
        earnedPoints += pointsEarned;

        gradedAnswers.push({
          questionId: row.question_id,
          isCorrect,
          pointsEarned,
          totalPoints: row.points
        });

        // Update answer with grade
        await client.query(
          `UPDATE quiz_answers 
           SET is_correct = $1, points_earned = $2
           WHERE attempt_id = $3 AND question_id = $4`,
          [isCorrect, pointsEarned, attemptId, row.question_id]
        );
      }

      const scorePercent = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
      const passed = scorePercent >= attempt.rows[0].passing_score;

      // Update attempt
      await client.query(
        `UPDATE quiz_attempts 
         SET status = 'completed', 
             completed_at = NOW(),
             score = $1,
             total_points = $2,
             earned_points = $3,
             passed = $4
         WHERE id = $5`,
        [scorePercent, totalPoints, earnedPoints, passed, attemptId]
      );

      await client.query('COMMIT');

      return {
        attemptId,
        score: scorePercent,
        passed,
        totalPoints,
        earnedPoints,
        answers: attempt.rows[0].show_feedback ? gradedAnswers : null
      };

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Grade an answer based on question type
   */
  gradeAnswer(questionType, userAnswer, correctAnswer) {
    const answer = JSON.parse(userAnswer);
    const correct = JSON.parse(correctAnswer);

    switch (questionType) {
      case 'multiple_choice':
      case 'true_false':
        return answer === correct;

      case 'multiple_select':
        if (!Array.isArray(answer) || !Array.isArray(correct)) return false;
        return answer.length === correct.length && 
               answer.every(a => correct.includes(a));

      case 'fill_blank':
      case 'short_answer':
        // Case-insensitive comparison, trimmed
        return answer.toLowerCase().trim() === correct.toLowerCase().trim();

      case 'matching':
        // answer and correct are objects mapping items to matches
        return JSON.stringify(answer) === JSON.stringify(correct);

      case 'essay':
        // Essays require manual grading
        return null;

      default:
        return false;
    }
  }

  /**
   * Get quiz results for user
   */
  async getQuizResults(userId, quizId) {
    const result = await this.pool.query(
      `SELECT 
        qa.*,
        q.title as quiz_title,
        q.passing_score
       FROM quiz_attempts qa
       JOIN quizzes q ON qa.quiz_id = q.id
       WHERE qa.user_id = $1 AND qa.quiz_id = $2
       ORDER BY qa.started_at DESC`,
      [userId, quizId]
    );

    return result.rows;
  }

  /**
   * Export questions to QTI format
   */
  async exportToQTI(questionIds) {
    const questions = await this.pool.query(
      `SELECT * FROM question_bank WHERE id = ANY($1)`,
      [questionIds]
    );

    // Generate QTI XML (simplified)
    let qti = '<?xml version="1.0" encoding="UTF-8"?>\n';
    qti += '<questestinteroperability xmlns="http://www.imsglobal.org/xsd/ims_qtiasiv1p2">\n';
    qti += '<assessment title="Exported Questions">\n';

    for (const q of questions.rows) {
      qti += this.questionToQTI(q);
    }

    qti += '</assessment>\n</questestinteroperability>';
    return qti;
  }

  /**
   * Convert question to QTI format
   */
  questionToQTI(question) {
    // Simplified QTI generation
    let qti = `<item ident="${question.id}" title="${question.title}">\n`;
    qti += `  <presentation>\n`;
    qti += `    <material><mattext>${question.content}</mattext></material>\n`;
    
    if (question.type === 'multiple_choice' && question.options) {
      qti += `    <response_lid ident="response_${question.id}">\n`;
      const options = JSON.parse(question.options);
      options.forEach((opt, i) => {
        qti += `      <render_choice><response_label ident="${i}">${opt}</response_label></render_choice>\n`;
      });
      qti += `    </response_lid>\n`;
    }

    qti += `  </presentation>\n`;
    qti += `</item>\n`;
    return qti;
  }
}

module.exports = QuestionBankService;
