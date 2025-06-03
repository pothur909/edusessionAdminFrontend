"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { FaSave, FaArrowLeft, FaEyeSlash, FaEye } from "react-icons/fa";
import { Check, X, AlertCircle, BookOpen } from "lucide-react";
import api from "@/lib/api";
import { log } from "console";

interface SearchCard {
  _id: string;
  type: 1 | 2;
  classType: "special" | "normal";
  board?: string;
  className?: string;
  subject?: string;
  specialCourseName?: string;
  specialCourseRef?: string;
}

interface TeacherFormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  searchCards: string[];
  isAvailable: boolean;
}

const EditTeacherPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id; // Get teacher ID from URL

  const [teacherData, setTeacherData] = useState<TeacherFormData>({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    searchCards: [],
    isAvailable: true,
  });

  const [initialTeacherData, setInitialTeacherData] = useState<any>({});
  const [searchCards, setSearchCards] = useState<SearchCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false); // State for password visibility

  // Fetch teacher details
  const fetchTeacherDetails = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get(`/admin/get-teacher/${id}`);
      const teacher = response.data;
      setTeacherData({
        fullName: teacher.name,
        email: teacher.email,
        phoneNumber: teacher.phoneNumber,
        password: teacher.password,
        searchCards: teacher.searchCardRef.map((card) => card._id),
        isAvailable: teacher.isAvailable,
      });
      setInitialTeacherData({
        name: teacher.name,
        email: teacher.email,
        phoneNumber: teacher.phoneNumber,
        password: teacher.password,
        searchCardRef: teacher.searchCardRef.map((card) => card._id),
        isAvailable: teacher.isAvailable,
      });
      setSelectedCards(teacher.searchCardRef.map((card) => card._id));// preselect associated 
      // cards
      console.log("Teacher search cards:", teacher.searchCardRef);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to fetch teacher details";
      setError(errorMessage);
      console.error("Error fetching teacher details:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch search cards
  const fetchSearchCards = async () => {
    setCardsLoading(true);
    setError("");

    try {
      const response = await api.get("/admin/get-search-cards");
      setSearchCards(response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to fetch search cards";
      setError(errorMessage);
      console.error("Error fetching search cards:", err);
    } finally {
      setCardsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchTeacherDetails();
      fetchSearchCards();
    }
  }, [id]);

  // Handle input changes
  const handleInputChange = (field: keyof TeacherFormData, value: string | boolean) => {
    setTeacherData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };


  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  // Handle card selection
  const handleCardSelection = (cardId: string) => {
    setSelectedCards((prev) =>
      prev.includes(cardId) ? prev.filter((id) => id !== cardId) : [...prev, cardId]
    );
  };

  // Save changes
const handleSaveChanges = async () => {
  setLoading(true);
  setError("");

  try {
     // Ensure selectedCards contains only valid ObjectId strings
    const validSelectedCards = selectedCards.map((card) => {
      if (typeof card === "object" && card._id) {
        return card._id; // Extract _id if card is an object
      }
      return card; // Otherwise, use the card directly
    });

    // Prepare payload
    const payload = {
      fullName: teacherData.fullName,
      email: teacherData.email,
      phoneNumber: teacherData.phoneNumber,
      password: teacherData.password,
      searchCards: validSelectedCards, // Ensure this is an array of IDs
      isAvailable: teacherData.isAvailable,
    };

    console.log("Payload being sent:", payload);

    // Make PUT request to backend
    await api.put(`/admin/update-teacher/${id}`, payload);
    alert("Teacher profile updated successfully!");
    router.push("/all-teachers"); // Redirect to teacher list page
  } catch (err) {
    const errorMessage = err.response?.data?.message || "Failed to update teacher profile";
    setError(errorMessage);
    console.error("Error updating teacher profile:", err);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.push("/all-teachers")}
              className="bg-gray-200 hover:bg-gray-300 text-gray-600 px-3 py-2 rounded-lg flex items-center space-x-2"
            >
              <FaArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Edit Teacher Profile</h1>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Error: {error}</span>
            </div>
          </div>
        )}

        {/* Edit Form */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={teacherData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={teacherData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter email address"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={teacherData.phoneNumber}
                onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter phone number"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={isPasswordVisible ? "text" : "password"}
                  value={teacherData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {isPasswordVisible ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
              <select
                value={teacherData.isAvailable ? "true" : "false"}
                onChange={(e) => handleInputChange("isAvailable", e.target.value === "true")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="true">Available</option>
                <option value="false">Unavailable</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleSaveChanges}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Saving Changes..." : "Save Changes"}
          </button>
        </div>

        {/* Search Cards */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Search Cards</h2>
          {cardsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading search cards...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchCards.map((card) => (
                <div
                  key={card._id}
                  onClick={() => handleCardSelection(card._id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                    selectedCards.includes(card._id)
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className={`p-2 rounded-lg ${
                        card.classType === "special"
                          ? "bg-purple-100 text-purple-600"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      <BookOpen className="w-4 h-4" />
                    </div>
                    {selectedCards.includes(card._id) && (
                      <div className="bg-green-500 rounded-full p-1">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2 text-sm">
                    {card.classType === "special"
                      ? card.specialCourseName || "Special Course"
                      : `${card.board} - ${card.className} - ${card.subject}`}
                  </h3>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditTeacherPage;