// 'use client';

// import { useState } from 'react';

// interface Lead {
//   _id: string;
//   studentName: string;
//   studentPhone: string;
//   parentPhone: string;
//   email: string;
//   board: string;
//   class: string;
//   subjects: string[];
//   status: 'new' | 'contacted' | 'converted' | 'not_interested' | 'demo_scheduled' | 'demo_completed' | 'demo_cancelled' | 'demo_no_show' | 'demo_rescheduled' | 'demo_rescheduled_cancelled' | 'demo_rescheduled_completed' | 'demo_rescheduled_no_show' | 'no_response_from_Lead';
//   notes: string;
//   createdAt: string;
//   updatedAt: string;
//   leadSource: string;
//   classesPerWeek: number;
//   courseInterested: string;
//   modeOfContact: string;
//   preferredTimeSlots: string;
//   counsellor: string;
//   sessionEndDate: string;
//   remarks: string;
// }

// interface EditLeadFormProps {
//   lead: Lead;
//   onComplete: () => void;
// }

// const BOARDS = ['CBSE', 'ICSE', 'State', 'IB', 'IGCSE', 'British'];
// const LEAD_SOURCES = ['website', 'referral', 'social_media', 'other'];
// const MODES_OF_CONTACT = ['phone', 'whatsapp', 'email'];
// const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Computer Science'];
// const STATUSES = [
//   'new', 'contacted', 'converted', 'not_interested',
//   'demo_scheduled', 'demo_completed', 'demo_cancelled', 'demo_no_show',
//   'demo_rescheduled', 'demo_rescheduled_cancelled',
//   'demo_rescheduled_completed', 'demo_rescheduled_no_show',
//   'no_response_from_Lead'
// ];

// export default function EditLeadForm({ lead, onComplete }: EditLeadFormProps) {
//   const [loading, setLoading] = useState(false);
//   const [formData, setFormData] = useState(lead);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   //  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
//   //   const { name, value } = e.target;
    
//   //   if (name === 'subjects') {
//   //     // Convert comma-separated string back to array
//   //     const subjectsArray = value.split(',').map(subject => subject.trim()).filter(subject => subject.length > 0);
//   //     setFormData(prev => ({
//   //       ...prev,
//   //       subjects: subjectsArray
//   //     }));
//   //   } else {
//   //     setFormData(prev => ({
//   //       ...prev,
//   //       [name]: value
//   //     }));
//   //   }
//   // };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const response = await fetch(`http://localhost:6969/api/leads/editlead/${lead._id}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(formData),
//       });

//       const data = await response.json();
//       if (data.success) {
//         onComplete();  // Call the onComplete callback to close the form
//       }
//     } catch (error) {
//       console.error('Error:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md space-y-6 text-black">
//       {/* Status */}
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
//         <select
//           name="status"
//           value={formData.status}
//           onChange={handleChange}
//           className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//           required
//         >
//           {STATUSES.map((status) => (
//             <option key={status} value={status}>
//               {status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* Student Name */}
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-2">Student Name</label>
//         <input
//           type="text"
//           name="studentName"
//           value={formData.studentName}
//           onChange={handleChange}
//           className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//           required
//         />
//       </div>

//       {/* Student Phone */}
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-2">Student Phone</label>
//         <input
//           type="tel"
//           name="studentPhone"
//           value={formData.studentPhone}
//           onChange={handleChange}
//           className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//           required
//         />
//       </div>

//       {/* Parent Phone */}
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-2">Parent Phone</label>
//         <input
//           type="tel"
//           name="parentPhone"
//           value={formData.parentPhone}
//           onChange={handleChange}
//           className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//           required
//         />
//       </div>

//        {/* email */}
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
//         <input
//           type="email"
//           name="email"
//           value={formData.email}
//           onChange={handleChange}
//           className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//           required
//         />
//       </div>

//       {/* Board */}
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-2">Board</label>
//         <select
//           name="board"
//           value={formData.board}
//           onChange={handleChange}
//           className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//           required
//         >
//           <option value="">Select Board</option>
//           {BOARDS.map((board) => (
//             <option key={board} value={board}>{board}</option>
//           ))}
//         </select>
//       </div>

//       {/* Class */}
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
//         <input
//           type="text"
//           name="class"
//           value={formData.class}
//           onChange={handleChange}
//           className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//           required
//         />
//       </div>

//       {/* Subjects */}
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-2">Subjects (comma separated)</label>
//         <input
//           type="text"
//           name="subjects"
//           value={formData.subjects.join(', ')}
//           onChange={handleChange}
//           className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//           required
//         />
//       </div>
  
//   {/* Lead Source */}
//        <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Lead Source</label>
//             <select
//               name="leadSource"
//               value={formData.leadSource}
//               onChange={handleChange}
//               className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               required
//             >
//               <option value="">Select Lead Source</option>
//               <option value="website">Website</option>
//               <option value="referral">Referral</option>
//               <option value="social_media">Social Media</option>
//               <option value="other">Other</option>
//             </select>
//           </div>


// {/* Classes per Week */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Classes per Week</label>
//             <input
//               type="number"
//               name="classesPerWeek"
//               value={formData.classesPerWeek}
//               onChange={handleChange}
//               min={1}
//               max={7}
//               className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               required
//             />
          
//           </div>
        
//          {/* Course Interested */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Course Interested</label>
//             <input
//               type="text"
//               name="courseInterested"
//               value={formData.courseInterested}
//               onChange={handleChange}
//               className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               required
//             />
          
//           </div>
   
           
//           {/* Counsellor */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Counsellor</label>
//             <input
//               type="text"
//               name="counsellor"
//               value={formData.counsellor}
//               onChange={handleChange}
//               className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               required
//             />
//           </div>

//           {/* Session End Date */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Session End Date</label>
//             <input
//               type="date"
//               name="sessionEndDate"
//               value={formData.sessionEndDate}
//               onChange={handleChange}
//               className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//             />
            
//           </div>
      
          
//           {/* Prefered Date */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Prefered Time</label>
//             <input
//               type="time"
//               name="preferredTimeSlots"
//               value={formData.preferredTimeSlots}
//               onChange={handleChange}
//               className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//             />
            
//           </div>



//       {/* Remarks */}
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
//         <textarea
//           name="remarks"
//           value={formData.remarks}
//           onChange={handleChange}
//           className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//           rows={3}
//         />
//       </div>

//       {/* Notes */}
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
//         <textarea
//           name="notes"
//           value={formData.notes}
//           onChange={handleChange}
//           className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//           rows={3}
//         />
//       </div>

//       <div className="flex space-x-4">
//         <button
//           type="submit"
//           className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition duration-200"
//           disabled={loading}
//         >
//           {loading ? 'Updating...' : 'Update Lead'}
//         </button>
//         <button
//           type="button"
//           onClick={onComplete}
//           className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-md hover:bg-gray-300 transition duration-200"
//         >
//           Cancel
//         </button>
//       </div>
//     </form>
//   );
// } 




// 'use client';

// import { useState } from 'react';

// Board data types and data
// type BoardData = {
//   [board: string]: {
//     [className: string]: string[];
//   };
// };

// const boardData: BoardData = {
//   CBSE: {
//     "Class 7": ["Maths", "Science", "English", "Social Science – History","Social Science – Geography","Social Science – Civics","Hindi","Computer Science / AI "],
//     "Class 8": ["Maths", "Science", "English", "Social Science – History","Social Science – Geography","Social Science – Civics","Hindi","Computer Science / AI "],
//     "Class 9": ["Maths", "Physics", "Chemistry", "Biology", "English", "Social Science – History","Social Science – Geography","Social Science – Civics","Hindi", "Economics", "Information Technology / AI"],
//     "Class 10":["Maths", "Physics", "Chemistry", "Biology", "English", "Social Science – History","Social Science – Geography","Social Science – Civics","Hindi", "Economics", "Information Technology / AI"],
//     "Class 11": ["Maths", "Physics", "Chemistry", "English", "Biology"],
//     "Class 12": ["Maths", "Physics", "Chemistry", "English", "Biology"],
//   },
//   ICSE: {
//     "Class 7": ["Maths", "Science", "English",  "Hindi", "Social Science – History","Social Science – Geography","Social Science – Civics","Computer Applications"],
//     "Class 8": ["Maths", "Science", "English", "Hindi", "Social Science – History","Social Science – Geography","Social Science – Civics","Computer Applications"],
//     "Class 9": ["Maths", "Physics", "Chemistry", "Biology", "English", "Social Science – History","Social Science – Geography","Social Science – Civics","Hindi", "Economics", "Information Technology / AI"],
//     "Class 10": ["Maths", "Physics", "Chemistry", "Biology", "English"],
//     "Class 11": ["Maths", "Physics", "Chemistry", "Biology", "English"],
//     "Class 12": ["Maths", "Physics", "Chemistry", "Biology", "English"],
//   },
//   State: {
//     "Class 7": ["Maths", "Science", "English", "Hindi", "Social Science – History","Social Science – Geography","Social Science – Civics","Computer Science", "Economics"],
//     "Class 8": ["Maths", "Science", "English", "Hindi", "Social Science – History","Social Science – Geography","Social Science – Civics","Computer Science", "Economics"],
//     "Class 9": ["Maths", "Physics", "Chemistry", "Biology", "English", "Hindi", "Social Science – History","Social Science – Geography","Social Science – Civics","Computer Science", "Economics"],
//     "Class 10": ["Maths", "Physics", "Chemistry", "Biology", "English", "Hindi", "Social Science – History","Social Science – Geography","Social Science – Civics","Computer Science", "Economics"],
//     "Class 11": ["Maths", "Physics", "Chemistry", "Biology", "English", "Sanskrit"],
//     "Class 12": ["Maths", "Physics", "Chemistry", "Biology", "English", "HHH"],
//   },
//   IB :{
//     "Class 7":["English","Hindi", "Integrated Sciences", "Maths", "Individuals & Societies - History", "Individuals & Societies - Geography", "Individuals & Societies - Civics"] ,
//     "Class 8": ["English","Hindi", "Integrated Sciences", "Maths", "Individuals & Societies - History", "Individuals & Societies - Geography", "Individuals & Societies - Civics", "Science"],
//     "Class 9": ["English","Hindi", "Integrated Sciences", "Maths", "Individuals & Societies - History", "Individuals & Societies - Geography", "Individuals & Societies - Civics", "Physics", "Chemistry", "Biology"],
//     "Class 10": ["English","Hindi", "Integrated Sciences", "Maths", "Individuals & Societies - History", "Individuals & Societies - Geography", "Individuals & Societies - Civics", "Physics", "Chemistry", "Biology","Preparation for IGCSE "],
//   },
//   IGCSE :{
//     "Class 7": ["English","Hindi", "Maths", "ICT (Information and Communication Technology)", "Science - Integrated : Physics,Chemistry, Biology "],
//     "Class 8": ["English","Hindi", "Maths", "ICT (Information and Communication Technology)", "Physics", "Chemistry" , "Biology" ],
//     "Class 9": ["English","Hindi", "Maths", "ICT (Information and Communication Technology)/Computer Science ", "Physics", "Chemistry" , "Biology", "Economics" ],
//     "Class 10":  ["English","Hindi", "Maths", "ICT (Information and Communication Technology)/Computer Science ", "Physics", "Chemistry" , "Biology", "Economics" ],
//   },
//   British:{
//     "Class 7": ["English","Hindi", "Maths", "Science", "History", "Geography","Computing"],
//     "Class 8": ["English","Hindi", "Maths", "Science", "History", "Geography","Computing"],
//     "Class 9": ["English","Hindi", "Maths", "Science", "History", "Geography","Computing"],
//     "Class 10": ["English","Hindi", "Maths", "Science", "History", "Geography","Computing"],
//   },
// };

// interface Lead {
//   _id: string;
//   studentName: string;
//   studentPhone: string;
//   parentPhone: string;
//   email: string;
//   board: string;
//   class: string;
//   subjects: string[];
//   status: 'new' | 'contacted' | 'converted' | 'not_interested' | 'demo_scheduled' | 'demo_completed' | 'demo_cancelled' | 'demo_no_show' | 'demo_rescheduled' | 'demo_rescheduled_cancelled' | 'demo_rescheduled_completed' | 'demo_rescheduled_no_show' | 'no_response_from_Lead';
//   notes: string;
//   createdAt: string;
//   updatedAt: string;
//   leadSource: string;
//   classesPerWeek: number;
//   courseInterested: string;
//   modeOfContact: string;
//   preferredTimeSlots: string;
//   counsellor: string;
//   sessionEndDate: string;
//   remarks: string;
// }

// interface EditLeadFormProps {
//   lead: Lead;
//   onComplete: () => void;
// }

// const BOARDS = ['CBSE', 'ICSE', 'State', 'IB', 'IGCSE', 'British'];
// const LEAD_SOURCES = ['website', 'referral', 'social_media', 'other'];
// const MODES_OF_CONTACT = ['phone', 'whatsapp', 'email'];
// const STATUSES = [
//   'new', 'contacted', 'converted', 'not_interested',
//   'demo_scheduled', 'demo_completed', 'demo_cancelled', 'demo_no_show',
//   'demo_rescheduled', 'demo_rescheduled_cancelled',
//   'demo_rescheduled_completed', 'demo_rescheduled_no_show',
//   'no_response_from_Lead'
// ];

// export default function EditLeadForm({ lead, onComplete }: EditLeadFormProps) {
//   const [loading, setLoading] = useState(false);
//   const [formData, setFormData] = useState(lead);

//   // Get available classes for selected board
//   const getAvailableClasses = () => {
//     if (!formData.board || !boardData[formData.board]) return [];
//     return Object.keys(boardData[formData.board]);
//   };

//   // Get available subjects for selected board and class
//   const getAvailableSubjects = () => {
//     if (!formData.board || !formData.class || !boardData[formData.board] || !boardData[formData.board][formData.class]) {
//       return [];
//     }
//     return boardData[formData.board][formData.class];
//   };

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target;
    
//     setFormData(prev => {
//       const newFormData = { ...prev, [name]: value };
      
//       // Reset class and subjects when board changes
//       if (name === 'board') {
//         newFormData.class = '';
//         newFormData.subjects = [];
//       }
      
//       // Reset subjects when class changes
//       if (name === 'class') {
//         newFormData.subjects = [];
//       }
      
//       return newFormData;
//     });
//   };

//   const handleSubjectChange = (subject: string) => {
//     setFormData(prev => {
//       const currentSubjects = prev.subjects || [];
//       const isSelected = currentSubjects.includes(subject);
      
//       if (isSelected) {
//         // Remove subject
//         return {
//           ...prev,
//           subjects: currentSubjects.filter(s => s !== subject)
//         };
//       } else {
//         // Add subject
//         return {
//           ...prev,
//           subjects: [...currentSubjects, subject]
//         };
//       }
//     });
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const response = await fetch(`http://localhost:6969/api/leads/editlead/${lead._id}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(formData),
//       });

//       const data = await response.json();
//       if (data.success) {
//         onComplete();  // Call the onComplete callback to close the form
//       }
//     } catch (error) {
//       console.error('Error:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md space-y-6 text-black">
//       {/* Status */}
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
//         <select
//           name="status"
//           value={formData.status}
//           onChange={handleChange}
//           className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//           required
//         >
//           {STATUSES.map((status) => (
//             <option key={status} value={status}>
//               {status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* Student Name */}
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-2">Student Name</label>
//         <input
//           type="text"
//           name="studentName"
//           value={formData.studentName}
//           onChange={handleChange}
//           className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//           required
//         />
//       </div>

//       {/* Student Phone */}
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-2">Student Phone</label>
//         <input
//           type="tel"
//           name="studentPhone"
//           value={formData.studentPhone}
//           onChange={handleChange}
//           className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//           required
//         />
//       </div>

//       {/* Parent Phone */}
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-2">Parent Phone</label>
//         <input
//           type="tel"
//           name="parentPhone"
//           value={formData.parentPhone}
//           onChange={handleChange}
//           className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//           required
//         />
//       </div>

//        {/* email */}
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
//         <input
//           type="email"
//           name="email"
//           value={formData.email}
//           onChange={handleChange}
//           className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//           required
//         />
//       </div>

//       {/* Board */}
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-2">Board</label>
//         <select
//           name="board"
//           value={formData.board}
//           onChange={handleChange}
//           className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//           required
//         >
//           <option value="">Select Board</option>
//           {BOARDS.map((board) => (
//             <option key={board} value={board}>{board}</option>
//           ))}
//         </select>
//       </div>

//       {/* Class */}
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
//         <select
//           name="class"
//           value={formData.class}
//           onChange={handleChange}
//           className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//           required
//           disabled={!formData.board}
//         >
//           <option value="">Select Class</option>
//           {getAvailableClasses().map((className) => (
//             <option key={className} value={className}>{className}</option>
//           ))}
//         </select>
//       </div>

//       {/* Subjects */}
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-2">
//           Subjects (Select multiple)
//         </label>
//         {formData.board && formData.class ? (
//           <div className="border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto">
//             {getAvailableSubjects().map((subject) => (
//               <label key={subject} className="flex items-center space-x-2 mb-2">
//                 <input
//                   type="checkbox"
//                   checked={formData.subjects?.includes(subject) || false}
//                   onChange={() => handleSubjectChange(subject)}
//                   className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                 />
//                 <span className="text-sm">{subject}</span>
//               </label>
//             ))}
//           </div>
//         ) : (
//           <div className="border border-gray-300 rounded-md p-3 text-gray-500 text-sm">
//             Please select Board and Class first to see available subjects
//           </div>
//         )}
//         {formData.subjects && formData.subjects.length > 0 && (
//           <div className="mt-2 text-sm text-gray-600">
//             Selected: {formData.subjects.join(', ')}
//           </div>
//         )}
//       </div>
  
//       {/* Lead Source */}
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-2">Lead Source</label>
//         <select
//           name="leadSource"
//           value={formData.leadSource}
//           onChange={handleChange}
//           className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//           required
//         >
//           <option value="">Select Lead Source</option>
//           <option value="website">Website</option>
//           <option value="referral">Referral</option>
//           <option value="social_media">Social Media</option>
//           <option value="other">Other</option>
//         </select>
//       </div>

//       {/* Classes per Week */}
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-2">Classes per Week</label>
//         <input
//           type="number"
//           name="classesPerWeek"
//           value={formData.classesPerWeek}
//           onChange={handleChange}
//           min={1}
//           max={7}
//           className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//           required
//         />
//       </div>
        
//       {/* Course Interested */}
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-2">Course Interested</label>
//         <input
//           type="text"
//           name="courseInterested"
//           value={formData.courseInterested}
//           onChange={handleChange}
//           className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//           required
//         />
//       </div>
           
//       {/* Counsellor */}
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-2">Counsellor</label>
//         <input
//           type="text"
//           name="counsellor"
//           value={formData.counsellor}
//           onChange={handleChange}
//           className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//           required
//         />
//       </div>

//       {/* Session End Date */}
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-2">Session End Date</label>
//         <input
//           type="date"
//           name="sessionEndDate"
//           value={formData.sessionEndDate}
//           onChange={handleChange}
//           className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//         />
//       </div>
          
//       {/* Preferred Time */}
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Time</label>
//         <input
//           type="time"
//           name="preferredTimeSlots"
//           value={formData.preferredTimeSlots}
//           onChange={handleChange}
//           className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//         />
//       </div>

//       {/* Remarks */}
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
//         <textarea
//           name="remarks"
//           value={formData.remarks}
//           onChange={handleChange}
//           className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//           rows={3}
//         />
//       </div>

//       {/* Notes */}
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
//         <textarea
//           name="notes"
//           value={formData.notes}
//           onChange={handleChange}
//           className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//           rows={3}
//         />
//       </div>

//       <div className="flex space-x-4">
//         <button
//           type="submit"
//           className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition duration-200"
//           disabled={loading}
//         >
//           {loading ? 'Updating...' : 'Update Lead'}
//         </button>
//         <button
//           type="button"
//           onClick={onComplete}
//           className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-md hover:bg-gray-300 transition duration-200"
//         >
//           Cancel
//         </button>
//       </div>
//     </form>
//   );
// }


'use client';

import { useState } from 'react';

// Import board data
import { BoardDataUtils } from '../boardData';

interface Lead {
  _id: string;
  studentName: string;
  studentPhone: string;
  parentPhone: string;
  email: string;
  board: string;
  class: string;
  subjects: string[];
  status: 'new' | 'contacted' | 'converted' | 'not_interested' | 'demo_scheduled' | 'demo_completed' | 'demo_cancelled' | 'demo_no_show' | 'demo_rescheduled' | 'demo_rescheduled_cancelled' | 'demo_rescheduled_completed' | 'demo_rescheduled_no_show' | 'no_response_from_Lead';
  notes: string;
  createdAt: string;
  updatedAt: string;
  leadSource: string;
  classesPerWeek: number;
  courseInterested: string;
  modeOfContact: string;
  preferredTimeSlots: string;
  counsellor: string;
  sessionEndDate: string;
  remarks: string;
}

interface EditLeadFormProps {
  lead: Lead;
  onComplete: () => void;
}

const BOARDS = BoardDataUtils.getBoards();
const LEAD_SOURCES = ['website', 'referral', 'social_media', 'other'];
const MODES_OF_CONTACT = ['phone', 'whatsapp', 'email'];
const STATUSES = [
  'new', 'contacted', 'converted', 'not_interested',
  'demo_scheduled', 'demo_completed', 'demo_cancelled', 'demo_no_show',
  'demo_rescheduled', 'demo_rescheduled_cancelled',
  'demo_rescheduled_completed', 'demo_rescheduled_no_show',
  'no_response_from_Lead'
];

export default function EditLeadForm({ lead, onComplete }: EditLeadFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(lead);

  // Get available classes for selected board
  const getAvailableClasses = () => {
    return BoardDataUtils.getClassesForBoard(formData.board);
  };

  // Get available subjects for selected board and class
  const getAvailableSubjects = () => {
    return BoardDataUtils.getSubjectsForBoardAndClass(formData.board, formData.class);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value,type  } = e.target;
    


    setFormData(prev => {
      let newFormData = { ...prev, [name]: value };

      
      
      // Reset class and subjects when board changes
      if (name === 'board') {
        newFormData.class = '';
        newFormData.subjects = [];
      }
      
      // Reset subjects when class changes
      if (name === 'class') {
        newFormData.subjects = [];
      }
      
      return newFormData;
    });
  };

  const handleSubjectChange = (subject: string) => {
    setFormData(prev => {
      const currentSubjects = prev.subjects || [];
      const isSelected = currentSubjects.includes(subject);
      
      if (isSelected) {
        // Remove subject
        return {
          ...prev,
          subjects: currentSubjects.filter(s => s !== subject)
        };
      } else {
        // Add subject
        return {
          ...prev,
          subjects: [...currentSubjects, subject]
        };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:6969/api/leads/editlead/${lead._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        onComplete();  // Call the onComplete callback to close the form
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md space-y-6 text-black">
      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        >
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </option>
          ))}
        </select>
      </div>

      {/* Student Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Student Name</label>
        <input
          type="text"
          name="studentName"
          value={formData.studentName}
          onChange={handleChange}
          className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      {/* Student Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Student Phone</label>
        <input
          type="tel"
          name="studentPhone"
          value={formData.studentPhone}
          onChange={handleChange}
          className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      {/* Parent Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Parent Phone</label>
        <input
          type="tel"
          name="parentPhone"
          value={formData.parentPhone}
          onChange={handleChange}
          className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

       {/* email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      {/* Board */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Board</label>
        <select
          name="board"
          value={formData.board}
          onChange={handleChange}
          className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        >
          <option value="">Select Board</option>
          {BOARDS.map((board) => (
            <option key={board} value={board}>{board}</option>
          ))}
        </select>
      </div>

      {/* Class */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
        <select
          name="class"
          value={formData.class}
          onChange={handleChange}
          className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
          disabled={!formData.board}
        >
          <option value="">Select Class</option>
          {getAvailableClasses().map((className) => (
            <option key={className} value={className}>{className}</option>
          ))}
        </select>
      </div>

      {/* Subjects */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Subjects (Select multiple)
        </label>
        {formData.board && formData.class ? (
          <div className="border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto">
            {getAvailableSubjects().map((subject) => (
              <label key={subject} className="flex items-center space-x-2 mb-2">
                <input
                  type="checkbox"
                  checked={formData.subjects?.includes(subject) || false}
                  onChange={() => handleSubjectChange(subject)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">{subject}</span>
              </label>
            ))}
          </div>
        ) : (
          <div className="border border-gray-300 rounded-md p-3 text-gray-500 text-sm">
            Please select Board and Class first to see available subjects
          </div>
        )}
        {formData.subjects && formData.subjects.length > 0 && (
          <div className="mt-2 text-sm text-gray-600">
            Selected: {formData.subjects.join(', ')}
          </div>
        )}
      </div>
  
      {/* Lead Source */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Lead Source</label>
        <select
          name="leadSource"
          value={formData.leadSource}
          onChange={handleChange}
          className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        >
          <option value="">Select Lead Source</option>
          <option value="website">Website</option>
          <option value="referral">Referral</option>
          <option value="social_media">Social Media</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Classes per Week */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Classes per Week</label>
        <input
          type="number"
          name="classesPerWeek"
          value={formData.classesPerWeek}
          onChange={handleChange}
          min={1}
          max={7}
          className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>
        
      {/* Course Interested */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Course Interested</label>
        <input
          type="text"
          name="courseInterested"
          value={formData.courseInterested}
          onChange={handleChange}
          className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>
           
      {/* Counsellor */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Counsellor</label>
        <input
          type="text"
          name="counsellor"
          value={formData.counsellor}
          onChange={handleChange}
          className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      {/* Session End Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Session End Date</label>
        <input
          type="date"
          name="sessionEndDate"
          value={formData.sessionEndDate}
          onChange={handleChange}
          className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
          
      {/* Preferred Time */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Time</label>
        <input
          type="time"
          name="preferredTimeSlots"
          value={formData.preferredTimeSlots}
          onChange={handleChange}
          className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Remarks */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
        <textarea
          name="remarks"
          value={formData.remarks}
          onChange={handleChange}
          className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={3}
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={3}
        />
      </div>

      <div className="flex space-x-4">
        <button
          type="submit"
          className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition duration-200"
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Update Lead'}
        </button>
        <button
          type="button"
          onClick={onComplete}
          className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-md hover:bg-gray-300 transition duration-200"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}