import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { doc, setDoc, getDocs, collection } from 'firebase/firestore';
import { supabase } from '../config/supabase';
import Notification from '../components/Notification';

const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uniqueId, setUniqueId] = useState('');

  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    isVisible: boolean;
  }>({
    message: '',
    type: 'info',
    isVisible: false
  });

  // Attendance window state (now from Supabase)
  const [attendanceStart, setAttendanceStart] = useState<string>('');
  const [attendanceEnd, setAttendanceEnd] = useState<string>('');
  const [loadingWindow, setLoadingWindow] = useState<boolean>(true);

  // Fetch attendance window from Supabase on mount
  React.useEffect(() => {
    const fetchWindow = async () => {
      setLoadingWindow(true);
      const { data } = await supabase
        .from('attendance_window')
        .select('*')
        .eq('id', 1)
        .single();
      if (data) {
        setAttendanceStart(data.start || '');
        setAttendanceEnd(data.end || '');
      }
      setLoadingWindow(false);
    };
    fetchWindow();
  }, []);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    setNotification({ message, type, isVisible: true });
    setTimeout(() => setNotification(prev => ({ ...prev, isVisible: false })), 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !uniqueId.trim()) {
      showNotification('Please provide a roll number and image', 'error');
      return;
    }

    setUploading(true);
    try {
      
      // Check if the uniqueId already exists in Firestore
      const existingDoc = await getDocs(collection(db, 'images'));
      if (existingDoc.docs.some(doc => doc.id === uniqueId)) {
        showNotification('This roll number already exists. Please use a different one.', 'error');
        setUploading(false);
        return;
      }
      
      const fileExtension = selectedFile.name.split('.').pop();
      const supabasePath = `images/${uniqueId}.${fileExtension}`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('attendance-images')
        .upload(supabasePath, selectedFile);

      if (uploadError) {
        throw new Error(`Supabase upload error: ${uploadError.message}`);
      }

      // Get public URL from Supabase
      const { data: urlData } = supabase.storage
        .from('attendance-images')
        .getPublicUrl(supabasePath);

      const publicUrl = urlData.publicUrl;
      
      // Store metadata in Firestore
      await setDoc(doc(db, 'images', uniqueId), {
        url: publicUrl,
        name: selectedFile.name,
        uploadedAt: new Date(),
        uploadedBy: user?.email || 'Unknown',
        supabasePath: supabasePath
      });

      showNotification('Image uploaded successfully!', 'success');
      setSelectedFile(null);
      setUniqueId('');
      
    } catch (error) {
      let errorMessage = 'Upload failed: ';
      
      if (error instanceof Error) {
        if (error.message.includes('Supabase upload error')) {
          errorMessage += error.message;
        } else {
          errorMessage += error.message;
        }
      } else {
        errorMessage += 'An unexpected error occurred.';
      }
      
      showNotification(errorMessage, 'error');
    } finally {
      setUploading(false);
    }
  };

  // Save attendance window to Supabase
  const handleAttendanceWindowSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attendanceStart || !attendanceEnd) {
      showNotification('Please set both start and end time.', 'error');
      return;
    }
    const { error } = await supabase
      .from('attendance_window')
      .upsert([{ id: 1, start: attendanceStart, end: attendanceEnd }]);
    if (error) {
      showNotification('Failed to update attendance window.', 'error');
    } else {
      showNotification('Attendance window updated!', 'success');
    }
  };

  // Helper to clear window
  const clearAttendanceWindow = async () => {
    setAttendanceStart('');
    setAttendanceEnd('');
    await supabase.from('attendance_window').upsert([{ id: 1, start: '', end: '' }]);
    showNotification('Attendance window cleared.', 'info');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={() => setNotification(prev => ({ ...prev, isVisible: false }))}
      />

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-gradient-to-r from-red-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-gray-500">Reference Image Upload</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/home')}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 font-medium"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Upload Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Upload Reference Image
          </h2>
          
          <form onSubmit={handleUpload} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Roll Number *
                </label>
                <input
                  type="text"
                  value={uniqueId}
                  onChange={e => setUniqueId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter roll number"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reference Image *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={uploading}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Upload Reference Image'}
              </button>
            </div>
          </form>

          {/* Instructions */}
          <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">Instructions</h3>
            <ul className="space-y-2 text-sm text-blue-700">
              <li>• Upload a clear, front-facing photo of the student</li>
              <li>• Use the student's roll number as the unique identifier</li>
              <li>• Each roll number can only have one reference image</li>
              <li>• Supported formats: JPG, PNG, GIF</li>
              <li>• Image will be used for attendance verification</li>
            </ul>
          </div>
        </div>

        {/* Attendance Window Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Set Attendance Window</h2>
          {loadingWindow ? (
            <div className="text-gray-500">Loading attendance window...</div>
          ) : (
            <form onSubmit={handleAttendanceWindowSave} className="space-y-4 md:flex md:space-x-6 md:space-y-0 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date & Time *</label>
                <input
                  type="datetime-local"
                  value={attendanceStart}
                  onChange={e => setAttendanceStart(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date & Time *</label>
                <input
                  type="datetime-local"
                  value={attendanceEnd}
                  onChange={e => setAttendanceEnd(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-200"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={clearAttendanceWindow}
                  className="bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-300 transition-all duration-200"
                >
                  Clear
                </button>
              </div>
            </form>
          )}
          <div className="mt-4 text-sm text-gray-600">
            {attendanceStart && attendanceEnd ? (
              <>
                <span className="font-semibold text-blue-700">Attendance allowed from:</span> {new Date(attendanceStart).toLocaleString()} <span className="font-semibold text-blue-700">to</span> {new Date(attendanceEnd).toLocaleString()}
              </>
            ) : (
              <span className="text-red-500">Attendance window not set.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage; 