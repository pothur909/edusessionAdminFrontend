'use client';
import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Snackbar,
  Alert,
  Button,
  DialogActions,
  Tooltip,
  Tabs,
  Tab,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EventIcon from '@mui/icons-material/Event';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';
import InfoIcon from '@mui/icons-material/Info';
import TeacherForm from '../addTeachers/page';
import { useRouter } from 'next/navigation';
import { useFilter } from '@/context/FilterContext';
import { FilterPanel } from '@/app/components/FilterPanel';
import { exportToExcel } from '@/utils/excelExport';

interface InterviewDetails {
  name: string;
  email: string;
  phoneNumber: string;
  interviewDate: string;
  interviewTime: string;
  interviewerName: string;
  interviewerEmail: string;
  interviewerPhone: string;
  meetingStartUrl: string;
  meetingJoinUrl: string;
  meetingId?: string;
  meetingPassword?: string;
}

interface Teacher {
  _id: string;
  name: string;
  phoneNumber: string;
  email: string;
  board: string[];
  classes: string[];
  subjects: string[];
  experience: string;
  qualification: string;
  note: string;
  resumeLink: string;
  status: 'new' | 'interview' | 'interviewdone' | 'contacted' | 'appointed' | 'rejected' | 'rejectafterinterview';
  createdAt: string;
  updatedAt: string;
  languages?: string[];
  additionalCourse?: string[];
  expectedSalary: string;
  interviewDetails?: InterviewDetails;
}

function a11yProps(index: number) {
  return {
    id: `status-tab-${index}`,
    'aria-controls': `status-tabpanel-${index}`,
  };
}

const getStatusColor = (status: Teacher['status']) => {
  switch (status) {
    case 'new':
      return 'info';
    case 'interview':
      return 'warning';
    case 'interviewdone':
      return 'primary';
    case 'contacted':
      return 'success';
    case 'appointed':
      return 'success';
    case 'rejected':
    case 'rejectafterinterview':
      return 'error';
    default:
      return 'default';
  }
};

const formatStatus = (status: Teacher['status']) => {
  return status.charAt(0).toUpperCase() + status.slice(1).replace(/([A-Z])/g, ' $1');
};

const statusTabs = [
  { label: 'All', value: 'all' },
  { label: 'New', value: 'new' },
  { label: 'Interview', value: 'interview' },
  { label: 'Interview Done', value: 'interviewdone' },
  { label: 'Contacted', value: 'contacted' },
  { label: 'Appointed', value: 'appointed' },
  { label: 'Rejected', value: 'rejected' },
];

const TeachersListShow = () => {
  const router = useRouter();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [teacherToReject, setTeacherToReject] = useState<Teacher | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [selectedTab, setSelectedTab] = useState(0);
  const [openInterviewDialog, setOpenInterviewDialog] = useState(false);
  const [interviewForm, setInterviewForm] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    interviewDate: '',
    interviewTime: '',
    interviewerName: '',
    interviewerEmail: '',
    interviewerPhone: '',
  });
  const [openAppointDialog, setOpenAppointDialog] = useState(false);
  const [teacherToAppoint, setTeacherToAppoint] = useState<Teacher | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [openInterviewDetailsDialog, setOpenInterviewDetailsDialog] = useState(false);
  const [selectedInterviewDetails, setSelectedInterviewDetails] = useState<InterviewDetails | null>(null);

  const baseUrl = process.env.BASE_URL ;

  const {
    filterState,
    setSearchQuery,
    setDateRange,
    setMonthFilter,
    setYearFilter,
    setBoardFilter,
    setClassFilter,
    setSubjectFilter,
    setStatusFilter,
    setQuickMonthSelection,
    setCurrentPage,
    clearAllFilters,
    hasActiveFilters,
  } = useFilter();

  // Get unique values for filters
  const uniqueBoards = [...new Set(teachers.flatMap(teacher => teacher.board).filter(Boolean))];
  const uniqueClasses = [...new Set(teachers.flatMap(teacher => teacher.classes).filter(Boolean))];
  const uniqueSubjects = [...new Set(teachers.flatMap(teacher => teacher.subjects).filter(Boolean))];
  const uniqueQualifications = [...new Set(teachers.map(teacher => teacher.qualification).filter(Boolean))];
  
  // Experience ranges for filtering
  const experienceRanges = [
    { value: 'all', label: 'All Experience' },
    { value: '0-1', label: '0-1 years' },
    { value: '1-3', label: '1-3 years' },
    { value: '3-5', label: '3-5 years' },
    { value: '5-10', label: '5-10 years' },
    { value: '10+', label: '10+ years' }
  ];

  // Add new filter state
  const [qualificationFilter, setQualificationFilter] = useState('all');
  const [experienceFilter, setExperienceFilter] = useState('all');

  const handleExportExcel = () => {
    const columns = [
      { key: 'name', label: 'Name' },
      { key: 'phoneNumber', label: 'Phone Number' },
      { key: 'email', label: 'Email' },
      { key: 'board', label: 'Boards' },
      { key: 'classes', label: 'Classes' },
      { key: 'subjects', label: 'Subjects' },
      { key: 'experience', label: 'Experience' },
      { key: 'qualification', label: 'Qualification' },
      { key: 'status', label: 'Status' },
      { key: 'createdAt', label: 'Created At' }
    ];

    const data = filteredTeachers.map(teacher => ({
      name: teacher.name,
      phoneNumber: teacher.phoneNumber,
      email: teacher.email,
      board: teacher.board.join(', '),
      classes: teacher.classes.join(', '),
      subjects: teacher.subjects.join(', '),
      experience: teacher.experience,
      qualification: teacher.qualification,
      status: teacher.status,
      expectedSalary: teacher.expectedSalary,
      createdAt: new Date(teacher.createdAt).toLocaleDateString()
    }));

    exportToExcel(data, columns, {
      filename: 'teachers.xlsx',
      sheetName: 'Teachers'
    });
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
    // Update status filter based on selected tab
    const selectedStatus = statusTabs[newValue].value;
    setStatusFilter(selectedStatus);
  };

  const handleApplyFilters = (filters: { qualification: string; experience: string }) => {
    setQualificationFilter(filters.qualification);
    setExperienceFilter(filters.experience);
  };

  const filteredTeachers = teachers.filter(teacher => {
    const searchLower = filterState.searchQuery.toLowerCase();
    const name = teacher.name?.toLowerCase() || '';
    const email = teacher.email?.toLowerCase() || '';
    const phoneNumber = teacher.phoneNumber || '';
    const qualification = teacher.qualification?.toLowerCase() || '';

    const matchesSearch =
      name.includes(searchLower) ||
      email.includes(searchLower) ||
      phoneNumber.includes(filterState.searchQuery) ||
      qualification.includes(searchLower);

    // Update status matching logic to handle 'rejected' tab
    const matchesStatus = selectedTab === 0 || // 'All' tab
      (selectedTab === 6 ? // 'Rejected' tab
        (teacher.status === 'rejected' || teacher.status === 'rejectafterinterview') :
        teacher.status === statusTabs[selectedTab].value);

    const matchesBoard = filterState.boardFilter === 'all' || teacher.board.includes(filterState.boardFilter);
    const matchesClass = filterState.classFilter === 'all' || teacher.classes.includes(filterState.classFilter);
    const matchesSubject = filterState.subjectFilter === 'all' || teacher.subjects.includes(filterState.subjectFilter);
    const matchesQualification = qualificationFilter === 'all' || teacher.qualification === qualificationFilter;

    // Experience filtering logic
    let matchesExperience = true;
    if (experienceFilter !== 'all') {
      const expYears = parseInt(teacher.experience) || 0;
      switch (experienceFilter) {
        case '0-1':
          matchesExperience = expYears >= 0 && expYears < 1;
          break;
        case '1-3':
          matchesExperience = expYears >= 1 && expYears < 3;
          break;
        case '3-5':
          matchesExperience = expYears >= 3 && expYears < 5;
          break;
        case '5-10':
          matchesExperience = expYears >= 5 && expYears < 10;
          break;
        case '10+':
          matchesExperience = expYears >= 10;
          break;
      }
    }

    const teacherDate = new Date(teacher.createdAt);
    const matchesDateRange = (
      !filterState.dateRange.startDate || teacherDate >= new Date(filterState.dateRange.startDate) &&
      (!filterState.dateRange.endDate || teacherDate <= new Date(filterState.dateRange.endDate + "T23:59:59"))
    );

    const teacherMonth = teacherDate.getMonth() + 1;
    const matchesMonth = filterState.monthFilter === "all" || teacherMonth.toString() === filterState.monthFilter;

    const teacherYear = teacherDate.getFullYear();
    const matchesYear = filterState.yearFilter === "all" || teacherYear.toString() === filterState.yearFilter;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesBoard &&
      matchesClass &&
      matchesSubject &&
      matchesQualification &&
      matchesExperience &&
      matchesDateRange &&
      matchesMonth &&
      matchesYear
    );
  });

  const fetchTeachers = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/teachers`);
      if (!response.ok) {
        throw new Error('Failed to fetch teachers');
      }
      const data = await response.json();
      setTeachers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleEdit = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTeacher(null);
  };

  const handleViewResume = (resumeLink: string) => {
    window.open(resumeLink, '_blank');
  };

  const handleScheduleInterview = (teacher: Teacher) => {
    setTeacherToReject(teacher);
    setInterviewForm({
      name: teacher.name,
      email: teacher.email,
      phoneNumber: teacher.phoneNumber,
      interviewDate: '',
      interviewTime: '',
      interviewerName: '',
      interviewerEmail: '',
      interviewerPhone: '',
    });
    setOpenInterviewDialog(true);
  };

  const handleInterviewSubmit = async () => {
    if (!teacherToReject) return;

    try {
      // First create a Zoom meeting
      const zoomResponse = await fetch(`${baseUrl}/api/zoom/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: `Teacher Interview - ${teacherToReject.name}`,
          instant: true,
          options: {
            enableChat: true,
            enableRecording: true
          }
        }),
      });

      if (!zoomResponse.ok) {
        const errorData = await zoomResponse.json();
        console.error("Zoom API Error:", errorData);
        throw new Error('Failed to create Zoom meeting');
      }

      const zoomResponseData = await zoomResponse.json();
      console.log("Complete Zoom API Response:", JSON.stringify(zoomResponseData, null, 2));

      // Check if the response has the expected structure
      if (!zoomResponseData.success || !zoomResponseData.data || !zoomResponseData.data.start_url || !zoomResponseData.data.join_url) {
        console.error("Invalid Zoom API Response Structure:", zoomResponseData);
        throw new Error('Invalid Zoom API response structure');
      }

      const zoomData = zoomResponseData.data;

      // Now update the teacher with interview details and Zoom meeting info
      const updateBody = { 
        ...teacherToReject, 
        status: 'interview',
        interviewDetails: {
          name: interviewForm.name,
          email: interviewForm.email,
          phoneNumber: interviewForm.phoneNumber,
          interviewDate: interviewForm.interviewDate,
          interviewTime: interviewForm.interviewTime,
          interviewDateTime: `${interviewForm.interviewDate}T${interviewForm.interviewTime}`,
          interviewerName: interviewForm.interviewerName,
          interviewerEmail: interviewForm.interviewerEmail,
          interviewerPhone: interviewForm.interviewerPhone,
          meetingStartUrl: zoomData.start_url,
          meetingJoinUrl: zoomData.join_url,
          meetingId: zoomData.id,
          meetingPassword: zoomData.password
        }
      };
      
      console.log("Teacher Update Request Body:", JSON.stringify(updateBody, null, 2));

      const response = await fetch(`${baseUrl}/api/teachers/${teacherToReject._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Teacher Update Error:", errorData);
        throw new Error('Failed to schedule interview');
      }

      const updatedTeacher = await response.json();
      console.log("Updated Teacher Response:", JSON.stringify(updatedTeacher, null, 2));

      setSnackbar({
        open: true,
        message: 'Interview scheduled successfully with Zoom meeting!',
        severity: 'success'
      });

      setOpenInterviewDialog(false);
      setTeacherToReject(null);
      fetchTeachers();
    } catch (error) {
      console.error('Error scheduling interview:', error);
      setSnackbar({
        open: true,
        message: 'Failed to schedule interview. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleCloseInterviewDialog = () => {
    setOpenInterviewDialog(false);
    setTeacherToReject(null);
  };

  const handleRejectClick = (teacher: Teacher) => {
    setTeacherToReject(teacher);
    setOpenRejectDialog(true);
  };

  const handleRejectConfirm = async () => {
    if (!teacherToReject) return;

    try {
      const response = await fetch(`${baseUrl}/api/teachers/${teacherToReject._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...teacherToReject, 
          status: teacherToReject.status === 'interview' ? 'rejectafterinterview' : 'rejected' 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject teacher');
      }

      setSnackbar({
        open: true,
        message: 'Teacher rejected successfully!',
        severity: 'success'
      });

      setOpenRejectDialog(false);
      setTeacherToReject(null);
      fetchTeachers();
    } catch (error) {
      console.error('Error rejecting teacher:', error);
      setSnackbar({
        open: true,
        message: 'Failed to reject teacher. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleCloseRejectDialog = () => {
    setOpenRejectDialog(false);
    setTeacherToReject(null);
  };

  const handleUpdateSuccess = () => {
    setSnackbar({
      open: true,
      message: 'Teacher updated successfully!',
      severity: 'success'
    });
    handleCloseDialog();
    fetchTeachers();
  };

  const handleUpdateError = () => {
    setSnackbar({
      open: true,
      message: 'Failed to update teacher. Please try again.',
      severity: 'error'
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleAppointClick = (teacher: Teacher) => {
    setTeacherToAppoint(teacher);
    setOpenAppointDialog(true);
  };

  const handleAppointConfirm = async () => {
    if (!teacherToAppoint) return;

    try {
      const response = await fetch(`${baseUrl}/api/teachers/${teacherToAppoint._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...teacherToAppoint, 
          status: 'appointed'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to appoint teacher');
      }

      setSnackbar({
        open: true,
        message: 'Teacher appointed successfully!',
        severity: 'success'
      });

      setOpenAppointDialog(false);
      setTeacherToAppoint(null);
      fetchTeachers();
      
      // Redirect to create-teacher-cred route
      router.push(`/create-teacher-cred?id=${teacherToAppoint._id}`);
    } catch (error) {
      console.error('Error appointing teacher:', error);
      setSnackbar({
        open: true,
        message: 'Failed to appoint teacher. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleCloseAppointDialog = () => {
    setOpenAppointDialog(false);
    setTeacherToAppoint(null);
  };

  const handleShowInterviewDetails = (teacher: Teacher) => {
    if (teacher.interviewDetails) {
      setSelectedInterviewDetails(teacher.interviewDetails);
      setOpenInterviewDetailsDialog(true);
    }
  };

  const handleCloseInterviewDetailsDialog = () => {
    setOpenInterviewDetailsDialog(false);
    setSelectedInterviewDetails(null);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" style={{ color: 'black' }}>
          Teachers Application List
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleExportExcel}
          >
            Download Data
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => router.push('/teachers/addTeachers')}
          >
            Add Teacher
          </Button>
        </Box>
      </Box>

      {/* Filter Panel */}
      <FilterPanel
        showAdvancedFilters={showAdvancedFilters}
        setShowAdvancedFilters={setShowAdvancedFilters}
        months={[
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
        ]}
        uniqueBoards={uniqueBoards}
        uniqueClasses={uniqueClasses}
        uniqueSubjects={uniqueSubjects}
        statusOptions={[
          { value: 'all', label: 'All Status' },
          { value: 'new', label: 'New' },
          { value: 'interview', label: 'Interview' },
          { value: 'interviewdone', label: 'Interview Done' },
          { value: 'contacted', label: 'Contacted' },
          { value: 'appointed', label: 'Appointed' },
          { value: 'rejected', label: 'Rejected' },
          { value: 'rejectafterinterview', label: 'Rejected After Interview' }
        ]}
        qualificationOptions={[
          { value: 'all', label: 'All Qualifications' },
          ...uniqueQualifications.map(qual => ({ value: qual, label: qual }))
        ]}
        experienceOptions={experienceRanges}
        onApplyFilters={handleApplyFilters}
      />

      {/* Status Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs 
          value={selectedTab} 
          onChange={handleTabChange} 
          aria-label="teacher status tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          {statusTabs.map((tab, index) => (
            <Tab 
              key={tab.value} 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {tab.label}
                  <Chip 
                    label={tab.value === 'all' 
                      ? teachers.length 
                      : teachers.filter(t => 
                          tab.value === 'rejected' 
                            ? (t.status === 'rejected' || t.status === 'rejectafterinterview')
                            : t.status === tab.value
                        ).length
                    }
                    size="small"
                    color={tab.value === 'all' ? 'default' : getStatusColor(tab.value as Teacher['status'])}
                  />
                </Box>
              } 
              {...a11yProps(index)} 
            />
          ))}
        </Tabs>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Boards</TableCell>
              <TableCell>Classes</TableCell>
              <TableCell>Subjects</TableCell>
              <TableCell>Experience</TableCell>
              <TableCell>Expected Salary</TableCell>
              <TableCell>Qualification</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTeachers.map((teacher) => (
              <TableRow key={teacher._id}>
                <TableCell>{teacher.name}</TableCell>
                <TableCell>
                  <Typography variant="body2">{teacher.email}</Typography>
                  <Typography variant="body2">{teacher.phoneNumber}</Typography>
                </TableCell>
                <TableCell>
                  {teacher.board.map((board) => (
                    <Chip
                      key={board}
                      label={board}
                      size="small"
                      sx={{ m: 0.5 }}
                    />
                  ))}
                </TableCell>
                <TableCell>
                  {teacher.classes.map((cls) => (
                    <Chip
                      key={cls}
                      label={cls}
                      size="small"
                      sx={{ m: 0.5 }}
                    />
                  ))}
                </TableCell>
                <TableCell>
                  {teacher.subjects.map((subject) => (
                    <Chip
                      key={subject}
                      label={subject}
                      size="small"
                      sx={{ m: 0.5 }}
                    />
                  ))}
                </TableCell>
                <TableCell>{teacher.experience}</TableCell>
                <TableCell>{teacher.expectedSalary}</TableCell>
                <TableCell>{teacher.qualification}</TableCell>
                <TableCell>
                  <Chip
                    label={formatStatus(teacher.status)}
                    color={getStatusColor(teacher.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="View Resume">
                      <IconButton 
                        onClick={() => handleViewResume(teacher.resumeLink)} 
                        color="primary"
                        size="small"
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton 
                        onClick={() => handleEdit(teacher)} 
                        color="primary"
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    {teacher.status !== 'rejected' && teacher.status !== 'rejectafterinterview' && teacher.status !== 'appointed' && (
                      <>
                        <Tooltip title="Appoint">
                          <IconButton 
                            onClick={() => handleAppointClick(teacher)} 
                            color="success"
                            size="small"
                          >
                            <CheckCircleIcon />
                          </IconButton>
                        </Tooltip>
                        {teacher.status !== 'contacted' && (
                          <>
                            {teacher.status === 'interview' ? (
                              <Tooltip title="View Interview Details">
                                <IconButton 
                                  onClick={() => handleShowInterviewDetails(teacher)} 
                                  color="info"
                                  size="small"
                                >
                                  <InfoIcon />
                                </IconButton>
                              </Tooltip>
                            ) : (
                              <Tooltip title="Schedule Interview">
                                <IconButton 
                                  onClick={() => handleScheduleInterview(teacher)} 
                                  color="success"
                                  size="small"
                                >
                                  <EventIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Tooltip title="Reject">
                              <IconButton 
                                onClick={() => handleRejectClick(teacher)} 
                                color="error"
                                size="small"
                              >
                                <CancelIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Teacher</DialogTitle>
        <DialogContent>
          {selectedTeacher && (
            <TeacherForm 
              initialData={{
                _id: selectedTeacher._id,
                name: selectedTeacher.name,
                phoneNumber: selectedTeacher.phoneNumber,
                email: selectedTeacher.email,
                board: selectedTeacher.board,
                classes: selectedTeacher.classes,
                subjects: selectedTeacher.subjects,
                languages: selectedTeacher.languages || [],
                additionalCourse: selectedTeacher.additionalCourse || [],
                expectedSalary : selectedTeacher.expectedSalary,
                experience: selectedTeacher.experience,
                qualification: selectedTeacher.qualification,
                note: selectedTeacher.note,
                resumeLink: selectedTeacher.resumeLink,
                status: selectedTeacher.status
              }}
              onSuccess={handleUpdateSuccess}
              onError={handleUpdateError}
              isEdit={true}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={openRejectDialog}
        onClose={handleCloseRejectDialog}
      >
        <DialogTitle>Confirm Rejection</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to reject {teacherToReject?.name}?
            {teacherToReject?.status === 'interview' && ' This will mark them as rejected after interview.'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRejectDialog}>Cancel</Button>
          <Button onClick={handleRejectConfirm} color="error" variant="contained">
            Reject
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openInterviewDialog}
        onClose={handleCloseInterviewDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Schedule Interview</DialogTitle>
        <DialogContent>
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Teacher Information</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                value={interviewForm.name}
                onChange={(e) => setInterviewForm(prev => ({ ...prev, name: e.target.value }))}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                value={interviewForm.email}
                onChange={(e) => setInterviewForm(prev => ({ ...prev, email: e.target.value }))}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                value={interviewForm.phoneNumber}
                onChange={(e) => setInterviewForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                margin="normal"
              />
            </Grid>
          </Grid>

          <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Interviewer Information</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Interviewer Name"
                value={interviewForm.interviewerName}
                onChange={(e) => setInterviewForm(prev => ({ ...prev, interviewerName: e.target.value }))}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Interviewer Email"
                value={interviewForm.interviewerEmail}
                onChange={(e) => setInterviewForm(prev => ({ ...prev, interviewerEmail: e.target.value }))}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Interviewer Phone"
                value={interviewForm.interviewerPhone}
                onChange={(e) => setInterviewForm(prev => ({ ...prev, interviewerPhone: e.target.value }))}
                margin="normal"
                required
              />
            </Grid>
          </Grid>

          <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Interview Schedule</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Interview Date"
                type="date"
                value={interviewForm.interviewDate}
                onChange={(e) => setInterviewForm(prev => ({ ...prev, interviewDate: e.target.value }))}
                margin="normal"
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Interview Time"
                type="time"
                value={interviewForm.interviewTime}
                onChange={(e) => setInterviewForm(prev => ({ ...prev, interviewTime: e.target.value }))}
                margin="normal"
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseInterviewDialog}>Cancel</Button>
          <Button 
            onClick={handleInterviewSubmit} 
            color="primary" 
            variant="contained"
            disabled={!interviewForm.interviewerName || !interviewForm.interviewerEmail || !interviewForm.interviewerPhone || !interviewForm.interviewDate || !interviewForm.interviewTime}
          >
            Schedule Interview
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openAppointDialog}
        onClose={handleCloseAppointDialog}
      >
        <DialogTitle>Confirm Appointment</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to appoint {teacherToAppoint?.name} as a teacher?
            This will mark them as contacted and ready for onboarding.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAppointDialog}>Cancel</Button>
          <Button onClick={handleAppointConfirm} color="success" variant="contained">
            Appoint
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openInterviewDetailsDialog}
        onClose={handleCloseInterviewDetailsDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Interview Details</DialogTitle>
        <DialogContent>
          {selectedInterviewDetails && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Teacher Information</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Name</Typography>
                  <Typography variant="body1">{selectedInterviewDetails.name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Email</Typography>
                  <Typography variant="body1">{selectedInterviewDetails.email}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Phone Number</Typography>
                  <Typography variant="body1">{selectedInterviewDetails.phoneNumber}</Typography>
                </Grid>
              </Grid>

              <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Interviewer Information</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Interviewer Name</Typography>
                  <Typography variant="body1">{selectedInterviewDetails.interviewerName}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Interviewer Email</Typography>
                  <Typography variant="body1">{selectedInterviewDetails.interviewerEmail}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Interviewer Phone</Typography>
                  <Typography variant="body1">{selectedInterviewDetails.interviewerPhone}</Typography>
                </Grid>
              </Grid>

              <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Interview Schedule</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Date</Typography>
                  <Typography variant="body1">{selectedInterviewDetails.interviewDate}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Time</Typography>
                  <Typography variant="body1">{selectedInterviewDetails.interviewTime}</Typography>
                </Grid>
              </Grid>

              <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Zoom Meeting Details</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2" sx={{ minWidth: '150px' }}>Meeting Join Link</Typography>
                    <Box sx={{ 
                      flex: 1, 
                      p: 1, 
                      bgcolor: 'grey.100', 
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      maxWidth: '100%'
                    }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          flex: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: 'calc(100% - 80px)'
                        }}
                      >
                        {selectedInterviewDetails.meetingJoinUrl.split('/').pop() || 'Join Link'}
                      </Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => {
                          navigator.clipboard.writeText(selectedInterviewDetails.meetingJoinUrl);
                          setSnackbar({
                            open: true,
                            message: 'Join link copied to clipboard!',
                            severity: 'success'
                          });
                        }}
                      >
                        Copy
                      </Button>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2" sx={{ minWidth: '150px' }}>Meeting Start Link</Typography>
                    <Box sx={{ 
                      flex: 1, 
                      p: 1, 
                      bgcolor: 'grey.100', 
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      maxWidth: '100%'
                    }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          flex: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: 'calc(100% - 80px)'
                        }}
                      >
                        {selectedInterviewDetails.meetingStartUrl.split('/').pop() || 'Start Link'}
                      </Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => {
                          navigator.clipboard.writeText(selectedInterviewDetails.meetingStartUrl);
                          setSnackbar({
                            open: true,
                            message: 'Start link copied to clipboard!',
                            severity: 'success'
                          });
                        }}
                      >
                        Copy
                      </Button>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseInterviewDetailsDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TeachersListShow; 