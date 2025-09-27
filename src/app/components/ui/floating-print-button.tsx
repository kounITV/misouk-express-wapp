"use client";

import React from 'react';
import { Printer } from 'lucide-react';
import { Button } from './button';

interface FloatingPrintButtonProps {
  isVisible: boolean;
  selectedCount: number;
  onPrint: () => void;
  className?: string;
}

export const FloatingPrintButton: React.FC<FloatingPrintButtonProps> = ({
  isVisible,
  selectedCount,
  onPrint,
  className = ""
}) => {
  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      <Button
        onClick={onPrint}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 min-w-[60px] h-[60px]"
        title={`ພິມສິນຄ້າທີ່ເລືອກ (${selectedCount} ລາຍການ)`}
      >
        <Printer className="w-6 h-6" />
        {selectedCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
            {selectedCount}
          </span>
        )}
      </Button>
    </div>
  );
};

