"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PRODUCT_TEXT, LABELS, PLACEHOLDERS, BUTTONS } from "@/lib/constants/text";
import { Product } from "../../types/product";
import SuccessPopup from "../ui/success-popup";
import AlertPopup from "../ui/alert-popup";
import { canUserEditField, getRolePermissions } from '@/lib/utils/role-permissions';

interface RoleBasedEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onSave: (updatedProduct: Product) => Promise<void>;
  onCancel: () => void;
  userRole: string | undefined | null;
}

export const RoleBasedEditDialog: React.FC<RoleBasedEditDialogProps> = ({
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
    client_phone: null as string | null,
    amount: null as string | null,
    currency: 'LAK',
    status: 'AT_THAI_BRANCH',
    is_paid: false
  });

  const [saving, setSaving] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const permissions = getRolePermissions(userRole);

  // Update form data when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        tracking_number: product.tracking_number,
        client_name: product.client_name,
        client_phone: product.client_phone ?? null,
        amount: product.amount?.toString() || null,
        currency: product.currency || 'LAK',
        status: product.status,
        is_paid: product.is_paid || false
      });
    }
  }, [product]);

  // const handleInputChange = (field: string, value: string | boolean | null) => {
  //   // if (canUserEditField(field, userRole)) {
  //   //   setFormData(prev => ({ ...prev, [field]: value }));
  //   // }
  //   if (field === 'status') {
  //     const prevStatus = product?.status;
  //     const statusOrder = ['AT_THAI_BRANCH', 'EXIT_THAI_BRANCH', 'AT_LAO_BRANCH', 'COMPLETED'];
  
  //     if (userRole === 'branch_admin_th') {
  //       // Thai branch admin can only select AT_THAI_BRANCH or EXIT_THAI_BRANCH
  //       if (value !== 'AT_THAI_BRANCH' && value !== 'EXIT_THAI_BRANCH') return;
  //     } else if (userRole === 'branch_admin_la') {
  //       // Lao branch admin cannot rollback
  //       const prevIndex = prevStatus ? statusOrder.indexOf(prevStatus) : -1;
  //       const newIndex = statusOrder.indexOf(value as string);
  //       if (newIndex < prevIndex) return; // prevent rollback
  //     }
  //     // super_admin and souper_admin can change any status including rollback
  //   }
  
  //   if (canUserEditField(field, userRole)) {
  //     setFormData(prev => ({ ...prev, [field]: value }));
  //   }
  // };

  const handleInputChange = (field: string, value: string | boolean | null) => {
    if (field === 'status') {
      const prevStatus = product?.status;
      const statusOrder = ['AT_THAI_BRANCH', 'EXIT_THAI_BRANCH', 'AT_LAO_BRANCH', 'COMPLETED'];

      if (userRole === 'branch_admin_th') {
        if (value !== 'AT_THAI_BRANCH' && value !== 'EXIT_THAI_BRANCH') return;
      } else if (userRole === 'branch_admin_la') {
        const prevIndex = prevStatus ? statusOrder.indexOf(prevStatus) : -1;
        const newIndex = statusOrder.indexOf(value as string);
        if (newIndex < prevIndex) return; // prevent rollback
      }
      // super_admin and souper_admin can change any status including rollback
    }

    if (canUserEditField(field, userRole)) {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };


  // const handleSave = async () => {
  //   if (!product || !isFormValid) return;

  //   // Check if product has already left Thai branch
  //   const hasLeftThaiBranch = product.status === 'EXIT_THAI_BRANCH' || 
  //                            product.status === 'AT_LAO_BRANCH' || 
  //                            product.status === 'COMPLETED';
    
  //   if (hasLeftThaiBranch) {
  //     setErrorMessage('ບໍ່ສາມາດແກ້ໄຂລາຍການທີ່ອອກຈາກສາຂາໄທແລ້ວ');
  //     setShowErrorPopup(true);
  //     return;
  //   }

  //   setSaving(true);
  //   try {
  //     // Start with base product and only update fields that the user can edit
  //     const updatedProduct: Product = {
  //       ...product,
  //       updated_at: new Date().toISOString()
  //     };

  //     // Only update fields that the user has permission to edit
  //     if (canUserEditField('tracking_number', userRole)) {
  //       updatedProduct.tracking_number = formData.tracking_number;
  //     }
  //     if (canUserEditField('client_name', userRole)) {
  //       updatedProduct.client_name = formData.client_name;
  //     }
  //     if (canUserEditField("client_phone", userRole)) {
  //       if (formData.client_phone && formData.client_phone.trim() !== "") {
  //         updatedProduct.client_phone = formData.client_phone.trim();
  //       } else {
  //         delete (updatedProduct as any).client_phone;
  //       }
  //     }
  //     if (canUserEditField('status', userRole)) {
  //       updatedProduct.status = formData.status;
  //     }
      
  //     // Only include amount, currency, and is_paid for roles that can edit them
  //     // if (canUserEditField('amount', userRole)) {
  //     //   updatedProduct.amount = formData.amount && formData.amount.trim() !== '' ? parseFloat(formData.amount) : null;
  //     // } else {
  //     //   // Remove the field completely for roles that can't edit it
  //     //   delete (updatedProduct as any).amount;
  //     // }
  //     if (canUserEditField('amount', userRole)) {
  //       if (formData.amount && formData.amount.trim() !== '') {
  //         updatedProduct.amount = parseFloat(formData.amount);
  //       } else {
  //         delete (updatedProduct as any).amount;
  //       }
  //     } else {
  //       delete (updatedProduct as any).amount;
  //     }
      
  //     if (canUserEditField('currency', userRole)) {
  //       if (formData.currency && formData.currency.trim() !== '') {
  //         updatedProduct.currency = formData.currency;
  //       } else {
  //         delete (updatedProduct as any).currency;
  //       }
  //     } else {
  //       // Remove the field completely for roles that can't edit it
  //       delete (updatedProduct as any).currency;
  //     }
      
  //     if (canUserEditField('is_paid', userRole)) {
  //       updatedProduct.is_paid = formData.is_paid ?? false;
  //     } else {
  //       // Remove the field completely for roles that can't edit it
  //       delete (updatedProduct as any).is_paid;
  //     }

  //     // Debug: Log what's being passed to onSave
  //     console.log('=== ROLEBASED EDIT DEBUG ===');
  //     console.log('User Role:', userRole);
  //     console.log('Updated Product:', updatedProduct);
  //     console.log('=== END ROLEBASED EDIT DEBUG ===');

  //     await onSave(updatedProduct);
      
  //     // Show success popup
  //     setShowSuccessPopup(true);
      
  //     // Close dialog after a brief delay
  //     setTimeout(() => {
  //       onOpenChange(false);
  //     }, 500);
      
  //   } catch (error) {
  //     console.error('Save error:', error);
  //     // Extract user-friendly error message
  //     let errorMessage = 'ຜິດພາດໃນການບັນທຶກຂໍ້ມູນ';
  //     if (error instanceof Error) {
  //       if (error.message.includes('ສະຖານະທີ່ອະນຸຍາດມີແຕ່ EXIT_THAI_BRANCH ເທົ່ານັ້ນ')) {
  //         errorMessage = 'ກະລຸນາເລືອກສະຖານະ EXIT_THAI_BRANCH';
  //       } else if (error.message.includes('Validation failed') || error.message.includes('ລາຄາຕ້ອງບໍ່ຕິດລົບ')) {
  //         errorMessage = 'ກະລຸນາຕື່ມຂໍ້ມູນໃຫ້ຖືກຕ້ອງ';
  //       } else if (error.message.includes('ບໍ່ສາມາດແກ້ໄຂຈຳນວນເງິນ, ສະກຸນເງິນ ຫຼື ສະຖານະການຈ່າຍເງິນ')) {
  //         errorMessage = 'ກະລຸນາເລືອກສະຖານະ';
  //       } else if (error.message.includes('ບໍ່ສາມາດແກ້ໄຂລາຍການທີ່ອອກຈາກສາຂາໄທແລ້ວ')) {
  //         errorMessage = 'ບໍ່ສາມາດແກ້ໄຂລາຍການທີ່ອອກຈາກສາຂາໄທແລ້ວ';
  //       } else {
  //         errorMessage = error.message;
  //       }
  //     }
  //     setErrorMessage(errorMessage);
  //     setShowErrorPopup(true);
  //   } finally {
  //     setSaving(false);
  //   }
  // };

  const handleSave = async () => {
    if (!product || !isFormValid) return;

    // Check rollback for branch_admin_la only
    const statusOrder = ['AT_THAI_BRANCH', 'EXIT_THAI_BRANCH', 'AT_LAO_BRANCH', 'COMPLETED'];
    const prevIndex = product.status ? statusOrder.indexOf(product.status) : -1;
    const newIndex = statusOrder.indexOf(formData.status);
    if (userRole === 'branch_admin_la' && newIndex < prevIndex) {
      setErrorMessage('ບໍ່ສາມາດ rollback ສະຖານະໄດ້');
      setShowErrorPopup(true);
      return;
    }

    setSaving(true);
    try {
      const updatedProduct: Product = {
        ...product,
        updated_at: new Date().toISOString()
      };

      // Update only fields that user can edit
      if (canUserEditField('tracking_number', userRole)) {
        updatedProduct.tracking_number = formData.tracking_number;
      }
      if (canUserEditField('client_name', userRole)) {
        updatedProduct.client_name = formData.client_name;
      }
      if (canUserEditField("client_phone", userRole)) {
        if (formData.client_phone && formData.client_phone.trim() !== "") {
          updatedProduct.client_phone = formData.client_phone.trim();
        } else {
          delete (updatedProduct as any).client_phone;
        }
      }
      if (canUserEditField('status', userRole)) {
        updatedProduct.status = formData.status;
      }
      if (canUserEditField('amount', userRole)) {
        if (formData.amount && formData.amount.trim() !== '') {
          updatedProduct.amount = parseFloat(formData.amount);
        } else {
          delete (updatedProduct as any).amount;
        }
      } else {
        delete (updatedProduct as any).amount;
      }
      if (canUserEditField('currency', userRole)) {
        if (formData.currency && formData.currency.trim() !== '') {
          updatedProduct.currency = formData.currency;
        } else {
          delete (updatedProduct as any).currency;
        }
      } else {
        delete (updatedProduct as any).currency;
      }
      if (canUserEditField('is_paid', userRole)) {
        updatedProduct.is_paid = formData.is_paid ?? false;
      } else {
        delete (updatedProduct as any).is_paid;
      }

      console.log('=== ROLEBASED EDIT DEBUG ===');
      console.log('User Role:', userRole);
      console.log('Updated Product:', updatedProduct);
      console.log('=== END ROLEBASED EDIT DEBUG ===');

      await onSave(updatedProduct);

      setShowSuccessPopup(true);

      setTimeout(() => {
        onOpenChange(false);
      }, 500);

      } catch (error) {
        console.error('Save error:', error);
        let errorMessage = 'ຜິດພາດໃນການບັນທຶກຂໍ້ມູນ';
        
        if (error instanceof Error) {
          // Try to parse the error message to extract the API message
          try {
            // Check if the error message contains JSON
            if (error.message.includes('{')) {
              const jsonMatch = error.message.match(/\{.*\}/);
              if (jsonMatch) {
                const errorData = JSON.parse(jsonMatch[0]);
                if (errorData.message) {
                  errorMessage = errorData.message;
                }
              }
            } else {
              errorMessage = error.message;
            }
          } catch (parseError) {
            // If parsing fails, use the original error message
            errorMessage = error.message;
          }
        }
        
        setErrorMessage(errorMessage);
        setShowErrorPopup(true);
    } finally {
      setSaving(false);
    }
  };

  const isFormValid = formData.tracking_number.trim() && 
                     formData.client_name.trim() && 
                     formData.status;
                     // For super_admin and lao_admin, require amount, currency, and payment status
                    //  ((userRole === 'super_admin' || userRole === 'lao_admin') ? 
                    //    (formData.amount && formData.amount.trim() && formData.currency && formData.is_paid !== undefined) : 
                    //    true);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl w-full mx-4 bg-[#ffffff] max-h-[90vh] overflow-y-auto">
          <div className="p-4 sm:p-6">
            {/* Title */}
            <h1 className="text-lg sm:text-xl font-semibold text-[#0d0d0d] mb-4 sm:mb-6 text-center">
              ແກ້ໄຂສິນຄ້າ
            </h1>

            <div className="space-y-4">
              {/* Status - Always show first for non-super_admin */}
              {canUserEditField('status', userRole) && (
                <div>
                  <label className="block text-sm font-medium text-[#0d0d0d] mb-2">
                    ສະຖານະ <span className="text-[#ff0000]">*</span>
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
              )}

              {/* Product Code */}
              {canUserEditField('tracking_number', userRole) && (
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
              {canUserEditField('client_phone', userRole) && (
                <div>
                  <label className="block text-sm font-medium text-[#0d0d0d] mb-2">
                    ເບີໂທລູກຄ້າ
                  </label>
                  <input
                    type="tel"
                    placeholder={PLACEHOLDERS.ENTER_PHONE}
                    pattern="[0-9]*"
                    className="w-full p-2 sm:p-3 border border-[#dddddd] rounded-md bg-[#ffffff] text-[#0d0d0d] placeholder-[#999999] focus:ring-[#015c96] focus:border-[#015c96] text-sm sm:text-base"
                    value={formData.client_phone || ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      handleInputChange('client_phone', value === '' ? null : value);
                    }}
                  />
                </div>
              )}

              {/* Customer Name */}
              {canUserEditField('client_name', userRole) && (
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

              {/* Price - Only for super_admin and lao_admin */}
              {canUserEditField('amount', userRole) && (
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
                    value={formData.amount || ''}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (value < 0) return;
                      handleInputChange('amount', e.target.value);
                    }}
                  />
                </div>
              )}

              {/* Currency - Only for super_admin and lao_admin */}
              {canUserEditField('currency', userRole) && (
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

              {/* Payment Status - Only for lao_admin and super_admin */}
              {canUserEditField('is_paid', userRole) && (
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

export default RoleBasedEditDialog;
