const express = require('express');
const router = express.Router();
const leadController = require('./controller');

// View all leads
router.get('/viewleads', leadController.viewLeads);

// View single lead
router.get('/viewleads/:id', leadController.viewSingleLead);

// Add new lead
router.post('/addlead', leadController.addLead);

// Edit lead
router.put('/editlead/:id', leadController.editLead);

// Delete lead
router.delete('/deletelead/:id', leadController.deleteLead);

module.exports = router; 