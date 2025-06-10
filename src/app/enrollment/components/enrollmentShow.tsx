'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import EditEnrollmentForm from './enrollmentEdit';

interface Enrollment {
  _id: string;
  studentName: string;
  phoneNumber: string;
  parentsPhoneNumbers: string[];
  email: string;
  age: number;
  city: string;
  address: string;
  counsellor: string;
  studentUsername: string;
  password: string;
  studentRating: number;
  createdAt: string;
  updatedAt: string;
  status?: 'active' | 'inactive' | 'graduated' | 'dropped';
  subjects?: {
    _id?: string;
    student: string;
    board: string;
    class: string;
    subject: string;
    numberOfClassesPerWeek: number;
    teacher: string;
    timeSlots: string[];
    paymentDetails: {
      classAmount: number;
      amountPaid: number;
      lastPayments: {
        paymentId: string;
        date: Date;
        amount: number;
      }[];
    };
    remarks: string[];
  }[];
}

interface EnrollmentResponse {
  success: boolean;
  message: string;
  data?: Enrollment[];
}

export default function EnrollmentList() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'inactive' | 'graduated' | 'dropped'>('all');
  // const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [editingEnrollment, setEditingEnrollment] = useState<Enrollment | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const baseUrl =process.env. BASE_URL;

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const router = useRouter();

  useEffect(() => {
    fetchEnrollments();
  }, [activeTab]);

  const fetchEnrollments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const url = `${baseUrl}/api/students${activeTab !== 'all' ? `?status=${activeTab}` : ''}`;
      console.log('Fetching enrollments from:', url);
      
      const response = await fetch(url);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        if (response.status === 0 || response.status === 503) {
          throw new Error('Unable to connect to the server. Please check if the backend server is running.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    
      const dataEnroll = await response.json();
      console.log('Response data:', dataEnroll);
      
      
      // Handle both array response and success/message/data structure
      if (Array.isArray(dataEnroll)) {
        setEnrollments(dataEnroll);
      } else if (dataEnroll.success && dataEnroll.data) {
        setEnrollments(dataEnroll.data);
      } else {
        setEnrollments([]);
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while fetching enrollments');
    } finally {
      setIsLoading(false);
    }
  };

  // const handleDeleteEnrollment = async (enrollmentId: string) => {
  //   if (!confirm('Are you sure you want to delete this enrollment? This action cannot be undone.')) {
  //     return;
  //   }

  //   try {
  //     setDeleteLoading(enrollmentId);
  //     const response = await fetch(`${baseUrl}/api/students/${enrollmentId}`, {
  //       method: 'DELETE',
  //     });

  //     const data = await response.json();
  //     if (data.success) {
  //       setEnrollments(prevEnrollments => prevEnrollments.filter(enrollment => enrollment._id !== enrollmentId));
  //       alert('Enrollment deleted successfully');
  //     } else {
  //       alert(data.message || 'Failed to delete enrollment');
  //     }
  //   } catch (error) {
  //     console.error('Error deleting enrollment:', error);
  //     alert('An error occurred while deleting the enrollment');
  //   } finally {
  //     setDeleteLoading(null);
  //   }
  // };

  const handleEditClick = (enrollment: Enrollment) => {
    setEditingEnrollment(enrollment);
    setShowEditForm(true);
  };

  const handleEditComplete = () => {
    setEditingEnrollment(null);
    setShowEditForm(false);
    fetchEnrollments();
  };

  const handleEditCancel = () => {
    setEditingEnrollment(null);
    setShowEditForm(false);
  };

  const handleViewClick = async (enrollment: Enrollment) => {
    try {
      console.log('Fetching details for enrollment:', enrollment._id);
      // Fetch complete enrollment details including subjects
      const response = await fetch(`${baseUrl}/api/students/${enrollment._id}`);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to fetch enrollment details: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Fetched enrollment data:', data);
      
      if (!data.data) {
        throw new Error('No data received from the server');
      }
      
      setSelectedEnrollment(data.data);
      setShowViewModal(true);
    } catch (error) {
      console.error('Error in handleViewClick:', error);
      alert(error instanceof Error ? error.message : 'Failed to fetch enrollment details');
    }
  };

  const filteredEnrollments = enrollments.filter((enrollment) => {
    const searchLower = searchQuery.toLowerCase();
    const studentName = enrollment.studentName?.toLowerCase() || '';
    const phoneNumber = enrollment.phoneNumber || '';
    const email = enrollment.email?.toLowerCase() || '';
    const studentUsername = enrollment.studentUsername?.toLowerCase() || '';

    const matchesSearch =
      studentName.includes(searchLower) ||
      phoneNumber.includes(searchQuery) ||
      email.includes(searchLower) ||
      studentUsername.includes(searchLower) ||
      enrollment.parentsPhoneNumbers.some(phone => phone.includes(searchQuery));

    const matchesTab = activeTab === 'all' || 
      (enrollment.status?.toLowerCase() === activeTab.toLowerCase());

    return matchesSearch && matchesTab;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredEnrollments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEnrollments = filteredEnrollments.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800';
      case 'graduated':
        return 'bg-blue-100 text-blue-800';
      case 'dropped':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRatingStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? 'text-yellow-400' : 'text-gray-300'}>
          ★
        </span>
      );
    }
    return stars;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-black m-9">
      {/* Edit Form - You would need to create an EditEnrollmentForm component */}
      {showEditForm && editingEnrollment ? (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-black">Edit Enrollment</h2>
            <button
              onClick={handleEditCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <EditEnrollmentForm studentId={editingEnrollment._id} onComplete={handleEditComplete} />
          {/* You would import and use EditEnrollmentForm here *
          {/* <div className="p-4 bg-gray-100 rounded">
            <p>Edit Enrollment Form Component would go here</p>
            <button 
              onClick={handleEditComplete}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Save Changes
            </button>
          </div> */}
        </div>
      ) : (
        <>
          {/* Search */}
          <div className="flex space-x-4 text-black m-5">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name, phone, email, or username..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Status Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {[
                { key: 'all', label: 'All Students' },
                { key: 'active', label: 'Active' },
                { key: 'inactive', label: 'Inactive' },
                { key: 'graduated', label: 'Graduated' },
                { key: 'dropped', label: 'Dropped' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key as any);
                    setCurrentPage(1);
                  }}
                  className={`${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Results summary */}
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredEnrollments.length)} of {filteredEnrollments.length} enrollments
          </div>

          {/* Enrollments Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrolled</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book a Demo</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentEnrollments.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                        No enrollments found
                      </td>
                    </tr>
                  ) : (
                    currentEnrollments.map((enrollment) => (
                      <tr key={enrollment._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{enrollment.studentName}</div>
                          <div className="text-sm text-gray-500">Age: {enrollment.age}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">Student: {enrollment.phoneNumber}</div>
                          <div className="text-sm text-gray-900">
                            Parents: {enrollment.parentsPhoneNumbers.join(', ') || 'Not provided'}
                          </div>
                          <div className="text-sm text-gray-500">{enrollment.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{enrollment.city}</div>
                          <div className="text-sm text-gray-500">{enrollment.address}</div>
                          <div className="text-sm text-gray-500">Counsellor: {enrollment.counsellor}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{enrollment.studentUsername}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getRatingStars(enrollment.studentRating)}
                            <span className="ml-2 text-sm text-gray-600">({enrollment.studentRating}/5)</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(enrollment.status || 'active')}`}>
                            {(enrollment.status || 'Active').charAt(0).toUpperCase() + (enrollment.status || 'active').slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(enrollment.createdAt).toLocaleDateString('en-GB')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex flex-col items-start gap-1">
                            <button
                              onClick={() => handleViewClick(enrollment)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleEditClick(enrollment)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Edit
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex flex-col items-start gap-1">
                            <button
                              onClick={() => handleBookDemoClick()}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Demo
                            </button>
                          
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(endIndex, filteredEnrollments.length)}</span> of{' '}
                    <span className="font-medium">{filteredEnrollments.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                          page === currentPage
                            ? 'z-10 bg-indigo-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                            : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {showViewModal && selectedEnrollment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-4/5 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-900">Enrollment Details</h3>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedEnrollment(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <h4 className="font-semibold text-gray-700">Student Information</h4>
                <p><span className="font-medium">Name:</span> {selectedEnrollment.studentName}</p>
                <p><span className="font-medium">Age:</span> {selectedEnrollment.age}</p>
                <p><span className="font-medium">Phone:</span> {selectedEnrollment.phoneNumber}</p>
                <p><span className="font-medium">Parents Phone:</span> {selectedEnrollment.parentsPhoneNumbers?.join(', ') || 'Not provided'}</p>
                <p><span className="font-medium">Email:</span> {selectedEnrollment.email}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700">Location Details</h4>
                <p><span className="font-medium">City:</span> {selectedEnrollment.city}</p>
                <p><span className="font-medium">Address:</span> {selectedEnrollment.address}</p>
                <p><span className="font-medium">Counsellor:</span> {selectedEnrollment.counsellor}</p>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold text-gray-700 mb-2">Account Information</h4>
              <p><span className="font-medium">Username:</span> {selectedEnrollment.studentUsername}</p>
              <p><span className="font-medium">Rating:</span> {selectedEnrollment.studentRating}/5</p>
              <p><span className="font-medium">Status:</span> {selectedEnrollment.status || 'Active'}</p>
              <p><span className="font-medium">Enrolled On:</span> {new Date(selectedEnrollment.createdAt).toLocaleDateString()}</p>
            </div>

            {selectedEnrollment.subjects && selectedEnrollment.subjects.length > 0 ? (
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Subjects</h4>
                <div className="space-y-4">
                  {selectedEnrollment.subjects.map((subject, index) => (
                    <div key={subject._id || index} className="border p-4 rounded-lg bg-gray-50">
                      <h5 className="font-medium text-lg mb-2">{subject.subject}</h5>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p><span className="font-medium">Board:</span> {subject.board}</p>
                          <p><span className="font-medium">Class:</span> {subject.class}</p>
                          <p><span className="font-medium">Classes per Week:</span> {subject.numberOfClassesPerWeek}</p>
                          <p><span className="font-medium">Teacher:</span> {subject.teacher}</p>
                        </div>
                        <div>
                          <p><span className="font-medium">Time Slots:</span></p>
                          <ul className="list-disc list-inside">
                            {subject.timeSlots?.map((slot, i) => (
                              <li key={i}>{slot}</li>
                            ))}
                          </ul>
                          <p><span className="font-medium">Class Amount:</span> ₹{subject.paymentDetails?.classAmount || 0}</p>
                          <p><span className="font-medium">Amount Paid:</span> ₹{subject.paymentDetails?.amountPaid || 0}</p>
                        </div>
                      </div>
                      {subject.remarks && subject.remarks.length > 0 && (
                        <div className="mt-2">
                          <p className="font-medium">Remarks:</p>
                          <ul className="list-disc list-inside">
                            {subject.remarks.map((remark, i) => (
                              <li key={i}>{remark}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-center py-4">
                No subjects found for this enrollment.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}