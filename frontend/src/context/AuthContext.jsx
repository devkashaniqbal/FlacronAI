import { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../config/firebase';

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
  const [loading, setLoading] = useState(true);

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
      } else {
        setUser(null);
        setToken(null);
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
      const response = await fetch('http://localhost:3000/api/auth/sync-user', {
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
          await fetch('http://localhost:3000/api/auth/logout', {
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

  const value = {
    user,
    token,
    loading,
    register,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
