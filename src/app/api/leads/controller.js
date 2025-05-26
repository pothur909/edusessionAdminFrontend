// const Lead = require('../models/lead.model');

// exports.viewSingleLead = async (req, res) => {
//     try {
//         const lead = await Lead.findById(req.params.id);
//         if (!lead) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Lead not found'
//             });
//         }
//         res.status(200).json({
//             success: true,
//             lead: lead
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// }; 