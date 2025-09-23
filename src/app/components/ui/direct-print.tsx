"use client";

import React from 'react';
import { Product } from "../../types/product";
import JsBarcode from 'jsbarcode';

interface DirectPrintProps {
  product: Product;
  onPrint?: () => void;
}

interface ReceiptData {
  customerName: string;
  phoneNumber: string;
  price: string;
  timestamp: string;
  trackingCode: string;
}

export const DirectPrint: React.FC<DirectPrintProps> = ({ product, onPrint }) => {
  
  const getCurrentTime = () => {
    const now = new Date();
    return (
      now.toLocaleDateString("en-GB") +
      " " +
      now.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    );
  };

  const getCurrencyInLao = (currency: string | null): string => {
    switch (currency?.toUpperCase()) {
      case 'LAK':
        return 'ກີບ';
      case 'THB':
        return 'ບາດ';
      default:
        return 'ກີບ'; // Default to LAK
    }
  };

  const generateReceiptData = (product: Product): ReceiptData => {
    return {
      customerName: product.client_name || "-",
      phoneNumber: product.client_phone || "-",
      price: product.amount ? `${product.amount.toLocaleString()}` : "0.00",
      timestamp: getCurrentTime(),
      trackingCode: product.tracking_number || "-",
    };
  };

  const generateBarcodeSVG = (trackingCode: string): string => {
    try {
      // Create a temporary canvas to generate barcode
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return '';
      
      // Generate barcode using JsBarcode
      JsBarcode(canvas, trackingCode, {
        format: "CODE128",
        width: 2,
        height: 60,
        displayValue: false,
        margin: 0,
        background: "#ffffff",
        lineColor: "#000000"
      });
      
      // Convert canvas to data URL
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Error generating barcode:', error);
      return '';
    }
  };

  const generatePrintContent = (receiptData: ReceiptData): string => {
    const barcodeImage = generateBarcodeSVG(receiptData.trackingCode);
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>MISOUK PRIME EXPRESS Receipt</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@400;500;600;700&display=swap');
            
            @page {
              margin: 0;
              size: 80mm 200mm;
            }
            
            * {
              font-family: 'Noto Sans Lao', 'Lao UI', 'Phetsarath OT', 'Saysettha OT', Arial, Helvetica, sans-serif !important;
            }
            
            body {
              margin: 0;
              padding: 0;
              font-family: 'Noto Sans Lao', 'Lao UI', 'Phetsarath OT', 'Saysettha OT', Arial, Helvetica, sans-serif !important;
              font-size: 11px;
              line-height: 1.2;
              width: 80mm;
              max-width: 80mm;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
            }
            .receipt-print {
              width: 80mm;
              max-width: 80mm;
              margin: 0;
              padding: 5mm;
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
              margin-bottom: 8mm; 
            }
            .company-logo {
              max-width: 100%;
              height: auto;
              max-height: 20mm;
              margin: 0 0 2mm 0;
            }
            .details { 
              margin-bottom: 8mm; 
            }
            .detail-row { 
              display: flex; 
              justify-content: space-between; 
              margin-bottom: 2mm; 
              font-size: 11px;
            }
            .detail-label {
              color: #777777;
              font-weight: bold;
            }
            .detail-value {
              color: #777777;
            }
            .barcode-section { 
              margin-bottom: 8mm; 
              text-align: center;
            }
            .barcode-container {
              display: flex;
              justify-content: center;
              align-items: center;
              margin-bottom: 2mm;
            }
            .barcode-image {
              max-width: 100%;
              height: auto;
            }
            .tracking-code {
              text-align: center;
              font-size: 10px;
              color: #000;
              margin: 2mm 0;
              font-weight: bold;
            }
            .footer { 
              margin-top: 4mm;
            }
            .contact-title {
              text-align: center;
              font-size: 10px;
              color: #000;
              margin: 2mm 0;
            }
            .contact-info {
              display: flex;
              justify-content: space-between;
              align-items: end;
            }
            .contact-details {
              font-size: 9px;
              color: #000;
            }
            .contact-details p {
              margin: 0;
              display: flex;
              align-items: center;
              gap: 2px;
            }
            .contact-icon {
              width: 8px;
              height: 8px;
              display: inline-block;
            }
            .qr-code {
              width: 12mm;
              height: 12mm;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .qr-code img {
              width: 100%;
              height: 100%;
              object-fit: contain;
            }
            hr {
              border: none;
              border-top: 1px solid #000;
              margin: 2mm 0;
            }
          </style>
        </head>
        <body>
          <div class="receipt-print">
            <div class="header">
              <img src="/logo-02.png" alt="MISOUK" class="company-logo" />
              <hr />
            </div>
            
            <div class="details">
              <div class="detail-row">
                <span class="detail-label">ຊື່:</span>
                <span class="detail-value">${receiptData.customerName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">ເບີໂທ:</span>
                <span class="detail-value">${receiptData.phoneNumber}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">ລາຄາ:</span>
                <span class="detail-value">${receiptData.price} ${getCurrencyInLao(product.currency)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">ເວລາອອກບິນ:</span>
                <span class="detail-value">${receiptData.timestamp}</span>
              </div>
              <hr />
            </div>
            
            <div class="barcode-section">
              <div class="barcode-container">
                ${barcodeImage ? `<img src="${barcodeImage}" alt="Barcode" class="barcode-image" />` : ''}
              </div>
              <p class="tracking-code">${receiptData.trackingCode}</p>
              <hr />
            </div>
            
            <div class="footer">
              <p class="contact-title">ຂໍ້ມູນການຕິດຕໍ່</p>
              <div class="contact-info">
                <div class="contact-details">
                  <p>
                    <img src="/call.png" alt="phone" class="contact-icon" />
                    021 12345678
                  </p>
                  <p>
                    <img src="/facebook.png" alt="facebook" class="contact-icon" />
                    misouk express
                  </p>
                </div>
                <div class="qr-code">
                  <img src="/qr-code.png" alt="QR Code" />
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const printReceipt = () => {
    const receiptData = generateReceiptData(product);
    const printContent = generatePrintContent(receiptData);

    // Create a hidden iframe for printing
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.left = '-9999px';
    iframe.style.top = '-9999px';
    iframe.style.width = '1px';
    iframe.style.height = '1px';
    iframe.style.border = 'none';
    
    document.body.appendChild(iframe);
    
    iframe.contentDocument?.write(printContent);
    iframe.contentDocument?.close();
    
    // Wait for content to load, then print
    iframe.onload = () => {
      // Wait for fonts to load before printing
      const waitForFonts = () => {
        if (iframe.contentDocument?.fonts) {
          iframe.contentDocument.fonts.ready.then(() => {
            setTimeout(() => {
              iframe.contentWindow?.print();
              // Clean up after printing
              setTimeout(() => {
                document.body.removeChild(iframe);
              }, 1000);
            }, 200);
          });
        } else {
          // Fallback if fonts API is not available
          setTimeout(() => {
            iframe.contentWindow?.print();
            // Clean up after printing
            setTimeout(() => {
              document.body.removeChild(iframe);
            }, 1000);
          }, 500);
        }
      };
      
      waitForFonts();
    };

    // Call optional callback
    if (onPrint) {
      onPrint();
    }
  };

  // Return null since this component is used for its functionality, not rendering
  return null;
};

// Hook for using the print functionality
export const useDirectPrint = () => {
  const getCurrencyInLao = (currency: string | null): string => {
    switch (currency?.toUpperCase()) {
      case 'LAK':
        return 'ກີບ';
      case 'THB':
        return 'ບາດ';
      default:
        return 'ກີບ'; // Default to LAK
    }
  };

  const generateBarcodeSVG = (trackingCode: string): string => {
    try {
      // Create a temporary canvas to generate barcode
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return '';
      
      // Generate barcode using JsBarcode
      JsBarcode(canvas, trackingCode, {
        format: "CODE128",
        width: 2,
        height: 60,
        displayValue: false,
        margin: 0,
        background: "#ffffff",
        lineColor: "#000000"
      });
      
      // Convert canvas to data URL
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Error generating barcode:', error);
      return '';
    }
  };

  const printProductReceipt = (product: Product, onPrint?: () => void) => {
    const receiptData = {
      customerName: product.client_name || "-",
      phoneNumber: product.client_phone || "-",
      price: product.amount ? `${product.amount.toLocaleString()}` : "0.00",
      timestamp: new Date().toLocaleDateString("en-GB") + " " + 
                 new Date().toLocaleTimeString("en-GB", {
                   hour: "2-digit",
                   minute: "2-digit",
                   second: "2-digit",
                 }),
      trackingCode: product.tracking_number || "-",
    };

    const barcodeImage = generateBarcodeSVG(receiptData.trackingCode);

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>MISOUK PRIME EXPRESS Receipt</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@400;500;600;700&display=swap');
            
            @page {
              margin: 0;
              size: 80mm 200mm;
            }
            
            * {
              font-family: 'Noto Sans Lao', 'Lao UI', 'Phetsarath OT', 'Saysettha OT', Arial, Helvetica, sans-serif !important;
            }
            
            body {
              margin: 0;
              padding: 0;
              font-family: 'Noto Sans Lao', 'Lao UI', 'Phetsarath OT', 'Saysettha OT', Arial, Helvetica, sans-serif !important;
              font-size: 11px;
              line-height: 1.2;
              width: 80mm;
              max-width: 80mm;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
            }
            .receipt-print {
              width: 80mm;
              max-width: 80mm;
              margin: 0;
              padding: 5mm;
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
              margin-bottom: 8mm; 
            }
            .company-logo {
              max-width: 100%;
              height: auto;
              max-height: 20mm;
              margin: 0 0 2mm 0;
            }
            .details { 
              margin-bottom: 8mm; 
            }
            .detail-row { 
              display: flex; 
              justify-content: space-between; 
              margin-bottom: 2mm; 
              font-size: 11px;
            }
            .detail-label {
              color: #777777;
              font-weight: bold;
              font-size: 16px;
            }
            .detail-value {
              color: #777777;
              font-weight: bold;
              font-size: 16px;
            }
            .barcode-section { 
              text-align: center;
            }
            .barcode-container {
              display: flex;
              justify-content: center;
              align-items: center;
              margin-bottom: 2mm;
            }
            .barcode-image {
              max-width: 100%;
              height: auto;
            }
            .tracking-code {
              text-align: center;
              font-size: 16px;
              color: #777777;
              margin: 2mm 0;
              font-weight: bold;
            }
            .footer { 
              //margin-top: 4mm;
            }
            .contact-title {
              text-align: center;
              font-size: 16px;
              color: #777777;
              font-weight: bold;
            }
            .contact-icon {
              width: 16px;
              height: 16px;
              display: inline-block;
              background-color: #777777;
            }
            .contact-info {
              display: flex;
              justify-content: space-between;
              align-items: end;
            }
            .contact-details {
              font-size: 16px;
              color: #777777;
              font-weight: bold;
            }
            .contact-details p {
              margin: 0;
            }
            .qr-code {
              width: 16mm;
              height: 16mm;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .qr-code img {
              width: 100%;
              height: 100%;
              object-fit: contain;
            }
            hr {
              border: none;
              border-top: 1px solid #000;
              margin: 2mm 0;
            }
          </style>
        </head>
        <body>
          <div class="receipt-print">
          <br/>
            <div class="header">
              <img src="/logo-02.png" alt="MISOUK" class="company-logo" />
              <hr />
            </div>
            
            <div class="details">
              <div class="detail-row">
                <span class="detail-label">ຊື່:</span>
                <span class="detail-value">${receiptData.customerName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">ເບີໂທ:</span>
                <span class="detail-value">${receiptData.phoneNumber}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">ລາຄາ:</span>
                <span class="detail-value">${receiptData.price} ${getCurrencyInLao(product.currency)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">ເວລາອອກບິນ:</span>
                <span class="detail-value">${receiptData.timestamp}</span>
              </div>
              <hr />
            </div>
            
            <div class="barcode-section">
              <div class="barcode-container">
                ${barcodeImage ? `<img src="${barcodeImage}" alt="Barcode" class="barcode-image" />` : ''}
              </div>
              <p class="tracking-code">${receiptData.trackingCode}</p>
              <br />
              <hr />
            </div>
            
            <div class="footer">
              <p class="contact-title">ຂໍ້ມູນການຕິດຕໍ່</p>
              <div class="contact-info">
                <div class="contact-details">
                  <p>
                    <img src="/call.png" alt="phone" class="contact-icon" />
                    021 12345678
                  </p>
                  <p>
                    <img src="/facebook.png" alt="facebook" class="contact-icon" />
                    misouk express
                  </p>
                </div>
                <div class="qr-code">
                  <img src="/qr-code.png" alt="QR Code" />
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Create a hidden iframe for printing
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.left = '-9999px';
    iframe.style.top = '-9999px';
    iframe.style.width = '1px';
    iframe.style.height = '1px';
    iframe.style.border = 'none';
    
    document.body.appendChild(iframe);
    
    iframe.contentDocument?.write(printContent);
    iframe.contentDocument?.close();
    
    // Wait for content to load, then print
    iframe.onload = () => {
      // Wait for fonts to load before printing
      const waitForFonts = () => {
        if (iframe.contentDocument?.fonts) {
          iframe.contentDocument.fonts.ready.then(() => {
            setTimeout(() => {
              iframe.contentWindow?.print();
              // Clean up after printing
              setTimeout(() => {
                document.body.removeChild(iframe);
              }, 1000);
            }, 200);
          });
        } else {
          // Fallback if fonts API is not available
          setTimeout(() => {
            iframe.contentWindow?.print();
            // Clean up after printing
            setTimeout(() => {
              document.body.removeChild(iframe);
            }, 1000);
          }, 500);
        }
      };
      
      waitForFonts();
    };

    // Call optional callback
    if (onPrint) {
      onPrint();
    }
  };

  return { printProductReceipt };
};

export default DirectPrint;
