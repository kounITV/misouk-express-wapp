"use client";

import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface AlertPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  message: string;
  type?: 'error' | 'warning' | 'success' | 'info';
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export const AlertPopup: React.FC<AlertPopupProps> = ({
  open,
  onOpenChange,
  title,
  message,
  type = 'info',
  onConfirm,
  confirmText = "ຕົກລົງ",
  cancelText = "ຍົກເລີກ"
}) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'error':
        return {
          iconColor: 'text-red-500',
          titleColor: 'text-red-600',
          buttonColor: 'bg-red-500 hover:bg-red-600'
        };
      case 'warning':
        return {
          iconColor: 'text-yellow-500',
          titleColor: 'text-yellow-600',
          buttonColor: 'bg-yellow-500 hover:bg-yellow-600'
        };
      case 'success':
        return {
          iconColor: 'text-green-500',
          titleColor: 'text-green-600',
          buttonColor: 'bg-green-500 hover:bg-green-600'
        };
      default:
        return {
          iconColor: 'text-blue-500',
          titleColor: 'text-blue-600',
          buttonColor: 'bg-blue-500 hover:bg-blue-600'
        };
    }
  };

  const styles = getTypeStyles();

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs sm:max-w-md w-full mx-2 sm:mx-4 bg-[#ffffff] flex flex-col p-3 sm:p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Alert Icon */}
          <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center ${styles.iconColor}`}>
            {type === 'error' && (
              <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
            {type === 'warning' && (
              <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
            {type === 'success' && (
              <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
            {type === 'info' && (
              <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          
          {/* Alert Title */}
          {title && (
            <h2 className={`text-lg sm:text-xl font-bold ${styles.titleColor}`}>
              {title}
            </h2>
          )}
          
          {/* Alert Message */}
          <p 
            className={`text-center whitespace-pre-line text-sm sm:text-base ${
              type === 'error' ? 'text-red-600' : 
              type === 'warning' ? 'text-yellow-600' : 
              type === 'success' ? 'text-green-600' : 
              'text-gray-600'
            }`}
            dangerouslySetInnerHTML={{ __html: message }}
          />
          
          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6 w-full sm:w-auto">
            {onConfirm && (
              <button
                onClick={() => onOpenChange(false)}
                className="bg-gray-300 text-gray-700 px-4 sm:px-6 py-2 rounded-md hover:bg-gray-400 transition-colors text-sm sm:text-base order-2 sm:order-1"
              >
                {cancelText}
              </button>
            )}
            <button
              onClick={handleConfirm}
              className={`text-white px-4 sm:px-6 py-2 rounded-md transition-colors text-sm sm:text-base order-1 sm:order-2 ${styles.buttonColor}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AlertPopup;
