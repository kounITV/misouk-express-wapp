"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PRODUCT_TEXT, LABELS, PLACEHOLDERS, STATUS_OPTIONS, CURRENCY_OPTIONS, BUTTONS } from "@/lib/constants/text";
import { Product } from "../../types/product";
import SuccessPopup from "../ui/success-popup";
import AlertPopup from "../ui/alert-popup";

interface EditProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onSave: (updatedProduct: Product) => Promise<void>;
  onCancel: () => void;
  userRole?: string | null;
}

export const EditProductDialog: React.FC<EditProductDialogProps> = ({
  open,
  onOpenChange,
  product,
  onSave,
  onCancel,
  userRole
}) => {
  const [formData, setFormData] = useState({
    tracking_number: '',
    client_name: '',
    client_phone: '',
    amount: '',
    currency: 'LAK',
    status: 'AT_THAI_BRANCH',
    is_paid: false
  });

  const [saving, setSaving] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Update form data when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        tracking_number: product.tracking_number,
        client_name: product.client_name,
        client_phone: product.client_phone,
        amount: product.amount?.toString() || '',
        currency: product.currency || 'LAK',
        status: product.status,
        is_paid: product.is_paid || false
      });
    }
  }, [product]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!product || !isFormValid) return;

    setSaving(true);
    try {
      // Start with base product and only update the basic fields
      const updatedProduct: Product = {
        ...product,
        tracking_number: formData.tracking_number,
        client_name: formData.client_name,
        client_phone: formData.client_phone,
        status: formData.status,
        updated_at: new Date().toISOString()
      };

      // Only include amount, currency, and is_paid if they have values (for non-thai_admin users)
      if (formData.amount && formData.amount.trim()) {
        updatedProduct.amount = parseFloat(formData.amount);
      }
      if (formData.currency && formData.currency.trim()) {
        updatedProduct.currency = formData.currency;
      }
      if (formData.is_paid !== undefined) {
        updatedProduct.is_paid = formData.is_paid;
      }

      await onSave(updatedProduct);
      
      // Show success popup
      setShowSuccessPopup(true);
      
      // Close dialog after a brief delay
      setTimeout(() => {
        onOpenChange(false);
      }, 500);
      
    } catch (error) {
      console.error('Save error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'ຜິດພາດໃນການບັນທຶກຂໍ້ມູນ');
      setShowErrorPopup(true);
    } finally {
      setSaving(false);
    }
  };

  const isFormValid = formData.tracking_number.trim() && 
                     formData.client_name.trim() && 
                     formData.client_phone.trim() && 
                     formData.status;
                     // Amount and currency are now optional for all roles

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-sm sm:max-w-2xl w-full mx-2 sm:mx-4 bg-[#ffffff] max-h-[90vh] overflow-y-auto">
          <div className="p-4 sm:p-6">
            {/* Title */}
            <h1 className="text-lg sm:text-xl font-semibold text-[#0d0d0d] mb-4 sm:mb-6 text-center">
              ແກ້ໄຂສິນຄ້າ
            </h1>

          <div className="space-y-4">
            {/* Product Code */}
            <div>
              <label className="block text-sm font-medium text-[#0d0d0d] mb-2">
                {LABELS.PRODUCT_CODE} <span className="text-[#ff0000]">*</span>
              </label>
              <input
                type="text"
                placeholder={PLACEHOLDERS.ENTER_CODE}
                className="w-full p-2 sm:p-3 border border-[#dddddd] rounded-md bg-[#ffffff] text-[#0d0d0d] placeholder-[#999999] focus:ring-[#015c96] focus:border-[#015c96] text-sm sm:text-base"
                value={formData.tracking_number}
                onChange={(e) => handleInputChange('tracking_number', e.target.value)}
              />
            </div>

            {/* Customer Name */}
            <div>
              <label className="block text-sm font-medium text-[#0d0d0d] mb-2">
                {LABELS.CUSTOMER_NAME} <span className="text-[#ff0000]">*</span>
              </label>
              <input
                type="text"
                placeholder={PLACEHOLDERS.ENTER_NAME}
                className="w-full p-2 sm:p-3 border border-[#dddddd] rounded-md bg-[#ffffff] text-[#0d0d0d] placeholder-[#999999] focus:ring-[#015c96] focus:border-[#015c96] text-sm sm:text-base"
                value={formData.client_name}
                onChange={(e) => handleInputChange('client_name', e.target.value)}
              />
            </div>

            {/* Customer Phone */}
            <div>
              <label className="block text-sm font-medium text-[#0d0d0d] mb-2">
                {LABELS.CUSTOMER_PHONE} <span className="text-[#ff0000]">*</span>
              </label>
              <input
                type="tel"
                placeholder={PLACEHOLDERS.ENTER_PHONE}
                pattern="[0-9]*"
                className="w-full p-2 sm:p-3 border border-[#dddddd] rounded-md bg-[#ffffff] text-[#0d0d0d] placeholder-[#999999] focus:ring-[#015c96] focus:border-[#015c96] text-sm sm:text-base"
                value={formData.client_phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  handleInputChange('client_phone', value);
                }}
              />
            </div>

            {/* Price - Only for super_admin and lao_admin */}
            {(userRole === 'super_admin' || userRole === 'lao_admin') && (
              <div>
                <label className="block text-sm font-medium text-[#0d0d0d] mb-2">
                  {LABELS.PRICE} <span className="text-[#ff0000]">*</span>
                </label>
                <input
                  type="number"
                  placeholder={PLACEHOLDERS.ENTER_PRICE}
                  min="0"
                  step="0.01"
                  className="w-full p-2 sm:p-3 border border-[#dddddd] rounded-md bg-[#ffffff] text-[#0d0d0d] placeholder-[#999999] focus:ring-[#015c96] focus:border-[#015c96] text-sm sm:text-base"
                  value={formData.amount}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    if (value < 0) return;
                    handleInputChange('amount', e.target.value);
                  }}
                />
              </div>
            )}

            {/* Currency - Only for super_admin and lao_admin */}
            {(userRole === 'super_admin' || userRole === 'lao_admin') && (
              <div>
                <label className="block text-sm font-medium text-[#0d0d0d] mb-2">
                  {LABELS.CURRENCY} <span className="text-[#ff0000]">*</span>
                </label>
                <select
                  className="w-full p-2 sm:p-3 border border-[#dddddd] rounded-md bg-[#ffffff] text-[#0d0d0d] focus:ring-[#015c96] focus:border-[#015c96] text-sm sm:text-base"
                  value={formData.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                >
                  <option value="LAK">{CURRENCY_OPTIONS.LAK}</option>
                  <option value="THB">{CURRENCY_OPTIONS.THB}</option>
                </select>
              </div>
            )}

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-[#0d0d0d] mb-2">
                {LABELS.STATUS} <span className="text-[#ff0000]">*</span>
              </label>
              <select
                className="w-full p-2 sm:p-3 border border-[#dddddd] rounded-md bg-[#ffffff] text-[#0d0d0d] focus:ring-[#015c96] focus:border-[#015c96] text-sm sm:text-base"
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
              >
                <option value="AT_THAI_BRANCH">ສິນຄ້າຮອດໄທ</option>
                <option value="EXIT_THAI_BRANCH">ສິ້ນຄ້າອອກຈາກໄທ</option>
                <option value="AT_LAO_BRANCH">ສິ້ນຄ້າຮອດລາວ</option>
                <option value="COMPLETED">ລູກຄ້າຮັບເອົາສິນຄ້າ</option>
              </select>
            </div>

            {/* Payment Status - Only for super_admin and lao_admin */}
            {(userRole === 'super_admin' || userRole === 'lao_admin') && (
              <div>
                <label className="block text-sm font-medium text-[#0d0d0d] mb-2">
                  {LABELS.PAYMENT_STATUS} <span className="text-[#ff0000]">*</span>
                </label>
                <select
                  className="w-full p-2 sm:p-3 border border-[#dddddd] rounded-md bg-[#ffffff] text-[#0d0d0d] focus:ring-[#015c96] focus:border-[#015c96] text-sm sm:text-base"
                  value={formData.is_paid ? 'true' : 'false'}
                  onChange={(e) => handleInputChange('is_paid', e.target.value === 'true')}
                >
                  <option value="false">ຍັງບໍ່ຊຳລະ</option>
                  <option value="true">ຊຳລະແລ້ວ</option>
                </select>
              </div>
            )}
          </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  onCancel();
                  onOpenChange(false);
                }}
                disabled={saving}
                className="bg-[#dc3545] text-[#ffffff] px-4 sm:px-6 py-2 rounded-md hover:bg-[#c82333] transition-colors disabled:opacity-50 text-sm sm:text-base order-2 sm:order-1"
              >
                {BUTTONS.CANCEL}
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!isFormValid || saving}
                className="bg-[#007bff] text-[#ffffff] px-4 sm:px-6 py-2 rounded-md hover:bg-[#0056b3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px] text-sm sm:text-base order-1 sm:order-2"
              >
                {saving ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>ກຳລັງບັນທຶກ...</span>
                  </div>
                ) : (
                  BUTTONS.SAVE
                )}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Popup */}
      <SuccessPopup
        open={showSuccessPopup}
        onOpenChange={setShowSuccessPopup}
        title="ສຳເລັດ!"
        message="ແກ້ໄຂສິນຄ້າສຳເລັດແລ້ວ"
        autoCloseTimer={5000}
        showTimer={true}
      />

      {/* Error Popup */}
      <AlertPopup
        open={showErrorPopup}
        onOpenChange={setShowErrorPopup}
        title="ຜິດພາດ"
        message={errorMessage}
        type="error"
      />
    </>
  );
};

export default EditProductDialog;
