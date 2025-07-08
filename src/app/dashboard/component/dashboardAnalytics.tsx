
'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Calendar, Users, UserCheck, TrendingUp, Phone, Mail, BookOpen, Award, Filter, X } from 'lucide-react';
import DoubtSessionAnalytics from './DoubtSessionAnalytics';
import LeadAnalytics from './LeadAnalytics';
import EnrollmentAnalytics from './EnrollmentAnalytics';

interface DashboardStats {
  totalLeads: number;
  totalEnrollments: number;
  conversionRate: number;
  newLeadsThisMonth: number;
  enrollmentsThisMonth: number;
}

interface MonthlyData {
  month: string;
  leads: number;
  enrollments: number;
  conversions: number;
}

interface StatusData {
  status: string;
  count: number;
  percentage: number;
}

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

export default function AnalyticsDashboard() {
  const [filters, setFilters] = useState<FilterState>({
    filterType: 'preset',
    presetPeriod: '6months',
    selectedMonth: '',
    selectedYear: new Date().getFullYear().toString(),
    dateFrom: '',
    dateTo: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const baseUrl = process.env.BASE_URL;
  const [selectedSubject, setSelectedSubject] = useState('');

  // State for summary data
  const [leadSummary, setLeadSummary] = useState({
    totalLeads: 0,
    monthlyLeads: [],
    leadStatusData: [],
    sourceData: []
  });
  const [enrollmentSummary, setEnrollmentSummary] = useState({
    totalEnrollments: 0,
    monthlyEnrollments: []
  });

  // Helper for monthly trends
  const monthlyData = (() => {
    // Merge months from both summaries
    const months = new Set([
      ...leadSummary.monthlyLeads.map(m => m.month),
      ...enrollmentSummary.monthlyEnrollments.map(m => m.month)
    ]);
    return Array.from(months).sort((a, b) => new Date('01 ' + a) - new Date('01 ' + b)).map(month => ({
      month,
      leads: leadSummary.monthlyLeads.find(m => m.month === month)?.count || 0,
      enrollments: enrollmentSummary.monthlyEnrollments.find(m => m.month === month)?.count || 0,
      conversions: (leadSummary.monthlyLeads.find(m => m.month === month)?.count || 0)
        ? Math.round(((enrollmentSummary.monthlyEnrollments.find(m => m.month === month)?.count || 0) /
          (leadSummary.monthlyLeads.find(m => m.month === month)?.count || 1)) * 100)
        : 0
    }));
  })();
  const conversionRate = leadSummary.totalLeads > 0 ? Math.round((enrollmentSummary.totalEnrollments / leadSummary.totalLeads) * 100) : 0;

  // Generate month and year options
  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  // Removed applyFilters, processData, resetFilters, getFilterLabel, COLORS, isLoading, error, showFilters

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-1">Monitor your leads and enrollments performance</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-600 bg-white px-3 py-2 rounded-lg border">
                Showing: <span className="font-medium">{
                  filters.filterType === 'preset' ?
                    (filters.presetPeriod === '6months' ? 'Last 6 Months' : filters.presetPeriod === '12months' ? 'Last 12 Months' : 'All Time') :
                  filters.filterType === 'monthly' && filters.selectedMonth ?
                    `${months.find(m => m.value === filters.selectedMonth)?.label} ${filters.selectedYear}` :
                  filters.filterType === 'yearly' ?
                    `Year ${filters.selectedYear}` :
                  filters.filterType === 'dateRange' && (filters.dateFrom || filters.dateTo) ?
                    `${filters.dateFrom || '...'} to ${filters.dateTo || '...'}` :
                  'All Time'
                }</span>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </button>
            </div>
          </div>
        </div>

        {/* Month Selector - Always Visible */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 mb-6">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Quick Month Selection:</label>
            <select
              value={filters.selectedMonth}
              onChange={(e) => setFilters({
                ...filters, 
                selectedMonth: e.target.value,
                filterType: e.target.value ? 'monthly' : filters.filterType
              })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
            >
              <option value="">All Months</option>
              {months.map(month => (
                <option key={month.value} value={month.value}>{month.label}</option>
              ))}
            </select>
            {filters.selectedMonth && (
              <select
                value={filters.selectedYear}
                onChange={(e) => setFilters({...filters, selectedYear: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            )}
            {filters.selectedMonth && (
              <button
                onClick={() => setFilters({...filters, selectedMonth: '', filterType: 'preset'})}
                className="px-3 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                Clear Month
              </button>
            )}
          </div>
        </div>

        {/* Advanced Filter Panel */}
        {showFilters && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Advanced Filter Options</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              {/* Filter Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter Type</label>
                <select
                  value={filters.filterType}
                  onChange={(e) => setFilters({...filters, filterType: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
                >
                  <option value="preset">Preset Period</option>
                  <option value="yearly">Yearly</option>
                  <option value="dateRange">Date Range</option>
                </select>
              </div>

              {/* Preset Period */}
              {filters.filterType === 'preset' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Period</label>
                  <select
                    value={filters.presetPeriod}
                    onChange={(e) => setFilters({...filters, presetPeriod: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
                  >
                    <option value="6months">Last 6 Months</option>
                    <option value="12months">Last 12 Months</option>
                    <option value="all">All Time</option>
                  </select>
                </div>
              )}

              {/* Yearly Filter */}
              {filters.filterType === 'yearly' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                  <select
                    value={filters.selectedYear}
                    onChange={(e) => setFilters({...filters, selectedYear: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
                  >
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Date Range Filter */}
              {filters.filterType === 'dateRange' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                    <input
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                    <input
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowFilters(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <LeadAnalytics filters={filters} baseUrl={baseUrl} onSummary={setLeadSummary} />
          <EnrollmentAnalytics filters={filters} baseUrl={baseUrl} onSummary={setEnrollmentSummary} />
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-3xl font-bold text-gray-900">{conversionRate}%</p>
                <p className="text-xs text-gray-500 mt-1">Lead to enrollment</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {filters.filterType === 'monthly' ? 'Daily Avg Leads' : 'Monthly Avg Leads'}
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {Math.round(monthlyData.reduce((sum, period) => sum + period.leads, 0) / Math.max(monthlyData.length, 1))}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {filters.filterType === 'monthly' ? 'This month' : `Last ${monthlyData.length} periods`}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {filters.filterType === 'monthly' ? 'Daily Avg Enrollments' : 'Monthly Avg Enrollments'}
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {Math.round(monthlyData.reduce((sum, period) => sum + period.enrollments, 0) / Math.max(monthlyData.length, 1))}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {filters.filterType === 'monthly' ? 'This month' : `Last ${monthlyData.length} periods`}
                </p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-lg">
                <Award className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly/Daily Trends */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {filters.filterType === 'monthly' && filters.selectedMonth ? 'Daily Trends' : 'Monthly Trends'}
              </h3>
              <div className="flex space-x-4 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-gray-600">Leads</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-gray-600">Enrollments</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="leads" 
                  stackId="1"
                  stroke="#3B82F6" 
                  fill="#3B82F6"
                  fillOpacity={0.1}
                />
                <Area 
                  type="monotone" 
                  dataKey="enrollments" 
                  stackId="2"
                  stroke="#10B981" 
                  fill="#10B981"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
           {/* Conversion Rate Trend */}
   <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                 {filters.filterType === 'monthly' && filters.selectedMonth ? 'Daily Conversion Rate' : 'Monthly Conversion Rate'}
               </h3>
               <div className="text-sm text-gray-600">Percentage</div>
        </div>
           <ResponsiveContainer width="100%" height={300}>
             <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value) => [`${value}%`, 'Conversion Rate']}
                />
                <Line 
                  type="monotone" 
                  dataKey="conversions" 
                  stroke="#F59E0B" 
                  strokeWidth={3}
                  dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#F59E0B', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div> <DoubtSessionAnalytics filters={filters} subject={selectedSubject} /></div>
        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lead Status Distribution */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Lead Status Distribution</h3>
            <div className="space-y-4">
              {leadSummary.leadStatusData.slice(0, 6).map((item, index) => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-3"
                      style={{ backgroundColor: [
                        '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'
                      ][index % 8] }}
                    ></div>
                    <span className="text-sm text-gray-700">{item.status}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{item.count}</div>
                    <div className="text-xs text-gray-500">{item.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Lead Sources */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Lead Sources</h3>
            <div className="space-y-4">
              {leadSummary.sourceData.slice(0, 6).map((item, index) => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-3"
                      style={{ backgroundColor: [
                        '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'
                      ][index % 8] }}
                    ></div>
                    <span className="text-sm text-gray-700">{item.status}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{item.count}</div>
                    <div className="text-xs text-gray-500">{item.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Insights</h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-sm font-medium text-blue-900">
                  Best Performing {filters.filterType === 'monthly' ? 'Day' : 'Month'}
                </div>
                <div className="text-lg font-bold text-blue-700">
                  {monthlyData.length > 0 ? monthlyData.reduce((best, current) => 
                    current.leads > best.leads ? current : best, 
                    monthlyData[0]
                  ).month : 'N/A'}
                </div>
                <div className="text-xs text-blue-600">
                  {monthlyData.length > 0 ? monthlyData.reduce((best, current) => 
                    current.leads > best.leads ? current : best, 
                    monthlyData[0]
                  ).leads : 0} leads
                </div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-sm font-medium text-green-900">
                  Best Conversion {filters.filterType === 'monthly' ? 'Day' : 'Month'}
                </div>
                <div className="text-lg font-bold text-green-700">
                  {monthlyData.length > 0 ? monthlyData.reduce((best, current) => 
                    current.conversions > best.conversions ? current : best, 
                    monthlyData[0]
                  ).month : 'N/A'}
                </div>
                <div className="text-xs text-green-600">
                  {monthlyData.length > 0 ? monthlyData.reduce((best, current) => 
                    current.conversions > best.conversions ? current : best, 
                    monthlyData[0]
                  ).conversions : 0}% conversion rate
                </div>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="text-sm font-medium text-yellow-900">Growth Trend</div>
                <div className="text-lg font-bold text-yellow-700">
                  {monthlyData.length >= 2 && 
                   monthlyData[monthlyData.length - 1].leads >= monthlyData[monthlyData.length - 2].leads 
                    ? '↗ Increasing' : '↘ Decreasing'}
                </div>
                <div className="text-xs text-yellow-600">
                  Period-over-period leads
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
