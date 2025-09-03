"use client";

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface SuccessPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  message?: string;
  autoCloseTimer?: number; // in milliseconds, default 5000ms (5s)
  showTimer?: boolean;
}

export const SuccessPopup: React.FC<SuccessPopupProps> = ({
  open,
  onOpenChange,
  title = "ສຳເລັດ!",
  message = "ການດຳເນີນງານສຳເລັດແລ້ວ",
  autoCloseTimer = 5000,
  showTimer = true
}) => {
  const [timeLeft, setTimeLeft] = useState(Math.ceil(autoCloseTimer / 1000));
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    if (open && autoCloseTimer > 0) {
      setTimeLeft(Math.ceil(autoCloseTimer / 1000));
      setTimerActive(true);
      
      // Auto close timer
      const autoCloseTimeout = setTimeout(() => {
        onOpenChange(false);
        setTimerActive(false);
      }, autoCloseTimer);

      // Countdown timer for display
      const countdownInterval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearTimeout(autoCloseTimeout);
        clearInterval(countdownInterval);
        setTimerActive(false);
      };
    }
  }, [open, autoCloseTimer, onOpenChange]);

  const handleManualClose = () => {
    setTimerActive(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full mx-4 bg-[#ffffff] flex flex-col items-center p-6 sm:p-8">
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Success Image */}
          <div className="w-16 h-16 sm:w-24 sm:h-24 mb-4">
            <img 
              src="/confrim.png" 
              alt="Success" 
              className="w-full h-full object-contain"
            />
          </div>
          
          {/* Success Title */}
          <h2 className="text-xl sm:text-2xl font-bold text-[#00693e]">
            {title}
          </h2>
          
          {/* Success Message */}
          <p className="text-gray-600 text-center text-sm sm:text-base">
            {message}
          </p>
          
          {/* Timer Display */}
          {/* {showTimer && timerActive && (
            <div className="text-sm text-gray-500">
              ປິດອັດຕະໂນມັດໃນ {timeLeft} ວິນາທີ
            </div>
          )} */}
          
          {/* OK Button */}
          <button
            onClick={handleManualClose}
            className="bg-[#00693e] text-white px-6 sm:px-8 py-2 sm:py-3 rounded-md hover:bg-[#005530] transition-colors font-medium mt-4 text-sm sm:text-base"
          >
            ຕົກລົງ
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SuccessPopup;
