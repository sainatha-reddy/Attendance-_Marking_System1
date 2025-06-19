# 📊 Attendance Marking System

A modern, AI-powered attendance marking system that uses facial recognition technology to automatically mark attendance. Built with React, TypeScript, and Python, this system integrates with a PYNQ board for hardware-accelerated face processing.

## ✨ Features

- **🔐 Secure Authentication**: Google OAuth integration using Firebase
- **📷 Facial Recognition**: Real-time face detection and feature extraction
- **🤖 AI-Powered**: Uses face_recognition library for accurate face embeddings
- **⚡ Hardware Acceleration**: Integrates with PYNQ board for optimized processing
- **📱 Modern UI**: Clean, responsive interface built with React and Tailwind CSS
- **🔄 Real-time Processing**: Live webcam capture and instant attendance marking
- **🛡️ Protected Routes**: Secure access control for authenticated users

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Lucide React** - Beautiful icons

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **CORS** - Cross-origin resource sharing

### AI & Computer Vision
- **Python** - AI processing
- **OpenCV** - Computer vision library
- **face_recognition** - Facial recognition library
- **NumPy** - Numerical computing

### Authentication & Database
- **Firebase Auth** - Google OAuth authentication
- **Firebase** - Backend-as-a-Service

### Hardware Integration
- **PYNQ Board** - Hardware acceleration platform
- **TCP Socket Communication** - Real-time data transfer

## 🚀 Quick Start

### Prerequisites

1. **Node.js** (v16 or higher)
2. **Python** (v3.8 or higher)
3. **Firebase Project** (for authentication)
4. **PYNQ Board** (for hardware acceleration)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sainatha-reddy/Attendance_Marking_System.git
   cd Attendance_Marking_System
   ```

2. **Install Node.js dependencies**
   ```bash
   npm install
   ```

3. **Install Python dependencies**
   ```bash
   pip install opencv-python face-recognition numpy
   ```

4. **Configure Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Google Authentication
   - Copy your Firebase config to `src/config/firebase.ts`

5. **Configure PYNQ Board**
   - Update `PYNQ_SERVER_IP` in `Sender_side.py` with your PYNQ board's IP address
   - Ensure the PYNQ board is running the attendance server

### Running the Application

#### Option 1: Run Both Frontend and Backend Together (Recommended)
```bash
npm run dev:full
```

This starts:
- Backend server on `http://localhost:3001`
- Frontend development server on `http://localhost:5173`

#### Option 2: Run Separately

**Terminal 1 - Backend Server:**
```bash
npm run server
```

**Terminal 2 - Frontend Development Server:**
```bash
npm run dev
```

## 📖 How It Works

1. **Authentication**: Users sign in using Google OAuth through Firebase
2. **Attendance Marking**:
   - Click "Mark Attendance" on the home page
   - System captures an image from your webcam
   - Face recognition extracts facial features (128-dimensional embedding)
   - Features are quantized and sent to PYNQ board
   - PYNQ board processes the data and marks attendance
   - Success/error message is displayed

## 🏗️ Project Structure

```
project/
├── src/
│   ├── components/
│   │   ├── LoadingSpinner.tsx    # Loading animation component
│   │   ├── Notification.tsx      # Toast notification component
│   │   └── ProtectedRoute.tsx    # Route protection component
│   ├── config/
│   │   └── firebase.ts           # Firebase configuration
│   ├── contexts/
│   │   └── AuthContext.tsx       # Authentication context
│   ├── pages/
│   │   ├── AuthPage.tsx          # Authentication page
│   │   ├── CameraPage.tsx        # Camera capture page
│   │   ├── Home.tsx              # Main dashboard
│   │   ├── HomePage.tsx          # Home page component
│   │   └── Login.tsx             # Login page
│   ├── App.tsx                   # Main application component
│   ├── main.tsx                  # Application entry point
│   └── index.css                 # Global styles
├── server.js                     # Node.js backend server
├── Sender_side.py                # Python face recognition script
├── package.json                  # Project dependencies
└── README.md                     # This file
```

## ⚙️ Configuration

### Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Google Authentication
4. Copy the config object to `src/config/firebase.ts`

### PYNQ Board Configuration
Update the IP address in `Sender_side.py`:
```python
PYNQ_SERVER_IP = '172.16.151.175'  # Replace with your PYNQ board IP
```

## 🔧 Available Scripts

- `npm run dev` - Start frontend development server
- `npm run server` - Start backend server
- `npm run dev:full` - Start both frontend and backend
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🐛 Troubleshooting

### Common Issues

1. **"Python not found" error**
   - Ensure Python is installed and added to system PATH
   - Try using `python3` instead of `python`

2. **Face recognition issues**
   - Ensure proper lighting
   - Face the camera directly
   - Check if face is clearly visible

3. **Connection errors**
   - Verify PYNQ server is running
   - Check IP address configuration
   - Ensure network connectivity

4. **Webcam not working**
   - Grant camera permissions to browser
   - Close other applications using the camera
   - Check camera drivers

5. **Firebase authentication issues**
   - Verify Firebase configuration
   - Check if Google Auth is enabled
   - Ensure correct project settings

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Sainatha Reddy**
- GitHub: [@sainatha-reddy](https://github.com/sainatha-reddy)

## 🙏 Acknowledgments

- [face_recognition](https://github.com/ageitgey/face_recognition) library for facial recognition
- [Firebase](https://firebase.google.com/) for authentication
- [PYNQ](https://www.xilinx.com/products/boards-and-kits/1-9dyu-9.html) for hardware acceleration
- [React](https://reactjs.org/) and [Vite](https://vitejs.dev/) for the frontend framework

---

⭐ If you find this project helpful, please give it a star! 