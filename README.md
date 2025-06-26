# 📊 AI-Powered Attendance Marking System

A modern, intelligent attendance marking system that uses facial recognition technology to automatically mark attendance. Built with React, TypeScript, Python Flask, and integrated with Supabase for image storage and Firebase for authentication.

## ✨ Features

- **🔐 Secure Authentication**: Google OAuth integration using Firebase
- **📷 Facial Recognition**: Real-time face detection and comparison using face_recognition library
- **🤖 AI-Powered**: Advanced face embedding and similarity matching
- **📱 Modern UI**: Clean, responsive interface built with React and Tailwind CSS
- **🔄 Real-time Processing**: Live webcam capture and instant attendance marking
- **🛡️ Protected Routes**: Secure access control for authenticated users
- **👨‍💼 Admin Dashboard**: Comprehensive image management for administrators
- **📊 Local Storage**: Attendance records stored locally in JSON format
- **☁️ Cloud Storage**: Reference images and captures stored in Supabase

## 🏗️ Project Architecture

```
project/
├── frontend/                 # React TypeScript application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── config/          # Firebase and Supabase configuration
│   │   ├── contexts/        # React contexts (Auth)
│   │   ├── pages/           # Application pages
│   │   └── main.tsx         # Application entry point
│   ├── package.json         # Frontend dependencies
│   └── README.md           # Frontend documentation
├── backend/                 # Python Flask API
│   ├── compare_api.py      # Main API with face recognition
│   ├── requirements.txt    # Python dependencies
│   └── attendance_records.json # Local attendance storage
├── firebase.json           # Firebase configuration
└── README.md              # This file
```

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Lucide React** - Beautiful icons

### Backend
- **Python 3.8+** - Backend runtime
- **Flask** - Web framework
- **face_recognition** - Facial recognition library
- **Supabase** - Image storage and database
- **CORS** - Cross-origin resource sharing

### Authentication & Storage
- **Firebase Auth** - Google OAuth authentication
- **Supabase Storage** - Image storage and management
- **Firebase Firestore** - Metadata storage (admin dashboard)

## 🚀 Quick Start

### Prerequisites

1. **Node.js** (v18 or higher)
2. **Python** (v3.8 or higher)
3. **Firebase Project** (for authentication)
4. **Supabase Project** (for image storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd project
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Install Backend Dependencies**
   ```bash
   cd ../backend
   pip install -r requirements.txt
   ```

4. **Environment Setup**

   **Frontend (.env in frontend directory):**
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
   VITE_SUPABASE_URL=https://your_project_id.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   VITE_API_URL=http://localhost:3001
   ```

   **Backend (.env in backend directory):**
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your-service-role-key
   SUPABASE_BUCKET=attendance-images
   ```

### Running the Application

#### Option 1: Run Both Frontend and Backend Together (Recommended)
```bash
cd frontend
npm run dev:full
```

This starts:
- Backend server on `http://localhost:3001`
- Frontend development server on `http://localhost:5173`

#### Option 2: Run Separately

**Terminal 1 - Backend Server:**
```bash
cd backend
python compare_api.py
```

**Terminal 2 - Frontend Development Server:**
```bash
cd frontend
npm run dev
```

## 📖 How It Works

### 1. Authentication
- Users sign in using Google OAuth through Firebase
- Only users with @iiitdm.ac.in email addresses can access the system
- Admin users (emails containing 'admin', 'faculty', 'prof', or 'dr.') get access to admin dashboard

### 2. Attendance Marking
- Click "Mark Attendance" on the home page
- System captures an image from your webcam
- Face recognition extracts facial features (128-dimensional embedding)
- Compares with reference image stored in Supabase
- Marks attendance based on similarity threshold (0.6)
- Saves attendance record locally and captured image to Supabase

### 3. Admin Dashboard
- Upload reference images for students
- Manage and edit image metadata
- Search and organize images
- Delete images when needed

## 🔧 Configuration

### Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Google Authentication
4. Copy the config object to `frontend/src/config/firebase.ts`

### Supabase Setup
1. Go to [Supabase Console](https://supabase.com/)
2. Create a new project
3. Create a storage bucket named 'attendance-images'
4. Set up storage policies for public read access
5. Copy your project URL and anon key

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
   - Verify backend server is running on port 3001
   - Check network connectivity
   - Ensure CORS is properly configured

4. **Webcam not working**
   - Grant camera permissions to browser
   - Close other applications using the camera
   - Check camera drivers

5. **Firebase authentication issues**
   - Verify Firebase configuration
   - Check if Google Auth is enabled
   - Ensure correct project settings

6. **Supabase storage issues**
   - Verify Supabase configuration
   - Check bucket permissions
   - Ensure storage policies are set correctly

## 🔒 Security Features

- **Role-based Access Control**: Different permissions for users and admins
- **Domain Restriction**: Only @iiitdm.ac.in emails allowed
- **Protected Routes**: Authentication required for sensitive pages
- **Input Validation**: All user inputs are validated
- **Secure Storage**: Images stored securely in Supabase

## 📊 Data Storage

### Local Storage
- Attendance records stored in `backend/attendance_records.json`
- Includes user info, timestamp, face distance, and match status

### Cloud Storage
- Reference images stored in Supabase Storage
- Captured attendance images stored for record keeping
- Metadata stored in Firebase Firestore (admin dashboard)

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
- [Supabase](https://supabase.com/) for image storage
- [React](https://reactjs.org/) and [Vite](https://vitejs.dev/) for the frontend framework
- [Flask](https://flask.palletsprojects.com/) for the backend API

## 📚 Additional Documentation

- [Frontend README](./frontend/README.md) - Detailed frontend documentation
- [Setup Instructions](./frontend/SETUP_INSTRUCTIONS.md) - Step-by-step setup guide
- [Admin README](./frontend/ADMIN_README.md) - Admin dashboard documentation
- [Supabase Setup](./frontend/SUPABASE_SETUP.md) - Supabase configuration guide

---

⭐ If you find this project helpful, please give it a star! 