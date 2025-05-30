// 'use client';

// import { useState } from "react";
// import LeadForm from "../addLead/page";

// const SideBar= () => {
//   const [selectedPage, setSelectedPage] = useState("Dashboard");

//   const renderContent = () => {
//     switch (selectedPage) {
//       case "Dashboard":
//         return (
//           <div>
//             <h2>Welcome to the Dashboard</h2>
//             <p>This is the dashboard page.</p>
//           </div>
//         );
//       case "Leads":
//         return (
//           <div>
            
//             <LeadForm/>
//           </div>
//         );
//       case "settings":
//         return (
//           <div>
//             <h2>settings</h2>
//           </div>
//         );
//     }
//   };

//   const styles = {
//     container: {
//       display: "flex",
//       height: "100vh",
//       fontFamily: "Arial, sans-serif",
//     },
//     sidebar: {
//       width: "220px",
//       backgroundColor: "#f2f2f2",
//       padding: "20px",
//       boxShadow: "2px 0 5px rgba(0,0,0,0.1)",
//     },
//     logo: {
//       marginBottom: "30px",
//     },
//     navList: {
//       listStyle: "none",
//       padding: 0,
//     },
//     navItem: {
//       padding: "12px 16px",
//       marginBottom: "10px",
//       cursor: "pointer",
//       borderRadius: "6px",
//       transition: "all 0.2s ease-in-out",
//     },
//     mainContent: {
//       flex: 1,
//       padding: "30px",
//       backgroundColor: "#black",
//     },
//   };

//   return (
//     <>
//       <div style={styles.container}>
//         <aside style={styles.sidebar}>
//           <nav>
//             <ul style={styles.navList}>
//               {["Dashboard", "Leads", "settings"].map((item) => (
//                 <li
//                   key={item}
//                   style={{
//                     ...styles.navItem,
//                     backgroundColor:
//                       selectedPage === item ? "#0070f3" : "transparent",
//                     color: selectedPage === item ? "blue" : "#000",
//                   }}
//                   onClick={() => setSelectedPage(item)}
//                 >
//                   {item}
//                 </li>
//               ))}
//             </ul>
//           </nav>
//         </aside>
//         <main style={styles.mainContent}>{renderContent()}</main>
//       </div>
//     </>
//   );
// };

// export default SideBar;




// 'use client';

// import { useState } from "react";
// import LeadForm from "../leads/components/leadAdd";
// import LeadsList from "../leads/components/leadShow";
// import EnrollmentList from "../enrollment/components/enrollmentShow";
// import AnalyticsDashboard from "../dashboard/component/dashboardAnalytics";

// // Success Popup Component
// function SuccessPopup({ show, onClose }) {
//   if (!show) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg p-8 max-w-md mx-4 transform transition-all duration-300 scale-100">
//         <div className="text-center">
//           <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
//             <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
//             </svg>
//           </div>
//           <h3 className="text-lg font-medium text-gray-900 mb-2">Success!</h3>
//           <p className="text-sm text-gray-500 mb-6">Lead successfully added to the system.</p>
//           <button
//             onClick={onClose}
//             className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition duration-200"
//           >
//             Close
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// const SideBar = () => {
//   const [selectedPage, setSelectedPage] = useState("Dashboard");
//   const [showSuccessPopup, setShowSuccessPopup] = useState(false);

//   const handleLeadSuccess = () => {
//     setShowSuccessPopup(true);
//   };

//   const closeSuccessPopup = () => {
//     setShowSuccessPopup(false);
//   };



//   const renderContent = () => {
//     switch (selectedPage) {
//       case "Dashboard":
//         return (
//           <div className="p-8">
//             {/* <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome to the Dashboard</h2> */}
//             {/* <div className="bg-white rounded-lg shadow-sm p-6">
//               <p className="text-gray-600 text-lg mb-4">This is the dashboard page where you can view your analytics and overview.</p>
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                 <div className="bg-blue-50 p-4 rounded-lg">
//                   <h3 className="font-semibold text-blue-900">Total Leads</h3>
//                   <p className="text-2xl font-bold text-blue-600">156</p>
//                 </div>
//                 <div className="bg-green-50 p-4 rounded-lg">
//                   <h3 className="font-semibold text-green-900">Active Students</h3>
//                   <p className="text-2xl font-bold text-green-600">89</p>
//                 </div>
//                 <div className="bg-purple-50 p-4 rounded-lg">
//                   <h3 className="font-semibold text-purple-900">This Month</h3>
//                   <p className="text-2xl font-bold text-purple-600">23</p>
//                 </div>
//               </div>
//             </div> */}
//             <AnalyticsDashboard/>


//           </div>
//         );
//       case "Create Leads":
//         return (
//           <div>
//             <LeadForm onSuccess={handleLeadSuccess} />
//           </div>
//         );
//         case "Show Leads":
//             return(
//                 <div>
//                     <LeadsList/>
//                 </div>
//             );
//              case "Show Enrollment":
//             return(
//                 <div>
//                     <EnrollmentList/>
//                 </div>
//             );
//       case "Settings":
//         return (
//           <div className="p-8">
//             <h2 className="text-3xl font-bold text-gray-800 mb-4">Settings</h2>
//             <div className="bg-white rounded-lg shadow-sm p-6">
//               <p className="text-gray-600 text-lg">Configure your application settings here.</p>
//             </div>
//           </div>
//         );
//       default:
//         return null;
//     }
//   };

//   const menuItems = [
//     { name: "Dashboard", icon: "📊" },
//     { name: "Create Leads", icon: "👥" },
//     {name: "Show Leads", icon:"👥"},
//      {name: "Show Enrollment", icon:"👥"},
//     { name: "Settings", icon: "⚙️" }
//   ];

//   return (
//     <>
//       <div className="flex h-screen bg-gray-100">
//         {/* Sidebar */}
//         <aside className="w-64 bg-white shadow-lg">
//           {/* Logo/Header */}
//           <div className="h-16 flex items-center justify-center border-b border-gray-200">
//             <div className="flex items-center space-x-2">
//               <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
//                 <span className="text-white font-bold text-sm">E</span>
//               </div>
//               <span className="text-xl font-bold text-gray-800">Admin Portal</span>
//             </div>
//           </div>

//           {/* Navigation */}
//           <nav className="mt-8 px-4">
//             <ul className="space-y-2">
//               {menuItems.map((item) => (
//                 <li key={item.name}>
//                   <button
//                     onClick={() => setSelectedPage(item.name)}
//                     className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
//                       selectedPage === item.name
//                         ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-700'
//                         : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
//                     }`}
//                   >
//                     <span className="text-lg">{item.icon}</span>
//                     <span className="font-medium">{item.name}</span>
//                   </button>
//                 </li>
//               ))}
//             </ul>
//           </nav>

//           {/* User Profile Section */}
//           {/* <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200">
//             <div className="flex items-center space-x-3">
//               <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
//                 <span className="text-gray-600 font-medium">M</span>
//               </div>
//               <div>
//                 <p className="font-medium text-gray-800">Maria</p>
//                 <p className="text-sm text-gray-500">Administrator</p>
//               </div>
//             </div>
//           </div> */}
//         </aside>

//         {/* Main Content */}
//         <main className="flex-1 overflow-auto bg-gray-50">
//           {renderContent()}
//         </main>
//       </div>

//       {/* Success Popup */}
//       <SuccessPopup show={showSuccessPopup} onClose={closeSuccessPopup} />
//     </>
//   );
// };

// export default SideBar;



'use client';

import { useState } from "react";
import AnalyticsDashboard from "../dashboard/component/dashboardAnalytics";
import LeadsList from "../leads/components/leadShow";
import LeadForm from "../leads/components/leadAdd";
import EnrollmentList from "../enrollment/components/enrollmentShow";
// Placeholder components since external imports aren't available



// Success Popup Component
function SuccessPopup({ show, onClose }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md mx-4 transform transition-all duration-300 scale-100">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Success!</h3>
          <p className="text-sm text-gray-500 mb-6">Lead successfully added to the system.</p>
          <button
            onClick={onClose}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

const SideBar = () => {
  const [selectedPage, setSelectedPage] = useState("Dashboard");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const handleLeadSuccess = () => {
    setShowSuccessPopup(true);
  };

  const closeSuccessPopup = () => {
    setShowSuccessPopup(false);
  };

  const renderContent = () => {
    switch (selectedPage) {
      case "Dashboard":
        return (
          <div className="p-8">
            <AnalyticsDashboard/>
          </div>
        );
      case "Create Leads":
        return (
          <div>
            <LeadForm onSuccess={handleLeadSuccess} />
          </div>
        );
      case "Show Leads":
        return(
          <div>
            <LeadsList/>
          </div>
        );
      case "Show Enrollment":
        return(
          <div>
            <EnrollmentList/>
          </div>
        );
      case "Settings":
        return (
          <div className="p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Settings</h2>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="text-gray-600 text-lg">Configure your application settings here.</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const menuItems = [
    { 
      name: "Dashboard", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"/>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v0H8v0z"/>
        </svg>
      )
    },
    { 
      name: "Create Leads", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
        </svg>
      )
    },
    {
      name: "Show Leads", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
        </svg>
      )
    },
    {
      name: "Show Enrollment", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
        </svg>
      )
    },
    { 
      name: "Settings", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
      )
    }
  ];

  return (
    <>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
          {/* Logo/Header */}
          <div className="h-16 flex items-center px-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                
     
       
                <img src="./logo.png" />


              
              </div>
              <span className="text-xl font-bold text-gray-900">Admin</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-black"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4">
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.name}>
                  <button
                    onClick={() => setSelectedPage(item.name)}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 group ${
                      selectedPage === item.name
                        ? 'bg-blue-50 text-blue-700 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span className={`${selectedPage === item.name ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
                      {item.icon}
                    </span>
                    <span className="font-medium text-sm">{item.name}</span>
                    {selectedPage === item.name && (
                      <div className="ml-auto w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* User Profile Section */}
          {/* <div className="p-4 border-t border-gray-100">
            <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">AJ</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">Adam Joe</p>
                <p className="text-xs text-gray-500 truncate">Administrator</p>
              </div>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"/>
              </svg>
            </div>
          </div> */}
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {/* Top Navigation Bar */}
          <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">{selectedPage}</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5-5 5-5h-5m-6 0L4 7l5 5-5 5h5m6-10v6a2 2 0 01-2 2H10a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2z"/>
                </svg>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>

              {/* Settings */}
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </button>

              {/* Profile */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">AJ</span>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="bg-gray-50 min-h-full">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Success Popup */}
      <SuccessPopup show={showSuccessPopup} onClose={closeSuccessPopup} />
    </>
  );
};

export default SideBar;