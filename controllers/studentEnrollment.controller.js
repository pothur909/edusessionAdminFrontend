const Student = require('../models/studentEnrollment.model');

// Get student by email
exports.getStudentByEmail = async (req, res) => {
  try {
    const student = await Student.findOne({ email: req.params.email });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error finding student',
      error: error.message
    });
  }
};

// Get student by phone
exports.getStudentByPhone = async (req, res) => {
  try {
    const student = await Student.findOne({ phoneNumber: req.params.phone });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error finding student',
      error: error.message
    });
  }
}; 