"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { LABELS, PLACEHOLDERS, BUTTONS } from "@/lib/constants/text";
import SuccessPopup from "../ui/success-popup";
import AlertPopup from "../ui/alert-popup";
import { canUserCreateField, getRolePermissions } from '@/lib/utils/role-permissions';

interface CreateOrderData {
  tracking_number: string;
  client_name: string;
  client_phone: string;
  amount?: number;
  currency?: string;
  status?: string;
  is_paid?: boolean;
}

interface RoleBasedCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: CreateOrderData) => Promise<void>;
  onCancel: () => void;
  userRole: string | undefined | null;
}

export const RoleBasedCreateDialog: React.FC<RoleBasedCreateDialogProps> = ({
  open,
  onOpenChange,
  onCreate,
  onCancel,
  userRole
}) => {
  const [formData, setFormData] = useState({
    tracking_number: '',
    client_name: '',
    client_phone: '',
    amount: '',
    currency: 'LAK',
    status: userRole === 'thai_admin' ? 'EXIT_THAI_BRANCH' : 'AT_THAI_BRANCH'
  });

  const [creating, setCreating] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const permissions = getRolePermissions(userRole);

  const handleInputChange = (field: string, value: string) => {
    if (canUserCreateField(field, userRole)) {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleCreate = async () => {
    if (!isFormValid) return;

    setCreating(true);
    try {
      let createData: CreateOrderData;
      
      if (userRole === 'thai_admin') {
        // Thai Admin: Only send required fields
        createData = {
          tracking_number: formData.tracking_number,
          client_name: formData.client_name,
          client_phone: formData.client_phone,
          status: formData.status || 'EXIT_THAI_BRANCH'
        };
      } else {
        // Other admins: Send all fields
        createData = {
          tracking_number: formData.tracking_number,
          client_name: formData.client_name,
          client_phone: formData.client_phone,
          status: formData.status || 'AT_THAI_BRANCH',
          is_paid: false
        };

        // Only add fields that the user can create
        if (canUserCreateField('amount', userRole) && formData.amount && formData.amount.trim()) {
          createData.amount = parseFloat(formData.amount);
        }
        if (canUserCreateField('currency', userRole) && formData.currency && formData.currency.trim()) {
          createData.currency = formData.currency;
        }
      }

      await onCreate(createData);
      
      // Show success popup
      setShowSuccessPopup(true);
      
      // Reset form
      setFormData({
        tracking_number: '',
        client_name: '',
        client_phone: '',
        amount: '',
        currency: 'LAK',
        status: 'AT_THAI_BRANCH'
      });
      
      // Close dialog after a brief delay
      setTimeout(() => {
        onOpenChange(false);
      }, 500);
      
    } catch (error) {
      console.error('Create error:', error);
      // Extract user-friendly error message
      let errorMessage = 'ຜິດພາດໃນການສ້າງຂໍ້ມູນ';
      if (error instanceof Error) {
        if (error.message.includes('ສະຖານະທີ່ອະນຸຍາດມີແຕ່ EXIT_THAI_BRANCH ເທົ່ານັ້ນ')) {
          errorMessage = 'ກະລຸນາເລືອກສະຖານະ';
        } else if (error.message.includes('Validation failed') || error.message.includes('ລາຄາຕ້ອງບໍ່ຕິດລົບ')) {
          errorMessage = 'ກະລຸນາຕື່ມຂໍ້ມູນໃຫ້ຖືກຕ້ອງ';
        } else {
          errorMessage = error.message;
        }
      }
      setErrorMessage(errorMessage);
      setShowErrorPopup(true);
    } finally {
      setCreating(false);
    }
  };

  const isFormValid = (() => {
    const baseValidation = formData.tracking_number.trim() && 
                          formData.client_name.trim();
    
    
    return baseValidation;
  })();

  if (!permissions.canCreate) {
    return null; // Don't render if user can't create
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl w-full mx-4 bg-[#ffffff] max-h-[90vh] overflow-y-auto">
          <div className="p-4 sm:p-6">
            {/* Title */}
            <h1 className="text-lg sm:text-xl font-semibold text-[#0d0d0d] mb-4 sm:mb-6 text-center">
              ເພີ່ມສິນຄ້າ
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Column 1 - Create fields */}
              <div className="space-y-4">
                <h3 className="text-md font-medium text-[#0d0d0d] mb-3 border-b pb-2">ຂໍ້ມູນສິນຄ້າ</h3>
                
                {/* Product Code */}
                {canUserCreateField('tracking_number', userRole) && (
                  <div>
                    <label className="block text-sm font-medium text-[#0d0d0d] mb-2">
                      ລະຫັດສິນຄ້າ <span className="text-[#ff0000]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder={PLACEHOLDERS.ENTER_CODE}
                      className="w-full p-2 sm:p-3 border border-[#dddddd] rounded-md bg-[#ffffff] text-[#0d0d0d] placeholder-[#999999] focus:ring-[#015c96] focus:border-[#015c96] text-sm sm:text-base"
                      value={formData.tracking_number}
                      onChange={(e) => handleInputChange('tracking_number', e.target.value)}
                    />
                  </div>
                )}

                {/* Customer Phone */}
                {canUserCreateField('client_phone', userRole) && (
                  <div>
                    <label className="block text-sm font-medium text-[#0d0d0d] mb-2">
                      ເບີໂທລູກຄ້າ
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
                )}

                {/* Customer Name */}
                {canUserCreateField('client_name', userRole) && (
                  <div>
                    <label className="block text-sm font-medium text-[#0d0d0d] mb-2">
                      ຊື່ລູກຄ້າ <span className="text-[#ff0000]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder={PLACEHOLDERS.ENTER_NAME}
                      className="w-full p-2 sm:p-3 border border-[#dddddd] rounded-md bg-[#ffffff] text-[#0d0d0d] placeholder-[#999999] focus:ring-[#015c96] focus:border-[#015c96] text-sm sm:text-base"
                      value={formData.client_name}
                      onChange={(e) => handleInputChange('client_name', e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Column 2 - Display info (for thai_admin) */}
              {userRole === 'thai_admin' && (
                <div className="space-y-4">
                  <h3 className="text-md font-medium text-[#0d0d0d] mb-3 border-b pb-2">ຂໍ້ມູນທີ່ສ້າງແລ້ວ</h3>
                  <div className="bg-gray-50 p-4 rounded-md space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">ລຳດັບ</label>
                      <div className="text-sm text-gray-900">ຈະສ້າງອັດຕະໂນມັດ</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">ຊື່ລູກຄ້າ</label>
                      <div className="text-sm text-gray-900">{formData.client_name || '-'}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">ລຫັດ</label>
                      <div className="text-sm text-gray-900">{formData.tracking_number || '-'}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">ເບີໂທ</label>
                      <div className="text-sm text-gray-900">{formData.client_phone || '-'}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">ຈັດການ</label>
                      <div className="text-sm text-gray-900">ແກ້ໄຂ / ອັບເດດສະຖານະ</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Additional fields for super_admin and lao_admin */}
            {(userRole === 'super_admin' || userRole === 'lao_admin') && (
              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Price */}
                  {canUserCreateField('amount', userRole) && (
                    <div>
                      <label className="block text-sm font-medium text-[#0d0d0d] mb-2">
                        {LABELS.PRICE}
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

                  {/* Currency */}
                  {canUserCreateField('currency', userRole) && (
                    <div>
                      <label className="block text-sm font-medium text-[#0d0d0d] mb-2">
                        {LABELS.CURRENCY}
                      </label>
                      <select
                        className="w-full p-2 sm:p-3 border border-[#dddddd] rounded-md bg-[#ffffff] text-[#0d0d0d] focus:ring-[#015c96] focus:border-[#015c96] text-sm sm:text-base"
                        value={formData.currency}
                        onChange={(e) => handleInputChange('currency', e.target.value)}
                      >
                        <option value="LAK">ກີບ</option>
                        <option value="THB">ບາດ</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  onCancel();
                  onOpenChange(false);
                }}
                disabled={creating}
                className="bg-[#dc3545] text-[#ffffff] px-4 sm:px-6 py-2 rounded-md hover:bg-[#c82333] transition-colors disabled:opacity-50 text-sm sm:text-base order-2 sm:order-1"
              >
                {BUTTONS.CANCEL}
              </button>
              <button
                type="button"
                onClick={handleCreate}
                disabled={!isFormValid || creating}
                className="bg-[#007bff] text-[#ffffff] px-4 sm:px-6 py-2 rounded-md hover:bg-[#0056b3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px] text-sm sm:text-base order-1 sm:order-2"
              >
                {creating ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>ກຳລັງສ້າງ...</span>
                  </div>
                ) : (
                  'ສ້າງ'
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
        message="ສ້າງສິນຄ້າສຳເລັດແລ້ວ"
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

export default RoleBasedCreateDialog;
