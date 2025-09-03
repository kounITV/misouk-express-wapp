"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from "next/image";
import { AuthService } from '@/lib/auth-service';
import { LoginForm } from "./constainer/form";

export default function SignIn() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        // First, try to restore session from cookies if needed
        const restored = AuthService.restoreSessionFromCookies();
        console.log('Login page - Session restore from cookies:', restored ? 'Success' : 'Not needed/Failed');
        
        // Check if user is already logged in
        const token = AuthService.getStoredToken();
        const user = AuthService.getStoredUser();
        
        console.log('Login page - checking auth:', { 
          hasToken: !!token, 
          hasUser: !!user 
        });

        if (token && user) {
          // User is already logged in, redirect to appropriate dashboard
          const userRole = typeof user.role === 'string' ? user.role : user.role?.name || 'super_admin';
          
          console.log('Login page - User already logged in, redirecting based on role:', userRole);
          
          AuthService.redirectBasedOnRole(userRole);
          return;
        }

        // No auth data, show login form
        console.log('Login page - No auth data, showing login form');
        setShowLogin(true);
      } catch (error) {
        console.error('Login page - Auth check error:', error);
        setShowLogin(true);
      } finally {
        setIsChecking(false);
      }
    };

    // Small delay to ensure all storage methods are checked
    const timeoutId = setTimeout(checkAuthAndRedirect, 150);
    
    return () => clearTimeout(timeoutId);
  }, [router]);

  // Show loading while checking auth
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0c64b0] to-[#247dc9] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="bg-white p-4 rounded-lg shadow-lg mb-8">
            <Image 
              src="/logo-01.png" 
              alt="MISOUK EXPRESS" 
              width={200} 
              height={80} 
              className="h-16 w-auto"
              priority
            />
          </div>
          <div className="bg-white rounded-lg p-8 shadow-2xl">
            <div className="w-8 h-8 border-4 border-[#0c64b0] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">ກຳລັງກວດສອບການເຂົ້າສູ່ລະບົບ...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show login form only if user is not logged in
  if (showLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0c64b0] to-[#247dc9] flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8">
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <Image 
                src="/logo-01.png" 
                alt="MISOUK EXPRESS" 
                width={200} 
                height={80} 
                className="h-16 w-auto"
                priority
              />
            </div>
          </div>
          <LoginForm />
        </div>
      </div>
    );
  }

  // Don't show anything if redirecting
  return null;
}

