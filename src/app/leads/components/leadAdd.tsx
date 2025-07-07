'use client';

import { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';

export function LeadForm({ formData, setFormData, teachers }: {
  formData: any,
  setFormData: (data: any) => void,
  teachers: any[],
}) {

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

  interface LeadData {
    studentName: string;
    studentPhone: string;
    parentPhone: string;
    email: string;
    board: string;
    class: string;
    subjects: string[];
    leadSource: string;
    classesPerWeek: string; // changed from number to string
    courseInterested: string;
    modeOfContact: string;
    preferredTimeSlots: string;
    counsellor: string;
    sesssionBeginDate: string;
    sessionEndDate: string;
    remarks: string[];
    notes: string;
  }

  const [boardData, setBoardData] = useState<BoardData[]>([]);
  const [loading, setLoading] = useState(false);
  const [boardLoading, setBoardLoading] = useState(true);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [phoneExists, setPhoneExists] = useState(false);
  const [phoneCheckLoading, setPhoneCheckLoading] = useState(false);
  const phoneCheckTimeout = useRef<NodeJS.Timeout | null>(null);

  const baseUrl =process.env.BASE_URL;

  const [errors, setErrors] = useState<Partial<Record<keyof LeadData, string>>>({});

  // Constants
  const LEAD_SOURCES = ['website', 'referral', 'social_media', 'other'];
  const MODES_OF_CONTACT = ['phone', 'whatsapp', 'email', 'social_media'];
  const COURSE_OPTIONS = [
    'Spoken English',
    'IELTS',
    'JEE',
    'NEET',
    'NDA',
    'Others',
    'Not Applicable',
  ];

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
    const boards = boardData.map(board => board.board);
    return [...boards, 'Not Applicable'];
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

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev: any) => {
      let newFormData;

      if (type === "number") {
        newFormData = { ...prev, [name]: Number(value) };
      } else {
        newFormData = { ...prev, [name]: value };
      }

      // Reset class and subjects when board changes
      if (name === "board") {
        if (value === "Not Applicable") {
          newFormData.class = "";
          newFormData.subjects = [];
        } else {
        newFormData.class = "";
        newFormData.subjects = [];
        }
      }

      // Reset subjects when class changes
      if (name === "class") {
        newFormData.subjects = [];
      }

      return newFormData;
    });
  };

  const handleSubjectChange = (subject: string) => {
    setFormData((prev: any) => {
      const currentSubjects = prev.subjects || [];
      const isSelected = currentSubjects.includes(subject);

      if (isSelected) {
        // Remove subject
        return {
          ...prev,
          subjects: currentSubjects.filter((s: string) => s !== subject),
        };
      } else {
        // Add subject
        return {
          ...prev,
          subjects: [...currentSubjects, subject],
        };
      }
    });
  };

  // Modified Excel upload handler: just store the file
  const handleExcelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExcelFile(e.target.files?.[0] || null);
  };

  // New function: process the file on Upload button click and submit to API (bulk upload)
  const handleExcelUpload = async () => {
    if (!excelFile) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const data = evt.target?.result;
      if (!data) return;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      if (jsonData.length < 2) {
        alert('Excel file must have at least two rows (header and data)');
        return;
      }
      const header = jsonData[0] as string[];
      const excelToFormMap: Record<string, keyof LeadData> = {
        'Student Name': 'studentName',
        'Student Phone': 'studentPhone',
        'Parent Phone': 'parentPhone',
        'Email': 'email',
        'Board': 'board',
        'Class': 'class',
        'Subjects': 'subjects',
        'Lead Source': 'leadSource',
        'Classes Per Week': 'classesPerWeek',
        'Course Interested': 'courseInterested',
        'Mode Of Contact': 'modeOfContact',
        'Preferred Time': 'preferredTimeSlots',
        'Counsellor': 'counsellor',
        'Session Begin Date': 'sesssionBeginDate',
        'Session End Date': 'sessionEndDate',
        'Remarks': 'remarks',
        'Notes': 'notes',
      };
      // Map all data rows to lead objects
      const leads: Partial<LeadData>[] = [];
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i] as (string | number)[];
        if (row.length === 0 || row.every(cell => cell === undefined || cell === null || cell === '')) continue;
        const tempFormData: Partial<LeadData> = {};
        header.forEach((col, idx) => {
          const formKey = excelToFormMap[col];
          if (!formKey) return;
          const value = row[idx];
          if (formKey === 'subjects' || formKey === 'remarks') {
            tempFormData[formKey] = typeof value === 'string' ? value.split(',').map(s => s.trim()) : [];
          } else if (formKey === 'classesPerWeek') {
            tempFormData[formKey] = Number(value) || 1;
          } else {
            tempFormData[formKey] = value as string;
          }
        });
        leads.push(tempFormData);
      }
      if (leads.length === 0) {
        alert('No valid data rows found in the Excel file.');
        return;
      }
      // POST to bulk API
      try {
        const response = await fetch(`${baseUrl}/api/leads/bulk-add`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(leads),
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || 'Failed to bulk upload leads');
        }
        alert(result.message || `${leads.length} leads uploaded successfully!`);
      } catch (error) {
        console.error(error);
        alert('Error uploading leads. Please check your data and try again.');
      }
      setExcelFile(null);
      const fileInput = document.getElementById('excel-upload-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    };
    reader.readAsBinaryString(excelFile);
  };

  // Excel template download function
  const handleDownloadTemplate = () => {
    const headers = [
      'studentName',
      'studentPhone',
      'parentPhone',
      'city',
      'email',
      'board',
      'class',
      'subjects',
      'leadSource',
      'classesPerWeek',
      'preferredTimeSlots',
      'courseInterested',
      'modeOfContact',
      'counsellor',
      'sessionBeginDate',
      'sessionEndDate',
      'remarks',
      'status',
      'notes',
      'assignedTo',
    ];
    const exampleRow = [
      'John Doe',
      '+919876543210',
      '+919123456789',
      'Delhi',
      'john@example.com',
      'CBSE',
      '10',
      'Math,Science',
      'website',
      3,
      'Morning,Evening',
      'Physics',
      'phone',
      'Counsellor Name',
      '2024-07-01',
      '2024-12-31',
      'Remark1,Remark2',
      'new',
      'Some notes here',
      '', // assignedTo (ObjectId, optional)
    ];
    const ws = XLSX.utils.aoa_to_sheet([headers, exampleRow]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'lead_form_template.xlsx');
  };

  // 4. Update validation logic
  const validate = () => {
    const newErrors: Partial<Record<keyof LeadData, string>> = {};
    if (!formData.studentName) {
      newErrors.studentName = "Student name is required";
    } else if (formData.studentName.length < 3) {
      newErrors.studentName = "Student name must be at least 3 characters";
    }
    if (!formData.studentPhone || !/^\+91\d{10}$/.test(formData.studentPhone)) {
      newErrors.studentPhone = "Enter a valid 10-digit phone number (e.g., +911234567890)";
    }
    if (!formData.parentPhone || !/^\+91\d{10}$/.test(formData.parentPhone)) {
      newErrors.parentPhone = "Enter a valid 10-digit phone number (e.g., +911234567890)";
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }

    // Determine if academic course (require board/class/subjects)
    const academicCourses = ['JEE', 'NEET', 'NDA', 'Others'];
    const isAcademic = academicCourses.includes(formData.courseInterested);

    if (isAcademic) {
      if (!formData.board || formData.board === 'Not Applicable') {
        newErrors.board = 'Board is required for academic courses.';
      }
      if (!formData.class) {
        newErrors.class = 'Class is required for academic courses.';
      }
      if (!formData.subjects || formData.subjects.length === 0) {
        newErrors.subjects = 'At least one subject is required for academic courses.';
      }
    }

    // If not academic, do not require board/class/subjects

    if (!formData.classesPerWeek || formData.classesPerWeek.trim() === "") {
      newErrors.classesPerWeek = "Classes per week is required";
    }
    if (!formData.leadSource) {
      newErrors.leadSource = "Lead source is required";
    } else if (!LEAD_SOURCES.includes(formData.leadSource)) {
      newErrors.leadSource = `Lead source must be one of: ${LEAD_SOURCES.join(", ")}`;
    }
    if (!formData.modeOfContact) {
      newErrors.modeOfContact = "Mode of contact is required";
    } else if (!MODES_OF_CONTACT.includes(formData.modeOfContact)) {
      newErrors.modeOfContact = `Mode of contact must be one of: ${MODES_OF_CONTACT.join(", ")}`;
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
    setLoading(true);
    try {
      let response, data;
      if (formData._id) {
        // Update existing lead
        response = await fetch(`${baseUrl}/api/leads/editlead/${formData._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } else {
        // Create new lead
        response = await fetch(`${baseUrl}/api/leads/addlead`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }
      data = await response.json();
      if (response.status === 400 && data.message) {
        alert(data.message);
        setLoading(false);
        return;
      }
      if (data && (data._id || (data.lead && data.lead._id))) {
        alert('Form submitted successfully!');
        // Reset form for new entry
        resetFormState();
      } else {
        alert(data.message || 'Error submitting lead');
      }
    } catch (error) {
      console.error('Error submitting lead:', error);
      alert('Something went wrong while submitting. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Save button handler
  const handleSaveLead = async (e: React.MouseEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      console.log('Saving lead with:', formData);
      let response, data;
      if (formData._id) {
        // Update existing lead
        response = await fetch(`${baseUrl}/api/leads/editlead/${formData._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } else {
        // Create new lead
        response = await fetch(`${baseUrl}/api/leads/addlead`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }
      data = await response.json();
      console.log('Lead save response:', data);
      if (response.status === 400 && data.message) {
        if (data.message.includes('Another lead with this phone number already exists')) {
          alert('Another lead with this phone number already exists!');
          setSaving(false);
          return;
        }
        if (data.message.includes('already exists')) {
          alert('Lead already exists with this phone number!');
          setSaving(false);
          return;
        }
      }
      if (data && (data._id || (data.lead && data.lead._id))) {
        setFormData((prev: any) => ({ ...prev, _id: data._id || (data.lead && data.lead._id) }));
        alert('Lead saved!');
      } else {
        alert(data.message || 'Error saving lead');
      }
    } catch (err) {
      console.error('Lead save error:', err);
      alert('Error saving lead');
    } finally {
      setSaving(false);
    }
  };

  // Live phone number check
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
    const value = '+91' + digits;
    setFormData((prev: any) => ({ ...prev, studentPhone: value }));
    setPhoneExists(false);
    if (phoneCheckTimeout.current) clearTimeout(phoneCheckTimeout.current);
    if (digits.length === 10) {
      setPhoneCheckLoading(true);
      phoneCheckTimeout.current = setTimeout(async () => {
        try {
          const res = await fetch(`${baseUrl}/api/leads/check-phone`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentPhone: value }),
          });
          const data = await res.json();
          setPhoneExists(data.exists);
        } catch {
          setPhoneExists(false);
        } finally {
          setPhoneCheckLoading(false);
        }
      }, 400);
    }
  };

  // After successful submit, reset all relevant state for a fresh form
  const resetFormState = () => {
    setFormData({
      studentName: "",
      studentPhone: "",
      parentPhone: "",
      email: "",
      board: "",
      class: "",
      subjects: [],
      leadSource: "",
      classesPerWeek: "",
      courseInterested: "",
      modeOfContact: "",
      preferredTimeSlots: "",
      counsellor: "",
      sesssionBeginDate: "",
      sessionEndDate: "",
      remarks: [],
      notes: "",
    });
    setErrors({});
    setPhoneExists(false);
    setPhoneCheckLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      {/* Excel Template Download & Upload Section (outside the form) */}
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow mb-8">
        <button
          type="button"
          onClick={handleDownloadTemplate}
          className="mb-2 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition"
        >
          Download Excel Template
        </button>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Excel Dump (Upload Excel to autofill)
        </label>
        <div className="flex items-center gap-2">
          <input
            id="excel-upload-input"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleExcelFileChange}
            className="border border-gray-300 p-2 rounded-md"
          />
          <button
            type="button"
            onClick={handleExcelUpload}
            disabled={!excelFile}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition disabled:opacity-50"
          >
            Upload
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">First row should be headers matching: Student Name, Student Phone, Parent Phone, Email, Board, Class, Subjects, Lead Source, Classes Per Week, Course Interested, Mode Of Contact, Preferred Time, Counsellor, Session Begin Date, Session End Date, Remarks, Notes</p>
      </div>
      <form
        onSubmit={handleSubmit}
        className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md space-y-6 text-black"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Lead Form</h1>

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
            className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          {errors.studentName && (
            <p className="text-red-500 text-sm mt-1">{errors.studentName}</p>
          )}
        </div>

        {/* Student Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Student Phone
          </label>
          <div className="flex">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-100 text-gray-600 text-sm">
              +91
            </span>
            <input
              type="text"
              name="studentPhone"
              value={formData.studentPhone.replace('+91', '')}
              onChange={handlePhoneChange}
              className="w-full border border-gray-300 p-3 rounded-r-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="1234567890"
              maxLength={10}
              disabled={!!formData._id}
            />
          </div>
          {phoneCheckLoading && <p className="text-gray-500 text-sm mt-1">Checking phone number...</p>}
          {phoneExists && (
            <p className="text-red-500 text-sm mt-1">A lead with this phone number already exists. Please use a different number.</p>
          )}
          {errors.studentPhone && (
            <p className="text-red-500 text-sm mt-1">{errors.studentPhone}</p>
          )}
        </div>

        {/* Parent Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Parent Phone
          </label>
          <div className="flex">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-100 text-gray-600 text-sm">
              +91
            </span>
            <input
              type="text"
              name="parentPhone"
              value={formData.parentPhone.replace('+91', '')}
              onChange={e => {
                const digits = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                setFormData((prev: any) => ({
                  ...prev,
                  parentPhone: '+91' + digits
                }));
              }}
              className="w-full border border-gray-300 p-3 rounded-r-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="1234567890"
              maxLength={10}
            />
          </div>
          {errors.parentPhone && (
            <p className="text-red-500 text-sm mt-1">{errors.parentPhone}</p>
          )}
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
            className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        {/* Board */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Board
          </label>
          <select
            name="board"
            value={formData.board}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            disabled={boardLoading}
          >
            <option value="">Select Board</option>
            {getAvailableBoards().map((boardName) => (
              <option key={boardName} value={boardName}>{boardName}</option>
            ))}
          </select>
          {boardLoading && <p className="text-gray-500 text-sm mt-1">Loading boards...</p>}
          {errors.board && <p className="text-red-500 text-sm mt-1">{errors.board}</p>}
        </div>

        {/* Class */}
        {formData.board && formData.board !== 'Not Applicable' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Class
          </label>
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
              <option key={className} value={className}>
                {className}
              </option>
            ))}
          </select>
          {errors.class && (
            <p className="text-red-500 text-sm mt-1">{errors.class}</p>
          )}
        </div>
        )}

        {/* Subjects */}
        {formData.board && formData.board !== 'Not Applicable' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subjects (Select multiple)
          </label>
          {formData.board && formData.class ? (
            <div className="border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto">
              {getAvailableSubjects().map((subject) => (
                <label
                  key={subject}
                  className="flex items-center space-x-2 mb-2"
                >
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
              Selected: {formData.subjects.join(", ")}
            </div>
          )}
          {errors.subjects && (
            <p className="text-red-500 text-sm mt-1">{errors.subjects}</p>
          )}
        </div>
        )}

        {/* Lead Source */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lead Source
          </label>
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
          {errors.leadSource && (
            <p className="text-red-500 text-sm mt-1">{errors.leadSource}</p>
          )}
        </div>

        {/* Classes per Week */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Classes per Week
          </label>
          <input
            type="text"
            name="classesPerWeek"
            value={formData.classesPerWeek}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g. Mon, Wed, Fri or Flexible or 3 per week"
          />
          {errors.classesPerWeek && (
            <p className="text-red-500 text-sm mt-1">{errors.classesPerWeek}</p>
          )}
        </div>

        {/* Course Interested */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Course Interested
          </label>
          <select
            name="courseInterested"
            value={formData.courseInterested}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Course</option>
            {COURSE_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          {errors.courseInterested && (
            <p className="text-red-500 text-sm mt-1">
              {errors.courseInterested}
            </p>
          )}
        </div>

        {/* Mode of Contact */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mode of Contact
          </label>
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
            <option value="social_media">Social Media</option>
          </select>
          {errors.modeOfContact && (
            <p className="text-red-500 text-sm mt-1">{errors.modeOfContact}</p>
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
            className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            
          />
          {errors.counsellor && (
            <p className="text-red-500 text-sm mt-1">{errors.counsellor}</p>
          )}
        </div>

        {/* Session Begin Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Session Begin Date
          </label>
          <input
            type="date"
            name="sesssionBeginDate"
            value={formData.sesssionBeginDate}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.sesssionBeginDate && (
            <p className="text-red-500 text-sm mt-1">
              {errors.sesssionBeginDate}
            </p>
          )}
        </div>

        {/* Session End Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Session End Date
          </label>
          <input
            type="date"
            name="sessionEndDate"
            value={formData.sessionEndDate}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.sessionEndDate && (
            <p className="text-red-500 text-sm mt-1">{errors.sessionEndDate}</p>
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
            className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.preferredTimeSlots && (
            <p className="text-red-500 text-sm mt-1">
              {errors.preferredTimeSlots}
            </p>
          )}
        </div>

        {/* Remarks */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Remarks
          </label>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
          />
        </div>

        {/* Example: Use teachers in a dropdown (uncomment and place where needed) */}
        {/* <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Teacher</label>
          <select
            name="teacher"
            value={formData.teacher || ""}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Teacher</option>
            {teachers.map((teacher) => (
              <option key={teacher._id} value={teacher._id}>{teacher.name}</option>
            ))}
          </select>
        </div> */}

        {/* Disable the rest of the form if phoneExists is true */}
        {phoneExists && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
            You cannot fill the form because a lead with this phone number already exists.
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="button"
            className="bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 transition duration-200 font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSaveLead}
            disabled={saving || phoneExists}
          >
            {saving ? "Saving..." : "Save"}
          </button>
          {/* <button
            type="submit"
            className="bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition duration-200 font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || phoneExists}
          >
            {loading ? "Submitting..." : "Submit Lead"}
          </button> */}
            {formData._id && (
          <button
            type="button"
            className="bg-orange-400 text-white py-3 px-6 rounded-md hover:bg-orange-700 transition duration-200 font-medium text-lg"
            onClick={resetFormState}
          >
            Create New Lead
          </button>
        )}
        </div>
      
      </form>
    </div>
  );
}

// Default export for backward compatibility
export default LeadForm;
