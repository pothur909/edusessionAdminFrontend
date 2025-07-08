

import DemoLeadForm, { Lead, Teacher } from '../../components/demoForm';

interface BookDemoPageProps {
  params: { leadId: string };
}

const baseUrl =  process.env.BASE_URL ; // Hardcoded for reliability

async function fetchLeadById(leadId: string): Promise<Lead> {
  const res = await fetch(`${baseUrl}/api/leads/lead/${leadId}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch lead');
  return res.json();
}

// async function fetchDemosByLeadId(leadId: string): Promise<Demo[]> {
//   const res = await fetch(`${baseUrl}/api/demo/view/${leadId}`);
//   if (res.status === 404) return [];
//   if (!res.ok) throw new Error('Failed to fetch demos');
//   const data = await res.json();
//   return data.demos || [];
// }

async function fetchTeachers(board: string, className: string, subject: string): Promise<Teacher[]> {
  const res = await fetch(`${baseUrl}/api/session/fetchTeacherByCardId`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: '1',
      classType: 'normal',
      board,
      className,
      subject
    })
  })
  if (!res.ok) throw new Error('Failed to fetch teachers');
  const data = await res.json();
  return data.teachers || [];
}

export default async function BookDemoPage(props: BookDemoPageProps) {
  const { leadId } = await props.params;
  let lead, error = null;

  try {
    const res = await fetch(`${baseUrl}/api/leads/lead/${leadId}`, { cache: 'no-store' });
    const data = await res.json();
    if (!res.ok || !data.lead) throw new Error(data.message || 'Lead not found');
    lead = data.lead;
  } catch (err: any) {
    error = err.message || 'Failed to load lead';
  }

  if (error) {
    return <div style={{ color: 'red', padding: 32 }}>Error: {error}</div>;
  }

  const subject = Array.isArray(lead.subjects) && lead.subjects.length > 0 ? lead.subjects[0] : '';
  if (!lead.board || !lead.class || !subject) {
    return <div style={{ color: 'red', padding: 32 }}>Missing board, class, or subject for this lead.</div>;
  }
  const teachers = await fetchTeachers(lead.board, lead.class, subject);

  // Transform lead to match DemoLeadForm's expected type
  const transformedLead = {
    ...lead,
    classesPerWeek: Number(lead.classesPerWeek) || 0,
    remarks: Array.isArray(lead.remarks) ? lead.remarks : (lead.remarks ? [lead.remarks] : []),
  };

  return (
    <DemoLeadForm
      lead={transformedLead}
      teachers={teachers}
    />
  );
} 