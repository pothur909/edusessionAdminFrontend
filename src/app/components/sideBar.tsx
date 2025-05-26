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




'use client';

import { useState } from "react";
import LeadForm from "../leads/components/leadAdd";
import LeadsList from "../leads/components/leadShow";

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
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome to the Dashboard</h2>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="text-gray-600 text-lg mb-4">This is the dashboard page where you can view your analytics and overview.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900">Total Leads</h3>
                  <p className="text-2xl font-bold text-blue-600">156</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900">Active Students</h3>
                  <p className="text-2xl font-bold text-green-600">89</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-900">This Month</h3>
                  <p className="text-2xl font-bold text-purple-600">23</p>
                </div>
              </div>
            </div>
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
            )
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
    { name: "Dashboard", icon: "📊" },
    { name: "Create Leads", icon: "👥" },
    {name: "Show Leads", icon:"👥"},
    { name: "Settings", icon: "⚙️" }
  ];

  return (
    <>
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-lg">
          {/* Logo/Header */}
          <div className="h-16 flex items-center justify-center border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="text-xl font-bold text-gray-800">Admin Portal</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="mt-8 px-4">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.name}>
                  <button
                    onClick={() => setSelectedPage(item.name)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                      selectedPage === item.name
                        ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-medium">{item.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* User Profile Section */}
          {/* <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-600 font-medium">M</span>
              </div>
              <div>
                <p className="font-medium text-gray-800">Maria</p>
                <p className="text-sm text-gray-500">Administrator</p>
              </div>
            </div>
          </div> */}
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-gray-50">
          {renderContent()}
        </main>
      </div>

      {/* Success Popup */}
      <SuccessPopup show={showSuccessPopup} onClose={closeSuccessPopup} />
    </>
  );
};

export default SideBar;