

'use client';

import { useState } from 'react';
import { BoardDataUtils } from '../boardData';

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
  classesPerWeek: number;
  courseInterested: string;
  modeOfContact: string;
  preferredTimeSlots: string;
  counsellor: string;
  sessionEndDate: string;
  remarks: string;
}

interface EditLeadFormProps {
  lead: Lead;
  onComplete: () => void;
}

const BOARDS = BoardDataUtils.getBoards();
const LEAD_SOURCES = ['website', 'referral', 'social_media', 'other'];
const MODES_OF_CONTACT = ['phone', 'whatsapp', 'email'];
const STATUSES = [
  'new', 'contacted', 'converted', 'not_interested',
  'demo_scheduled', 'demo_completed', 'demo_cancelled', 'demo_no_show',
  'demo_rescheduled', 'demo_rescheduled_cancelled',
  'demo_rescheduled_completed', 'demo_rescheduled_no_show',
  'no_response_from_Lead'
];




export default function EditLeadForm({ lead, onComplete }: EditLeadFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(lead);

  // Get available classes for selected board
  const getAvailableClasses = () => {
    return BoardDataUtils.getClassesForBoard(formData.board);
  };

  // Get available subjects for selected board and class
  const getAvailableSubjects = () => {
    return BoardDataUtils.getSubjectsForBoardAndClass(formData.board, formData.class);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    setFormData(prev => {
      let newFormData = { ...prev, [name]: value };

      // Reset class and subjects when board changes
      if (name === 'board') {
        newFormData.class = '';
        newFormData.subjects = [];
      }
      
      // Reset subjects when class changes
      if (name === 'class') {
        newFormData.subjects = [];
      }
      
      return newFormData;
    });
  };

  const handleSubjectChange = (subject: string) => {
    setFormData(prev => {
      const currentSubjects = prev.subjects || [];
      const isSelected = currentSubjects.includes(subject);
      
      if (isSelected) {
        // Remove subject
        return {
          ...prev,
          subjects: currentSubjects.filter(s => s !== subject)
        };
      } else {
        // Add subject
        return {
          ...prev,
          subjects: [...currentSubjects, subject]
        };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
       try {
      const response = await fetch(`http://localhost:6969/api/leads/editlead/${lead._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        onComplete();  // Call the onComplete callback to close the form
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }

  };


   const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-yellow-100 text-yellow-800';
      case 'contacted':
        return 'bg-blue-100 text-blue-800';
      case 'converted':
        return 'bg-green-100 text-green-800';
      case 'not_interested':
        return 'bg-red-100 text-red-800';
      case 'demo_scheduled':
        return 'bg-purple-100 text-purple-800';
      case 'demo_completed':
        return 'bg-green-100 text-green-800';
      case 'demo_cancelled':
        return 'bg-red-100 text-red-800';
      case 'demo_no_show':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Name : {formData.studentName }</h2>
            <p className={`text-sm text-gray-600 mt-1 p-3 rounded ${getStatusColor(lead.status)}`}>{formData.status}</p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Student Details */}
              <div className="space-y-5">
                <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">Student Details</h3>
                
                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    required
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Student Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Student Name</label>
                  <input
                    type="text"
                    name="studentName"
                    value={formData.studentName}
                    onChange={handleChange}
                    placeholder="Enter student name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* Student Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Student Phone</label>
                  <input
                    type="tel"
                    name="studentPhone"
                    value={formData.studentPhone}
                    onChange={handleChange}
                    placeholder="Enter student phone"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* Parent Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Parent Phone</label>
                  <input
                    type="tel"
                    name="parentPhone"
                    value={formData.parentPhone}
                    onChange={handleChange}
                    placeholder="Enter parent phone"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* Lead Source */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lead Source</label>
                  <select
                    name="leadSource"
                    value={formData.leadSource}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    required
                  >
                    <option value="">Select Lead Source</option>
                    <option value="website">Website</option>
                    <option value="referral">Referral</option>
                    <option value="social_media">Social Media</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Course Interested */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Course Interested</label>
                  <input
                    type="text"
                    name="courseInterested"
                    value={formData.courseInterested}
                    onChange={handleChange}
                    placeholder="Enter course name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Right Column - Course Details */}
              <div className="space-y-5">
                <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">Course Details</h3>

                {/* Board */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Board</label>
                  <select
                    name="board"
                    value={formData.board}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    required
                  >
                    <option value="">Select Board</option>
                    {BOARDS.map((board) => (
                      <option key={board} value={board}>{board}</option>
                    ))}
                  </select>
                </div>

                {/* Class */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
                  <select
                    name="class"
                    value={formData.class}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white disabled:bg-gray-100"
                    required
                    disabled={!formData.board}
                  >
                    <option value="">Select Class</option>
                    {getAvailableClasses().map((className) => (
                      <option key={className} value={className}>{className}</option>
                    ))}
                  </select>
                </div>

                {/* Subjects */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subjects (Select multiple)
                  </label>
                  {formData.board && formData.class ? (
                    <div className="border border-gray-300 rounded-md p-3 max-h-40 overflow-y-auto bg-gray-50">
                      {getAvailableSubjects().map((subject) => (
                        <label key={subject} className="flex items-center space-x-2 mb-2 text-sm">
                          <input
                            type="checkbox"
                            checked={formData.subjects?.includes(subject) || false}
                            onChange={() => handleSubjectChange(subject)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                          />
                          <span>{subject}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="border border-gray-300 rounded-md p-3 text-gray-500 text-sm bg-gray-50">
                      Please select Board and Class first to see available subjects
                    </div>
                  )}
                  {formData.subjects && formData.subjects.length > 0 && (
                    <div className="mt-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      Selected: {formData.subjects.join(', ')}
                    </div>
                  )}
                </div>

                {/* Counsellor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Counsellor</label>
                  <input
                    type="text"
                    name="counsellor"
                    value={formData.counsellor}
                    onChange={handleChange}
                    placeholder="Enter counsellor name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* Classes per Week */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Classes per Week</label>
                  <input
                    type="number"
                    name="classesPerWeek"
                    value={formData.classesPerWeek}
                    onChange={handleChange}
                    min={1}
                    max={7}
                    placeholder="Enter number of classes"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* Session End Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Session End Date</label>
                  <input
                    type="date"
                    name="sessionEndDate"
                    value={formData.sessionEndDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Preferred Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Time</label>
                  <input
                    type="time"
                    name="preferredTimeSlots"
                    value={formData.preferredTimeSlots}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Full Width Fields */}
            <div className="mt-6 space-y-5">
              {/* Remarks */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  placeholder="Enter any remarks..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={3}
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Enter additional notes..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={3}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onComplete}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </span>
                ) : (
                  'Update Lead'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}