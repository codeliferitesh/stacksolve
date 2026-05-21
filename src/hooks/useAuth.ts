// src/hooks/useAuth.ts
'use client';
import { useEffect } from 'react';
import { onAuthChange, getUserById } from '@/lib/authService';
import { useAuthStore } from '@/store/authStore';

export function useAuth() {
  const { user, loading, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        const userData = await getUserById(firebaseUser.uid);
        setUser(userData);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  return { user, loading };
}
