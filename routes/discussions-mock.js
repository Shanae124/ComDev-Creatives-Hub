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

router.get('/module/:moduleId', (req, res) => {
  const moduleId = parseInt(req.params.moduleId);
  res.json(req.mockDB.discussions.filter(d => d.module_id === moduleId));
});

router.post('/', (req, res) => {
  const userId = getUserIdFromRequest(req) || 2;
  const discussion = {
    id: req.mockDB.discussions.length + 1,
    author_id: userId,
    ...req.body,
    created_at: new Date().toISOString(),
    replies: []
  };
  req.mockDB.discussions.push(discussion);
  req.saveDB();
  res.status(201).json(discussion);
});

router.get('/:id', (req, res) => {
  const discussion = req.mockDB.discussions.find(d => d.id === parseInt(req.params.id));
  if (!discussion) {
    return res.status(404).json({ error: 'Discussion not found' });
  }
  res.json(discussion);
});

router.post('/:id/replies', (req, res) => {
  const discussion = req.mockDB.discussions.find(d => d.id === parseInt(req.params.id));
  if (!discussion) {
    return res.status(404).json({ error: 'Discussion not found' });
  }

  const userId = getUserIdFromRequest(req) || 2;
  const reply = {
    id: Date.now(),
    discussion_id: parseInt(req.params.id),
    author_id: userId,
    content: req.body.content,
    created_at: new Date().toISOString()
  };

  discussion.replies = discussion.replies || [];
  discussion.replies.push(reply);
  req.saveDB();
  res.status(201).json(reply);
});

module.exports = router;
