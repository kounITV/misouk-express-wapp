"use client";

import { useState, useEffect } from 'react';
import { AuthService } from '../auth-service';

interface UseAuthReturn {
  user: any | null;
  token: string | null;
  isLoading: boolean;
  isMounted: boolean;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    setIsLoading(true);
    
    try {
      const storedUser = AuthService.getStoredUser();
      const storedToken = AuthService.getStoredToken();
      
      setUser(storedUser);
      setToken(storedToken);
    } catch (error) {
      console.error('Error loading auth state:', error);
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, [isMounted]);

  return {
    user,
    token,
    isLoading,
    isMounted,
  };
}