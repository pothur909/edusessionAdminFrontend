"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import EditLeadForm from './leadEdit';
import DemoLeadForm from '../../demo/components/demoForm';
import EnrollmentForm from '@/app/enrollment/components/enrollmentAddForm';

interface Demo {
  _id: string;
  lead: string;
  date: string;
  time: string;
  teacher: string;
  board: string;
  class: string;
  subject: string;
  status:
    | "demo_scheduled"
    | "demo_completed"
    | "demo_cancelled"
    | "demo_no_show"
    | "demo_rescheduled"
    | "demo_rescheduled_cancelled"
    | "demo_rescheduled_completed"
    | "demo_rescheduled_no_show";
  remarks: string;
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
  status:
    | "new"
    | "contacted"
    | "converted"
    | "not_interested"
    | "demo_scheduled"
    | "demo_completed"
    | "demo_cancelled"
    | "demo_no_show"
    | "demo_rescheduled"
    | "demo_rescheduled_cancelled"
    | "demo_rescheduled_completed"
    | "demo_rescheduled_no_show"
    | "no_response_from_Lead";
  notes: string;
  createdAt: string;
  updatedAt: string;
  leadSource: string;
  classesPerWeek: number;
  courseInterested: string;
  modeOfContact: string;
  counsellor: string;
  sessionEndDate?: string;
  remarks: string;
  existingStudentId?: string; // Add this for existing student reference
  preferredTimeSlots?: string; // Add this
  city?: string; // Add this
  demo?: Demo | null; // Add this for demo data
}

interface DemoResponse {
  success: boolean;
  message: string;
  demos?: Demo[];
  lead?: {
    studentName: string;
    studentPhone: string;
    parentPhone: string;
    city: string;
    email: string;
    board: string;
    class: string;
  };
}

interface Subject {
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
}

interface Enrollment {
  _id: string;
  lead: string;
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
  subjects?: Subject[]; // Add this line
}

interface EnrollmentResponse{
  success: boolean;
  message: string;
  demos?: Demo[];
  enroll?: Enrollment[];
  lead?: {
    studentName: string;
    studentPhone: string;
    parentPhone: string;
    city: string;
    email: string;
    board: string;
    class: string;
  };
}

export default function LeadsList() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<
    | "all"
    | "new"
    | "contacted"
    | "converted"
    | "not_interested"
    | "demo_scheduled"
    | "demo_completed"
    | "demo_cancelled"
    | "demo_no_show"
    | "demo_rescheduled"
    | "demo_rescheduled_cancelled"
    | "demo_rescheduled_completed"
    | "demo_rescheduled_no_show"
    | "no_response_from_Lead"
  >("all");
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [bookDemoForm, setBookDemoForm] = useState(false);

  // enroll use state
  const [enrolledStudents, setEnrolledStudents] = useState<Enrollment[]>([]);
  const [showEnrollmentForm, setShowEnrollmentForm] = useState(false);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const router = useRouter();

  useEffect(() => {
    fetchLeads();
    fetchEnrolledStudents(); // Add this line to fetch enrolled students on component mount
  }, [activeTab]);

  const fetchLeads = async () => {
    try {
      const response = await fetch(
        `http://localhost:6969/api/leads/viewleads${
          activeTab !== "all" ? `?status=${activeTab}` : ""
        }`
      );
      const data = await response.json();
      if (data.success) {
        setLeads(data.data);
      } else {
        setError(data.message || "Failed to fetch leads");
      }
    } catch (error) {
      setError("An error occurred while fetching leads");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEnrolledStudents = async () => {
    try {
      const response = await fetch("http://localhost:6969/api/students");
      const data = await response.json();
      if (data.success) {
        setEnrolledStudents(data.data || []);
      }
    } catch (error) {
      console.log('Error fetching enrolled students:', error);
    }
  };

  // New function to fetch specific student by ID
  const fetchStudentById = async (studentId: string): Promise<Enrollment | null> => {
    try {
      const response = await fetch(`http://localhost:6969/api/students/${studentId}`);
      const data = await response.json();
      if (data.success) {
        return data.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching student by ID:', error);
      return null;
    }
  };

  const isStudentEnrolled = (lead: Lead) => {
    return enrolledStudents.some(student => 
      (student.email && student.email.toLowerCase() === lead.email?.toLowerCase()) || 
      (student.phoneNumber && student.phoneNumber === lead.studentPhone)
    );
  };

  const handleDeleteLead = async (leadId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this lead? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setDeleteLoading(leadId);
      const response = await fetch(
        `http://localhost:6969/api/leads/deleteled/${leadId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();
      if (data.success) {
        setLeads((prevLeads) =>
          prevLeads.filter((lead) => lead._id !== leadId)
        );
        alert("Lead deleted successfully");
      } else {
        alert(data.message || "Failed to delete lead");
      }
    } catch (error) {
      console.error("Error deleting lead:", error);
      alert("An error occurred while deleting the lead");
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleEditClick = (lead: Lead) => {
    setEditingLead(lead);
    setShowEditForm(true);
  };

  const handleBookDemoClick = async (lead: Lead) => {
    try {
      console.log("Original lead data:", lead);

      // Initialize demo data with lead information
      const demoData: Partial<Demo> = {
        lead: lead._id,
        teacher: "",
        date: "",
        time: "",
        subject: "",
        status: "demo_scheduled",
        remarks: "",
        board: lead.board || "",
        class: lead.class || "",
      };

      // Try to fetch existing demo data, but don't throw error if none exists
      try {
        const response = await fetch(
          `http://localhost:6969/api/demo/view/${lead._id}`
        );
        const data: DemoResponse = await response.json();
        console.log("Demo data from API:", data);

        if (data.success && data.demos && data.demos.length > 0) {
          const existingDemo = data.demos[0]; // Get the most recent demo
          Object.assign(demoData, {
            _id: existingDemo._id,
            teacher: existingDemo.teacher || "",
            date: existingDemo.date
              ? new Date(existingDemo.date).toISOString().split("T")[0]
              : "",
            time: existingDemo.time || "",
            subject: existingDemo.subject || "",
            status: existingDemo.status || "demo_scheduled",
            remarks: existingDemo.remarks || "",
          });
        }
      } catch (error) {
        console.log("No existing demo found, proceeding with new demo");
      }

      console.log("Demo data being set:", demoData);
      setEditingLead(lead);
      setBookDemoForm(true);
    } catch (error) {
      console.error("Error in handleBookDemoClick:", error);
      alert("Error preparing demo form. Please try again.");
    }
  };

  const handleEditComplete = () => {
    setEditingLead(null);
    setShowEditForm(false);
    fetchLeads();
  };

  const handleEditCancel = () => {
    setEditingLead(null);
    setShowEditForm(false);
  };

  const handleEnrollClick = async (lead: Lead) => {
    try {
      console.log('Original lead data:', lead);
      setEnrollmentLoading(true);
      
      // Fetch both enrollment and demo data in parallel
      try {
        const [enrollmentResponse, demoResponse] = await Promise.all([
          fetch('http://localhost:6969/api/students'),
          fetch(`http://localhost:6969/api/demo/view/${lead._id}`)
        ]);
  
        const enrollmentData = await enrollmentResponse.json();
        const demoData: DemoResponse = await demoResponse.json();
        
        console.log('Enrollment response:', enrollmentData);
        console.log('Demo response:', demoData);
        
        // Check if enrollment data is an array
        if (Array.isArray(enrollmentData)) {
          // Find student by lead ID or matching contact info
          const existingStudent = enrollmentData.find((student: Enrollment) => 
            student.lead === lead._id || 
            (student.email && student.email.toLowerCase() === lead.email?.toLowerCase()) ||
            (student.phoneNumber && student.phoneNumber === lead.studentPhone)
          );
  
          if (existingStudent) {
            console.log('Found existing student:', existingStudent);
            
            // Fetch subjects for this student
            try {
              const subjectsResponse = await fetch(`http://localhost:6969/api/subject/${existingStudent._id}`);
              const subjectsData = await subjectsResponse.json();
              console.log('Subjects response:', subjectsData);

              // If enrollment exists, set it for editing with demo data and subjects
              setEditingLead({ 
                ...lead, 
                existingStudentId: existingStudent._id,
                city: existingStudent.city || lead.city || '',
                preferredTimeSlots: lead.preferredTimeSlots || '',
                demo: demoData.demos?.[0] || null,
                subjects: subjectsData.data || [] // Add subjects data
              });
            } catch (error) {
              console.error('Error fetching subjects:', error);
              // Still set the lead with existing student data even if subjects fetch fails
              setEditingLead({ 
                ...lead, 
                existingStudentId: existingStudent._id,
                city: existingStudent.city || lead.city || '',
                preferredTimeSlots: lead.preferredTimeSlots || '',
                demo: demoData.demos?.[0] || null
              });
            }
          } else {
            console.log('No existing student found, proceeding with new enrollment');
            setEditingLead({
              ...lead,
              city: lead.city || '',
              preferredTimeSlots: lead.preferredTimeSlots || '',
              demo: demoData.demos?.[0] || null
            });
          }
        } else {
          console.log('Invalid enrollment response format, proceeding with new enrollment');
          setEditingLead({
            ...lead,
            city: lead.city || '',
            preferredTimeSlots: lead.preferredTimeSlots || '',
            demo: demoData.demos?.[0] || null
          });
        }
      } catch (error) {
        console.log('Error fetching data, proceeding with new enrollment:', error);
        setEditingLead({
          ...lead,
          city: lead.city || '',
          preferredTimeSlots: lead.preferredTimeSlots || '',
          demo: null
        });
      }
  
      setShowEnrollmentForm(true);
      
    } catch (error) {
      console.error("Error in handleEnrollClick", error);
      alert('Error preparing enrollment form. Please try again.');
    } finally {
      setEnrollmentLoading(false);
    }
  };

  const handleEnrollmentComplete = async () => {
    try {
      // Refresh both leads and enrolled students
      await Promise.all([
        fetchLeads(),
        fetchEnrolledStudents()
      ]);
      
      // Reset form state
      setEditingLead(null);
      setShowEnrollmentForm(false);
    } catch (error) {
      console.error('Error refreshing data after enrollment:', error);
      // Still reset the form even if refresh fails
      setEditingLead(null);
      setShowEnrollmentForm(false);
    }
  };

  const handleEnrollmentCancel = () => {
    setEditingLead(null);
    setShowEnrollmentForm(false);
  };

  const filteredLeads = leads.filter((lead) => {
    const searchLower = searchQuery.toLowerCase();
    const studentName = lead.studentName?.toLowerCase() || "";
    const studentPhone = lead.studentPhone || "";
    const email = lead.email?.toLowerCase() || "";
    const parentPhone = lead.parentPhone || "";

    const matchesSearch =
      studentName.includes(searchLower) ||
      studentPhone.includes(searchQuery) ||
      email.includes(searchLower) ||
      parentPhone.includes(searchQuery);

    const matchesTab =
      activeTab === "all" || lead.status?.toLowerCase() === activeTab;

    return matchesSearch && matchesTab;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLeads = filteredLeads.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-yellow-100 text-yellow-800";
      case "contacted":
        return "bg-blue-100 text-blue-800";
      case "converted":
        return "bg-green-100 text-green-800";
      case "not_interested":
        return "bg-red-100 text-red-800";
      case "demo_scheduled":
        return "bg-purple-100 text-purple-800";
      case "demo_completed":
        return "bg-green-100 text-green-800";
      case "demo_cancelled":
        return "bg-red-100 text-red-800";
      case "demo_no_show":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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
      {/* Edit Form */}
      {showEditForm && editingLead ? (
        <div className="p-3">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl font-bold text-black">Edit Lead</h2>
            <button
              onClick={handleEditCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <EditLeadForm lead={editingLead} onComplete={handleEditComplete} />
        </div>
      ) : bookDemoForm && editingLead ? (
        <div className="p-3">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-black">
              Schedule Demo - {editingLead.studentName}
            </h2>
            <h2 className="text-2xl font-bold text-black">Name : {editingLead.studentName}</h2>
            <button
              onClick={() => {
                setBookDemoForm(false);
                setEditingLead(null);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <DemoLeadForm
            lead={editingLead}
            onComplete={() => {
              setBookDemoForm(false);
              setEditingLead(null);
              fetchLeads();
            }}
            onCancel={() => {
              setBookDemoForm(false);
              setEditingLead(null);
            }}
          />
        </div>
      ) : showEnrollmentForm && editingLead ? (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-black">
              {editingLead.existingStudentId ? 'Update Student' : 'Enroll Student'} - {editingLead.studentName}
            </h2>
            <button
              onClick={handleEnrollmentCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <EnrollmentForm 
            lead={editingLead} 
            onComplete={handleEnrollmentComplete}
            onCancel={handleEnrollmentCancel}
          />
        </div>
      ) : (
        <>
          {/* Search */}
          <div className="flex space-x-4 text-black m-5">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name, phone, or email..."
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
                { key: "all", label: "All Leads" },
                { key: "new", label: "New" },
                { key: "contacted", label: "Contacted" },
                { key: "converted", label: "Converted" },
                { key: "not_interested", label: "Not Interested" },
                { key: "demo_scheduled", label: "Demo Scheduled" },
                { key: "demo_completed", label: "Demo Completed" },
                { key: "demo_cancelled", label: "Demo Cancelled" },
                { key: "demo_no_show", label: "Demo No Show" },
                { key: "no_response_from_Lead", label: "No Response" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key as any);
                    setCurrentPage(1);
                  }}
                  className={`${
                    activeTab === tab.key
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Results summary */}
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1} to{" "}
            {Math.min(endIndex, filteredLeads.length)} of {filteredLeads.length}{" "}
            leads
          </div>

          {/* Leads Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Demo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Demo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrollment</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentLeads.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-4 text-center text-gray-500"
                      >
                      <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                        No leads found
                      </td>
                    </tr>
                  ) : (
                    currentLeads.map((lead) => {
                      const leadData: Lead = {
                        ...lead,
                        subjects: lead.subjects || [],
                        board: lead.board || "",
                        class: lead.class || "",
                        status: lead.status || "new",
                      };
                      return (
                        <tr key={lead._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {lead.studentName}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              Student: {lead.studentPhone}
                            </div>
                            <div className="text-sm text-gray-900">
                              Parent: {lead.parentPhone || "Not provided"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {lead.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {lead.board} - Class {lead.class}
                            </div>
                            <div className="text-sm text-gray-500">
                              {lead.subjects.join(", ")}
                            </div>
                            <div className="text-sm text-gray-500">
                              Source: {lead.leadSource}
                            </div>
                            <div className="text-sm text-gray-900">{lead.board} - Class {lead.class}</div>
                            <div className="text-sm text-gray-500">{lead.subjects.join(', ')}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                lead.status
                              )}`}
                            >
                              {lead.status.charAt(0).toUpperCase() +
                                lead.status.slice(1).replace(/_/g, " ")}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(lead.createdAt).toLocaleDateString('en-GB')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex flex-col items-start gap-1">
                              <button
                                onClick={() => handleEditClick(lead)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteLead(lead._id)}
                                disabled={deleteLoading === lead._id}
                                className="text-red-600 hover:text-red-900 disabled:opacity-50"
                              >
                                {deleteLoading === lead._id
                                  ? "Deleting..."
                                  : "Delete"}
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleBookDemoClick(lead)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Book Demo
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {isStudentEnrolled(lead) ? (
                              <div className="flex flex-col items-end gap-1">
                                <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                                  Enrolled
                                </span>
                                <button
                                  onClick={() => handleEnrollClick(lead)}
                                  disabled={enrollmentLoading}
                                  className="text-blue-600 hover:text-blue-900 text-xs disabled:opacity-50"
                                >
                                  {enrollmentLoading ? 'Loading...' : 'Update'}
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleEnrollClick(lead)}
                                disabled={enrollmentLoading}
                                className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                              >
                                {enrollmentLoading ? 'Loading...' : 'Enroll'}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}


