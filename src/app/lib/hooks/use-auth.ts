"use client";

import { useState, useEffect } from 'react';
import { AuthService } from '../auth-service';

interface UseAuthReturn {
  user: any | null;
  token: string | null;
  isLoading: boolean;
  isMounted: boolean;
  tokenExpired: boolean;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [tokenExpired, setTokenExpired] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    setIsLoading(true);
    
    try {
      // First, try to restore session from cookies if needed
      const restored = AuthService.restoreSessionFromCookies();
      console.log('Session restore from cookies:', restored ? 'Success' : 'Not needed/Failed');
      
      // Check if token expired flag is set
      const expired = AuthService.getTokenExpiredFlag();
      setTokenExpired(expired);
      
      const storedUser = AuthService.getStoredUser();
      const storedToken = AuthService.getStoredToken();
      
      console.log('Auth check - Token:', storedToken ? 'Found' : 'Not found');
      console.log('Auth check - User:', storedUser ? 'Found' : 'Not found');
      console.log('Auth check - Token Expired Flag:', expired);
      
      setUser(storedUser);
      setToken(storedToken);
    } catch (error) {
      console.error('Error loading auth state:', error);
      setUser(null);
      setToken(null);
      setTokenExpired(false);
    } finally {
      setIsLoading(false);
    }
  }, [isMounted]);

  return {
    user,
    token,
    isLoading,
    isMounted,
    tokenExpired,
  };
}