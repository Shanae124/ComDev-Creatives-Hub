// SCORM 1.2/2004 and xAPI Service
const fs = require('fs').promises;
const path = require('path');
const AdmZip = require('adm-zip');
const xml2js = require('xml2js');
const { Pool } = require('pg');

class ScormService {
  constructor(pool) {
    this.pool = pool;
    this.parser = new xml2js.Parser();
  }

  /**
   * Import SCORM package
   * @param {string} zipPath - Path to uploaded SCORM zip
   * @param {number} courseId - Course ID to associate with
   * @param {number} userId - User uploading the package
   */
  async importScormPackage(zipPath, courseId, userId) {
    try {
      const packageId = `scorm_${Date.now()}`;
      const extractPath = path.join(__dirname, '../uploads/scorm', packageId);
      
      // Extract zip file
      await fs.mkdir(extractPath, { recursive: true });
      await fs.createReadStream(zipPath)
        .pipe(unzipper.Extract({ path: extractPath }))
        .promise();

      // Find and parse imsmanifest.xml
      const manifestPath = path.join(extractPath, 'imsmanifest.xml');
      const manifestXml = await fs.readFile(manifestPath, 'utf8');
      const manifest = await this.parser.parseStringPromise(manifestXml);

      // Determine SCORM version
      const scormVersion = this.detectScormVersion(manifest);
      
      // Extract metadata
      const metadata = this.extractMetadata(manifest, scormVersion);
      
      // Store in database
      const result = await this.pool.query(
        `INSERT INTO scorm_packages 
         (package_id, course_id, version, title, description, manifest_data, 
          launch_url, uploaded_by, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
         RETURNING id`,
        [
          packageId,
          courseId,
          scormVersion,
          metadata.title,
          metadata.description,
          JSON.stringify(manifest),
          metadata.launchUrl,
          userId
        ]
      );

      // Create SCORM activities from manifest
      await this.createActivitiesFromManifest(result.rows[0].id, manifest, scormVersion);

      return {
        id: result.rows[0].id,
        packageId,
        version: scormVersion,
        metadata,
        extractPath
      };
    } catch (error) {
      console.error('SCORM import error:', error);
      throw new Error(`Failed to import SCORM package: ${error.message}`);
    }
  }

  /**
   * Detect SCORM version from manifest
   */
  detectScormVersion(manifest) {
    const metadata = manifest?.manifest?.metadata?.[0];
    const schemaversion = metadata?.schemaversion?.[0] || '';
    
    if (schemaversion.includes('1.2')) return 'SCORM 1.2';
    if (schemaversion.includes('2004') || schemaversion.includes('1.3')) return 'SCORM 2004';
    
    // Check for CAM specification
    const specs = metadata?.schema?.[0] || '';
    if (specs.includes('ADL SCORM')) {
      if (specs.includes('1.2')) return 'SCORM 1.2';
      if (specs.includes('2004')) return 'SCORM 2004';
    }
    
    return 'SCORM 1.2'; // Default
  }

  /**
   * Extract metadata from manifest
   */
  extractMetadata(manifest, version) {
    const organizations = manifest?.manifest?.organizations?.[0];
    const organization = organizations?.organization?.[0];
    const resources = manifest?.manifest?.resources?.[0];
    const resource = resources?.resource?.[0];

    const title = organization?.title?.[0] || 'Untitled SCORM Package';
    const description = organization?.item?.[0]?.title?.[0] || '';
    const launchUrl = resource?.$?.href || 'index.html';

    return { title, description, launchUrl };
  }

  /**
   * Create activities from SCORM manifest
   */
  async createActivitiesFromManifest(packageId, manifest, version) {
    const organizations = manifest?.manifest?.organizations?.[0];
    const organization = organizations?.organization?.[0];
    const items = organization?.item || [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      await this.pool.query(
        `INSERT INTO scorm_activities 
         (package_id, identifier, title, launch_url, sort_order)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          packageId,
          item.$?.identifier || `item_${i}`,
          item.title?.[0] || `Activity ${i + 1}`,
          item.$?.identifierref || '',
          i
        ]
      );
    }
  }

  /**
   * Initialize SCORM session for learner
   */
  async initializeSession(packageId, userId, attemptNumber = 1) {
    const session = await this.pool.query(
      `INSERT INTO scorm_sessions 
       (package_id, user_id, attempt_number, session_time, started_at)
       VALUES ($1, $2, $3, '00:00:00', NOW())
       RETURNING id, started_at`,
      [packageId, userId, attemptNumber]
    );

    return {
      sessionId: session.rows[0].id,
      startedAt: session.rows[0].started_at,
      cmiData: this.getInitialCmiData()
    };
  }

  /**
   * Get initial CMI data structure
   */
  getInitialCmiData() {
    return {
      'cmi.core.lesson_status': 'not attempted',
      'cmi.core.score.raw': '',
      'cmi.core.score.min': '0',
      'cmi.core.score.max': '100',
      'cmi.core.session_time': '00:00:00',
      'cmi.core.lesson_location': '',
      'cmi.suspend_data': '',
      'cmi.launch_data': '',
      'cmi.learner_id': '',
      'cmi.learner_name': '',
      'cmi.core.exit': ''
    };
  }

  /**
   * Set SCORM data element (LMSSetValue)
   */
  async setScormValue(sessionId, element, value) {
    await this.pool.query(
      `INSERT INTO scorm_tracking (session_id, element, value, timestamp)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (session_id, element) 
       DO UPDATE SET value = $3, timestamp = NOW()`,
      [sessionId, element, value]
    );

    // Update session status if lesson_status changed
    if (element === 'cmi.core.lesson_status' || element === 'cmi.completion_status') {
      await this.updateSessionStatus(sessionId, value);
    }

    // Update score if score changed
    if (element === 'cmi.core.score.raw' || element === 'cmi.score.raw') {
      await this.updateSessionScore(sessionId, parseFloat(value));
    }

    return { success: true };
  }

  /**
   * Get SCORM data element (LMSGetValue)
   */
  async getScormValue(sessionId, element) {
    const result = await this.pool.query(
      `SELECT value FROM scorm_tracking 
       WHERE session_id = $1 AND element = $2
       ORDER BY timestamp DESC LIMIT 1`,
      [sessionId, element]
    );

    return result.rows[0]?.value || '';
  }

  /**
   * Update session status based on lesson_status
   */
  async updateSessionStatus(sessionId, status) {
    const statusMap = {
      'completed': 'completed',
      'passed': 'passed',
      'failed': 'failed',
      'incomplete': 'in_progress',
      'browsed': 'in_progress',
      'not attempted': 'not_started'
    };

    const mappedStatus = statusMap[status.toLowerCase()] || 'in_progress';

    await this.pool.query(
      `UPDATE scorm_sessions 
       SET status = $1, completed_at = CASE WHEN $1 IN ('completed', 'passed', 'failed') 
           THEN NOW() ELSE NULL END
       WHERE id = $2`,
      [mappedStatus, sessionId]
    );
  }

  /**
   * Update session score
   */
  async updateSessionScore(sessionId, score) {
    await this.pool.query(
      `UPDATE scorm_sessions SET score = $1 WHERE id = $2`,
      [score, sessionId]
    );
  }

  /**
   * Commit SCORM session (LMSCommit)
   */
  async commitSession(sessionId) {
    await this.pool.query(
      `UPDATE scorm_sessions SET last_commit = NOW() WHERE id = $1`,
      [sessionId]
    );
    return { success: true };
  }

  /**
   * Finish SCORM session (LMSFinish)
   */
  async finishSession(sessionId) {
    // Get final session time
    const sessionData = await this.pool.query(
      `SELECT session_time FROM scorm_sessions WHERE id = $1`,
      [sessionId]
    );

    // Mark as finished
    await this.pool.query(
      `UPDATE scorm_sessions 
       SET finished_at = NOW(), status = COALESCE(status, 'completed')
       WHERE id = $1`,
      [sessionId]
    );

    return { success: true, sessionTime: sessionData.rows[0]?.session_time };
  }

  /**
   * Get learner's SCORM progress
   */
  async getLearnerProgress(userId, packageId) {
    const result = await this.pool.query(
      `SELECT 
        s.id as session_id,
        s.attempt_number,
        s.status,
        s.score,
        s.session_time,
        s.started_at,
        s.completed_at,
        p.title as package_title
       FROM scorm_sessions s
       JOIN scorm_packages p ON s.package_id = p.id
       WHERE s.user_id = $1 AND s.package_id = $2
       ORDER BY s.attempt_number DESC
       LIMIT 1`,
      [userId, packageId]
    );

    return result.rows[0] || null;
  }
}

module.exports = ScormService;
