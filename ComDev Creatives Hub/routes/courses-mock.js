const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const getUserIdFromRequest = (req) => {
  const token = req.cookies?.token || req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key');
    return decoded.id;
  } catch {
    return null;
  }
};

// Get all courses
router.get('/', (req, res) => {
  const courses = req.mockDB.courses.map(c => {
    const instructor = req.mockDB.users.find(u => u.id === c.instructor_id);
    const enrollmentCount = req.mockDB.enrollments.filter(e => e.course_id === c.id).length;
    return {
      ...c,
      instructor_name: instructor ? `${instructor.first_name} ${instructor.last_name}` : 'Unknown',
      student_count: enrollmentCount
    };
  });
  res.json(courses);
});

// Get course by ID
router.get('/:id', (req, res) => {
  const course = req.mockDB.courses.find(c => c.id === parseInt(req.params.id));
  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }

  const instructor = req.mockDB.users.find(u => u.id === course.instructor_id);
  
  const modules = req.mockDB.modules
    .filter(m => m.course_id === course.id)
    .sort((a, b) => a.order_index - b.order_index)
    .map(m => ({
      ...m,
      lessons: req.mockDB.lessons
        .filter(l => l.module_id === m.id)
        .sort((a, b) => a.order_index - b.order_index),
      projects: req.mockDB.projects
        .filter(p => p.module_id === m.id)
    }));

  res.json({
    ...course,
    instructor_name: instructor ? `${instructor.first_name} ${instructor.last_name}` : 'Unknown',
    instructor_avatar: instructor?.avatar_url,
    modules
  });
});

// Enroll in course
router.post('/:id/enroll', (req, res) => {
  const userId = getUserIdFromRequest(req) || 2;
  const courseId = parseInt(req.params.id);

  const existing = req.mockDB.enrollments.find(e => e.course_id === courseId && e.student_id === userId);
  if (!existing) {
    const newEnrollment = {
      id: req.mockDB.enrollments.length + 1,
      course_id: courseId,
      student_id: userId,
      progress: 0
    };
    req.mockDB.enrollments.push(newEnrollment);
    req.saveDB();
  }

  res.json({ message: 'Enrolled successfully' });
});

// Get student's enrolled courses
router.get('/my/enrollments', (req, res) => {
  const userId = getUserIdFromRequest(req) || 2;
  const enrollments = req.mockDB.enrollments
    .filter(e => e.student_id === userId)
    .map(e => {
    const course = req.mockDB.courses.find(c => c.id === e.course_id);
    const instructor = req.mockDB.users.find(u => u.id === course?.instructor_id);
    return {
      ...course,
      instructor_name: instructor ? `${instructor.first_name} ${instructor.last_name}` : 'Unknown',
      progress: e.progress,
      enrolled_at: new Date().toISOString()
    };
  });
  res.json(enrollments);
});

module.exports = router;
