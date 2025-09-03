"use client";

import { useState, useCallback, memo } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/ui/logout-button";
import { LoginPopup } from "@/components/containers/login-popup";
import { AuthService } from "@/lib/auth-service";
import { useAuth } from "@/lib/hooks/use-auth";

// Role mapping constants
const ROLE_TRANSLATIONS = {
  'super_admin': 'ຊູບເປີແອັດມິນ',
  'thai_admin': 'ແອັດມິນສາຂາໄທ',
  'lao_admin': 'ແອັດມິນສາຂາລາວ',
} as const;

const getRoleName = (role: any): string => {
  // Safely extract role name if it's an object
  const roleName = typeof role === 'string' ? role : (role?.name || role?.id || '');
  return ROLE_TRANSLATIONS[roleName as keyof typeof ROLE_TRANSLATIONS] || String(roleName || '');
};

interface UserInfoProps {
  username: string;
  role: any;
  onLogout: () => void;
}

const UserInfo = memo(({ username, role, onLogout }: UserInfoProps) => (
  <div className="flex items-center justify-between w-full">
    <div className="text-white text-sm">
      <div className="font-medium">{username}</div>
      <div className="text-xs text-blue-200">{getRoleName(role)}</div>
    </div>
    <LogoutButton onLogout={onLogout} className="text-white ml-auto" />
  </div>
));

UserInfo.displayName = "UserInfo";

export const Appbar = memo(() => {
  const [loginOpen, setLoginOpen] = useState(false);
  const { user, token, isMounted } = useAuth();

  const handleLogout = useCallback(() => {
    AuthService.clearAuth();
    AuthService.redirectToHome();
  }, []);

  const handleLoginOpen = useCallback(() => {
    setLoginOpen(true);
  }, []);

  const isLoggedIn = isMounted && token && user;

  return (
    <>
      <header className="bg-[#0c64b0] px-6 py-4" role="banner">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/logo-01.png"
              alt="MISOUK EXPRESS"
              width={120}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </div>
          
          {isLoggedIn ? (
            <UserInfo 
              username={user.username}
              role={user.role}
              onLogout={handleLogout}
            />
          ) : (
            <Button
              variant="outline"
              className="bg-[#0c64b0] border-[#ffffff] text-[#ffffff] hover:bg-[#ffffff] hover:text-[#0c64b0] transition-colors"
              onClick={handleLoginOpen}
              aria-label="Log in to system"
            >
              ເຂົ້າສູ່ລະບົບ
            </Button>
          )}
        </div>
      </header>
      <LoginPopup open={loginOpen} onOpenChange={setLoginOpen} />
    </>
  );
});

Appbar.displayName = "Appbar"; 




