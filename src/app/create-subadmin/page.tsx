"use client";

import React, { useState } from "react";

const ALL_PAGES = [
  { label: "Create Leads", value: "create leads" },
  { label: "Show Leads", value: "show leads" },
  { label: "Show Enrollment", value: "show emrollments" },
  { label: "Show Enrollment (typo)", value: "show emrollment" },
  { label: "Dashboard", value: "dashboard" },
  { label: "Teacher Application", value: "teachers" },
  { label: "Enroll Teacher", value: "enroll-teacher" },
  { label: "Enrolled Teachers", value: "enrolled-teachers" },
  { label: "Create Course", value: "create-course" },
  { label: "Settings", value: "settings" },
  { label: "Custom Price change", value: "minute-price" },
];

const ROLES = [
  { label: "Sales", value: "sales" },
  { label: "Manager", value: "manager" },
  { label: "Admin", value: "admin" },
];

export default function CreateSubadminPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "sales",
    allowedPages: [],
  });
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAllowedPagesChange = (value: string) => {
    setForm((prev) => {
      let allowedPages = prev.allowedPages.includes(value)
        ? prev.allowedPages.filter((v) => v !== value)
        : [...prev.allowedPages, value];
      return { ...prev, allowedPages };
    });
  };

  const handleSelectAll = () => {
    setSelectAll((prev) => {
      const newVal = !prev;
      setForm((f) => ({
        ...f,
        allowedPages: newVal ? ALL_PAGES.map((p) => p.value) : [],
      }));
      return newVal;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("http://localhost:6969/api/admin/create-subadmin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setMessage("Subadmin created successfully!");
        setForm({ name: "", email: "", password: "", role: "sales", allowedPages: [] });
        setSelectAll(false);
      } else {
        const data = await res.json();
        setMessage(data.message || "Failed to create subadmin");
      }
    } catch (err) {
      setMessage("Error creating subadmin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-8 rounded shadow">
      <h2 className="text-2xl font-bold mb-6">Create Subadmin</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Role</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          >
            {ROLES.map((role) => (
              <option key={role.value} value={role.value}>{role.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">Allowed Pages</label>
          <div className="mb-2">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
                className="mr-2"
              />
              Select All
            </label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {ALL_PAGES.map((page) => (
              <label key={page.value} className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={form.allowedPages.includes(page.value)}
                  onChange={() => handleAllowedPagesChange(page.value)}
                  className="mr-2"
                />
                {page.label}
              </label>
            ))}
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Subadmin"}
        </button>
        {message && <div className="mt-2 text-center text-sm text-red-600">{message}</div>}
      </form>
    </div>
  );
} 