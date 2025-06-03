
'use client';

import { useState } from 'react';

// Import board data
import { BoardDataUtils } from '../boardData';

export default function LeadForm() {

  interface LeadData {
    studentName: string;
    studentPhone: string;
    parentPhone: string;
    email: string;
    board: string;
    class: string;
    subjects: string[];
    leadSource: string;
    classesPerWeek: number;
    courseInterested: string;
    modeOfContact: string;
    preferredTimeSlots: string;
    counsellor: string;
    sessionEndDate: string;
    remarks: string;
    notes: string;
  }

  const [formData, setFormData] = useState<LeadData>({
    studentName: '',
    studentPhone: '',
    parentPhone: '',
    email: '',
    board: '',
    class: '',
    subjects: [],
    leadSource: '',
    classesPerWeek: 1,
    courseInterested: '',
    modeOfContact: '',
    preferredTimeSlots:'',
    counsellor: '',
    sessionEndDate: '',
    remarks: '',
    notes: '',
  });
     
    const baseUrl =process.env. BASE_URL;


  const [errors, setErrors] = useState<Partial<Record<keyof LeadData, string>>>({});
  const [loading, setLoading] = useState(false);

  // Constants
  const BOARDS = BoardDataUtils.getBoards();
  const LEAD_SOURCES = ['website', 'referral', 'social_media', 'other'];
  const MODES_OF_CONTACT = ['phone', 'whatsapp', 'email'];

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
      let newFormData;
      
      if (type === 'number') {
        newFormData = { ...prev, [name]: Number(value) };
      } else {
        newFormData = { ...prev, [name]: value };
      }
      
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

  

  const validate = () => {
    const newErrors: Partial<Record<keyof LeadData, string>> = {};

    // studentName: required, min length 3
    if (!formData.studentName) {
      newErrors.studentName = 'Student name is required';
    } else if (formData.studentName.length < 3) {
      newErrors.studentName = 'Student name must be at least 3 characters';
    }

    // studentPhone: required, exactly 10 digits
    if (!formData.studentPhone) {
      newErrors.studentPhone = 'Student phone number is required';
    } else if (!/^\d{10}$/.test(formData.studentPhone)) {
      newErrors.studentPhone = 'Student phone must be exactly 10 digits';
    }

    // parentPhone: required, exactly 10 digits
    if (!formData.parentPhone) {
      newErrors.parentPhone = 'Parent phone number is required';
    } else if (!/^\d{10}$/.test(formData.parentPhone)) {
      newErrors.parentPhone = 'Parent phone must be exactly 10 digits';
    }

    // email: optional, but if provided must be valid format
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    // board: required, must be one of enum values
    if (!formData.board) {
      newErrors.board = 'Board is required';
    } else if (!BOARDS.includes(formData.board)) {
      newErrors.board = `Board must be one of: ${BOARDS.join(', ')}`;
    }

    // class: required
    if (!formData.class) {
      newErrors.class = 'Class is required';
    }

    // subjects: required array with at least one item
    if (!formData.subjects || !Array.isArray(formData.subjects) || formData.subjects.length === 0) {
      newErrors.subjects = 'At least one subject is required';
    }

    // leadSource: required, enum check
    if (!formData.leadSource) {
      newErrors.leadSource = 'Lead source is required';
    } else if (!LEAD_SOURCES.includes(formData.leadSource)) {
      newErrors.leadSource = `Lead source must be one of: ${LEAD_SOURCES.join(', ')}`;
    }

    // classesPerWeek: required, number between 1 and 7
    if (formData.classesPerWeek === undefined || formData.classesPerWeek === null) {
      newErrors.classesPerWeek = 'Classes per week is required';
    } else if (formData.classesPerWeek < 1 || formData.classesPerWeek > 7) {
      newErrors.classesPerWeek = 'Classes per week must be between 1 and 7';
    }

    // courseInterested: required, non-empty string
    if (!formData.courseInterested) {
      newErrors.courseInterested = 'Course interested is required';
    }

    // modeOfContact: required, enum check
    if (!formData.modeOfContact) {
      newErrors.modeOfContact = 'Mode of contact is required';
    } else if (!MODES_OF_CONTACT.includes(formData.modeOfContact)) {
      newErrors.modeOfContact = `Mode of contact must be one of: ${MODES_OF_CONTACT.join(', ')}`;
    }

    // counsellor: required, non-empty string
    if (!formData.counsellor) {
      newErrors.counsellor = 'Counsellor is required';
    }

    // sessionEndDate: optional, but if present, must be a valid date string
    if (formData.sessionEndDate) {
      const date = new Date(formData.sessionEndDate);
      if (isNaN(date.getTime())) {
        newErrors.sessionEndDate = 'Invalid session end date';
      }
    }

    return newErrors;
  };
   
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/api/leads/addlead`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit lead');
      }

      const data = await response.json();
      console.log('Lead submitted:', data);
      
      // Reset form
      setFormData({
        studentName: '',
        studentPhone: '',
        parentPhone: '',
        email: '',
        board: '',
        class: '',
        subjects: [],
        leadSource: '',
        classesPerWeek: 1,
        courseInterested: '',
        modeOfContact: '',
        counsellor: '',
        sessionEndDate: '',
        preferredTimeSlots:'',
        remarks: '',
        notes: '',
      });
      setErrors({});
      
      // Call success callback if provided
      // if (onSuccess) {
      //   onSuccess();
      // }

      alert('Form submitted successfully!');
    } catch (error) {
      console.error('Error submitting lead:', error);
      alert('Something went wrong while submitting. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <form
        onSubmit={handleSubmit}
        className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md space-y-6 text-black"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Lead Form</h1>

        {/* Student Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Student Name</label>
          <input
            type="text"
            name="studentName"
            value={formData.studentName}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          {errors.studentName && <p className="text-red-500 text-sm mt-1">{errors.studentName}</p>}
        </div>

        {/* Student Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Student Phone</label>
          <input
            type="tel"
            name="studentPhone"
            value={formData.studentPhone}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          {errors.studentPhone && <p className="text-red-500 text-sm mt-1">{errors.studentPhone}</p>}
        </div>

        {/* Parent Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Parent Phone</label>
          <input
            type="tel"
            name="parentPhone"
            value={formData.parentPhone}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          {errors.parentPhone && <p className="text-red-500 text-sm mt-1">{errors.parentPhone}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        {/* Board */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Board</label>
          <select
            name="board"
            value={formData.board}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select Board</option>
            {BOARDS.map((board) => (
              <option key={board} value={board}>{board}</option>
            ))}
          </select>
          {errors.board && <p className="text-red-500 text-sm mt-1">{errors.board}</p>}
        </div>

        {/* Class */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
          <select
            name="class"
            value={formData.class}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            disabled={!formData.board}
          >
            <option value="">Select Class</option>
            {getAvailableClasses().map((className) => (
              <option key={className} value={className}>{className}</option>
            ))}
          </select>
          {errors.class && <p className="text-red-500 text-sm mt-1">{errors.class}</p>}
        </div>

        {/* Subjects */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subjects (Select multiple)
          </label>
          {formData.board && formData.class ? (
            <div className="border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto">
              {getAvailableSubjects().map((subject) => (
                <label key={subject} className="flex items-center space-x-2 mb-2">
                  <input
                    type="checkbox"
                    checked={formData.subjects?.includes(subject) || false}
                    onChange={() => handleSubjectChange(subject)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">{subject}</span>
                </label>
              ))}
            </div>
          ) : (
            <div className="border border-gray-300 rounded-md p-3 text-gray-500 text-sm">
              Please select Board and Class first to see available subjects
            </div>
          )}
          {formData.subjects && formData.subjects.length > 0 && (
            <div className="mt-2 text-sm text-gray-600">
              Selected: {formData.subjects.join(', ')}
            </div>
          )}
          {errors.subjects && <p className="text-red-500 text-sm mt-1">{errors.subjects}</p>}
        </div>

        {/* Lead Source */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Lead Source</label>
          <select
            name="leadSource"
            value={formData.leadSource}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select Lead Source</option>
            <option value="website">Website</option>
            <option value="referral">Referral</option>
            <option value="social_media">Social Media</option>
            <option value="other">Other</option>
          </select>
          {errors.leadSource && <p className="text-red-500 text-sm mt-1">{errors.leadSource}</p>}
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
            className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          {errors.classesPerWeek && <p className="text-red-500 text-sm mt-1">{errors.classesPerWeek}</p>}
        </div>

        {/* Course Interested */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Course Interested</label>
          <input
            type="text"
            name="courseInterested"
            value={formData.courseInterested}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          {errors.courseInterested && <p className="text-red-500 text-sm mt-1">{errors.courseInterested}</p>}
        </div>

        {/* Mode of Contact */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Mode of Contact</label>
          <select
            name="modeOfContact"
            value={formData.modeOfContact}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select Mode</option>
            <option value="phone">Phone</option>
            <option value="email">Email</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
          {errors.modeOfContact && <p className="text-red-500 text-sm mt-1">{errors.modeOfContact}</p>}
        </div>

        {/* Counsellor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Counsellor</label>
          <input
            type="text"
            name="counsellor"
            value={formData.counsellor}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          {errors.counsellor && <p className="text-red-500 text-sm mt-1">{errors.counsellor}</p>}
        </div>

        {/* Session End Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Session End Date</label>
          <input
            type="date"
            name="sessionEndDate"
            value={formData.sessionEndDate}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.sessionEndDate && <p className="text-red-500 text-sm mt-1">{errors.sessionEndDate}</p>}
        </div>

        {/* Preferred Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Time</label>
          <input
            type="time"
            name="preferredTimeSlots"
            value={formData.preferredTimeSlots}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.preferredTimeSlots && <p className="text-red-500 text-sm mt-1">{errors.preferredTimeSlots}</p>}
        </div>

        {/* Remarks */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
          <textarea
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition duration-200 font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Lead'}
        </button>
      </form>
    </div>
  );
}