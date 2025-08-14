"use client";

import React, { useState } from 'react';
import { Menu, Package, Users, FileText, X } from 'lucide-react';
import { Button } from './button';

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
    id: 'report',
    icon: <FileText className="w-6 h-6" />,
    text: 'ໜ້າລາຍງານ',
    href: '/report',
    roles: ['super_admin']
  }
];

export const SidebarMenu: React.FC<SidebarMenuProps> = ({
  currentUserRole = 'super_admin',
  currentPath = '',
  onMenuClick,
  onCollapseChange
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Filter menu items based on user role
  const visibleMenuItems = menuItems.filter(item => 
    item.roles.includes(currentUserRole)
  );

  const handleMenuClick = (href: string) => {
    if (onMenuClick) {
      onMenuClick(href);
    }
  };

  const toggleCollapse = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    if (onCollapseChange) {
      onCollapseChange(newCollapsedState);
    }
  };

  return (
    <div className={`bg-[#0c64b0] flex flex-col transition-all duration-300 ${
      isCollapsed ? 'w-20' : 'w-64'
    }`}>
      {/* Header with Menu Icon */}
      <div className="px-4 py-4 flex justify-start">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleCollapse}
          className="text-white hover:bg-white/20 p-2"
        >
          {isCollapsed ? (
            <Menu className="w-6 h-6" />
          ) : (
            <X className="w-6 h-6" />
          )}
        </Button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 py-4 border-t border-white/20">
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

      {/* User Role Display (when expanded) */}
      {!isCollapsed && (
        <div className="p-4 border-t border-white/20">
          <div className="text-xs text-blue-200 text-center">
            {currentUserRole === 'super_admin' && 'ຊູບເປີແອັດມິນ'}
            {currentUserRole === 'thai_admin' && 'ແອັດມິນສາຂາໄທ'}
            {currentUserRole === 'lao_admin' && 'ແອັດມິນສາຂາລາວ'}
          </div>
        </div>
      )}
    </div>
  );
};

export default SidebarMenu;
