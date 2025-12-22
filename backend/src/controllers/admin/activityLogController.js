const pool = require('../../config/db');

const activityLogController = {
  // Get activity logs with pagination and filters
  getLogs: async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 50, 
        userType, 
        action, 
        resourceType,
        userId,
        startDate,
        endDate,
        search
      } = req.query;

      const offset = (page - 1) * limit;
      let query = `SELECT * FROM activity_logs WHERE 1=1`;
      let countQuery = `SELECT COUNT(*) FROM activity_logs WHERE 1=1`;
      const params = [];
      let paramIndex = 1;

      if (userType) {
        query += ` AND user_type = $${paramIndex}`;
        countQuery += ` AND user_type = $${paramIndex}`;
        params.push(userType);
        paramIndex++;
      }

      if (action) {
        query += ` AND action = $${paramIndex}`;
        countQuery += ` AND action = $${paramIndex}`;
        params.push(action);
        paramIndex++;
      }

      if (resourceType) {
        query += ` AND resource_type = $${paramIndex}`;
        countQuery += ` AND resource_type = $${paramIndex}`;
        params.push(resourceType);
        paramIndex++;
      }

      if (userId) {
        query += ` AND user_id = $${paramIndex}`;
        countQuery += ` AND user_id = $${paramIndex}`;
        params.push(userId);
        paramIndex++;
      }

      if (startDate) {
        query += ` AND created_at >= $${paramIndex}`;
        countQuery += ` AND created_at >= $${paramIndex}`;
        params.push(startDate);
        paramIndex++;
      }

      if (endDate) {
        query += ` AND created_at <= $${paramIndex}`;
        countQuery += ` AND created_at <= $${paramIndex}`;
        params.push(endDate + ' 23:59:59');
        paramIndex++;
      }

      if (search) {
        query += ` AND (user_name ILIKE $${paramIndex} OR user_email ILIKE $${paramIndex} OR resource_name ILIKE $${paramIndex})`;
        countQuery += ` AND (user_name ILIKE $${paramIndex} OR user_email ILIKE $${paramIndex} OR resource_name ILIKE $${paramIndex})`;
        params.push(`%${search}%`);
        paramIndex++;
      }

      // Get total count
      const countResult = await pool.query(countQuery, params);
      const total = parseInt(countResult.rows[0].count);

      // Get logs with pagination
      query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);

      const result = await pool.query(query, params);

      res.json({
        logs: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get activity logs error:', error);
      res.status(500).json({ error: 'Failed to fetch activity logs' });
    }
  },

  // Get activity statistics
  getStats: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      let dateFilter = '';
      const params = [];
      
      if (startDate && endDate) {
        dateFilter = ' WHERE created_at >= $1 AND created_at <= $2';
        params.push(startDate, endDate + ' 23:59:59');
      } else {
        // Default: last 30 days
        dateFilter = " WHERE created_at >= NOW() - INTERVAL '30 days'";
      }

      // Total logs
      const totalResult = await pool.query(
        `SELECT COUNT(*) as total FROM activity_logs${dateFilter}`,
        params
      );

      // Logs by user type
      const byUserTypeResult = await pool.query(
        `SELECT user_type, COUNT(*) as count FROM activity_logs${dateFilter} GROUP BY user_type ORDER BY count DESC`,
        params
      );

      // Logs by action
      const byActionResult = await pool.query(
        `SELECT action, COUNT(*) as count FROM activity_logs${dateFilter} GROUP BY action ORDER BY count DESC`,
        params
      );

      // Logs by resource type
      const byResourceResult = await pool.query(
        `SELECT resource_type, COUNT(*) as count FROM activity_logs${dateFilter} GROUP BY resource_type ORDER BY count DESC`,
        params
      );

      // Logs by day (for chart)
      const byDayResult = await pool.query(
        `SELECT DATE(created_at) as date, COUNT(*) as count 
         FROM activity_logs${dateFilter} 
         GROUP BY DATE(created_at) 
         ORDER BY date DESC 
         LIMIT 30`,
        params
      );

      // Top active users
      const topUsersResult = await pool.query(
        `SELECT user_id, user_name, user_email, user_type, COUNT(*) as activity_count 
         FROM activity_logs${dateFilter} 
         GROUP BY user_id, user_name, user_email, user_type 
         ORDER BY activity_count DESC 
         LIMIT 10`,
        params
      );

      // Login count by user type
      const loginsByTypeResult = await pool.query(
        `SELECT user_type, COUNT(*) as count 
         FROM activity_logs${dateFilter} AND action = 'login'
         GROUP BY user_type`,
        params.length > 0 ? params : []
      );

      // All time summary
      const allTimeResult = await pool.query(
        `SELECT COUNT(*) as total,
                COUNT(CASE WHEN action = 'login' THEN 1 END) as logins,
                COUNT(CASE WHEN action = 'create' THEN 1 END) as creates,
                COUNT(CASE WHEN action = 'delete' THEN 1 END) as deletes,
                COUNT(DISTINCT user_id) as unique_users
         FROM activity_logs`
      );

      res.json({
        total: parseInt(totalResult.rows[0].total),
        byUserType: byUserTypeResult.rows,
        byAction: byActionResult.rows,
        byResourceType: byResourceResult.rows,
        byDay: byDayResult.rows,
        topUsers: topUsersResult.rows,
        loginsByType: loginsByTypeResult.rows,
        allTime: allTimeResult.rows[0]
      });
    } catch (error) {
      console.error('Get activity stats error:', error);
      res.status(500).json({ error: 'Failed to fetch activity statistics' });
    }
  },

  // Get unique values for filters
  getFilterOptions: async (req, res) => {
    try {
      const userTypes = await pool.query('SELECT DISTINCT user_type FROM activity_logs WHERE user_type IS NOT NULL ORDER BY user_type');
      const actions = await pool.query('SELECT DISTINCT action FROM activity_logs WHERE action IS NOT NULL ORDER BY action');
      const resourceTypes = await pool.query('SELECT DISTINCT resource_type FROM activity_logs WHERE resource_type IS NOT NULL ORDER BY resource_type');

      res.json({
        userTypes: userTypes.rows.map(r => r.user_type),
        actions: actions.rows.map(r => r.action),
        resourceTypes: resourceTypes.rows.map(r => r.resource_type)
      });
    } catch (error) {
      console.error('Get filter options error:', error);
      res.status(500).json({ error: 'Failed to fetch filter options' });
    }
  },

  // Export logs
  exportLogs: async (req, res) => {
    try {
      const { startDate, endDate, userType, action } = req.query;
      
      let query = `SELECT 
        id,
        user_name as "ชื่อผู้ใช้",
        user_email as "อีเมล",
        user_type as "ประเภทผู้ใช้",
        action as "การกระทำ",
        resource_type as "ประเภททรัพยากร",
        resource_name as "ชื่อทรัพยากร",
        ip_address as "IP Address",
        TO_CHAR(created_at, 'DD/MM/YYYY HH24:MI:SS') as "วันเวลา"
      FROM activity_logs WHERE 1=1`;
      
      const params = [];
      let paramIndex = 1;

      if (startDate) {
        query += ` AND created_at >= $${paramIndex}`;
        params.push(startDate);
        paramIndex++;
      }

      if (endDate) {
        query += ` AND created_at <= $${paramIndex}`;
        params.push(endDate + ' 23:59:59');
        paramIndex++;
      }

      if (userType) {
        query += ` AND user_type = $${paramIndex}`;
        params.push(userType);
        paramIndex++;
      }

      if (action) {
        query += ` AND action = $${paramIndex}`;
        params.push(action);
        paramIndex++;
      }

      query += ' ORDER BY created_at DESC LIMIT 10000';

      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (error) {
      console.error('Export logs error:', error);
      res.status(500).json({ error: 'Failed to export logs' });
    }
  },

  // Get student usage report by faculty and program
  getStudentReport: async (req, res) => {
    try {
      // Logins by faculty
      const byFacultyResult = await pool.query(`
        SELECT faculty, COUNT(*) as login_count, COUNT(DISTINCT user_id) as unique_users
        FROM activity_logs 
        WHERE user_type = 'student' AND action = 'login' AND faculty IS NOT NULL
        GROUP BY faculty 
        ORDER BY login_count DESC
      `);

      // Logins by program
      const byProgramResult = await pool.query(`
        SELECT faculty, program, COUNT(*) as login_count, COUNT(DISTINCT user_id) as unique_users
        FROM activity_logs 
        WHERE user_type = 'student' AND action = 'login' AND program IS NOT NULL
        GROUP BY faculty, program 
        ORDER BY login_count DESC
      `);

      // Daily logins for students
      const dailyLoginsResult = await pool.query(`
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM activity_logs 
        WHERE user_type = 'student' AND action = 'login'
        GROUP BY DATE(created_at) 
        ORDER BY date DESC 
        LIMIT 30
      `);

      // Top active students
      const topStudentsResult = await pool.query(`
        SELECT user_id, user_name, user_email, faculty, program, COUNT(*) as activity_count
        FROM activity_logs 
        WHERE user_type = 'student'
        GROUP BY user_id, user_name, user_email, faculty, program
        ORDER BY activity_count DESC 
        LIMIT 20
      `);

      // Total stats
      const totalResult = await pool.query(`
        SELECT 
          COUNT(*) as total_activities,
          COUNT(CASE WHEN action = 'login' THEN 1 END) as total_logins,
          COUNT(DISTINCT user_id) as unique_students,
          COUNT(DISTINCT faculty) as faculties_count
        FROM activity_logs 
        WHERE user_type = 'student'
      `);

      res.json({
        byFaculty: byFacultyResult.rows,
        byProgram: byProgramResult.rows,
        dailyLogins: dailyLoginsResult.rows,
        topStudents: topStudentsResult.rows,
        totals: totalResult.rows[0]
      });
    } catch (error) {
      console.error('Get student report error:', error);
      res.status(500).json({ error: 'Failed to fetch student report' });
    }
  },

  // Get professor usage report
  getProfessorReport: async (req, res) => {
    try {
      // Logins by faculty
      const byFacultyResult = await pool.query(`
        SELECT faculty, COUNT(*) as login_count, COUNT(DISTINCT user_id) as unique_users
        FROM activity_logs 
        WHERE user_type = 'professor' AND action = 'login' AND faculty IS NOT NULL
        GROUP BY faculty 
        ORDER BY login_count DESC
      `);

      // Activity by type
      const byActionResult = await pool.query(`
        SELECT action, resource_type, COUNT(*) as count
        FROM activity_logs 
        WHERE user_type = 'professor'
        GROUP BY action, resource_type
        ORDER BY count DESC
      `);

      // Daily activities
      const dailyActivityResult = await pool.query(`
        SELECT DATE(created_at) as date, 
               COUNT(*) as total,
               COUNT(CASE WHEN action = 'login' THEN 1 END) as logins,
               COUNT(CASE WHEN action = 'create' THEN 1 END) as creates
        FROM activity_logs 
        WHERE user_type = 'professor'
        GROUP BY DATE(created_at) 
        ORDER BY date DESC 
        LIMIT 30
      `);

      // Top active professors
      const topProfessorsResult = await pool.query(`
        SELECT user_id, user_name, user_email, faculty, 
               COUNT(*) as activity_count,
               COUNT(CASE WHEN action = 'create' AND resource_type = 'course' THEN 1 END) as courses_created,
               COUNT(CASE WHEN action = 'create' AND resource_type = 'book' THEN 1 END) as books_added
        FROM activity_logs 
        WHERE user_type = 'professor'
        GROUP BY user_id, user_name, user_email, faculty
        ORDER BY activity_count DESC 
        LIMIT 20
      `);

      // Total stats
      const totalResult = await pool.query(`
        SELECT 
          COUNT(*) as total_activities,
          COUNT(CASE WHEN action = 'login' THEN 1 END) as total_logins,
          COUNT(CASE WHEN action = 'create' THEN 1 END) as total_creates,
          COUNT(DISTINCT user_id) as unique_professors
        FROM activity_logs 
        WHERE user_type = 'professor'
      `);

      res.json({
        byFaculty: byFacultyResult.rows,
        byAction: byActionResult.rows,
        dailyActivity: dailyActivityResult.rows,
        topProfessors: topProfessorsResult.rows,
        totals: totalResult.rows[0]
      });
    } catch (error) {
      console.error('Get professor report error:', error);
      res.status(500).json({ error: 'Failed to fetch professor report' });
    }
  }
};

module.exports = activityLogController;
