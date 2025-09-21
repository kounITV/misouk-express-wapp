"use client";

import React, { useState, useEffect } from 'react';
import { Menu, Package, Users, FileText, X, ShoppingCart, LogOut, User, Search } from 'lucide-react';
import { Button } from './button';
import Image from 'next/image';

interface MenuItem {
  id: string;
  icon: React.ReactNode;
  text: string;
  href: string;
  roles: string[]; // Roles that can see this menu item
}

interface SidebarMenuProps {
  currentUserRole?: string;
  currentPath?: string;
  onMenuClick?: (href: string) => void;
  onCollapseChange?: (isCollapsed: boolean) => void;
  isMobileMenuOpen?: boolean;
  onMobileMenuToggle?: () => void;
  currentUser?: {
    username?: string;
    role?: {
      name?: string;
    } | string;
  };
  onLogout?: () => void;
}

const menuItems: MenuItem[] = [
  {
    id: 'product',
    icon: <Package className="w-6 h-6" />,
    text: 'ໜ້າຈັດການສິນຄ້າ',
    href: '/product',
    roles: ['super_admin', 'thai_admin', 'lao_admin']
  },
  {
    id: 'user',
    icon: <Users className="w-6 h-6" />,
    text: 'ໜ້າຈັດການພະນັກງານ',
    href: '/user',
    roles: ['super_admin']
  },
  {
    id: 'data-check',
    icon: <Search className="w-6 h-6" />,
    text: 'ໜ້າກວດສອບຂໍ້ມູນ',
    href: '/data-check',
    roles: ['super_admin', 'normal_user']
  },
  {
    id: 'report',
    icon: <FileText className="w-6 h-6" />,
    text: 'ໜ້າລາຍງານ',
    href: '/report',
    roles: ['super_admin']
  }
];

const getRoleName = (role: any): string => {
  const roleName = typeof role === 'string' ? role : (role?.name || role?.id || '');

  switch (roleName) {
    case 'super_admin': return 'ຊູບເປີແອັດມິນ';
    case 'thai_admin': return 'ແອັດມິນສາຂາໄທ';
    case 'lao_admin': return 'ແອັດມິນສາຂາລາວ';
    case 'normal_user': return 'ແອັດມິນທົ່ວໄປ';
    default: return String(roleName || '');
  }
};

export const SidebarMenu: React.FC<SidebarMenuProps> = ({
  currentUserRole = 'super_admin',
  currentPath = '',
  onMenuClick,
  onCollapseChange,
  isMobileMenuOpen = false,
  onMobileMenuToggle,
  currentUser,
  onLogout
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Optional: Close mobile menu when clicking outside (disabled for desktop-like behavior)
  useEffect(() => {
    // Removed click outside behavior to maintain desktop-like experience
    // Menu will only close when user explicitly clicks close button or menu item
    return () => {}; // Always return a cleanup function
  }, [isMobile, isMobileMenuOpen, onMobileMenuToggle]);

  // Filter menu items based on user role
  const visibleMenuItems = menuItems.filter(item => {
    // For normal_user, only show data-check menu
    if (currentUserRole === 'normal_user') {
      return item.id === 'data-check';
    }
    // For other roles, show all their allowed menus
    return item.roles.includes(currentUserRole);
  });

  const handleMenuClick = (href: string) => {
    if (onMenuClick) {
      onMenuClick(href);
    }
    // Close mobile menu when item is clicked
    if (isMobile && onMobileMenuToggle) {
      onMobileMenuToggle();
    }
  };

  const toggleCollapse = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    if (onCollapseChange) {
      onCollapseChange(newCollapsedState);
    }
  };

  // Apply desktop-like sidebar behavior to mobile
  return (
    <>      
      {/* Mobile sidebar - always visible when open, no overlay */}
      {isMobile && (
        <div 
          id="mobile-sidebar"
          className={`lg:hidden fixed top-0 left-0 h-full w-64 bg-[#0c64b0] transform transition-transform duration-300 ease-in-out z-50 flex flex-col shadow-lg ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Mobile Header with Logo */}
          <div className="px-4 py-4 flex items-center border-b border-white/20">
            <Button
              variant="ghost"
              size="sm"
              onClick={onMobileMenuToggle}
              className="text-white hover:bg-white/20 p-2 mr-3"
            >
              <X className="w-6 h-6" />
            </Button>
            <Image src="/logo-01.png" alt="MISOUK EXPRESS" width={100} height={32} className="h-6 w-auto" />
          </div>

          {/* Mobile Menu Items */}
          <nav className="flex-1 py-4">
            <div className="space-y-1 px-2">
              {visibleMenuItems.map((item) => {
                const isActive = currentPath.includes(item.href);
                return (
                  <Button
                    key={item.id}
                    variant="ghost"
                    onClick={() => handleMenuClick(item.href)}
                    className={`text-white hover:bg-white/20 transition-all duration-200 w-full justify-start px-4 py-3 ${
                      isActive ? 'bg-white/20' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        {item.icon}
                      </div>
                      <span className="text-sm font-medium">
                        {item.text}
                      </span>
                    </div>
                  </Button>
                );
              })}
            </div>
          </nav>

          {/* Mobile User Info and Logout */}
          <div className="p-4 border-t border-white/20 space-y-3">
            {/* User Info */}
            {currentUser && (
              <div className="flex items-center gap-3 text-white">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {currentUser.username || 'User'}
                  </div>
                  <div className="text-xs text-blue-200 truncate">
                    {getRoleName(currentUser.role)}
                  </div>
                </div>
              </div>
            )}
            
            {/* Logout Button */}
            {onLogout && (
              <Button
                variant="ghost"
                onClick={onLogout}
                className="text-white hover:bg-white/20 transition-all duration-200 w-full justify-start px-4 py-2"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <LogOut className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium">
                    ອອກຈາກລະບົບ
                  </span>
                </div>
              </Button>
            )}
          </div>
        </div>
      )}
      
      {/* Desktop sidebar - only show on desktop */}
      {!isMobile && (
        <div className={`hidden lg:flex bg-[#0c64b0] flex-col transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}>
      {/* Header with Menu Icon only (no logo on desktop) */}
      <div className="px-4 py-4 flex justify-start items-center border-b border-white/20">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleCollapse}
          className="text-white hover:bg-white/20 p-2"
        >
          <Menu className="w-6 h-6" />
        </Button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 py-4">
        <div className="space-y-1 px-2">
          {visibleMenuItems.map((item) => {
            const isActive = currentPath.includes(item.href);
            return (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => handleMenuClick(item.href)}
                className={`text-white hover:bg-white/20 transition-all duration-200 w-full justify-start px-4 py-3 ${
                  isActive ? 'bg-white/20' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {item.icon}
                  </div>
                  {!isCollapsed && (
                    <span className="text-sm font-medium whitespace-nowrap">
                      {item.text}
                    </span>
                  )}
                </div>
              </Button>
            );
          })}
        </div>
      </nav>

      {/* Desktop User Info and Logout */}
      <div className="p-4 border-t border-white/20 space-y-3">
        {/* User Info (when expanded) */}
        {!isCollapsed && currentUser && (
          <div className="flex items-center gap-3 text-white">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">
                {currentUser.username || 'User'}
              </div>
              <div className="text-xs text-blue-200 truncate">
                {getRoleName(currentUser.role)}
              </div>
            </div>
          </div>
        )}
        
        {/* Logout Button */}
        {onLogout && (
          <Button
            variant="ghost"
            onClick={onLogout}
            className={`text-white hover:bg-white/20 transition-all duration-200 w-full ${
              isCollapsed ? 'justify-center px-2 py-2' : 'justify-start px-4 py-2'
            }`}
            title={isCollapsed ? 'ອອກຈາກລະບົບ' : ''}
          >
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <LogOut className="w-4 h-4" />
              </div>
              {!isCollapsed && (
                <span className="text-sm font-medium">
                  ອອກຈາກລະບົບ
                </span>
              )}
            </div>
          </Button>
        )}
      </div>
        </div>
      )}
    </>
  );
};

export default SidebarMenu;
