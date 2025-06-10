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
  existingStudentId?: string; // Add this to identify existing student
  demo?: Demo | null; // Add this for demo data
}

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
    lastPayments: {
      paymentId: string;
      date: Date;
      amount: number;
    }[];
  };
  meetingDetails?: {
    startUrl?: string;
    joinUrl?: string;
    meetingId?: string;
    password?: string;
  };
  remarks: string[];
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
  lead: string;
  studentName: string;
  phoneNumber: string;
  parentsPhoneNumbers: string[];
  email: string;
  age: number;
  city: string;
  address: string;
  counsellor: string;
  counsellorEmail: string;
  counsellorPhone: string;
  studentUsername: string;
  password: string;
  studentRating: number;
  subjects?: Subject[];
}

interface Teacher {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  isAvailable: boolean;
  isLocked: boolean;
}

interface EnrollmentFormProps {
  lead: Lead;
  onComplete: () => void;
  onCancel: () => void;
  teachers: Teacher[];
}

interface DemoResponse {
  success: boolean;
  message: string;
  demos?: Demo[];
}

interface StudentsResponse {
  success: boolean;
  message: string;
  data?: Enrollment[];
}

interface StudentResponse {
  success: boolean;
  message: string;
  data?: Enrollment;
}

export default function EnrollmentForm({ lead, onComplete, onCancel, teachers }: EnrollmentFormProps) {
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [demo, setDemo] = useState<Demo | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [existingStudentId, setExistingStudentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const baseUrl = process.env.BASE_URL;

  const [formData, setFormData] = useState<Enrollment>({
    lead: lead._id,
    studentName: '',
    phoneNumber: '',
    parentsPhoneNumbers: [],
    email: '',
    age: 0,
    city: '',
    address: '',
    counsellor: '',
    counsellorEmail: '',
    counsellorPhone: '',
    studentUsername: '',
    password: '',
    studentRating: 0
  });

  const addNewSubject = () => {
    const newSubject: Subject = {
      student: '',
      board: lead.board || '',
      class: lead.class || '',
      subject: '',
      numberOfClassesPerWeek: lead.classesPerWeek || 0,
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

  const removeSubject = (index: number) => {
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

  const initializeSubjectsFromLead = (lead: Lead) => {
    if (lead.subjects && lead.subjects.length > 0) {
      const initialSubjects: Subject[] = lead.subjects.map(subject => ({
        student: '',
        board: lead.board || '',
        class: lead.class || '',
        subject: subject,
        numberOfClassesPerWeek: lead.classesPerWeek || 0,
        teacher: '',
        timeSlots: lead.preferredTimeSlots ? [lead.preferredTimeSlots] : [],
        paymentDetails: {
          classAmount: 0,
          amountPaid: 0,
          lastPayments: []
        },
        remarks: []
      }));
      setSubjects(initialSubjects);
    }
  };

  const initializeFormWithLeadData = () => {
    console.log('Initializing form with lead data');
    setIsEditing(false);
    setExistingStudentId(null);

    const initialFormData: Enrollment = {
      lead: lead._id,
      studentName: lead.studentName || '',
      phoneNumber: lead.studentPhone || '',
      parentsPhoneNumbers: lead.parentPhone ? [lead.parentPhone] : [],
      email: lead.email || '',
      age: 0,
      city: lead.city || '',
      address: '',
      counsellor: lead.counsellor || '',
      counsellorEmail: '',
      counsellorPhone: '',
      studentUsername: '',
      password: '',
      studentRating: 0
    };

    console.log('Setting form data from lead:', initialFormData);
    setFormData(initialFormData);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetchingData(true);

        if (lead.demo) {
          console.log('Using demo data from lead:', lead.demo);
          setDemo(lead.demo);
        } else {
          try {
            const demoResponse = await fetch(`${baseUrl}/api/demo/view/${lead._id}`);
            const demoData: DemoResponse = await demoResponse.json();
            console.log('Fetched demo data:', demoData);

            if (demoData.success && demoData.demos && demoData.demos.length > 0) {
              setDemo(demoData.demos[0]);
            }
          } catch (error) {
            console.error('Error fetching demo data:', error);
          }
        }

        if (lead.existingStudentId) {
          try {
            console.log('Fetching existing student with ID:', lead.existingStudentId);
            const response = await fetch(`${baseUrl}/api/students/${lead.existingStudentId}`);
            const data = await response.json();
            console.log('Existing student data:', data);

            const existingEnrollment = Array.isArray(data) ? data[0] : data;

            if (existingEnrollment) {
              setIsEditing(true);
              setExistingStudentId(existingEnrollment._id);

              setFormData({
                _id: existingEnrollment._id,
                lead: lead._id,
                studentName: existingEnrollment.studentName || lead.studentName || '',
                phoneNumber: existingEnrollment.phoneNumber || lead.studentPhone || '',
                parentsPhoneNumbers: existingEnrollment.parentsPhoneNumbers || [lead.parentPhone || ''],
                email: existingEnrollment.email || lead.email || '',
                age: existingEnrollment.age || 0,
                city: existingEnrollment.city || lead.city || '',
                address: existingEnrollment.address || '',
                counsellor: existingEnrollment.counsellor || lead.counsellor || '',
                counsellorEmail: existingEnrollment.counsellorEmail || '',
                counsellorPhone: existingEnrollment.counsellorPhone || '',
                studentUsername: existingEnrollment.studentUsername || '',
                password: existingEnrollment.password || '',
                studentRating: existingEnrollment.studentRating || 0
              });

              try {
                const subjectsResponse = await fetch(`${baseUrl}/api/subject/${existingEnrollment._id}`);
                const subjectsData = await subjectsResponse.json();
                console.log('Fetched subjects data:', subjectsData);
                
                if (subjectsData.success && subjectsData.data) {
                  const transformedSubjects = subjectsData.data.map((subject: any) => ({
                    student: subject.student,
                    board: subject.board,
                    class: subject.class,
                    subject: subject.subject,
                    numberOfClassesPerWeek: subject.numberOfClassesPerWeek,
                    teacher: subject.teacher,
                    timeSlots: Array.isArray(subject.timeSlots) ? subject.timeSlots : [subject.timeSlots],
                    paymentDetails: {
                      classAmount: subject.paymentDetails.classAmount || 0,
                      amountPaid: subject.paymentDetails.amountPaid || 0,
                      lastPayments: subject.paymentDetails.lastPayments || []
                    },
                    remarks: subject.remarks || []
                  }));
                  console.log('Transformed subjects:', transformedSubjects);
                  setSubjects(transformedSubjects);
                }
              } catch (error) {
                console.error('Error fetching subjects:', error);
              }
              return;
            }
          } catch (error) {
            console.error('Error fetching existing student:', error);
          }
        }

        initializeFormWithLeadData();

        if (lead.subjects && lead.subjects.length > 0) {
          const initialSubjects: Subject[] = lead.subjects.map(subject => ({
            student: '',
            board: lead.board || '',
            class: lead.class || '',
            subject: subject,
            numberOfClassesPerWeek: lead.classesPerWeek || 0,
            teacher: '',
            timeSlots: lead.preferredTimeSlots ? [lead.preferredTimeSlots] : [],
            paymentDetails: {
              classAmount: 0,
              amountPaid: 0,
              lastPayments: []
            },
            remarks: []
          }));
          setSubjects(initialSubjects);
        }

      } catch (error) {
        console.error('Error in fetchData:', error);
        initializeFormWithLeadData();
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

  const validateForm = async (): Promise<boolean> => {
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

    try {
      const response = await fetch(`${baseUrl}/api/students`);
      if (response.ok) {
        const data: StudentsResponse = await response.json();
        if (data.success && data.data) {
          const duplicateStudent = data.data.find(
            (student: Enrollment) =>
              student._id !== existingStudentId &&
              (
                (student.email && student.email.toLowerCase() === formData.email.toLowerCase()) ||
                (student.phoneNumber && student.phoneNumber === formData.phoneNumber) ||
                (student.studentUsername && student.studentUsername.toLowerCase() === formData.studentUsername.toLowerCase())
              )
          );

          if (duplicateStudent) {
            alert('A student with this email, phone number, or username already exists');
            return false;
          }
        }
      }
    } catch (error) {
      console.error('Error checking for duplicates:', error);
    }

    return true;
  };

  const createZoomMeeting = async (subject: Subject, studentName: string): Promise<Subject> => {
    try {
      const response = await fetch(`${baseUrl}/api/zoom/permanent/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: `${subject.subject} Class - ${studentName}`,
          options: {
            enableChat: true,
            enableRecording: true
          }
        })
      });

      const data = await response.json();
      if (data.success) {
        return {
          ...subject,
          meetingDetails: {
            meetingId: data.data.id.toString(),
            joinUrl: data.data.join_url,
            password: data.data.password,
            startUrl: data.data.start_url
          }
        };
      } else {
        throw new Error(data.message || 'Failed to create Zoom meeting');
      }
    } catch (error) {
      console.error('Error creating Zoom meeting:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const isValid = await validateForm();
      if (!isValid) {
        setLoading(false);
        return;
      }

      const submitData = { ...formData };

      if (!isEditing) {
        delete submitData._id;
      }

      const url = isEditing && existingStudentId
        ? `${baseUrl}/api/students/${existingStudentId}`
        : `${baseUrl}/api/students`;

      const method = isEditing ? 'PUT' : 'POST';

      console.log('Submitting enrollment data:', submitData);
      console.log('URL:', url);
      console.log('Method:', method);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const responseData = await response.json();
      console.log('Enrollment response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || responseData.error || `Failed to ${isEditing ? 'update' : 'enroll'} student`);
      }

      const studentId = responseData._id;
      if (!studentId) {
        throw new Error('Failed to get student ID from response');
      }

      // Create Zoom meetings for each subject
      const subjectsWithMeetings = await Promise.all(
        subjects.map(async (subject) => {
          try {
            const subjectWithMeeting = await createZoomMeeting(subject, formData.studentName);
            
            // Ensure all required fields are present and properly formatted
            const formattedSubject = {
              student: studentId,
              board: String(subject.board || ''),
              class: String(subject.class || ''),
              subject: String(subject.subject || ''),
              numberOfClassesPerWeek: Number(subject.numberOfClassesPerWeek) || 0,
              teacher: String(subject.teacher || ''),
              timeSlots: Array.isArray(subject.timeSlots) ? subject.timeSlots.map(String) : [String(subject.timeSlots)].flat(),
              paymentDetails: {
                classAmount: Number(subject.paymentDetails.classAmount) || 0,
                amountPaid: Number(subject.paymentDetails.amountPaid) || 0,
                lastPayments: Array.isArray(subject.paymentDetails.lastPayments) && subject.paymentDetails.lastPayments.length > 0
                  ? subject.paymentDetails.lastPayments.map(payment => ({
                      paymentId: String(payment.paymentId || ''),
                      date: new Date(payment.date || Date.now()),
                      amount: Number(payment.amount) || 0
                    }))
                  : []
              },
              remarks: Array.isArray(subject.remarks) ? subject.remarks.map(String) : [],
              meetingDetails: subjectWithMeeting.meetingDetails ? {
                startUrl: String(subjectWithMeeting.meetingDetails.startUrl || ''),
                joinUrl: String(subjectWithMeeting.meetingDetails.joinUrl || ''),
                meetingId: String(subjectWithMeeting.meetingDetails.meetingId || ''),
                password: String(subjectWithMeeting.meetingDetails.password || '')
              } : undefined
            };

            // Validate required fields
            if (!formattedSubject.board || !formattedSubject.class || !formattedSubject.subject || 
                !formattedSubject.numberOfClassesPerWeek || !formattedSubject.teacher || 
                !formattedSubject.timeSlots.length || !formattedSubject.paymentDetails.classAmount) {
              throw new Error('Missing required fields in subject');
            }

            // Log each formatted subject for debugging
            console.log('Formatted subject:', JSON.stringify(formattedSubject, null, 2));

            return formattedSubject;
          } catch (error) {
            console.error(`Failed to create meeting for subject ${subject.subject}:`, error);
            return {
              student: studentId,
              board: String(subject.board || ''),
              class: String(subject.class || ''),
              subject: String(subject.subject || ''),
              numberOfClassesPerWeek: Number(subject.numberOfClassesPerWeek) || 0,
              teacher: String(subject.teacher || ''),
              timeSlots: Array.isArray(subject.timeSlots) ? subject.timeSlots.map(String) : [String(subject.timeSlots)].flat(),
              paymentDetails: {
                classAmount: Number(subject.paymentDetails.classAmount) || 0,
                amountPaid: Number(subject.paymentDetails.amountPaid) || 0,
                lastPayments: Array.isArray(subject.paymentDetails.lastPayments) && subject.paymentDetails.lastPayments.length > 0
                  ? subject.paymentDetails.lastPayments.map(payment => ({
                      paymentId: String(payment.paymentId || ''),
                      date: new Date(payment.date || Date.now()),
                      amount: Number(payment.amount) || 0
                    }))
                  : []
              },
              remarks: [...(Array.isArray(subject.remarks) ? subject.remarks.map(String) : []), 'Failed to create Zoom meeting']
            };
          }
        })
      );

      // Submit each subject individually
      for (const subject of subjectsWithMeetings) {
        console.log('Submitting subject:', JSON.stringify(subject, null, 2));
        
        const subjectsResponse = await fetch(`${baseUrl}/api/subject/add`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(subject),
        });

        const subjectsResponseData = await subjectsResponse.json();
        console.log('Subject response:', subjectsResponseData);

        if (!subjectsResponse.ok) {
          console.error('Subject validation error:', subjectsResponseData);
          throw new Error(subjectsResponseData.message || subjectsResponseData.error || 'Failed to create subject with meeting details');
        }
      }

      onComplete();
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Counselor Email *</label>
              <input
                type="email"
                name="counsellorEmail"
                value={formData.counsellorEmail}
                onChange={handleChange}
                required
                className="border p-3 rounded-md w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Counselor Phone *</label>
              <input
                type="text"
                name="counsellorPhone"
                value={formData.counsellorPhone}
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

          <div className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Subjects</h3>
              <button
                type="button"
                onClick={addNewSubject}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add Subject
              </button>
            </div>
            
            {subjects.map((subject, index) => (
              <div key={index} className="border p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-md font-medium">Subject {index + 1}</h4>
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
                    <label className="block text-sm font-medium text-gray-700">Subject</label>
                    <input
                      type="text"
                      value={subject.subject}
                      onChange={(e) => handleSubjectChange(index, 'subject', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Teacher</label>
                    <select
                      value={subject.teacher}
                      onChange={(e) => handleSubjectChange(index, 'teacher', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Classes Per Week</label>
                    <input
                      type="number"
                      value={subject.numberOfClassesPerWeek}
                      onChange={(e) => handleSubjectChange(index, 'numberOfClassesPerWeek', parseInt(e.target.value))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Time Slots</label>
                    <input
                      type="text"
                      value={Array.isArray(subject.timeSlots) ? subject.timeSlots.join(', ') : subject.timeSlots}
                      onChange={(e) => handleSubjectChange(index, 'timeSlots', e.target.value.split(',').map(slot => slot.trim()))}
                      placeholder="Enter time slots separated by commas (e.g., Monday 3:00 PM, Wednesday 4:00 PM)"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Class Amount</label>
                    <input
                      type="number"
                      value={subject.paymentDetails.classAmount}
                      onChange={(e) => handleSubjectChange(index, 'paymentDetails.classAmount', parseInt(e.target.value))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Amount Paid</label>
                    <input
                      type="number"
                      value={subject.paymentDetails.amountPaid}
                      onChange={(e) => handleSubjectChange(index, 'paymentDetails.amountPaid', parseInt(e.target.value))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            ))}
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