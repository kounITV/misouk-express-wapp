"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/lib/auth-service';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndRedirect = () => {
      try {
        // First, try to restore session from cookies if needed
        const restored = AuthService.restoreSessionFromCookies();
        console.log('Root page - Session restore from cookies:', restored ? 'Success' : 'Not needed/Failed');
        
        // Check if user is already logged in
        const token = AuthService.getStoredToken();
        const user = AuthService.getStoredUser();
        
        console.log('Root page - checking auth:', { 
          hasToken: !!token, 
          hasUser: !!user 
        });

        if (token && user) {
          // User is logged in, redirect to appropriate dashboard
          const userRole = typeof user.role === 'string' ? user.role : user.role?.name || 'super_admin';
          
          console.log('Root page - User is logged in, redirecting based on role:', userRole);
          
          AuthService.redirectBasedOnRole(userRole);
          return;
        }

        // No auth data, redirect to home page
        console.log('Root page - No auth data, redirecting to home');
        router.push('/home');
      } catch (error) {
        console.error('Root page - Auth check error:', error);
        console.log('Root page - Error occurred, redirecting to home');
        router.push('/home');
      }
    };

    // Small delay to ensure all storage methods are checked
    const timeoutId = setTimeout(checkAuthAndRedirect, 150);
    
    return () => clearTimeout(timeoutId);
  }, [router]);

  // Show loading while checking auth
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">ກຳລັງກວດສອບການເຂົ້າສູ່ລະບົບ...</p>
      </div>
    </div>
  );
}


