"use client";

import React from "react";
import { Dialog, DialogContent } from "./dialog";
import { Button } from "./button";
import { X } from "lucide-react";
import { Product } from "../../types/product";
import { ReceiptPrint } from "./receipt-print";

interface ReceiptPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  userRole?: string | null;
}

const ReceiptPopup: React.FC<ReceiptPopupProps> = ({
  open,
  onOpenChange,
  product,
  userRole,
}) => {
  if (!product) return null;

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

  const receiptData = {
    customerName: product.client_name || "N/A",
    phoneNumber: product.client_phone || "N/A",
    price: product.amount ? `${product.amount.toLocaleString()}` : "0.00",
    timestamp: getCurrentTime(),
    trackingCode: product.tracking_number || "N/A",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto p-0">
        <div className="p-6">
          {/* Receipt Preview */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-center text-[#777777]">
              ໃບບິນ
            </h3>

            {/* Receipt Layout */}
            <div className="bg-white w-full max-w-sm mx-auto p-6 shadow-sm rounded border">
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
                    {receiptData.customerName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#888888]">ເບີໂທ:</span>
                  <span className="text-black">
                    {receiptData.phoneNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#888888]">ລາຄາ:</span>
                  <span className="text-black">{receiptData.price} LAK</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#888888]">ເວລາອອກບິນ</span>
                  <span className="text-black">{receiptData.timestamp}</span>
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
                  {receiptData.trackingCode}
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
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              ປິດ
            </Button>

            {/* Print button - Only for super_admin and lao_admin */}
            {(userRole === 'super_admin' || userRole === 'lao_admin') && (
              <ReceiptPrint
                data={receiptData}
                printTitle="MISOUK PRIME EXPRESS Receipt"
                buttonText="ປິ້ນໃບບິນ"
                buttonVariant="default"
                directPrint={true}
                className="flex items-center gap-2 bg-[#0c64b0] hover:bg-[#247dc9] text-white px-4 py-2 rounded"
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptPopup;
