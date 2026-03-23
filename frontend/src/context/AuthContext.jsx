import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile as firebaseUpdateProfile,
} from 'firebase/auth';
import { auth } from '../config/firebase.js';
import { usersAPI } from '../services/api.js';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch profile via backend API (Admin SDK — bypasses Firestore rules)
  const fetchUserProfile = useCallback(async () => {
    try {
      const res = await usersAPI.getProfile();
      if (res.data?.user) {
        setUserProfile(res.data.user);
        return res.data.user;
      }
      return null;
    } catch (err) {
      console.error('fetchUserProfile error:', err.message);
      return null;
    }
  }, []);

  useEffect(() => {
    // Fallback: if Firebase doesn't respond in 10s (e.g. placeholder config, or slow
    // network after a Stripe checkout redirect), stop loading rather than hanging forever.
    const timeout = setTimeout(() => setLoading(false), 10000);
    let unsubscribe = () => {};
    try {
      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        clearTimeout(timeout);
        setUser(firebaseUser);
        if (firebaseUser) {
          await fetchUserProfile();
        } else {
          setUserProfile(null);
        }
        setLoading(false);
      });
    } catch (err) {
      clearTimeout(timeout);
      console.error('Firebase auth error:', err);
      setLoading(false);
    }
    return () => { clearTimeout(timeout); unsubscribe(); };
  }, [fetchUserProfile]);

  const login = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    await fetchUserProfile();
    return result;
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    // Backend auto-creates profile if it doesn't exist
    await fetchUserProfile();
    return result;
  };

  const register = async (email, password, displayName) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await firebaseUpdateProfile(result.user, { displayName });
    // Backend auto-creates profile on first getProfile call
    await fetchUserProfile();
    return result;
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setUserProfile(null);
  };

  const updateProfile = async (data) => {
    if (!user) throw new Error('Not authenticated');
    await usersAPI.updateProfile(data);
    setUserProfile(prev => ({ ...prev, ...data }));
  };

  const refreshProfile = useCallback(async () => {
    if (user) return fetchUserProfile();
  }, [user, fetchUserProfile]);

  // Computed values
  const isAuthenticated = !!user && !loading;
  const tier = userProfile?.tier || 'starter';

  const reportsRemaining = (() => {
    const limits = { starter: 5, professional: 50, agency: 200, enterprise: -1 };
    const limit = limits[tier] ?? 1;
    if (limit === -1) return -1;
    return Math.max(0, limit - (userProfile?.reportsThisMonth || 0));
  })();

  const canGenerate = reportsRemaining === -1 || reportsRemaining > 0;

  const value = {
    user,
    userProfile,
    loading,
    login,
    loginWithGoogle,
    register,
    logout,
    updateProfile,
    refreshProfile,
    fetchUserProfile,
    isAuthenticated,
    tier,
    canGenerate,
    reportsRemaining,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
