"use client";

import React, { useState } from 'react';
import { LogOut } from 'lucide-react';
import { Button } from './button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './dialog';

interface LogoutButtonProps {
  onLogout: () => void;
  className?: string;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({ 
  onLogout, 
  className = "" 
}) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogoutClick = () => {
    setShowConfirm(true);
  };

  const handleConfirmLogout = () => {
    setShowConfirm(false);
    onLogout();
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogoutClick}
        className={`p-2 rounded-full transition-all duration-200 ${
          className.includes('text-white') 
            ? 'hover:bg-white/20 text-white' 
            : 'hover:bg-gray-100 text-gray-600'
        }`}
      >
        <LogOut className={`w-5 h-5 ${
          className.includes('text-white') ? 'text-white' : 'text-gray-600'
        }`} />
      </Button>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="max-w-sm bg-white">
          <DialogHeader>
            <DialogTitle className="text-center">ຢືນຢັນການອອກຈາກລະບົບ</DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            <p className="text-gray-600">ທ່ານຕ້ອງການອອກຈາກລະບົບແທ້ບໍ່?</p>
          </div>
          <DialogFooter className="flex justify-center space-x-4">
            <Button variant="outline" onClick={handleCancel} className="text-black border-gray-300 hover:bg-gray-50">
              ຍົກເລີກ
            </Button>
            <Button 
              onClick={handleConfirmLogout}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              ຕົກລົງ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LogoutButton;
