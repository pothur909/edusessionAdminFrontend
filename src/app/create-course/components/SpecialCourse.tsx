"use client";

import React, { useEffect, useState } from "react";
import {
  fetchSpecialCourses,
  deleteSpecialCourse,
  createSpecialCourse,
} from "@/services/adminServices";
import { X } from "lucide-react";

const SpecialCourse = () => {
  const [courseData, setCourseData] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCourse, setNewCourse] = useState({
    courseName: "",
    imageUrl: "",
    description: "",
    price: "",
    duration: "",
  });

  const fetchCourseData = async () => {
    const data = await fetchSpecialCourses();
    setCourseData(data);
  };

  useEffect(() => {
    fetchCourseData();
  }, []);

  const handleDelete = async () => {
    await deleteSpecialCourse(selectedCourse._id);
    setSelectedCourse(null);
    setShowDeleteConfirm(false);
    fetchCourseData();
  };

  const handleCreateCourse = async () => {
    await createSpecialCourse(newCourse);
    setShowCreateModal(false);
    setNewCourse({
      courseName: "",
      imageUrl: "",
      description: "",
      price: "",
      duration: "",
    });
    fetchCourseData();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">🌟 Special Courses</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Add Course
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {courseData?.length
          ? courseData?.map((course) => (
              <div
                key={course._id}
                className="relative bg-white rounded-xl shadow hover:shadow-lg cursor-pointer overflow-hidden"
                onClick={() => setSelectedCourse(course)}
              >
                <img
                  src={course.imageUrl}
                  alt={course.courseName}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {course.courseName}
                  </h3>
                  <p className="text-sm text-gray-600">{course.duration}</p>
                  <p className="text-sm text-blue-700 font-semibold mt-1">
                    ₹{course.price}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCourse(course);
                    setShowDeleteConfirm(true);
                  }}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                >
                  <X />
                </button>
              </div>
            ))
          : "no courses found"}
      </div>

      {/* Course Info Modal */}
      {selectedCourse && !showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setSelectedCourse(null)}
            >
              <X />
            </button>
            <img
              src={selectedCourse.imageUrl}
              className="w-full h-48 object-cover rounded mb-4"
            />
            <h3 className="text-xl font-bold mb-2">
              {selectedCourse.courseName}
            </h3>
            <p className="text-sm text-gray-700 mb-2">
              {selectedCourse.description}
            </p>
            <p className="text-sm">⏳ Duration: {selectedCourse.duration}</p>
            <p className="text-sm font-semibold text-blue-600 mt-2">
              ₹{selectedCourse.price}
            </p>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Confirm Deletion
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete "{selectedCourse.courseName}"?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Course Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-lg w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowCreateModal(false)}
            >
              <X />
            </button>
            <h3 className="text-xl font-bold mb-4">
              ➕ Add New Special Course
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <input
                type="text"
                placeholder="Course Name"
                value={newCourse.courseName}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, courseName: e.target.value })
                }
                className="p-2 border rounded"
              />
              <input
                type="text"
                placeholder="Image URL"
                value={newCourse.imageUrl}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, imageUrl: e.target.value })
                }
                className="p-2 border rounded"
              />
              <textarea
                placeholder="Description"
                value={newCourse.description}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, description: e.target.value })
                }
                className="p-2 border rounded"
              />
              <input
                type="number"
                placeholder="Price"
                value={newCourse.price}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, price: e.target.value })
                }
                className="p-2 border rounded"
              />
              <input
                type="text"
                placeholder="Duration"
                value={newCourse.duration}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, duration: e.target.value })
                }
                className="p-2 border rounded"
              />
              <button
                onClick={handleCreateCourse}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Create Course
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpecialCourse;
