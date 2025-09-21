"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Button } from './button';
import { Printer, X } from 'lucide-react';
import { Product } from '../../types/product';

interface ReceiptPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
}

const ReceiptPopup: React.FC<ReceiptPopupProps> = ({ open, onOpenChange, product }) => {
  const [printTime, setPrintTime] = React.useState<string>('');
  
  if (!product) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB') + ' ' + date.toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'AT_THAI_BRANCH': return 'ສິນຄ້າຮອດໄທ';
      case 'EXIT_THAI_BRANCH': return 'ສິນຄ້າອອກຈາກໄທ';
      case 'AT_LAO_BRANCH': return 'ສິນຄ້າຮອດລາວ';
      case 'COMPLETED': return 'ລູກຄ້າຮັບເອົາສິນຄ້າ';
      default: return status;
    }
  };

  const formatCurrency = (currency: string | null): string => {
    if (!currency) return 'LAK';
    return currency === 'LAK' ? 'ກີບ' : currency === 'THB' ? 'ບາດ' : currency;
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const handlePrint = () => {
    // Set current time when printing
    setPrintTime(getCurrentTime());
    
    // Create a temporary print stylesheet
    const printStyles = `
      <style>
        @media print {
          body * { visibility: hidden; }
          .receipt-print, .receipt-print * { visibility: visible; }
          .receipt-print { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%; 
            max-width: 400px; 
            margin: 0 auto; 
            background: white; 
            padding: 20px;
            font-family: Arial, sans-serif;
          }
          .no-print { display: none !important; }
        }
        .receipt-print { 
          max-width: 400px; 
          margin: 0 auto; 
          background: white; 
          padding: 20px;
          font-family: Arial, sans-serif;
        }
        .header { 
          text-align: center; 
          margin-bottom: 20px; 
        }
        .company-name { 
          font-size: 24px; 
          font-weight: bold; 
          color: #0c64b0; 
          margin-bottom: 5px;
        }
        .company-subtitle { 
          font-size: 14px; 
          color: #333; 
        }
        .details { 
          margin-bottom: 20px; 
        }
        .detail-row { 
          display: flex; 
          justify-content: space-between; 
          margin-bottom: 8px; 
          font-size: 14px;
        }
        .detail-label { 
          color: #777777; 
        }
        .detail-value { 
          font-weight: 500; 
          color: #333;
        }
        .barcode-section { 
          text-align: center; 
          margin: 20px 0; 
          padding: 20px 0; 
          border-top: 1px solid #ddd; 
          border-bottom: 1px solid #ddd;
        }
        .barcode { 
          font-family: monospace; 
          font-size: 18px; 
          letter-spacing: 2px; 
          margin: 10px 0;
        }
        .footer { 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          margin-top: 20px; 
          padding-top: 20px; 
          border-top: 1px solid #ddd;
        }
        .contact-info { 
          font-size: 12px; 
          color: #666;
        }
        .qr-placeholder { 
          width: 60px; 
          height: 60px; 
          border: 1px solid #ddd; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          font-size: 10px; 
          color: #999;
        }
      </style>
    `;

    // Add print styles to head
    const styleElement = document.createElement('style');
    styleElement.innerHTML = printStyles;
    document.head.appendChild(styleElement);

    // Add print class to receipt content
    const receiptContent = document.getElementById('receipt-content');
    if (receiptContent) {
      receiptContent.classList.add('receipt-print');
      
      // Hide other elements during print
      const allElements = document.querySelectorAll('body > *:not(.receipt-print)');
      allElements.forEach(el => el.classList.add('no-print'));

      // Print
      window.print();

      // Clean up after printing
      setTimeout(() => {
        receiptContent.classList.remove('receipt-print');
        allElements.forEach(el => el.classList.remove('no-print'));
        document.head.removeChild(styleElement);
      }, 1000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto p-0">
        
        <div className="p-6">
          {/* Receipt Content */}
          <div id="receipt-content" className="receipt bg-white">
            {/* Header */}
            <div className="header">
              <div className="company-name">MISOUK PRIME EXPRESS</div>
              <hr/>
            </div>

            {/* Order Details */}
            <div className="details">
              <div className="detail-row">
                <span className="detail-label">ຊື່:</span>
                <span className="detail-value">{product.client_name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">ເບີໂທ:</span>
                <span className="detail-value">{product.client_phone || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">ລາຄາ:</span>
                <span className="detail-value">
                  {product.amount ? `${product.amount.toLocaleString()} ${formatCurrency(product.currency)}` : '0.00 LAK'}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">ເວລາອອກບິນ:</span>
                <span className="detail-value">{printTime}</span>
              </div>
            </div>

            {/* Barcode Section */}
            <div className="barcode-section">
              <div className="barcode">||||| ||||| ||||| |||||</div>
              <div className="text-sm text-gray-600">{product.tracking_number}</div>
            </div>

            {/* Footer */}
            <div className="footer">
              <div className="contact-info">
                <div className='text-[#777777]'>ໂທ: 020 9999 9999</div>
                <div className='text-[#777777]'>misouk.express@gmail.com</div>
              </div>
              <div className="qr-placeholder">
                QR Code
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              ປິດ
            </Button>
            <Button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-[#0c64b0] hover:bg-[#247dc9]"
            >
              <Printer className="w-4 h-4" />
              ປິ້ນ
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptPopup;
