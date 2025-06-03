"use client";

import { useState, useEffect } from "react";
import { FaEdit } from "react-icons/fa"; // Import edit icon
import api from "@/lib/api";

interface Teacher {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
}

const TeacherListPage = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch teachers from API
  const fetchTeachers = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/admin/get-all-teachers");
      setTeachers(response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to fetch teachers";
      setError(errorMessage);
      console.error("Error fetching teachers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  // Handle edit button click
  const handleEditClick = (teacherId: string) => {
    // Redirect to edit page or open a modal
    window.location.href = `/all-teachers/edit/${teacherId}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h1 className="text-2xl font-bold">Teacher Profiles</h1>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="flex justify-center items-center">
            <p>Loading...</p>
          </div>
        )}

        {/* Teacher Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {!loading &&
            teachers.map((teacher) => (
              <div
                key={teacher._id}
                className="bg-white rounded-lg shadow-sm border p-4 flex flex-col items-start"
              >
                <h2 className="text-lg font-semibold">{teacher.name}</h2>
                <p className="text-gray-600">Email: {teacher.email}</p>
                <p className="text-gray-600">Phone: {teacher.phoneNumber}</p>
                <button
                  onClick={() => handleEditClick(teacher._id)}
                  className="mt-4 flex items-center text-blue-600 hover:text-blue-800"
                >
                  <FaEdit className="mr-2" /> Edit Profile
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default TeacherListPage;