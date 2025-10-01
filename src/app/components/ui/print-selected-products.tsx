"use client";

import React, { useCallback } from 'react';
import { Product } from '@/types/product';
import JsBarcode from 'jsbarcode';

interface PrintSelectedProductsProps {
  selectedProducts: Product[];
  onPrint?: () => void;
}

export const PrintSelectedProducts: React.FC<PrintSelectedProductsProps> = ({
  selectedProducts,
  onPrint
}) => {
  // Helper functions for receipt generation
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

  const generateReceiptContent = (product: Product): string => {
    const barcodeImage = generateBarcodeSVG(product.tracking_number);
    
    return `
      <div class="receipt-print">
        <div class="header">
          <img src="/logo-02.png" alt="MISOUK" class="company-logo" />
          <hr />
        </div>
        
        <div class="details">
          <div class="detail-row">
            <span class="detail-label">ຊື່:</span>
            <span class="detail-value">${product.client_name || "-"}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">ເບີໂທ:</span>
            <span class="detail-value">${product.client_phone || "-"}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">ລາຄາ:</span>
            <span class="detail-value">${product.amount ? `${product.amount.toLocaleString()}` : "0.00"} ${getCurrencyInLao(product.currency)}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">ເວລາອອກບິນ:</span>
            <span class="detail-value">${getCurrentTime()}</span>
          </div>
          <hr />
        </div>
        
        <div class="barcode-section">
          <div class="barcode-container">
            ${barcodeImage ? `<img src="${barcodeImage}" alt="Barcode" class="barcode-image" />` : ''}
          </div>
          <p class="tracking-code">${product.tracking_number || "-"}</p>
          <hr />
        </div>
        
        <div class="footer">
          <p class="contact-title">ຂໍ້ມູນການຕິດຕໍ່</p>
          <div class="contact-info">
            <div class="contact-details">
              <p>
                <img src="/call.png" alt="phone" class="contact-icon" />
                020 76677945
              </p>
              <p>
                <img src="/facebook.png" alt="facebook" class="contact-icon" />
                ມີສຸກ ຂົນສົງ - Misouk Express
              </p>
            </div>
            <div class="qr-code">
              <img src="/qr-code.png" alt="QR Code" />
            </div>
          </div>
        </div>
      </div>
    `;
  };

  const printSelectedProducts = useCallback(() => {
    if (selectedProducts.length === 0) return;
    
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
          <title>MISOUK PRIME EXPRESS Receipts</title>
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
              page-break-after: always;
              page-break-before: avoid;
            }
            .receipt-print:last-child {
              page-break-after: avoid;
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
          ${selectedProducts.map(product => generateReceiptContent(product)).join('')}
        </body>
      </html>
    `;

    iframe.contentDocument?.write(printContent);
    iframe.contentDocument?.close();
    
    // Wait for content to load, then print
    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow?.print();
        
        // Call callback after print dialog is shown
        if (onPrint) {
          onPrint();
        }
        
        // Clean up after printing
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 100);
    };
  }, [selectedProducts, onPrint]);

  // Return null since this component is used for its functionality, not rendering
  return null;
};

// Hook for using the print functionality
export const usePrintSelectedProducts = () => {
  const printSelectedProducts = useCallback((products: Product[], onPrint?: () => void) => {
    if (products.length === 0) return;
    
    // Create a hidden iframe for printing
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.left = '-9999px';
    iframe.style.top = '-9999px';
    iframe.style.width = '1px';
    iframe.style.height = '1px';
    iframe.style.border = 'none';
    
    document.body.appendChild(iframe);
    
    // Helper functions
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
          return 'ກີບ';
      }
    };

    const generateBarcodeSVG = (trackingCode: string): string => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) return '';
        
        JsBarcode(canvas, trackingCode, {
          format: "CODE128",
          width: 2,
          height: 60,
          displayValue: false,
          margin: 0,
          background: "#ffffff",
          lineColor: "#000000"
        });
        
        return canvas.toDataURL('image/png');
      } catch (error) {
        console.error('Error generating barcode:', error);
        return '';
      }
    };

    const generateReceiptContent = (product: Product): string => {
      const barcodeImage = generateBarcodeSVG(product.tracking_number);
      
      return `
        <div class="receipt-print">
          <div class="header">
            <img src="/logo-02.png" alt="MISOUK" class="company-logo" />
            <hr />
          </div>
          
          <div class="details">
            <div class="detail-row">
              <span class="detail-label">ຊື່:</span>
              <span class="detail-value">${product.client_name || "-"}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">ເບີໂທ:</span>
              <span class="detail-value">${product.client_phone || "-"}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">ລາຄາ:</span>
              <span class="detail-value">${product.amount ? `${product.amount.toLocaleString()}` : "0.00"} ${getCurrencyInLao(product.currency)}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">ເວລາອອກບິນ:</span>
              <span class="detail-value">${getCurrentTime()}</span>
            </div>
            <hr />
          </div>
          
          <div class="barcode-section">
            <div class="barcode-container">
              ${barcodeImage ? `<img src="${barcodeImage}" alt="Barcode" class="barcode-image" />` : ''}
            </div>
            <p class="tracking-code">${product.tracking_number || "-"}</p>
            <hr />
          </div>
          
          <div class="footer">
            <p class="contact-title">ຂໍ້ມູນການຕິດຕໍ່</p>
            <div class="contact-info">
              <div class="contact-details">
                <p>
                  <img src="/call.png" alt="phone" class="contact-icon" />
                  020 76677945
                </p>
                <p>
                  <img src="/facebook.png" alt="facebook" class="contact-icon" />
                  ມີສຸກ ຂົນສົງ - Misouk Express
                </p>
              </div>
              <div class="qr-code">
                <img src="/qr-code.png" alt="QR Code" />
              </div>
            </div>
          </div>
        </div>
      `;
    };
    
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>MISOUK PRIME EXPRESS Receipts</title>
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
              page-break-after: always;
              page-break-before: avoid;
            }
            .receipt-print:last-child {
              page-break-after: avoid;
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
              font-size: 16px;
              color: #777777;
              margin: 2mm 0;
              font-weight: bold;
            }
            .footer { 
              margin-top: 4mm;
            }
            .contact-title {
              text-align: center;
              font-size: 16px;
              color: #777777;
              font-weight: bold;
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
            //   display: flex;
            //   align-items: center;
            //   gap: 2px;
            }
            .contact-icon {
              width: 18px;
              height: 18px;
              display: inline-block;
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
          ${products.map(product => generateReceiptContent(product)).join('')}
        </body>
      </html>
    `;

    iframe.contentDocument?.write(printContent);
    iframe.contentDocument?.close();
    
    // Wait for content to load, then print
    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow?.print();
        
        // Call callback after print dialog is shown
        if (onPrint) {
          onPrint();
        }
        
        // Clean up after printing
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 100);
    };
  }, []);

  return { printSelectedProducts };
};
