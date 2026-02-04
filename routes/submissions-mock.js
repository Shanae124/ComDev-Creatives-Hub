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

router.post('/', (req, res) => {
  const userId = getUserIdFromRequest(req) || 2;
  const submission = {
    id: req.mockDB.submissions.length + 1,
    student_id: userId,
    ...req.body,
    submitted_at: new Date().toISOString(),
    status: 'submitted'
  };
  req.mockDB.submissions.push(submission);
  req.saveDB();
  res.status(201).json(submission);
});

router.get('/project/:projectId', (req, res) => {
  const projectId = parseInt(req.params.projectId);
  const submissions = req.mockDB.submissions.filter(s => parseInt(s.projectId || s.project_id) === projectId);
  res.json(submissions);
});

router.get('/my/submissions', (req, res) => {
  const userId = getUserIdFromRequest(req) || 2;
  const submissions = req.mockDB.submissions.filter(s => s.student_id === userId);
  res.json(submissions);
});

router.get('/:id', (req, res) => {
  const submission = req.mockDB.submissions.find(s => s.id === parseInt(req.params.id));
  if (!submission) {
    return res.status(404).json({ error: 'Submission not found' });
  }
  res.json(submission);
});

router.put('/:id/grade', (req, res) => {
  const submission = req.mockDB.submissions.find(s => s.id === parseInt(req.params.id));
  if (!submission) {
    return res.status(404).json({ error: 'Submission not found' });
  }
  submission.grade = req.body.grade;
  submission.feedback = req.body.feedback;
  submission.status = 'graded';
  req.saveDB();
  res.json(submission);
});

module.exports = router;
