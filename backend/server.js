import express from 'express';
import cors from 'cors';
import { spawn, execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration for localhost only
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Handle preflight requests for all routes
app.options('*', cors(corsOptions));

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
    environment: 'localhost',
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

// Route to execute Python script
app.post('/api/mark-attendance', (req, res) => {
  console.log('📝 Starting attendance marking process...');
  console.log('Request origin:', req.get('origin'));
  console.log('Environment:', {
    NODE_ENV: process.env.NODE_ENV,
    PWD: process.cwd(),
    PATH: process.env.PATH
  });
  
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
  
  // Execute Python script with proper error handling
  const pythonProcess = spawn(pythonCmd, [pythonScriptPath], {
    stdio: ['pipe', 'pipe', 'pipe'],
    shell: true,
    env: {
      ...process.env,
      PYTHONPATH: process.env.PYTHONPATH || '',
      PATH: process.env.PATH
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
  }, 30000); // 30 seconds timeout for localhost
  
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
                     output.includes('Attendance marked (simulated)') ||
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
          serverMode: output.includes('Server environment'),
          simulated: output.includes('simulated'),
          serverMode: output.includes('Server environment'),
          simulated: output.includes('simulated')
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
        error: errorType,
        debug: {
          exitCode: code,
          pythonCmd,
          scriptPath: pythonScriptPath,
          output: output,
          error: error,
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

// Allow your Vercel domain
const allowedOrigins = [
  'https://attendance-marking-system-six.vercel.app',
  'http://localhost:5173'
];
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

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
