import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Notification from '../components/Notification';

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    isVisible: boolean;
  }>({
    message: '',
    type: 'info',
    isVisible: false
  });

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  };

  const handleMarkAttendance = async () => {
    // Navigate to camera page for attendance marking
    navigate('/camera');
  };

  const handleAdminAccess = () => {
    // Navigate to admin page
    navigate('/admin');
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Extract user info
  const getUserName = () => {
    if (user?.displayName) return user.displayName;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  const getUserRole = () => {
    if (user?.email) {
      const email = user.email.toLowerCase();
      if (email.includes('faculty') || email.includes('prof') || email.includes('dr.')) {
        return 'Faculty';
      } else if (email.includes('student') || /\d{4}[a-z]{2}\d{3}/.test(email)) {
        return 'Student';
      } else {
        return 'Staff';
      }
    }
    return 'Member';
  };

  // Check if user is admin
  const isAdmin = () => {
    if (!user?.email) return false;
    const email = user.email.toLowerCase();
    return email.includes('admin') || email.includes('faculty') || email.includes('prof') || email.includes('dr.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Notification Component */}
      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />

      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  IIITDM AttendanceSync
                </h1>
                <p className="text-sm text-gray-500">Smart Attendance Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-700">{getUserName()}</p>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">{getUserRole()}</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    IIITDM
                  </span>
                </div>
              </div>
              <div className="h-10 w-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {getUserName().charAt(0).toUpperCase()}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {getUserName()}!
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Manage your attendance with our intelligent facial recognition system
          </p>
          <div className="mt-4 inline-flex items-center px-4 py-2 rounded-full bg-green-100 border border-green-200">
            <svg className="w-4 h-4 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-green-800">
              Authenticated as IIITDM {getUserRole()}
            </span>
          </div>
        </div>
        
        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {/* Mark Attendance Card - Enhanced */}
          <div 
            onClick={handleMarkAttendance}
            className="group relative bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-3xl shadow-xl cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-2xl border border-blue-200/50 hover:bg-gradient-to-br hover:from-blue-100 hover:to-indigo-200"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="h-16 w-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <span className="text-blue-600 text-sm font-semibold px-3 py-1 bg-blue-100 rounded-full">
                  Primary
                </span>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                Mark Attendance
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Use advanced facial recognition to instantly record your attendance with high accuracy and security.
              </p>
              
              <div className="mt-6 flex items-center text-blue-600 font-medium group-hover:translate-x-1 transition-transform duration-200">
                <span>Click to start</span>
                <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Admin Access Card - Only for admin users */}
          {isAdmin() && (
            <div 
              onClick={handleAdminAccess}
              className="group relative bg-gradient-to-br from-red-50 to-pink-100 p-8 rounded-3xl shadow-xl cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-2xl border border-red-200/50 hover:bg-gradient-to-br hover:from-red-100 hover:to-pink-200"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-400/10 to-pink-400/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="h-16 w-16 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                    </svg>
                  </div>
                  <span className="text-red-600 text-sm font-semibold px-3 py-1 bg-red-100 rounded-full">
                    Admin
                  </span>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  Admin Dashboard
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Manage images, upload new reference photos, and oversee the attendance system with full administrative controls.
                </p>
                
                <div className="mt-6 flex items-center text-red-600 font-medium group-hover:translate-x-1 transition-transform duration-200">
                  <span>Access admin panel</span>
                  <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          )}
          
          {/* View History Card */}
          <div className="group bg-gradient-to-br from-green-50 to-emerald-100 p-8 rounded-3xl shadow-xl cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-2xl border border-green-200/50 hover:bg-gradient-to-br hover:from-green-100 hover:to-emerald-200">
            <div className="flex items-center justify-between mb-6">
              <div className="h-16 w-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="text-green-600 text-sm font-semibold px-3 py-1 bg-green-100 rounded-full">
                Coming Soon
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">View History</h3>
            <p className="text-gray-600 leading-relaxed">
              Access your complete attendance history with detailed analytics, patterns, and exportable reports.
            </p>
            <div className="mt-6 flex items-center text-green-600 font-medium group-hover:translate-x-1 transition-transform duration-200">
              <span>Explore records</span>
              <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
          
          {/* Reports Card */}
          <div className="group bg-gradient-to-br from-purple-50 to-violet-100 p-8 rounded-3xl shadow-xl cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-2xl border border-purple-200/50 hover:bg-gradient-to-br hover:from-purple-100 hover:to-violet-200">
            <div className="flex items-center justify-between mb-6">
              <div className="h-16 w-16 bg-gradient-to-r from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <span className="text-purple-600 text-sm font-semibold px-3 py-1 bg-purple-100 rounded-full">
                Coming Soon
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Reports</h3>
            <p className="text-gray-600 leading-relaxed">
              Generate comprehensive attendance reports with insights, trends, and customizable date ranges.
            </p>
            <div className="mt-6 flex items-center text-purple-600 font-medium group-hover:translate-x-1 transition-transform duration-200">
              <span>Generate reports</span>
              <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-8 text-center">Quick Stats</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl">
              <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-2xl font-bold text-gray-800">0</div>
              <div className="text-sm text-gray-600">Total Sessions</div>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl">
              <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-2xl font-bold text-gray-800">--</div>
              <div className="text-sm text-gray-600">Attendance Rate</div>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl">
              <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="text-2xl font-bold text-gray-800">--</div>
              <div className="text-sm text-gray-600">This Month</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 