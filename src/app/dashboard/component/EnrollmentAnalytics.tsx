import { useState, useEffect } from 'react';
import { UserCheck } from 'lucide-react';

interface Enrollment {
  _id: string;
  studentName: string;
  createdAt: string;
  city: string;
  counsellor: string;
  phoneNumber?: string;
  email?: string;
  status?: string;
}

interface FilterState {
  filterType: 'preset' | 'monthly' | 'yearly' | 'dateRange';
  presetPeriod: '6months' | '12months' | 'all';
  selectedMonth: string;
  selectedYear: string;
  dateFrom: string;
  dateTo: string;
}

interface EnrollmentAnalyticsProps {
  filters: FilterState;
  baseUrl: string;
  onSummary?: (summary: {
    totalEnrollments: number;
    monthlyEnrollments: { month: string; count: number }[];
  }) => void;
}

export default function EnrollmentAnalytics({ filters, baseUrl, onSummary }: EnrollmentAnalyticsProps) {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEnrollments();
  }, [filters]);

  const fetchEnrollments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${baseUrl}/api/students`);
      if (!response.ok) throw new Error('Failed to fetch enrollments');
      const data = await response.json();
      const enrollmentsData: Enrollment[] = Array.isArray(data) ? data : data.data || [];
      const filteredEnrollments = applyFilters(enrollmentsData);
      setEnrollments(filteredEnrollments);
      const monthly = processMonthly(filteredEnrollments);
      if (onSummary) {
        onSummary({
          totalEnrollments: filteredEnrollments.length,
          monthlyEnrollments: monthly
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch enrollments');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = (enrollments: Enrollment[]) => {
    return enrollments.filter(enrollment => {
      const itemDate = new Date(enrollment.createdAt);
      switch (filters.filterType) {
        case 'preset': {
          const now = new Date();
          const monthsBack = filters.presetPeriod === '6months' ? 6 : filters.presetPeriod === '12months' ? 12 : 999;
          const cutoffDate = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);
          return filters.presetPeriod === 'all' || itemDate >= cutoffDate;
        }
        case 'monthly': {
          if (!filters.selectedMonth) return true;
          return itemDate.getMonth() === parseInt(filters.selectedMonth) - 1 && itemDate.getFullYear() === parseInt(filters.selectedYear);
        }
        case 'yearly':
          return itemDate.getFullYear() === parseInt(filters.selectedYear);
        case 'dateRange': {
          if (!filters.dateFrom && !filters.dateTo) return true;
          const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : new Date('1900-01-01');
          const toDate = filters.dateTo ? new Date(filters.dateTo) : new Date('2100-12-31');
          return itemDate >= fromDate && itemDate <= toDate;
        }
        default:
          return true;
      }
    });
  };

  const processMonthly = (enrollments: Enrollment[]) => {
    const monthlyMap = new Map<string, number>();
    enrollments.forEach(enrollment => {
      const date = new Date(enrollment.createdAt);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + 1);
    });
    return Array.from(monthlyMap.entries()).map(([month, count]) => ({ month, count }));
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {/* Example: Total Enrollments Card */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Enrollments</p>
            <p className="text-3xl font-bold text-gray-900">{enrollments.length}</p>
            <p className="text-xs text-gray-500 mt-1">Based on created date</p>
          </div>
          <div className="p-3 bg-green-100 rounded-lg">
            <UserCheck className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>
      {/* Add more enrollment-related UI as needed, matching the dashboardAnalytics UI */}
    </div>
  );
} 