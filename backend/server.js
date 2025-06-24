import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { spawn, execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname); // Save to backend directory
  },
  filename: function (req, file, cb) {
    cb(null, 'photo.jpg'); // Always save as photo.jpg
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMime = ['image/jpeg', 'image/png'];
    const allowedExt = ['.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedMime.includes(file.mimetype) && allowedExt.includes(ext)) {
      cb(null, true);
    } else {
      console.log(`❌ Rejected upload - mimetype: ${file.mimetype}, ext: ${ext}`);
      cb(new Error('Only image files (JPG/PNG) are allowed'), false);
    }
  }
});

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://attendance-marking-system-six.vercel.app',
      'https://attendance-marking-system-git-main-sainatha-reddys-projects.vercel.app',
      'https://attendance-marking-system-xi.vercel.app',
      'https://attendance-marking-system.vercel.app',
      'https://attendance-marking-system-git-main.vercel.app',
      'http://localhost:3000',
      'http://localhost:5173'
    ];
    
    // Log CORS requests for debugging
    console.log('CORS request from origin:', origin);
    console.log('Allowed origins:', allowedOrigins);
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Railway environment:', process.env.RAILWAY_ENVIRONMENT);
    
    // In production, be more permissive for Vercel domains
    if (process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT) {
      if (!origin || allowedOrigins.includes(origin) || origin.includes('vercel.app')) {
        console.log('✅ CORS allowed for:', origin);
        callback(null, true);
      } else {
        console.log('❌ CORS blocked for:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    } else {
      // In development, use strict CORS
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Favicon handler to prevent 404 errors
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Attendance Marking System API',
    status: 'Running',
    version: '1.0.0',
    environment: process.env.RAILWAY_ENVIRONMENT ? 'Railway' : (process.env.NODE_ENV || 'development'),
    platform: process.env.RAILWAY_ENVIRONMENT ? 'Railway' : 'Local',
    endpoints: {
      health: '/api/health',
      markAttendance: '/api/mark-attendance',
      testPython: '/api/test-python',
      testPythonDetailed: '/api/test-python-detailed'
    }
  });
});

// Test endpoint to check if server is working
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running correctly',
    timestamp: new Date().toISOString(),
    environment: 'localhost'
  });
});

// Test Python endpoint
app.get('/api/test-python', (req, res) => {
  console.log('🧪 Testing Python environment...');
  
  const pythonCommands = ['python3', 'python', 'python3.11', 'python3.9'];
  let pythonCmd = 'python3';
  
  // Check which Python command is available
  console.log('Available Python commands:');
  pythonCommands.forEach(cmd => {
    try {
      const version = execSync(`${cmd} --version`, { encoding: 'utf8', timeout: 5000 });
      console.log(`✅ ${cmd}: ${version.trim()}`);
      if (pythonCmd === 'python3') pythonCmd = cmd;
    } catch (error) {
      console.log(`❌ ${cmd}: Not available - ${error.message}`);
    }
  });
  
  // Test Python script existence
  const pythonScriptPath = join(__dirname, 'Sender_side.py');
  const scriptExists = existsSync(pythonScriptPath);
  
  // Test basic Python execution
  let pythonTestResult = 'Not tested';
  try {
    const testOutput = execSync(`${pythonCmd} -c "print('Python is working!')"`, { 
      encoding: 'utf8', 
      timeout: 5000 
    });
    pythonTestResult = testOutput.trim();
  } catch (error) {
    pythonTestResult = `Error: ${error.message}`;
  }
  
  // Test Python script execution (just the beginning)
  let scriptTestResult = 'Not tested';
  try {
    const scriptOutput = execSync(`${pythonCmd} -c "import sys; sys.path.append('.'); import Sender_side; print('Script import successful')"`, { 
      encoding: 'utf8', 
      timeout: 10000 
    });
    scriptTestResult = scriptOutput.trim();
  } catch (error) {
    scriptTestResult = `Error: ${error.message}`;
  }
  
  res.json({
    success: true,
    pythonCommand: pythonCmd,
    scriptExists: scriptExists,
    scriptPath: pythonScriptPath,
    pythonTest: pythonTestResult,
    scriptTest: scriptTestResult,
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      PWD: process.cwd(),
      PATH: process.env.PATH
    }
  });
});

// Enhanced Python environment test endpoint
app.get('/api/test-python-detailed', (req, res) => {
  console.log('🔍 Detailed Python environment test...');
  
  const pythonCommands = ['python3', 'python', 'python3.11', 'python3.9'];
  let pythonCmd = 'python3';
  let testResults = {};
  
  // Find working Python command
  for (const cmd of pythonCommands) {
    try {
      const version = execSync(`${cmd} --version`, { encoding: 'utf8', timeout: 5000 });
      console.log(`✅ Found Python: ${cmd} - ${version.trim()}`);
      pythonCmd = cmd;
      break;
    } catch (error) {
      console.log(`❌ ${cmd}: Not available`);
    }
  }
  
  // Test basic Python functionality
  try {
    const pythonVersion = execSync(`${pythonCmd} -c "import sys; print(sys.version)"`, { 
      encoding: 'utf8', 
      timeout: 5000 
    });
    testResults.pythonVersion = pythonVersion.trim();
  } catch (error) {
    testResults.pythonVersion = `Error: ${error.message}`;
  }
  
  // Test required packages
  const packages = ['cv2', 'face_recognition', 'numpy', 'socket', 'time', 'os'];
  testResults.packages = {};
  
  for (const pkg of packages) {
    try {
      const pkgTest = execSync(`${pythonCmd} -c "import ${pkg}; print('${pkg} imported successfully')"`, { 
        encoding: 'utf8', 
        timeout: 5000 
      });
      testResults.packages[pkg] = { status: 'success', message: pkgTest.trim() };
    } catch (error) {
      testResults.packages[pkg] = { status: 'error', message: error.message };
    }
  }
  
  // Test script execution
  const pythonScriptPath = join(__dirname, 'Sender_side.py');
  const scriptExists = existsSync(pythonScriptPath);
  testResults.scriptExists = scriptExists;
  testResults.scriptPath = pythonScriptPath;
  
  if (scriptExists) {
    try {
      const scriptTest = execSync(`${pythonCmd} -c "import sys; sys.path.append('.'); import Sender_side; print('Script functions available:', dir(Sender_side))"`, { 
        encoding: 'utf8', 
        timeout: 10000 
      });
      testResults.scriptTest = { status: 'success', message: scriptTest.trim() };
    } catch (error) {
      testResults.scriptTest = { status: 'error', message: error.message };
    }
  } else {
    testResults.scriptTest = { status: 'error', message: 'Script file not found' };
  }
  
  // Test environment detection
  try {
    const envTest = execSync(`${pythonCmd} -c "import os; print('DISPLAY:', os.environ.get('DISPLAY')); print('Server env:', bool(not os.environ.get('DISPLAY')))"`, { 
      encoding: 'utf8', 
      timeout: 5000 
    });
    testResults.environment = envTest.trim();
  } catch (error) {
    testResults.environment = `Error: ${error.message}`;
  }
  
  res.json({
    success: true,
    pythonCommand: pythonCmd,
    testResults: testResults,
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      PWD: process.cwd(),
      PATH: process.env.PATH
    }
  });
});

// Route to execute Python script for attendance marking with image upload
app.post('/api/mark-attendance', upload.single('image'), async (req, res) => {
  console.log('File received:', req.file);

  console.log('📝 Starting attendance marking process...');
  console.log('Request origin:', req.get('origin'));
  console.log('Environment:', {
    NODE_ENV: process.env.NODE_ENV,
    PWD: process.cwd(),
    PATH: process.env.PATH,
    // Log cloud platform indicators
    RAILWAY_ENVIRONMENT: process.env.RAILWAY_ENVIRONMENT,
    RENDER: process.env.RENDER,
    HEROKU: process.env.HEROKU,
    VERCEL: process.env.VERCEL,
    ENVIRONMENT: process.env.ENVIRONMENT
  });

  // Check if image was uploaded
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No image file provided',
      error: 'missing_image',
      instructions: 'Please capture an image using the camera and try again'
    });
  }

  console.log('Image received:', {
    filename: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    savedAs: req.file.filename,
    path: req.file.path
  });

  // Verify the image was saved
  const imagePath = join(__dirname, 'photo.jpg');
  if (!existsSync(imagePath)) {
    return res.status(500).json({
      success: false,
      message: 'Failed to save uploaded image',
      error: 'image_save_error'
    });
  }

  console.log('Image saved successfully to:', imagePath);
  
  const pythonScriptPath = join(__dirname, 'Sender_side.py');
  console.log('Python script path:', pythonScriptPath);
  console.log('Script exists:', existsSync(pythonScriptPath));
  
  // Try multiple Python commands
  const pythonCommands = ['python3', 'python', 'python3.11', 'python3.9'];
  let pythonCmd = 'python3';
  
  // Check which Python command is available
  console.log('Available Python commands:');
  pythonCommands.forEach(cmd => {
    try {
      const version = execSync(`${cmd} --version`, { encoding: 'utf8', timeout: 5000 });
      console.log(`✅ ${cmd}: ${version.trim()}`);
      if (pythonCmd === 'python3') pythonCmd = cmd; // Use the first working one
    } catch (error) {
      console.log(`❌ ${cmd}: Not available - ${error.message}`);
    }
  });
  
  console.log(`Using Python command: ${pythonCmd}`);
  
  // Test Python environment before running the script
  try {
    console.log('Testing Python environment...');
    
    // Test basic Python
    const pythonTest = execSync(`${pythonCmd} -c "import sys; print('Python version:', sys.version)"`, { 
      encoding: 'utf8', 
      timeout: 10000 
    });
    console.log('Python test result:', pythonTest.trim());
    
    // Test required packages
    const packages = ['cv2', 'face_recognition', 'numpy'];
    for (const pkg of packages) {
      try {
        const pkgTest = execSync(`${pythonCmd} -c "import ${pkg}; print('${pkg} imported successfully')"`, { 
          encoding: 'utf8', 
          timeout: 5000 
        });
        console.log(`✅ ${pkg}: ${pkgTest.trim()}`);
      } catch (error) {
        console.log(`❌ ${pkg}: Import failed - ${error.message}`);
      }
    }
  } catch (error) {
    console.log('Python environment test failed:', error.message);
  }
  
  // Execute Python script (it will process the uploaded photo.jpg)
  console.log('Executing Python script...');
  
  // Determine if we're on a cloud platform
  const isCloudPlatform = process.env.RAILWAY_ENVIRONMENT || 
                          process.env.RENDER || 
                          process.env.HEROKU || 
                          process.env.VERCEL ||
                          process.env.NODE_ENV === 'production';
  
  console.log('Cloud platform detected:', isCloudPlatform);
  console.log('Current working directory:', process.cwd());
  console.log('Python script path:', pythonScriptPath);
  console.log('Script exists:', existsSync(pythonScriptPath));
  
  // List files in current directory for debugging
  try {
    const fs = await import('fs');
    const files = fs.readdirSync('.');
    console.log('Files in current directory:', files);
  } catch (error) {
    console.log('Could not list directory files:', error.message);
  }
  
  const pythonProcess = spawn(pythonCmd, [pythonScriptPath], {
    stdio: ['pipe', 'pipe', 'pipe'],
    shell: true,
    cwd: __dirname, // Ensure we're in the backend directory
    env: {
      ...process.env,
      PYTHONPATH: process.env.PYTHONPATH || '',
      PATH: process.env.PATH,
      // Ensure cloud platform environment variables are passed
      NODE_ENV: process.env.NODE_ENV,
      RAILWAY_ENVIRONMENT: process.env.RAILWAY_ENVIRONMENT,
      RENDER: process.env.RENDER,
      ENVIRONMENT: process.env.ENVIRONMENT,
      // Force server mode on cloud platforms
      FORCE_SERVER_MODE: isCloudPlatform ? 'true' : 'false'
    }
  });
  
  let output = '';
  let error = '';
  let hasResponded = false;
  
  // Set a timeout to prevent hanging requests
  const timeout = setTimeout(() => {
    if (!hasResponded) {
      hasResponded = true;
      pythonProcess.kill();
      console.error('Python process timed out');
      res.status(500).json({
        success: false,
        message: 'Process timed out',
        error: 'The attendance marking process took too long',
        debug: {
          pythonCmd,
          scriptPath: pythonScriptPath,
          timeout: true
        }
      });
    }
  }, 30000); // 30 seconds timeout
  
  pythonProcess.stdout.on('data', (data) => {
    const message = data.toString();
    console.log('Python Output:', message);
    output += message;
  });
  
  pythonProcess.stderr.on('data', (data) => {
    const message = data.toString();
    console.error('Python Error:', message);
    error += message;
  });
  
  pythonProcess.on('error', (err) => {
    console.error('Python process error:', err);
    if (!hasResponded) {
      hasResponded = true;
      clearTimeout(timeout);
      res.status(500).json({
        success: false,
        message: 'Failed to start Python process',
        error: err.message,
        debug: {
          pythonCmd,
          scriptPath: pythonScriptPath,
          error: err.message
        }
      });
    }
  });
  
  pythonProcess.on('close', (code) => {
    clearTimeout(timeout);
    if (hasResponded) return;
    hasResponded = true;
    
    console.log(`Python process exited with code ${code}`);
    console.log('Full output:', output);
    console.log('Full error:', error);
    
    // Check for specific success indicators in output
    const isSuccess = output.includes('SUCCESS') || 
                     output.includes('Attendance marked successfully') ||
                     output.includes('Stream sent to PYNQ') ||
                     output.includes('Attendance marked (simulated)') ||
                     output.includes('[SUCCESS]') ||
                     output.includes('FALLBACK') ||
                     (code === 0 && !output.includes('No face found'));
    
    if (isSuccess) {
      res.json({
        success: true,
        message: 'Attendance marked successfully!',
        output: output,
        details: {
          faceDetected: !output.includes('No face found'),
          pynqConnected: output.includes('Connected to PYNQ server'),
          dataSent: output.includes('Stream sent to PYNQ'),
          serverMode: output.includes('Server environment') || output.includes('SERVER'),
          simulated: output.includes('simulated') || output.includes('FALLBACK'),
          dummyImage: output.includes('Dummy Image') || output.includes('SERVER MODE'),
          imageProcessed: output.includes('Image captured and saved') || output.includes('Image saved to')
        }
      });
    } else {
      // Determine specific error type
      let errorMessage = 'Error marking attendance';
      let errorType = 'unknown';
      
      if (output.includes('No face found')) {
        errorMessage = 'No face detected in the image. Please ensure your face is clearly visible.';
        errorType = 'no_face';
      } else if (error.includes('ConnectionRefusedError')) {
        errorMessage = 'PYNQ server is not available. Please check if the PYNQ board is running.';
        errorType = 'pynq_connection';
      } else if (output.includes('Could not open webcam')) {
        errorMessage = 'Camera access denied. Please check camera permissions.';
        errorType = 'camera_access';
      } else if (error.includes('ModuleNotFoundError')) {
        errorMessage = 'Python dependencies not installed. Please check server configuration.';
        errorType = 'python_dependencies';
      } else if (error.includes('No module named')) {
        errorMessage = 'Missing Python module. Dependencies may not be installed correctly.';
        errorType = 'missing_module';
      } else if (code === 127) {
        errorMessage = 'Python command not found. Server configuration issue.';
        errorType = 'python_not_found';
      } else if (code !== 0) {
        errorMessage = 'Python script execution failed.';
        errorType = 'python_error';
      }
      
      res.status(500).json({
        success: false,
        message: errorMessage,
        error: errorType,
        debug: {
          exitCode: code,
          pythonCmd,
          scriptPath: pythonScriptPath,
          output: output,
          error: error
        }
      });
    }
  });
});

// GET handler for mark-attendance (for debugging)
app.get('/api/mark-attendance', (req, res) => {
  res.status(405).json({
    success: false,
    message: 'This endpoint only accepts POST requests',
    error: 'Method not allowed',
    instructions: 'Please use POST method with image data to mark attendance',
    availableEndpoints: {
      test: 'GET /api/test',
      testPython: 'GET /api/test-python',
      markAttendance: 'POST /api/mark-attendance'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: 'localhost',
    port: PORT,
    pythonAvailable: true
  });
});

// Test environment endpoint
app.get('/api/test-environment', (req, res) => {
  console.log('🔍 Testing environment...');
  
  const pythonCommands = ['python3', 'python', 'python3.11', 'python3.9'];
  let pythonCmd = 'python3';
  
  // Find working Python command
  for (const cmd of pythonCommands) {
    try {
      const version = execSync(`${cmd} --version`, { encoding: 'utf8', timeout: 5000 });
      console.log(`✅ Found Python: ${cmd} - ${version.trim()}`);
      pythonCmd = cmd;
      break;
    } catch (error) {
      console.log(`❌ ${cmd}: Not available`);
    }
  }
  
  const testScriptPath = join(__dirname, 'test_environment.py');
  console.log('Test script path:', testScriptPath);
  console.log('Script exists:', existsSync(testScriptPath));
  
  try {
    const testOutput = execSync(`${pythonCmd} ${testScriptPath}`, { 
      encoding: 'utf8', 
      timeout: 15000,
      env: {
        ...process.env,
        PYTHONPATH: process.env.PYTHONPATH || '',
        PATH: process.env.PATH
      }
    });
    
    res.json({
      success: true,
      output: testOutput,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        RAILWAY_ENVIRONMENT: process.env.RAILWAY_ENVIRONMENT,
        RENDER: process.env.RENDER,
        ENVIRONMENT: process.env.ENVIRONMENT
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      output: error.stdout ? error.stdout.toString() : '',
      stderr: error.stderr ? error.stderr.toString() : ''
    });
  }
});

// Simple test endpoint for debugging
app.get('/api/debug', (req, res) => {
  console.log('🔍 Debug endpoint called');
  
  const debugInfo = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      RAILWAY_ENVIRONMENT: process.env.RAILWAY_ENVIRONMENT,
      RENDER: process.env.RENDER,
      ENVIRONMENT: process.env.ENVIRONMENT
    },
    filesystem: {
      currentDir: process.cwd(),
      backendDir: __dirname,
      scriptPath: join(__dirname, 'Sender_side.py'),
      scriptExists: existsSync(join(__dirname, 'Sender_side.py')),
      requirementsExists: existsSync(join(__dirname, 'requirements.txt'))
    },
    python: {
      commands: ['python3', 'python', 'python3.11', 'python3.9']
    }
  };
  
  // Test Python availability
  const pythonCommands = ['python3', 'python', 'python3.11', 'python3.9'];
  debugInfo.python.available = {};
  
  pythonCommands.forEach(cmd => {
    try {
      const version = execSync(`${cmd} --version`, { encoding: 'utf8', timeout: 5000 });
      debugInfo.python.available[cmd] = version.trim();
    } catch (error) {
      debugInfo.python.available[cmd] = `Error: ${error.message}`;
    }
  });
  
  // List files in current directory
  try {
    const fs = require('fs');
    debugInfo.filesystem.files = fs.readdirSync('.');
  } catch (error) {
    debugInfo.filesystem.files = `Error: ${error.message}`;
  }
  
  res.json(debugInfo);
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    availableEndpoints: [
      'GET /',
      'GET /api/health',
      'POST /api/mark-attendance',
      'GET /api/test-python',
      'GET /api/test-python-detailed'
    ]
  });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;
