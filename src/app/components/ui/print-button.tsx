"use client";

import React, { forwardRef, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Button } from './button';
import { Printer } from 'lucide-react';

interface PrintButtonProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  printTitle?: string;
  onBeforePrint?: () => void;
  onAfterPrint?: () => void;
  onPrintError?: (errorLocation: string, error: Error) => void;
  disabled?: boolean;
  buttonText?: string;
  showIcon?: boolean;
}

export const PrintButton = forwardRef<HTMLButtonElement, PrintButtonProps>(
  ({
    children,
    className,
    variant = "outline",
    size = "default",
    printTitle = "Document",
    onBeforePrint,
    onAfterPrint,
    onPrintError,
    disabled = false,
    buttonText = "Print",
    showIcon = true,
    ...props
  }, ref) => {
    const componentRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
      content: () => componentRef.current,
      documentTitle: printTitle,
      onBeforePrint,
      onAfterPrint,
      onPrintError,
      pageStyle: `
        @page {
          margin: 0.25in;
          size: A4;
        }
        body {
          margin: 0 !important;
          padding: 0 !important;
          font-size: 12px !important;
          line-height: 1.2 !important;
          height: 100vh !important;
          overflow: hidden !important;
        }
        .receipt-print {
          width: 100% !important;
          max-width: 3.5in !important;
          max-height: 10in !important;
          margin: 0 auto !important;
          padding: 8px !important;
          font-family: 'Courier New', monospace !important;
          font-size: 10px !important;
          line-height: 1.0 !important;
          page-break-inside: avoid !important;
          page-break-after: avoid !important;
          page-break-before: avoid !important;
          overflow: hidden !important;
          box-sizing: border-box !important;
        }
        .receipt-print * {
          page-break-inside: avoid !important;
          page-break-after: avoid !important;
          page-break-before: avoid !important;
        }
      `,
    });

    return (
      <>
        <Button
          ref={ref}
          onClick={handlePrint}
          variant={variant}
          size={size}
          className={className}
          disabled={disabled}
          {...props}
        >
          {showIcon && <Printer className="w-4 h-4 mr-2" />}
          {buttonText}
        </Button>
        
        {/* Hidden content that will be printed */}
        <div style={{ display: 'none' }}>
          <div ref={componentRef}>
            {children}
          </div>
        </div>
      </>
    );
  }
);

PrintButton.displayName = "PrintButton";

// Alternative component for when you want to control the print content separately
interface PrintWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export const PrintWrapper = forwardRef<HTMLDivElement, PrintWrapperProps>(
  ({ children, className }, ref) => {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }
);

PrintWrapper.displayName = "PrintWrapper";

// Hook for custom print functionality
export const usePrint = (printTitle?: string) => {
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: printTitle || "Document",
    pageStyle: `
      @page {
        margin: 0.25in;
        size: A4;
      }
      body {
        margin: 0 !important;
        padding: 0 !important;
        font-size: 12px !important;
        line-height: 1.2 !important;
        height: 100vh !important;
        overflow: hidden !important;
      }
      .receipt-print {
        width: 100% !important;
        max-width: 3.5in !important;
        max-height: 10in !important;
        margin: 0 auto !important;
        padding: 8px !important;
        font-family: 'Courier New', monospace !important;
        font-size: 10px !important;
        line-height: 1.0 !important;
        page-break-inside: avoid !important;
        page-break-after: avoid !important;
        page-break-before: avoid !important;
        overflow: hidden !important;
        box-sizing: border-box !important;
      }
      .receipt-print * {
        page-break-inside: avoid !important;
        page-break-after: avoid !important;
        page-break-before: avoid !important;
      }
    `,
  });

  return {
    componentRef,
    handlePrint,
  };
};
