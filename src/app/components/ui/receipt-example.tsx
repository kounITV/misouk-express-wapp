"use client";

import React from 'react';
import { ReceiptPrint, ReceiptContent, PrintWrapper, usePrint } from './receipt-print';
import { Button } from './button';

export const ReceiptExample = () => {
  // Sample receipt data
  const receiptData = {
    customerName: "jack",
    phoneNumber: "12345678",
    price: "0.00",
    timestamp: "22/09/2025 17:18:06",
    trackingCode: "hhhgggg"
  };

  // For custom print button example
  const { componentRef, handlePrint } = usePrint("MISOUK PRIME EXPRESS Receipt");

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold mb-6">Receipt Print Examples</h1>
      
      {/* Example 1: Simple Receipt Print */}
      <div className="border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">Example 1: Simple Receipt Print</h2>
        <ReceiptPrint 
          data={receiptData}
          buttonText="Print Receipt"
          buttonVariant="default"
        />
      </div>

      {/* Example 2: Custom Print Button */}
      <div className="border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">Example 2: Custom Print Button</h2>
        <div className="space-y-4">
          <Button onClick={handlePrint} variant="outline">
            Custom Print Button
          </Button>
          
          <PrintWrapper ref={componentRef}>
            <ReceiptContent data={receiptData} />
          </PrintWrapper>
        </div>
      </div>

      {/* Example 3: Different Receipt Data */}
      <div className="border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">Example 3: Different Receipt Data</h2>
        <ReceiptPrint 
          data={{
            customerName: "ສົມຊາຍ",
            phoneNumber: "020-12345678",
            price: "25,000.00",
            timestamp: "23/09/2025 14:30:15",
            trackingCode: "ABC123"
          }}
          buttonText="Print Another Receipt"
          buttonVariant="secondary"
        />
      </div>

      {/* Example 4: Receipt Preview */}
      <div className="border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">Example 4: Receipt Preview (No Print Button)</h2>
        <div className="bg-gray-100 p-4 rounded">
          <ReceiptContent data={receiptData} />
        </div>
      </div>
    </div>
  );
};
