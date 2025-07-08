"use client";

import { useState, useEffect } from "react";
import { FaEdit, FaSearch } from "react-icons/fa";
import api from "@/lib/api";

interface TimeSlot {
  _id?: string;
  value?: string;
  [key: string]: any;
}

interface Teacher {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  timeSlots: TimeSlot[];
}

const TeacherListPage = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");

  // Fetch teachers from API
  const fetchTeachers = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/admin/get-all-teachers");
      setTeachers(response.data);
      setFilteredTeachers(response.data);
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

  // Filter teachers based on search query and time slot
  useEffect(() => {
    let filtered = teachers;

    // Filter by search query (name or email)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        teacher =>
          teacher.name.toLowerCase().includes(query) ||
          teacher.email.toLowerCase().includes(query)
      );
    }

    // Filter by time slot
    if (selectedTimeSlot) {
      filtered = filtered.filter(teacher =>
        teacher.timeSlots.some(slot => {
          const slotValue = typeof slot === 'string' ? slot : slot.value || slot.time || slot.slot || slot.label;
          return slotValue === selectedTimeSlot;
        })
      );
    }

    setFilteredTeachers(filtered);
  }, [searchQuery, selectedTimeSlot, teachers]);

  // Get unique time slots from all teachers
  const getUniqueTimeSlots = () => {
    const slots = new Set<string>();
    teachers.forEach(teacher => {
      teacher.timeSlots.forEach(slot => {
        const slotValue = typeof slot === 'string' ? slot : slot.value || slot.time || slot.slot || slot.label;
        if (slotValue) slots.add(slotValue);
      });
    });
    return Array.from(slots).sort();
  };

  // Handle edit button click
  const handleEditClick = (teacherId: string) => {
    window.location.href = `/all-teachers/edit/${teacherId}`;
  };

  // Helper function to render time slots
  const renderTimeSlots = (timeSlots: TimeSlot[]) => {
    if (!timeSlots || timeSlots.length === 0) {
      return <span className="text-gray-400">No time slots available</span>;
    }

    return timeSlots.map((slot, index) => {
      let displayValue = "";
      
      if (typeof slot === 'string') {
        displayValue = slot;
      } else if (slot && typeof slot === 'object') {
        displayValue = slot.value || slot.time || slot.slot || slot.label || JSON.stringify(slot);
      } else {
        displayValue = String(slot);
      }

      return (
        <span 
          key={slot._id || index} 
          className="ml-2 bg-blue-100 px-2 py-1 rounded text-sm"
        >
          {displayValue}
        </span>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4">Teacher Profiles</h1>
          
          {/* Search and Filter Section */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>

            {/* Time Slot Filter */}
            <div className="w-full md:w-64">
              <select
                value={selectedTimeSlot}
                onChange={(e) => setSelectedTimeSlot(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Time Slots</option>
                {getUniqueTimeSlots().map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>
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
            filteredTeachers.map((teacher) => (
              <div
                key={teacher._id}
                className="bg-white rounded-lg shadow-sm border p-4 flex flex-col items-start"
              >
                <h2 className="text-lg font-semibold">{teacher.name}</h2>
                <p className="text-gray-600">Email: {teacher.email}</p>
                <p className="text-gray-600">Phone: {teacher.phoneNumber}</p>
                <div className="text-gray-600 mb-2">
                  <span>Time Slots: </span>
                  {renderTimeSlots(teacher.timeSlots)}
                </div>
                <button
                  onClick={() => handleEditClick(teacher._id)}
                  className="mt-4 flex items-center text-blue-600 hover:text-blue-800"
                >
                  <FaEdit className="mr-2" /> Edit Profile
                </button>
              </div>
            ))}
        </div>

        {/* No Results Message */}
        {!loading && filteredTeachers.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No teachers found matching your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherListPage;