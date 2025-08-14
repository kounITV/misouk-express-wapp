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
      <DialogContent className="max-w-sm bg-white">
        <div className="text-center py-6">
          <p className="text-gray-800 text-lg font-medium mb-6">{title}</p>
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
              onClick={handleConfirm}
              disabled={loading}
              className="bg-[#247DC9] text-[#FFFFFF] hover:bg-[#1e6bb8] px-6 py-2 disabled:opacity-75 min-w-[80px]"
            >
              {loading ? (
                <div className="flex items-center gap-2">
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
