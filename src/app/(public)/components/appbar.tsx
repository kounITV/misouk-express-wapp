"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/ui/logout-button";
import { LoginPopup } from "@/components/containers/login-popup";
import { AuthService } from "@/lib/auth-service";
import { useAuth } from "@/lib/hooks/use-auth";

const getRoleName = (role: any): string => {
  // Safely extract role name if it's an object
  const roleName = typeof role === 'string' ? role : (role?.name || role?.id || '');
  
  switch (roleName) {
    case 'super_admin': return 'ຊູບເປີແອັດມິນ';
    case 'thai_admin': return 'ແອັດມິນສາຂາໄທ';
    case 'lao_admin': return 'ແອັດມິນສາຂາລາວ';
    default: return String(roleName || '');
  }
};

export const Appbar = () => {
  const [loginOpen, setLoginOpen] = useState(false);
  const { user, token, isMounted } = useAuth();

  const handleLogout = () => {
    AuthService.clearAuth();
    AuthService.redirectToHome();
  };

  const isLoggedIn = isMounted && token && user;

  return (
    <>
      <header className="bg-[#0c64b0] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/logo-01.png"
              alt="MISOUK EXPRESS"
              width={120}
              height={40}
              className="h-10 w-auto"
            />
          </div>
          
          {isLoggedIn ? (
            <div className="flex items-center justify-between w-full">
              <div className="text-white text-sm">
                <div className="font-medium">{user.username}</div>
                <div className="text-xs text-blue-200">{getRoleName(user.role)}</div>
              </div>
              <LogoutButton onLogout={handleLogout} className="text-white ml-auto" />
            </div>
          ) : (
            <Button
              variant="outline"
              className="bg-[#0c64b0] border-[#ffffff] text-[#ffffff] hover:bg-[#ffffff] hover:text-[#0c64b0]"
              onClick={() => setLoginOpen(true)}
            >
              ເຂົ້າສູ່ລະບົບ
            </Button>
          )}
        </div>
      </header>
      <LoginPopup open={loginOpen} onOpenChange={setLoginOpen} />
    </>
  );
}; 