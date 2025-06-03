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
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EventIcon from '@mui/icons-material/Event';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';
import TeacherForm from '../addTeachers/page';
import { useRouter } from 'next/navigation';

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

  const baseUrl =process.env. BASE_URL||"http://localhost:6969";

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const filteredTeachers = teachers.filter(teacher => {
    const selectedStatus = statusTabs[selectedTab].value;
    if (selectedStatus === 'all') return true;
    if (selectedStatus === 'rejected') {
      return teacher.status === 'rejected' || teacher.status === 'rejectafterinterview';
    }
    return teacher.status === selectedStatus;
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
      const response = await fetch(`${baseUrl}/api/teachers/${teacherToReject._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...teacherToReject, 
          status: 'interview',
          interviewDetails: {
            ...interviewForm,
            interviewDateTime: `${interviewForm.interviewDate}T${interviewForm.interviewTime}`,
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to schedule interview');
      }

      setSnackbar({
        open: true,
        message: 'Interview scheduled successfully!',
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
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => router.push('/teachers/addTeachers')}
        >
          Add Teacher
        </Button>
      </Box>

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
                            <Tooltip title="Schedule Interview">
                              <IconButton 
                                onClick={() => handleScheduleInterview(teacher)} 
                                color="success"
                                size="small"
                              >
                                <EventIcon />
                              </IconButton>
                            </Tooltip>
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