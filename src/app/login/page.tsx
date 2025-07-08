"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SideBar from "../components/sideBar";

// Dummy sidebar pages for demo
const ALL_PAGES = [
  { key: "dashboard", label: "Dashboard", path: "/dashboard" },
  { key: "leads", label: "Leads", path: "/leads" },
  { key: "teachers", label: "Teachers", path: "/teachers" },
  { key: "analytics", label: "Analytics", path: "/dashboard/analytics" },
  // Add more as needed
];

interface User {
  name?: string;
  email?: string;
  allowedPages?: string[] | 'all';
  [key: string]: any;
}

// Mapping from backend page names to sidebar keys
const PAGE_KEY_MAP: Record<string, string> = {
  "create leads": "leads",
  "show leads": "leads",
  "show emrollment": "enrollment",
  // Add more mappings as needed
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [admin, setAdmin] = useState<User | null>(null);
  const [allowedPages, setAllowedPages] = useState<string[]>([]);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:6969/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      setAdmin(data.admin);
      let allowed = data.admin.allowedPages;
      if (allowed === "all") allowed = ALL_PAGES.map(p => p.key);
      else if (Array.isArray(allowed)) {
        // Map backend allowedPages to sidebar keys
        allowed = allowed.map((page: string) => PAGE_KEY_MAP[page]).filter(Boolean);
      } else {
        allowed = [];
      }
      setAllowedPages(allowed || []);
      // Save token and admin info
      localStorage.setItem("token", data.token);
      localStorage.setItem("admin", JSON.stringify(data.admin));
      // Dispatch event to notify sidebar
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("admin-updated"));
      }
      // Redirect to first allowed page
      if (allowed && allowed.length > 0) {
        router.push(ALL_PAGES.find(p => p.key === allowed[0])?.path || "/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  // If logged in, show sidebar and welcome
  if (admin) {
    return (
      <div className="flex">
        <SideBar allowedPages={allowedPages}>
          <div className="flex-1 p-8">
            <h1 className="text-2xl font-bold mb-4">Welcome, {admin.name || admin.email}!</h1>
            <p>You have access to the following pages:</p>
            <ul className="list-disc ml-6 mt-2">
              {allowedPages.map(page => (
                <li key={page}>{page}</li>
              ))}
            </ul>
          </div>
        </SideBar>
      </div>
    );
  }

  // Login form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Login</h1>
        {error && <div className="mb-4 text-red-600">{error}</div>}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block mb-1 font-medium">Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}