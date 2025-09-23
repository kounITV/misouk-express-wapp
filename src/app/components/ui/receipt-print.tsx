"use client";

import React from 'react';
import { PrintButton } from './print-button';
import { Button } from './button';

interface ReceiptData {
  customerName: string;
  phoneNumber: string;
  price: string;
  timestamp: string;
  trackingCode?: string;
  date?: string;
}

interface ReceiptPrintProps {
  data: ReceiptData;
  printTitle?: string;
  buttonText?: string;
  buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  className?: string;
  directPrint?: boolean; // New prop for direct printing
}

export const ReceiptPrint: React.FC<ReceiptPrintProps> = ({
  data,
  printTitle = "MISOUK PRIME EXPRESS Receipt",
  buttonText = "Print Receipt",
  buttonVariant = "outline",
  className = "",
  directPrint = false
}) => {

  // Direct print function
  const handleDirectPrint = () => {
    // Create a hidden iframe for printing
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.left = '-9999px';
    iframe.style.top = '-9999px';
    iframe.style.width = '1px';
    iframe.style.height = '1px';
    iframe.style.border = 'none';
    
    document.body.appendChild(iframe);
    
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${printTitle}</title>
          <style>
            @page {
              margin: 0.25in;
              size: A4;
            }
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
              font-size: 12px;
              line-height: 1.2;
            }
            .receipt-print {
              width: 100%;
              max-width: 3.5in;
              margin: 0 auto;
              padding: 10px;
              page-break-inside: avoid;
              page-break-after: avoid;
              page-break-before: avoid;
            }
            .receipt-print * {
              page-break-inside: avoid;
              page-break-after: avoid;
              page-break-before: avoid;
            }
            .header { 
              text-align: center; 
              margin-bottom: 24px; 
            }
            .company-name {
              font-size: 24px;
              font-weight: bold;
              color: #2563eb;
              margin: 0 0 4px 0;
            }
            .details { 
              margin-bottom: 24px; 
            }
            .detail-row { 
              display: flex; 
              justify-content: space-between; 
              margin-bottom: 4px; 
              font-size: 14px;
            }
            .detail-label {
              color: #888888;
            }
            .detail-value {
              color: #000;
            }
            .barcode-section { 
              margin-bottom: 16px; 
            }
            .barcode-container {
              background: #000;
              height: 48px;
              display: flex;
              align-items: end;
              justify-content: center;
            }
            .barcode-bars {
              display: flex;
              gap: 1px;
              height: 100%;
              align-items: end;
            }
            .barcode-bar { 
              width: 1px; 
              background: #fff; 
            }
            .tracking-code {
              text-align: center;
              font-size: 12px;
              color: #777777;
              margin: 4px 0;
            }
            .footer { 
              margin-top: 4px;
            }
            .contact-title {
              text-align: center;
              font-size: 12px;
              color: #777777;
              margin: 4px 0;
            }
            .contact-info {
              display: flex;
              justify-content: space-between;
              align-items: end;
            }
            .contact-details {
              font-size: 12px;
              color: #777777;
            }
            .contact-details p {
              margin: 0;
            }
            .qr-code {
              width: 48px;
              height: 48px;
              border: 1px solid #777777;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .qr-inner {
              width: 40px;
              height: 40px;
              background: #000;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .qr-grid {
              width: 32px;
              height: 32px;
              background: #fff;
              display: grid;
              grid-template-columns: repeat(8, 1fr);
              gap: 1px;
            }
            .qr-dot {
              width: 100%;
              height: 100%;
            }
            .qr-dot.black {
              background: #000;
            }
            .qr-dot.white {
              background: #fff;
            }
          </style>
        </head>
        <body>
          <div class="receipt-print">
            <div class="header">
              <h1 class="company-name">MISOUK</h1>
              <hr />
            </div>
            
            <div class="details">
              <div class="detail-row">
                <span class="detail-label">ຊື່:</span>
                <span class="detail-value">${data.customerName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">ເບີໂທ:</span>
                <span class="detail-value">${data.phoneNumber}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">ລາຄາ:</span>
                <span class="detail-value">${data.price} LAK</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">ເວລາອອກບິນ</span>
                <span class="detail-value">${data.timestamp}</span>
              </div>
              <br />
              <hr />
            </div>
            
            <div class="barcode-section">
              <div class="barcode-container">
                <div class="barcode-bars">
                  ${Array.from({ length: 40 }, (_, i) => 
                    `<div class="barcode-bar" style="height: ${Math.random() * 60 + 40}%;"></div>`
                  ).join('')}
                </div>
              </div>
              <p class="tracking-code">${data.trackingCode}</p>
              <br />
              <hr />
            </div>
            
            <div class="footer">
              <p class="contact-title">ຂໍ້ມູນການຕິດຕໍ່</p>
              <div class="contact-info">
                <div class="contact-details">
                  <p>021 12345678</p>
                  <p>misouk express</p>
                </div>
                <div class="qr-code">
                  <div class="qr-inner">
                    <div class="qr-grid">
                      ${Array.from({ length: 64 }, (_, i) => 
                        `<div class="qr-dot ${Math.random() > 0.5 ? 'black' : 'white'}"></div>`
                      ).join('')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    iframe.contentDocument?.write(printContent);
    iframe.contentDocument?.close();
    
    // Wait for content to load, then print
    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow?.print();
        // Clean up after printing
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 100);
    };
  };

  if (directPrint) {
    return (
      <Button
        onClick={handleDirectPrint}
        variant={buttonVariant}
        className={className}
      >
        {buttonText}
      </Button>
    );
  }

  return (
    <div className={className}>
      <PrintButton
        printTitle={printTitle}
        buttonText={buttonText}
        variant={buttonVariant}
        className="mb-4"
      >
        <div className="receipt-print bg-white text-black">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-blue-600 mb-1">
              MISOUK
            </h1>
            <hr />
          </div>

          {/* Receipt Details */}
          <div className="space-y-1 text-sm mb-6">
            <div className="flex justify-between">
              <span className="text-[#888888]">ຊື່:</span>
              <span className="text-black">
                {data.customerName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#888888]">ເບີໂທ:</span>
              <span className="text-black">
                {data.phoneNumber}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#888888]">ລາຄາ:</span>
              <span className="text-black">{data.price} LAK</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#888888]">ເວລາອອກບິນ</span>
              <span className="text-black">{data.timestamp}</span>
            </div>
            <br />
            <hr />
          </div>

          {/* Barcode */}
          <div className="mb-4">
            <div className="bg-black h-12 flex items-end justify-center">
              <div className="flex space-x-px h-full items-end">
                {Array.from({ length: 40 }, (_, i) => (
                  <div
                    key={i}
                    className="bg-white w-px"
                    style={{
                      height: `${Math.random() * 60 + 40}%`,
                    }}
                  />
                ))}
              </div>
            </div>
            <p className="text-center text-xs text-[#777777] mt-1">
              {data.trackingCode}
            </p>
            <br />
            <hr />
          </div>

          {/* Footer with QR Code */}
          <p className="text-center text-xs text-[#777777] mt-1">
            ຂໍ້ມູນການຕິດຕໍ່
          </p>
          <div className="flex justify-between items-end">
            <div className="text-xs text-[#777777]">
              <p>021 12345678</p>
              <p>misouk express</p>
            </div>
            <div className="w-12 h-12 border border-[#777777] flex items-center justify-center">
              <div className="w-10 h-10 bg-black flex items-center justify-center">
                <div className="w-8 h-8 bg-white grid grid-cols-8 gap-px">
                  {Array.from({ length: 64 }, (_, i) => (
                    <div
                      key={i}
                      className={`${
                        Math.random() > 0.5
                          ? "bg-black"
                          : "bg-white"
                      } w-full h-full`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </PrintButton>
    </div>
  );
};

// Alternative component for custom print button
interface ReceiptContentProps {
  data: ReceiptData;
  className?: string;
}

export const ReceiptContent: React.FC<ReceiptContentProps> = ({
  data,
  className = ""
}) => {

  return (
    <div className={`receipt-print bg-white text-black ${className}`}>
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-blue-600 mb-1">
          MISOUK
        </h1>
        <hr />
      </div>

      {/* Receipt Details */}
      <div className="space-y-1 text-sm mb-6">
        <div className="flex justify-between">
          <span className="text-[#888888]">ຊື່:</span>
          <span className="text-black">
            {data.customerName}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#888888]">ເບີໂທ:</span>
          <span className="text-black">
            {data.phoneNumber}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#888888]">ລາຄາ:</span>
          <span className="text-black">{data.price} LAK</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#888888]">ເວລາອອກບິນ</span>
          <span className="text-black">{data.timestamp}</span>
        </div>
        <br />
        <hr />
      </div>

      {/* Barcode */}
      <div className="mb-4">
        <div className="bg-black h-12 flex items-end justify-center">
          <div className="flex space-x-px h-full items-end">
            {Array.from({ length: 40 }, (_, i) => (
              <div
                key={i}
                className="bg-white w-px"
                style={{
                  height: `${Math.random() * 60 + 40}%`,
                }}
              />
            ))}
          </div>
        </div>
        <p className="text-center text-xs text-[#777777] mt-1">
          {data.trackingCode}
        </p>
        <br />
        <hr />
      </div>

      {/* Footer with QR Code */}
      <p className="text-center text-xs text-[#777777] mt-1">
        ຂໍ້ມູນການຕິດຕໍ່
      </p>
      <div className="flex justify-between items-end">
        <div className="text-xs text-[#777777]">
          <p>021 12345678</p>
          <p>misouk express</p>
        </div>
        <div className="w-12 h-12 border border-[#777777] flex items-center justify-center">
          <div className="w-10 h-10 bg-black flex items-center justify-center">
            <div className="w-8 h-8 bg-white grid grid-cols-8 gap-px">
              {Array.from({ length: 64 }, (_, i) => (
                <div
                  key={i}
                  className={`${
                    Math.random() > 0.5
                      ? "bg-black"
                      : "bg-white"
                  } w-full h-full`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
