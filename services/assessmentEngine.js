// Assessment Engine Service - Quiz Delivery & Grading
const { Pool } = require('pg');

class AssessmentEngine {
  constructor(pool) {
    this.pool = pool;
  }

  /**
   * Create a new assessment/quiz
   */
  async createAssessment(data) {
    const result = await this.pool.query(
      `INSERT INTO assessments 
       (title, description, course_id, module_id, lesson_id, org_id,
        instructions, time_limit, pass_threshold, max_attempts, 
        shuffle_questions, shuffle_answers, show_feedback, 
        show_correct_answers, available_from, available_until, settings)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
       RETURNING *`,
      [
        data.title,
        data.description,
        data.courseId,
        data.moduleId || null,
        data.lessonId || null,
        data.orgId,
        data.instructions,
        data.timeLimit || null, // minutes
        data.passThreshold || 70, // percentage
        data.maxAttempts || null, // null = unlimited
        data.shuffleQuestions !== false,
        data.shuffleAnswers !== false,
        data.showFeedback !== false,
        data.showCorrectAnswers !== false,
        data.availableFrom || null,
        data.availableUntil || null,
        data.settings ? JSON.stringify(data.settings) : JSON.stringify({
          allowReview: true,
          allowPause: false,
          requireProctoring: false,
          randomizeFromPool: false
        })
      ]
    );

    return result.rows[0];
  }

  /**
   * Add questions to assessment
   */
  async addQuestionsToAssessment(assessmentId, questions) {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      for (const question of questions) {
        await client.query(
          `INSERT INTO assessment_questions 
           (assessment_id, question_id, sort_order, points)
           VALUES ($1, $2, $3, $4)`,
          [
            assessmentId,
            question.questionId,
            question.sortOrder,
            question.points || 1
          ]
        );
      }

      await client.query('COMMIT');
      return { success: true, count: questions.length };

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Start an assessment attempt
   */
  async startAttempt(userId, assessmentId) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Get assessment details
      const assessment = await client.query(
        `SELECT * FROM assessments WHERE id = $1`,
        [assessmentId]
      );

      if (assessment.rows.length === 0) {
        throw new Error('Assessment not found');
      }

      const assessmentData = assessment.rows[0];

      // Check max attempts
      if (assessmentData.max_attempts) {
        const previousAttempts = await client.query(
          `SELECT COUNT(*) as count FROM assessment_attempts 
           WHERE user_id = $1 AND assessment_id = $2`,
          [userId, assessmentId]
        );

        if (parseInt(previousAttempts.rows[0].count) >= assessmentData.max_attempts) {
          throw new Error('Maximum attempts reached');
        }
      }

      // Check availability window
      const now = new Date();
      if (assessmentData.available_from && new Date(assessmentData.available_from) > now) {
        throw new Error('Assessment not yet available');
      }
      if (assessmentData.available_until && new Date(assessmentData.available_until) < now) {
        throw new Error('Assessment no longer available');
      }

      // Get questions
      let questions = await client.query(
        `SELECT aq.*, q.*
         FROM assessment_questions aq
         JOIN questions q ON aq.question_id = q.id
         WHERE aq.assessment_id = $1
         ORDER BY aq.sort_order`,
        [assessmentId]
      );

      questions = questions.rows;

      // Shuffle if enabled
      if (assessmentData.shuffle_questions) {
        questions = this.shuffleArray(questions);
      }

      // Shuffle answers if enabled
      if (assessmentData.shuffle_answers) {
        questions = questions.map(q => {
          if (q.type === 'multiple_choice' && q.options) {
            const options = JSON.parse(q.options);
            q.options = JSON.stringify(this.shuffleArray(options));
          }
          return q;
        });
      }

      // Calculate due date based on time limit
      const dueAt = assessmentData.time_limit 
        ? new Date(Date.now() + assessmentData.time_limit * 60000)
        : null;

      // Create attempt
      const attempt = await client.query(
        `INSERT INTO assessment_attempts 
         (user_id, assessment_id, started_at, due_at, status, questions_data)
         VALUES ($1, $2, NOW(), $3, 'in_progress', $4)
         RETURNING *`,
        [userId, assessmentId, dueAt, JSON.stringify(questions)]
      );

      await client.query('COMMIT');

      // Return attempt with questions (but hide correct answers)
      const attemptData = attempt.rows[0];
      attemptData.questions = questions.map(q => {
        const sanitized = { ...q };
        delete sanitized.correct_answer;
        delete sanitized.acceptable_answers;
        return sanitized;
      });

      return attemptData;

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Submit answer to question during attempt
   */
  async submitAnswer(attemptId, questionId, answer) {
    await this.pool.query(
      `INSERT INTO attempt_answers (attempt_id, question_id, answer, submitted_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (attempt_id, question_id)
       DO UPDATE SET answer = $3, submitted_at = NOW()`,
      [attemptId, questionId, JSON.stringify(answer)]
    );

    return { success: true };
  }

  /**
   * Auto-save attempt progress
   */
  async saveProgress(attemptId, answers) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      for (const { questionId, answer } of answers) {
        await client.query(
          `INSERT INTO attempt_answers (attempt_id, question_id, answer, submitted_at)
           VALUES ($1, $2, $3, NOW())
           ON CONFLICT (attempt_id, question_id)
           DO UPDATE SET answer = $3, submitted_at = NOW()`,
          [attemptId, questionId, JSON.stringify(answer)]
        );
      }

      await client.query('COMMIT');
      return { success: true };

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Submit and grade assessment attempt
   */
  async submitAttempt(attemptId) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Get attempt data
      const attempt = await client.query(
        `SELECT * FROM assessment_attempts WHERE id = $1`,
        [attemptId]
      );

      if (attempt.rows.length === 0) {
        throw new Error('Attempt not found');
      }

      const attemptData = attempt.rows[0];

      // Check if already submitted
      if (attemptData.status === 'completed') {
        throw new Error('Attempt already submitted');
      }

      // Get assessment data
      const assessment = await client.query(
        `SELECT * FROM assessments WHERE id = $1`,
        [attemptData.assessment_id]
      );

      const assessmentData = assessment.rows[0];

      // Get all answers
      const answers = await client.query(
        `SELECT * FROM attempt_answers WHERE attempt_id = $1`,
        [attemptId]
      );

      // Get questions with correct answers
      const questions = JSON.parse(attemptData.questions_data);

      // Grade each answer
      let totalPoints = 0;
      let earnedPoints = 0;
      const gradedAnswers = [];

      for (const question of questions) {
        const answer = answers.rows.find(a => a.question_id === question.id);
        const points = question.points || 1;
        totalPoints += points;

        const gradeResult = await this.gradeAnswer(
          question,
          answer ? JSON.parse(answer.answer) : null
        );

        earnedPoints += gradeResult.points * points;

        gradedAnswers.push({
          questionId: question.id,
          userAnswer: answer ? JSON.parse(answer.answer) : null,
          correctAnswer: question.correct_answer,
          isCorrect: gradeResult.isCorrect,
          pointsEarned: gradeResult.points * points,
          pointsPossible: points,
          feedback: gradeResult.feedback
        });

        // Update answer with grade
        if (answer) {
          await client.query(
            `UPDATE attempt_answers 
             SET is_correct = $1, points_earned = $2, feedback = $3
             WHERE id = $4`,
            [gradeResult.isCorrect, gradeResult.points * points, gradeResult.feedback, answer.id]
          );
        }
      }

      // Calculate final score percentage
      const scorePercentage = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
      const passed = scorePercentage >= assessmentData.pass_threshold;

      // Update attempt
      await client.query(
        `UPDATE assessment_attempts 
         SET status = 'completed',
             completed_at = NOW(),
             score = $1,
             points_earned = $2,
             points_possible = $3,
             passed = $4,
             graded_answers = $5
         WHERE id = $6`,
        [
          scorePercentage,
          earnedPoints,
          totalPoints,
          passed,
          JSON.stringify(gradedAnswers),
          attemptId
        ]
      );

      // Update lesson progress if linked to lesson
      if (assessmentData.lesson_id) {
        await client.query(
          `INSERT INTO lesson_progress 
           (user_id, lesson_id, status, completed_at, score)
           VALUES ($1, $2, $3, NOW(), $4)
           ON CONFLICT (user_id, lesson_id)
           DO UPDATE SET 
             status = $3,
             completed_at = NOW(),
             score = $4`,
          [
            attemptData.user_id,
            assessmentData.lesson_id,
            passed ? 'completed' : 'failed',
            scorePercentage
          ]
        );
      }

      await client.query('COMMIT');

      return {
        attemptId,
        score: scorePercentage,
        pointsEarned: earnedPoints,
        pointsPossible: totalPoints,
        passed,
        gradedAnswers: assessmentData.show_correct_answers ? gradedAnswers : gradedAnswers.map(a => ({
          questionId: a.questionId,
          isCorrect: a.isCorrect,
          pointsEarned: a.pointsEarned,
          pointsPossible: a.pointsPossible,
          feedback: a.feedback
        }))
      };

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Grade a single answer
   */
  async gradeAnswer(question, userAnswer) {
    if (!userAnswer) {
      return {
        isCorrect: false,
        points: 0,
        feedback: 'No answer provided'
      };
    }

    switch (question.type) {
      case 'multiple_choice':
        return this.gradeMultipleChoice(question, userAnswer);
      
      case 'true_false':
        return this.gradeTrueFalse(question, userAnswer);
      
      case 'short_answer':
        return this.gradeShortAnswer(question, userAnswer);
      
      case 'matching':
        return this.gradeMatching(question, userAnswer);
      
      case 'essay':
        // Essays require manual grading
        return {
          isCorrect: null,
          points: 0,
          feedback: 'Requires manual grading'
        };
      
      default:
        return {
          isCorrect: false,
          points: 0,
          feedback: 'Unknown question type'
        };
    }
  }

  /**
   * Grade multiple choice question
   */
  gradeMultipleChoice(question, userAnswer) {
    const correctAnswer = JSON.parse(question.correct_answer);
    
    // Handle single answer
    if (!Array.isArray(correctAnswer)) {
      const isCorrect = userAnswer === correctAnswer;
      return {
        isCorrect,
        points: isCorrect ? 1 : 0,
        feedback: isCorrect ? 'Correct!' : 'Incorrect'
      };
    }

    // Handle multiple correct answers
    const userAnswerArray = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
    const correctSet = new Set(correctAnswer);
    const userSet = new Set(userAnswerArray);

    const correctSelections = userAnswerArray.filter(a => correctSet.has(a)).length;
    const incorrectSelections = userAnswerArray.filter(a => !correctSet.has(a)).length;
    const missedCorrect = correctAnswer.filter(a => !userSet.has(a)).length;

    // Calculate partial credit
    const totalCorrect = correctAnswer.length;
    const points = Math.max(0, (correctSelections - incorrectSelections) / totalCorrect);

    return {
      isCorrect: points === 1,
      points,
      feedback: points === 1 ? 'Correct!' : 
                points > 0 ? `Partially correct (${(points * 100).toFixed(0)}%)` :
                'Incorrect'
    };
  }

  /**
   * Grade true/false question
   */
  gradeTrueFalse(question, userAnswer) {
    const correctAnswer = question.correct_answer === 'true' || question.correct_answer === true;
    const userBool = userAnswer === 'true' || userAnswer === true;
    const isCorrect = userBool === correctAnswer;

    return {
      isCorrect,
      points: isCorrect ? 1 : 0,
      feedback: isCorrect ? 'Correct!' : 'Incorrect'
    };
  }

  /**
   * Grade short answer question
   */
  gradeShortAnswer(question, userAnswer) {
    const acceptableAnswers = JSON.parse(question.acceptable_answers || '[]');
    const caseSensitive = question.case_sensitive || false;

    const userAnswerNorm = caseSensitive ? userAnswer.trim() : userAnswer.trim().toLowerCase();

    const isCorrect = acceptableAnswers.some(answer => {
      const answerNorm = caseSensitive ? answer.trim() : answer.trim().toLowerCase();
      return userAnswerNorm === answerNorm;
    });

    return {
      isCorrect,
      points: isCorrect ? 1 : 0,
      feedback: isCorrect ? 'Correct!' : 'Incorrect'
    };
  }

  /**
   * Grade matching question
   */
  gradeMatching(question, userAnswer) {
    const correctPairs = JSON.parse(question.correct_answer);
    let correctMatches = 0;

    for (const [key, value] of Object.entries(userAnswer)) {
      if (correctPairs[key] === value) {
        correctMatches++;
      }
    }

    const totalPairs = Object.keys(correctPairs).length;
    const points = correctMatches / totalPairs;

    return {
      isCorrect: points === 1,
      points,
      feedback: points === 1 ? 'All correct!' :
                points > 0 ? `${correctMatches} of ${totalPairs} correct` :
                'All incorrect'
    };
  }

  /**
   * Get attempt results with detailed feedback
   */
  async getAttemptResults(attemptId, userId) {
    const result = await this.pool.query(
      `SELECT 
        aa.*,
        a.title,
        a.show_feedback,
        a.show_correct_answers
       FROM assessment_attempts aa
       JOIN assessments a ON aa.assessment_id = a.id
       WHERE aa.id = $1 AND aa.user_id = $2`,
      [attemptId, userId]
    );

    if (result.rows.length === 0) {
      throw new Error('Attempt not found');
    }

    const attempt = result.rows[0];
    
    // Parse graded answers if available
    if (attempt.graded_answers) {
      attempt.gradedAnswers = JSON.parse(attempt.graded_answers);

      // Hide correct answers if setting disabled
      if (!attempt.show_correct_answers) {
        attempt.gradedAnswers = attempt.gradedAnswers.map(a => ({
          questionId: a.questionId,
          isCorrect: a.isCorrect,
          pointsEarned: a.pointsEarned,
          pointsPossible: a.pointsPossible,
          feedback: a.feedback
        }));
      }
    }

    return attempt;
  }

  /**
   * Get all attempts for an assessment by user
   */
  async getUserAttempts(userId, assessmentId) {
    const result = await this.pool.query(
      `SELECT * FROM assessment_attempts 
       WHERE user_id = $1 AND assessment_id = $2
       ORDER BY started_at DESC`,
      [userId, assessmentId]
    );

    return result.rows;
  }

  /**
   * Shuffle array helper
   */
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

module.exports = AssessmentEngine;
