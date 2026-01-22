const express = require('express');
const pool = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Configure multer for file uploads
const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// Create lesson
router.post('/', async (req, res) => {
  try {
    const { moduleId, title, content, lessonType = 'content', orderIndex = 0 } = req.body;

    if (!moduleId || !title) {
      return res.status(400).json({ error: 'Module ID and title required' });
    }

    const result = await pool.query(
      'INSERT INTO lessons (module_id, title, content, lesson_type, order_index) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [moduleId, title, content || '', lessonType, orderIndex]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get lesson with attachments
router.get('/:id', async (req, res) => {
  try {
    const lessonResult = await pool.query('SELECT * FROM lessons WHERE id = $1', [req.params.id]);
    
    if (lessonResult.rows.length === 0) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    const attachmentsResult = await pool.query(
      'SELECT * FROM lesson_attachments WHERE lesson_id = $1',
      [req.params.id]
    );

    const lesson = lessonResult.rows[0];
    lesson.attachments = attachmentsResult.rows;

    res.json(lesson);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update lesson
router.put('/:id', async (req, res) => {
  try {
    const { title, content, lessonType, orderIndex } = req.body;

    const result = await pool.query(
      `UPDATE lessons 
       SET title = COALESCE($1, title), 
           content = COALESCE($2, content), 
           lesson_type = COALESCE($3, lesson_type),
           order_index = COALESCE($4, order_index),
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $5 
       RETURNING *`,
      [title, content, lessonType, orderIndex, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload file to lesson
router.post('/:id/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const result = await pool.query(
      `INSERT INTO lesson_attachments (lesson_id, file_name, file_path, file_type, file_size) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [req.params.id, req.file.originalname, req.file.filename, req.file.mimetype, req.file.size]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete lesson
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM lessons WHERE id = $1', [req.params.id]);
    res.json({ message: 'Lesson deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
