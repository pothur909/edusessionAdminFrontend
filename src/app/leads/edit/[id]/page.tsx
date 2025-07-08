'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import EditLeadForm from '../../components/leadEdit';
import React from 'react';

interface LeadData {
  _id: string;
  studentName: string;
  studentPhone: string;
  parentPhone: string;
  email: string;
  board: string;
  class: string;
  subjects: string[];
  status: "new" | "contacted" | "converted" | "not_interested" | "demo_scheduled" | "demo_completed" | "demo_cancelled" | "demo_no_show" | "demo_rescheduled" | "demo_rescheduled_cancelled" | "demo_rescheduled_completed" | "demo_rescheduled_no_show" | "no_response_from_Lead";
  notes: string;
  createdAt: string;
  updatedAt: string;
  leadSource: string;
  classesPerWeek: string;
  courseInterested: string;
  modeOfContact: string;
  preferredTimeSlots: string;
  counsellor: string;
  sessionBeginDate: string;
  sessionEndDate: string;
  remarks: string[];
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: LeadData[];
}

export default function EditLeadPage({ params }: { params: { id: string } }) {
  const resolvedParams = React.use(params);
  const [lead, setLead] = useState<LeadData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const baseUrl = process.env.BASE_URL || '';

  useEffect(() => {
    const fetchLead = async () => {
      try {
        // Using the Express API endpoint
        const response = await fetch(`${baseUrl}/api/leads/viewleads`);
        if (!response.ok) throw new Error('Failed to fetch leads');
        const result: ApiResponse = await response.json();
        
        // Check if the response has the expected structure
        if (!result.success || !Array.isArray(result.data)) {
          console.error('Invalid API response:', result);
          throw new Error('Invalid API response format');
        }

        // Find the specific lead by ID
        const leadData = result.data.find((l: LeadData) => l._id === resolvedParams.id);
        if (!leadData) throw new Error('Lead not found');
        setLead(leadData);
      } catch (error) {
        console.error('Error fetching lead:', error);
        alert('Failed to load lead data');
      } finally {
        setLoading(false);
      }
    };

    if (resolvedParams.id) {
      fetchLead();
    }
  }, [resolvedParams.id, baseUrl]);

  const handleComplete = () => {
    router.push('/leads'); // Redirect back to leads list
  };

  if (loading) return <div>Loading...</div>;
  if (!lead) return <div>Lead not found</div>;

  return (
    <div className="p-3">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-bold text-black">Edit Lead</h2>
        <button
          onClick={() => router.push('/leads')}
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
      <EditLeadForm lead={lead} onComplete={handleComplete} />
    </div>
  );
}
