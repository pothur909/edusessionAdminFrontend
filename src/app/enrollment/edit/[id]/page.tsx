'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import EditEnrollmentForm from '../../components/EnrollmentEdit';

interface Student {
  _id: string;
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

export default function EditEnrollmentPage({ params }: { params: { id: string } }) {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const baseUrl = process.env.BASE_URL || '';

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await fetch(`${baseUrl}/api/students/${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch student');
        const data = await response.json();
        setStudent(data);
      } catch (error) {
        console.error('Error fetching student:', error);
        alert('Failed to load student data');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchStudent();
    }
  }, [params.id, baseUrl]);

  const handleComplete = () => {
    router.push('/enrollment'); // Redirect back to enrollment list
  };

  if (loading) return <div>Loading...</div>;
  if (!student) return <div>Student not found</div>;

  return (
    <div className="p-3">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-bold text-black">Edit Student</h2>
        <button
          onClick={() => router.push('/enrollment')}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <EditEnrollmentForm 
        studentId={params.id} 
        onComplete={handleComplete}
        onCancel={() => router.push('/enrollment')}
      />
    </div>
  );
} 