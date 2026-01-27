// SCORM API Routes
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const SCORMService = require('../services/scorm');
const { authenticate } = require('../middleware/auth');

// Configure multer for SCORM package uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/scorm/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'scorm-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/zip' || file.originalname.endsWith('.zip')) {
      cb(null, true);
    } else {
      cb(new Error('Only ZIP files are allowed'));
    }
  },
  limits: { fileSize: 500 * 1024 * 1024 } // 500MB limit
});

module.exports = (pool) => {
  const scormService = new SCORMService(pool);

  /**
   * Upload SCORM package
   * POST /api/scorm/upload
   */
  router.post('/upload', authenticate, upload.single('package'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const { courseId } = req.body;
      if (!courseId) {
        return res.status(400).json({ error: 'courseId is required' });
      }

      const scormPackage = await scormService.uploadPackage(
        req.file.path,
        courseId,
        req.user.id
      );

      res.status(201).json({
        success: true,
        package: scormPackage
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Get SCORM package details
   * GET /api/scorm/packages/:id
   */
  router.get('/packages/:id', authenticate, async (req, res) => {
    try {
      const metadata = await scormService.getPackageMetadata(req.params.id);
      res.json(metadata);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Get launch URL for SCO
   * GET /api/scorm/packages/:packageId/launch/:scoId
   */
  router.get('/packages/:packageId/launch/:scoId', authenticate, async (req, res) => {
    try {
      const launchUrl = await scormService.getLaunchUrl(
        req.params.packageId,
        req.params.scoId
      );

      res.json({ launchUrl });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Track SCORM progress
   * POST /api/scorm/packages/:packageId/track
   */
  router.post('/packages/:packageId/track', authenticate, async (req, res) => {
    try {
      const { scoId, progressData } = req.body;

      await scormService.trackProgress(
        req.params.packageId,
        req.user.id,
        scoId,
        progressData
      );

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Get learner's SCORM progress
   * GET /api/scorm/packages/:packageId/progress
   */
  router.get('/packages/:packageId/progress', authenticate, async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT sd.*, ss.title, ss.identifier
         FROM scorm_data sd
         JOIN scorm_scos ss ON sd.sco_id = ss.id
         WHERE sd.package_id = $1 AND sd.user_id = $2
         ORDER BY ss.sort_order`,
        [req.params.packageId, req.user.id]
      );

      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Get all SCOs for package
   * GET /api/scorm/packages/:packageId/scos
   */
  router.get('/packages/:packageId/scos', authenticate, async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT * FROM scorm_scos WHERE package_id = $1 ORDER BY sort_order',
        [req.params.packageId]
      );

      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Delete SCORM package
   * DELETE /api/scorm/packages/:id
   */
  router.delete('/packages/:id', authenticate, async (req, res) => {
    try {
      await pool.query('DELETE FROM scorm_packages WHERE id = $1', [req.params.id]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
