const pool = require('../config/db');

/**
 * Activity Logger Service
 * Logs user activities for audit and analytics
 */
const activityLogger = {
  /**
   * Log an activity
   * @param {Object} params
   * @param {number} params.userId - User ID
   * @param {string} params.userType - 'student', 'professor', 'admin'
   * @param {string} params.userName - User's name
   * @param {string} params.userEmail - User's email
   * @param {string} params.faculty - User's faculty (for students/professors)
   * @param {string} params.program - User's program (for students)
   * @param {string} params.action - Action type: 'login', 'logout', 'create', 'update', 'delete', 'view', 'download'
   * @param {string} params.resourceType - Resource type: 'course', 'book', 'file', 'user', etc.
   * @param {number} params.resourceId - Resource ID
   * @param {string} params.resourceName - Resource name/title
   * @param {Object} params.details - Additional details (JSON)
   * @param {Object} req - Express request object (for IP and user agent)
   */
  async log({ userId, userType, userName, userEmail, faculty, program, action, resourceType, resourceId, resourceName, details }, req = null) {
    try {
      const ipAddress = req ? (req.headers['x-forwarded-for'] || req.connection?.remoteAddress || req.ip) : null;
      const userAgent = req ? req.headers['user-agent'] : null;

      await pool.query(
        `INSERT INTO activity_logs 
         (user_id, user_type, user_name, user_email, faculty, program, action, resource_type, resource_id, resource_name, details, ip_address, user_agent)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [userId, userType, userName, userEmail, faculty || null, program || null, action, resourceType, resourceId, resourceName, JSON.stringify(details || {}), ipAddress, userAgent]
      );
    } catch (error) {
      // Don't throw error to prevent disrupting main flow
      console.error('Activity logging error:', error);
    }
  },

  // Convenience methods for common actions
  async logLogin(user, userType, req) {
    await this.log({
      userId: user.id,
      userType,
      userName: user.name,
      userEmail: user.email,
      faculty: user.faculty,
      program: user.program,
      action: 'login',
      resourceType: 'auth',
      details: { method: 'password' }
    }, req);
  },

  async logLogout(user, userType, req) {
    await this.log({
      userId: user.id,
      userType,
      userName: user.name,
      userEmail: user.email,
      action: 'logout',
      resourceType: 'auth'
    }, req);
  },

  async logCreate(user, userType, resourceType, resourceId, resourceName, details, req) {
    await this.log({
      userId: user.id,
      userType,
      userName: user.name,
      userEmail: user.email,
      action: 'create',
      resourceType,
      resourceId,
      resourceName,
      details
    }, req);
  },

  async logUpdate(user, userType, resourceType, resourceId, resourceName, details, req) {
    await this.log({
      userId: user.id,
      userType,
      userName: user.name,
      userEmail: user.email,
      action: 'update',
      resourceType,
      resourceId,
      resourceName,
      details
    }, req);
  },

  async logDelete(user, userType, resourceType, resourceId, resourceName, details, req) {
    await this.log({
      userId: user.id,
      userType,
      userName: user.name,
      userEmail: user.email,
      action: 'delete',
      resourceType,
      resourceId,
      resourceName,
      details
    }, req);
  },

  async logView(user, userType, resourceType, resourceId, resourceName, req) {
    await this.log({
      userId: user.id,
      userType,
      userName: user.name,
      userEmail: user.email,
      action: 'view',
      resourceType,
      resourceId,
      resourceName
    }, req);
  },

  async logDownload(user, userType, resourceType, resourceId, resourceName, req) {
    await this.log({
      userId: user.id,
      userType,
      userName: user.name,
      userEmail: user.email,
      action: 'download',
      resourceType,
      resourceId,
      resourceName
    }, req);
  }
};

module.exports = activityLogger;
