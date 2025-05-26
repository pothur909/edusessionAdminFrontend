// 'use client';

// import { useState } from 'react';
// import LeadShow from './components/leadShow';
// import LeadForm from './components/leadAdd';
// import EditLeadForm from './components/leadEdit';

// export default function LeadsPage() {
//   const [activeComponent, setActiveComponent] = useState('show');

//   const renderComponent = () => {
//     switch (activeComponent) {
//       case 'add':
//         return <LeadForm />;
//       case 'edit':
//         return <EditLeadForm />;
//       default:
//         return <LeadShow />;
//     }
//   };

//   return (
//     <div className="flex">
//       {/* Sidebar */}
//       <div className="w-1/4 bg-gray-100 p-4">
//         <ul className="space-y-2">
//           <li>
//             <button onClick={() => setActiveComponent('add')} className="text-blue-600 hover:underline">
//               ➕ Add Lead
//             </button>
//           </li>
//           <li>
//             <button onClick={() => setActiveComponent('show')} className="text-blue-600 hover:underline">
//               📋 Show Leads
//             </button>
//           </li>
//           <li>
//             <button onClick={() => setActiveComponent('edit')} className="text-blue-600 hover:underline">
//               ✏️ Edit Lead
//             </button>
//           </li>
//         </ul>
//       </div>

//       {/* Main Content */}
//       <div className="flex-1 p-4">
//         {renderComponent()}
//       </div>
//     </div>
//   );
// }
