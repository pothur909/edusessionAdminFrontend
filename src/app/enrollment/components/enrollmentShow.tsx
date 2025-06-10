'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import EditEnrollmentForm from './EnrollmentEdit';
import DemoLeadForm from '../../demo/components/demoForm';
import { Search, Filter, X, Calendar } from 'lucide-react';
import * as XLSX from 'xlsx';
import { FilterPanel } from '@/app/components/FilterPanel';
import { useFilter } from '@/context/FilterContext';
import { exportToExcel } from '@/utils/excelExport';

interface Enrollment {
  _id: string;
  studentName: string;
  studentPhone: string;
  parentPhone: string;
  email: string;
  board: string;
  class: string;
  subjects: string[];
  status: string;
  counsellor: string;
  city: string;
  studentId: string;
  leadId: string;
  lead?: any;
  createdAt: string;
  updatedAt: string;
}

interface Lead {
  _id: string;
  studentName: string;
  studentPhone: string;
  parentPhone: string;
  email: string;
  board: string;
  class: string;
  subjects: string[];
  status: string;
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
  city: string;
}

interface EnrollmentResponse {
  success: boolean;
  message: string;
  data?: Enrollment[];
}

interface Demo {
  _id: string;
  lead: string;
  date: string;
  time: string;
  teacher: string;
  board: string;
  class: string;
  subject: string;
  status: string;
  remarks: string[];
  createdAt: string;
  updatedAt: string;
}

interface Teacher {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  board: string;
  classes: string[];
  subjects: string[];
  isAvailable: boolean;
  isLocked: boolean;
}

interface DemoCount {
  count: number;
  demos: Demo[];
}

interface FilterState {
  searchQuery: string;
  statusFilter: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  monthFilter: string;
  yearFilter: string;
  boardFilter: string;
  classFilter: string;
  subjectFilter: string;
}

export default function EnrollmentList() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'inactive' | 'graduated' | 'dropped'>('all');
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDemoForm, setShowDemoForm] = useState(false);
  const [selectedEnrollmentForDemo, setSelectedEnrollmentForDemo] = useState<Enrollment | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [demoCounts, setDemoCounts] = useState<Record<string, number>>({});
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [boardFilter, setBoardFilter] = useState<string>("all");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [monthFilter, setMonthFilter] = useState<string>("all");
  const [yearFilter, setYearFilter] = useState<string>("all");

  const baseUrl = process.env.BASE_URL;

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const {
    filterState,
    setSearchQuery: setFilterSearchQuery,
    setDateRange: setFilterDateRange,
    setMonthFilter: setFilterMonthFilter,
    setYearFilter: setFilterYearFilter,
    setBoardFilter: setFilterBoardFilter,
    setClassFilter: setFilterClassFilter,
    setSubjectFilter: setFilterSubjectFilter,
    setStatusFilter,
    setQuickMonthSelection: setFilterQuickMonthSelection,
    setCurrentPage: setFilterCurrentPage,
    clearAllFilters: clearFilterAllFilters,
    hasActiveFilters: filterHasActiveFilters,
  } = useFilter();

  useEffect(() => {
    fetchEnrollments();
  }, [filterState.statusFilter]);

  const fetchDemoCounts = async (leadIds: string[]) => {
    try {
      // First check if we have any lead IDs
      if (!leadIds.length) return;

      // Create a map to store demo counts
      const demoCountMap: Record<string, number> = {};
      
      // Fetch demos for each lead ID
      for (const leadId of leadIds) {
        try {
          const response = await fetch(`${baseUrl}/api/demo/view/${leadId}`);
          if (!response.ok) continue;
          
          const data = await response.json();
          if (data.success && data.demos) {
            demoCountMap[leadId] = data.demos.length;
          }
        } catch (error) {
          console.error(`Error fetching demos for lead ${leadId}:`, error);
        }
      }
      
      setDemoCounts(demoCountMap);
    } catch (error) {
      console.error('Error fetching demo counts:', error);
    }
  };

  const fetchEnrollments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const url = `${baseUrl}/api/students${filterState.statusFilter !== 'all' ? `?status=${filterState.statusFilter}` : ''}`;
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
      let enrollmentsData: Enrollment[] = [];
      if (Array.isArray(dataEnroll)) {
        enrollmentsData = dataEnroll;
      } else if (dataEnroll.success && dataEnroll.data) {
        enrollmentsData = dataEnroll.data;
      }
      
      setEnrollments(enrollmentsData);
      
      // Fetch demo counts for all leads
      const leadIds = enrollmentsData.map(e => e.lead).filter(Boolean);
      if (leadIds.length > 0) {
        await fetchDemoCounts(leadIds);
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while fetching enrollments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this enrollment? This action cannot be undone.')) {
      return;
    }

    setDeleteLoading(id);
    try {
      const response = await fetch(`${baseUrl}/api/students/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        setEnrollments(prevEnrollments => prevEnrollments.filter(enrollment => enrollment._id !== id));
        alert('Enrollment deleted successfully');
      } else {
        alert(data.message || 'Failed to delete enrollment');
      }
    } catch (error) {
      console.error('Error deleting enrollment:', error);
      alert('An error occurred while deleting the enrollment');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleEditClick = async (enrollment: Enrollment) => {
    // Navigate to the edit page
    window.location.href = `/enrollment/edit/${enrollment._id}`;
  };

  const handleEditComplete = async () => {
    await fetchEnrollments();
    setShowEditForm(false);
    setSelectedEnrollment(null);
  };

  const handleEditCancel = () => {
    setShowEditForm(false);
    setSelectedEnrollment(null);
  };

  // Demo form handlers
  const handleBookDemoClick = async (enrollment: Enrollment) => {
    try {
      setIsLoading(true);
      setSelectedEnrollmentForDemo(enrollment);
      
      // Fetch teachers for the demo - use the first subject if available
      const subject = enrollment.subjects?.[0] || '';
      const teachersResponse = await fetch(`${baseUrl}/api/teachers?board=${enrollment.board}&class=${enrollment.class}&subject=${subject}`);
      const teachersData = await teachersResponse.json();
      
      if (teachersData.success && teachersData.teachers) {
        setTeachers(teachersData.teachers);
      }
      
      // Create a lead object from enrollment data
      const leadData: Lead = {
        _id: enrollment.leadId || enrollment._id,
        studentName: enrollment.studentName,
        studentPhone: enrollment.studentPhone,
        parentPhone: enrollment.parentPhone,
        email: enrollment.email,
        board: enrollment.board,
        class: enrollment.class,
        subjects: enrollment.subjects || [],
        status: 'enrolled',
        notes: '',
        createdAt: enrollment.createdAt,
        updatedAt: enrollment.updatedAt,
        leadSource: '',
        classesPerWeek: 0,
        courseInterested: '',
        modeOfContact: '',
        preferredTimeSlots: '',
        counsellor: enrollment.counsellor,
        sessionEndDate: '',
        remarks: '',
        city: enrollment.city || ''
      };
      
      setSelectedEnrollmentForDemo({
        ...enrollment,
        lead: leadData
      });
      setShowDemoForm(true);
    } catch (error) {
      console.error('Error preparing demo form:', error);
      alert('Failed to prepare demo form. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoComplete = () => {
    setSelectedEnrollmentForDemo(null);
    setShowDemoForm(false);
    // Optionally refresh enrollments if needed
    // fetchEnrollments();
  };

  const handleDemoCancel = () => {
    setSelectedEnrollmentForDemo(null);
    setShowDemoForm(false);
  };

  const filteredEnrollments = enrollments.filter(enrollment => {
    const searchLower = filterState.searchQuery.toLowerCase();
    const studentName = enrollment.studentName?.toLowerCase() || '';
    const phoneNumber = enrollment.studentPhone || '';
    const email = enrollment.email?.toLowerCase() || '';

    const matchesSearch = 
      studentName.includes(searchLower) ||
      phoneNumber.includes(searchLower) ||
      email.includes(searchLower);

    const matchesStatus = 
      filterState.statusFilter === "all" ||
      (enrollment.status?.toLowerCase() === filterState.statusFilter.toLowerCase());

    // Date Range filter
    const enrollmentDate = new Date(enrollment.createdAt);
    const matchesDateRange = (
      !filterState.dateRange.startDate || 
      enrollmentDate >= new Date(filterState.dateRange.startDate) && 
      (!filterState.dateRange.endDate || enrollmentDate <= new Date(filterState.dateRange.endDate + "T23:59:59"))
    );

    // Month filter
    const enrollmentMonth = enrollmentDate.getMonth() + 1;
    const matchesMonth = filterState.monthFilter === "all" || enrollmentMonth.toString() === filterState.monthFilter;

    // Year filter 
    const enrollmentYear = enrollmentDate.getFullYear();
    const matchesYear = filterState.yearFilter === "all" || enrollmentYear.toString() === filterState.yearFilter;

    // Board filter
    const matchesBoard = filterState.boardFilter === "all" || enrollment.board === filterState.boardFilter;
    
    // Class filter
    const matchesClass = filterState.classFilter === "all" || enrollment.class === filterState.classFilter;

    // Subject filter
    const matchesSubject = filterState.subjectFilter === "all" || 
      (enrollment.subjects && enrollment.subjects.includes(filterState.subjectFilter));

    return (
      matchesSearch &&
      matchesStatus &&
      matchesDateRange &&
      matchesMonth &&
      matchesYear &&
      matchesBoard &&
      matchesClass &&
      matchesSubject
    );
  });

  const months = [
    { value: 'all', label: 'All Months' },
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  const clearAllFilters = () => {
    setFilterSearchQuery('');
    setFilterDateRange({ 
      startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0], 
      endDate: new Date().toISOString().split('T')[0] 
    });
    setFilterMonthFilter('all');
    setFilterYearFilter('all');
    setFilterBoardFilter('all');
    setFilterClassFilter('all');
    setFilterSubjectFilter('all');
    setFilterStatusFilter('all');
    setShowAdvancedFilters(false);
  };
  
  const resetFilters = () => {
    clearAllFilters();
    setShowAdvancedFilters(false);
  };

  const applyFilters = () => {
    // Filters are applied in real-time, just close the panel
    setShowAdvancedFilters(false);
  };

  const hasActiveFilters = () => {
    return filterState.searchQuery || 
           filterState.dateRange.startDate || 
           filterState.dateRange.endDate || 
           filterState.monthFilter !== 'all' || 
           filterState.yearFilter !== 'all' || 
           filterState.boardFilter !== 'all' || 
           filterState.classFilter !== 'all' || 
           filterState.subjectFilter !== 'all' || 
           filterState.quickMonthSelection !== 'all' ||
           filterState.statusFilter !== 'all';
  };

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

  const handleExportExcel = () => {
    const columns = [
      { key: 'studentName', label: 'Student Name' },
      { key: 'phoneNumber', label: 'Phone Number' },
      { key: 'email', label: 'Email' },
      { key: 'board', label: 'Board' },
      { key: 'class', label: 'Class' },
      { key: 'subject', label: 'Subject' },
      { key: 'status', label: 'Status' },
      { key: 'createdAt', label: 'Created At' }
    ];

    const data = filteredEnrollments.map(enrollment => ({
      studentName: enrollment.studentName,
      phoneNumber: enrollment.studentPhone,
      email: enrollment.email,
      board: enrollment.board,
      class: enrollment.class,
      subject: enrollment.subject,
      status: enrollment.status,
      createdAt: new Date(enrollment.createdAt).toLocaleDateString()
    }));

    exportToExcel(data, columns, {
      filename: 'enrollments.xlsx',
      sheetName: 'Enrollments'
    });
  };

  // Get unique values for filters
  const uniqueBoards = [...new Set(enrollments.map(enrollment => enrollment.board).filter(Boolean))];
  const uniqueClasses = [...new Set(enrollments.map(enrollment => enrollment.class).filter(Boolean))];
  const uniqueSubjects = [...new Set(enrollments.flatMap(enrollment => enrollment.subjects).filter(Boolean))];

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
      {!showEditForm && !showDemoForm && (
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Enrollments</h1>
          <button
            onClick={handleExportExcel}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Download Data
          </button>
        </div>
      )}

      {/* Filter Panel */}
      {!showEditForm && !showDemoForm && (
        <FilterPanel
          showAdvancedFilters={showAdvancedFilters}
          setShowAdvancedFilters={setShowAdvancedFilters}
          months={months}
          uniqueBoards={uniqueBoards}
          uniqueClasses={uniqueClasses}
          uniqueSubjects={uniqueSubjects}
          statusOptions={[
            { value: 'all', label: 'All Status' },
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
            { value: 'graduated', label: 'Graduated' },
            { value: 'dropped', label: 'Dropped' }
          ]}
          onApplyFilters={() => setShowAdvancedFilters(false)}
        />
      )}

      {/* Status Tabs */}
      {!showEditForm && !showDemoForm && (
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
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
                  setStatusFilter(tab.key);
                  setFilterCurrentPage(1);
                }}
                className={`${
                  filterState.statusFilter === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Demo Form */}
      {showDemoForm && selectedEnrollmentForDemo ? (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-black">
              Schedule Demo - {selectedEnrollmentForDemo.studentName}
            </h2>
            <button
              onClick={handleDemoCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <DemoLeadForm
            lead={selectedEnrollmentForDemo.lead}
            onComplete={handleDemoComplete}
            onCancel={handleDemoCancel}
            teachers={teachers}
          />
        </div>
      ) : 
      
      /* Edit Form */
      showEditForm && selectedEnrollment ? (
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
          <EditEnrollmentForm
            studentId={selectedEnrollment._id}
            onComplete={handleEditComplete}
            onCancel={handleEditCancel}
          />
        </div>
      ) : (
        <>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Academic</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Demos</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentEnrollments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                        No enrollments found
                      </td>
                    </tr>
                  ) : (
                    currentEnrollments.map((enrollment) => (
                      <tr key={enrollment._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{enrollment.studentName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <div>Phone: {enrollment.studentPhone}</div>
                            <div>Email: {enrollment.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <div>Board: {enrollment.board}</div>
                            <div>Class: {enrollment.class}</div>
                            <div>Subjects: {enrollment.subjects?.join(', ') || 'No subjects'}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(enrollment.status || 'active')}`}>
                            {(enrollment.status || 'Active').charAt(0).toUpperCase() + (enrollment.status || 'active').slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {demoCounts[enrollment.leadId] ? (
                            <div className="font-medium">{demoCounts[enrollment.leadId]} demos</div>
                          ) : (
                            <span>0 demos</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex flex-col items-start gap-1">
                            <button
                              onClick={() => handleEditClick(enrollment)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleBookDemoClick(enrollment)}
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
          {filteredEnrollments.length > itemsPerPage && (
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
    </div>
  );
}