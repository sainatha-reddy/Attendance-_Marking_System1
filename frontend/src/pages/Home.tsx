import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Notification from '../components/Notification';

export default function Home() {
  const { user, logout, signInWithGoogle } = useAuth();
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
    } catch {
      // Handle logout error silently
    }
  };

  const handleSignIn = async () => {
    await signInWithGoogle();
    navigate('/login');
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
    return email.includes('cs23i1010') || email.includes('raghavans') || email.includes('admin') || email.includes('cs23i1034');
  };

  useEffect(() => {
    // Stop all video streams when Home mounts
    if (navigator.mediaDevices && 'getUserMedia' in navigator.mediaDevices) {
      // Find all video elements and stop their streams
      const videos = document.querySelectorAll('video');
      videos.forEach(video => {
        if (video.srcObject) {
          const tracks = (video.srcObject as MediaStream).getTracks();
          tracks.forEach(track => track.stop());
          video.srcObject = null;
        }
      });
    }
  }, []);

  // Authentication check
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
  }, [user, navigate]);

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
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  IIITDM AttendanceSync
                </h1>
                <p className="text-xs sm:text-sm text-gray-500">Smart Attendance Management</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              {user ? (
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                    <span>Welcome,</span>
                    <span className="font-medium text-gray-800">{getUserName()}</span>
                    {isAdmin() && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Admin
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 sm:px-4 sm:py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleSignIn}
                  className="px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {getUserName()}!
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* Mark Attendance Card - Enhanced */}
          <div 
            onClick={handleMarkAttendance}
            className="group relative bg-gradient-to-br from-blue-50 to-indigo-100 p-6 sm:p-8 rounded-3xl shadow-xl cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-2xl border border-blue-200/50 hover:bg-gradient-to-br hover:from-blue-100 hover:to-indigo-200"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="h-14 w-14 sm:h-16 sm:w-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="h-7 w-7 sm:h-8 sm:w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <span className="text-blue-600 text-xs sm:text-sm font-semibold px-2 sm:px-3 py-1 bg-blue-100 rounded-full">
                  Primary
                </span>
              </div>
              
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
                Mark Attendance
              </h3>
              <p className="text-gray-600 text-sm sm:text-base mb-6">
                Use facial recognition to mark your attendance quickly and securely
              </p>
              
              <div className="flex items-center text-blue-600 font-semibold text-sm sm:text-base group-hover:translate-x-1 transition-transform duration-300">
                Start Now
                <svg className="w-4 h-4 sm:w-5 sm:h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Admin Access Card - Only for admin users */}
          {isAdmin() && (
            <div 
              onClick={handleAdminAccess}
              className="group relative bg-gradient-to-br from-purple-50 to-pink-100 p-6 sm:p-8 rounded-3xl shadow-xl cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-2xl border border-purple-200/50 hover:bg-gradient-to-br hover:from-purple-100 hover:to-pink-200"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="h-14 w-14 sm:h-16 sm:w-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <svg className="h-7 w-7 sm:h-8 sm:w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <span className="text-purple-600 text-xs sm:text-sm font-semibold px-2 sm:px-3 py-1 bg-purple-100 rounded-full">
                    Admin
                  </span>
                </div>
                
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
                  Admin Panel
                </h3>
                <p className="text-gray-600 text-sm sm:text-base mb-6">
                  Manage users, view attendance records, and upload reference images
                </p>
                
                <div className="flex items-center text-purple-600 font-semibold text-sm sm:text-base group-hover:translate-x-1 transition-transform duration-300">
                  Access Panel
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats Section
        <div className="mt-12 sm:mt-16">
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-xl border border-white/20">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 text-center">
              System Status
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="text-center p-4 bg-green-50 rounded-2xl border border-green-200">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-800 text-sm sm:text-base">System Online</h4>
                <p className="text-green-600 text-xs sm:text-sm font-medium">Ready for use</p>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-2xl border border-blue-200">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-800 text-sm sm:text-base">Active Users</h4>
                <p className="text-blue-600 text-xs sm:text-sm font-medium">Real-time tracking</p>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-2xl border border-purple-200">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-800 text-sm sm:text-base">Fast Processing</h4>
                <p className="text-purple-600 text-xs sm:text-sm font-medium">AI-powered</p>
              </div>
            </div>
          </div>
        </div> */}
      </main>
    </div>
  );
} 
