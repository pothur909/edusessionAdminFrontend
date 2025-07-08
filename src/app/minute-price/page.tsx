// 'use client';

// import { useState, useEffect } from 'react';

// export default function MinutesRateManager() {
//   const [rate, setRate] = useState('');
//   const [currentRate, setCurrentRate] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState('');

//   // Fetch current rate on component mount
//   useEffect(() => {
//     fetchCurrentRate();
//   }, []);

//    const baseUrl = process.env.BASE_URL ;

//   const fetchCurrentRate = async () => {
//     try {
//       setLoading(true);
//       const response = await fetch(`${baseUrl}/api/minutes-rate`);
//       const data = await response.json();
      
//       if (data.success) {
//         setCurrentRate(data.rate);
//         setRate(data.rate.toString());
//       }
//     } catch (error) {
//       setMessage('Error fetching rate');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSubmit = async () => {
//     if (!rate || isNaN(rate) || parseFloat(rate) <= 0) {
//       setMessage('Please enter a valid positive number');
//       return;
//     }

//     try {
//       setLoading(true);
      
//       // Try to update first, if fails then create
//       const method = currentRate ? 'PUT' : 'POST';
//       const response = await fetch(`${baseUrl}/api/minutes-rate`, {
//         method: method,
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ rate: parseFloat(rate) }),
//       });

//       const data = await response.json();
      
//       if (data.success) {
//         setCurrentRate(data.rate);
//         setMessage(`Rate ${currentRate ? 'updated' : 'created'} successfully!`);
//       } else {
//         setMessage(data.error || 'Failed to save rate');
//       }
//     } catch (error) {
//       setMessage('Error saving rate');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md mx-auto">
//         <div className="bg-white rounded-lg shadow-md p-8">
//           <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
//             Minutes Rate Manager
//           </h2>
          
//           {/* Current Rate Display */}
//           <div className="mb-6 p-4 bg-blue-50 rounded-lg">
//             <h3 className="text-lg font-semibold text-blue-900 mb-2">Current Rate</h3>
//             <p className="text-2xl font-bold text-blue-600">
//               {loading ? 'Loading...' : currentRate ? `₹${currentRate}` : 'No rate set'}
//             </p>
//             <p className="text-sm text-blue-700 mt-1">
//               {currentRate && `1 minute = ₹${currentRate}`}
//             </p>
//           </div>

//           {/* Input and Button */}
//           <div className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 New Rate (₹)
//               </label>
//               <input
//                 type="number"
//                 value={rate}
//                 onChange={(e) => setRate(e.target.value)}
//                 step="0.01"
//                 min="0.01"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 placeholder="Enter rate per minute"
//               />
//             </div>

//             <button
//               onClick={handleSubmit}
//               disabled={loading}
//               className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {loading ? 'Saving...' : currentRate ? 'Update Rate' : 'Create Rate'}
//             </button>
//           </div>

//           {/* Message */}
//           {message && (
//             <div className={`mt-4 p-3 rounded-md text-sm ${
//               message.includes('successfully') || message.includes('created') 
//                 ? 'bg-green-50 text-green-800' 
//                 : 'bg-red-50 text-red-800'
//             }`}>
//               {message}
//             </div>
//           )}

//           {/* Info */}
//           <div className="mt-6 p-4 bg-gray-50 rounded-lg">
//             <h4 className="text-sm font-medium text-gray-900 mb-2">How it works:</h4>
//             <div className="text-sm text-gray-600 space-y-1">
//               <div>• Set the rate per minute for your service</div>
//               <div>• This rate is used to calculate purchased minutes</div>
//               <div>• Minutes = Amount ÷ Rate</div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


'use client';

import { useState, useEffect } from 'react';

export default function MinutesRateManager() {
  const [rate, setRate] = useState('');
  const [currentRate, setCurrentRate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Fetch current rate on component mount
  useEffect(() => {
    fetchCurrentRate();
  }, []);

 const baseUrl = process.env.BASE_URL ;

  const fetchCurrentRate = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/api/minutes-rate`);
      const data = await response.json();
      
      if (data.success) {
        setCurrentRate(data.rate);
        setRate(data.rate.toString());
      }
    } catch (error) {
      setMessage('Error fetching rate');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!rate || isNaN(rate) || parseFloat(rate) <= 0) {
      setMessage('Please enter a valid positive number');
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch(`${baseUrl}/api/minutes-rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rate: parseFloat(rate) }),
      });

      const data = await response.json();
      
      if (data.success) {
        setCurrentRate(data.rate);
        setMessage('Rate added successfully!');
        setRate('');
      } else {
        setMessage(data.error || 'Failed to add rate');
      }
    } catch (error) {
      setMessage('Error adding rate');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setRate(currentRate.toString());
    setMessage('');
  };

  const handleSaveEdit = async () => {
    if (!rate || isNaN(rate) || parseFloat(rate) <= 0) {
      setMessage('Please enter a valid positive number');
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch(`${baseUrl}/api/minutes-rate`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rate: parseFloat(rate) }),
      });

      const data = await response.json();
      
      if (data.success) {
        setCurrentRate(data.rate);
        setMessage('Rate updated successfully!');
        setIsEditing(false);
        setRate('');
      } else {
        setMessage(data.error || 'Failed to update rate');
      }
    } catch (error) {
      setMessage('Error updating rate');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setRate('');
    setMessage('');
  };

//   const handleDelete = async () => {
//     if (!confirm('Are you sure you want to delete this rate?')) {
//       return;
//     }

//     try {
//       setLoading(true);
      
//       const response = await fetch(`${baseUrl}/api/minutes-rate`, {
//         method: 'DELETE',
//       });

//       const data = await response.json();
      
//       if (data.success) {
//         setCurrentRate(null);
//         setMessage('Rate deleted successfully!');
//         setRate('');
//       } else {
//         setMessage(data.error || 'Failed to delete rate');
//       }
//     } catch (error) {
//       setMessage('Error deleting rate');
//     } finally {
//       setLoading(false);
//     }
//   };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Minutes Rate Manager
          </h2>
          
          {/* Current Rate Display or Add Form */}
          {currentRate && !isEditing ? (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Current Rate</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-blue-600">₹{currentRate}</p>
                  <p className="text-sm text-blue-700 mt-1">1 minute = ₹{currentRate}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleEdit}
                    className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 text-sm"
                  >
                    Edit
                  </button>
                  {/* <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm disabled:opacity-50"
                  >
                    Delete
                  </button> */}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isEditing ? 'Edit Rate (₹)' : 'Add Rate (₹)'}
                </label>
                <input
                  type="number"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  step="0.01"
                  min="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter rate per minute"
                />
              </div>

              {isEditing ? (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSaveEdit}
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAdd}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Adding...' : 'Add Price'}
                </button>
              )}
            </div>
          )}

          {/* Message */}
          {message && (
            <div className={`mt-4 p-3 rounded-md text-sm ${
              message.includes('successfully') || message.includes('added') || message.includes('updated') || message.includes('deleted')
                ? 'bg-green-50 text-green-800' 
                : 'bg-red-50 text-red-800'
            }`}>
              {message}
            </div>
          )}

          {/* Info */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">How it works:</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <div>• Set the rate per minute for your service</div>
              <div>• This rate is used to calculate purchased minutes</div>
              <div>• Minutes = Amount ÷ Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}