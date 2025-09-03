"use client";

import React from 'react';
import Image from 'next/image';
import { Button } from './button';
import {
  Dialog,
  DialogContent,
} from './dialog';

interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  loading?: boolean;
}

export const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  title = "ທ່ານຕ້ອງການລຶບລາຍການນີ້ແທ້ ຫຼື ບໍ່ ?",
  loading = false
}) => {
  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm w-full mx-4 bg-white">
        <div className="text-center py-4 sm:py-6">
          <p className="text-gray-800 text-base sm:text-lg font-medium mb-4 sm:mb-6 px-2">{title}</p>
          <div className="flex justify-center mb-4 sm:mb-6">
            <Image 
              src="/confrim.png" 
              alt="Confirmation" 
              width={100} 
              height={100}
              className="object-contain w-20 h-20 sm:w-[120px] sm:h-[120px]"
            />
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:space-x-4 px-4">
            <Button 
              onClick={handleCancel}
              disabled={loading}
              className="bg-[#F6FAFF] text-[#247DC9] border border-[#247DC9] hover:bg-[#E8F4FF] px-4 sm:px-6 py-2 disabled:opacity-50 text-sm sm:text-base order-2 sm:order-1"
            >
              ຍົກເລີກ
            </Button>
            <Button 
              onClick={handleConfirm}
              disabled={loading}
              className="bg-[#247DC9] text-[#FFFFFF] hover:bg-[#1e6bb8] px-4 sm:px-6 py-2 disabled:opacity-75 min-w-[80px] text-sm sm:text-base order-1 sm:order-2"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>ກຳລັງລຶບ...</span>
                </div>
              ) : (
                'ລຶບ'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmationDialog;
