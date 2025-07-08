import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';

interface Lead {
  _id: string;
  studentName: string;
  status: string;
  createdAt: string;
  leadSource: string;
  board: string;
  class: string;
  phoneNumber?: string;
  email?: string;
}

interface FilterState {
  filterType: 'preset' | 'monthly' | 'yearly' | 'dateRange';
  presetPeriod: '6months' | '12months' | 'all';
  selectedMonth: string;
  selectedYear: string;
  dateFrom: string;
  dateTo: string;
}

interface StatusData {
  status: string;
  count: number;
  percentage: number;
}

interface LeadAnalyticsProps {
  filters: FilterState;
  baseUrl: string;
  onSummary?: (summary: {
    totalLeads: number;
    monthlyLeads: { month: string; count: number }[];
    leadStatusData: StatusData[];
    sourceData: StatusData[];
  }) => void;
}

export default function LeadAnalytics({ filters, baseUrl, onSummary }: LeadAnalyticsProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadStatusData, setLeadStatusData] = useState<StatusData[]>([]);
  const [sourceData, setSourceData] = useState<StatusData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeads();
  }, [filters]);

  const fetchLeads = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${baseUrl}/api/leads/viewleads`);
      if (!response.ok) throw new Error('Failed to fetch leads');
      const data = await response.json();
      const leadsData: Lead[] = Array.isArray(data) ? data : data.data || [];
      const filteredLeads = applyFilters(leadsData);
      setLeads(filteredLeads);
      const { leadStatus, source, monthly } = processStatusAndSource(filteredLeads);
      if (onSummary) {
        onSummary({
          totalLeads: filteredLeads.length,
          monthlyLeads: monthly,
          leadStatusData: leadStatus,
          sourceData: source
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch leads');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = (leads: Lead[]) => {
    return leads.filter(lead => {
      const itemDate = new Date(lead.createdAt);
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

  const processStatusAndSource = (leads: Lead[]) => {
    const totalLeads = leads.length;
    // Status
    const statusMap = new Map<string, number>();
    leads.forEach(lead => {
      const status = lead.status || 'new';
      statusMap.set(status, (statusMap.get(status) || 0) + 1);
    });
    const leadStatus = Array.from(statusMap.entries()).map(([status, count]) => ({
      status: status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      count,
      percentage: Math.round((count / totalLeads) * 100)
    }));
    // Source
    const sourceMap = new Map<string, number>();
    leads.forEach(lead => {
      const source = lead.leadSource || 'Unknown';
      sourceMap.set(source, (sourceMap.get(source) || 0) + 1);
    });
    const source = Array.from(sourceMap.entries()).map(([source, count]) => ({
      status: source,
      count,
      percentage: Math.round((count / totalLeads) * 100)
    }));
    // Monthly
    const monthlyMap = new Map<string, number>();
    leads.forEach(lead => {
      const date = new Date(lead.createdAt);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + 1);
    });
    const monthly = Array.from(monthlyMap.entries()).map(([month, count]) => ({ month, count }));
    return { leadStatus, source, monthly };
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {/* Example: Total Leads Card */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Leads</p>
            <p className="text-3xl font-bold text-gray-900">{leads.length}</p>
            <p className="text-xs text-gray-500 mt-1">Based on created date</p>
          </div>
          <div className="p-3 bg-blue-100 rounded-lg">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>
      {/* Add more lead-related UI as needed, matching the dashboardAnalytics UI */}
    </div>
  );
} 