# Setup Instructions for Attendance System

## Prerequisites

1. **Python** with the following packages installed:
   ```bash
   pip install opencv-python face-recognition numpy
   ```

2. **Node.js and npm** installed

3. **Firebase project** set up (follow README.md for Firebase setup)

## Running the System

### Option 1: Run Both Frontend and Backend Together (Recommended)
```bash
npm run dev:full
```
This will start:
- Backend server on `http://localhost:3001`
- Frontend development server on `http://localhost:5173`

### Option 2: Run Separately

**Terminal 1 - Backend Server:**
```bash
npm run server
```

**Terminal 2 - Frontend Development Server:**
```bash
npm run dev
```

## How It Works

1. **Login**: Users authenticate using Google OAuth through Firebase
2. **Mark Attendance**: 
   - Click the "Mark Attendance" card on the home page
   - The system will:
     - Capture an image from your webcam
     - Extract facial features using face recognition
     - Send the data to the PYNQ server for processing
     - Display success/error message

## Important Notes

1. **Python Script Configuration**: 
   - Update the `PYNQ_SERVER_IP` in `Sender_side.py` to match your PYNQ board's IP address
   - Current IP is set to `172.16.151.175`

2. **Webcam Permission**: 
   - Make sure your browser has permission to access the webcam
   - The Python script will use your default camera (index 0)

3. **Network Requirements**:
   - Ensure the PYNQ board is accessible from your network
   - The system uses TCP connection on port 8888

## Troubleshooting

1. **"Python not found" error**: Make sure Python is installed and added to your system PATH

2. **Face recognition issues**: Ensure you have proper lighting and face the camera directly

3. **Connection errors**: Check if the PYNQ server is running and the IP address is correct

4. **Webcam not working**: Verify camera permissions and that no other application is using the camera

## File Structure

```
project/
├── src/
│   ├── pages/
│   │   ├── Home.tsx          # Main page with Mark Attendance button
│   │   └── Login.tsx         # Google authentication page
│   ├── contexts/
│   │   └── AuthContext.tsx   # Firebase authentication context
│   └── config/
│       └── firebase.ts       # Firebase configuration
├── server.js                 # Node.js backend server
├── Sender_side.py            # Python script for face recognition
└── package.json              # Project dependencies and scripts
``` 