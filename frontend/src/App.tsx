import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
// import Login from './pages/Login';
import Home from './pages/Home';
import CameraPage from './pages/CameraPage';

// Protected Route component
// const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
//   const { user } = useAuth();
//   if (!user) {
//     return <Navigate to="/login" />;
//   }
//   return <>{children}</>;
// };

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <Routes>
          {/* <Route path="/login" element={<Login />} /> */}
          <Route path="/home" element={<Home />} />
          <Route path="/camera" element={<CameraPage />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;