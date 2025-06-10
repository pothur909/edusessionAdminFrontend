import React, { useState } from 'react';
import { Search, Filter, X, Calendar } from 'lucide-react';
import { useFilter } from '@/context/FilterContext';
import { Box, Paper, Grid, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

interface FilterPanelProps {
  showAdvancedFilters: boolean;
  setShowAdvancedFilters: (show: boolean) => void;
  months: { value: string; label: string }[];
  demoStatuses?: { value: string; label: string }[];
  uniqueBoards?: string[];
  uniqueClasses?: string[];
  uniqueSubjects?: string[];
  statusOptions?: { value: string; label: string }[];
  qualificationOptions?: { value: string; label: string }[];
  experienceOptions?: { value: string; label: string }[];
  onApplyFilters?: (filters: { qualification: string; experience: string }) => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  showAdvancedFilters,
  setShowAdvancedFilters,
  months,
  demoStatuses,
  uniqueBoards,
  uniqueClasses,
  uniqueSubjects,
  statusOptions,
  qualificationOptions,
  experienceOptions,
  onApplyFilters,
}) => {
  const {
    filterState,
    setSearchQuery,
    setDateRange,
    setMonthFilter,
    setYearFilter,
    setBoardFilter,
    setClassFilter,
    setSubjectFilter,
    setStatusFilter,
    setDemoStatusFilter,
    setQuickMonthSelection,
    clearAllFilters,
    hasActiveFilters,
  } = useFilter();

  const [qualificationFilter, setQualificationFilter] = useState('all');
  const [experienceFilter, setExperienceFilter] = useState('all');

  const getActiveFiltersCount = () => {
    const activeFilters = [
      filterState.searchQuery,
      filterState.dateRange.startDate,
      filterState.dateRange.endDate,
      filterState.monthFilter !== 'all',
      filterState.yearFilter !== 'all',
      filterState.boardFilter !== 'all',
      filterState.classFilter !== 'all',
      filterState.subjectFilter !== 'all',
      filterState.statusFilter !== 'all',
      filterState.demoStatusFilter !== 'all',
      filterState.quickMonthSelection !== 'all',
      qualificationFilter !== 'all',
      experienceFilter !== 'all'
    ].filter(Boolean);

    return activeFilters.length;
  };

  const handleReset = () => {
    clearAllFilters();
    setQualificationFilter('all');
    setExperienceFilter('all');
  };

  const handleApplyFilters = () => {
    if (onApplyFilters) {
      onApplyFilters({
        qualification: qualificationFilter,
        experience: experienceFilter
      });
    }
    setShowAdvancedFilters(false);
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <div className="flex-1 relative max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={filterState.searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
          />
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Quick Month:</label>
          <select
            value={filterState.quickMonthSelection}
            onChange={(e) => {
              setQuickMonthSelection(e.target.value);
              setMonthFilter(e.target.value);
            }}
            className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
          >
            {months.map(month => (
              <option key={month.value} value={month.value}>{month.label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Filter size={18} />
            <span>Filters</span>
            {getActiveFiltersCount() > 0 && (
              <span className="bg-white text-blue-600 text-xs px-2 py-0.5 rounded-full font-bold">
                {getActiveFiltersCount()}
              </span>
            )}
          </button>
          {getActiveFiltersCount() > 0 && (
            <button
              onClick={handleReset}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              <X size={16} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </Box>

      {showAdvancedFilters && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
            {qualificationOptions && (
              <Box>
                <label className="block text-sm font-medium text-gray-600 mb-2">Qualification</label>
                <select
                  value={qualificationFilter}
                  onChange={(e) => setQualificationFilter(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {qualificationOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Box>
            )}

            {experienceOptions && (
              <Box>
                <label className="block text-sm font-medium text-gray-600 mb-2">Experience</label>
                <select
                  value={experienceFilter}
                  onChange={(e) => setExperienceFilter(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {experienceOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Box>
            )}

            <Box>
              <label className="block text-sm font-medium text-gray-600 mb-2">From Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={filterState.dateRange.startDate}
                  onChange={(e) => setDateRange({ ...filterState.dateRange, startDate: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </Box>

            <Box>
              <label className="block text-sm font-medium text-gray-600 mb-2">To Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={filterState.dateRange.endDate}
                  onChange={(e) => setDateRange({ ...filterState.dateRange, endDate: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </Box>

            <Box>
              <label className="block text-sm font-medium text-gray-600 mb-2">Month</label>
              <select
                value={filterState.monthFilter}
                onChange={(e) => {
                  setMonthFilter(e.target.value);
                  setQuickMonthSelection(e.target.value);
                }}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {months.map(month => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
            </Box>

            <Box>
              <label className="block text-sm font-medium text-gray-600 mb-2">Year</label>
              <select
                value={filterState.yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Years</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
              </select>
            </Box>

            <Box>
              <label className="block text-sm font-medium text-gray-600 mb-2">Board</label>
              <select
                value={filterState.boardFilter}
                onChange={(e) => setBoardFilter(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Boards</option>
                {uniqueBoards?.map(board => (
                  <option key={board} value={board}>{board}</option>
                ))}
              </select>
            </Box>

            <Box>
              <label className="block text-sm font-medium text-gray-600 mb-2">Class</label>
              <select
                value={filterState.classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Classes</option>
                {uniqueClasses?.map(cls => (
                  <option key={cls} value={cls}>Class {cls}</option>
                ))}
              </select>
            </Box>

            <Box>
              <label className="block text-sm font-medium text-gray-600 mb-2">Subject</label>
              <select
                value={filterState.subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Subjects</option>
                {uniqueSubjects?.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </Box>

            <Box>
              <label className="block text-sm font-medium text-gray-600 mb-2">Status</label>
              <select
                value={filterState.statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statusOptions?.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </Box>
          </Box>

          <div className="flex justify-end mt-4">
            <button
              onClick={handleApplyFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Apply Filters
            </button>
          </div>
        </Paper>
      )}
    </Box>
  );
}; 