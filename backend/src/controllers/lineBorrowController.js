const { psruAxios, PSRU_ENDPOINTS } = require('../config/psruApi');

const lineBorrowController = {
  lineBorrow: async (req, res) => {
    try {
      const { StudentID, BibID, Title, Author, CallNo, Pubyear, isbn } = req.body;

      if (!StudentID || !BibID || !Title) {
        return res.status(400).json({ error: 'กรุณาระบุข้อมูลให้ครบถ้วน (StudentID, BibID, Title)' });
      }

      const response = await psruAxios.post(PSRU_ENDPOINTS.LINE_BORROW, {
        StudentID,
        BibID,
        Title,
        Author: Author || '',
        CallNo: CallNo || '',
        Pubyear: Pubyear || '',
        isbn: isbn || ''
      });

      if (response.data?.status === '200') {
        res.json({ 
          success: true, 
          message: response.data.message || 'ทำรายการยืมผ่านไลน์สำเร็จ' 
        });
      } else {
        res.status(400).json({ 
          success: false, 
          error: response.data?.message || 'ไม่สามารถทำรายการยืมได้' 
        });
      }
    } catch (error) {
      console.error('Line borrow error:', error.message);
      res.status(500).json({ error: 'ไม่สามารถเชื่อมต่อระบบยืมผ่านไลน์ได้' });
    }
  },

  getLineBorrowStatus: async (req, res) => {
    try {
      const { studentId } = req.params;

      if (!studentId) {
        return res.status(400).json({ error: 'กรุณาระบุรหัสนักศึกษา' });
      }

      const response = await psruAxios.get(`${PSRU_ENDPOINTS.GET_LINE_BORROW}/${studentId}`);

      if (response.data?.status === '200') {
        res.json({ 
          success: true, 
          data: response.data.message 
        });
      } else {
        res.status(400).json({ 
          success: false, 
          error: response.data?.message || 'ไม่พบข้อมูลการยืม' 
        });
      }
    } catch (error) {
      console.error('Get line borrow status error:', error.message);
      res.status(500).json({ error: 'ไม่สามารถเชื่อมต่อระบบได้' });
    }
  }
};

module.exports = lineBorrowController;
