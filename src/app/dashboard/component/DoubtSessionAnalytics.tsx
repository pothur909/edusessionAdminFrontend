// import { useState, useEffect } from 'react';
// import { Card, CardContent } from '@/components/ui/card';
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// interface MonthlyCount {
//   month: string;
//   count: number;
// }

// interface FilterState {
//   filterType: 'preset' | 'monthly' | 'yearly' | 'dateRange';
//   presetPeriod: '6months' | '12months' | 'all';
//   selectedMonth: string;
//   selectedYear: string;
//   dateFrom: string;
//   dateTo: string;
// }

// interface DoubtSessionAnalyticsProps {
//   filters: FilterState;
//   subject: string;
// }

// export default function DoubtSessionAnalytics({ filters, subject }: DoubtSessionAnalyticsProps) {
//   const [subjects, setSubjects] = useState<string[]>([]);
//   const [totalCount, setTotalCount] = useState(0);
//   const [monthlyCounts, setMonthlyCounts] = useState<MonthlyCount[]>([]);
//   const [monthCount, setMonthCount] = useState(0);
//   const [weekCount, setWeekCount] = useState(0);
//   const [dayCount, setDayCount] = useState(0);
//   const [subjectCount, setSubjectCount] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const baseUrl = 'http://localhost:6969';

//   // Derive year, month, day from filters
//   const year = filters.selectedYear;
//   const month = filters.selectedMonth || (new Date().getMonth() + 1).toString().padStart(2, '0');
//   const day = filters.dateFrom || new Date().toISOString().slice(0, 10);

//   useEffect(() => {
//     fetchTotalCount();
//     fetchMonthlyCounts();
//     fetchMonthCount();
//     fetchWeekCount();
//     fetchDayCount();
//     fetchSubjects();
//   }, [year, month, day]);

//   useEffect(() => {
//     if (subject) fetchSubjectCount();
//   }, [subject, year, month]);

//   const fetchTotalCount = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const res = await fetch(`${baseUrl}/api/session/count`);
//       const data = await res.json();
//       setTotalCount(data.count || 0);
//     } catch (err) {
//       setError('Failed to fetch total session count');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchMonthlyCounts = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const res = await fetch(`${baseUrl}/api/session/countByMonth?year=${year}`);
//       const data = await res.json();
//       const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
//       const counts: MonthlyCount[] = Array(12).fill(0).map((_, i) => ({ month: months[i], count: 0 }));
//       (data.counts || []).forEach((item: any) => {
//         if (item._id >= 1 && item._id <= 12) {
//           counts[item._id - 1].count = item.count;
//         }
//       });
//       setMonthlyCounts(counts);
//     } catch (err) {
//       setError('Failed to fetch monthly session counts');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchMonthCount = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const res = await fetch(`${baseUrl}/api/session/countByMonth?year=${year}`);
//       const data = await res.json();
//       const found = (data.counts || []).find((item: any) => item._id === parseInt(month));
//       setMonthCount(found ? found.count : 0);
//     } catch (err) {
//       setError('Failed to fetch month session count');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchWeekCount = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const res = await fetch(`${baseUrl}/api/session/getSessionCountByHourOfDay?range=7days`);
//       const data = await res.json();
//       const total = (data.counts || []).reduce((sum: number, item: any) => sum + (item.count || 0), 0);
//       setWeekCount(total);
//     } catch (err) {
//       setError('Failed to fetch week session count');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchDayCount = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const res = await fetch(`${baseUrl}/api/session/getSessionCountByHourOfDay?date=${day}`);
//       const data = await res.json();
//       const total = (data.counts || []).reduce((sum: number, item: any) => sum + (item.count || 0), 0);
//       setDayCount(total);
//     } catch (err) {
//       setError('Failed to fetch day session count');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchSubjects = async () => {
//     try {
//       const res = await fetch(`${baseUrl}/api/session/countBySubjectAllTime`);
//       const data = await res.json();
//       setSubjects((data.counts || []).map((item: any) => item._id));
//     } catch (err) {
//       // ignore
//     }
//   };

//   const fetchSubjectCount = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const res = await fetch(`${baseUrl}/api/session/countBySubjectBoardByMonth?year=${year}&month=${month}&subject=${subject}`);
//       const data = await res.json();
//       const found = (data.counts || []).find((item: any) => item.subject === subject);
//       setSubjectCount(found ? found.count : 0);
//     } catch (err) {
//       setError('Failed to fetch subject session count');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div className="text-red-600">{error}</div>;

//   return (
//     <div className="mb-8">
//       <h2 className="text-2xl font-bold mb-4">Doubt Session Analytics</h2>
//       {/* No filter UI here, all filters are controlled by dashboard */}
//       <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
//         <Card>
//           <CardContent className="p-6">
//             <div className="text-sm text-gray-600 mb-1">Total Doubt Sessions</div>
//             <div className="text-3xl font-bold text-blue-700">{totalCount}</div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="p-6">
//             <div className="text-sm text-gray-600 mb-1">This Month</div>
//             <div className="text-3xl font-bold text-green-700">{monthCount}</div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="p-6">
//             <div className="text-sm text-gray-600 mb-1">This Week</div>
//             <div className="text-3xl font-bold text-purple-700">{weekCount}</div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="p-6">
//             <div className="text-sm text-gray-600 mb-1">This Day</div>
//             <div className="text-3xl font-bold text-yellow-700">{dayCount}</div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="p-6">
//             <div className="text-sm text-gray-600 mb-1">{subject ? `Subject: ${subject}` : 'All Subjects'}</div>
//             <div className="text-3xl font-bold text-pink-700">{subject ? subjectCount : totalCount}</div>
//           </CardContent>
//         </Card>
//       </div>
//       <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
//         <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trend</h3>
//         <ResponsiveContainer width="100%" height={300}>
//           <BarChart data={monthlyCounts}>
//             <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//             <XAxis dataKey="month" tick={{ fontSize: 12 }} />
//             <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
//             <Tooltip />
//             <Bar dataKey="count" fill="#3B82F6" />
//           </BarChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// }



import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MonthlyCount {
  month: string;
  count: number;
}

interface FilterState {
  filterType: 'preset' | 'monthly' | 'yearly' | 'dateRange';
  presetPeriod: '6months' | '12months' | 'all';
  selectedMonth: string;
  selectedYear: string;
  dateFrom: string;
  dateTo: string;
}

interface DoubtSessionAnalyticsProps {
  filters: FilterState;
  subject: string;
}

interface SubjectCount {
  subject: string;
  board: string;
  className: string;
  count: number;
}

export default function DoubtSessionAnalytics({ filters, subject }: DoubtSessionAnalyticsProps) {
  const [subjects, setSubjects] = useState<string[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [monthlyCounts, setMonthlyCounts] = useState<MonthlyCount[]>([]);
  const [monthCount, setMonthCount] = useState(0);
  const [dayCount, setDayCount] = useState(0);
  const [subjectCounts, setSubjectCounts] = useState<SubjectCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBoard, setSelectedBoard] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [boards, setBoards] = useState<string[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  // Add a new state for date range count
  const [dateRangeCount, setDateRangeCount] = useState(0);
  const [dayTotal, setDayTotal] = useState(0);
  const [dateRangeTotal, setDateRangeTotal] = useState(0);

  const baseUrl = 'http://localhost:6969';

  // Derive year, month, day from filters
  const year = filters.selectedYear;
  const month = filters.selectedMonth || (new Date().getMonth() + 1).toString().padStart(2, '0');
  const day = filters.dateFrom || new Date().toISOString().slice(0, 10);

  // Determine if we're in day mode (when a specific date is selected)
  const showDayCard = (filters.filterType === 'monthly' && filters.dateFrom) ||
                     (filters.filterType === 'dateRange' && filters.dateFrom && !filters.dateTo);
  // Show date range card if both dateFrom and dateTo are set
  const showDateRangeCard = filters.filterType === 'dateRange' && filters.dateFrom && filters.dateTo;

  // Helper to build board/class query params
  const boardParam = selectedBoard ? `&board=${selectedBoard}` : '';
  const classParam = selectedClass ? `&className=${selectedClass}` : '';

  useEffect(() => {
    fetchTotalCount();
    fetchMonthlyCounts();
    if (showDayCard) {
      fetchDayCount();
    } else if (showDateRangeCard) {
      fetchDateRangeCount();
    } else {
      fetchMonthCount();
    }
    fetchSubjects();
    fetchSubjectCounts();
  }, [year, month, day, showDayCard, showDateRangeCard, selectedBoard, selectedClass]);

  const fetchTotalCount = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${baseUrl}/api/session/count?year=${year}&month=${month}${boardParam}${classParam}`);
      const data = await res.json();
      setTotalCount(data.count || 0);
    } catch (err) {
      setError('Failed to fetch total session count');
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyCounts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${baseUrl}/api/session/countByMonth?year=${year}${boardParam}${classParam}`);
      const data = await res.json();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const counts: MonthlyCount[] = Array(12).fill(0).map((_, i) => ({ month: months[i], count: 0 }));
      (data.counts || []).forEach((item: any) => {
        if (item._id >= 1 && item._id <= 12) {
          counts[item._id - 1].count = item.count;
        }
      });
      setMonthlyCounts(counts);
    } catch (err) {
      setError('Failed to fetch monthly session counts');
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthCount = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${baseUrl}/api/session/countByMonth?year=${year}${boardParam}${classParam}`);
      const data = await res.json();
      const found = (data.counts || []).find((item: any) => item._id === parseInt(month));
      setMonthCount(found ? found.count : 0);
    } catch (err) {
      setError('Failed to fetch month session count');
    } finally {
      setLoading(false);
    }
  };

  const fetchDayCount = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${baseUrl}/api/session/getSessionCountByHourOfDay?date=${day}${boardParam}${classParam}`);
      const data = await res.json();
      const total = (data.counts || []).reduce((sum: number, item: any) => sum + (item.count || 0), 0);
      setDayCount(total);
    } catch (err) {
      setError('Failed to fetch day session count');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/session/countBySubjectAllTime`);
      const data = await res.json();
      setSubjects((data.counts || []).map((item: any) => item._id));
    } catch (err) {
      // ignore
    }
  };

  const fetchDateRangeCount = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${baseUrl}/api/session/count?dateFrom=${filters.dateFrom}&dateTo=${filters.dateTo}${boardParam}${classParam}`);
      const data = await res.json();
      setDateRangeCount(data.count || 0);
    } catch (err) {
      setError('Failed to fetch date range session count');
    } finally {
      setLoading(false);
    }
  };

  // Update fetchSubjectCounts to use date range if needed
  const fetchSubjectCounts = async () => {
    try {
      setLoading(true);
      setError(null);
      let url = '';
      // Always use the correct API for the selected filter
      if (showDateRangeCard && filters.dateFrom && filters.dateTo) {
        if (filters.dateFrom === filters.dateTo) {
          // Single day selected via date range
          url = `${baseUrl}/api/session/getSessionCountByHourOfDay?date=${filters.dateFrom}&groupBy=subject${boardParam}${classParam}`;
        } else {
          // True date range
          url = `${baseUrl}/api/session/getSessionCountByHourOfDay?range=custom&from=${filters.dateFrom}&to=${filters.dateTo}&groupBy=subject${boardParam}${classParam}`;
        }
      } else if (showDayCard) {
        url = `${baseUrl}/api/session/getSessionCountByHourOfDay?date=${day}&groupBy=subject${boardParam}${classParam}`;
      } else {
        url = `${baseUrl}/api/session/countBySubjectBoardByMonth?year=${year}&month=${month}${boardParam}${classParam}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setSubjectCounts(data.counts || []);
      // Set dayTotal or dateRangeTotal based on mode
      if ((showDayCard || (showDateRangeCard && filters.dateFrom && filters.dateTo && filters.dateFrom === filters.dateTo))) {
        setDayTotal((data.counts || []).reduce((sum: number, item: any) => sum + (item.count || 0), 0));
      } else if (showDateRangeCard && filters.dateFrom && filters.dateTo && filters.dateFrom !== filters.dateTo) {
        setDateRangeTotal((data.counts || []).reduce((sum: number, item: any) => sum + (item.count || 0), 0));
      }
      // Extract unique boards and classes for filter options (skip for day view)
      if (!showDayCard) {
        const uniqueBoards = [...new Set((data.counts || []).map((item: any) => String(item.board)))] as string[];
        const uniqueClasses = [...new Set((data.counts || []).map((item: any) => String(item.className)))] as string[];
        setBoards(uniqueBoards);
        setClasses(uniqueClasses);
      }
    } catch (err) {
      setError('Failed to fetch subject session counts');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Doubt Session Analytics</h2>
      
      {/* Board and Class Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 mb-6">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Board:</label>
          <select
            value={selectedBoard}
            onChange={(e) => setSelectedBoard(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
          >
            <option value="">All Boards</option>
            {boards.map(board => (
              <option key={board} value={board}>{board}</option>
            ))}
          </select>
          
          <label className="text-sm font-medium text-gray-700">Class:</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
          >
            <option value="">All Classes</option>
            {classes.map(className => (
              <option key={className} value={className}>{className}</option>
            ))}
          </select>
          
          {(selectedBoard || selectedClass) && (
            <button
              onClick={() => {
                setSelectedBoard('');
                setSelectedClass('');
              }}
              className="px-3 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-gray-600 mb-1">Total Doubt Sessions</div>
            <div className="text-3xl font-bold text-blue-700">{totalCount}</div>
          </CardContent>
        </Card>
        
        {showDayCard ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-gray-600 mb-1">Selected Day</div>
              <div className="text-3xl font-bold text-green-700">{dayTotal}</div>
              <div className="text-xs text-gray-500 mt-1">{day}</div>
            </CardContent>
          </Card>
        ) : showDateRangeCard ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-gray-600 mb-1">Selected Date Range</div>
              <div className="text-3xl font-bold text-green-700">{dateRangeTotal}</div>
              <div className="text-xs text-gray-500 mt-1">{filters.dateFrom} to {filters.dateTo}</div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-gray-600 mb-1">Selected Month</div>
              <div className="text-3xl font-bold text-green-700">{monthCount}</div>
              <div className="text-xs text-gray-500 mt-1">{month}/{year}</div>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-gray-600 mb-1">
              {showDayCard ? 'Day' : showDateRangeCard ? 'Date Range' : 'Month'} Total by Subjects
            </div>
            <div className="text-3xl font-bold text-purple-700">
              {subjectCounts.reduce((sum, item) => sum + item.count, 0)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {selectedBoard && `Board: ${selectedBoard}`}
              {selectedBoard && selectedClass && ', '}
              {selectedClass && `Class: ${selectedClass}`}
              {!selectedBoard && !selectedClass && 'All Boards & Classes'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subject-wise Breakdown */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Subject-wise Sessions {showDayCard ? '(Day)' : showDateRangeCard ? '(Date Range)' : '(Month)'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjectCounts.length === 0 ? (
            <div className="p-4 bg-gray-50 rounded-lg text-gray-500">No data available.</div>
          ) : (
            subjectCounts.slice(0, 9).map((item: any, index: number) => (
              <div key={`${item.subject}-${item.board}-${item.className}-${index}`} className="p-4 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-900">{item.subject}</div>
                <div className="text-2xl font-bold text-blue-600">{item.count}</div>
                <div className="text-xs text-gray-500">{item.board} - {item.className}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Monthly Trend Chart - Only show if not in day mode */}
      {!(showDayCard || showDateRangeCard) && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyCounts}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top Performing Subjects */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Top Performing Subjects {showDayCard ? '(Day)' : showDateRangeCard ? '(Date Range)' : '(Month)'}
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={subjectCounts.slice(0, 10)}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="subject" 
              tick={{ fontSize: 10 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
            <Tooltip 
              formatter={(value, name, props) => [
                value,
                'Sessions',
                `${props.payload.board} - ${props.payload.className}`
              ]}
            />
            <Bar dataKey="count" fill="#10B981" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}