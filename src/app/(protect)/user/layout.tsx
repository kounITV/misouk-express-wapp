"use client";

import { useEffect, useState } from "react";
import { ToastProvider, Toaster } from "@/components/ui";
import { AuthService } from "@/lib/auth-service";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isValidating, setIsValidating] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const validateAuth = async () => {
      setIsValidating(true);
      
      try {
        // Add timeout to prevent hanging forever
        const timeoutPromise = new Promise<boolean>((_, reject) => 
          setTimeout(() => reject(new Error('Auth validation timeout')), 10000)
        );
        
        const authPromise = AuthService.checkAuthAndRedirect();
        
        const isValid = await Promise.race([authPromise, timeoutPromise]);
        setIsAuthenticated(isValid);
      } catch (error) {
        console.error('Auth validation failed:', error);
        // If there's a token but validation fails, assume it's valid to avoid blocking
        const token = AuthService.getStoredToken();
        if (token) {
          console.log('Token exists but validation failed, allowing access');
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } finally {
        setIsValidating(false);
      }
    };

    // Add a small delay to prevent rapid redirects
    const timeoutId = setTimeout(validateAuth, 100);
    
    return () => clearTimeout(timeoutId);
  }, [isMounted]);

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