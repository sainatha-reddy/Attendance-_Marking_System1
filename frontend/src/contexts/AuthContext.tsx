import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../config/firebase';
import LoadingSpinner from '../components/LoadingSpinner';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    // Handle redirect result
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        
        if (result?.user) {
          const user = result.user;
          
          // Check the email domain after redirect sign-in
          if (user.email && user.email.endsWith('@iiitdm.ac.in')) {
            // User is from the correct domain, sign-in is successful
          } else {
            // Sign out the user and show error
            await signOut(auth);
          }
        }
      } catch (error: unknown) {
        if (error instanceof Error && error.message.includes('Access restricted to IIITDM')) {
        }
      }
    };

    handleRedirectResult();

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    // Set the hd (hosted domain) parameter to restrict to iiitdm.ac.in domain
    provider.setCustomParameters({
      hd: 'iiitdm.ac.in'
    });
    
    try {
      // Use signInWithPopup instead of signInWithRedirect to avoid COOP issues
      await signInWithPopup(auth, provider);
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes('Access restricted to IIITDM')) {
      } else {
        throw error;
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <LoadingSpinner /> : children}
    </AuthContext.Provider>
  );
};