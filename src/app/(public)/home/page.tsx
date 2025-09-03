"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/lib/auth-service';
import TrackingPage from '../tracking/page';

const Home = () => {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        // First, try to restore session from cookies if needed
        const restored = AuthService.restoreSessionFromCookies();
        console.log('Home page - Session restore from cookies:', restored ? 'Success' : 'Not needed/Failed');
        
        // Check if user is already logged in
        const token = AuthService.getStoredToken();
        const user = AuthService.getStoredUser();
        
        console.log('Home page - checking auth:', { 
          hasToken: !!token, 
          hasUser: !!user 
        });

        if (token && user) {
          // User is logged in, redirect to appropriate dashboard
          const userRole = typeof user.role === 'string' ? user.role : user.role?.name || 'super_admin';
          
          console.log('Home page - User is logged in, redirecting based on role:', userRole);
          
          AuthService.redirectBasedOnRole(userRole);
          return;
        }

        // No auth data, show home content
        console.log('Home page - No auth data, showing home content');
        setShowContent(true);
      } catch (error) {
        console.error('Home page - Auth check error:', error);
        setShowContent(true);
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">ກຳລັງກວດສອບການເຂົ້າສູ່ລະບົບ...</p>
        </div>
      </div>
    );
  }

  // Show home content only if user is not logged in
  if (showContent) {
    return (
      <div>
        <TrackingPage/>
      </div>
    );
  }

  // Don't show anything if redirecting
  return null;
}

export default Home;
