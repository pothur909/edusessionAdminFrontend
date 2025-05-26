
// // 'use client';

// // import { useEffect, useState } from 'react';
// // import { useRouter, useSearchParams } from 'next/navigation';

// // type Lead = {
// //   leadId: string;
// //   dateTime: string;
// //   teacher: string;
// //   board: string;
// //   class: string;
// //   subjects: string;
// //   status: 'Pending' | 'Contacted' | 'Enrolled';
// //   remarks: string;
// // };

// // const initialData: Lead = {
// //   leadId: '',
// //   dateTime: '',
// //   teacher: '',
// //   board: '',
// //   class: '',
// //   subjects: '',
// //   status: 'Pending',
// //   remarks: '',
// // };

// // export default function DemoLeadForm() {
// //   const router = useRouter();
// //   const searchParams = useSearchParams();
// //   const leadIdParam = searchParams.get('id');
// //   const isEditMode = !!leadIdParam;

// //   const [formData, setFormData] = useState<Lead>(initialData);
// //   const [loading, setLoading] = useState(false);

// //   useEffect(() => {
// //     if (isEditMode && leadIdParam) {
// //       fetch(`http://localhost:6969/api/demo/add/${leadIdParam}`)
// //         .then(res => res.json())
// //         .then(data => {
// //           setFormData({
// //             ...data,
// //             dateTime: new Date(data.dateTime).toISOString().slice(0, 16),
// //             subjects: data.subjects.join(', '),
// //           });
// //         });
// //     }
// //   }, [leadIdParam, isEditMode]);

// //   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
// //     const { name, value } = e.target;
// //     setFormData(prev => ({ ...prev, [name]: value }));
// //   };

// //   const handleSubmit = async (e: React.FormEvent) => {
// //     e.preventDefault();
// //     setLoading(true);

// //     const payload = {
// //       ...formData,
// //       subjects: formData.subjects.split(',').map(sub => sub.trim()),
// //     };

// //     const method = isEditMode ? 'PUT' : 'POST';
// //     const endpoint = isEditMode ? `/api/leads/${leadIdParam}` : `/api/leads`;

// //     const res = await fetch(endpoint, {
// //       method,
// //       headers: { 'Content-Type': 'application/json' },
// //       body: JSON.stringify(payload),
// //     });

// //     setLoading(false);

// //     if (res.ok) {
// //       alert(`Lead ${isEditMode ? 'updated' : 'created'} successfully`);
// //       router.push('/demo');
// //     } else {
// //       const errorText = await res.text();
// //       alert('Error: ' + errorText);
// //     }
// //   };

// //   return (
// //     <div className="max-w-xl mx-auto p-6 text-black">
// //       <h2 className="text-2xl font-bold mb-4">{isEditMode ? 'Edit Lead' : 'Create Lead'}</h2>
// //       <form onSubmit={handleSubmit} className="space-y-4 text-black">
// //         <input name="leadId" placeholder="Lead ID" value={formData.leadId} onChange={handleChange} required className="w-full border p-2" />
// //         <input name="dateTime" type="datetime-local" value={formData.dateTime} onChange={handleChange} required className="w-full border p-2" />
// //         <input name="teacher" placeholder="Teacher" value={formData.teacher} onChange={handleChange} required className="w-full border p-2" />
// //         <input name="board" placeholder="Board" value={formData.board} onChange={handleChange} required className="w-full border p-2" />
// //         <input name="class" placeholder="Class" value={formData.class} onChange={handleChange} required className="w-full border p-2" />
// //         <input name="subjects" placeholder="Subjects (comma separated)" value={formData.subjects} onChange={handleChange} required className="w-full border p-2" />
// //         <select name="status" value={formData.status} onChange={handleChange} className="w-full border p-2">
// //           <option value="Pending">Pending</option>
// //           <option value="Contacted">Contacted</option>
// //           <option value="Enrolled">Enrolled</option>
// //         </select>
// //         <textarea name="remarks" placeholder="Remarks" value={formData.remarks} onChange={handleChange} className="w-full border p-2" />
// //         <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">
// //           {loading ? 'Saving...' : isEditMode ? 'Update Lead' : 'Create Lead'}
// //         </button>
// //       </form>
// //     </div>
// //   );
// // }




// // 'use client';


// // import { useEffect, useState } from 'react';
// // import { useRouter, useSearchParams } from 'next/navigation';

// // interface Lead {
// //   _id: string;
// //   studentName: string;
// //   studentPhone: string;
// //   parentPhone: string;
// //   email: string;
// //   board: string;
// //   class: string;
// //   subjects: string[];
// //   status: 'new' | 'contacted' | 'converted' | 'not_interested' | 'demo_scheduled' | 'demo_completed' | 'demo_cancelled' | 'demo_no_show' | 'demo_rescheduled' | 'demo_rescheduled_cancelled' | 'demo_rescheduled_completed' | 'demo_rescheduled_no_show' | 'no_response_from_Lead';
// //   notes: string;
// //   createdAt: string;
// //   updatedAt: string;
// //   leadSource: string;
// //   classesPerWeek: number;
// //   courseInterested: string;
// //   modeOfContact: string;
// //   counsellor: string;
// //   sessionEndDate?: string;
// //   remarks: string;
// // }

// // type Demo = {
// //   lead: string;
// //   date: string;
// //   time: string;
// //   teacher: string;
// //   board: string;
// //   class: string;
// //   subject: string;
// //   status: 'scheduled' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled';
// //   remarks: string;
// // };

// // const initialData: Demo = {
// //   lead: '',
// //   date: '',
// //   time: '',
// //   teacher: '',
// //   board: '',
// //   class: '',
// //   subject: '',
// //   status: 'scheduled',
// //   remarks: '',
// // };

// // export default function DemoLeadForm() {
// //   const router = useRouter();
// //   const searchParams = useSearchParams();
// //   const leadIdParam = searchParams.get('leadId'); // Changed from 'id' to 'leadId'
// //   const demoIdParam = searchParams.get('demoId'); // For editing existing demos
// //   const isEditMode = !!demoIdParam;
// //   const isFromLead = !!leadIdParam;

// //   const [formData, setFormData] = useState<Demo>(initialData);
// //   const [loading, setLoading] = useState(false);
// //   const [leads, setLeads] = useState<Lead[]>([]);
// //   const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

// //   // Fetch all leads for dropdown
// //   useEffect(() => {
// //     const fetchLeads = async () => {
// //       try {
// //         const response = await fetch('http://localhost:6969/api/leads/viewleads');
// //         const data = await response.json();
// //         if (data.success) {
// //           setLeads(data.data);
// //         }
// //       } catch (error) {
// //         console.error('Error fetching leads:', error);
// //       }
// //     };
// //     fetchLeads();
// //   }, []);

// //   // If coming from a specific lead, populate the form
// //   useEffect(() => {
// //     if (isFromLead && leadIdParam && leads.length > 0) {
// //       const lead = leads.find(l => l._id === leadIdParam);
// //       if (lead) {
// //         setSelectedLead(lead);
// //         setFormData(prev => ({
// //           ...prev,
// //           lead: lead._id,
// //           board: lead.board,
// //           class: lead.class,
// //           subject: lead.subjects[0] || '', // Use first subject as default
// //         }));
// //       }
// //     }
// //   }, [leadIdParam, isFromLead, leads]);

// //   // If editing existing demo, fetch demo data
// //   useEffect(() => {
// //     if (isEditMode && demoIdParam) {
// //       const fetchDemo = async () => {
// //         try {
// //           const response = await fetch(`http://localhost:6969/api/demo/${demoIdParam}`);
// //           const data = await response.json();
// //           if (data.success) {
// //             setFormData(data.data);
// //             // Also set the selected lead
// //             const lead = leads.find(l => l._id === data.data.lead);
// //             if (lead) {
// //               setSelectedLead(lead);
// //             }
// //           }
// //         } catch (error) {
// //           console.error('Error fetching demo:', error);
// //         }
// //       };
// //       fetchDemo();
// //     }
// //   }, [demoIdParam, isEditMode, leads]);

// //   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
// //     const { name, value } = e.target;
// //     setFormData(prev => ({ ...prev, [name]: value }));
// //   };

// //   const handleLeadChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
// //     const leadId = e.target.value;
// //     const lead = leads.find(l => l._id === leadId);
    
// //     if (lead) {
// //       setSelectedLead(lead);
// //       setFormData(prev => ({
// //         ...prev,
// //         lead: leadId,
// //         board: lead.board,
// //         class: lead.class,
// //         subject: lead.subjects[0] || '',
// //       }));
// //     } else {
// //       setSelectedLead(null);
// //       setFormData(prev => ({
// //         ...prev,
// //         lead: '',
// //         board: '',
// //         class: '',
// //         subject: '',
// //       }));
// //     }
// //   };

// //   const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
// //     setFormData(prev => ({ ...prev, subject: e.target.value }));
// //   };

// //   const handleSubmit = async (e: React.FormEvent) => {
// //     e.preventDefault();
// //     setLoading(true);

// //     try {
// //       const method = isEditMode ? 'PUT' : 'POST';
// //       const endpoint = isEditMode 
// //         ? `http://localhost:6969/api/demo/update/${demoIdParam}` 
// //         : 'http://localhost:6969/api/demo/add';

// //       const response = await fetch(endpoint, {
// //         method,
// //         headers: { 'Content-Type': 'application/json' },
// //         body: JSON.stringify(formData),
// //       });

// //       const data = await response.json();

// //       if (data.success) {
// //         alert(`Demo ${isEditMode ? 'updated' : 'scheduled'} successfully`);
// //         router.push('/demo');
// //       } else {
// //         alert('Error: ' + (data.message || 'Unknown error'));
// //       }
// //     } catch (error) {
// //       console.error('Error:', error);
// //       alert('An error occurred while saving the demo');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleCancel = () => {
// //     router.push('/demo');
// //   };

// //   return (
// //     <div className="max-w-2xl mx-auto p-6 text-black">
// //       <div className="flex items-center justify-between mb-6">
// //         <h2 className="text-2xl font-bold">
// //           {isEditMode ? 'Edit Demo' : 'Schedule Demo'}
// //         </h2>
// //         <button
// //           onClick={handleCancel}
// //           className="text-gray-600 hover:text-gray-800"
// //         >
// //           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// //             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
// //           </svg>
// //         </button>
// //       </div>

// //       <form onSubmit={handleSubmit} className="space-y-6 text-black">
// //         {/* Lead Selection */}
// //         <div className="space-y-2">
// //           <label className="block text-sm font-medium text-gray-700">Select Lead *</label>
// //           <select
// //             name="lead"
// //             value={formData.lead}
// //             onChange={handleLeadChange}
// //             required
// //             disabled={isFromLead} // Disable if coming from specific lead
// //             className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
// //           >
// //             <option value="">Select a lead...</option>
// //             {leads.map((lead) => (
// //               <option key={lead._id} value={lead._id}>
// //                 {lead.studentName} - {lead.studentPhone} ({lead.board} Class {lead.class})
// //               </option>
// //             ))}
// //           </select>
// //         </div>

// //         {/* Lead Information Display */}
// //         {selectedLead && (
// //           <div className="bg-gray-50 p-4 rounded-md">
// //             <h3 className="text-lg font-medium mb-2">Lead Information</h3>
// //             <div className="grid grid-cols-2 gap-4 text-sm">
// //               <div><strong>Student:</strong> {selectedLead.studentName}</div>
// //               <div><strong>Phone:</strong> {selectedLead.studentPhone}</div>
// //               <div><strong>Email:</strong> {selectedLead.email}</div>
// //               <div><strong>Parent Phone:</strong> {selectedLead.parentPhone || 'N/A'}</div>
// //               <div><strong>Board:</strong> {selectedLead.board}</div>
// //               <div><strong>Class:</strong> {selectedLead.class}</div>
// //               <div><strong>Subjects:</strong> {selectedLead.subjects.join(', ')}</div>
// //               <div><strong>Current Status:</strong> 
// //                 <span className="ml-1 capitalize">{selectedLead.status.replace(/_/g, ' ')}</span>
// //               </div>
// //             </div>
// //           </div>
// //         )}

// //         {/* Demo Details */}
// //         <div className="grid grid-cols-2 gap-4">
// //           <div className="space-y-2">
// //             <label className="block text-sm font-medium text-gray-700">Date *</label>
// //             <input
// //               name="date"
// //               type="date"
// //               value={formData.date}
// //               onChange={handleChange}
// //               required
// //               className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
// //             />
// //           </div>
// //           <div className="space-y-2">
// //             <label className="block text-sm font-medium text-gray-700">Time *</label>
// //             <input
// //               name="time"
// //               type="time"
// //               value={formData.time}
// //               onChange={handleChange}
// //               required
// //               className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
// //             />
// //           </div>
// //         </div>

// //         <div className="grid grid-cols-2 gap-4">
// //           <div className="space-y-2">
// //             <label className="block text-sm font-medium text-gray-700">Teacher *</label>
// //             <input
// //               name="teacher"
// //               placeholder="Teacher name"
// //               value={formData.teacher}
// //               onChange={handleChange}
// //               required
// //               className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
// //             />
// //           </div>
// //           <div className="space-y-2">
// //             <label className="block text-sm font-medium text-gray-700">Subject *</label>
// //             <select
// //               name="subject"
// //               value={formData.subject}
// //               onChange={handleSubjectChange}
// //               required
// //               className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
// //             >
// //               <option value="">Select subject...</option>
// //               {selectedLead?.subjects.map((subject, index) => (
// //                 <option key={index} value={subject}>
// //                   {subject}
// //                 </option>
// //               ))}
// //             </select>
// //           </div>
// //         </div>

// //         <div className="grid grid-cols-2 gap-4">
// //           <div className="space-y-2">
// //             <label className="block text-sm font-medium text-gray-700">Board</label>
// //             <input
// //               name="board"
// //               value={formData.board}
// //               onChange={handleChange}
// //               readOnly
// //               className="w-full border border-gray-300 rounded-md p-3 bg-gray-100"
// //             />
// //           </div>
// //           <div className="space-y-2">
// //             <label className="block text-sm font-medium text-gray-700">Class</label>
// //             <input
// //               name="class"
// //               value={formData.class}
// //               onChange={handleChange}
// //               readOnly
// //               className="w-full border border-gray-300 rounded-md p-3 bg-gray-100"
// //             />
// //           </div>
// //         </div>

// //         <div className="space-y-2">
// //           <label className="block text-sm font-medium text-gray-700">Status *</label>
// //           <select
// //             name="status"
// //             value={formData.status}
// //             onChange={handleChange}
// //             className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
// //           >
// //             <option value="scheduled">Scheduled</option>
// //             <option value="completed">Completed</option>
// //             <option value="cancelled">Cancelled</option>
// //             <option value="no_show">No Show</option>
// //             <option value="rescheduled">Rescheduled</option>
// //           </select>
// //         </div>

// //         <div className="space-y-2">
// //           <label className="block text-sm font-medium text-gray-700">Remarks</label>
// //           <textarea
// //             name="remarks"
// //             placeholder="Additional notes or remarks..."
// //             value={formData.remarks}
// //             onChange={handleChange}
// //             rows={4}
// //             className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
// //           />
// //         </div>

// //         <div className="flex space-x-4">
// //           <button
// //             type="submit"
// //             disabled={loading}
// //             className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
// //           >
// //             {loading ? 'Saving...' : isEditMode ? 'Update Demo' : 'Schedule Demo'}
// //           </button>
// //           <button
// //             type="button"
// //             onClick={handleCancel}
// //             className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
// //           >
// //             Cancel
// //           </button>
// //         </div>
// //       </form>
// //     </div>
// //   );
// // }







// 'use client';

// import { useEffect, useState } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';

// interface Lead {
//   _id: string;
//   studentName: string;
//   studentPhone: string;
//   parentPhone: string;
//   email: string;
//   board: string;
//   class: string;
//   subjects: string[];
//   status: string;
//   notes: string;
//   createdAt: string;
//   updatedAt: string;
//   leadSource: string;
//   classesPerWeek: number;
//   courseInterested: string;
//   modeOfContact: string;
//   counsellor: string;
//   sessionEndDate?: string;
//   remarks: string;
// }

// type Demo = {
//   lead: string;
//   date: string;
//   time: string;
//   teacher: string;
//   board: string;
//   class: string;
//   subject: string;
//   status: 'scheduled' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled';
//   remarks: string;
// };

// const initialLead: Lead = {
//   _id: '',
//   studentName: '',
//   studentPhone: '',
//   parentPhone: '',
//   email: '',
//   board: '',
//   class: '',
//   subjects: [],
//   status: '',
//   notes: '',
//   createdAt: '',
//   updatedAt: '',
//   leadSource: '',
//   classesPerWeek: 1,
//   courseInterested: '',
//   modeOfContact: '',
//   counsellor: '',
//   remarks: '',
// };

// const initialDemo: Demo = {
//   lead: '',
//   date: '',
//   time: '',
//   teacher: '',
//   board: '',
//   class: '',
//   subject: '',
//   status: 'scheduled',
//   remarks: '',
// };

// export default function DemoLeadForm() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const leadIdParam = searchParams.get('leadId');
//   const demoIdParam = searchParams.get('demoId');
//   const isEditMode = !!demoIdParam;

//   const [formData, setFormData] = useState<Demo>(initialDemo);
//   const [leadData, setLeadData] = useState<Lead>(initialLead);
//   const [loading, setLoading] = useState(false);

//   // Fetch lead if leadId exists
//   useEffect(() => {
//     const fetchLead = async () => {
//       if (!leadIdParam) return;

//       try {
//         const response = await fetch(`http://localhost:6969/api/leads/${leadIdParam}`);
//         const data = await response.json();
//         if (data.success) {
//           setLeadData(data.data);
//           setFormData((prev) => ({
//             ...prev,
//             lead: data.data._id,
//             board: data.data.board,
//             class: data.data.class,
//             subject: data.data.subjects[0] || '',
//           }));
//         }
//       } catch (error) {
//         console.error('Error fetching lead data:', error);
//       }
//     };

//     fetchLead();
//   }, [leadIdParam]);

//   // Fetch demo if editing
//   useEffect(() => {
//     const fetchDemo = async () => {
//       if (!demoIdParam) return;

//       try {
//         const response = await fetch(`http://localhost:6969/api/demo/${demoIdParam}`);
//         const data = await response.json();
//         if (data.success) {
//           setFormData(data.data);
//         }
//       } catch (error) {
//         console.error('Error fetching demo data:', error);
//       }
//     };

//     fetchDemo();
//   }, [demoIdParam]);

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
//   ) => {
//     const { name, value } = e.target;

//     if (name in leadData) {
//       setLeadData((prev) => ({ ...prev, [name]: value }));
//     }

//     if (name in formData) {
//       setFormData((prev) => ({ ...prev, [name]: value }));
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const method = isEditMode ? 'PUT' : 'POST';
//       const endpoint = isEditMode
//         ? `http://localhost:6969/api/demo/update/${demoIdParam}`
//         : 'http://localhost:6969/api/demo/add';

//       const response = await fetch(endpoint, {
//         method,
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(formData),
//       });

//       const data = await response.json();

//       if (data.success) {
//         alert(`Demo ${isEditMode ? 'updated' : 'scheduled'} successfully`);
//         router.push('/demo');
//       } else {
//         alert('Error: ' + (data.message || 'Unknown error'));
//       }
//     } catch (error) {
//       console.error('Error:', error);
//       alert('An error occurred while saving the demo');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-3xl mx-auto p-6 text-black">
//       <h2 className="text-2xl font-bold mb-4">
//         {isEditMode ? 'Edit Demo' : 'Schedule Demo'}
//       </h2>

//       <form onSubmit={handleSubmit} className="space-y-6 text-black">
//         {/* Editable Lead Fields */}
//         <div className="grid grid-cols-2 gap-4">
//           <input
//             type="text"
//             name="studentName"
//             placeholder="Student Name"
//             value={leadData.studentName}
//             onChange={(e) =>
//       setLeadData({ ...leadData, studentName: e.target.value })
//     }
//             className="border p-3 rounded-md w-full"
//           />
//           <input
//             type="text"
//             name="studentPhone"
//             placeholder="Student Phone"
//             value={leadData.studentPhone}
//             onChange={handleChange}
//             className="border p-3 rounded-md w-full"
//           />
//           <input
//             type="text"
//             name="parentPhone"
//             placeholder="Parent Phone"
//             value={leadData.parentPhone}
//             onChange={handleChange}
//             className="border p-3 rounded-md w-full"
//           />
//           <input
//             type="email"
//             name="email"
//             placeholder="Email"
//             value={leadData.email}
//             onChange={handleChange}
//             className="border p-3 rounded-md w-full"
//           />
//           <input
//             type="text"
//             name="board"
//             placeholder="Board"
//             value={formData.board}
//             onChange={handleChange}
//             className="border p-3 rounded-md w-full"
//           />
//           <input
//             type="text"
//             name="class"
//             placeholder="Class"
//             value={formData.class}
//             onChange={handleChange}
//             className="border p-3 rounded-md w-full"
//           />
//           <input
//             type="text"
//             name="subject"
//             placeholder="Subject"
//             value={formData.subject}
//             onChange={handleChange}
//             className="border p-3 rounded-md w-full"
//           />
//         </div>

//         {/* Demo Details */}
//         <div className="grid grid-cols-2 gap-4">
//           <input
//             type="date"
//             name="date"
//             value={formData.date}
//             onChange={handleChange}
//             className="border p-3 rounded-md w-full"
//           />
//           <input
//             type="time"
//             name="time"
//             value={formData.time}
//             onChange={handleChange}
//             className="border p-3 rounded-md w-full"
//           />
//           <input
//             type="text"
//             name="teacher"
//             placeholder="Teacher"
//             value={formData.teacher}
//             onChange={handleChange}
//             className="border p-3 rounded-md w-full"
//           />
//           <select
//             name="status"
//             value={formData.status}
//             onChange={handleChange}
//             className="border p-3 rounded-md w-full"
//           >
//             <option value="scheduled">Scheduled</option>
//             <option value="completed">Completed</option>
//             <option value="cancelled">Cancelled</option>
//             <option value="no_show">No Show</option>
//             <option value="rescheduled">Rescheduled</option>
//           </select>
//         </div>

//         <textarea
//           name="remarks"
//           placeholder="Remarks"
//           value={formData.remarks}
//           onChange={handleChange}
//           className="w-full border p-3 rounded-md"
//         />

//         <button
//           type="submit"
//           disabled={loading}
//           className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
//         >
//           {isEditMode ? 'Update Demo' : 'Schedule Demo'}
//         </button>
//       </form>
//     </div>
//   );
// }

