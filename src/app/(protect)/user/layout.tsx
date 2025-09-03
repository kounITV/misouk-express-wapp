"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ToastProvider, Toaster } from "@/components/ui";
import { AuthService } from "@/lib/auth-service";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isValidating, setIsValidating] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const validateAuth = async () => {
      setIsValidating(true);
      
      try {
        // First, try to restore session from cookies if needed
        const restored = AuthService.restoreSessionFromCookies();
        console.log('User AuthGuard - Session restore from cookies:', restored ? 'Success' : 'Not needed/Failed');
        
        // Check if we have basic auth data first
        const token = AuthService.getStoredToken();
        const user = AuthService.getStoredUser();
        
        console.log('User AuthGuard - checking auth:', { 
          hasToken: !!token, 
          hasUser: !!user 
        });

        if (!token || !user) {
          console.log('User AuthGuard - No auth data, redirecting to home');
          router.push("/");
          setIsAuthenticated(false);
          return;
        }

        // If we have token and user, try to validate with server
        try {
          // Add timeout to prevent hanging forever
          const timeoutPromise = new Promise<boolean>((_, reject) => 
            setTimeout(() => reject(new Error('Auth validation timeout')), 8000)
          );
          
          const authPromise = AuthService.validateToken(token).then(result => {
            if (result.success && result.data) {
              return true;
            } else {
              console.log('User AuthGuard - Token validation failed, redirecting to home');
              AuthService.clearAuth();
              router.push("/");
              return false;
            }
          });
          
          const isValid = await Promise.race([authPromise, timeoutPromise]);
          setIsAuthenticated(isValid);
        } catch (error) {
          console.error('User AuthGuard - Token validation failed:', error);
          // If validation fails but we have token, assume it's valid to avoid blocking
          console.log('User AuthGuard - Validation error but token exists, allowing access');
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('User AuthGuard - Auth check error:', error);
        console.log('User AuthGuard - Auth check failed, redirecting to home');
        router.push("/");
        setIsAuthenticated(false);
      } finally {
        setIsValidating(false);
      }
    };

    // Add a small delay to ensure all storage methods are checked
    const timeoutId = setTimeout(validateAuth, 150);
    
    return () => clearTimeout(timeoutId);
  }, [isMounted, router]);

  // Show loading during SSR and initial client mount
  if (!isMounted || isValidating || isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">ກຳລັງກວດສອບການເຂົ້າສູ່ລະບົບ...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render anything (redirect is in progress)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">ກຳລັງນຳທາງໄປໜ້າຫຼັກ...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <Toaster />
      <AuthGuard>{children}</AuthGuard>
    </ToastProvider>
  );
}