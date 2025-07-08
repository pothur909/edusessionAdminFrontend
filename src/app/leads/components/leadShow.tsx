"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import EditLeadForm from "./leadEdit";
import DemoLeadForm from "../../demo/components/demoForm";
import EnrollmentForm from "../../enrollment/components/enrollmentAddForm";
import { useFilter } from '@/context/FilterContext';
import { FilterPanel } from '@/app/components/FilterPanel';
import { exportToExcel } from '@/utils/excelExport';


interface Demo {
  _id?: string;
  lead: string;
  date: string;
  time: string;
  teacher: string;
  board: string;
  class: string;
  subject: string;
  status: 'demo_scheduled' | 'demo_completed' | 'demo_cancelled' | 'demo_no_show' | 'demo_rescheduled' | 'demo_rescheduled_cancelled' | 'demo_rescheduled_completed' | 'demo_rescheduled_no_show';
  remarks: string;
  preferredTimeSlots: string;
}

interface Teacher {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  isAvailable: boolean;
  isLocked: boolean;
}

interface TeacherResponse {
  teachers: Teacher[];
  totalTeachers: number;
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
  status: 'new' | 'contacted' | 'converted' | 'not_interested' | 'demo_scheduled' | 'demo_completed' | 'demo_cancelled' | 'demo_no_show' | 'demo_rescheduled' | 'demo_rescheduled_cancelled' | 'demo_rescheduled_completed' | 'demo_rescheduled_no_show' | 'no_response_from_Lead';
  notes: string;
  createdAt: string;
  updatedAt: string;
  leadSource: string;
  classesPerWeek: string;
  courseInterested: string;
  modeOfContact: string;
  preferredTimeSlots: string;
  counsellor: string;
  sessionEndDate: string;
  sessionBeginDate: string;
  remarks: string | string[];
  city: string;
  existingStudentId?: string;
  demo?: Demo | null;
  sessionType?: string; // Added for new tab logic
  assignedTo?: string; // Added for assignment check
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

const LEAD_TABS = [
  { label: 'Doubt Session', value: 'doubt session' },
  { label: 'One to One', value: '1 to 1' },
  { label: 'Admin Created', value: 'admin' },
  { label: 'Assigned to Me', value: 'assigned-to-me' },
];

function categorizeLead(lead: Lead) {
  if (!lead.sessionType) return 'admin';
  return lead.sessionType;
}

export default function LeadsList() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [bookDemoForm, setBookDemoForm] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // enroll use state
  const [enrolledStudents, setEnrolledStudents] = useState<Enrollment[]>([]);
  const [showEnrollmentForm, setShowEnrollmentForm] = useState(false);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);

  const [selectedTab, setSelectedTab] = useState('doubt session');
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [selectAllLeads, setSelectAllLeads] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [subadmins, setSubadmins] = useState<{_id: string, name: string, email: string, role: string}[]>([]);
  const [selectedSubadmin, setSelectedSubadmin] = useState<string>("");
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignMessage, setAssignMessage] = useState("");

  // Add after subadmins state
  const [selectedAssignedSubadmin, setSelectedAssignedSubadmin] = useState<string>("");
  const [assignedLeads, setAssignedLeads] = useState<Lead[]>([]);
  const [loadingAssignedLeads, setLoadingAssignedLeads] = useState(false);

  const [myAssignedLeads, setMyAssignedLeads] = useState<Lead[]>([]);
  const [loadingMyAssignedLeads, setLoadingMyAssignedLeads] = useState(false);
  const [myUserId, setMyUserId] = useState<string>("");

  const { filterState, setStatusFilter, setCurrentPage } = useFilter();

  // Filtering and pagination logic
  const tabFilteredLeads = leads.filter(lead => categorizeLead(lead) === selectedTab);
  const filteredLeads = tabFilteredLeads.filter((lead) => {
    const searchLower = filterState.searchQuery.toLowerCase();
    const studentName = lead.studentName?.toLowerCase() || "";
    const studentPhone = lead.studentPhone || "";
    const email = lead.email?.toLowerCase() || "";
    const parentPhone = lead.parentPhone || "";

    // Search filter
    const matchesSearch =
      filterState.searchQuery === "" ||
      studentName.includes(searchLower) ||
      studentPhone.includes(filterState.searchQuery) ||
      email.includes(searchLower) ||
      parentPhone.includes(filterState.searchQuery);

    // Status filter
    const matchesTab =
      filterState.statusFilter === "all" || lead.status?.toLowerCase() === filterState.statusFilter;

    // Date range filter
    const leadDate = new Date(lead.createdAt);
    const matchesDateRange =
      (!filterState.dateRange.startDate || leadDate >= new Date(filterState.dateRange.startDate)) &&
      (!filterState.dateRange.endDate ||
        leadDate <= new Date(filterState.dateRange.endDate + "T23:59:59"));

    // Month filter
    const leadMonth = leadDate.getMonth() + 1; // 1-12
    const matchesMonth =
      filterState.monthFilter === "all" || leadMonth.toString() === filterState.monthFilter;

    // Year filter
    const leadYear = leadDate.getFullYear();
    const matchesYear =
      filterState.yearFilter === "all" || leadYear.toString() === filterState.yearFilter;

    // Demo status filter
    let matchesDemoStatus = true;
    if (filterState.demoStatusFilter !== "all") {
      if (filterState.demoStatusFilter === "no_demo") {
        matchesDemoStatus = !lead.demo;
      } else {
        matchesDemoStatus = lead.demo?.status === filterState.demoStatusFilter;
      }
    }

    // Board filter
    const matchesBoard = filterState.boardFilter === "all" || lead.board === filterState.boardFilter;

    // Class filter
    const matchesClass = filterState.classFilter === "all" || lead.class === filterState.classFilter;

    // Subject filter
    const matchesSubject =
      filterState.subjectFilter === "all" ||
      (lead.subjects && lead.subjects.includes(filterState.subjectFilter));

    return (
      matchesSearch &&
      matchesTab &&
      matchesDateRange &&
      matchesMonth &&
      matchesYear &&
      matchesDemoStatus &&
      matchesBoard &&
      matchesClass &&
      matchesSubject
    );
  });
  const totalPages = Math.ceil(filteredLeads.length / filterState.itemsPerPage);
  const startIndex = (filterState.currentPage - 1) * filterState.itemsPerPage;
  const endIndex = startIndex + filterState.itemsPerPage;
  const currentLeads = filteredLeads.slice(startIndex, endIndex);

  // Fetch subadmins when modal opens
  useEffect(() => {
    if (showAssignModal) {
      fetch("http://localhost:6969/api/leads/subadmins")
        .then(res => res.json())
        .then(data => {
          if (data.success) setSubadmins(data.data);
        });
    }
  }, [showAssignModal]);

  // Fetch assigned leads when subadmin is selected
  useEffect(() => {
    if (selectedAssignedSubadmin) {
      setLoadingAssignedLeads(true);
      fetch(`http://localhost:6969/api/leads/assigned-leads/${selectedAssignedSubadmin}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) setAssignedLeads(data.data);
          else setAssignedLeads([]);
        })
        .finally(() => setLoadingAssignedLeads(false));
    } else {
      setAssignedLeads([]);
    }
  }, [selectedAssignedSubadmin]);

  // Fetch user id from localStorage and assigned leads on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const adminStr = localStorage.getItem('admin');
      if (adminStr) {
        try {
          const admin = JSON.parse(adminStr);
          if (admin && admin._id) {
            setMyUserId(admin._id);
            setLoadingMyAssignedLeads(true);
            fetch(`http://localhost:6969/api/leads/assigned-leads/${admin._id}`)
              .then(res => res.json())
              .then(data => {
                if (data.success) setMyAssignedLeads(data.data);
                else setMyAssignedLeads([]);
              })
              .finally(() => setLoadingMyAssignedLeads(false));
          }
        } catch {}
      }
    }
  }, []);

  // Checkbox logic
  const handleLeadCheckbox = (leadId: string) => {
    setSelectedLeads(prev => prev.includes(leadId) ? prev.filter(id => id !== leadId) : [...prev, leadId]);
  };
  const handleSelectAllLeads = () => {
    setSelectAllLeads(prev => {
      const newVal = !prev;
      setSelectedLeads(newVal ? currentLeads.map(l => l._id) : []);
      return newVal;
    });
  };
  useEffect(() => {
    setSelectAllLeads(selectedLeads.length === currentLeads.length && currentLeads.length > 0);
  }, [selectedLeads, currentLeads]);

  // Assign leads to subadmin
  const handleAssignLeads = async () => {
    if (!selectedSubadmin || selectedLeads.length === 0) return;
    setAssignLoading(true);
    setAssignMessage("");
    try {
      const res = await fetch("http://localhost:6969/api/leads/assign-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadIds: selectedLeads, subadminId: selectedSubadmin })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAssignMessage("Leads assigned successfully!");
        setSelectedLeads([]);
        setShowAssignModal(false);
        fetchLeads();
      } else {
        setAssignMessage(data.message || "Assignment failed. Please try again.");
      }
    } catch (err) {
      setAssignMessage("Error assigning leads.");
    } finally {
      setAssignLoading(false);
    }
  };

  const router = useRouter();

  // Get unique values for filters
  const uniqueBoards = [
    ...new Set(leads.map((lead) => lead.board).filter(Boolean)),
  ];
  const uniqueClasses = [
    ...new Set(leads.map((lead) => lead.class).filter(Boolean)),
  ];
  const uniqueSubjects = [
    ...new Set(leads.flatMap((lead) => lead.subjects || []).filter(Boolean)),
  ];

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
  
  const demoStatuses = [
    { value: 'all', label: 'All Demo Status' },
    { value: 'no_demo', label: 'No Demo' },
    { value: 'demo_scheduled', label: 'Demo Scheduled' },
    { value: 'demo_completed', label: 'Demo Completed' },
    { value: 'demo_cancelled', label: 'Demo Cancelled' },
    { value: 'demo_no_show', label: 'Demo No Show' },
    { value: 'demo_rescheduled', label: 'Demo Rescheduled' },
    { value: 'demo_rescheduled_cancelled', label: 'Demo Rescheduled Cancelled' },
    { value: 'demo_rescheduled_completed', label: 'Demo Rescheduled Completed' },
    { value: 'demo_rescheduled_no_show', label: 'Demo Rescheduled No Show' }
  ];

  useEffect(() => {
    fetchLeads();
    fetchEnrolledStudents(); // Add this line to fetch enrolled students on component mount
  }, [filterState.statusFilter]);

  const baseUrl =process.env.BASE_URL;

  const fetchLeads = async () => {
    try {
      const response = await fetch(
        `${baseUrl}/api/leads/viewleads${
          filterState.statusFilter !== "all" ? `?status=${filterState.statusFilter}` : ""
        }`
      );
      const data = await response.json();
      if (data.success) {
        // Add demo data to each lead
        const leadsWithDemos = await Promise.all(
          data.data.map(async (lead: Lead) => {
            try {
              const demoResponse = await fetch(
                `${baseUrl}/api/demo/view/${lead._id}`
              );
              const demoData = await demoResponse.json();
              lead.demo = demoData.demos?.[0] || null;
            } catch (error) {
              lead.demo = null;
            }
            return lead;
          })
        );
        setLeads(leadsWithDemos);
      } else {
        // setError(data.message || "Failed to fetch leads");
      }
    } catch {
      // error handling
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEnrolledStudents = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/students`);
      const data = await response.json();
      if (data.success) {
        setEnrolledStudents(data.data || []);
      }
    } catch {
      // error handling
    }
  };

  const isStudentEnrolled = (lead: Lead) => {
    return enrolledStudents.some(
      (student) => student.phoneNumber === lead.studentPhone
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
      const response = await fetch(`${baseUrl}/api/leads/deleteled/${leadId}`, {
        method: "DELETE",
      });

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
      // setDeleteLoading(null); // This line was removed
    }
  };

  const handleEditClick = (lead: Lead) => {
    router.push(`/leads/edit/${lead._id}`);
  };

  const fetchTeachers = async (
    board: string,
    className: string,
    subject: string
  ) => {
    try {
      setIsLoadingTeachers(true);
      const response = await fetch(
        "http://localhost:6969/api/session/fetchTeacherByCardId",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "1",
            classType: "normal",
            board,
            className,
            subject,
          }),
        }
      );
      const data: TeacherResponse = await response.json();
      setTeachers(data.teachers);
    } catch (error) {
      console.error("Error fetching teachers:", error);
    } finally {
      setIsLoadingTeachers(false);
    }
  };

  const handleBookDemoClick = async (lead: Lead) => {
    try {
      setEnrollmentLoading(true);
      setTeachers([]); // Initialize teachers as empty array

      // Fetch teachers when booking demo
      if (lead.board && lead.class && lead.subjects && lead.subjects.length > 0) {
        try {
          await fetchTeachers(lead.board, lead.class, lead.subjects[0]);
        } catch (error) {
          console.error("Error fetching teachers:", error);
          // Keep teachers as empty array if fetch fails
        }
      }

      // Initialize demo data with lead information
      const demoData: Partial<Demo> = {
        lead: lead._id,
        teacher: "",
        date: "",
        time: "",
        subject: "",
        status: "demo_scheduled",
        remarks: "",
        preferredTimeSlots: lead.preferredTimeSlots || "",
        board: lead.board || "",
        class: lead.class || "",
      };

      // Try to fetch existing demo data, but don't throw error if none exists
      try {
        const response = await fetch(`${baseUrl}/api/demo/view/${lead._id}`);
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
            preferredTimeSlots: existingDemo.preferredTimeSlots || lead.preferredTimeSlots || "",
          });
        }
      } catch (error) {
        console.log("No existing demo found, proceeding with new demo");
      }

      console.log("Demo data being set:", demoData);
      setEditingLead({
        ...lead,
        remarks: Array.isArray(lead.remarks) ? lead.remarks.join(", ") : lead.remarks
      });
      setBookDemoForm(true);
    } catch (error) {
      console.error("Error in handleBookDemoClick:", error);
      alert("Error preparing demo form. Please try again.");
    } finally {
      setEnrollmentLoading(false);
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
      console.log("Original lead data:", lead);
      setEnrollmentLoading(true);

      // Fetch teachers when enrolling
      if (
        lead.board &&
        lead.class &&
        lead.subjects &&
        lead.subjects.length > 0
      ) {
        await fetchTeachers(lead.board, lead.class, lead.subjects[0]);
      }

      // Fetch both enrollment and demo data in parallel
      try {
        const [enrollmentResponse, demoResponse] = await Promise.all([
          fetch(`${baseUrl}/api/students`),
          fetch(`${baseUrl}/api/demo/view/${lead._id}`),
        ]);

        const enrollmentData = await enrollmentResponse.json();
        const demoData: DemoResponse = await demoResponse.json();

        console.log("Enrollment response:", enrollmentData);
        console.log("Demo response:", demoData);

        if (enrollmentData.success && enrollmentData.data) {
          const existingEnrollment = enrollmentData.data.find(
            (enrollment: Enrollment) => enrollment.lead === lead._id
          );

          if (existingEnrollment) {
            console.log("Found existing enrollment:", existingEnrollment);
            setEditingLead({
              ...lead,
              city: lead.city || "",
              preferredTimeSlots: lead.preferredTimeSlots || "",
              demo: demoData.demos?.[0] || null,
              existingStudentId: existingEnrollment._id,
              remarks: Array.isArray(lead.remarks) ? lead.remarks.join(", ") : lead.remarks
            });
          } else {
            console.log("No existing student found, proceeding with new enrollment");
            setEditingLead({
              ...lead,
              city: lead.city || "",
              preferredTimeSlots: lead.preferredTimeSlots || "",
              demo: demoData.demos?.[0] || null,
              remarks: Array.isArray(lead.remarks) ? lead.remarks.join(", ") : lead.remarks
            });
          }
        } else {
          console.log("Invalid enrollment response format, proceeding with new enrollment");
          setEditingLead({
            ...lead,
            city: lead.city || "",
            preferredTimeSlots: lead.preferredTimeSlots || "",
            demo: demoData.demos?.[0] || null,
            remarks: Array.isArray(lead.remarks) ? lead.remarks.join(", ") : lead.remarks
          });
        }
      } catch (error) {
        console.log("Error fetching data, proceeding with new enrollment:", error);
        setEditingLead({
          ...lead,
          city: lead.city || "",
          preferredTimeSlots: lead.preferredTimeSlots || "",
          demo: null,
          remarks: Array.isArray(lead.remarks) ? lead.remarks.join(", ") : lead.remarks
        });
      }

      setShowEnrollmentForm(true);
    } catch (error) {
      console.error("Error in handleEnrollClick", error);
      alert("Error preparing enrollment form. Please try again.");
    } finally {
      setEnrollmentLoading(false);
    }
  };

  const handleEnrollmentComplete = async () => {
    try {
      // Refresh both leads and enrolled students
      await Promise.all([fetchLeads(), fetchEnrolledStudents()]);

      // Reset form state
      setEditingLead(null);
      setShowEnrollmentForm(false);
    } catch (error) {
      console.error("Error refreshing data after enrollment:", error);
      // Still reset the form even if refresh fails
      setEditingLead(null);
      setShowEnrollmentForm(false);
    }
  };

  const handleEnrollmentCancel = () => {
    setEditingLead(null);
    setShowEnrollmentForm(false);
  };

  // Tab + filter logic
  // const tabFilteredLeads = leads.filter(lead => categorizeLead(lead) === selectedTab);

  // const filteredLeads = tabFilteredLeads.filter((lead) => {
  //   const searchLower = filterState.searchQuery.toLowerCase();
  //   const studentName = lead.studentName?.toLowerCase() || "";
  //   const studentPhone = lead.studentPhone || "";
  //   const email = lead.email?.toLowerCase() || "";
  //   const parentPhone = lead.parentPhone || "";

  //   // Search filter
  //   const matchesSearch =
  //     filterState.searchQuery === "" ||
  //     studentName.includes(searchLower) ||
  //     studentPhone.includes(filterState.searchQuery) ||
  //     email.includes(searchLower) ||
  //     parentPhone.includes(filterState.searchQuery);

  //   // Status filter
  //   const matchesTab =
  //     filterState.statusFilter === "all" || lead.status?.toLowerCase() === filterState.statusFilter;

  //   // Date range filter
  //   const leadDate = new Date(lead.createdAt);
  //   const matchesDateRange =
  //     (!filterState.dateRange.startDate || leadDate >= new Date(filterState.dateRange.startDate)) &&
  //     (!filterState.dateRange.endDate ||
  //       leadDate <= new Date(filterState.dateRange.endDate + "T23:59:59"));

  //   // Month filter
  //   const leadMonth = leadDate.getMonth() + 1; // 1-12
  //   const matchesMonth =
  //     filterState.monthFilter === "all" || leadMonth.toString() === filterState.monthFilter;

  //   // Year filter
  //   const leadYear = leadDate.getFullYear();
  //   const matchesYear =
  //     filterState.yearFilter === "all" || leadYear.toString() === filterState.yearFilter;

  //   // Demo status filter
  //   let matchesDemoStatus = true;
  //   if (filterState.demoStatusFilter !== "all") {
  //     if (filterState.demoStatusFilter === "no_demo") {
  //       matchesDemoStatus = !lead.demo;
  //     } else {
  //       matchesDemoStatus = lead.demo?.status === filterState.demoStatusFilter;
  //     }
  //   }

  //   // Board filter
  //   const matchesBoard = filterState.boardFilter === "all" || lead.board === filterState.boardFilter;

  //   // Class filter
  //   const matchesClass = filterState.classFilter === "all" || lead.class === filterState.classFilter;

  //   // Subject filter
  //   const matchesSubject =
  //     filterState.subjectFilter === "all" ||
  //     (lead.subjects && lead.subjects.includes(filterState.subjectFilter));

  //   return (
  //     matchesSearch &&
  //     matchesTab &&
  //     matchesDateRange &&
  //     matchesMonth &&
  //     matchesYear &&
  //     matchesDemoStatus &&
  //     matchesBoard &&
  //     matchesClass &&
  //     matchesSubject
  //   );
  // });

  // Pagination logic
  // const totalPages = Math.ceil(filteredLeads.length / filterState.itemsPerPage);
  // const startIndex = (filterState.currentPage - 1) * filterState.itemsPerPage;
  // const endIndex = startIndex + filterState.itemsPerPage;
  // const currentLeads = filteredLeads.slice(startIndex, endIndex);

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

  const handleExportExcel = () => {
    const columns = [
      { key: 'studentName', label: 'Student Name' },
      { key: 'studentPhone', label: 'Student Phone' },
      { key: 'parentPhone', label: 'Parent Phone' },
      { key: 'email', label: 'Email' },
      { key: 'board', label: 'Board' },
      { key: 'class', label: 'Class' },
      { key: 'subjects', label: 'Subjects' },
      { key: 'status', label: 'Status' },
      { key: 'createdAt', label: 'Created At' }
    ];

    const data = filteredLeads.map(lead => ({
      studentName: lead.studentName,
      studentPhone: lead.studentPhone,
      parentPhone: lead.parentPhone,
      email: lead.email,
      board: lead.board,
      class: lead.class,
      subjects: lead.subjects.join(', '),
      status: lead.status,
      createdAt: new Date(lead.createdAt).toLocaleDateString()
    }));

    exportToExcel(data, columns, {
      filename: `leads-${selectedTab}.xlsx`,
      sheetName: 'Leads'
    });
  };

  // Find the subadmin name for a given ID
  const getSubadminName = (id: string | undefined) => {
    if (!id) return '';
    const sub = subadmins.find(s => s._id === id);
    return sub ? sub.name : id;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-black m-9">
      {/* Tabs for lead categories */}
      <div className="flex space-x-2 mb-4">
        {LEAD_TABS.map(tab => (
          <button
            key={tab.value}
            className={`px-4 py-2 rounded-lg font-medium transition-colors border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${selectedTab === tab.value ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-blue-50'}`}
            onClick={() => setSelectedTab(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {!showEditForm && !showEnrollmentForm && !bookDemoForm && (
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Sales Leads</h1>
          <button
            onClick={handleExportExcel}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Download Data
          </button>
        </div>
      )}

      {/* Edit Form */}
      {showEditForm && editingLead && !showEnrollmentForm && !bookDemoForm ? (
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
             
            </h2>
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
          {/* {isLoadingTeachers ? (
            <div className="flex justify-center items-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Available Teachers</h3>
              {teachers && teachers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teachers.map((teacher) => (
                    <div
                      key={teacher._id}
                      className={`p-4 border rounded-lg ${
                        teacher.isAvailable && !teacher.isLocked
                          ? "bg-green-50 border-green-200"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <h4 className="font-medium">{teacher.name}</h4>
                      <p className="text-sm text-gray-600">{teacher.email}</p>
                      <p className="text-sm text-gray-600">
                        {teacher.phoneNumber}
                      </p>
                      <div className="mt-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            teacher.isAvailable && !teacher.isLocked
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {teacher.isAvailable && !teacher.isLocked
                            ? "Available"
                            : "Not Available"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-4">
                  No teachers available for this subject/class combination
                </div>
              )}
            </div>
          )} */}
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
            teachers={teachers}
          />
        </div>
      ) : showEnrollmentForm && editingLead ? (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-black">
              {editingLead.existingStudentId ? "Update Student" : "Enroll Student"} - {editingLead.studentName}
            </h2>
            <button
              onClick={handleEnrollmentCancel}
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
          {isLoadingTeachers ? (
            <div className="flex justify-center items-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="mb-6">
              {/* <h3 className="text-lg font-semibold mb-2">Available Teachers</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teachers.map((teacher) => (
                  <div
                    key={teacher._id}
                    className={`p-4 border rounded-lg ${
                      teacher.isAvailable && !teacher.isLocked
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <h4 className="font-medium">{teacher.name}</h4>
                    <p className="text-sm text-gray-600">{teacher.email}</p>
                    <p className="text-sm text-gray-600">{teacher.phoneNumber}</p>
                    <div className="mt-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          teacher.isAvailable && !teacher.isLocked
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {teacher.isAvailable && !teacher.isLocked
                          ? 'Available'
                          : 'Not Available'}
                      </span>
                    </div>
                  </div>
                ))}
              </div> */}
            </div>
          )}
          <EnrollmentForm
            lead={editingLead}
            onComplete={handleEnrollmentComplete}
            onCancel={handleEnrollmentCancel}
            teachers={teachers}
          />
        </div>
      ) : (
        <>

       {/* <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Sales Leads</h1>
          
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-white px-4 py-2 rounded-lg shadow-sm border">
                <span className="text-sm text-gray-600">Showing: </span>
                <span className="font-semibold text-blue-600">
                  {filterState.dateRange.startDate && filterState.dateRange.endDate ? 'Custom Date Range' : 'All Time'}
                </span>
              </div>
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  showAdvancedFilters || hasActiveFilters()
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Filter size={18} />
                <span>Filters</span>
                {hasActiveFilters() && (
                  <span className="bg-white text-blue-600 text-xs px-2 py-0.5 rounded-full font-bold">
                    {[filterState.searchQuery, filterState.dateRange.startDate, filterState.dateRange.endDate, filterState.monthFilter !== 'all', 
                      filterState.yearFilter !== 'all', filterState.boardFilter !== 'all', filterState.classFilter !== 'all', 
                      filterState.subjectFilter !== 'all', filterState.demoStatusFilter !== 'all', filterState.quickMonthSelection !== 'all']
                      .filter(Boolean).length}
                  </span>
                )}
              </button>
            </div>
          </div>

          
          <div className="flex items-center  space-x-4 mb-4">
           
            <div className="flex-1 relative max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              
              <input
                type="text"
                placeholder="Search by name, phone, or email..."
                value={filterState.searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
              />
            </div>

            
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Quick Month:</label>
              <select
                value={filterState.quickMonthSelection}
                onChange={(e) => {
                  setQuickMonthSelection(e.target.value);
                  setMonthFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
              >
                {months.map(month => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
            </div>

              
            {hasActiveFilters() && (
              <button
                onClick={clearAllFilters}
                className="flex items-center space-x-2 px-4 py-2.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium transition-colors shadow-sm"
              >
                <X size={16} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div> */}

      

      <FilterPanel
        showAdvancedFilters={showAdvancedFilters}
        setShowAdvancedFilters={setShowAdvancedFilters}
        months={months}
        demoStatuses={demoStatuses}
        uniqueBoards={uniqueBoards}
        uniqueClasses={uniqueClasses}
        uniqueSubjects={uniqueSubjects}
        statusOptions={[
          { value: 'all', label: 'All Status' },
          { value: 'new', label: 'New' },
          { value: 'contacted', label: 'Contacted' },
          { value: 'converted', label: 'Converted' },
          { value: 'not_interested', label: 'Not Interested' },
          { value: 'follow_up', label: 'Follow Up' }
        ]}
        onApplyFilters={() => setShowAdvancedFilters(false)}
      />

          {/* Status Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: "all", label: "All" },
                { key: "new", label: "New" },
                { key: "contacted", label: "Contacted" },
                { key: "converted", label: "Converted" },
                { key: "not_interested", label: "Not Interested" },
                { key: "follow_up", label: "Follow Up" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setStatusFilter(tab.key as any);
                    setCurrentPage(1);
                  }}
                  className={`${
                    filterState.statusFilter === tab.key
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Pagination Controls */}
          {filteredLeads.length > filterState.itemsPerPage && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(filterState.currentPage - 1)}
                  disabled={filterState.currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(filterState.currentPage + 1)}
                  disabled={filterState.currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{" "}
                    <span className="font-medium">{startIndex + 1}</span> to{" "}
                    <span className="font-medium">
                      {Math.min(endIndex, filteredLeads.length)}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium">{filteredLeads.length}</span>{" "}
                    results
                  </p>
                </div>
                <div>
                  <nav
                    className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={() => handlePageChange(filterState.currentPage - 1)}
                      disabled={filterState.currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Previous</span>
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => {
                        // Show first page, last page, current page, and pages around current page
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= filterState.currentPage - 1 && page <= filterState.currentPage + 1)
                        ) {
                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                page === filterState.currentPage
                                  ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                  : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                              }`}
                            >
                              {page}
                            </button>
                          );
                        } else if (
                          page === filterState.currentPage - 2 ||
                          page === filterState.currentPage + 2
                        ) {
                          return (
                            <span
                              key={page}
                              className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                            >
                              ...
                            </span>
                          );
                        }
                        return null;
                      }
                    )}

                    <button
                      onClick={() => handlePageChange(filterState.currentPage + 1)}
                      disabled={filterState.currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Next</span>
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}

          {/* Leads Table */}
          {selectedTab !== 'assigned-to-me' && (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 py-3">
                        <input
                          type="checkbox"
                          checked={selectAllLeads}
                          onChange={handleSelectAllLeads}
                        />
                      </th>
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
                        Lead Status
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Demo Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Enrollment
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentLeads.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-6 py-4 text-center text-gray-500"
                        >
                          No leads found
                        </td>
                      </tr>
                    ) : (
                      currentLeads.map((lead) => {
                        // No need to re-cast lead, just use lead directly
                        return (
                          <tr key={lead._id}>
                            <td className="px-2 py-4">
                              {(lead.assignedTo === null || lead.assignedTo === undefined) ? (
                                <input
                                  type="checkbox"
                                  checked={selectedLeads.includes(lead._id)}
                                  onChange={() => handleLeadCheckbox(lead._id)}
                                />
                              ) : (
                                <span className="text-gray-400">Assigned{lead.assignedTo ? ` to ${getSubadminName(lead.assignedTo)}` : ''}</span>
                              )}
                            </td>
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
                              {new Date(lead.createdAt).toLocaleDateString(
                                "en-GB"
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex flex-col items-start gap-1">
                                <button
                                  onClick={() => handleEditClick(lead)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  Edit
                                </button>
                                {/* <button
                                  onClick={() => handleDeleteLead(lead._id)}
                                  disabled={deleteLoading === lead._id}
                                  className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                >
                                  {deleteLoading === lead._id ? 'Deleting...' : 'Delete'}
                                </button> */}
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
                            <td className="px-6 py-4 whitespace-nowrap">
                              {lead.demo ? (
                                <span
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                    lead.demo.status
                                  )}`}
                                >
                                  {lead.demo.status.charAt(0).toUpperCase() +
                                    lead.demo.status.slice(1).replace(/_/g, " ")}
                                </span>
                              ) : (
                                <span className="text-gray-500">No Demo</span>
                              )}
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
                                    {enrollmentLoading ? "Loading..." : "Update"}
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleEnrollClick(lead)}
                                  disabled={enrollmentLoading}
                                  className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                                >
                                  {enrollmentLoading ? "Loading..." : "Enroll"}
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
          )}

          {/* Assign to Subadmin Button */}
          {selectedTab !== 'assigned-to-me' && (
            <div className="flex items-center mb-2">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 mr-4"
                disabled={selectedLeads.length === 0}
                onClick={() => setShowAssignModal(true)}
              >
                Assign to Subadmin
              </button>
              {selectedLeads.length > 0 && (
                <span className="text-sm text-gray-600">{selectedLeads.length} leads selected</span>
              )}
            </div>
          )}
          {/* Assign Modal */}
          {showAssignModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Assign Leads to Subadmin</h2>
                <label className="block mb-2 font-medium">Select Subadmin</label>
                <select
                  className="w-full border px-3 py-2 rounded mb-4"
                  value={selectedSubadmin}
                  onChange={e => setSelectedSubadmin(e.target.value)}
                >
                  <option value="">Select...</option>
                  {subadmins.map(sa => (
                    <option key={sa._id} value={sa._id}>{sa.name} ({sa.email})</option>
                  ))}
                </select>
                <button
                  className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 disabled:opacity-50 mb-2"
                  disabled={!selectedSubadmin || assignLoading}
                  onClick={handleAssignLeads}
                >
                  {assignLoading ? "Assigning..." : "Assign"}
                </button>
                {assignMessage && <div className="text-center text-sm text-red-600 mb-2">{assignMessage}</div>}
                <button
                  className="w-full bg-gray-200 text-gray-700 py-2 rounded font-semibold hover:bg-gray-300"
                  onClick={() => setShowAssignModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          {selectedTab !== 'assigned-to-me' && (
            <div className="mb-8 p-4 bg-white rounded shadow">
              <h2 className="text-lg font-bold mb-2">Assigned Leads</h2>
              <label className="block mb-2 font-medium">Select Subadmin</label>
              <select
                className="w-full border px-3 py-2 rounded mb-4"
                value={selectedAssignedSubadmin}
                onChange={e => setSelectedAssignedSubadmin(e.target.value)}
              >
                <option value="">Select...</option>
                {subadmins.map(sa => (
                  <option key={sa._id} value={sa._id}>{sa.name} ({sa.email})</option>
                ))}
              </select>
              {loadingAssignedLeads ? (
                <div className="text-gray-500">Loading assigned leads...</div>
              ) : assignedLeads.length === 0 && selectedAssignedSubadmin ? (
                <div className="text-gray-500">No leads assigned to this subadmin.</div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {assignedLeads.map(lead => (
                    <li key={lead._id} className="py-2">
                      <span className="font-medium">{lead.studentName}</span> - {lead.email} - {lead.status}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {/* Show assigned leads for the logged-in user when 'Assigned to Me' tab is selected */}
          {selectedTab === 'assigned-to-me' && (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Demo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Demo Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrollment</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {myAssignedLeads.map((lead) => (
                      <tr key={lead._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{lead.studentName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">Student: {lead.studentPhone}</div>
                          <div className="text-sm text-gray-900">Parent: {lead.parentPhone || "Not provided"}</div>
                          <div className="text-sm text-gray-500">{lead.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{lead.board} - Class {lead.class}</div>
                          <div className="text-sm text-gray-500">{Array.isArray(lead.subjects) ? lead.subjects.join(", ") : lead.subjects}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(lead.status)}`}>{lead.status.charAt(0).toUpperCase() + lead.status.slice(1).replace(/_/g, " ")}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.createdAt ? new Date(lead.createdAt).toLocaleDateString("en-GB") : ""}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex flex-col items-start gap-1">
                            <button onClick={() => handleEditClick(lead)} className="text-blue-600 hover:text-blue-900">Edit</button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button onClick={() => handleBookDemoClick(lead)} className="text-blue-600 hover:text-blue-900">Book Demo</button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {lead.demo ? (
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(lead.demo.status)}`}>{lead.demo.status.charAt(0).toUpperCase() + lead.demo.status.slice(1).replace(/_/g, " ")}</span>
                          ) : (
                            <span className="text-gray-500">No Demo</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {isStudentEnrolled(lead) ? (
                            <div className="flex flex-col items-end gap-1">
                              <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Enrolled</span>
                              <button onClick={() => handleEnrollClick(lead)} disabled={enrollmentLoading} className="text-blue-600 hover:text-blue-900 text-xs disabled:opacity-50">{enrollmentLoading ? "Loading..." : "Update"}</button>
                            </div>
                          ) : (
                            <button onClick={() => handleEnrollClick(lead)} disabled={enrollmentLoading} className="text-blue-600 hover:text-blue-900 disabled:opacity-50">{enrollmentLoading ? "Loading..." : "Enroll"}</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
