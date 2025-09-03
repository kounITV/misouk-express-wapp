"use client";

import { apiEndpoints } from './config';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    user: {
      id: string;
      username: string;
      email?: string;
    };
  };
}

export interface ValidateResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      username: string;
      email?: string;
    };
  };
}

export class AuthService {
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      console.log('Attempting login to:', apiEndpoints.login);
      console.log('Credentials:', { username: credentials.username, password: '***' });
      
      const response = await fetch(apiEndpoints.login, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify(credentials),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || `Login failed with status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Login error details:', error);
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('ບໍ່ສາມາດເຊື່ອມຕໍ່ກັບເຊີເວີ. ກະລຸນາກວດສອບການເຊື່ອມຕໍ່ອິນເຕີເນັດ.');
      }
      throw error;
    }
  }

  static async validateToken(token: string): Promise<ValidateResponse> {
    try {
      console.log('Validating token...');
      
      const response = await fetch(apiEndpoints.validate, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        mode: 'cors',
        credentials: 'omit',
      });

      console.log('Validation response status:', response.status);

      const data = await response.json();
      console.log('Validation response data:', data);

      if (!response.ok) {
        throw new Error(data.message || `Token validation failed with status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Token validation error:', error);
      throw error;
    }
  }

  static getCookieValue(name: string): string | null {
    if (typeof window === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      const cookieValue = parts.pop()?.split(';').shift();
      return cookieValue ? decodeURIComponent(cookieValue) : null;
    }
    return null;
  }

  static getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      // Check sessionStorage first (for current session)
      const sessionToken = sessionStorage.getItem('authToken');
      if (sessionToken) {
        return sessionToken;
      }
      
      // Check localStorage for token expiration info
      const tokenExpiry = localStorage.getItem('tokenExpiry');
      if (tokenExpiry) {
        const expiryTime = new Date(tokenExpiry);
        const currentTime = new Date();
        
        if (currentTime > expiryTime) {
          // Token has expired, clear everything and show message
          this.clearAuth();
          this.setTokenExpiredFlag();
          return null;
        }
      }
      
      // Check localStorage
      const localToken = localStorage.getItem('authToken');
      if (localToken) {
        return localToken;
      }
      
      // Finally, check cookies as fallback
      return this.getCookieValue('authToken');
    } catch {
      return null;
    }
  }

  static getStoredUser(): any | null {
    if (typeof window === 'undefined') return null;
    try {
      // Check sessionStorage first
      const sessionUser = sessionStorage.getItem('user');
      if (sessionUser) {
        return JSON.parse(sessionUser);
      }
      
      // Check localStorage
      const userData = localStorage.getItem('user');
      if (userData) {
        return JSON.parse(userData);
      }
      
      // Finally, check cookies as fallback
      const cookieUser = this.getCookieValue('user');
      return cookieUser ? JSON.parse(cookieUser) : null;
    } catch {
      return null;
    }
  }

  static storeAuth(token: string, user: any, rememberMe: boolean = true): void {
    if (typeof window === 'undefined') return;
    try {
      console.log('Storing auth data...');
      console.log('Token to store:', token);
      console.log('User to store:', user);
      console.log('Remember me:', rememberMe);
      
      if (rememberMe) {
        // Store in localStorage with expiration (30 days for persistent login)
        const expiryTime = new Date();
        expiryTime.setDate(expiryTime.getDate() + 30);
        
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('tokenExpiry', expiryTime.toISOString());
        
        // Also set session storage for immediate access
        sessionStorage.setItem('authToken', token);
        sessionStorage.setItem('user', JSON.stringify(user));
        
        // Set a cookie for additional persistence
        const cookieExpiry = new Date();
        cookieExpiry.setDate(cookieExpiry.getDate() + 30);
        document.cookie = `authToken=${token}; expires=${cookieExpiry.toUTCString()}; path=/; SameSite=Lax`;
        document.cookie = `user=${encodeURIComponent(JSON.stringify(user))}; expires=${cookieExpiry.toUTCString()}; path=/; SameSite=Lax`;
      } else {
        // Store in sessionStorage only (expires when browser closes)
        sessionStorage.setItem('authToken', token);
        sessionStorage.setItem('user', JSON.stringify(user));
        
        // Clear any existing localStorage auth data
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('tokenExpiry');
        
        // Clear cookies
        document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
        document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
      }
      
      // Clear token expired flag
      localStorage.removeItem('tokenExpired');
      
    } catch (error) {
      console.error('Failed to store auth data:', error);
    }
  }

  static clearAuth(): void {
    if (typeof window === 'undefined') return;
    try {
      // Clear both localStorage and sessionStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('tokenExpiry');
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('user');
      
      // Clear cookies
      document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
      document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    } catch (error) {
      console.error('Failed to clear auth data:', error);
    }
  }

  static setTokenExpiredFlag(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('tokenExpired', 'true');
    } catch (error) {
      console.error('Failed to set token expired flag:', error);
    }
  }

  static getTokenExpiredFlag(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem('tokenExpired') === 'true';
    } catch {
      return false;
    }
  }

  static clearTokenExpiredFlag(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem('tokenExpired');
    } catch (error) {
      console.error('Failed to clear token expired flag:', error);
    }
  }

  static restoreSessionFromCookies(): boolean {
    if (typeof window === 'undefined') return false;
    
    try {
      // Check if we already have session data
      const sessionToken = sessionStorage.getItem('authToken');
      const localToken = localStorage.getItem('authToken');
      
      if (sessionToken || localToken) {
        return true; // Already have session data
      }
      
      // Try to restore from cookies
      const cookieToken = this.getCookieValue('authToken');
      const cookieUserString = this.getCookieValue('user');
      
      if (cookieToken && cookieUserString) {
        console.log('Restoring session from cookies...');
        
        try {
          const cookieUser = JSON.parse(cookieUserString);
          
          // Check if localStorage already has the same data
          const localToken = localStorage.getItem('authToken');
          if (!localToken) {
            // Restore to localStorage with extended expiration
            const expiryTime = new Date();
            expiryTime.setDate(expiryTime.getDate() + 30);
            
            localStorage.setItem('authToken', cookieToken);
            localStorage.setItem('user', JSON.stringify(cookieUser));
            localStorage.setItem('tokenExpiry', expiryTime.toISOString());
          }
          
          // Also set in sessionStorage for immediate access
          sessionStorage.setItem('authToken', cookieToken);
          sessionStorage.setItem('user', JSON.stringify(cookieUser));
          
          console.log('Session restored from cookies successfully');
          return true;
        } catch (parseError) {
          console.error('Failed to parse user data from cookies:', parseError);
          return false;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Failed to restore session from cookies:', error);
      return false;
    }
  }

  static async checkAuthAndRedirect(): Promise<boolean> {
    const token = this.getStoredToken();
    
    if (!token) {
      console.log('No token found, redirecting to home');
      this.redirectToHome();
      return false;
    }

    try {
      const result = await this.validateToken(token);
      
      if (result.success && result.data) {
        console.log('Token validation successful');
        // Update stored user data if needed
        const currentUser = this.getStoredUser();
        if (JSON.stringify(currentUser) !== JSON.stringify(result.data.user)) {
          localStorage.setItem('user', JSON.stringify(result.data.user));
        }
        return true;
      } else {
        console.log('Token validation failed, clearing auth');
        this.clearAuth();
        this.redirectToHome();
        return false;
      }
    } catch (error) {
      console.error('Token validation error:', error);
      
      // Only clear auth and redirect if it's actually an auth error
      // Don't redirect on network errors
      if (error instanceof Error && 
          (error.message.includes('401') || 
           error.message.includes('403') || 
           error.message.includes('Token validation failed'))) {
        console.log('Authentication error, clearing auth and redirecting');
        this.clearAuth();
        this.redirectToHome();
        return false;
      }
      
      // For network errors, assume token is still valid and don't redirect
      console.log('Network error during validation, assuming token is still valid');
      return true;
    }
  }

  static redirectToHome(): void {
    if (typeof window !== 'undefined') {
      console.log('AuthService - Redirecting to home page');
      window.location.href = '/home';
    }
  }

  static redirectToUserManagement(): void {
    if (typeof window !== 'undefined') {
      window.location.href = '/user';
    }
  }

  static redirectToProductManagement(): void {
    if (typeof window !== 'undefined') {
      window.location.href = '/product';
    }
  }

  static redirectBasedOnRole(userRole: string): void {
    if (typeof window !== 'undefined') {
      const roleName = typeof userRole === 'string' ? userRole : (userRole as any)?.name || '';
      
      switch (roleName) {
        case 'super_admin':
        case 'thai_admin':
        case 'lao_admin':
          window.location.href = '/product';
          break;
        default:
          window.location.href = '/product';
      }
    }
  }
}