'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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
  remarks: string | string[];
  city?: string;
  existingStudentId?: string;
  demo?: Demo | null;
}

interface Demo {
  _id?: string;
  lead: string;
  date: string;
  time: string;
  teacher: string;
  board: string;
  class: string;
  subject: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled' | 'rescheduled_cancelled' | 'rescheduled_completed' | 'rescheduled_no_show';
  remarks: string;
  preferredTimeSlots: string;
  meetingStartUrl?: string;
  meetingJoinUrl?: string;
}

interface Teacher {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  isAvailable: boolean;
  isLocked: boolean;
}

interface DemoLeadFormProps {
  lead: Lead;
  teachers: Teacher[];
  demos?: Demo[];
}

export type { Lead, Teacher, Demo };

export default function DemoLeadForm({ lead, teachers, demos }: DemoLeadFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [existingDemos, setExistingDemos] = useState<Demo[]>(demos || []);
  const [newSubject, setNewSubject] = useState('');
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);

  const baseUrl = process.env.BASE_URL ;

  const [leadData, setLeadData] = useState<Lead>({
    ...lead,
    subjects: Array.isArray(lead.subjects) ? lead.subjects : []
  });

  const [formData, setFormData] = useState<Demo>({
    lead: lead._id,
    date: '',
    time: '',
    teacher: '',
    board: lead.board || '',
    class: lead.class || '',
    subject: '',
    status: 'scheduled',
    remarks: '',
    preferredTimeSlots: lead.preferredTimeSlots || '',
  });

  useEffect(() => {
    if (!demos) fetchExistingDemos();
  }, []);

  useEffect(() => {
    console.log('Lead data:', leadData);
    console.log('Subjects:', leadData.subjects);
  }, [leadData]);

  const fetchExistingDemos = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/demo/view/${lead._id}`);
      const data = await response.json();
      
      const demos = data.demos || [];
      setExistingDemos(demos);
    } catch (error) {
      console.error('Error fetching demos:', error);
    }
  };

  // Check if a subject has a demo and return demo status
  const getSubjectDemoStatus = (subject: string) => {
    const demo = existingDemos.find(d => d.subject === subject);
    if (!demo) return 'no_demo';
    if (demo.status === 'completed' || demo.status === 'rescheduled_completed') return 'completed';
    if (demo.status === 'cancelled' || demo.status === 'no_show' || demo.status === 'rescheduled_cancelled' || demo.status === 'rescheduled_no_show') return 'can_reschedule';
    return 'in_progress';
  };

  // Check if subject can have a new demo
  const canAddDemo = (subject: string) => {
    const demo = existingDemos.find(d => d.subject === subject);
    if (!demo) return true;
    const status = demo.status;
    return status === 'completed' || 
           status === 'cancelled' || 
           status === 'no_show' || 
           status === 'rescheduled_completed' ||
           status === 'rescheduled_cancelled' ||
           status === 'rescheduled_no_show';
  };

  // Check if we can edit existing demo
  const canEditDemo = (subject: string) => {
    const demo = existingDemos.find(d => d.subject === subject);
    if (!demo) return false;
    // Can edit all demos EXCEPT completed ones
    return !(demo.status === 'completed' || demo.status === 'rescheduled_completed');
  };

  const handleSubjectSelect = (subject: string) => {
    const existingDemo = existingDemos.find(demo => demo.subject === subject);
    const demoStatus = getSubjectDemoStatus(subject);
    
    // If there's a completed demo, show it in view mode only
    if (existingDemo && demoStatus === 'completed') {
      // Load existing demo for viewing only
      setFormData({
        _id: existingDemo._id,
        lead: lead._id,
        date: existingDemo.date ? new Date(existingDemo.date).toISOString().split('T')[0] : '',
        time: existingDemo.time || '',
        teacher: existingDemo.teacher || '',
        board: existingDemo.board || lead.board || '',
        class: existingDemo.class || lead.class || '',
        subject: existingDemo.subject || '',
        status: existingDemo.status || 'scheduled',
        remarks: existingDemo.remarks || '',
        preferredTimeSlots: lead.preferredTimeSlots || '',
        meetingStartUrl: existingDemo.meetingStartUrl || '',
        meetingJoinUrl: existingDemo.meetingJoinUrl || ''
      });
      setIsViewMode(true);
    } else if (existingDemo) {
      // For all other existing demos (cancelled, no-show, scheduled, rescheduled), allow editing
      setFormData({
        _id: existingDemo._id,
        lead: lead._id,
        date: existingDemo.date ? new Date(existingDemo.date).toISOString().split('T')[0] : '',
        time: existingDemo.time || '',
        teacher: existingDemo.teacher || '',
        board: existingDemo.board || lead.board || '',
        class: existingDemo.class || lead.class || '',
        subject: existingDemo.subject || '',
        status: existingDemo.status || 'scheduled',
        remarks: existingDemo.remarks || '',
        preferredTimeSlots: lead.preferredTimeSlots || '',
        meetingStartUrl: existingDemo.meetingStartUrl || '',
        meetingJoinUrl: existingDemo.meetingJoinUrl || ''
      });
      setIsViewMode(false); // Allow editing for all non-completed demos
    } else {
      // Create new demo
      setFormData({
        lead: lead._id,
        date: '',
        time: '',
        teacher: '',
        board: lead.board || '',
        class: lead.class || '',
        subject: subject,
        status: 'scheduled',
        remarks: '',
        preferredTimeSlots: lead.preferredTimeSlots || '',
        meetingStartUrl: '',
        meetingJoinUrl: ''
      });
      setIsViewMode(false);
    }
    
    setSelectedSubject(subject);
  };

  const handleAddSubject = async () => {
    if (!newSubject.trim()) return;
    
    const updatedSubjects = [...leadData.subjects, newSubject.trim()];
    
    try {
      const leadUpdateData = {
        ...leadData,
        subjects: updatedSubjects
      };

      const response = await fetch(`${baseUrl}/api/leads/editlead/${lead._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadUpdateData),
      });

      if (response.ok) {
        setLeadData(prev => ({ ...prev, subjects: updatedSubjects }));
        setNewSubject('');
        setShowAddSubject(false);
        alert('Subject added successfully!');
      }
    } catch (error) {
      console.error('Error adding subject:', error);
      alert('Failed to add subject');
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> | { target: { name: string; value: string } }
  ) => {
    if (typeof e === 'string') {
      // Direct value change
      setFormData(prev => ({ ...prev, [e]: value }));
    } else {
      // Event-based change
      const { name, value: eventValue } = e.target;
      setFormData(prev => ({ ...prev, [name]: eventValue }));
    }
  };

  const handleSubmit = async () => {
    if (!selectedSubject) {
      alert('Please select a subject first');
      return;
    }

    if (!formData.date || !formData.time || !formData.teacher) {
      alert('Please fill in all required fields (Date, Time, and Teacher)');
      return;
    }

    setLoading(true);

    try {
      // First, create a Zoom meeting
      const zoomResponse = await fetch(`${baseUrl}/api/zoom/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: `Demo Session - ${leadData.studentName} - ${formData.subject}`,
          start_time: `${formData.date}T${formData.time}:00`,
          duration: 60, // 1 hour duration
          timezone: 'Asia/Kolkata',
          settings: {
            host_video: true,
            participant_video: true,
            join_before_host: false,
            mute_upon_entry: true,
            waiting_room: true,
            enable_chat: true,
            enable_recording: true
          }
        }),
      });

      const zoomData = await zoomResponse.json();
      
      if (!zoomData.success) {
        throw new Error('Failed to create Zoom meeting');
      }

      const url = formData._id 
        ? `${baseUrl}/api/demo/edit/${formData._id}`
        : `${baseUrl}/api/demo/add`;
      
      const method = formData._id ? 'PUT' : 'POST';

      const demoDataToSend = {
        lead: formData.lead,
        date: formData.date,
        time: formData.time,
        teacher: formData.teacher,
        board: formData.board,
        class: formData.class,
        subject: formData.subject,
        status: formData.status,
        remarks: formData.remarks,
        preferredTimeSlots: formData.preferredTimeSlots,
        meetingStartUrl: zoomData.data.start_url,
        meetingJoinUrl: zoomData.data.join_url
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(demoDataToSend),
      });

      const data = await response.json();

      if (data.success) {
        alert('Demo saved successfully! Zoom meeting has been created.');
        await fetchExistingDemos();
        
        // Reset selection to refresh the view
        setSelectedSubject('');
        setTimeout(() => setSelectedSubject(formData.subject), 100);
        
        if (formData.status === 'completed' || formData.status === 'rescheduled_completed') {
          alert('Demo completed! You can now schedule demos for other subjects.');
        }
        // Do not call onComplete, just stay on the page
      } else {
        throw new Error(data.message || 'Failed to save demo');
      }
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to save demo: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'can_reschedule':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'In Progress';
      case 'can_reschedule':
        return 'Can Reschedule';
      default:
        return 'No Demo';
    }
  };

  // Form is read-only only for completed demos
  const isFormReadOnly = isViewMode;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Demo Management</h1>
          <p className="text-sm text-gray-600">Manage demo sessions for each subject</p>
        </div>

        {/* Student Details Card */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Student Information</h2>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm">
              ID: {leadData._id.slice(-6)}
            </span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-600 mb-1">Student Name</p>
              <p className="font-medium text-gray-900">{leadData.studentName}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Phone</p>
              <p className="font-medium text-gray-900">{leadData.studentPhone}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Parent Phone</p>
              <p className="font-medium text-gray-900">{leadData.parentPhone}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Email</p>
              <p className="font-medium text-gray-900 truncate">{leadData.email}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Board</p>
              <p className="font-medium text-gray-900">{leadData.board}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Class</p>
              <p className="font-medium text-gray-900">{leadData.class}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Lead Status</p>
              <p className="font-medium text-gray-900">{leadData.status}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Subjects</p>
              <p className="font-medium text-gray-900">{leadData.subjects.length}</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left Panel - Subject Selection */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Subjects</h3>
                <button
                  onClick={() => setShowAddSubject(!showAddSubject)}
                  className="px-3 py-1 bg-gray-900 text-white rounded text-sm hover:bg-gray-800 transition-colors"
                >
                  + Add
                </button>
              </div>

              {/* Add Subject Form */}
              {showAddSubject && (
                <div className="mb-4 p-3 bg-gray-50 rounded border">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      placeholder="Subject name"
                      className="flex-1 px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                    />
                    <button
                      onClick={handleAddSubject}
                      className="px-3 py-2 bg-gray-900 text-white rounded text-sm hover:bg-gray-800 transition-colors"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setShowAddSubject(false)}
                      className="px-3 py-2 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}

              {/* Subject List */}
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {(leadData.subjects || []).map((subject, index) => {
                  const demoStatus = getSubjectDemoStatus(subject);
                  const isSelected = selectedSubject === subject;
                  
                  return (
                    <div
                      key={index}
                      onClick={() => handleSubjectSelect(subject)}
                      className={`p-3 rounded border transition-colors cursor-pointer ${
                        isSelected 
                          ? 'border-gray-900 bg-gray-50' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className={`font-medium text-sm ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                          {subject}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded ${getStatusBadgeColor(demoStatus)}`}>
                          {getStatusText(demoStatus)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {leadData.subjects.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  <p className="text-sm">No subjects added yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Demo Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedSubject ? `Demo Details - ${selectedSubject}` : 'Select a Subject'}
                </h3>
                {selectedSubject && (
                  <div className="flex gap-2">
                    {isViewMode && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded text-sm">
                        View Only (Completed)
                      </span>
                    )}
                    {formData._id && !isViewMode && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                        Editing Existing Demo
                      </span>
                    )}
                    {!formData._id && selectedSubject && !isViewMode && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm">
                        New Demo
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              {selectedSubject ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Teacher</label>
                    <select
                      name="teacher"
                      value={formData.teacher}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select a teacher</option>
                      {teachers.map((teacher) => (
                        <option 
                          key={teacher._id} 
                          value={teacher._id}
                          disabled={!teacher.isAvailable || teacher.isLocked}
                        >
                          {teacher.name} {(!teacher.isAvailable || teacher.isLocked) ? '(Not Available)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date & Time Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        disabled={isFormReadOnly}
                        required
                        className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Time <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="time"
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                        disabled={isFormReadOnly}
                        required
                        className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 disabled:bg-gray-100"
                      />
                    </div>
                  </div>

                  {/* Status Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Demo Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      disabled={isFormReadOnly}
                      className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 disabled:bg-gray-100"
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="no_show">No Show</option>
                      <option value="rescheduled">Rescheduled</option>
                      <option value="rescheduled_cancelled">Rescheduled Cancelled</option>
                      <option value="rescheduled_completed">Rescheduled Completed</option>
                      <option value="rescheduled_no_show">Rescheduled No Show</option>
                    </select>
                  </div>

                  {/* Remarks Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
                    <textarea
                      name="remarks"
                      value={formData.remarks}
                      onChange={handleChange}
                      disabled={isFormReadOnly}
                      rows={3}
                      className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 resize-none disabled:bg-gray-100"
                      placeholder="Enter remarks about the demo..."
                    />
                  </div>

                  {/* Zoom Meeting Links */}
                  {formData.meetingStartUrl && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Host Link</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={formData.meetingStartUrl}
                            disabled
                            className="flex-1 px-3 py-2 border rounded text-sm bg-gray-50 text-gray-600 cursor-not-allowed"
                          />
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(formData.meetingStartUrl || '');
                              alert('Host link copied to clipboard!');
                            }}
                            className="px-3 py-2 bg-gray-900 text-white rounded text-sm hover:bg-gray-800 transition-colors"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Join Link</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={formData.meetingJoinUrl}
                            disabled
                            className="flex-1 px-3 py-2 border rounded text-sm bg-gray-50 text-gray-600 cursor-not-allowed"
                          />
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(formData.meetingJoinUrl || '');
                              alert('Join link copied to clipboard!');
                            }}
                            className="px-3 py-2 bg-gray-900 text-white rounded text-sm hover:bg-gray-800 transition-colors"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => router.back()}
                      className="flex-1 px-4 py-2 border text-gray-700 rounded hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                    
                    {/* Only show save/update button if not in view mode */}
                    {!isViewMode && (
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {loading ? 'Saving...' : (formData._id ? 'Update Demo' : 'Save Demo')}
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">📚</span>
                  </div>
                  <h4 className="text-lg font-medium text-gray-800 mb-2">Select a Subject</h4>
                  <p className="text-gray-600 text-sm">Choose a subject to manage its demo session</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}