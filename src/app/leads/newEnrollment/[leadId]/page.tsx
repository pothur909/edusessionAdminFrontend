import EnrollmentAddForm from '../../../enrollment/components/enrollmentAddForm';

async function fetchLeadById(leadId: string) {
  const res = await fetch(`${process.env.BASE_URL || 'http://localhost:6969'}/api/leads/lead/${leadId}`);
  if (!res.ok) throw new Error('Failed to fetch lead');
  return res.json();
}

async function fetchTeachers(board: string, className: string, subject: string) {
  const res = await fetch(`${process.env.BASE_URL || 'http://localhost:6969'}/api/session/fetchTeacherByCardId`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: '1',
      classType: 'normal',
      board,
      className,
      subject
    })
  });
  if (!res.ok) throw new Error('Failed to fetch teachers');
  const data = await res.json();
  return data.teachers || [];
}

async function fetchEnrollmentByLeadIdOrEmail(leadId: string, email: string) {
  const res = await fetch(`${process.env.BASE_URL || 'http://localhost:6969'}/api/students`);
  if (!res.ok) throw new Error('Failed to fetch enrollments');
  const data = await res.json();
  if (data.success && data.data) {
    return data.data.find(
      (enrollment: any) => enrollment.lead === leadId || enrollment.email === email
    );
  }
  return null;
}

export default async function NewEnrollmentPage(props: { params: { leadId: string } }) {
  const { leadId } = await props.params;
  let lead, error = null;

  try {
    const res = await fetch('http://localhost:6969/api/leads/lead/' + leadId, { cache: 'no-store' });
    const data = await res.json();
    lead = data.lead; // <-- This is correct!
  } catch (err: any) {
    error = err.message || 'Failed to load lead';
  }

  if (error) {
    return <div style={{ color: 'red', padding: 32 }}>Error: {error}</div>;
  }

  const subject = Array.isArray(lead.subjects) && lead.subjects.length > 0 ? lead.subjects[0] : '';
  console.log('DEBUG lead fields:', {
    board: lead.board,
    class: lead.class,
    subjects: lead.subjects,
    subject
  });
  if (!lead.board || !lead.class || !subject) {
    return <div style={{ color: 'red', padding: 32 }}>Missing board, class, or subject for this lead.</div>;
  }
  const teachers = await fetchTeachers(lead.board, lead.class, subject);

  // Fetch existing enrollment for this lead or email
  const existingEnrollment = await fetchEnrollmentByLeadIdOrEmail(leadId, lead.email);
  if (existingEnrollment) {
    lead.existingStudentId = existingEnrollment._id;
  }

  return (
    <EnrollmentAddForm
      lead={lead}
      teachers={teachers}
    />
  );
} 