
'use client';

import { useState, useEffect } from "react";
import { LeadForm } from "../components/leadAdd";
import DemoLeadForm from "../../demo/components/demoForm";

const initialLeadData = {
  studentName: "",
  studentPhone: "+91",
  parentPhone: "+91",
  email: "",
  board: "",
  class: "",
  subjects: [],
  leadSource: "",
  classesPerWeek: "",
  courseInterested: "",
  modeOfContact: "",
  preferredTimeSlots: "",
  counsellor: "",
  sesssionBeginDate: "",
  sessionEndDate: "",
  remarks: [],
  notes: "",
};


export default function AddLead() {
  const [tab, setTab] = useState("lead");
  const [formData, setFormData] = useState<any>(initialLeadData);
  const [teachers, setTeachers] = useState<any[]>([]);

  const baseUrl= process.env.BASE_URL;

  useEffect(() => {
    // Only fetch if required fields are present
    const { board, class: className, subjects } = formData;
    if (!board || !className || !subjects || !subjects[0]) return;

    const payload = {
      type: '1',
      classType: 'normal',
      board,
      className,
      subject: subjects[0],
    };
    console.log('Fetching teachers with:', payload);
    fetch(`${baseUrl}/api/session/fetchTeacherByCardId`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(async res => {
        const data = await res.json();
        console.log('Teacher fetch response:', data);
        setTeachers(data.teachers || []);
      })
      .catch(err => {
        console.error('Teacher fetch error:', err);
        setTeachers([]);
      });
  }, [formData.board, formData.class, formData.subjects]);

  // Helper: Check if lead form is complete (required fields filled)
  const isLeadSaved = !!formData._id && /^[a-fA-F0-9]{24}$/.test(formData._id);
  const requiredFields = [
    'studentName', 'studentPhone', 'parentPhone', 'board', 'class', 'subjects', 'leadSource', 'classesPerWeek', 'courseInterested', 'modeOfContact'
  ];
  const isFormComplete = requiredFields.every(field => {
    if (Array.isArray(formData[field])) return formData[field].length > 0;
    return !!formData[field] && formData[field].toString().trim() !== '';
  });

  return (
    <div>
      <div className="flex border-b mb-4">
        <button onClick={() => setTab("lead")} className={`px-4 py-2 ${tab === "lead" ? "font-bold border-b-2 border-blue-600" : ""}`}>Lead Form</button>
        <button
          onClick={() => {
            if (isLeadSaved && isFormComplete) {
              setTab("demo");
            } else {
              alert("Please complete and save the lead form before switching to the Demo tab.");
            }
          }}
          className={`px-4 py-2 ${tab === "demo" ? "font-bold border-b-2 border-blue-600" : ""} ${(!isLeadSaved || !isFormComplete) ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!isLeadSaved || !isFormComplete}
        >
          Demo Form
        </button>
      </div>
      {tab === "lead" && (
        <LeadForm formData={formData} setFormData={setFormData} teachers={teachers} />
      )}
      {tab === "demo" && isLeadSaved && isFormComplete && (
        <DemoLeadForm
          lead={formData}
          onComplete={() => {}}
          onCancel={() => setTab("lead")}
          teachers={teachers}
        />
      )}
    </div>
  );
}