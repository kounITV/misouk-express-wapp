"use client";

import React, { useState } from 'react';
import { LogOut } from 'lucide-react';
import Image from 'next/image';
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
  const [loading, setLoading] = useState(false);

  const handleLogoutClick = () => {
    setShowConfirm(true);
  };

  const handleConfirmLogout = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading
      onLogout();
      setShowConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setLoading(false);
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
          <div className="text-center py-6">
            <p className="text-gray-800 text-lg font-medium mb-6">ທ່ານຕ້ອງການອອກຈາກລະບົບແທ້ບໍ່?</p>
            <div className="flex justify-center mb-6">
              <Image 
                src="/confrim.png" 
                alt="Confirmation" 
                width={120} 
                height={120}
                className="object-contain"
              />
            </div>
            <div className="flex justify-center space-x-4">
              <Button 
                onClick={handleCancel}
                disabled={loading}
                className="bg-[#F6FAFF] text-[#247DC9] border border-[#247DC9] hover:bg-[#E8F4FF] px-6 py-2 disabled:opacity-50"
              >
                ຍົກເລີກ
              </Button>
              <Button 
                onClick={handleConfirmLogout}
                disabled={loading}
                className="bg-[#247DC9] text-[#FFFFFF] hover:bg-[#1e6bb8] px-6 py-2 disabled:opacity-75 min-w-[80px]"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>ກຳລັງອອກ...</span>
                  </div>
                ) : (
                  'ຕົກລົງ'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LogoutButton;
