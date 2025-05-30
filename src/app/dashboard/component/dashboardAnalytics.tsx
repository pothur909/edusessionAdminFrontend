// 'use client';

// import { useState, useEffect } from 'react';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
// import { Calendar, Users, UserCheck, TrendingUp, Phone, Mail, BookOpen, Award } from 'lucide-react';

// interface DashboardStats {
//   totalLeads: number;
//   totalEnrollments: number;
//   conversionRate: number;
//   newLeadsThisMonth: number;
//   enrollmentsThisMonth: number;
// }

// interface MonthlyData {
//   month: string;
//   leads: number;
//   enrollments: number;
//   conversions: number;
// }

// interface StatusData {
//   status: string;
//   count: number;
//   percentage: number;
// }

// interface Lead {
//   _id: string;
//   studentName: string;
//   status: string;
//   createdAt: string;
//   leadSource: string;
//   board: string;
//   class: string;
// }

// interface Enrollment {
//   _id: string;
//   studentName: string;
//   createdAt: string;
//   city: string;
//   counsellor: string;
// }

// export default function AnalyticsDashboard() {
//   const [stats, setStats] = useState<DashboardStats>({
//     totalLeads: 0,
//     totalEnrollments: 0,
//     conversionRate: 0,
//     newLeadsThisMonth: 0,
//     enrollmentsThisMonth: 0
//   });
  
//   const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
//   const [leadStatusData, setLeadStatusData] = useState<StatusData[]>([]);
//   const [sourceData, setSourceData] = useState<StatusData[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [selectedPeriod, setSelectedPeriod] = useState<'6months' | '12months' | 'all'>('6months');

//   useEffect(() => {
//     fetchDashboardData();
//   }, [selectedPeriod]);

//   const fetchDashboardData = async () => {
//     try {
//       setIsLoading(true);
//       setError(null);

//       // Fetch leads and enrollments data
//       const [leadsResponse, enrollmentsResponse] = await Promise.all([
//         fetch('http://localhost:6969/api/leads/viewleads'),
//         fetch('http://localhost:6969/api/students')
//       ]);

//       if (!leadsResponse.ok || !enrollmentsResponse.ok) {
//         throw new Error('Failed to fetch data from server');
//       }

//       const leadsData = await leadsResponse.json();
//       const enrollmentsData = await enrollmentsResponse.json();

//       let leads: Lead[] = [];
//       let enrollments: Enrollment[] = [];

//       // Handle different response formats
//       if (leadsData.success && leadsData.data) {
//         leads = leadsData.data;
//       } else if (Array.isArray(leadsData)) {
//         leads = leadsData;
//       }

//       if (enrollmentsData.success && enrollmentsData.data) {
//         enrollments = enrollmentsData.data;
//       } else if (Array.isArray(enrollmentsData)) {
//         enrollments = enrollmentsData;
//       }

//       // Process the data
//       processData(leads, enrollments);

//     } catch (error) {
//       console.error('Error fetching dashboard data:', error);
//       setError(error instanceof Error ? error.message : 'Failed to fetch dashboard data');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const processData = (leads: Lead[], enrollments: Enrollment[]) => {
//     const now = new Date();
//     const currentMonth = now.getMonth();
//     const currentYear = now.getFullYear();

//     // Calculate basic stats
//     const totalLeads = leads.length;
//     const totalEnrollments = enrollments.length;
//     const conversionRate = totalLeads > 0 ? Math.round((totalEnrollments / totalLeads) * 100) : 0;

//     // New leads and enrollments this month
//     const newLeadsThisMonth = leads.filter(lead => {
//       const leadDate = new Date(lead.createdAt);
//       return leadDate.getMonth() === currentMonth && leadDate.getFullYear() === currentYear;
//     }).length;

//     const enrollmentsThisMonth = enrollments.filter(enrollment => {
//       const enrollDate = new Date(enrollment.createdAt);
//       return enrollDate.getMonth() === currentMonth && enrollDate.getFullYear() === currentYear;
//     }).length;

//     setStats({
//       totalLeads,
//       totalEnrollments,
//       conversionRate,
//       newLeadsThisMonth,
//       enrollmentsThisMonth
//     });

//     // Generate monthly data
//     const monthlyDataMap = new Map<string, { leads: number; enrollments: number }>();
//     const months = selectedPeriod === '6months' ? 6 : selectedPeriod === '12months' ? 12 : 24;

//     // Initialize months
//     for (let i = months - 1; i >= 0; i--) {
//       const date = new Date(currentYear, currentMonth - i, 1);
//       const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
//       monthlyDataMap.set(monthKey, { leads: 0, enrollments: 0 });
//     }

//     // Count leads by month
//     leads.forEach(lead => {
//       const leadDate = new Date(lead.createdAt);
//       const monthKey = leadDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
//       if (monthlyDataMap.has(monthKey)) {
//         monthlyDataMap.get(monthKey)!.leads++;
//       }
//     });

//     // Count enrollments by month
//     enrollments.forEach(enrollment => {
//       const enrollDate = new Date(enrollment.createdAt);
//       const monthKey = enrollDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
//       if (monthlyDataMap.has(monthKey)) {
//         monthlyDataMap.get(monthKey)!.enrollments++;
//       }
//     });

//     const processedMonthlyData: MonthlyData[] = Array.from(monthlyDataMap.entries()).map(([month, data]) => ({
//       month,
//       leads: data.leads,
//       enrollments: data.enrollments,
//       conversions: Math.round((data.enrollments / Math.max(data.leads, 1)) * 100)
//     }));

//     setMonthlyData(processedMonthlyData);

//     // Process lead status data
//     const statusMap = new Map<string, number>();
//     leads.forEach(lead => {
//       const status = lead.status || 'new';
//       statusMap.set(status, (statusMap.get(status) || 0) + 1);
//     });

//     const processedStatusData: StatusData[] = Array.from(statusMap.entries()).map(([status, count]) => ({
//       status: status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
//       count,
//       percentage: Math.round((count / totalLeads) * 100)
//     }));

//     setLeadStatusData(processedStatusData);

//     // Process lead source data
//     const sourceMap = new Map<string, number>();
//     leads.forEach(lead => {
//       const source = lead.leadSource || 'Unknown';
//       sourceMap.set(source, (sourceMap.get(source) || 0) + 1);
//     });

//     const processedSourceData: StatusData[] = Array.from(sourceMap.entries()).map(([source, count]) => ({
//       status: source,
//       count,
//       percentage: Math.round((count / totalLeads) * 100)
//     }));

//     setSourceData(processedSourceData);
//   };

//   const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'];

//   if (isLoading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen bg-gray-50">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="text-red-600 text-lg mb-2">Error loading dashboard</div>
//           <div className="text-gray-600">{error}</div>
//           <button 
//             onClick={fetchDashboardData}
//             className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-8">
//           <div className="flex justify-between items-center">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
//               <p className="text-gray-600 mt-1">Monitor your leads and enrollments performance</p>
//             </div>
//             <div className="flex space-x-2">
//               <select
//                 value={selectedPeriod}
//                 onChange={(e) => setSelectedPeriod(e.target.value as any)}
//                 className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="6months">Last 6 Months</option>
//                 <option value="12months">Last 12 Months</option>
//                 <option value="all">All Time</option>
//               </select>
//             </div>
//           </div>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
//           <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Total Leads</p>
//                 <p className="text-3xl font-bold text-gray-900">{stats.totalLeads}</p>
//                 <p className="text-xs text-green-600 mt-1">↑ +{stats.newLeadsThisMonth} this month</p>
//               </div>
//               <div className="p-3 bg-blue-100 rounded-lg">
//                 <Users className="h-6 w-6 text-blue-600" />
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Total Enrollments</p>
//                 <p className="text-3xl font-bold text-gray-900">{stats.totalEnrollments}</p>
//                 <p className="text-xs text-green-600 mt-1">↑ +{stats.enrollmentsThisMonth} this month</p>
//               </div>
//               <div className="p-3 bg-green-100 rounded-lg">
//                 <UserCheck className="h-6 w-6 text-green-600" />
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
//                 <p className="text-3xl font-bold text-gray-900">{stats.conversionRate}%</p>
//                 <p className="text-xs text-gray-500 mt-1">Lead to enrollment</p>
//               </div>
//               <div className="p-3 bg-yellow-100 rounded-lg">
//                 <TrendingUp className="h-6 w-6 text-yellow-600" />
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Avg. Monthly Leads</p>
//                 <p className="text-3xl font-bold text-gray-900">
//                   {Math.round(monthlyData.reduce((sum, month) => sum + month.leads, 0) / Math.max(monthlyData.length, 1))}
//                 </p>
//                 <p className="text-xs text-gray-500 mt-1">Last {monthlyData.length} months</p>
//               </div>
//               <div className="p-3 bg-purple-100 rounded-lg">
//                 <Calendar className="h-6 w-6 text-purple-600" />
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Avg. Monthly Enrollments</p>
//                 <p className="text-3xl font-bold text-gray-900">
//                   {Math.round(monthlyData.reduce((sum, month) => sum + month.enrollments, 0) / Math.max(monthlyData.length, 1))}
//                 </p>
//                 <p className="text-xs text-gray-500 mt-1">Last {monthlyData.length} months</p>
//               </div>
//               <div className="p-3 bg-indigo-100 rounded-lg">
//                 <Award className="h-6 w-6 text-indigo-600" />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Charts */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
//           {/* Monthly Trends */}
//           <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
//             <div className="flex justify-between items-center mb-6">
//               <h3 className="text-lg font-semibold text-gray-900">Monthly Trends</h3>
//               <div className="flex space-x-4 text-sm">
//                 <div className="flex items-center">
//                   <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
//                   <span className="text-gray-600">Leads</span>
//                 </div>
//                 <div className="flex items-center">
//                   <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
//                   <span className="text-gray-600">Enrollments</span>
//                 </div>
//               </div>
//             </div>
//             <ResponsiveContainer width="100%" height={300}>
//               <AreaChart data={monthlyData}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//                 <XAxis 
//                   dataKey="month" 
//                   tick={{ fontSize: 12 }}
//                   axisLine={false}
//                   tickLine={false}
//                 />
//                 <YAxis 
//                   tick={{ fontSize: 12 }}
//                   axisLine={false}
//                   tickLine={false}
//                 />
//                 <Tooltip 
//                   contentStyle={{
//                     backgroundColor: 'white',
//                     border: '1px solid #e5e7eb',
//                     borderRadius: '8px',
//                     boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
//                   }}
//                 />
//                 <Area 
//                   type="monotone" 
//                   dataKey="leads" 
//                   stackId="1"
//                   stroke="#3B82F6" 
//                   fill="#3B82F6"
//                   fillOpacity={0.1}
//                 />
//                 <Area 
//                   type="monotone" 
//                   dataKey="enrollments" 
//                   stackId="2"
//                   stroke="#10B981" 
//                   fill="#10B981"
//                   fillOpacity={0.2}
//                 />
//               </AreaChart>
//             </ResponsiveContainer>
//           </div>

//           {/* Conversion Rate Trend */}
//           <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
//             <div className="flex justify-between items-center mb-6">
//               <h3 className="text-lg font-semibold text-gray-900">Monthly Conversion Rate</h3>
//               <div className="text-sm text-gray-600">Percentage</div>
//             </div>
//             <ResponsiveContainer width="100%" height={300}>
//               <LineChart data={monthlyData}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//                 <XAxis 
//                   dataKey="month" 
//                   tick={{ fontSize: 12 }}
//                   axisLine={false}
//                   tickLine={false}
//                 />
//                 <YAxis 
//                   tick={{ fontSize: 12 }}
//                   axisLine={false}
//                   tickLine={false}
//                 />
//                 <Tooltip 
//                   contentStyle={{
//                     backgroundColor: 'white',
//                     border: '1px solid #e5e7eb',
//                     borderRadius: '8px',
//                     boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
//                   }}
//                   formatter={(value) => [`${value}%`, 'Conversion Rate']}
//                 />
//                 <Line 
//                   type="monotone" 
//                   dataKey="conversions" 
//                   stroke="#F59E0B" 
//                   strokeWidth={3}
//                   dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
//                   activeDot={{ r: 6, stroke: '#F59E0B', strokeWidth: 2 }}
//                 />
//               </LineChart>
//             </ResponsiveContainer>
//           </div>
//         </div>

//         {/* Bottom Row */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Lead Status Distribution */}
//           <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
//             <h3 className="text-lg font-semibold text-gray-900 mb-6">Lead Status Distribution</h3>
//             <div className="space-y-4">
//               {leadStatusData.slice(0, 6).map((item, index) => (
//                 <div key={item.status} className="flex items-center justify-between">
//                   <div className="flex items-center">
//                     <div 
//                       className="w-3 h-3 rounded-full mr-3"
//                       style={{ backgroundColor: COLORS[index % COLORS.length] }}
//                     ></div>
//                     <span className="text-sm text-gray-700">{item.status}</span>
//                   </div>
//                   <div className="text-right">
//                     <div className="text-sm font-medium text-gray-900">{item.count}</div>
//                     <div className="text-xs text-gray-500">{item.percentage}%</div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Lead Sources */}
//           <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
//             <h3 className="text-lg font-semibold text-gray-900 mb-6">Lead Sources</h3>
//             <div className="space-y-4">
//               {sourceData.slice(0, 6).map((item, index) => (
//                 <div key={item.status} className="flex items-center justify-between">
//                   <div className="flex items-center">
//                     <div 
//                       className="w-3 h-3 rounded-full mr-3"
//                       style={{ backgroundColor: COLORS[index % COLORS.length] }}
//                     ></div>
//                     <span className="text-sm text-gray-700">{item.status}</span>
//                   </div>
//                   <div className="text-right">
//                     <div className="text-sm font-medium text-gray-900">{item.count}</div>
//                     <div className="text-xs text-gray-500">{item.percentage}%</div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Quick Stats */}
//           <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
//             <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Insights</h3>
//             <div className="space-y-4">
//               <div className="p-4 bg-blue-50 rounded-lg">
//                 <div className="text-sm font-medium text-blue-900">Best Performing Month</div>
//                 <div className="text-lg font-bold text-blue-700">
//                   {monthlyData.reduce((best, current) => 
//                     current.leads > best.leads ? current : best, 
//                     monthlyData[0] || { month: 'N/A', leads: 0 }
//                   ).month}
//                 </div>
//                 <div className="text-xs text-blue-600">
//                   {monthlyData.reduce((best, current) => 
//                     current.leads > best.leads ? current : best, 
//                     monthlyData[0] || { leads: 0 }
//                   ).leads} leads
//                 </div>
//               </div>
              
//               <div className="p-4 bg-green-50 rounded-lg">
//                 <div className="text-sm font-medium text-green-900">Best Conversion Month</div>
//                 <div className="text-lg font-bold text-green-700">
//                   {monthlyData.reduce((best, current) => 
//                     current.conversions > best.conversions ? current : best, 
//                     monthlyData[0] || { month: 'N/A', conversions: 0 }
//                   ).month}
//                 </div>
//                 <div className="text-xs text-green-600">
//                   {monthlyData.reduce((best, current) => 
//                     current.conversions > best.conversions ? current : best, 
//                     monthlyData[0] || { conversions: 0 }
//                   ).conversions}% conversion rate
//                 </div>
//               </div>

//               <div className="p-4 bg-yellow-50 rounded-lg">
//                 <div className="text-sm font-medium text-yellow-900">Growth Trend</div>
//                 <div className="text-lg font-bold text-yellow-700">
//                   {monthlyData.length >= 2 && 
//                    monthlyData[monthlyData.length - 1].leads > monthlyData[monthlyData.length - 2].leads 
//                     ? '↗ Increasing' : '→ Stable'}
//                 </div>
//                 <div className="text-xs text-yellow-600">
//                   Month-over-month leads
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }




// 'use client';

// import { useState, useEffect } from 'react';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
// import { Calendar, Users, UserCheck, TrendingUp, Phone, Mail, BookOpen, Award, Filter, X } from 'lucide-react';

// interface DashboardStats {
//   totalLeads: number;
//   totalEnrollments: number;
//   conversionRate: number;
//   newLeadsThisMonth: number;
//   enrollmentsThisMonth: number;
// }

// interface MonthlyData {
//   month: string;
//   leads: number;
//   enrollments: number;
//   conversions: number;
// }

// interface StatusData {
//   status: string;
//   count: number;
//   percentage: number;
// }

// interface Lead {
//   _id: string;
//   studentName: string;
//   status: string;
//   createdAt: string;
//   leadSource: string;
//   board: string;
//   class: string;
// }

// interface Enrollment {
//   _id: string;
//   studentName: string;
//   createdAt: string;
//   city: string;
//   counsellor: string;
// }

// interface FilterState {
//   filterType: 'preset' | 'monthly' | 'yearly' | 'dateRange';
//   presetPeriod: '6months' | '12months' | 'all';
//   selectedMonth: string;
//   selectedYear: string;
//   dateFrom: string;
//   dateTo: string;
// }

// export default function AnalyticsDashboard() {
//   const [stats, setStats] = useState<DashboardStats>({
//     totalLeads: 0,
//     totalEnrollments: 0,
//     conversionRate: 0,
//     newLeadsThisMonth: 0,
//     enrollmentsThisMonth: 0
//   });
  
//   const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
//   const [leadStatusData, setLeadStatusData] = useState<StatusData[]>([]);
//   const [sourceData, setSourceData] = useState<StatusData[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [showFilters, setShowFilters] = useState(false);

//   const [filters, setFilters] = useState<FilterState>({
//     filterType: 'preset',
//     presetPeriod: '6months',
//     selectedMonth: '',
//     selectedYear: new Date().getFullYear().toString(),
//     dateFrom: '',
//     dateTo: ''
//   });

//   // Generate month and year options
//   const months = [
//     { value: '01', label: 'January' },
//     { value: '02', label: 'February' },
//     { value: '03', label: 'March' },
//     { value: '04', label: 'April' },
//     { value: '05', label: 'May' },
//     { value: '06', label: 'June' },
//     { value: '07', label: 'July' },
//     { value: '08', label: 'August' },
//     { value: '09', label: 'September' },
//     { value: '10', label: 'October' },
//     { value: '11', label: 'November' },
//     { value: '12', label: 'December' }
//   ];

//   const currentYear = new Date().getFullYear();
//   const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

//   useEffect(() => {
//     fetchDashboardData();
//   }, [filters]);

//   const fetchDashboardData = async () => {
//     try {
//       setIsLoading(true);
//       setError(null);

//       // Fetch leads and enrollments data
//       const [leadsResponse, enrollmentsResponse] = await Promise.all([
//         fetch('http://localhost:6969/api/leads/viewleads'),
//         fetch('http://localhost:6969/api/students')
//       ]);

//       if (!leadsResponse.ok || !enrollmentsResponse.ok) {
//         throw new Error('Failed to fetch data from server');
//       }

//       const leadsData = await leadsResponse.json();
//       const enrollmentsData = await enrollmentsResponse.json();

//       let leads: Lead[] = [];
//       let enrollments: Enrollment[] = [];

//       // Handle different response formats
//       if (leadsData.success && leadsData.data) {
//         leads = leadsData.data;
//       } else if (Array.isArray(leadsData)) {
//         leads = leadsData;
//       }

//       if (enrollmentsData.success && enrollmentsData.data) {
//         enrollments = enrollmentsData.data;
//       } else if (Array.isArray(enrollmentsData)) {
//         enrollments = enrollmentsData;
//       }

//       // Filter data based on current filters
//       const filteredData = applyFilters(leads, enrollments);
      
//       // Process the filtered data
//       processData(filteredData.leads, filteredData.enrollments);

//     } catch (error) {
//       console.error('Error fetching dashboard data:', error);
//       setError(error instanceof Error ? error.message : 'Failed to fetch dashboard data');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const applyFilters = (leads: Lead[], enrollments: Enrollment[]) => {
//     let filteredLeads = [...leads];
//     let filteredEnrollments = [...enrollments];

//     const filterByDate = (items: any[], dateField: string) => {
//       return items.filter(item => {
//         const itemDate = new Date(item[dateField]);
        
//         switch (filters.filterType) {
//           case 'preset':
//             const now = new Date();
//             const monthsBack = filters.presetPeriod === '6months' ? 6 : 
//                              filters.presetPeriod === '12months' ? 12 : 999;
//             const cutoffDate = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);
//             return filters.presetPeriod === 'all' || itemDate >= cutoffDate;

//           case 'monthly':
//             if (!filters.selectedMonth) return true;
//             return itemDate.getMonth() === parseInt(filters.selectedMonth) - 1 && 
//                    itemDate.getFullYear() === parseInt(filters.selectedYear);

//           case 'yearly':
//             return itemDate.getFullYear() === parseInt(filters.selectedYear);

//           case 'dateRange':
//             if (!filters.dateFrom && !filters.dateTo) return true;
//             const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : new Date('1900-01-01');
//             const toDate = filters.dateTo ? new Date(filters.dateTo) : new Date('2100-12-31');
//             return itemDate >= fromDate && itemDate <= toDate;

//           default:
//             return true;
//         }
//       });
//     };

//     filteredLeads = filterByDate(leads, 'createdAt');
//     filteredEnrollments = filterByDate(enrollments, 'createdAt');

//     return { leads: filteredLeads, enrollments: filteredEnrollments };
//   };

//   const processData = (leads: Lead[], enrollments: Enrollment[]) => {
//     const now = new Date();
//     const currentMonth = now.getMonth();
//     const currentYear = now.getFullYear();

//     // Calculate basic stats
//     const totalLeads = leads.length;
//     const totalEnrollments = enrollments.length;
//     const conversionRate = totalLeads > 0 ? Math.round((totalEnrollments / totalLeads) * 100) : 0;

//     // New leads and enrollments this month (only for current month)
//     const newLeadsThisMonth = leads.filter(lead => {
//       const leadDate = new Date(lead.createdAt);
//       return leadDate.getMonth() === currentMonth && leadDate.getFullYear() === currentYear;
//     }).length;

//     const enrollmentsThisMonth = enrollments.filter(enrollment => {
//       const enrollDate = new Date(enrollment.createdAt);
//       return enrollDate.getMonth() === currentMonth && enrollDate.getFullYear() === currentYear;
//     }).length;

//     setStats({
//       totalLeads,
//       totalEnrollments,
//       conversionRate,
//       newLeadsThisMonth,
//       enrollmentsThisMonth
//     });

//     // Generate monthly data based on filter type
//     let monthlyDataMap = new Map<string, { leads: number; enrollments: number }>();
    
//     if (filters.filterType === 'monthly' && filters.selectedMonth) {
//       // For monthly filter, show daily breakdown
//       const year = parseInt(filters.selectedYear);
//       const month = parseInt(filters.selectedMonth) - 1;
//       const daysInMonth = new Date(year, month + 1, 0).getDate();
      
//       for (let day = 1; day <= daysInMonth; day++) {
//         const dateKey = `${filters.selectedMonth}/${day.toString().padStart(2, '0')}`;
//         monthlyDataMap.set(dateKey, { leads: 0, enrollments: 0 });
//       }

//       leads.forEach(lead => {
//         const leadDate = new Date(lead.createdAt);
//         if (leadDate.getMonth() === month && leadDate.getFullYear() === year) {
//           const dateKey = `${filters.selectedMonth}/${leadDate.getDate().toString().padStart(2, '0')}`;
//           if (monthlyDataMap.has(dateKey)) {
//             monthlyDataMap.get(dateKey)!.leads++;
//           }
//         }
//       });

//       enrollments.forEach(enrollment => {
//         const enrollDate = new Date(enrollment.createdAt);
//         if (enrollDate.getMonth() === month && enrollDate.getFullYear() === year) {
//           const dateKey = `${filters.selectedMonth}/${enrollDate.getDate().toString().padStart(2, '0')}`;
//           if (monthlyDataMap.has(dateKey)) {
//             monthlyDataMap.get(dateKey)!.enrollments++;
//           }
//         }
//       });
//     } else {
//       // For other filters, show monthly breakdown
//       const months = filters.filterType === 'preset' ? 
//         (filters.presetPeriod === '6months' ? 6 : filters.presetPeriod === '12months' ? 12 : 24) : 12;

//       for (let i = months - 1; i >= 0; i--) {
//         const date = new Date(currentYear, currentMonth - i, 1);
//         const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
//         monthlyDataMap.set(monthKey, { leads: 0, enrollments: 0 });
//       }

//       leads.forEach(lead => {
//         const leadDate = new Date(lead.createdAt);
//         const monthKey = leadDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
//         if (monthlyDataMap.has(monthKey)) {
//           monthlyDataMap.get(monthKey)!.leads++;
//         }
//       });

//       enrollments.forEach(enrollment => {
//         const enrollDate = new Date(enrollment.createdAt);
//         const monthKey = enrollDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
//         if (monthlyDataMap.has(monthKey)) {
//           monthlyDataMap.get(monthKey)!.enrollments++;
//         }
//       });
//     }

//     const processedMonthlyData: MonthlyData[] = Array.from(monthlyDataMap.entries()).map(([month, data]) => ({
//       month,
//       leads: data.leads,
//       enrollments: data.enrollments,
//       conversions: Math.round((data.enrollments / Math.max(data.leads, 1)) * 100)
//     }));

//     setMonthlyData(processedMonthlyData);

//     // Process lead status data
//     const statusMap = new Map<string, number>();
//     leads.forEach(lead => {
//       const status = lead.status || 'new';
//       statusMap.set(status, (statusMap.get(status) || 0) + 1);
//     });

//     const processedStatusData: StatusData[] = Array.from(statusMap.entries()).map(([status, count]) => ({
//       status: status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
//       count,
//       percentage: Math.round((count / totalLeads) * 100)
//     }));

//     setLeadStatusData(processedStatusData);

//     // Process lead source data
//     const sourceMap = new Map<string, number>();
//     leads.forEach(lead => {
//       const source = lead.leadSource || 'Unknown';
//       sourceMap.set(source, (sourceMap.get(source) || 0) + 1);
//     });

//     const processedSourceData: StatusData[] = Array.from(sourceMap.entries()).map(([source, count]) => ({
//       status: source,
//       count,
//       percentage: Math.round((count / totalLeads) * 100)
//     }));

//     setSourceData(processedSourceData);
//   };

//   const resetFilters = () => {
//     setFilters({
//       filterType: 'preset',
//       presetPeriod: '6months',
//       selectedMonth: '',
//       selectedYear: new Date().getFullYear().toString(),
//       dateFrom: '',
//       dateTo: ''
//     });
//   };

//   const getFilterLabel = () => {
//     switch (filters.filterType) {
//       case 'preset':
//         const labels = { '6months': 'Last 6 Months', '12months': 'Last 12 Months', 'all': 'All Time' };
//         return labels[filters.presetPeriod];
//       case 'monthly':
//         if (filters.selectedMonth) {
//           const monthName = months.find(m => m.value === filters.selectedMonth)?.label;
//           return `${monthName} ${filters.selectedYear}`;
//         }
//         return 'Select Month';
//       case 'yearly':
//         return `Year ${filters.selectedYear}`;
//       case 'dateRange':
//         if (filters.dateFrom && filters.dateTo) {
//           return `${filters.dateFrom} to ${filters.dateTo}`;
//         } else if (filters.dateFrom) {
//           return `From ${filters.dateFrom}`;
//         } else if (filters.dateTo) {
//           return `Until ${filters.dateTo}`;
//         }
//         return 'Custom Date Range';
//       default:
//         return 'All Time';
//     }
//   };

//   const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'];

//   if (isLoading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen bg-gray-50">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="text-red-600 text-lg mb-2">Error loading dashboard</div>
//           <div className="text-gray-600">{error}</div>
//           <button 
//             onClick={fetchDashboardData}
//             className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-8">
//           <div className="flex justify-between items-center">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
//               <p className="text-gray-600 mt-1">Monitor your leads and enrollments performance</p>
//             </div>
//             <div className="flex items-center space-x-3">
//               <div className="text-sm text-gray-600 bg-white px-3 py-2 rounded-lg border">
//                 Showing: <span className="font-medium">{getFilterLabel()}</span>
//               </div>
//               <button
//                 onClick={() => setShowFilters(!showFilters)}
//                 className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//               >
//                 <Filter className="h-4 w-4 mr-2" />
//                 Filters
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Filter Panel */}
//         {showFilters && (
//           <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-lg font-semibold text-gray-900">Filter Options</h3>
//               <button
//                 onClick={() => setShowFilters(false)}
//                 className="text-gray-400 hover:text-gray-600"
//               >
//                 <X className="h-5 w-5" />
//               </button>
//             </div>
            
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
//               {/* Filter Type Selection */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Filter Type</label>
//                 <select
//                   value={filters.filterType}
//                   onChange={(e) => setFilters({...filters, filterType: e.target.value as any})}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
//                 >
//                   <option value="preset">Preset Period</option>
//                   <option value="monthly">Monthly</option>
//                   <option value="yearly">Yearly</option>
//                   <option value="dateRange">Date Range</option>
//                 </select>
//               </div>

//               {/* Preset Period */}
//               {filters.filterType === 'preset' && (
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Period</label>
//                   <select
//                     value={filters.presetPeriod}
//                     onChange={(e) => setFilters({...filters, presetPeriod: e.target.value as any})}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
//                   >
//                     <option value="6months">Last 6 Months</option>
//                     <option value="12months">Last 12 Months</option>
//                     <option value="all">All Time</option>
//                   </select>
//                 </div>
//               )}

//               {/* Monthly Filter */}
//               {filters.filterType === 'monthly' && (
//                 <>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
//                     <select
//                       value={filters.selectedMonth}
//                       onChange={(e) => setFilters({...filters, selectedMonth: e.target.value})}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
//                     >
//                       <option value="">Select Month</option>
//                       {months.map(month => (
//                         <option key={month.value} value={month.value}>{month.label}</option>
//                       ))}
//                     </select>
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
//                     <select
//                       value={filters.selectedYear}
//                       onChange={(e) => setFilters({...filters, selectedYear: e.target.value})}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
//                     >
//                       {years.map(year => (
//                         <option key={year} value={year}>{year}</option>
//                       ))}
//                     </select>
//                   </div>
//                 </>
//               )}

//               {/* Yearly Filter */}
//               {filters.filterType === 'yearly' && (
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
//                   <select
//                     value={filters.selectedYear}
//                     onChange={(e) => setFilters({...filters, selectedYear: e.target.value})}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
//                   >
//                     {years.map(year => (
//                       <option key={year} value={year}>{year}</option>
//                     ))}
//                   </select>
//                 </div>
//               )}

//               {/* Date Range Filter */}
//               {filters.filterType === 'dateRange' && (
//                 <>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
//                     <input
//                       type="date"
//                       value={filters.dateFrom}
//                       onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
//                     <input
//                       type="date"
//                       value={filters.dateTo}
//                       onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
//                     />
//                   </div>
//                 </>
//               )}
//             </div>

//             <div className="flex justify-end space-x-3">
//               <button
//                 onClick={resetFilters}
//                 className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
//               >
//                 Reset Filters
//               </button>
//               <button
//                 onClick={() => setShowFilters(false)}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//               >
//                 Apply Filters
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
//           <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Total Leads</p>
//                 <p className="text-3xl font-bold text-gray-900">{stats.totalLeads}</p>
//                 <p className="text-xs text-gray-500 mt-1">Based on created date</p>
//               </div>
//               <div className="p-3 bg-blue-100 rounded-lg">
//                 <Users className="h-6 w-6 text-blue-600" />
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Total Enrollments</p>
//                 <p className="text-3xl font-bold text-gray-900">{stats.totalEnrollments}</p>
//                 <p className="text-xs text-gray-500 mt-1">Based on created date</p>
//               </div>
//               <div className="p-3 bg-green-100 rounded-lg">
//                 <UserCheck className="h-6 w-6 text-green-600" />
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
//                 <p className="text-3xl font-bold text-gray-900">{stats.conversionRate}%</p>
//                 <p className="text-xs text-gray-500 mt-1">Lead to enrollment</p>
//               </div>
//               <div className="p-3 bg-yellow-100 rounded-lg">
//                 <TrendingUp className="h-6 w-6 text-yellow-600" />
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">
//                   {filters.filterType === 'monthly' ? 'Daily Avg Leads' : 'Monthly Avg Leads'}
//                 </p>
//                 <p className="text-3xl font-bold text-gray-900">
//                   {Math.round(monthlyData.reduce((sum, period) => sum + period.leads, 0) / Math.max(monthlyData.length, 1))}
//                 </p>
//                 <p className="text-xs text-gray-500 mt-1">
//                   {filters.filterType === 'monthly' ? 'This month' : `Last ${monthlyData.length} periods`}
//                 </p>
//               </div>
//               <div className="p-3 bg-purple-100 rounded-lg">
//                 <Calendar className="h-6 w-6 text-purple-600" />
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">
//                   {filters.filterType === 'monthly' ? 'Daily Avg Enrollments' : 'Monthly Avg Enrollments'}
//                 </p>
//                 <p className="text-3xl font-bold text-gray-900">
//                   {Math.round(monthlyData.reduce((sum, period) => sum + period.enrollments, 0) / Math.max(monthlyData.length, 1))}
//                 </p>
//                 <p className="text-xs text-gray-500 mt-1">
//                   {filters.filterType === 'monthly' ? 'This month' : `Last ${monthlyData.length} periods`}
//                 </p>
//               </div>
//               <div className="p-3 bg-indigo-100 rounded-lg">
//                 <Award className="h-6 w-6 text-indigo-600" />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Charts */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
//           {/* Monthly/Daily Trends */}
//           <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
//             <div className="flex justify-between items-center mb-6">
//               <h3 className="text-lg font-semibold text-gray-900">
//                 {filters.filterType === 'monthly' && filters.selectedMonth ? 'Daily Trends' : 'Monthly Trends'}
//               </h3>
//               <div className="flex space-x-4 text-sm">
//                 <div className="flex items-center">
//                   <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
//                   <span className="text-gray-600">Leads</span>
//                 </div>
//                 <div className="flex items-center">
//                   <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
//                   <span className="text-gray-600">Enrollments</span>
//                 </div>
//               </div>
//             </div>
//             <ResponsiveContainer width="100%" height={300}>
//               <AreaChart data={monthlyData}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//                 <XAxis 
//                   dataKey="month" 
//                   tick={{ fontSize: 12 }}
//                   axisLine={false}
//                   tickLine={false}
//                 />
//                 <YAxis 
//                   tick={{ fontSize: 12 }}
//                   axisLine={false}
//                   tickLine={false}
//                 />
//                 <Tooltip 
//                   contentStyle={{
//                     backgroundColor: 'white',
//                     border: '1px solid #e5e7eb',
//                     borderRadius: '8px',
//                     boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
//                   }}
//                 />
//                 <Area 
//                   type="monotone" 
//                   dataKey="leads" 
//                   stackId="1"
//                   stroke="#3B82F6" 
//                   fill="#3B82F6"
//                   fillOpacity={0.1}
//                 />
//                 <Area 
//                   type="monotone" 
//                   dataKey="enrollments" 
//                   stackId="2"
//                   stroke="#10B981" 
//                   fill="#10B981"
//                   fillOpacity={0.2}
//                 />
//               </AreaChart>
//             </ResponsiveContainer>
//           </div>

//           {/* Conversion Rate Trend */}
//           <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
//             <div className="flex justify-between items-center mb-6">
//               <h3 className="text-lg font-semibold text-gray-900">
//                 {filters.filterType === 'monthly' && filters.selectedMonth ? 'Daily Conversion Rate' : 'Monthly Conversion Rate'}
//               </h3>
//               <div className="text-sm text-gray-600">Percentage</div>
//             </div>
//             <ResponsiveContainer width="100%" height={300}>
//               <LineChart data={monthlyData}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//                 <XAxis 
//                   dataKey="month" 
//                   tick={{ fontSize: 12 }}
//                   axisLine={false}
//                   tickLine={false}
//                 />
//                 <YAxis 
//                   tick={{ fontSize: 12 }}
//                   axisLine={false}
//                   tickLine={false}
//                 />
//                 <Tooltip 
//                   contentStyle={{
//                     backgroundColor: 'white',
//                     border: '1px solid #e5e7eb',
//                     borderRadius: '8px',
//                     boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
//                   }}
//                   formatter={(value) => [`${value}%`, 'Conversion Rate']}
//                 />
//                 <Line 
//                   type="monotone" 
//                   dataKey="conversions" 
//                   stroke="#F59E0B" 
//                   strokeWidth={3}
//                   dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
//                   activeDot={{ r: 6, stroke: '#F59E0B', strokeWidth: 2 }}
//                 />
//               </LineChart>
//             </ResponsiveContainer>
//           </div>
//         </div>

//         {/* Bottom Row */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Lead Status Distribution */}
//           <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
//             <h3 className="text-lg font-semibold text-gray-900 mb-6">Lead Status Distribution</h3>
//             <div className="space-y-4">
//               {leadStatusData.slice(0, 6).map((item, index) => (
//                 <div key={item.status} className="flex items-center justify-between">
//                   <div className="flex items-center">
//                     <div 
//                       className="w-3 h-3 rounded-full mr-3"
//                       style={{ backgroundColor: COLORS[index % COLORS.length] }}
//                     ></div>
//                     <span className="text-sm text-gray-700">{item.status}</span>
//                   </div>
//                   <div className="text-right">
//                     <div className="text-sm font-medium text-gray-900">{item.count}</div>
//                     <div className="text-xs text-gray-500">{item.percentage}%</div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Lead Sources */}
//           <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
//             <h3 className="text-lg font-semibold text-gray-900 mb-6">Lead Sources</h3>
//             <div className="space-y-4">
//               {sourceData.slice(0, 6).map((item, index) => (
//                 <div key={item.status} className="flex items-center justify-between">
//                   <div className="flex items-center">
//                     <div 
//                       className="w-3 h-3 rounded-full mr-3"
//                       style={{ backgroundColor: COLORS[index % COLORS.length] }}
//                     ></div>
//                     <span className="text-sm text-gray-700">{item.status}</span>
//                   </div>
//                   <div className="text-right">
//                     <div className="text-sm font-medium text-gray-900">{item.count}</div>
//                     <div className="text-xs text-gray-500">{item.percentage}%</div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Quick Stats */}
//           <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
//             <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Insights</h3>
//             <div className="space-y-4">
//               <div className="p-4 bg-blue-50 rounded-lg">
//                 <div className="text-sm font-medium text-blue-900">
//                   Best Performing {filters.filterType === 'monthly' ? 'Day' : 'Month'}
//                 </div>
//                 <div className="text-lg font-bold text-blue-700">
//                   {monthlyData.length > 0 ? monthlyData.reduce((best, current) => 
//                     current.leads > best.leads ? current : best, 
//                     monthlyData[0]
//                   ).month : 'N/A'}
//                 </div>
//                 <div className="text-xs text-blue-600">
//                   {monthlyData.length > 0 ? monthlyData.reduce((best, current) => 
//                     current.leads > best.leads ? current : best, 
//                     monthlyData[0]
//                   ).leads : 0} leads
//                 </div>
//               </div>
              
//               <div className="p-4 bg-green-50 rounded-lg">
//                 <div className="text-sm font-medium text-green-900">
//                   Best Conversion {filters.filterType === 'monthly' ? 'Day' : 'Month'}
//                 </div>
//                 <div className="text-lg font-bold text-green-700">
//                   {monthlyData.length > 0 ? monthlyData.reduce((best, current) => 
//                     current.conversions > best.conversions ? current : best, 
//                     monthlyData[0]
//                   ).month : 'N/A'}
//                 </div>
//                 <div className="text-xs text-green-600">
//                   {monthlyData.length > 0 ? monthlyData.reduce((best, current) => 
//                     current.conversions > best.conversions ? current : best, 
//                     monthlyData[0]
//                   ).conversions : 0}% conversion rate
//                 </div>
//               </div>

//               <div className="p-4 bg-yellow-50 rounded-lg">
//                 <div className="text-sm font-medium text-yellow-900">Growth Trend</div>
//                 <div className="text-lg font-bold text-yellow-700">
//                   {monthlyData.length >= 2 && 
//                    monthlyData[monthlyData.length - 1].leads >= monthlyData[monthlyData.length - 2].leads 
//                     ? '↗ Increasing' : '↘ Decreasing'}
//                 </div>
//                 <div className="text-xs text-yellow-600">
//                   Period-over-period leads
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }



// 'use client';

// import { useState, useEffect } from 'react';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
// import { Calendar, Users, UserCheck, TrendingUp, Phone, Mail, BookOpen, Award, Filter, X } from 'lucide-react';

// interface DashboardStats {
//   totalLeads: number;
//   totalEnrollments: number;
//   conversionRate: number;
//   newLeadsThisMonth: number;
//   enrollmentsThisMonth: number;
// }

// interface MonthlyData {
//   month: string;
//   leads: number;
//   enrollments: number;
//   conversions: number;
// }

// interface StatusData {
//   status: string;
//   count: number;
//   percentage: number;
// }

// interface Lead {
//   _id: string;
//   studentName: string;
//   status: string;
//   createdAt: string;
//   leadSource: string;
//   board: string;
//   class: string;
// }

// interface Enrollment {
//   _id: string;
//   studentName: string;
//   createdAt: string;
//   city: string;
//   counsellor: string;
// }

// interface FilterState {
//   filterType: 'preset' | 'monthly' | 'yearly' | 'dateRange';
//   presetPeriod: '6months' | '12months' | 'all';
//   selectedMonth: string;
//   selectedYear: string;
//   dateFrom: string;
//   dateTo: string;
// }

// export default function AnalyticsDashboard() {
//   const [stats, setStats] = useState<DashboardStats>({
//     totalLeads: 0,
//     totalEnrollments: 0,
//     conversionRate: 0,
//     newLeadsThisMonth: 0,
//     enrollmentsThisMonth: 0
//   });
  
//   const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
//   const [leadStatusData, setLeadStatusData] = useState<StatusData[]>([]);
//   const [sourceData, setSourceData] = useState<StatusData[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [showFilters, setShowFilters] = useState(false);

//   const [filters, setFilters] = useState<FilterState>({
//     filterType: 'preset',
//     presetPeriod: '6months',
//     selectedMonth: '',
//     selectedYear: new Date().getFullYear().toString(),
//     dateFrom: '',
//     dateTo: ''
//   });

//   // Generate month and year options
//   const months = [
//     { value: '01', label: 'January' },
//     { value: '02', label: 'February' },
//     { value: '03', label: 'March' },
//     { value: '04', label: 'April' },
//     { value: '05', label: 'May' },
//     { value: '06', label: 'June' },
//     { value: '07', label: 'July' },
//     { value: '08', label: 'August' },
//     { value: '09', label: 'September' },
//     { value: '10', label: 'October' },
//     { value: '11', label: 'November' },
//     { value: '12', label: 'December' }
//   ];

//   const currentYear = new Date().getFullYear();
//   const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

//   useEffect(() => {
//     fetchDashboardData();
//   }, [filters]);

//   const fetchDashboardData = async () => {
//     try {
//       setIsLoading(true);
//       setError(null);

//       // Mock data for demonstration
//       const mockLeads = Array.from({ length: 150 }, (_, i) => ({
//         _id: `lead_${i}`,
//         studentName: `Student ${i}`,
//         status: ['new', 'contacted', 'qualified', 'converted', 'lost'][Math.floor(Math.random() * 5)],
//         createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
//         leadSource: ['Website', 'Referral', 'Social Media', 'Advertisement'][Math.floor(Math.random() * 4)],
//         board: 'CBSE',
//         class: '10th'
//       }));

//       const mockEnrollments = Array.from({ length: 75 }, (_, i) => ({
//         _id: `enrollment_${i}`,
//         studentName: `Student ${i}`,
//         createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
//         city: 'Mumbai',
//         counsellor: 'Counsellor A'
//       }));

//       // Filter data based on current filters
//       const filteredData = applyFilters(mockLeads, mockEnrollments);
      
//       // Process the filtered data
//       processData(filteredData.leads, filteredData.enrollments);

//     } catch (error) {
//       console.error('Error fetching dashboard data:', error);
//       setError(error instanceof Error ? error.message : 'Failed to fetch dashboard data');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const applyFilters = (leads: Lead[], enrollments: Enrollment[]) => {
//     let filteredLeads = [...leads];
//     let filteredEnrollments = [...enrollments];

//     const filterByDate = (items: any[], dateField: string) => {
//       return items.filter(item => {
//         const itemDate = new Date(item[dateField]);
        
//         switch (filters.filterType) {
//           case 'preset':
//             const now = new Date();
//             const monthsBack = filters.presetPeriod === '6months' ? 6 : 
//                              filters.presetPeriod === '12months' ? 12 : 999;
//             const cutoffDate = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);
//             return filters.presetPeriod === 'all' || itemDate >= cutoffDate;

//           case 'monthly':
//             if (!filters.selectedMonth) return true;
//             return itemDate.getMonth() === parseInt(filters.selectedMonth) - 1 && 
//                    itemDate.getFullYear() === parseInt(filters.selectedYear);

//           case 'yearly':
//             return itemDate.getFullYear() === parseInt(filters.selectedYear);

//           case 'dateRange':
//             if (!filters.dateFrom && !filters.dateTo) return true;
//             const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : new Date('1900-01-01');
//             const toDate = filters.dateTo ? new Date(filters.dateTo) : new Date('2100-12-31');
//             return itemDate >= fromDate && itemDate <= toDate;

//           default:
//             return true;
//         }
//       });
//     };

//     filteredLeads = filterByDate(leads, 'createdAt');
//     filteredEnrollments = filterByDate(enrollments, 'createdAt');

//     return { leads: filteredLeads, enrollments: filteredEnrollments };
//   };

//   const processData = (leads: Lead[], enrollments: Enrollment[]) => {
//     const now = new Date();
//     const currentMonth = now.getMonth();
//     const currentYear = now.getFullYear();

//     // Calculate basic stats
//     const totalLeads = leads.length;
//     const totalEnrollments = enrollments.length;
//     const conversionRate = totalLeads > 0 ? Math.round((totalEnrollments / totalLeads) * 100) : 0;

//     // New leads and enrollments this month (only for current month)
//     const newLeadsThisMonth = leads.filter(lead => {
//       const leadDate = new Date(lead.createdAt);
//       return leadDate.getMonth() === currentMonth && leadDate.getFullYear() === currentYear;
//     }).length;

//     const enrollmentsThisMonth = enrollments.filter(enrollment => {
//       const enrollDate = new Date(enrollment.createdAt);
//       return enrollDate.getMonth() === currentMonth && enrollDate.getFullYear() === currentYear;
//     }).length;

//     setStats({
//       totalLeads,
//       totalEnrollments,
//       conversionRate,
//       newLeadsThisMonth,
//       enrollmentsThisMonth
//     });

//     // Generate monthly data based on filter type
//     let monthlyDataMap = new Map<string, { leads: number; enrollments: number }>();
    
//     if (filters.filterType === 'monthly' && filters.selectedMonth) {
//       // For monthly filter, show daily breakdown
//       const year = parseInt(filters.selectedYear);
//       const month = parseInt(filters.selectedMonth) - 1;
//       const daysInMonth = new Date(year, month + 1, 0).getDate();
      
//       for (let day = 1; day <= daysInMonth; day++) {
//         const dateKey = `${filters.selectedMonth}/${day.toString().padStart(2, '0')}`;
//         monthlyDataMap.set(dateKey, { leads: 0, enrollments: 0 });
//       }

//       leads.forEach(lead => {
//         const leadDate = new Date(lead.createdAt);
//         if (leadDate.getMonth() === month && leadDate.getFullYear() === year) {
//           const dateKey = `${filters.selectedMonth}/${leadDate.getDate().toString().padStart(2, '0')}`;
//           if (monthlyDataMap.has(dateKey)) {
//             monthlyDataMap.get(dateKey)!.leads++;
//           }
//         }
//       });

//       enrollments.forEach(enrollment => {
//         const enrollDate = new Date(enrollment.createdAt);
//         if (enrollDate.getMonth() === month && enrollDate.getFullYear() === year) {
//           const dateKey = `${filters.selectedMonth}/${enrollDate.getDate().toString().padStart(2, '0')}`;
//           if (monthlyDataMap.has(dateKey)) {
//             monthlyDataMap.get(dateKey)!.enrollments++;
//           }
//         }
//       });
//     } else {
//       // For other filters, show monthly breakdown
//       const months = filters.filterType === 'preset' ? 
//         (filters.presetPeriod === '6months' ? 6 : filters.presetPeriod === '12months' ? 12 : 24) : 12;

//       for (let i = months - 1; i >= 0; i--) {
//         const date = new Date(currentYear, currentMonth - i, 1);
//         const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
//         monthlyDataMap.set(monthKey, { leads: 0, enrollments: 0 });
//       }

//       leads.forEach(lead => {
//         const leadDate = new Date(lead.createdAt);
//         const monthKey = leadDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
//         if (monthlyDataMap.has(monthKey)) {
//           monthlyDataMap.get(monthKey)!.leads++;
//         }
//       });

//       enrollments.forEach(enrollment => {
//         const enrollDate = new Date(enrollment.createdAt);
//         const monthKey = enrollDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
//         if (monthlyDataMap.has(monthKey)) {
//           monthlyDataMap.get(monthKey)!.enrollments++;
//         }
//       });
//     }

//     const processedMonthlyData: MonthlyData[] = Array.from(monthlyDataMap.entries()).map(([month, data]) => ({
//       month,
//       leads: data.leads,
//       enrollments: data.enrollments,
//       conversions: Math.round((data.enrollments / Math.max(data.leads, 1)) * 100)
//     }));

//     setMonthlyData(processedMonthlyData);

//     // Process lead status data
//     const statusMap = new Map<string, number>();
//     leads.forEach(lead => {
//       const status = lead.status || 'new';
//       statusMap.set(status, (statusMap.get(status) || 0) + 1);
//     });

//     const processedStatusData: StatusData[] = Array.from(statusMap.entries()).map(([status, count]) => ({
//       status: status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
//       count,
//       percentage: Math.round((count / totalLeads) * 100)
//     }));

//     setLeadStatusData(processedStatusData);

//     // Process lead source data
//     const sourceMap = new Map<string, number>();
//     leads.forEach(lead => {
//       const source = lead.leadSource || 'Unknown';
//       sourceMap.set(source, (sourceMap.get(source) || 0) + 1);
//     });

//     const processedSourceData: StatusData[] = Array.from(sourceMap.entries()).map(([source, count]) => ({
//       status: source,
//       count,
//       percentage: Math.round((count / totalLeads) * 100)
//     }));

//     setSourceData(processedSourceData);
//   };

//   const resetFilters = () => {
//     setFilters({
//       filterType: 'preset',
//       presetPeriod: '6months',
//       selectedMonth: '',
//       selectedYear: new Date().getFullYear().toString(),
//       dateFrom: '',
//       dateTo: ''
//     });
//   };

//   const getFilterLabel = () => {
//     switch (filters.filterType) {
//       case 'preset':
//         const labels = { '6months': 'Last 6 Months', '12months': 'Last 12 Months', 'all': 'All Time' };
//         return labels[filters.presetPeriod];
//       case 'monthly':
//         if (filters.selectedMonth) {
//           const monthName = months.find(m => m.value === filters.selectedMonth)?.label;
//           return `${monthName} ${filters.selectedYear}`;
//         }
//         return 'Select Month';
//       case 'yearly':
//         return `Year ${filters.selectedYear}`;
//       case 'dateRange':
//         if (filters.dateFrom && filters.dateTo) {
//           return `${filters.dateFrom} to ${filters.dateTo}`;
//         } else if (filters.dateFrom) {
//           return `From ${filters.dateFrom}`;
//         } else if (filters.dateTo) {
//           return `Until ${filters.dateTo}`;
//         }
//         return 'Custom Date Range';
//       default:
//         return 'All Time';
//     }
//   };

//   const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'];

//   if (isLoading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen bg-gray-50">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="text-red-600 text-lg mb-2">Error loading dashboard</div>
//           <div className="text-gray-600">{error}</div>
//           <button 
//             onClick={fetchDashboardData}
//             className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-8">
//           <div className="flex justify-between items-center">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
//               <p className="text-gray-600 mt-1">Monitor your leads and enrollments performance</p>
//             </div>
//             <div className="flex items-center space-x-3">
//               <div className="text-sm text-gray-600 bg-white px-3 py-2 rounded-lg border">
//                 Showing: <span className="font-medium">{getFilterLabel()}</span>
//               </div>
//               <button
//                 onClick={() => setShowFilters(!showFilters)}
//                 className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//               >
//                 <Filter className="h-4 w-4 mr-2" />
//                 Filters
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Month Selector - Always Visible */}
//         <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 mb-6">
//           <div className="flex items-center space-x-4">
//             <label className="text-sm font-medium text-gray-700">Quick Month Selection:</label>
//             <select
//               value={filters.selectedMonth}
//               onChange={(e) => setFilters({
//                 ...filters, 
//                 selectedMonth: e.target.value,
//                 filterType: e.target.value ? 'monthly' : filters.filterType
//               })}
//               className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
//             >
//               <option value="">All Months</option>
//               {months.map(month => (
//                 <option key={month.value} value={month.value}>{month.label}</option>
//               ))}
//             </select>
//             {filters.selectedMonth && (
//               <select
//                 value={filters.selectedYear}
//                 onChange={(e) => setFilters({...filters, selectedYear: e.target.value})}
//                 className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
//               >
//                 {years.map(year => (
//                   <option key={year} value={year}>{year}</option>
//                 ))}
//               </select>
//             )}
//             {filters.selectedMonth && (
//               <button
//                 onClick={() => setFilters({...filters, selectedMonth: '', filterType: 'preset'})}
//                 className="px-3 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm"
//               >
//                 Clear Month
//               </button>
//             )}
//           </div>
//         </div>

//         {/* Advanced Filter Panel */}
//         {showFilters && (
//           <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-lg font-semibold text-gray-900">Advanced Filter Options</h3>
//               <button
//                 onClick={() => setShowFilters(false)}
//                 className="text-gray-400 hover:text-gray-600"
//               >
//                 <X className="h-5 w-5" />
//               </button>
//             </div>
            
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
//               {/* Filter Type Selection */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Filter Type</label>
//                 <select
//                   value={filters.filterType}
//                   onChange={(e) => setFilters({...filters, filterType: e.target.value as any})}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
//                 >
//                   <option value="preset">Preset Period</option>
//                   <option value="yearly">Yearly</option>
//                   <option value="dateRange">Date Range</option>
//                 </select>
//               </div>

//               {/* Preset Period */}
//               {filters.filterType === 'preset' && (
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Period</label>
//                   <select
//                     value={filters.presetPeriod}
//                     onChange={(e) => setFilters({...filters, presetPeriod: e.target.value as any})}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
//                   >
//                     <option value="6months">Last 6 Months</option>
//                     <option value="12months">Last 12 Months</option>
//                     <option value="all">All Time</option>
//                   </select>
//                 </div>
//               )}

//               {/* Yearly Filter */}
//               {filters.filterType === 'yearly' && (
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
//                   <select
//                     value={filters.selectedYear}
//                     onChange={(e) => setFilters({...filters, selectedYear: e.target.value})}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
//                   >
//                     {years.map(year => (
//                       <option key={year} value={year}>{year}</option>
//                     ))}
//                   </select>
//                 </div>
//               )}

//               {/* Date Range Filter */}
//               {filters.filterType === 'dateRange' && (
//                 <>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
//                     <input
//                       type="date"
//                       value={filters.dateFrom}
//                       onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
//                     <input
//                       type="date"
//                       value={filters.dateTo}
//                       onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
//                     />
//                   </div>
//                 </>
//               )}
//             </div>

//             <div className="flex justify-end space-x-3">
//               <button
//                 onClick={resetFilters}
//                 className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
//               >
//                 Reset Filters
//               </button>
//               <button
//                 onClick={() => setShowFilters(false)}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//               >
//                 Apply Filters
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
//           <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Total Leads</p>
//                 <p className="text-3xl font-bold text-gray-900">{stats.totalLeads}</p>
//                 <p className="text-xs text-gray-500 mt-1">Based on created date</p>
//               </div>
//               <div className="p-3 bg-blue-100 rounded-lg">
//                 <Users className="h-6 w-6 text-blue-600" />
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Total Enrollments</p>
//                 <p className="text-3xl font-bold text-gray-900">{stats.totalEnrollments}</p>
//                 <p className="text-xs text-gray-500 mt-1">Based on created date</p>
//               </div>
//               <div className="p-3 bg-green-100 rounded-lg">
//                 <UserCheck className="h-6 w-6 text-green-600" />
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
//                 <p className="text-3xl font-bold text-gray-900">{stats.conversionRate}%</p>
//                 <p className="text-xs text-gray-500 mt-1">Lead to enrollment</p>
//               </div>
//               <div className="p-3 bg-yellow-100 rounded-lg">
//                 <TrendingUp className="h-6 w-6 text-yellow-600" />
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">
//                   {filters.filterType === 'monthly' ? 'Daily Avg Leads' : 'Monthly Avg Leads'}
//                 </p>
//                 <p className="text-3xl font-bold text-gray-900">
//                   {Math.round(monthlyData.reduce((sum, period) => sum + period.leads, 0) / Math.max(monthlyData.length, 1))}
//                 </p>
//                 <p className="text-xs text-gray-500 mt-1">
//                   {filters.filterType === 'monthly' ? 'This month' : `Last ${monthlyData.length} periods`}
//                 </p>
//               </div>
//               <div className="p-3 bg-purple-100 rounded-lg">
//                 <Calendar className="h-6 w-6 text-purple-600" />
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">
//                   {filters.filterType === 'monthly' ? 'Daily Avg Enrollments' : 'Monthly Avg Enrollments'}
//                 </p>
//                 <p className="text-3xl font-bold text-gray-900">
//                   {Math.round(monthlyData.reduce((sum, period) => sum + period.enrollments, 0) / Math.max(monthlyData.length, 1))}
//                 </p>
//                 <p className="text-xs text-gray-500 mt-1">
//                   {filters.filterType === 'monthly' ? 'This month' : `Last ${monthlyData.length} periods`}
//                 </p>
//               </div>
//               <div className="p-3 bg-indigo-100 rounded-lg">
//                 <Award className="h-6 w-6 text-indigo-600" />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Charts */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
//           {/* Monthly/Daily Trends */}
//           <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
//             <div className="flex justify-between items-center mb-6">
//               <h3 className="text-lg font-semibold text-gray-900">
//                 {filters.filterType === 'monthly' && filters.selectedMonth ? 'Daily Trends' : 'Monthly Trends'}
//               </h3>
//               <div className="flex space-x-4 text-sm">
//                 <div className="flex items-center">
//                   <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
//                   <span className="text-gray-600">Leads</span>
//                 </div>
//                 <div className="flex items-center">
//                   <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
//                   <span className="text-gray-600">Enrollments</span>
//                 </div>
//               </div>
//             </div>
//             <ResponsiveContainer width="100%" height={300}>
//               <AreaChart data={monthlyData}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//                 <XAxis 
//                   dataKey="month" 
//                   tick={{ fontSize: 12 }}
//                   axisLine={false}
//                   tickLine={false}
//                 />
//                 <YAxis 
//                   tick={{ fontSize: 12 }}
//                   axisLine={false}
//                   tickLine={false}
//                 />
//                 <Tooltip 
//                   contentStyle={{
//                     backgroundColor: 'white',
//                     border: '1px solid #e5e7eb',
//                     borderRadius: '8px',
//                     boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
//                   }}
//                 />
//                 <Area 
//                   type="monotone" 
//                   dataKey="leads" 
//                   stackId="1"
//                   stroke="#3B82F6" 
//                   fill="#3B82F6"
//                   fillOpacity={0.1}
//                 />
//                 <Area 
//                   type="monotone" 
//                   dataKey="enrollments" 
//                   stackId="2"
//                   stroke="#10B981" 
//                   fill="#10B981"
//                   fillOpacity={0.2}
//                 />
//               </AreaChart>
//             </ResponsiveContainer>
//           </div>

          
//           {/* Conversion Rate Trend */}
//    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
//             <div className="flex justify-between items-center mb-6">
//               <h3 className="text-lg font-semibold text-gray-900">
//                  {filters.filterType === 'monthly' && filters.selectedMonth ? 'Daily Conversion Rate' : 'Monthly Conversion Rate'}
//                </h3>
//                <div className="text-sm text-gray-600">Percentage</div>
//         </div>
//            <ResponsiveContainer width="100%" height={300}>
//              <LineChart data={monthlyData}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//                 <XAxis 
//                   dataKey="month" 
//                   tick={{ fontSize: 12 }}
//                   axisLine={false}
//                   tickLine={false}
//                 />
//                 <YAxis 
//                   tick={{ fontSize: 12 }}
//                   axisLine={false}
//                   tickLine={false}
//                 />
//                 <Tooltip 
//                   contentStyle={{
//                     backgroundColor: 'white',
//                     border: '1px solid #e5e7eb',
//                     borderRadius: '8px',
//                     boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
//                   }}
//                   formatter={(value) => [`${value}%`, 'Conversion Rate']}
//                 />
//                 <Line 
//                   type="monotone" 
//                   dataKey="conversions" 
//                   stroke="#F59E0B" 
//                   strokeWidth={3}
//                   dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
//                   activeDot={{ r: 6, stroke: '#F59E0B', strokeWidth: 2 }}
//                 />
//               </LineChart>
//             </ResponsiveContainer>
//           </div>
//         </div>

//         {/* Bottom Row */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Lead Status Distribution */}
//           <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
//             <h3 className="text-lg font-semibold text-gray-900 mb-6">Lead Status Distribution</h3>
//             <div className="space-y-4">
//               {leadStatusData.slice(0, 6).map((item, index) => (
//                 <div key={item.status} className="flex items-center justify-between">
//                   <div className="flex items-center">
//                     <div 
//                       className="w-3 h-3 rounded-full mr-3"
//                       style={{ backgroundColor: COLORS[index % COLORS.length] }}
//                     ></div>
//                     <span className="text-sm text-gray-700">{item.status}</span>
//                   </div>
//                   <div className="text-right">
//                     <div className="text-sm font-medium text-gray-900">{item.count}</div>
//                     <div className="text-xs text-gray-500">{item.percentage}%</div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Lead Sources */}
//           <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
//             <h3 className="text-lg font-semibold text-gray-900 mb-6">Lead Sources</h3>
//             <div className="space-y-4">
//               {sourceData.slice(0, 6).map((item, index) => (
//                 <div key={item.status} className="flex items-center justify-between">
//                   <div className="flex items-center">
//                     <div 
//                       className="w-3 h-3 rounded-full mr-3"
//                       style={{ backgroundColor: COLORS[index % COLORS.length] }}
//                     ></div>
//                     <span className="text-sm text-gray-700">{item.status}</span>
//                   </div>
//                   <div className="text-right">
//                     <div className="text-sm font-medium text-gray-900">{item.count}</div>
//                     <div className="text-xs text-gray-500">{item.percentage}%</div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Quick Stats */}
//           <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
//             <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Insights</h3>
//             <div className="space-y-4">
//               <div className="p-4 bg-blue-50 rounded-lg">
//                 <div className="text-sm font-medium text-blue-900">
//                   Best Performing {filters.filterType === 'monthly' ? 'Day' : 'Month'}
//                 </div>
//                 <div className="text-lg font-bold text-blue-700">
//                   {monthlyData.length > 0 ? monthlyData.reduce((best, current) => 
//                     current.leads > best.leads ? current : best, 
//                     monthlyData[0]
//                   ).month : 'N/A'}
//                 </div>
//                 <div className="text-xs text-blue-600">
//                   {monthlyData.length > 0 ? monthlyData.reduce((best, current) => 
//                     current.leads > best.leads ? current : best, 
//                     monthlyData[0]
//                   ).leads : 0} leads
//                 </div>
//               </div>
              
//               <div className="p-4 bg-green-50 rounded-lg">
//                 <div className="text-sm font-medium text-green-900">
//                   Best Conversion {filters.filterType === 'monthly' ? 'Day' : 'Month'}
//                 </div>
//                 <div className="text-lg font-bold text-green-700">
//                   {monthlyData.length > 0 ? monthlyData.reduce((best, current) => 
//                     current.conversions > best.conversions ? current : best, 
//                     monthlyData[0]
//                   ).month : 'N/A'}
//                 </div>
//                 <div className="text-xs text-green-600">
//                   {monthlyData.length > 0 ? monthlyData.reduce((best, current) => 
//                     current.conversions > best.conversions ? current : best, 
//                     monthlyData[0]
//                   ).conversions : 0}% conversion rate
//                 </div>
//               </div>

//               <div className="p-4 bg-yellow-50 rounded-lg">
//                 <div className="text-sm font-medium text-yellow-900">Growth Trend</div>
//                 <div className="text-lg font-bold text-yellow-700">
//                   {monthlyData.length >= 2 && 
//                    monthlyData[monthlyData.length - 1].leads >= monthlyData[monthlyData.length - 2].leads 
//                     ? '↗ Increasing' : '↘ Decreasing'}
//                 </div>
//                 <div className="text-xs text-yellow-600">
//                   Period-over-period leads
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Calendar, Users, UserCheck, TrendingUp, Phone, Mail, BookOpen, Award, Filter, X } from 'lucide-react';

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
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    totalEnrollments: 0,
    conversionRate: 0,
    newLeadsThisMonth: 0,
    enrollmentsThisMonth: 0
  });
  
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [leadStatusData, setLeadStatusData] = useState<StatusData[]>([]);
  const [sourceData, setSourceData] = useState<StatusData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    filterType: 'preset',
    presetPeriod: '6months',
    selectedMonth: '',
    selectedYear: new Date().getFullYear().toString(),
    dateFrom: '',
    dateTo: ''
  });

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

  // Base API URL - update this to match your backend
  const API_BASE_URL = 'http://localhost:6969/api';

  useEffect(() => {
    fetchDashboardData();
  }, [filters]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch leads and enrollments from your API
      const [leadsResponse, enrollmentsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/leads/viewleads`), // Update this endpoint to match your leads API
        fetch(`${API_BASE_URL}/students`) // This matches your existing students endpoint
      ]);

      if (!leadsResponse.ok || !enrollmentsResponse.ok) {
        throw new Error('Failed to fetch data from server');
      }

      const leadsData = await leadsResponse.json();
      const enrollmentsData = await enrollmentsResponse.json();

      // Handle response format - adapt based on your API response structure
      const leads: Lead[] = Array.isArray(leadsData) ? leadsData : leadsData.data || [];
      const enrollments: Enrollment[] = Array.isArray(enrollmentsData) ? enrollmentsData : enrollmentsData.data || [];

      // Filter data based on current filters
      const filteredData = applyFilters(leads, enrollments);
      
      // Process the filtered data
      processData(filteredData.leads, filteredData.enrollments);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = (leads: Lead[], enrollments: Enrollment[]) => {
    let filteredLeads = [...leads];
    let filteredEnrollments = [...enrollments];

    const filterByDate = (items: any[], dateField: string) => {
      return items.filter(item => {
        const itemDate = new Date(item[dateField]);
        
        switch (filters.filterType) {
          case 'preset':
            const now = new Date();
            const monthsBack = filters.presetPeriod === '6months' ? 6 : 
                             filters.presetPeriod === '12months' ? 12 : 999;
            const cutoffDate = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);
            return filters.presetPeriod === 'all' || itemDate >= cutoffDate;

          case 'monthly':
            if (!filters.selectedMonth) return true;
            return itemDate.getMonth() === parseInt(filters.selectedMonth) - 1 && 
                   itemDate.getFullYear() === parseInt(filters.selectedYear);

          case 'yearly':
            return itemDate.getFullYear() === parseInt(filters.selectedYear);

          case 'dateRange':
            if (!filters.dateFrom && !filters.dateTo) return true;
            const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : new Date('1900-01-01');
            const toDate = filters.dateTo ? new Date(filters.dateTo) : new Date('2100-12-31');
            return itemDate >= fromDate && itemDate <= toDate;

          default:
            return true;
        }
      });
    };

    filteredLeads = filterByDate(leads, 'createdAt');
    filteredEnrollments = filterByDate(enrollments, 'createdAt');

    return { leads: filteredLeads, enrollments: filteredEnrollments };
  };

  const processData = (leads: Lead[], enrollments: Enrollment[]) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Calculate basic stats
    const totalLeads = leads.length;
    const totalEnrollments = enrollments.length;
    const conversionRate = totalLeads > 0 ? Math.round((totalEnrollments / totalLeads) * 100) : 0;

    // New leads and enrollments this month (only for current month)
    const newLeadsThisMonth = leads.filter(lead => {
      const leadDate = new Date(lead.createdAt);
      return leadDate.getMonth() === currentMonth && leadDate.getFullYear() === currentYear;
    }).length;

    const enrollmentsThisMonth = enrollments.filter(enrollment => {
      const enrollDate = new Date(enrollment.createdAt);
      return enrollDate.getMonth() === currentMonth && enrollDate.getFullYear() === currentYear;
    }).length;

    setStats({
      totalLeads,
      totalEnrollments,
      conversionRate,
      newLeadsThisMonth,
      enrollmentsThisMonth
    });

    // Generate monthly data based on filter type
    let monthlyDataMap = new Map<string, { leads: number; enrollments: number }>();
    
    if (filters.filterType === 'monthly' && filters.selectedMonth) {
      // For monthly filter, show daily breakdown
      const year = parseInt(filters.selectedYear);
      const month = parseInt(filters.selectedMonth) - 1;
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      
      for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = `${filters.selectedMonth}/${day.toString().padStart(2, '0')}`;
        monthlyDataMap.set(dateKey, { leads: 0, enrollments: 0 });
      }

      leads.forEach(lead => {
        const leadDate = new Date(lead.createdAt);
        if (leadDate.getMonth() === month && leadDate.getFullYear() === year) {
          const dateKey = `${filters.selectedMonth}/${leadDate.getDate().toString().padStart(2, '0')}`;
          if (monthlyDataMap.has(dateKey)) {
            monthlyDataMap.get(dateKey)!.leads++;
          }
        }
      });

      enrollments.forEach(enrollment => {
        const enrollDate = new Date(enrollment.createdAt);
        if (enrollDate.getMonth() === month && enrollDate.getFullYear() === year) {
          const dateKey = `${filters.selectedMonth}/${enrollDate.getDate().toString().padStart(2, '0')}`;
          if (monthlyDataMap.has(dateKey)) {
            monthlyDataMap.get(dateKey)!.enrollments++;
          }
        }
      });
    } else {
      // For other filters, show monthly breakdown
      const months = filters.filterType === 'preset' ? 
        (filters.presetPeriod === '6months' ? 6 : filters.presetPeriod === '12months' ? 12 : 24) : 12;

      for (let i = months - 1; i >= 0; i--) {
        const date = new Date(currentYear, currentMonth - i, 1);
        const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        monthlyDataMap.set(monthKey, { leads: 0, enrollments: 0 });
      }

      leads.forEach(lead => {
        const leadDate = new Date(lead.createdAt);
        const monthKey = leadDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        if (monthlyDataMap.has(monthKey)) {
          monthlyDataMap.get(monthKey)!.leads++;
        }
      });

      enrollments.forEach(enrollment => {
        const enrollDate = new Date(enrollment.createdAt);
        const monthKey = enrollDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        if (monthlyDataMap.has(monthKey)) {
          monthlyDataMap.get(monthKey)!.enrollments++;
        }
      });
    }

    const processedMonthlyData: MonthlyData[] = Array.from(monthlyDataMap.entries()).map(([month, data]) => ({
      month,
      leads: data.leads,
      enrollments: data.enrollments,
      conversions: Math.round((data.enrollments / Math.max(data.leads, 1)) * 100)
    }));

    setMonthlyData(processedMonthlyData);

    // Process lead status data
    const statusMap = new Map<string, number>();
    leads.forEach(lead => {
      const status = lead.status || 'new';
      statusMap.set(status, (statusMap.get(status) || 0) + 1);
    });

    const processedStatusData: StatusData[] = Array.from(statusMap.entries()).map(([status, count]) => ({
      status: status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      count,
      percentage: Math.round((count / totalLeads) * 100)
    }));

    setLeadStatusData(processedStatusData);

    // Process lead source data
    const sourceMap = new Map<string, number>();
    leads.forEach(lead => {
      const source = lead.leadSource || 'Unknown';
      sourceMap.set(source, (sourceMap.get(source) || 0) + 1);
    });

    const processedSourceData: StatusData[] = Array.from(sourceMap.entries()).map(([source, count]) => ({
      status: source,
      count,
      percentage: Math.round((count / totalLeads) * 100)
    }));

    setSourceData(processedSourceData);
  };

  const resetFilters = () => {
    setFilters({
      filterType: 'preset',
      presetPeriod: '6months',
      selectedMonth: '',
      selectedYear: new Date().getFullYear().toString(),
      dateFrom: '',
      dateTo: ''
    });
  };

  const getFilterLabel = () => {
    switch (filters.filterType) {
      case 'preset':
        const labels = { '6months': 'Last 6 Months', '12months': 'Last 12 Months', 'all': 'All Time' };
        return labels[filters.presetPeriod];
      case 'monthly':
        if (filters.selectedMonth) {
          const monthName = months.find(m => m.value === filters.selectedMonth)?.label;
          return `${monthName} ${filters.selectedYear}`;
        }
        return 'Select Month';
      case 'yearly':
        return `Year ${filters.selectedYear}`;
      case 'dateRange':
        if (filters.dateFrom && filters.dateTo) {
          return `${filters.dateFrom} to ${filters.dateTo}`;
        } else if (filters.dateFrom) {
          return `From ${filters.dateFrom}`;
        } else if (filters.dateTo) {
          return `Until ${filters.dateTo}`;
        }
        return 'Custom Date Range';
      default:
        return 'All Time';
    }
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-2">Error loading dashboard</div>
          <div className="text-gray-600">{error}</div>
          <button 
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
                Showing: <span className="font-medium">{getFilterLabel()}</span>
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
                onClick={resetFilters}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Reset Filters
              </button>
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
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Leads</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalLeads}</p>
                <p className="text-xs text-gray-500 mt-1">Based on created date</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Enrollments</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalEnrollments}</p>
                <p className="text-xs text-gray-500 mt-1">Based on created date</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-3xl font-bold text-gray-900">{stats.conversionRate}%</p>
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

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lead Status Distribution */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Lead Status Distribution</h3>
            <div className="space-y-4">
              {leadStatusData.slice(0, 6).map((item, index) => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-3"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
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
              {sourceData.slice(0, 6).map((item, index) => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-3"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
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
