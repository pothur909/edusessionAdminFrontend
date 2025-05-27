
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
  city: string;
  enrollment?: Enrollment;
//   student?: string; // Reference to student ID if enrolled
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
  status: string;
  remarks: string;
  preferredTimeSlots: string;
}

interface Enrollment {
  _id?: string;
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
}

interface EnrollmentFormProps {
  lead: Lead;
  onComplete: () => void;
  onCancel: () => void;
}

interface EnrollmentResponse{
     success: boolean;
     message: string;
     demo?: Demo[];
     lead?: Lead;
     enrollment?: Enrollment;
}

export default function EnrollmentForm({ lead, onComplete, onCancel,  }: EnrollmentFormProps) {
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [demo, setDemo] = useState<Demo | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [existingStudentId, setExistingStudentId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Enrollment>({
    studentName: '',
    phoneNumber: '',
    parentsPhoneNumbers: [],
    email: '',
    age: 0,
    city: '',
    address: '',
    counsellor: '',
    studentUsername: '',
    password: '',
    studentRating: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetchingData(true);
        
        // Fetch demo data
        try {
          const demoResponse = await fetch(`http://localhost:6969/api/demo/view/${lead._id}`);
          const demoData = await demoResponse.json();
          console.log('Demo response:', demoData);
        //   const enrollmentResoonse =await fetch(`http://localhost:6969/api/students`)

          if (demoData.success && demoData.demos && demoData.demos.length > 0) {
            setDemo(demoData.demos[0]);
          }

          

          // Check if lead has enrollment data
          if (demoData.lead && demoData.enrollment) {
            const existingStudent = demoData.enrollment;
            setIsEditing(true);
            setExistingStudentId(existingStudent._id);

            console.log(demoData.lead.enrollment,"twoooo")
            
            // Map the student data to form data
            const initialFormData: Enrollment = {
              _id: existingStudent._id,
              studentName: existingStudent.studentName || lead.studentName || '',
              phoneNumber: existingStudent.phoneNumber || lead.studentPhone || '',
              parentsPhoneNumbers: Array.isArray(existingStudent.parentsPhoneNumbers) 
                ? existingStudent.parentsPhoneNumbers 
                : (lead.parentPhone ? [lead.parentPhone] : []),
              email: existingStudent.email || lead.email || '',
              age: existingStudent.age || 0,
              city: existingStudent.city || lead.city || '',
              address: existingStudent.address || '',
              counsellor: existingStudent.counsellor || lead.counsellor || '',
              studentUsername: existingStudent.studentUsername || '',
              password: existingStudent.password || '',
              studentRating: existingStudent.studentRating || 0
            };
            
            console.log('Setting form data from lead enrollment:', initialFormData);
            setFormData(initialFormData);
            setFetchingData(false);
            return;
          }
        } catch (error) {
          console.log('No demo data found:', error);
        }

        // Initialize form with lead data
        const initialFormData: Enrollment = {
          studentName: lead.studentName || '',
          phoneNumber: lead.studentPhone || '',
          parentsPhoneNumbers: lead.parentPhone ? [lead.parentPhone] : [],
          email: lead.email || '',
          age: 0,
          city: lead.city || '',
          address: '',
          counsellor: lead.counsellor || '',
          studentUsername: '',
          password: '',
          studentRating: 0
        };

        // If no enrollment found in lead, check for student by email
        try {
          const studentResponse = await fetch(`http://localhost:6969/api/students?email=${encodeURIComponent(lead.email)}`);
          if (studentResponse.ok) {
            const studentData = await studentResponse.json();
            console.log('Fetched student data:', studentData);
            
            if (studentData.success && studentData.data && studentData.data.length > 0) {
              const existingStudent = studentData.data[0];
              setIsEditing(true);
              setExistingStudentId(existingStudent._id);
              
              // Map the student data to form data
              initialFormData._id = existingStudent._id;
              initialFormData.studentName = existingStudent.studentName || lead.studentName || '';
              initialFormData.phoneNumber = existingStudent.phoneNumber || lead.studentPhone || '';
              initialFormData.parentsPhoneNumbers = Array.isArray(existingStudent.parentsPhoneNumbers) 
                ? existingStudent.parentsPhoneNumbers 
                : (lead.parentPhone ? [lead.parentPhone] : []);
              initialFormData.email = existingStudent.email || lead.email || '';
              initialFormData.age = existingStudent.age || 0;
              initialFormData.city = existingStudent.city || lead.city || '';
              initialFormData.address = existingStudent.address || '';
              initialFormData.counsellor = existingStudent.counsellor || lead.counsellor || '';
              initialFormData.studentUsername = existingStudent.studentUsername || '';
              initialFormData.password = existingStudent.password || '';
              initialFormData.studentRating = existingStudent.studentRating || 0;
              
              console.log('Setting form data for existing student:', initialFormData);
              setFormData(initialFormData);
              setFetchingData(false);
              return;
            }
          }
        } catch (error) {
          console.error('Error fetching student data:', error);
        }

        // If no existing student found or error occurred, use lead data
        console.log('No existing student found, using lead data:', initialFormData);
        setIsEditing(false);
        setExistingStudentId(null);
        setFormData(initialFormData);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setFetchingData(false);
      }
    };

    fetchData();
  }, [lead]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'parentsPhoneNumbers') {
      setFormData(prev => ({
        ...prev,
        parentsPhoneNumbers: value.split(',').map(phone => phone.trim()).filter(phone => phone !== '')
      }));
    } else if (name === 'age') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else if (name === 'studentRating') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const generateUsername = () => {
    const baseName = (formData.studentName || lead.studentName).toLowerCase().replace(/\s+/g, '');
    const randomNum = Math.floor(Math.random() * 1000);
    return `${baseName}${randomNum}`;
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleGenerateCredentials = () => {
    setFormData(prev => ({
      ...prev,
      studentUsername: generateUsername(),
      password: generatePassword()
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.studentName || !formData.phoneNumber || !formData.email || !formData.studentUsername || !formData.password) {
        alert('Please fill in all required fields');
        return;
      }

      if (!formData.age || formData.age <= 0) {
        alert('Please enter a valid age');
        return;
      }

      if (!formData.city || !formData.address) {
        alert('Please fill in city and address');
        return;
      }

      // For new students, check if email/phone/username already exists
      if (!isEditing) {
        const checkResponse = await fetch('http://localhost:6969/api/students');
        if (checkResponse.ok) {
          const checkData = await checkResponse.json();
          if (checkData.success && checkData.data) {
            const duplicateStudent = checkData.data.find(
              (student: any) => 
                (student.email && student.email.toLowerCase() === formData.email.toLowerCase()) ||
                (student.phoneNumber && student.phoneNumber === formData.phoneNumber) ||
                (student.studentUsername && student.studentUsername.toLowerCase() === formData.studentUsername.toLowerCase())
            );
            
            if (duplicateStudent) {
              alert('A student with this email, phone number, or username already exists');
              return;
            }
          }
        }
      } else {
        // For editing, check if email/phone/username conflicts with other students (excluding current student)
        const checkResponse = await fetch('http://localhost:6969/api/students');
        if (checkResponse.ok) {
          const checkData = await checkResponse.json();
          if (checkData.success && checkData.data) {
            const duplicateStudent = checkData.data.find(
              (student: any) => 
                student._id !== existingStudentId && // Exclude current student
                (
                  (student.email && student.email.toLowerCase() === formData.email.toLowerCase()) ||
                  (student.phoneNumber && student.phoneNumber === formData.phoneNumber) ||
                  (student.studentUsername && student.studentUsername.toLowerCase() === formData.studentUsername.toLowerCase())
                )
            );
            
            if (duplicateStudent) {
              alert('Another student with this email, phone number, or username already exists');
              return;
            }
          }
        }
      }

      // Prepare the data to submit
      const submitData = { ...formData };

      // Remove _id from submitData for new students
      if (!isEditing) {
        delete submitData._id;
      }

      // Determine URL and method based on whether we're updating or creating
      const url = isEditing && existingStudentId
        ? `http://localhost:6969/api/students/${existingStudentId}`
        : 'http://localhost:6969/api/students';
      
      const method = isEditing ? 'PUT' : 'POST';

      console.log('Submitting data:', submitData);
      console.log('URL:', url);
      console.log('Method:', method);

      // Submit enrollment data
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();
      console.log('Response data:', data);
      
      // Check for successful creation (201) or update (200)
      if (response.status === 201 || response.status === 200) {
        // Update lead status to converted
        try {
          const leadUpdateResponse = await fetch(`http://localhost:6969/api/leads/${lead._id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: 'converted' }),
          });
          
          if (!leadUpdateResponse.ok) {
            console.error('Failed to update lead status');
          }
        } catch (error) {
          console.error('Error updating lead status:', error);
        }

        alert(`Student ${isEditing ? 'updated' : 'enrolled'} successfully!`);
        onComplete();
        return;
      }

      // Handle error cases
      if (!response.ok) {
        throw new Error(data.message || data.error || `Failed to ${isEditing ? 'update' : 'enroll'} student`);
      }

      if (!data.success) {
        throw new Error(data.message || data.error || `Failed to ${isEditing ? 'update' : 'enroll'} student`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : `An error occurred while ${isEditing ? 'updating' : 'enrolling'} the student`);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2">Loading enrollment data...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 text-black">
      <h2 className="text-2xl font-bold mb-4">
        {isEditing ? 'Edit Student Enrollment' : 'Enroll Student'}
        {isEditing && <span className="text-sm text-green-600 ml-2">(Editing existing enrollment)</span>}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6 text-black">
        {/* Lead Information Section */}
        <div className="bg-blue-50 p-4 rounded-md mb-6">
          <h3 className="text-lg font-medium mb-4">Lead Information</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Student:</span> {lead.studentName}
            </div>
            <div>
              <span className="font-medium">Phone:</span> {lead.studentPhone}
            </div>
            <div>
              <span className="font-medium">Email:</span> {lead.email}
            </div>
            <div>
              <span className="font-medium">Board:</span> {lead.board}
            </div>
            <div>
              <span className="font-medium">Class:</span> {lead.class}
            </div>
            <div>
              <span className="font-medium">Subjects:</span> {lead.subjects?.join(', ')}
            </div>
          </div>
        </div>

        {/* Demo Information Section */}
        {demo && (
          <div className="bg-green-50 p-4 rounded-md mb-6">
            <h3 className="text-lg font-medium mb-4">Demo Information</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Teacher:</span> {demo.teacher}
              </div>
              <div>
                <span className="font-medium">Subject:</span> {demo.subject}
              </div>
              <div>
                <span className="font-medium">Date:</span> {new Date(demo.date).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Time:</span> {demo.time}
              </div>
              <div>
                <span className="font-medium">Status:</span> {demo.status}
              </div>
              <div>
                <span className="font-medium">Remarks:</span> {demo.remarks}
              </div>
            </div>
          </div>
        )}

        {/* Student Enrollment Form */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-medium mb-4">Student Enrollment Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                name="studentName"
                value={formData.studentName}
                onChange={handleChange}
                required
                className="border p-3 rounded-md w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                className="border p-3 rounded-md w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parents Phone Numbers (comma separated)</label>
              <input
                type="text"
                name="parentsPhoneNumbers"
                value={formData.parentsPhoneNumbers.join(', ')}
                onChange={handleChange}
                placeholder="Enter phone numbers separated by commas"
                className="border p-3 rounded-md w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="border p-3 rounded-md w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age *</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                required
                min="1"
                max="25"
                className="border p-3 rounded-md w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="border p-3 rounded-md w-full"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="border p-3 rounded-md w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Counselor *</label>
              <input
                type="text"
                name="counsellor"
                value={formData.counsellor}
                onChange={handleChange}
                required
                className="border p-3 rounded-md w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student Rating</label>
              <input
                type="number"
                name="studentRating"
                value={formData.studentRating}
                onChange={handleChange}
                min="0"
                max="5"
                step="0.1"
                className="border p-3 rounded-md w-full"
              />
            </div>
          </div>

          {/* Login Credentials Section */}
          <div className="mt-6 pt-4 border-t">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-md font-medium">Login Credentials</h4>
              <button
                type="button"
                onClick={handleGenerateCredentials}
                className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
              >
                Generate Credentials
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                <input
                  type="text"
                  name="studentUsername"
                  value={formData.studentUsername}
                  onChange={handleChange}
                  required
                  className="border p-3 rounded-md w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input
                  type="text"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="border p-3 rounded-md w-full"
                />
              </div>
            </div>
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
            {loading ? (isEditing ? 'Updating...' : 'Enrolling...') : (isEditing ? 'Update Student' : 'Enroll Student')}
          </button>
        </div>
      </form>
    </div>
  );
}