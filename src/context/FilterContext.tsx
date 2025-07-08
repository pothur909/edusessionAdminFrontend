"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FilterState {
  searchQuery: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  monthFilter: string;
  yearFilter: string;
  boardFilter: string;
  classFilter: string;
  subjectFilter: string;
  statusFilter: string;
  demoStatusFilter: string;
  quickMonthSelection: string;
  currentPage: number;
  itemsPerPage: number;
}

interface FilterContextType {
  filterState: FilterState;
  setSearchQuery: (query: string) => void;
  setDateRange: (range: { startDate: string; endDate: string }) => void;
  setMonthFilter: (month: string) => void;
  setYearFilter: (year: string) => void;
  setBoardFilter: (board: string) => void;
  setClassFilter: (classValue: string) => void;
  setSubjectFilter: (subject: string) => void;
  setStatusFilter: (status: string) => void;
  setDemoStatusFilter: (status: string) => void;
  setQuickMonthSelection: (month: string) => void;
  setCurrentPage: (page: number) => void;
  clearAllFilters: () => void;
  hasActiveFilters: () => boolean;
}

const initialState: FilterState = {
  searchQuery: '',
  dateRange: {
    startDate: '',
    endDate: '',
  },
  monthFilter: 'all',
  yearFilter: 'all',
  boardFilter: 'all',
  classFilter: 'all',
  subjectFilter: 'all',
  statusFilter: 'all',
  demoStatusFilter: 'all',
  quickMonthSelection: 'all',
  currentPage: 1,
  itemsPerPage: 10,
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [filterState, setFilterState] = useState<FilterState>(initialState);

  const setSearchQuery = (query: string) => {
    setFilterState(prev => ({ ...prev, searchQuery: query, currentPage: 1 }));
  };

  const setDateRange = (range: { startDate: string; endDate: string }) => {
    setFilterState(prev => ({ ...prev, dateRange: range, currentPage: 1 }));
  };

  const setMonthFilter = (month: string) => {
    setFilterState(prev => ({ ...prev, monthFilter: month, currentPage: 1 }));
  };

  const setYearFilter = (year: string) => {
    setFilterState(prev => ({ ...prev, yearFilter: year, currentPage: 1 }));
  };

  const setBoardFilter = (board: string) => {
    setFilterState(prev => ({ ...prev, boardFilter: board, currentPage: 1 }));
  };

  const setClassFilter = (classValue: string) => {
    setFilterState(prev => ({ ...prev, classFilter: classValue, currentPage: 1 }));
  };

  const setSubjectFilter = (subject: string) => {
    setFilterState(prev => ({ ...prev, subjectFilter: subject, currentPage: 1 }));
  };

  const setStatusFilter = (status: string) => {
    setFilterState(prev => ({ ...prev, statusFilter: status, currentPage: 1 }));
  };

  const setDemoStatusFilter = (status: string) => {
    setFilterState(prev => ({ ...prev, demoStatusFilter: status, currentPage: 1 }));
  };

  const setQuickMonthSelection = (month: string) => {
    setFilterState(prev => ({ ...prev, quickMonthSelection: month, currentPage: 1 }));
  };

  const setCurrentPage = (page: number) => {
    setFilterState(prev => ({ ...prev, currentPage: page }));
  };

  const clearAllFilters = () => {
    setFilterState(initialState);
  };

  const hasActiveFilters = () => {
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
      filterState.quickMonthSelection !== 'all'
    ].filter(Boolean);

    return activeFilters.length > 0;
  };

  const value = {
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
    setCurrentPage,
    clearAllFilters,
    hasActiveFilters,
  };

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
};

export const useFilter = () => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
}; 