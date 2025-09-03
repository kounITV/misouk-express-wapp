"use client";

import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ConfirmationPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}

export const ConfirmationPopup: React.FC<ConfirmationPopupProps> = ({
  open,
  onOpenChange,
  title = "ຢືນຢັນການດຳເນີນງານ",
  message,
  onConfirm,
  onCancel,
  confirmText = "ຢືນຢັນ",
  cancelText = "ຍົກເລີກ",
  loading = false
}) => {
  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs sm:max-w-md w-full mx-2 sm:mx-4 bg-[#ffffff] p-3 sm:p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Confirmation Icon */}
          <div className="w-12 h-12 sm:w-16 sm:h-16 mb-4">
            <img 
              src="/confrim.png" 
              alt="Confirmation" 
              className="w-full h-full object-contain"
            />
          </div>
          
          {/* Title */}
          <h2 className="text-lg sm:text-xl font-bold text-[#0c64b0]">
            {title}
          </h2>
          
          {/* Message */}
          <p className="text-gray-600 text-center whitespace-pre-line text-sm sm:text-base">
            {message}
          </p>
          
          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6 w-full sm:w-auto">
            <button
              onClick={handleCancel}
              disabled={loading}
              className="bg-gray-300 text-gray-700 px-4 sm:px-6 py-2 rounded-md hover:bg-gray-400 transition-colors text-sm sm:text-base disabled:opacity-50 order-2 sm:order-1"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="bg-[#0c64b0] text-white px-4 sm:px-6 py-2 rounded-md hover:bg-[#247dc9] transition-colors text-sm sm:text-base disabled:opacity-75 min-w-[80px] order-1 sm:order-2"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>ກຳລັງປະມວນຜົນ...</span>
                </div>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationPopup;
