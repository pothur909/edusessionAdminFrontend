
'use client';

import { useEffect, useState } from 'react';

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
  status: 'demo_scheduled' | 'demo_completed' | 'demo_cancelled' | 'demo_no_show' | 'demo_rescheduled' | 'demo_rescheduled_cancelled' | 'demo_rescheduled_completed' | 'demo_rescheduled_no_show';
  remarks: string;
  preferredTimeSlots: string;
}

interface DemoResponse {
  success: boolean;
  message: string;
  demos?: Demo[];
  lead?: Lead;
}

interface DemoLeadFormProps {
  lead: Lead;
  onComplete: () => void;
  onCancel: () => void;
}

export default function DemoLeadForm({ lead, onComplete, onCancel }: DemoLeadFormProps) {
  const [loading, setLoading] = useState(false);
  
  // Create default lead if not provided
  const defaultLead: Lead = {
    _id: '',
    studentName: '',
    studentPhone: '',
    parentPhone: '',
    email: '',
    board: '',
    class: '',
    subjects: [],
    status: 'new',
    notes: '',
    createdAt: '',
    updatedAt: '',
    leadSource: '',
    classesPerWeek: 0,
    courseInterested: '',
    modeOfContact: '',
    preferredTimeSlots: '',
    counsellor: '',
    sessionEndDate: '',
    remarks: ''
  };

  const currentLead = lead || defaultLead;

  const [formData, setFormData] = useState<Demo>({
    lead: currentLead._id,
    date: '',
    time: '',
    teacher: '',
    board: currentLead.board || '',
    class: currentLead.class || '',
    subject: '',
    status: 'demo_scheduled',
    remarks: '',
    preferredTimeSlots: currentLead.preferredTimeSlots || '', 
  });

  // Add state for lead data with default values
  const [leadData, setLeadData] = useState<Lead>({
    ...currentLead,
    subjects: currentLead.subjects || [],
    board: currentLead.board || '',
    class: currentLead.class || '',
    status: currentLead.status || 'new'
  });

  useEffect(() => {
    const fetchDemo = async () => {
      if (!currentLead._id) {
        console.error('No lead ID available');
        return;
      }

      try {
        // First fetch lead data to ensure we have latest subjects
        const leadResponse = await fetch(`http://localhost:6969/api/leads/viewleads`);
        const leadData = await leadResponse.json();
        if (leadData.success) {
          const updatedLead = leadData.data.find((l: Lead) => l._id === currentLead._id);
          if (updatedLead) {
            setLeadData({
              ...updatedLead,
              subjects: updatedLead.subjects || []
            });
          }
        }

        // Then fetch demo data
        const response = await fetch(`http://localhost:6969/api/demo/view/${currentLead._id}`);
        const data: DemoResponse = await response.json();
        console.log('Demo fetch response:', data);

        if (data.success) {
          // Update demo data if available
          if (data.demos && data.demos.length > 0) {
            const existingDemo = data.demos[0]; // Get the most recent demo
            setFormData({
              _id: existingDemo._id,
              lead: currentLead._id,
              date: existingDemo.date ? new Date(existingDemo.date).toISOString().split('T')[0] : '',
              time: existingDemo.time || '',
              teacher: existingDemo.teacher || '',
              board: existingDemo.board || currentLead.board || '',
              class: existingDemo.class || currentLead.class || '',
              subject: existingDemo.subject || '',
              status: existingDemo.status || 'demo_scheduled',
              remarks: existingDemo.remarks || '',
              preferredTimeSlots: currentLead.preferredTimeSlots || '',
            });
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchDemo();
  }, [currentLead._id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    // Handle lead data changes
    if (name in leadData) {
      setLeadData(prev => ({ ...prev, [name]: value }));
    }
    
    // Handle demo data changes
    if (name in formData) {
      setFormData(prev => ({ ...prev, [name]: value }));

      // If status is changed, update lead status as well
      if (name === 'status') {
        setLeadData(prev => ({ ...prev, status: value }));
      }
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.subject || !formData.date || !formData.time) {
        alert('Please fill in all required fields (Subject, Date, and Time)');
        return;
      }

      // First update lead data with the new status
      const leadResponse = await fetch(`http://localhost:6969/api/leads/editlead/${currentLead._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...leadData,
          status: formData.status // Ensure lead status matches demo status
        }),
      });

      if (!leadResponse.ok) {
        throw new Error(`Failed to update lead: ${leadResponse.statusText}`);
      }

      const leadResult = await leadResponse.json();
      if (!leadResult.success) {
        throw new Error(leadResult.message || 'Failed to update lead');
      }

      // Then update/create demo
      const url = formData._id 
        ? `http://localhost:6969/api/demo/edit/${formData._id}`
        : 'http://localhost:6969/api/demo/add';
      
      const method = formData._id ? 'PUT' : 'POST';
      
      console.log('Submitting demo data:', formData);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Failed to save demo: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Response:', data);

      if (data.success) {
        alert('Demo saved successfully');
        onComplete();
      } else {
        throw new Error(data.message || 'Failed to save demo');
      }
    } catch (error) {
      console.error('Error saving:', error);
      alert(error instanceof Error ? error.message : 'An error occurred while saving');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 mb-8">
          {formData._id ? 'Edit Demo' : 'Schedule Demo'}
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Lead Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Student Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Student Name</label>
                <input
                  type="text"
                  name="studentName"
                  value={leadData.studentName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter student name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Student Phone</label>
                <input
                  type="text"
                  name="studentPhone"
                  value={leadData.studentPhone}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Parent Phone</label>
                <input
                  type="text"
                  name="parentPhone"
                  value={leadData.parentPhone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter parent phone"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={leadData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email address"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Board</label>
                  <input
                    type="text"
                    name="board"
                    value={leadData.board}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter board"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
                  <input
                    type="text"
                    name="class"
                    value={leadData.class}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter class"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Time</label>
                <input
                  type="time"
                  name="preferredTimeSlots"
                  value={formData.preferredTimeSlots}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Session End</label>
                <input
                  type="date"
                  name="sessionEndDate"
                  value={leadData.sessionEndDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Right Column - Demo Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Demo Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Teacher Allotted for Demo</label>
                <input
                  type="text"
                  name="teacher"
                  value={formData.teacher}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter teacher name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject for Demo</label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Subject</option>
                  {leadData.subjects && leadData.subjects.length > 0 ? (
                    leadData.subjects.map((subject, index) => (
                      <option key={index} value={subject}>
                        {subject}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No subjects available</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Demo Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Demo Time</label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="demo_scheduled">Scheduled</option>
                  <option value="demo_completed">Completed</option>
                  <option value="demo_cancelled">Cancelled</option>
                  <option value="demo_no_show">No Show</option>
                  <option value="demo_rescheduled">Rescheduled</option>
                  <option value="demo_rescheduled_cancelled">Rescheduled Cancelled</option>
                  <option value="demo_rescheduled_completed">Rescheduled Completed</option>
                  <option value="demo_rescheduled_no_show">Rescheduled No Show</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Type here..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Saving...' : 'Save Demo'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

