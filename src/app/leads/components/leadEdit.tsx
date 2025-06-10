'use client';

import { useState, useEffect } from 'react';

interface BoardData {
  _id: {
    $oid: string;
  };
  board: string;
  classes: Array<{
    _id: {
      $oid: string;
    };
    name: string;
    subjects: string[];
  }>;
  __v: number;
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
  preferredTimeSlots: string;
  counsellor: string;
  sessionBeginDate: string;
  sessionEndDate: string;
  remarks: string[];
}

interface EditLeadFormProps {
  lead: Lead;
  onComplete: () => void;
}

const LEAD_SOURCES = ['website', 'referral', 'social_media', 'other'];
const MODES_OF_CONTACT = ['phone', 'whatsapp', 'email'];
const STATUSES = [
  "new",
  "contacted",
  "converted",
  "not_interested",
  "demo_scheduled",
  "demo_completed",
  "demo_cancelled",
  "demo_no_show",
  "demo_rescheduled",
  "demo_rescheduled_cancelled",
  "demo_rescheduled_completed",
  "demo_rescheduled_no_show",
  "no_response_from_Lead",
];

export default function EditLeadForm({ lead, onComplete }: EditLeadFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(lead);
  const [boardData, setBoardData] = useState<BoardData[]>([]);
  const [boardLoading, setBoardLoading] = useState(true);
  const [newRemark, setNewRemark] = useState('');
  const baseUrl = process.env.BASE_URL;

  // Fetch board data on component mount
  useEffect(() => {
    const fetchBoardData = async () => {
      try {
        const response = await fetch(`${baseUrl}/api/admin/get-board-trees`);
        if (!response.ok) {
          throw new Error('Failed to fetch board data');
        }
        const data = await response.json();
        setBoardData(data);
      } catch (error) {
        console.error('Error fetching board data:', error);
        alert('Failed to load board data. Please refresh the page.');
      } finally {
        setBoardLoading(false);
      }
    };

    fetchBoardData();
  }, []);

  // Get available boards
  const getAvailableBoards = () => {
    return boardData.map(board => board.board);
  };

  // Get available classes for selected board
  const getAvailableClasses = () => {
    const selectedBoard = boardData.find(b => b.board === formData.board);
    if (!selectedBoard) return [];
    return selectedBoard.classes.map(cls => cls.name);
  };

  // Get available subjects for selected board and class
  const getAvailableSubjects = () => {
    const selectedBoard = boardData.find(b => b.board === formData.board);
    if (!selectedBoard) return [];

    const selectedClass = selectedBoard.classes.find(cls => cls.name === formData.class);
    return selectedClass?.subjects || [];
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newFormData = { ...prev, [name]: value };

      // Reset class and subjects when board changes
      if (name === "board") {
        newFormData.class = "";
        newFormData.subjects = [];
      }

      // Reset subjects when class changes
      if (name === "class") {
        newFormData.subjects = [];
      }

      return newFormData;
    });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubjectChange = (subject: string) => {
    setFormData((prev) => {
      const currentSubjects = prev.subjects || [];
      const isSelected = currentSubjects.includes(subject);

      if (isSelected) {
        return {
          ...prev,
          subjects: currentSubjects.filter((s) => s !== subject),
        };
      } else {
        return {
          ...prev,
          subjects: [...currentSubjects, subject],
        };
      }
    });
  };

  // Handle adding a new remark
  const addRemark = () => {
    if (newRemark.trim()) {
      setFormData((prev) => ({
        ...prev,
        remarks: [...prev.remarks, newRemark.trim()],
      }));
      setNewRemark("");
    }
  };

  // Add this function before handleSubmit
  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const formatDateForSubmission = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Prepare data for submission
      const submissionData = {
        ...formData,
        sessionEndDate: formData.sessionEndDate
          ? formatDateForSubmission(formData.sessionEndDate)
          : "",
      };

      const response = await fetch(
        `${baseUrl}/api/leads/editlead/${lead._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(submissionData), // Use submissionData instead of formData
        }
      );

      const data = await response.json();
      if (data.success) {
        onComplete(); // Call the onComplete callback to close the form
      } else {
        throw new Error(data.message || 'Failed to update lead');
      }
    } catch (error) {
      console.error("Error:", error);
      alert('Failed to update lead. Please try again.');
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Name : {formData.studentName}
            </h2>
            <p
              className={`text-sm text-gray-600 mt-1 p-3 rounded ${getStatusColor(
                lead.status
              )}`}
            >
              {formData.status}
            </p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Student Details */}
              <div className="space-y-5">
                <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                  Student Details
                </h3>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    required
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status
                          .split("_")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1)
                          )
                          .join(" ")}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Student Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student Name
                  </label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student Phone
                  </label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parent Phone
                  </label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lead Source
                  </label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Interested
                  </label>
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
                <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                  Course Details
                </h3>

                {/* Board */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Board
                  </label>
                  <select
                    name="board"
                    value={formData.board}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    required
                    disabled={boardLoading}
                  >
                    <option value="">Select Board</option>
                    {getAvailableBoards().map((boardName) => (
                      <option key={boardName} value={boardName}>{boardName}</option>
                    ))}
                  </select>
                  {boardLoading && <p className="text-gray-500 text-sm mt-1">Loading boards...</p>}
                </div>

                {/* Class */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Class
                  </label>
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
                      <option key={className} value={className}>
                        {className}
                      </option>
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
                        <label
                          key={subject}
                          className="flex items-center space-x-2 mb-2 text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={
                              formData.subjects?.includes(subject) || false
                            }
                            onChange={() => handleSubjectChange(subject)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                          />
                          <span>{subject}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="border border-gray-300 rounded-md p-3 text-gray-500 text-sm bg-gray-50">
                      Please select Board and Class first to see available
                      subjects
                    </div>
                  )}
                  {formData.subjects && formData.subjects.length > 0 && (
                    <div className="mt-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      Selected: {formData.subjects.join(", ")}
                    </div>
                  )}
                </div>

                {/* Counsellor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Counsellor
                  </label>
                  <input
                    type="text"
                    name="counsellor"
                    value={formData.counsellor}
                    onChange={handleChange}
                    placeholder="Enter counsellor name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    
                  />
                </div>

                {/* Classes per Week */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Classes per Week
                  </label>
                  <input
                    type="number"
                    name="classesPerWeek"
                    value={formData.classesPerWeek}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        [e.target.name]: e.target.value,
                      })
                    }
                    onInput={(e: React.FormEvent<HTMLInputElement>) => {
                      const value = Number(e.currentTarget.value);
                      if (value > 7) {
                        e.currentTarget.value = '7';
                      }
                      if (value < 1 && e.currentTarget.value !== "") {
                        e.currentTarget.value = '1';
                      }
                    }}
                    min="1"
                    max="7"
                    placeholder="Enter number of classes"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* Session Start date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Begin Date
                  </label>
                  
                  {formData.sessionBeginDate && (
                    <p className="text-xs text-gray-500 mt-1">
                    {formatDateForDisplay(formData.sessionBeginDate)}
                    </p>
                  )}
                </div>

                {/* Session End Date */}
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session End Date
                  </label>
                  <input
                    type="date"
                    name="sessionEndDate"
                    value={formData.sessionEndDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div> */}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session End Date
                  </label>
                  <input
                    type="date"
                    name="sessionEndDate"
                    value={formData.sessionEndDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {/* Debug info - remove in production */}
                  {formData.sessionEndDate && (
                    <div className="text-xs text-gray-500 mt-1">
                      Selected: {formData.sessionEndDate}
                    </div>
                  )}
                </div>

                {/* Preferred Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Time
                  </label>
                  <input
                    type="text"
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
              {/* Remarks - Modified to handle array properly */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remarks
                </label>

                {/* Display existing remarks (non-editable) */}
                {formData.remarks.length > 0 && (
                  <div className="mb-3">
                    <div className="text-xs text-gray-600 mb-2">
                      Existing Remarks (Read-only):
                    </div>
                    <div className="border border-gray-300 rounded-md p-3 max-h-32 overflow-y-auto bg-gray-50">
                      {formData.remarks.map((remark, index) => (
                        <div
                          key={index}
                          className="bg-white p-2 rounded mb-2 last:mb-0 text-sm border-l-4 border-blue-400"
                        >
                          <span className="text-gray-700">{remark}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input for new remark */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newRemark}
                    onChange={(e) => setNewRemark(e.target.value)}
                    placeholder="Add a new remark..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addRemark();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={addRemark}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200 text-sm"
                  >
                    Add
                  </button>
                </div>

                {formData.remarks.length === 0 && (
                  <div className="text-gray-500 text-sm italic mt-2">
                    No remarks added yet
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
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
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Updating...
                  </span>
                ) : (
                  "Update Lead"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
