const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const pool = require('../config/db');
const { psruAxios, PSRU_ENDPOINTS, PSRU_API_TOKEN } = require('../config/psruApi');
const activityLogger = require('../services/activityLogger');

const authController = {
  register: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, name, faculty } = req.body;
      const role = 'user';

      const userExists = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      if (userExists.rows.length > 0) {
        return res.status(400).json({ error: 'User already exists' });
      }

      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      const newUser = await pool.query(
        'INSERT INTO users (email, password_hash, name, faculty, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, name, faculty, role, created_at',
        [email, passwordHash, name, faculty, role]
      );

      const token = jwt.sign(
        { 
          userId: newUser.rows[0].id, 
          email: newUser.rows[0].email,
          name: newUser.rows[0].name,
          role: newUser.rows[0].role 
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: newUser.rows[0]
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  login: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      const user = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      if (user.rows.length === 0) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);

      if (!validPassword) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { 
          userId: user.rows[0].id, 
          email: user.rows[0].email,
          name: user.rows[0].name,
          role: user.rows[0].role 
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.rows[0].id,
          email: user.rows[0].email,
          name: user.rows[0].name,
          role: user.rows[0].role,
          created_at: user.rows[0].created_at
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  psruStudentLogin: async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'กรุณากรอกรหัสนักศึกษาและรหัสผ่าน' });
      }

      const psruResponse = await psruAxios.post(PSRU_ENDPOINTS.AUTH, {
        username,
        password
      });

      const data = psruResponse.data;

      if (data.status !== '200' || !data.message || data.message.length === 0) {
        return res.status(401).json({ error: 'รหัสนักศึกษาหรือรหัสผ่านไม่ถูกต้อง' });
      }

      const userData = data.message[0];

      if (userData.PTTYPEID !== '3') {
        return res.status(403).json({ error: 'บัญชีนี้ไม่ใช่บัญชีนักศึกษา กรุณาใช้ระบบสำหรับอาจารย์' });
      }

      if (userData.EXPIREDATE) {
        const expireDateStr = userData.EXPIREDATE;
        const buddhistYear = parseInt(expireDateStr.substring(0, 4));
        const gregorianYear = buddhistYear - 543;
        const month = parseInt(expireDateStr.substring(4, 6)) - 1;
        const day = parseInt(expireDateStr.substring(6, 8));
        const expireDate = new Date(gregorianYear, month, day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (expireDate < today) {
          return res.status(403).json({ error: 'สถานะการเป็นสมาชิกหมดอายุ กรุณาติดต่อห้องสมุดเพื่อดำเนินการต่ออายุสมาชิก' });
        }
      }

      const token = jwt.sign(
        {
          userId: userData.USERID,
          memberId: userData.MEMBERID,
          barcode: userData.BARCODE,
          name: `${userData.FNAMETHAI} ${userData.LNAMETHAI}`,
          role: 'student',
          faculty: userData.FACULTYNAME,
          program: userData.PROGRAMNAME,
          memberType: userData.MEMBERTYPE
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      const userInfo = {
        id: userData.USERID,
        memberId: userData.MEMBERID,
        barcode: userData.BARCODE,
        name: `${userData.FNAMETHAI} ${userData.LNAMETHAI}`,
        firstName: userData.FNAMETHAI,
        lastName: userData.LNAMETHAI,
        role: 'student',
        faculty: userData.FACULTYNAME,
        program: userData.PROGRAMNAME,
        memberType: userData.MEMBERTYPE,
        profilePic: userData.PATHPIC
      };

      await activityLogger.logLogin(
        { 
          id: userData.USERID, 
          name: userInfo.name, 
          email: userData.BARCODE,
          faculty: userData.FACULTYNAME,
          program: userData.PROGRAMNAME
        },
        'student',
        req
      );

      res.json({
        message: 'เข้าสู่ระบบสำเร็จ',
        token,
        user: userInfo
      });
    } catch (error) {
      console.error('PSRU Student Login error:', error.response?.data || error.message);
      if (error.response?.status === 401 || error.response?.status === 400) {
        return res.status(401).json({ error: 'รหัสนักศึกษาหรือรหัสผ่านไม่ถูกต้อง' });
      }
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเชื่อมต่อระบบ' });
    }
  },

  psruProfessorLogin: async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'กรุณากรอกรหัสอาจารย์และรหัสผ่าน' });
      }

      const psruResponse = await psruAxios.post(PSRU_ENDPOINTS.AUTH, {
        username,
        password
      });

      const data = psruResponse.data;

      if (data.status !== '200' || !data.message || data.message.length === 0) {
        return res.status(401).json({ error: 'รหัสอาจารย์หรือรหัสผ่านไม่ถูกต้อง' });
      }

      const userData = data.message[0];

      if (userData.PTTYPEID !== '1') {
        return res.status(403).json({ error: 'บัญชีนี้ไม่ใช่บัญชีอาจารย์ กรุณาใช้ระบบสำหรับนักศึกษา' });
      }

      if (userData.EXPIREDATE) {
        const expireDateStr = userData.EXPIREDATE;
        const buddhistYear = parseInt(expireDateStr.substring(0, 4));
        const gregorianYear = buddhistYear - 543;
        const month = parseInt(expireDateStr.substring(4, 6)) - 1;
        const day = parseInt(expireDateStr.substring(6, 8));
        const expireDate = new Date(gregorianYear, month, day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (expireDate < today) {
          return res.status(403).json({ error: 'สถานะการเป็นสมาชิกหมดอายุ กรุณาติดต่อห้องสมุดเพื่อดำเนินการต่ออายุสมาชิก' });
        }
      }

      const token = jwt.sign(
        {
          userId: userData.USERID,
          memberId: userData.MEMBERID,
          barcode: userData.BARCODE,
          name: `${userData.FNAMETHAI} ${userData.LNAMETHAI}`,
          role: 'professor',
          faculty: userData.FACULTYNAME,
          program: userData.PROGRAMNAME,
          memberType: userData.MEMBERTYPE
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      const userInfo = {
        id: userData.USERID,
        memberId: userData.MEMBERID,
        barcode: userData.BARCODE,
        name: `${userData.FNAMETHAI} ${userData.LNAMETHAI}`,
        firstName: userData.FNAMETHAI,
        lastName: userData.LNAMETHAI,
        role: 'professor',
        faculty: userData.FACULTYNAME,
        program: userData.PROGRAMNAME,
        memberType: userData.MEMBERTYPE,
        profilePic: userData.PATHPIC
      };

      await activityLogger.logLogin(
        { 
          id: userData.USERID, 
          name: userInfo.name, 
          email: userData.BARCODE,
          faculty: userData.FACULTYNAME,
          program: userData.PROGRAMNAME
        },
        'professor',
        req
      );

      res.json({
        message: 'เข้าสู่ระบบสำเร็จ',
        token,
        user: userInfo
      });
    } catch (error) {
      console.error('PSRU Professor Login error:', error);
      if (error.response?.status === 401 || error.response?.status === 400) {
        return res.status(401).json({ error: 'รหัสอาจารย์หรือรหัสผ่านไม่ถูกต้อง' });
      }
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเชื่อมต่อระบบ' });
    }
  },

  getCurrentUser: async (req, res) => {
    try {
      res.json({
        id: req.user.userId,
        barcode: req.user.barcode,
        name: req.user.name,
        role: req.user.role,
        faculty: req.user.faculty,
        program: req.user.program,
        memberType: req.user.memberType
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
};

module.exports = authController;
