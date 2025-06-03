"use client";
import { useState } from "react";

const UpdateForm = ({ onSubmit }) => {
  const [board, setBoard] = useState("");
  const [className, setClassName] = useState("");
  const [subject, setSubject] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!board || !className || !subject) {
      alert("All fields are required.");
      return;
    }
    onSubmit(board, className, subject);
    setBoard("");
    setClassName("");
    setSubject("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 p-4 bg-gray-100 rounded-xl shadow"
    >
      <h3 className="text-xl font-semibold mb-4">📥 Update Board Tree</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Board"
          value={board}
          onChange={(e) => setBoard(e.target.value)}
          className="p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Class"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          className="p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="p-2 border rounded"
        />
      </div>
      <button
        type="submit"
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Submit
      </button>
    </form>
  );
};

export default UpdateForm;
