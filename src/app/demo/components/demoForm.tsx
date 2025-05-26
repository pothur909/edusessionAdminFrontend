'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

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
  counsellor: string;
  sessionEndDate?: string;
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
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Demo>({
    lead: lead._id,
    date: '',
    time: '',
    teacher: '',
    board: lead.board || '',
    class: lead.class || '',
    subject: '',
    status: 'demo_scheduled',
    remarks: ''
  });

  // Add state for lead data with default values
  const [leadData, setLeadData] = useState<Lead>({
    ...lead,
    subjects: lead.subjects || [],
    board: lead.board || '',
    class: lead.class || '',
    status: lead.status || 'new'
  });

  useEffect(() => {
    const fetchDemo = async () => {
      if (!lead._id) {
        console.error('No lead ID available');
        return;
      }

      try {
        // First fetch lead data to ensure we have latest subjects
        const leadResponse = await fetch(`http://localhost:6969/api/leads/viewleads`);
        const leadData = await leadResponse.json();
        if (leadData.success) {
          const updatedLead = leadData.data.find((l: Lead) => l._id === lead._id);
          if (updatedLead) {
            setLeadData({
              ...updatedLead,
              subjects: updatedLead.subjects || []
            });
          }
        }

        // Then fetch demo data
        const response = await fetch(`http://localhost:6969/api/demo/view/${lead._id}`);
        const data: DemoResponse = await response.json();
        console.log('Demo fetch response:', data);

        if (data.success) {
          // Update demo data if available
          if (data.demos && data.demos.length > 0) {
            const existingDemo = data.demos[0]; // Get the most recent demo
            setFormData({
              _id: existingDemo._id,
              lead: lead._id,
              date: existingDemo.date ? new Date(existingDemo.date).toISOString().split('T')[0] : '',
              time: existingDemo.time || '',
              teacher: existingDemo.teacher || '',
              board: existingDemo.board || lead.board || '',
              class: existingDemo.class || lead.class || '',
              subject: existingDemo.subject || '',
              status: existingDemo.status || 'demo_scheduled',
              remarks: existingDemo.remarks || ''
            });
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchDemo();
  }, [lead._id]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.subject || !formData.date || !formData.time) {
        alert('Please fill in all required fields (Subject, Date, and Time)');
        return;
      }

      // First update lead data with the new status
      const leadResponse = await fetch(`http://localhost:6969/api/leads/editlead/${lead._id}`, {
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
    <div className="max-w-3xl mx-auto p-6 text-black">
      <h2 className="text-2xl font-bold mb-4">
        {formData._id ? 'Edit Demo' : 'Schedule Demo'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6 text-black">
        {/* Lead Information Section */}
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <h3 className="text-lg font-medium mb-4">Lead Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student Name *</label>
              <input
                type="text"
                name="studentName"
                value={leadData.studentName}
                onChange={handleChange}
                required
                className="border p-3 rounded-md w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student Phone *</label>
              <input
                type="text"
                name="studentPhone"
                value={leadData.studentPhone}
                onChange={handleChange}
                required
                className="border p-3 rounded-md w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parent Phone</label>
              <input
                type="text"
                name="parentPhone"
                value={leadData.parentPhone}
                onChange={handleChange}
                className="border p-3 rounded-md w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={leadData.email}
                onChange={handleChange}
                className="border p-3 rounded-md w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Board *</label>
              <input
                type="text"
                name="board"
                value={leadData.board}
                onChange={handleChange}
                required
                className="border p-3 rounded-md w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class *</label>
              <input
                type="text"
                name="class"
                value={leadData.class}
                onChange={handleChange}
                required
                className="border p-3 rounded-md w-full"
              />
            </div>
          </div>
        </div>

        {/* Demo Information Section */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-medium mb-4">Demo Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teacher *</label>
              <input
                type="text"
                name="teacher"
                value={formData.teacher}
                onChange={handleChange}
                required
                className="border p-3 rounded-md w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="border p-3 rounded-md w-full"
              >
                <option value="">Select a subject</option>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="border p-3 rounded-md w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
                className="border p-3 rounded-md w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="border p-3 rounded-md w-full"
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
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              className="border p-3 rounded-md w-full"
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Demo'}
          </button>
        </div>
      </form>
    </div>
  );
}


