const express = require('express');
const router = express.Router();
const {createStudent, updateStudent, getAllStudents, getStudentById, deleteStudent, getStudentByEmail, getStudentByPhone} = require("../controllers/studentEnrollment.controller")

router.post('/', createStudent);
router.get('/', getAllStudents);
router.get('/:id', getStudentById);
router.get('/by-email/:email', getStudentByEmail);
router.get('/by-phone/:phone', getStudentByPhone);
router.put('/:id', updateStudent);
router.delete('/:id', deleteStudent);

module.exports = router; 