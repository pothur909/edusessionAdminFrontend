"use client"
import React, { useState, useEffect } from 'react';
import { User, BookOpen, Users, Plus, Search, Check, X, AlertCircle } from 'lucide-react';
import api from '@/lib/api'; 

interface SearchCard {
  _id: string;
  type: 1 | 2;
  classType: 'special' | 'normal';
  board?: string;
  className?: string;
  subject?: string;
  specialCourseName?: string;
  specialCourseRef?: string;
}

interface TeacherFormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  searchCards: string[];
  startTime: string;
  endTime: string;
}

const AdminTeacherDashboard = () => {
  const [searchCards, setSearchCards] = useState<SearchCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState<TeacherFormData>({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    searchCards: [],
    startTime: '',
    endTime: ''
  });

  // Fetch search cards from API
  const fetchSearchCards = async () => {
    setCardsLoading(true);
    setError('');

    try {
      const response = await api.get('/admin/get-search-cards');
      setSearchCards(response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch search cards';
      setError(errorMessage);
      console.error('Error fetching search cards:', err);
    } finally {
      setCardsLoading(false);
    }
  };

  useEffect(() => {
    fetchSearchCards();
  }, []);

  // Handle input changes
  const handleInputChange = (field: keyof TeacherFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle multiple card selection
  const handleCardSelection = (cardId: string) => {
    setSelectedCards(prev => {
      if (prev.includes(cardId)) {
        return prev.filter(id => id !== cardId); // Remove if already selected
      } else {
        return [...prev, cardId]; // Add if not selected
      }
    });
  };

  // Function to clear all selections
  const clearAllSelections = () => {
    setSelectedCards([]);
  };

  // Function to select all filtered cards
  const selectAllCards = () => {
    const allFilteredIds = filteredCards.map(card => card._id);
    setSelectedCards(allFilteredIds);
  };

  // Filter search cards based on search term
  const filteredCards = searchCards.filter(card => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      card.subject?.toLowerCase().includes(searchLower) ||
      card.specialCourseName?.toLowerCase().includes(searchLower) ||
      card.board?.toLowerCase().includes(searchLower) ||
      card.className?.toLowerCase().includes(searchLower)
    );
  });

  // Get card display title
  const getCardTitle = (card: SearchCard) => {
    if (card.classType === 'special') {
      return card.specialCourseName || 'Special Course';
    }
    return `${card.board} - ${card.className} - ${card.subject}`;
  };

  // Get card type label
  const getCardTypeLabel = (type: 1 | 2) => {
    return type === 1 ? 'Doubt Session' : 'One-to-One';
  };

  // Create teacher with API
  const handleCreateTeacher = async () => {
    if (selectedCards.length === 0) {
      alert('Please select at least one search card');
      return;
    }
    if (!formData.startTime || !formData.endTime) {
      alert('Please enter both start time and end time');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        searchCards: selectedCards,
        startTime: formData.startTime,
        endTime: formData.endTime
      };
      await api.post('/admin/create-teacher-credentials', payload);
      // Reset form and close
      setFormData({
        fullName: '',
        email: '',
        phoneNumber: '',
        password: '',
        searchCards: [],
        startTime: '',
        endTime: ''
      });
      setSelectedCards([]);
      setShowForm(false);
      alert('Teacher created successfully!');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to create teacher';
      setError(errorMessage);
      console.error('Error creating teacher:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bga-blue-100 p-2 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Teacher Management</h1>
                <p className="text-gray-600">Create teachers and assign search cards</p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Teacher</span>
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Error: {error}</span>
            </div>
          </div>
        )}

        {/* Teacher Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Create New Teacher</span>
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter full name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter email address"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter phone number"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter password"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time (24-hour format)</label>
                <div className="flex gap-2">
                  <select
                    value={formData.startTime.split(":")[0] || ""}
                    onChange={e => {
                      const hour = e.target.value;
                      const minute = formData.startTime.split(":")[1] || "00";
                      handleInputChange('startTime', `${hour}:${minute}`);
                    }}
                    className="px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="" disabled>HH</option>
                    {[...Array(24).keys()].map(h => (
                      <option key={h} value={h.toString().padStart(2, '0')}>
                        {h.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                  <span className="self-center">:</span>
                  <select
                    value={formData.startTime.split(":")[1] || ""}
                    onChange={e => {
                      const minute = e.target.value;
                      const hour = formData.startTime.split(":")[0] || "00";
                      handleInputChange('startTime', `${hour}:${minute}`);
                    }}
                    className="px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="" disabled>MM</option>
                    {[...Array(60).keys()].map(m => (
                      <option key={m} value={m.toString().padStart(2, '0')}>
                        {m.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-xs text-gray-500 mt-1">Allowed: 00:00 to 23:59 (24-hour format, HH:MM)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time (24-hour format)</label>
                <div className="flex gap-2">
                  <select
                    value={formData.endTime.split(":")[0] || ""}
                    onChange={e => {
                      const hour = e.target.value;
                      const minute = formData.endTime.split(":")[1] || "00";
                      handleInputChange('endTime', `${hour}:${minute}`);
                    }}
                    className="px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="" disabled>HH</option>
                    {[...Array(24).keys()].map(h => (
                      <option key={h} value={h.toString().padStart(2, '0')}>
                        {h.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                  <span className="self-center">:</span>
                  <select
                    value={formData.endTime.split(":")[1] || ""}
                    onChange={e => {
                      const minute = e.target.value;
                      const hour = formData.endTime.split(":")[0] || "00";
                      handleInputChange('endTime', `${hour}:${minute}`);
                    }}
                    className="px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="" disabled>MM</option>
                    {[...Array(60).keys()].map(m => (
                      <option key={m} value={m.toString().padStart(2, '0')}>
                        {m.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-xs text-gray-500 mt-1">Allowed: 00:00 to 23:59 (24-hour format, HH:MM)</p>
              </div>
            </div>
            
            {/* Selected Cards Display */}
            {selectedCards.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-green-800 text-sm font-medium">
                    Selected Cards ({selectedCards.length})
                  </p>
                  <button
                    onClick={clearAllSelections}
                    className="text-green-600 hover:text-green-700 text-xs font-medium"
                  >
                    Clear All
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedCards.map(cardId => {
                    const card = searchCards.find(c => c._id === cardId);
                    return card ? (
                  <div key={cardId} className="flex items-center gap-2 bg-white border border-green-200 rounded px-3 py-2">
                        <span className="text-sm font-medium text-gray-900">
                          {getCardTitle(card)}
                        </span>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          card.type === 1 
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {getCardTypeLabel(card.type)}
                        </span>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          card.classType === 'special'
                            ? 'bg-pink-100 text-pink-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {card.classType === 'special' ? 'Special' : 'Normal'}
                        </span>
                        <button
                          onClick={() => handleCardSelection(cardId)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : null;
                  })}
                  </div>
              </div>
            )}
            
            <button
              onClick={handleCreateTeacher}
              disabled={loading || selectedCards.length === 0 || !formData.fullName || !formData.email || !formData.phoneNumber || !formData.password || !formData.startTime || !formData.endTime}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Teacher...' : 'Create Teacher'}
            </button>
          </div>
        )}

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by subject, course, board, or class..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Search Cards */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <BookOpen className="w-5 h-5" />
              <span>Search Cards ({filteredCards.length})</span>
            </h2>
            <div className="flex items-center space-x-3">
              {selectedCards.length > 0 && (
                <span className="text-sm text-green-600 font-medium">
                  {selectedCards.length} selected
                </span>
              )}
              {filteredCards.length > 0 && (
                <button
                  onClick={selectAllCards}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Select All
                </button>
              )}
              {selectedCards.length > 0 && (
                <button
                  onClick={clearAllSelections}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={fetchSearchCards}
                disabled={cardsLoading}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:text-gray-400"
              >
                {cardsLoading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>
          
          {cardsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading search cards...</p>
            </div>
          ) : filteredCards.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No search cards found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCards.map((card) => (
                <div
                  key={card._id}
                  onClick={() => handleCardSelection(card._id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                    selectedCards.includes(card._id)
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-lg ${
                      card.classType === 'special' 
                        ? 'bg-purple-100 text-purple-600' 
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      <BookOpen className="w-4 h-4" />
                    </div>
                    
                    {selectedCards.includes(card._id) && (
                      <div className="bg-green-500 rounded-full p-1">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <h3 className="font-medium text-gray-900 mb-2 text-sm">
                    {getCardTitle(card)}
                  </h3>
                  
                  <div className="space-y-1">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      card.type === 1 
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {getCardTypeLabel(card.type)}
                    </span>
                    
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ml-1 ${
                      card.classType === 'special'
                        ? 'bg-pink-100 text-pink-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {card.classType === 'special' ? 'Special' : 'Normal'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminTeacherDashboard;