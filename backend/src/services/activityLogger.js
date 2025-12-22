const pool = require('../config/db');

const activityLogger = {
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
      console.error('Activity logging error:', error);
    }
  },

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
