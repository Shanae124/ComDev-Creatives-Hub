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

router.get('/:studentId', (req, res) => {
  const studentId = parseInt(req.params.studentId);
  res.json(req.mockDB.portfolio.filter(p => p.student_id === studentId));
});

router.post('/', (req, res) => {
  const userId = getUserIdFromRequest(req) || 2;
  const item = {
    id: req.mockDB.portfolio.length + 1,
    student_id: userId,
    ...req.body,
    created_at: new Date().toISOString()
  };
  req.mockDB.portfolio.push(item);
  req.saveDB();
  res.status(201).json(item);
});

router.put('/:id/featured', (req, res) => {
  const item = req.mockDB.portfolio.find(p => p.id === parseInt(req.params.id));
  if (!item) {
    return res.status(404).json({ error: 'Portfolio item not found' });
  }
  item.is_featured = !item.is_featured;
  req.saveDB();
  res.json(item);
});

module.exports = router;
