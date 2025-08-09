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

  static getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem('authToken');
    } catch {
      return null;
    }
  }

  static getStoredUser(): any | null {
    if (typeof window === 'undefined') return null;
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  static storeAuth(token: string, user: any): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('Failed to store auth data:', error);
    }
  }

  static clearAuth(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Failed to clear auth data:', error);
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
      window.location.href = '/';
    }
  }

  static redirectToUserManagement(): void {
    if (typeof window !== 'undefined') {
      window.location.href = '/user';
    }
  }
}