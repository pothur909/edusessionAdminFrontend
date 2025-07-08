
'use client';

import { useEffect, useState } from 'react';

interface Subject {
  _id?: string;
  student: string;
  board: string;
  class: string;
  subject: string;
  numberOfClassesPerWeek: number;
  teacher: string;
  timeSlots: string[];
  paymentDetails: {
    classAmount: number;
    amountPaid: number;
    lastPayments: Array<{
      paymentId: string;
      date: Date;
      amount: number;
    }>;
  };
  remarks: string[];
}

interface Enrollment {
  _id: string;
  lead: string;
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
  subjects?: Subject[];
}

interface EditEnrollmentFormProps {
  studentId: string;
  onComplete: () => void;
  onCancel: () => void;
}

export default function EditEnrollmentForm({ studentId, onComplete, onCancel }: EditEnrollmentFormProps) {
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [error, setError] = useState<string | null>(null);
  const baseUrl = process.env.BASE_URL;
  const [formData, setFormData] = useState<Enrollment>({
    _id: '',
    lead: '',
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

  // Add validation for studentId
  useEffect(() => {
    console.log('studentId received:', studentId, typeof studentId);
    
    // Validate studentId
    if (!studentId || typeof studentId !== 'string') {
      setError(`Invalid student ID: ${studentId} (type: ${typeof studentId})`);
      setFetchingData(false);
      return;
    }
    
    // Check if studentId looks like a valid ObjectId (24 hex characters)
    if (!/^[0-9a-fA-F]{24}$/.test(studentId)) {
      setError(`Invalid ObjectId format: ${studentId}`);
      setFetchingData(false);
      return;
    }
  }, [studentId]);

  // Subject management functions
  const addNewSubject = () => {
    const newSubject: Subject = {
      student: studentId,
      board: '',
      class: '',
      subject: '',
      numberOfClassesPerWeek: 0,
      teacher: '',
      timeSlots: [],
      paymentDetails: {
        classAmount: 0,
        amountPaid: 0,
        lastPayments: []
      },
      remarks: []
    };
    setSubjects([...subjects, newSubject]);
  };

  const removeSubject = async (index: number) => {
    const subjectToRemove = subjects[index];
    
    // If the subject has an _id, it exists in the database and needs to be deleted
    if (subjectToRemove._id) {
      try {
        console.log('Deleting subject with ID:', subjectToRemove._id);
        const response = await fetch(`${baseUrl}/api/subject/${subjectToRemove._id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          const errorData = await response.text();
          console.error('Delete subject error:', errorData);
          throw new Error('Failed to delete subject from database');
        }
      } catch (error) {
        console.error('Error deleting subject:', error);
        alert('Failed to delete subject from database');
        return;
      }
    }
    
    // Remove from local state
    const newSubjects = [...subjects];
    newSubjects.splice(index, 1);
    setSubjects(newSubjects);
  };

  const handleSubjectChange = (index: number, field: string, value: any) => {
    const newSubjects = [...subjects];
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      if (parent === 'paymentDetails') {
        switch (child) {
          case 'classAmount':
            newSubjects[index].paymentDetails.classAmount = value;
            break;
          case 'amountPaid':
            newSubjects[index].paymentDetails.amountPaid = value;
            break;
          case 'lastPayments':
            newSubjects[index].paymentDetails.lastPayments = value;
            break;
          default:
            console.warn(`Unknown paymentDetails field: ${child}`);
        }
      }
    } else {
      switch (field) {
        case 'subject':
          newSubjects[index].subject = value;
          break;
        case 'teacher':
          newSubjects[index].teacher = value;
          break;
        case 'numberOfClassesPerWeek':
          newSubjects[index].numberOfClassesPerWeek = value;
          break;
        case 'timeSlots':
          newSubjects[index].timeSlots = value;
          break;
        case 'board':
          newSubjects[index].board = value;
          break;
        case 'class':
          newSubjects[index].class = value;
          break;
        case 'remarks':
          newSubjects[index].remarks = value;
          break;
        default:
          console.warn(`Unknown field: ${field}`);
      }
    }
    setSubjects(newSubjects);
  };


    useEffect(() => {
  const fetchData = async () => {
    // Skip if studentId is invalid
    if (!studentId || typeof studentId !== 'string' || !/^[0-9a-fA-F]{24}$/.test(studentId)) {
      return;
    }

    try {
      setFetchingData(true);
      setError(null);

      // Fetch student enrollment data
      console.log('Fetching student with ID:', studentId);
      const studentUrl = `${baseUrl}/api/students/${encodeURIComponent(studentId)}`;
      
      const studentResponse = await fetch(studentUrl);
      
      if (!studentResponse.ok) {
        const errorText = await studentResponse.text();
        console.error('Student fetch error:', errorText);
        throw new Error(`Failed to fetch student data: ${studentResponse.status} ${studentResponse.statusText}`);
      }
      
      const studentData = await studentResponse.json();
      console.log('Student data:', studentData);

      if (studentData) {
        setFormData({
          _id: studentData._id,
          lead: studentData.lead || '',
          studentName: studentData.studentName || '',
          phoneNumber: studentData.phoneNumber || '',
          parentsPhoneNumbers: studentData.parentsPhoneNumbers || [],
          email: studentData.email || '',
          age: studentData.age || 0,
          city: studentData.city || '',
          address: studentData.address || '',
          counsellor: studentData.counsellor || '',
          studentUsername: studentData.studentUsername || '',
          password: studentData.password || '',
          studentRating: studentData.studentRating || 0
        });

        // ⭐ UPDATED: Fetch subjects using the new endpoint
        try {
          const subjectsUrl = `${baseUrl}/api/subject/student/${encodeURIComponent(studentId)}`;
          console.log('Fetching subjects from:', subjectsUrl);
          
          const subjectsResponse = await fetch(subjectsUrl);
          
          if (subjectsResponse.ok) {
            const subjectsData = await subjectsResponse.json();
            console.log('Subjects response:', subjectsData);
            
            if (subjectsData.success && subjectsData.data) {
              const transformedSubjects = subjectsData.data.map((subject: any) => ({
                _id: subject._id,
                student: subject.student,
                board: subject.board || '',
                class: subject.class || '',
                subject: subject.subject || '',
                numberOfClassesPerWeek: subject.numberOfClassesPerWeek || 0,
                teacher: subject.teacher || '',
                timeSlots: Array.isArray(subject.timeSlots) 
                  ? subject.timeSlots 
                  : (subject.timeSlots ? [subject.timeSlots] : []),
                paymentDetails: {
                  classAmount: subject.paymentDetails?.classAmount || 0,
                  amountPaid: subject.paymentDetails?.amountPaid || 0,
                  lastPayments: subject.paymentDetails?.lastPayments || []
                },
                remarks: subject.remarks || []
              }));
              
              console.log('Successfully loaded subjects:', transformedSubjects);
              setSubjects(transformedSubjects);
            } else {
              console.log('No subjects found in response');
              setSubjects([]);
            }
          } else {
            const errorText = await subjectsResponse.text();
            console.warn('Failed to fetch subjects:', errorText);
            setSubjects([]);
          }
        } catch (error) {
          console.error('Error fetching subjects:', error);
          setSubjects([]);
        }
      } else {
        throw new Error('Student not found');
      }
    } catch (error) {
      console.error('Error in fetchData:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch data');
    } finally {
      setFetchingData(false);
    }
  };

  if (studentId) {
    fetchData();
  }
}, [studentId]);



  
  // const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
  //   const { name, value } = e.target;

  //   if (name === 'parentsPhoneNumbers') {
  //     setFormData(prev => ({
  //       ...prev,
  //       parentsPhoneNumbers: value.split(',').map(phone => phone.trim()).filter(phone => phone !== '')
  //     }));
  //   } else if (name === 'age') {
  //     setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
  //   } else if (name === 'studentRating') {
  //     setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  //   } else {
  //     setFormData(prev => ({ ...prev, [name]: value }));
  //   }
  // };

      const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value} = e.target;

    if (name === 'parentsPhoneNumbers') {
      setFormData(prev => ({
        ...prev,
        parentsPhoneNumbers: value.split(',').map(phone => phone.trim()).filter(phone => phone !== '')
      }));
    } else if (name === 'age') {
      // Allow empty string or valid numbers
      const numValue = value === '' ? '' : parseInt(value);
      setFormData(prev => ({ ...prev, [name]: numValue === '' ? 0 : (isNaN(numValue as number) ? 0 : numValue) }));
    } else if (name === 'studentRating') {
      // Allow empty string or valid numbers
      const numValue = value === '' ? '' : parseFloat(value);
      setFormData(prev => ({ ...prev, [name]: numValue === '' ? 0 : (isNaN(numValue as number) ? 0 : numValue) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Custom number input handler for subjects
  const handleNumberInputChange = (index: number, field: string, value: string) => {
    let numValue: number;
    
    if (value === '') {
      numValue = 0;
    } else {
      numValue = field.includes('classAmount') || field.includes('amountPaid') ? 
        (parseFloat(value) || 0) : (parseInt(value) || 0);
    }
    
    handleSubjectChange(index, field, numValue);
  };

  const validateForm = (): boolean => {
    if (!formData.studentName || !formData.phoneNumber || !formData.email || !formData.studentUsername || !formData.password) {
      alert('Please fill in all required fields');
      return false;
    }

    if (!formData.age || formData.age <= 0) {
      alert('Please enter a valid age');
      return false;
    }

    if (!formData.city || !formData.address) {
      alert('Please fill in city and address');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate form
      const isValid = validateForm();
      if (!isValid) {
        return;
      }

      // Ensure studentId is valid before making API calls
      if (!studentId || typeof studentId !== 'string') {
        throw new Error('Invalid student ID');
      }

      // Update student data
      console.log('Updating student with data:', formData);
      
      const studentUrl = `${baseUrl}/api/students/${encodeURIComponent(studentId)}`;
      console.log('Update student URL:', studentUrl);
      
      const studentResponse = await fetch(studentUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!studentResponse.ok) {
        const errorData = await studentResponse.text();
        console.error('Student update error:', errorData);
        throw new Error(`Failed to update student: ${studentResponse.status} ${studentResponse.statusText}`);
      }

      const responseData = await studentResponse.json();
      console.log('Student update response:', responseData);

      // Handle subjects (update existing, create new ones)
      try {
        console.log('Starting to handle subjects:', subjects);
        
        for (const subject of subjects) {
          // Ensure subject.student is a string
          const subjectStudentId = typeof subject.student === 'string' ? subject.student : studentId;
          
          // Format time slots properly
          let formattedTimeSlots: string[] = [];

          if (Array.isArray(subject.timeSlots)) {
            formattedTimeSlots = subject.timeSlots
              .map((slot: string) => typeof slot === 'string' ? slot.trim() : String(slot))
              .filter((slot: string) => slot !== '');
          } else if (typeof subject.timeSlots === 'string') {
            formattedTimeSlots = subject.timeSlots
              .split(',')
              .map((slot: string) => slot.trim())
              .filter((slot: string) => slot !== '');
          }

          const subjectData = {
            student: subjectStudentId,
            board: subject.board,
            class: subject.class,
            subject: subject.subject,
            numberOfClassesPerWeek: subject.numberOfClassesPerWeek,
            teacher: subject.teacher,
            timeSlots: formattedTimeSlots,
            paymentDetails: {
              classAmount: subject.paymentDetails.classAmount,
              amountPaid: subject.paymentDetails.amountPaid || 0,
              lastPayments: subject.paymentDetails.lastPayments || []
            },
            remarks: subject.remarks || []
          };

          console.log('Processing subject data:', subjectData);

          let subjectResponse;
          
          if (subject._id) {
            // Update existing subject
            const updateUrl = `${baseUrl}/api/subject/${encodeURIComponent(subject._id)}`;
            console.log('Update subject URL:', updateUrl);
            
            subjectResponse = await fetch(updateUrl, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(subjectData),
            });
          } else {
            // Create new subject
            const createUrl =   `${baseUrl}/api/subject/add`;
            console.log('Create subject URL:', createUrl);
            
            subjectResponse = await fetch(createUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(subjectData),
            });
          }

          if (!subjectResponse.ok) {
            const errorData = await subjectResponse.text();
            console.error('Subject save error:', errorData);
            throw new Error(`Failed to save subject: ${subjectResponse.status} ${subjectResponse.statusText}`);
          }

          const subjectResponseData = await subjectResponse.json();
          console.log('Subject save response:', subjectResponseData);
        }

        console.log('All subjects processed successfully');
      } catch (error) {
        console.error('Error handling subjects:', error);
        throw new Error(`Failed to update subjects: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      alert('Student updated successfully!');
      onComplete();
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while updating');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2">Loading student data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">
            <h3 className="font-medium">Error</h3>
            <p className="mt-1">{error}</p>
            <p className="mt-2 text-sm">StudentId: {JSON.stringify(studentId)} (type: {typeof studentId})</p>
          </div>
          <div className="mt-4">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 text-black">
      {/* <h2 className="text-2xl font-bold mb-4">
        Edit Student Enrollment
        <span className="text-sm text-blue-600 ml-2">(Student ID: {studentId})</span>
      </h2> */}

            <style jsx>{`
        /* Hide number input spinners */
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>

      <form onSubmit={handleSubmit} className="space-y-6 text-black">
        {/* Student Details Section */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-medium mb-4">Student Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                name="studentName"
                value={formData.studentName}
                onChange={handleChange}
                required
                className="border p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="border p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="border p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="border p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age *</label>
              <input
                type="number"
                name="age"
                // value={formData.age}
                  value={formData.age === 0 ? '' : formData.age}
                onChange={handleChange}
                required
                min="1"
                max="25"
                className="border p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                style={{ MozAppearance: 'textfield' }}
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
                className="border p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="border p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="border p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student Rating</label>
              <input
                type="number"
                name="studentRating"
                // value={formData.studentRating}
                value={formData.studentRating === 0 ? '' : formData.studentRating}
                onChange={handleChange}
                min="0"
                max="5"
                step="0.1"
                className="border p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                           style={{ MozAppearance: 'textfield' }}
              />
            </div>
          </div>

          {/* Login Credentials Section */}
          <div className="mt-6 pt-4 border-t">
            <h4 className="text-md font-medium mb-4">Login Credentials</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                <input
                  type="text"
                  name="studentUsername"
                  value={formData.studentUsername}
                  onChange={handleChange}
                  required
                  className="border p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="border p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Subjects Section */}
        <div className="bg-white border rounded-md p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Subjects</h3>
            <button
              type="button"
              onClick={addNewSubject}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Subject
            </button>
          </div>
          
          {subjects.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No subjects added yet. Click "Add Subject" to get started.</p>
          ) : (
            subjects.map((subject, index) => (
              <div key={subject._id || index} className="border p-4 rounded-lg mb-4 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-md font-medium">
                    Subject {index + 1} 
                    {subject._id && <span className="text-xs text-gray-500 ml-2">(Existing)</span>}
                  </h4>
                  <button
                    type="button"
                    onClick={() => removeSubject(index)}
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Board</label>
                    <input
                      type="text"
                      value={subject.board}
                      onChange={(e) => handleSubjectChange(index, 'board', e.target.value)}
                      className="border p-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                    <input
                      type="text"
                      value={subject.class}
                      onChange={(e) => handleSubjectChange(index, 'class', e.target.value)}
                      className="border p-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <input
                      type="text"
                      value={subject.subject}
                      onChange={(e) => handleSubjectChange(index, 'subject', e.target.value)}
                      className="border p-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
                    <input
                      type="text"
                      value={subject.teacher}
                      onChange={(e) => handleSubjectChange(index, 'teacher', e.target.value)}
                      className="border p-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Classes Per Week</label>
                    <input
                      type="number"
                      // value={subject.numberOfClassesPerWeek}
                        value={subject.numberOfClassesPerWeek === 0 ? '' : subject.numberOfClassesPerWeek}
                      onChange={(e) => handleSubjectChange(index, 'numberOfClassesPerWeek', parseInt(e.target.value) || 0)}
                       min="1"
                      className="border p-2 rounded w-full"
                      style={{ MozAppearance: 'textfield' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time Slots</label>
                    <input
                      type="text"
                      value={Array.isArray(subject.timeSlots) ? subject.timeSlots.join(', ') : subject.timeSlots}
                      onChange={(e) => handleSubjectChange(index, 'timeSlots', e.target.value.split(',').map(slot => slot.trim()))}
                      placeholder="Enter time slots separated by commas"
                      className="border p-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Class Amount</label>
                    <input
                      type="number"
                      // value={subject.paymentDetails.classAmount}
                       value={subject.paymentDetails.classAmount === 0 ? '' : subject.paymentDetails.classAmount}
                      onChange={(e) => handleSubjectChange(index, 'paymentDetails.classAmount', parseInt(e.target.value) || 0)}
                      className="border p-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                      step="0.01"
                      style={{ MozAppearance: 'textfield' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount Paid</label>
                    <input
                      type="number"
                      // value={subject.paymentDetails.amountPaid}
                     value={subject.paymentDetails.amountPaid === 0 ? '' : subject.paymentDetails.amountPaid}
                      onChange={(e) => handleSubjectChange(index, 'paymentDetails.amountPaid', parseInt(e.target.value) || 0)}
                      className="border p-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                       min="0"
                      step="0.01"
                      style={{ MozAppearance: 'textfield' }}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 focus:ring-2 focus:ring-blue-500"
          >
            {loading ? 'Updating...' : 'Update Student'}
          </button>
        </div>
      </form>
    </div>
  );
}