"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/lib/auth-service';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Image from "next/image";

// Home page content component
const HomePageContent = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const router = useRouter();

  const handleSearch = () => {
    if (trackingNumber.trim()) {
      // Redirect to data check page with the tracking number
      router.push(`/data-check?tracking=${encodeURIComponent(trackingNumber.trim())}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="bg-[#f8fafc] py-4 sm:py-8 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center bg-white rounded-lg shadow-lg border border-gray-200 py-8 sm:py-12">
        <h1 className="text-[#247dc9] text-xl sm:text-2xl font-semibold mb-8 sm:mb-12">Misouk Express</h1>

        <div className="flex flex-col sm:flex-row gap-4 mb-12 sm:mb-16">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#247DC9] w-4 h-4 sm:w-5 sm:h-5" />
            <Input
              type="text"
              placeholder="ປ້ອນລະຫັດສິນຄ້າ"
              className="h-10 sm:h-12 text-sm sm:text-base border-[#247DC9] focus:border-[#247DC9] focus:ring-[#247DC9] pl-9 sm:pl-10 text-[#247DC9]"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>
          <Button 
            className="bg-[#247dc9] hover:bg-[#0c64b0] text-[#ffffff] px-6 sm:px-8 h-10 sm:h-12 touch-button"
            onClick={handleSearch}
            disabled={!trackingNumber.trim()}
          >
            ກວດສອບຂໍ້ມູນ
          </Button>
        </div>

        {/* Document and Person Illustration */}
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <div className="relative w-60 sm:w-80 h-48 sm:h-64 flex items-center justify-center">
            <Image 
              src="/empty.png" 
              alt="Empty" 
              width={100} 
              height={150} 
              className="w-16 h-24 sm:w-20 sm:h-30"
            />
          </div>
          
          <p className="text-[#247dc9] text-base sm:text-lg font-medium">ກວດສອບຂໍ້ມູນສິນຄ້າ</p>
        </div>
      </div>
    </div>
  );
};

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
        <HomePageContent/>
      </div>
    );
  }

  // Don't show anything if redirecting
  return null;
}

export default Home;
