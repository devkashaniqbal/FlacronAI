import { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../config/firebase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from backend (includes tier info)
  const fetchUserProfile = async (userId, userToken) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/profile?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      });
      const data = await response.json();
      if (data.success && data.user) {
        setUserProfile({
          ...data.user,
          tier: data.user.tier || 'starter',
          displayName: data.user.displayName || data.user.email?.split('@')[0]
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && firebaseUser.emailVerified) {
        // Get ID token and store it with exact same key as original
        const userToken = await firebaseUser.getIdToken();
        localStorage.setItem('flacronai_token', userToken);
        setToken(userToken);

        const displayName = firebaseUser.displayName || firebaseUser.email.split('@')[0];
        localStorage.setItem('flacronai_user', JSON.stringify({
          userId: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: displayName,
          emailVerified: firebaseUser.emailVerified
        }));

        setUser(firebaseUser);

        // Fetch user profile with tier info
        await fetchUserProfile(firebaseUser.uid, userToken);
      } else {
        setUser(null);
        setToken(null);
        setUserProfile(null);
        localStorage.removeItem('flacronai_token');
        localStorage.removeItem('flacronai_user');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const register = async (email, password, displayName) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Update user profile with display name
      const { updateProfile, sendEmailVerification } = await import('firebase/auth');
      await updateProfile(userCredential.user, { displayName });

      // Send email verification
      await sendEmailVerification(userCredential.user);

      // Don't sync with backend yet - wait for email verification
      // User will be synced on first login after email verification

      return userCredential;
    } catch (error) {
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // Check if email is verified
      if (!userCredential.user.emailVerified) {
        await signOut(auth);
        throw new Error('Please verify your email before logging in. Check your inbox for the verification link.');
      }

      // Get ID token and sync with backend
      const token = await userCredential.user.getIdToken();
      const displayName = userCredential.user.displayName || userCredential.user.email.split('@')[0];

      // Sync user with backend
      const response = await fetch(`${API_BASE_URL}/auth/sync-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: displayName
        })
      });

      if (!response.ok) {
        console.error('Failed to sync user with backend');
      }

      return userCredential;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Get token before signing out
      const token = await auth.currentUser?.getIdToken();

      // Call backend logout if we have a token
      if (token) {
        try {
          await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
        } catch (err) {
          console.error('Backend logout error:', err);
        }
      }

      // Sign out from Firebase
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  };

  // Function to refresh user profile
  const refreshUserProfile = async () => {
    if (user && token) {
      await fetchUserProfile(user.uid, token);
    }
  };

  const value = {
    user,
    token,
    userProfile,
    loading,
    register,
    login,
    logout,
    refreshUserProfile,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
