'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
  Auth,
  GoogleAuthProvider,
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<User>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<User>;
  signInWithGoogle: () => Promise<User>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authInstance, setAuthInstance] = useState<Auth | undefined>(auth);
  const [googleProviderInstance, setGoogleProviderInstance] = useState<GoogleAuthProvider | undefined>(googleProvider);

  useEffect(() => {
    // Re-import to get initialized instances on client-side
    const initializeAuth = async () => {
      const { auth: clientAuth, googleProvider: clientGoogleProvider } = await import('./firebase');
      setAuthInstance(clientAuth);
      setGoogleProviderInstance(clientGoogleProvider);
    };

    if (!authInstance) {
      initializeAuth();
    }
  }, [authInstance]);

  useEffect(() => {
    if (!authInstance) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(authInstance, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [authInstance]);

  const signInWithEmail = async (email: string, password: string): Promise<User> => {
    if (!authInstance) {
      throw new Error('Firebase Auth is not initialized');
    }
    const result = await signInWithEmailAndPassword(authInstance, email, password);
    return result.user;
  };

  const signUpWithEmail = async (email: string, password: string, displayName: string): Promise<User> => {
    if (!authInstance) {
      throw new Error('Firebase Auth is not initialized');
    }
    const result = await createUserWithEmailAndPassword(authInstance, email, password);
    await updateProfile(result.user, { displayName });
    return result.user;
  };

  const signInWithGoogle = async (): Promise<User> => {
    if (!authInstance || !googleProviderInstance) {
      throw new Error('Firebase Auth is not initialized');
    }
    const result = await signInWithPopup(authInstance, googleProviderInstance);
    return result.user;
  };

  const signOut = async (): Promise<void> => {
    if (!authInstance) {
      throw new Error('Firebase Auth is not initialized');
    }
    await firebaseSignOut(authInstance);
  };

  const value = {
    user,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
