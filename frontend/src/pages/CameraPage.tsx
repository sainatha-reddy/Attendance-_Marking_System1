/// <reference types="vite/client" />
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Camera, ArrowLeft, RotateCcw, X, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from '../config/supabase';

// Utility: Convert base64 Data URL to File object with correct MIME
function dataURLtoFile(dataUrl: string, filename: string): File {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new File([u8arr], filename, { type: mime });
}

const CameraPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState<'present' | 'absent' | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [attendanceAllowed, setAttendanceAllowed] = useState<boolean>(true);
  const [attendanceWindowMsg, setAttendanceWindowMsg] = useState<string>('');
  const [loadingWindow, setLoadingWindow] = useState<boolean>(true);

  // Check if we're on HTTPS (required for camera access in production)
  const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';

  // Authentication check
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
  }, [user, navigate]);

  // Test camera availability
  const testCameraAvailability = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      return videoDevices.length > 0;
    } catch {
      return false;
    }
  };

  const startCamera = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if we're on HTTPS
      if (!isSecure) {
        setError('Camera access requires HTTPS. Please use a secure connection.');
        setIsLoading(false);
        return;
      }

      // Test camera availability first
      const hasCamera = await testCameraAvailability();
      if (!hasCamera) {
        setError('No camera devices found on your system.');
        setIsLoading(false);
        return;
      }

      // Stop existing stream if any
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 }
        },
        audio: false
      };

      

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      
      setStream(newStream);
      
      // Simple approach: wait and then try to set the video source
      setTimeout(() => {
       
        
        // Try to find video element
        const videoEl = document.querySelector('video');
        
        if (videoEl) {
          videoEl.srcObject = newStream;
          
          videoEl.onloadedmetadata = () => {
          };
          
          videoEl.oncanplay = () => {
          };
          
          videoEl.onerror = (e) => {
            console.error('❌ Video error:', e);
          };
        } else {
          console.error('❌ No video element found');
        }
      }, 1000); // Wait 1 second
      
    } catch (err: unknown) {
      console.error('❌ Error accessing camera:', err);
      
      let errorMessage = 'Unable to access camera. Please check your permissions and try again.';
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          errorMessage = 'Camera permission denied. Please allow camera access in your browser settings and try again.';
        } else if (err.name === 'NotFoundError') {
          errorMessage = 'No camera found on your device. Please connect a camera and try again.';
        } else if (err.name === 'NotSupportedError') {
          errorMessage = 'Camera not supported on this device or browser.';
        } else if (err.name === 'NotReadableError') {
          errorMessage = 'Camera is already in use by another application. Please close other camera apps and try again.';
        } else if (err.name === 'OverconstrainedError') {
          errorMessage = 'Camera constraints not met. Please try switching cameras.';
        } else if (err.name === 'TypeError') {
          errorMessage = 'Camera access not supported in this browser. Please use a modern browser with camera support.';
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [facingMode, stream, isSecure]);

  useEffect(() => {
    startCamera();

    // Add a timeout to detect if camera is not working
    const cameraTimeout = setTimeout(() => {
      const videoEl = document.querySelector('video');
      if (isLoading && (!stream || !videoEl || videoEl.readyState < 2)) {
        setError('Camera feed appears to be black. You can still try to capture an image or proceed without camera.');
      }
    }, 600000); // 10 second timeout

    // Monitor video element rendering
    const checkVideoElement = () => {
      const videoEl = document.querySelector('video');
      console.log('🔍 Checking video element in DOM:', !!videoEl);
      
    };

    // Check immediately and after a delay
    checkVideoElement();
    setTimeout(checkVideoElement, 5000);

    return () => {
      clearTimeout(cameraTimeout);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      // Also clear the video element's srcObject
      const videoEl = videoRef.current || document.querySelector('video');
      if (videoEl) {
        videoEl.srcObject = null;
      }
    };
  }, [facingMode]);

  const captureImage = () => {
    
    // Try to get video element from ref first
    let video = videoRef.current;
    
    // Fallback: if ref is null, try to find video element by selector
    if (!video) {
      video = document.querySelector('video');
    }
    
    if (!video) {
      console.error('❌ No video element found for capture');
      setError('Video element not found. Please refresh the page and try again.');
      return;
    }
    
    if (!canvasRef.current) {
      console.error('❌ Canvas ref is null');
      setError('Canvas element not found. Please refresh the page and try again.');
      return;
    }

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) {
      console.error('❌ Could not get canvas context');
      setError('Canvas context not available. Please refresh the page and try again.');
      return;
    }

    // Desired capture size
    const captureWidth = 640;
    const captureHeight = 480;

    // Center crop from the video
    const sx = (video.videoWidth - captureWidth) / 2;
    const sy = (video.videoHeight - captureHeight) / 2;

    canvas.width = captureWidth;
    canvas.height = captureHeight;
    context.drawImage(
      video,
      sx, sy, captureWidth, captureHeight, // source rectangle
      0, 0, captureWidth, captureHeight    // destination rectangle
    );

    // Convert to data URL
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(imageDataUrl);

    // Stop the camera stream after capturing
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  // Fallback function to proceed without camera
  const proceedWithoutCamera = () => {
    // Create a dummy image or proceed directly to backend
    const dummyImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';
    setCapturedImage(dummyImage);
  };

  const sendImageToBackend = async (imageData: string) => {
    setIsProcessing(true);
    setError(null);
    setSuccess(false);
    setAttendanceStatus(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
      // Convert data URL to File object using utility
      const file = dataURLtoFile(imageData, 'photo.jpg');

      // Create FormData and append the file and user information
      const formData = new FormData();
      formData.append('image', file);
      formData.append('user_email', user?.email || 'unknown@example.com');
      formData.append('user_name', user?.displayName || user?.email?.split('@')[0] || 'Unknown User');
      
      const backendResponse = await fetch(`${apiUrl}/api/mark-attendance`, {
        method: 'POST',
        body: formData,
        // DO NOT set Content-Type header manually!
      });

      
      if (!backendResponse.ok) {
        const errorText = await backendResponse.text();
        
        if (backendResponse.status === 500) {
          throw new Error(`Server error (500): ${errorText}`);
        } else if (backendResponse.status === 404) {
          throw new Error(`Reference image not found. Please contact admin to upload your reference image.`);
        } else if (backendResponse.status === 0) {
          throw new Error(`Network error: Unable to connect to backend server. Please check if the backend is running and the API URL is correct.`);
        } else {
          throw new Error(`HTTP ${backendResponse.status}: ${errorText}`);
        }
      }

      const data = await backendResponse.json();

      if (data.success) {
        setSuccess(true);
        setAttendanceStatus(data.status);
        
        setTimeout(() => {
          navigate('/home');
        }, 3000); // Give more time to read the status
      } else {
        setError(data.message || 'Failed to mark attendance');
        setAttendanceStatus('absent');
      }
    } catch (error) {
      let errorMessage = 'Failed to send image to server. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
        } else if (error.message.includes('Reference image not found')) {
          errorMessage = 'Reference image not found. Please contact admin to upload your reference image.';
        } else if (error.message.includes('Network error')) {
          errorMessage = 'Cannot connect to the attendance server. Please try again later.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      setAttendanceStatus('absent');
    } finally {
      setIsProcessing(false);
    }
  };

  const clearCapture = () => {
    setCapturedImage(null);
    // Restart the camera for a retake
    startCamera();
  };

  const switchCamera = () => {
    setFacingMode(current => current === 'user' ? 'environment' : 'user');
  };

  const goBack = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    navigate('/home');
  };

  // Fetch attendance window from Supabase
  useEffect(() => {
    const fetchWindow = async () => {
      setLoadingWindow(true);
      const { data } = await supabase
        .from('attendance_window')
        .select('*')
        .eq('id', 1)
        .single();
      if (data && data.start_time && data.end_time) {
        const now = new Date();
        const startTime = new Date(data.start_time);
        const endTime = new Date(data.end_time);
        if (now >= startTime && now <= endTime) {
          setAttendanceAllowed(true);
          setAttendanceWindowMsg('Attendance is open.');
        } else {
          setAttendanceAllowed(false);
          setAttendanceWindowMsg(`Attendance is only allowed from ${startTime.toLocaleString()} to ${endTime.toLocaleString()}`);
        }
      } else {
        setAttendanceAllowed(false);
        setAttendanceWindowMsg('Attendance window is not set. Please contact admin.');
      }
      setLoadingWindow(false);
    };
    fetchWindow();
  }, []);

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-md w-full text-center">
          <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
            attendanceStatus === 'present' ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {attendanceStatus === 'present' ? (
              <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
            ) : (
              <X className="w-8 h-8 sm:w-10 sm:h-10 text-red-600" />
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            {attendanceStatus === 'present' ? 'Attendance Marked!' : 'Attendance Recorded'}
          </h2>
          <div className={`text-2xl sm:text-3xl font-bold mb-4 ${
            attendanceStatus === 'present' ? 'text-green-600' : 'text-red-600'
          }`}>
            {attendanceStatus?.toUpperCase()}
          </div>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">
            {attendanceStatus === 'present' 
              ? 'Your attendance has been successfully recorded as PRESENT.'
              : 'Your attendance has been recorded as ABSENT due to face mismatch.'
            }
          </p>
          <div className="animate-pulse">
            <p className="text-sm text-gray-500">Redirecting to home page...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Camera Access Required</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          
          {!isSecure && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Camera access requires HTTPS. Your current connection is not secure.
              </p>
            </div>
          )}
          
          <div className="space-y-3">
            <button
              onClick={startCamera}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={goBack}
              className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!attendanceAllowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Attendance Not Allowed</h2>
          <p className="text-gray-700 mb-4">{attendanceWindowMsg}</p>
          <button
            onClick={() => navigate('/home')}
            className="mt-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-600 transition-all duration-200"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (loadingWindow) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Checking Attendance Window...</h2>
          <p className="text-gray-700 mb-4">Please wait while we check if attendance is open.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex justify-between items-center p-4">
          <button
            onClick={goBack}
            className="flex items-center justify-center w-12 h-12 sm:w-10 sm:h-10 bg-black/20 backdrop-blur-sm rounded-full text-white hover:bg-black/40 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="text-center">
            <h1 className="text-white font-semibold text-lg sm:text-xl">Mark Attendance</h1>
            <p className="text-white/70 text-xs sm:text-sm">Position your face in the frame</p>
          </div>
          
          <button
            onClick={switchCamera}
            className="flex items-center justify-center w-12 h-12 sm:w-10 sm:h-10 bg-black/20 backdrop-blur-sm rounded-full text-white hover:bg-black/40 transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Camera View */}
      <div className="relative h-screen flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-white animate-spin mx-auto mb-4" />
              <p className="text-white">Loading camera...</p>
            </div>
          </div>
        ) : isProcessing ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Processing Attendance</h2>
              <p className="text-gray-300 max-w-md">
                Processing your image and marking attendance. Please wait...
              </p>
              <div className="mt-6 space-y-2">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span>Processing face recognition...</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Sending to server...</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  <span>Marking attendance...</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 relative overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              
              {/* Fallback Button for Camera Issues */}
              {error && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                  <button
                    onClick={proceedWithoutCamera}
                    className="bg-yellow-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-yellow-700 transition-colors shadow-lg"
                  >
                    Camera Not Working? Click Here
                  </button>
                </div>
              )}
              
              {/* Capture Button */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                <button
                  onClick={captureImage}
                  className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors relative"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </button>
              </div>
            </div>

            {/* Captured Image Display */}
            {capturedImage && (
              <div className="absolute inset-0 bg-black z-10 flex flex-col">
                <div className="flex-1 flex items-center justify-center p-4">
                  <img
                    src={capturedImage}
                    alt="Captured"
                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                  />
                </div>
                
                {/* Action Buttons */}
                <div className="flex justify-center space-x-4 p-6 bg-gradient-to-t from-black/80 to-transparent">
                  <button
                    onClick={clearCapture}
                    className="flex items-center justify-center w-12 h-12 bg-red-600 rounded-full text-white hover:bg-red-700 transition-colors"
                    aria-label="Retake Photo"
                  >
                    <X className="w-6 h-6" />
                  </button>
                  
                  <button
                    onClick={() => sendImageToBackend(capturedImage)}
                    className="flex items-center justify-center w-12 h-12 bg-green-600 rounded-full text-white hover:bg-green-700 transition-colors"
                    aria-label="Confirm Photo"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Hidden canvas for image capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraPage;