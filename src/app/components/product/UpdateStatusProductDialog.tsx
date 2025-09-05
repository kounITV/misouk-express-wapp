"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Product } from "../../types/product";
import { apiEndpoints } from "@/lib/config";
import { AuthService } from "@/lib/auth-service";
import { SuccessPopup } from "../ui/success-popup";
import { AlertPopup } from "../ui/alert-popup";

interface UpdateStatusProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedProducts: Product[];
  onUpdateSuccess?: () => void;
  userRole?: string | null; // Add user role prop
}

interface UpdateFormData {
  currentStatus: string;
  newStatus: string;
  isPaid: boolean;
}

interface NewProductData {
  trackingNumber: string;
  clientPhone: string;
  clientName: string;
  amount: string;
  currency: string;
  isPaid: boolean;
}

const STATUS_OPTIONS = [
  { value: 'AT_THAI_BRANCH', label: 'ສິນຄ້າຮອດໄທ' },
  { value: 'EXIT_THAI_BRANCH', label: 'ສິ້ນຄ້າອອກຈາກໄທ' },
  { value: 'AT_LAO_BRANCH', label: 'ສິ້ນຄ້າຮອດລາວ' },
  { value: 'COMPLETED', label: 'ລູກຄ້າຮັບເອົາສິນຄ້າ' }
];

const PAYMENT_OPTIONS = [
  { value: true, label: 'ຊຳລະແລ້ວ' },
  { value: false, label: 'ຍັງບໍ່ໄດ້ຊຳລະ' }
];

const CURRENCY_OPTIONS = [
  { value: 'LAK', label: 'ກີບ (LAK)' },
  { value: 'THB', label: 'ບາດ (THB)' },
  { value: 'USD', label: 'ໂດລາ (USD)' }
];

export const UpdateStatusProductDialog: React.FC<UpdateStatusProductDialogProps> = ({
  open,
  onOpenChange,
  selectedProducts,
  onUpdateSuccess,
  userRole
}) => {
  const [formData, setFormData] = useState<UpdateFormData>({
    currentStatus: '',
    newStatus: '',
    isPaid: false
  });

  // State for new product data
  const [newProductData, setNewProductData] = useState<NewProductData>({
    trackingNumber: '',
    clientPhone: '',
    clientName: '',
    amount: '',
    currency: 'LAK',
    isPaid: false
  });

  // State for added products list
  const [addedProducts, setAddedProducts] = useState<Product[]>([]);

  const [isUpdating, setIsUpdating] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showMixedStatusPopup, setShowMixedStatusPopup] = useState(false);

    // Initialize form when dialog opens
  useEffect(() => {
    if (open) {
      if (selectedProducts.length === 0) {
        // No products selected - reset form
        setFormData({
          currentStatus: '',
          newStatus: '',
          isPaid: false
        });
      } else {
        // Check if all selected products have the same status
        const firstProduct = selectedProducts[0];
        if (firstProduct) {
          const allSameStatus = selectedProducts.every(product => product.status === firstProduct.status);
          
          if (allSameStatus) {
            // All products have the same status - use that status
            setFormData({
              currentStatus: firstProduct.status,
              newStatus: '',
              isPaid: false
            });
          } else {
            // Products have different statuses - this should not happen now
            // as we check at the parent level, but keep this as fallback
            setFormData({
              currentStatus: 'MIXED_STATUS',
              newStatus: '',
              isPaid: false
            });
          }
        }
      }
    } else {
      // Dialog closed - reset form but keep popup state if it's showing
      setFormData({
        currentStatus: '',
        newStatus: '',
        isPaid: false
      });
      // Don't reset popup state here - let the timer handle it
    }
  }, [open, selectedProducts, onOpenChange]);



  const getStatusLabel = (status: string) => {
    if (status === 'MIXED_STATUS') {
      return 'ສະຖານະຕ່າງກັນ';
    }
    return STATUS_OPTIONS.find(option => option.value === status)?.label || status;
  };

  const handleInputChange = (field: keyof UpdateFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    // Check if products are selected and have the same status
    if (selectedProducts.length === 0) {
      // When no products selected, need both current and new status
      return formData.currentStatus && formData.newStatus;
    }
    if (formData.currentStatus === 'MIXED_STATUS') return false;
    if (!formData.newStatus) return false;
    return true;
  };

  const isNewProductValid = () => {
    const baseValidation = newProductData.trackingNumber &&
      newProductData.clientPhone &&
      newProductData.clientName;
    
    // For Thai Admin, amount, currency, and isPaid are optional
    if (userRole === 'thai_admin') {
      return baseValidation;
    }
    
    // For Super Admin and Lao Admin, amount is required
    return baseValidation && newProductData.amount;
  };

  const handleNewProductChange = (field: keyof NewProductData, value: string | boolean) => {
    setNewProductData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddProduct = () => {
    if (!isNewProductValid()) return;

    const newProduct: Product = {
      id: crypto.randomUUID(),
      tracking_number: newProductData.trackingNumber,
      client_name: newProductData.clientName,
      client_phone: newProductData.clientPhone,
      amount: userRole === 'thai_admin' ? null : parseFloat(newProductData.amount),
      currency: userRole === 'thai_admin' ? null : newProductData.currency,
      status: 'AT_THAI_BRANCH',
      is_paid: userRole === 'thai_admin' ? false : newProductData.isPaid,
      created_by: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
      creator: undefined
    };

    setAddedProducts(prev => [...prev, newProduct]);

    // Reset form
    setNewProductData({
      trackingNumber: '',
      clientPhone: '',
      clientName: '',
      amount: '',
      currency: userRole === 'thai_admin' ? '' : 'LAK',
      isPaid: userRole === 'thai_admin' ? false : false
    });
  };

  const handleRemoveProduct = (productId: string) => {
    setAddedProducts(prev => prev.filter(product => product.id !== productId));
  };

  const handleResetForm = () => {
    setNewProductData({
      trackingNumber: '',
      clientPhone: '',
      clientName: '',
      amount: '',
      currency: userRole === 'thai_admin' ? '' : 'LAK',
      isPaid: userRole === 'thai_admin' ? false : false
    });
  };

  const handleUpdate = async () => {
    if (!isFormValid() && addedProducts.length === 0) {
      if (selectedProducts.length === 0) {
        setErrorMessage('ກະລຸນາເລືອກສະຖານະປະຈຸບັນ ແລະ ສະຖານະໃໝ່ ຫຼື ເພີ່ມສິນຄ້າ');
      } else if (formData.currentStatus === 'MIXED_STATUS') {
        setErrorMessage('ບໍ່ສາມາດອັບເດດສະຖານະໄດ້ ເນື່ອງຈາກສິນຄ້າທີ່ເລືອກມີສະຖານະຕ່າງກັນ ກະລຸນາເລືອກສິນຄ້າທີ່ມີສະຖານະດຽວກັນ');
      } else {
        setErrorMessage('ກະລຸນາເລືອກສະຖານະໃໝ່ ຫຼື ເພີ່ມສິນຄ້າ');
      }
      setShowErrorPopup(true);
      return;
    }

    const token = AuthService.getStoredToken();
    if (!token) {
      setErrorMessage('ກະລຸນາເຂົ້າສູ່ລະບົບກ່ອນ');
      setShowErrorPopup(true);
      return;
    }

    setIsUpdating(true);

    try {
      // Check if we have products to update
      if (selectedProducts.length === 0 && formData.currentStatus && formData.newStatus) {
        // When no products selected but current status is specified, 
        // this would need to be handled by the parent component
        setErrorMessage('ກະລຸນາເລືອກສິນຄ້າທີ່ຕ້ອງການອັບເດດຈາກຕາຕະລາງກ່ອນ');
        setShowErrorPopup(true);
        setIsUpdating(false);
        return;
      }

      // Prepare the bulk update data based on user role
      const updateData = {
        orders: selectedProducts.map(product => {
          const orderUpdate: any = {
            id: product.id,
            tracking_number: product.tracking_number,
            client_name: product.client_name,
            client_phone: product.client_phone,
            status: formData.newStatus
          };

          // Only include amount, currency, and is_paid for non-thai_admin roles
          if (userRole !== 'thai_admin') {
            orderUpdate.amount = product.amount || 0;
            orderUpdate.currency = product.currency;
            orderUpdate.is_paid = formData.isPaid;
          }

          return orderUpdate;
        })
      };

      console.log('Updating products with data:', updateData);

      const response = await fetch(apiEndpoints.ordersBulk, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
        body: JSON.stringify(updateData)
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Update result:', result);

        if (result.success) {
          setShowSuccessPopup(true);

          // Close dialog after success
          setTimeout(() => {
            onOpenChange(false);
            if (onUpdateSuccess) {
              onUpdateSuccess();
            }
          }, 2000);
        } else {
          setErrorMessage(result.message || 'ບໍ່ສາມາດອັບເດດສະຖານະໄດ້');
          setShowErrorPopup(true);
        }
      } else {
        const errorText = await response.text();
        console.error('API error:', response.status, errorText);
        setErrorMessage(`ຜິດພາດ ${response.status}: ${errorText}`);
        setShowErrorPopup(true);
      }
    } catch (error) {
      console.error('Network error:', error);
      setErrorMessage('ຜິດພາດໃນການເຊື່ອມຕໍ່ກັບເຊີເວີ: ' + error);
      setShowErrorPopup(true);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      currentStatus: '',
      newStatus: '',
      isPaid: false
    });
    setNewProductData({
      trackingNumber: '',
      clientPhone: '',
      clientName: '',
      amount: '',
      currency: userRole === 'thai_admin' ? '' : 'LAK',
      isPaid: userRole === 'thai_admin' ? false : false
    });
    setAddedProducts([]);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-sm w-full mx-2 sm:mx-4 max-h-[95vh] sm:max-h-[100vh] sm:max-w-2xl md:max-w-3xl lg:max-w-5xl xl:max-w-7xl bg-white flex flex-col">
          <div className="flex-1 overflow-y-auto p-6">
            {/* Title */}
            <h1 className="text-2xl font-semibold text-gray-800 mb-6">
              ອັບເດດສິນຄ້າ
            </h1>

            {/* Status Update Section */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-700 mb-4 bg-gray-100 p-3 rounded">
                ອັບເດດສະຖານະ
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Current Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ສະຖານະປະຈຸບັນ <span className="text-red-500">*</span>
                  </label>
                  <select
                    className={`w-full p-3 border border-gray-300 rounded-md ${
                      selectedProducts.length === 0 
                        ? 'bg-white text-gray-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}
                    value={formData.currentStatus}
                    disabled={selectedProducts.length > 0}
                    onChange={(e) => setFormData(prev => ({ ...prev, currentStatus: e.target.value }))}
                  >
                    <option value="">
                      {selectedProducts.length === 0 
                        ? 'ກະລຸນາເລືອກສະຖານະທີ່ຕ້ອງການອັບເດດ' 
                        : formData.currentStatus === 'MIXED_STATUS'
                        ? 'ສະຖານະຕ່າງກັນ (ບໍ່ສາມາດອັບເດດໄດ້)'
                        : getStatusLabel(formData.currentStatus) || 'ກະລຸນາເລືອກ'
                      }
                    </option>
                    {selectedProducts.length === 0 && STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* New Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ສະຖານະທີ່ຕ້ອງການອັບເດດ <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.newStatus}
                    onChange={(e) => handleInputChange('newStatus', e.target.value)}
                  >
                    <option value="">ກະລຸນາເລືອກ</option>
                    {STATUS_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Payment Status - Only for super_admin and lao_admin */}
                {(userRole === 'super_admin' || userRole === 'lao_admin') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ການຊຳລະ
                    </label>
                    <select
                      className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.isPaid.toString()}
                      onChange={(e) => handleInputChange('isPaid', e.target.value === 'true')}
                    >
                      {PAYMENT_OPTIONS.map(option => (
                        <option key={option.value.toString()} value={option.value.toString()}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* New Product Form Section */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-700 mb-4 bg-gray-100 p-3 rounded">
                ຂໍ້ມູນສິນຄ້າ
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 ">

                {/* Column 1: Form Input */}
                <div className="space-y-4 border-2 border-dashed border-[#cccccc] p-3 sm:p-6 rounded-lg bg-[#ffffff] flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                    {/* ລະຫັດສິນຄ້າ */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ລະຫັດສິນຄ້າ <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                        value={newProductData.trackingNumber}
                        onChange={(e) => handleNewProductChange('trackingNumber', e.target.value)}
                        placeholder="ລະຫັດສິນຄ້າ"
                      />
                    </div>

                    {/* ເບີໂທລູກຄ້າ */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ເບີໂທລູກຄ້າ <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                        value={newProductData.clientPhone}
                        onChange={(e) => handleNewProductChange('clientPhone', e.target.value)}
                        placeholder="ເບີໂທລູກຄ້າ"
                      />
                    </div>

                    {/* ຊື່ລູກຄ້າ */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ຊື່ລູກຄ້າ <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                        value={newProductData.clientName}
                        onChange={(e) => handleNewProductChange('clientName', e.target.value)}
                        placeholder="ຊື່ລູກຄ້າ"
                      />
                    </div>

                    {/* ລາຄາ - Only for super_admin and lao_admin */}
                    {(userRole === 'super_admin' || userRole === 'lao_admin') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ລາຄາ <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                          value={newProductData.amount}
                          onChange={(e) => handleNewProductChange('amount', e.target.value)}
                          placeholder="ລາຄາ"
                        />
                      </div>
                    )}

                    {/* ສະກຸນເງິນ - Only for super_admin and lao_admin */}
                    {(userRole === 'super_admin' || userRole === 'lao_admin') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ສະກຸນເງິນ <span className="text-red-500">*</span>
                        </label>
                        <select
                          className="w-full p-3 border border-gray-300 rounded-md bg-white text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={newProductData.currency}
                          onChange={(e) => handleNewProductChange('currency', e.target.value)}
                        >
                          {CURRENCY_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* ການຊຳລະ - Only for super_admin and lao_admin */}
                    {(userRole === 'super_admin' || userRole === 'lao_admin') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ການຊຳລະ <span className="text-red-500">*</span>
                        </label>
                        <select
                          className="w-full p-3 border border-gray-300 rounded-md bg-white text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={newProductData.isPaid.toString()}
                          onChange={(e) => handleNewProductChange('isPaid', e.target.value === 'true')}
                        >
                          {PAYMENT_OPTIONS.map(option => (
                            <option key={option.value.toString()} value={option.value.toString()}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons for Form */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleResetForm}
                      className="bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition-colors"
                      title="ຣີເຊັດຟອມ"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={handleAddProduct}
                      disabled={!isNewProductValid()}
                      className="bg-white text-blue-600 px-6 py-2 border border-blue-600 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ເພີ່ມລາຍການ
                    </button>
                  </div>
                </div>

                {/* Column 2: Added Products Table */}
                <div className="bg-white rounded-lg border border-gray-200 min-h-[400px] flex flex-col">
                  <div className="flex-1 overflow-y-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">ລຳດັບ</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">ຊື່ລູກຄ້າ</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">ລະຫັດ</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">ເບີໂທ</th>
                          {(userRole === 'super_admin' || userRole === 'lao_admin') && (
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">ລາຄາ</th>
                          )}
                          {(userRole === 'super_admin' || userRole === 'lao_admin') && (
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">ການຊຳລະ</th>
                        )}
                        {(userRole === 'super_admin' || userRole === 'lao_admin') && (
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">ສະກຸນເງິນ</th>
                        )}
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">ຈັດການ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                          {/* If no products */}
  {addedProducts.length === 0 && selectedProducts.length === 0 ? (
    <tr>
      <td colSpan={userRole === 'super_admin' || userRole === 'lao_admin' ? 8 : 5} className="px-3 py-12">
                              <div className="flex flex-col items-center justify-center">
                                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                                  <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z"
                                    />
                                  </svg>
                                </div>
                                <p className="text-sm text-gray-500 text-center">
                                  ບໍ່ມີຂໍ້ມູນສິນຄ້າ<br />
                                  ກະລຸນາເພີ່ມສິນຄ້າໃໝ່
                                </p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          <>
                            {/* Added products */}
                            {addedProducts.map((product, index) => (
                              <tr key={`added-${product.id}`} className="hover:bg-gray-50">
                                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{index + 1}</td>
                                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap overflow-x-auto max-w-[150px]">
                                  {product.client_name}
                                </td>
                                <td className="px-3 py-3 text-sm whitespace-nowrap overflow-x-auto max-w-[150px]">
                                  <span className="text-blue-600 font-medium">{product.tracking_number}</span>
                                </td>
                                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap overflow-x-auto max-w-[120px]">
                                  {product.client_phone}
                                </td>
                                {(userRole === 'super_admin' || userRole === 'lao_admin') && (
                                  <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">
                                    {product.amount ? product.amount.toLocaleString() : '0'}
                                  </td>
                                )}
                                {(userRole === 'super_admin' || userRole === 'lao_admin') && (
                                  <td className="px-3 py-3 text-sm whitespace-nowrap">
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs font-medium ${product.is_paid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}
                                    >
                                      {product.is_paid ? 'ຊຳລະແລ້ວ' : 'ຍັງບໍ່ຊຳລະ'}
                                    </span>
                                  </td>
                                )}
                                {(userRole === 'super_admin' || userRole === 'lao_admin') && (
                                  <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">
                                    {product.currency === 'LAK'
                                      ? 'ກີບ'
                                      : product.currency === 'THB'
                                        ? 'ບາດ'
                                        : product.currency}
                                  </td>
                                )}
                                <td className="px-3 py-3 text-sm flex items-center space-x-3 whitespace-nowrap">
                                  {/* Edit button */}
                                  <button
                                    onClick={() => handleRemoveProduct(product.id)}
                                    className="text-blue-600 hover:text-blue-800"
                                    title="ແກ້ໄຂ"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15.232 5.232l3.536 3.536M9 13l6.232-6.232a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2.414a2 2 0 01.586-1.414z"
                                      />
                                    </svg>
                                  </button>
                                  {/* Delete button */}
                                  <button
                                    onClick={() => handleRemoveProduct(product.id)}
                                    className="text-red-600 hover:text-red-800"
                                    title="ລຶບ"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                      />
                                    </svg>
                                  </button>
                                </td>
                              </tr>
                            ))}

                            {/* Selected products */}
                            {selectedProducts.map((product, index) => (
                              <tr key={`selected-${product.id}`} className="hover:bg-gray-50">
                                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{index + 1}</td>
                                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap overflow-x-auto max-w-[150px]">
                                  {product.client_name}
                                </td>
                                <td className="px-3 py-3 text-sm whitespace-nowrap overflow-x-auto max-w-[150px]">
                                  <span className="text-blue-600 font-medium">{product.tracking_number}</span>
                                </td>
                                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap overflow-x-auto max-w-[120px]">
                                  {product.client_phone}
                                </td>
                                {(userRole === 'super_admin' || userRole === 'lao_admin') && (
                                  <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">
                                    {product.amount ? product.amount.toLocaleString() : '0'}
                                  </td>
                                )}
                                {(userRole === 'super_admin' || userRole === 'lao_admin') && (
                                  <td className="px-3 py-3 text-sm whitespace-nowrap">
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs font-medium ${product.is_paid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}
                                    >
                                      {product.is_paid ? 'ຊຳລະແລ້ວ' : 'ຍັງບໍ່ຊຳລະ'}
                                    </span>
                                  </td>
                                )}
                                {(userRole === 'super_admin' || userRole === 'lao_admin') && (
                                  <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">
                                    {product.currency === 'LAK'
                                      ? 'ກີບ'
                                      : product.currency === 'THB'
                                        ? 'ບາດ'
                                        : product.currency}
                                  </td>
                                )}
                                <td className="px-3 py-3 text-sm text-gray-500 text-center whitespace-nowrap">-</td>
                              </tr>
                            ))}
                          </>
                        )}
                      </tbody>




                      {/* <tbody className="divide-y divide-gray-200">
                        {addedProducts.length === 0 ? (
                          <tr>
                            <td colSpan={userRole === 'super_admin' || userRole === 'lao_admin' ? 8 : 5} className="px-3 py-12">
                              <div className="flex flex-col items-center justify-center">
                                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                                  <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.500c-.77.833.192 2.5 1.732 2.5z" />
                                  </svg>
                                </div>
                                <p className="text-sm text-gray-500 text-center">
                                  ບໍ່ມີຂໍ້ມູນສິນຄ້າ<br/>
                                  ກະລຸນາເພີ່ມສິນຄ້າໃໝ່
                                </p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          addedProducts.map((product, index) => (
                            <tr key={product.id} className="hover:bg-gray-50">
                              <td className="px-3 py-3 text-sm text-gray-900">{index + 1}</td>
                              <td className="px-3 py-3 text-sm text-gray-900">{product.client_name}</td>
                              <td className="px-3 py-3 text-sm">
                                <span className="text-blue-600 font-medium">
                                  {product.tracking_number}
                                </span>
                              </td>
                              <td className="px-3 py-3 text-sm text-gray-900">{product.client_phone}</td>
                              <td className="px-3 py-3 text-sm text-gray-900">
                                {product.amount ? product.amount.toLocaleString() : '0'}
                              </td>
                              <td className="px-3 py-3 text-sm">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  product.is_paid 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {product.is_paid ? 'ຊຳລະແລ້ວ' : 'ຍັງບໍ່ຊຳລະ'}
                                </span>
                              </td>
                              <td className="px-3 py-3 text-sm text-gray-900">
                                {product.currency === 'LAK' ? 'ກີບ' : product.currency === 'THB' ? 'ບາດ' : product.currency}
                              </td>
                              <td className="px-3 py-3 text-sm">
                                <button 
                                  onClick={() => handleRemoveProduct(product.id)}
                                  className="text-red-600 hover:text-red-800 text-sm"
                                  title="ລຶບ"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                      <tbody className="divide-y divide-gray-200">
                      {selectedProducts.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-3 py-12">
                            <div className="flex flex-col items-center justify-center">
                              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                              </div>
                              <p className="text-sm text-gray-600 text-center font-medium mb-2">
                                ຍັງບໍ່ໄດ້ເລືອກສິນຄ້າ
                              </p>
                              <p className="text-xs text-gray-500 text-center">
                                ກະລຸນາເລືອກສິນຄ້າທີ່ຕ້ອງການອັບເດດສະຖານະຈາກຕາຕະລາງກ່ອນ
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        selectedProducts.map((product, index) => (
                          <tr key={product.id} className="hover:bg-gray-50">
                            <td className="px-3 py-3 text-sm text-gray-900">{index + 1}</td>
                            <td className="px-3 py-3 text-sm text-gray-900">{product.client_name}</td>
                            <td className="px-3 py-3 text-sm">
                              <span className="text-blue-600 font-medium">
                                {product.tracking_number}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-sm text-gray-900">{product.client_phone}</td>
                            <td className="px-3 py-3 text-sm text-gray-900">
                              {product.amount ? product.amount.toLocaleString() : '0'}
                            </td>
                            <td className="px-3 py-3 text-sm text-gray-900">
                              {product.currency === 'LAK' ? 'ກີບ' : product.currency === 'THB' ? 'ບາດ' : product.currency}
                            </td>
                            <td className="px-3 py-3 text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                product.is_paid 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {product.is_paid ? 'ຊຳລະແລ້ວ' : 'ຍັງບໍ່ຊຳລະ'}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                product.status === 'AT_THAI_BRANCH' ? 'bg-blue-100 text-blue-800' :
                                product.status === 'EXIT_THAI_BRANCH' ? 'bg-yellow-100 text-yellow-800' :
                                product.status === 'AT_LAO_BRANCH' ? 'bg-purple-100 text-purple-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {getStatusLabel(product.status)}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody> */}
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Table Section */}
            {/* <div>
              <h2 className="text-lg font-medium text-gray-700 mb-4 bg-gray-100 p-3 rounded">
                ຂໍ້ມູນສິນຄ້າທີ່ເລືອກ
              </h2>
              <div className="bg-white rounded-lg border border-gray-200 min-h-[400px] flex flex-col">
                <div className="flex-1 overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-700">ລຳດັບ</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-700">ຊື່ລູກຄ້າ</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-700">ລະຫັດ</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-700">ເບີໂທ</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-700">ລາຄາ</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-700">ສະກຸນເງິນ</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-700">ການຊຳລະ</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-700">ສະຖານະ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedProducts.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-3 py-12">
                            <div className="flex flex-col items-center justify-center">
                              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                              </div>
                              <p className="text-sm text-gray-600 text-center font-medium mb-2">
                                ຍັງບໍ່ໄດ້ເລືອກສິນຄ້າ
                              </p>
                              <p className="text-xs text-gray-500 text-center">
                                ກະລຸນາເລືອກສິນຄ້າທີ່ຕ້ອງການອັບເດດສະຖານະຈາກຕາຕະລາງກ່ອນ
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        selectedProducts.map((product, index) => (
                          <tr key={product.id} className="hover:bg-gray-50">
                            <td className="px-3 py-3 text-sm text-gray-900">{index + 1}</td>
                            <td className="px-3 py-3 text-sm text-gray-900">{product.client_name}</td>
                            <td className="px-3 py-3 text-sm">
                              <span className="text-blue-600 font-medium">
                                {product.tracking_number}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-sm text-gray-900">{product.client_phone}</td>
                            <td className="px-3 py-3 text-sm text-gray-900">
                              {product.amount ? product.amount.toLocaleString() : '0'}
                            </td>
                            <td className="px-3 py-3 text-sm text-gray-900">
                              {product.currency === 'LAK' ? 'ກີບ' : product.currency === 'THB' ? 'ບາດ' : product.currency}
                            </td>
                            <td className="px-3 py-3 text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.is_paid
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                                }`}>
                                {product.is_paid ? 'ຊຳລະແລ້ວ' : 'ຍັງບໍ່ຊຳລະ'}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.status === 'AT_THAI_BRANCH' ? 'bg-blue-100 text-blue-800' :
                                  product.status === 'EXIT_THAI_BRANCH' ? 'bg-yellow-100 text-yellow-800' :
                                    product.status === 'AT_LAO_BRANCH' ? 'bg-purple-100 text-purple-800' :
                                      'bg-green-100 text-green-800'
                                }`}>
                                {getStatusLabel(product.status)}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div> */}

            {/* Bottom Action Buttons */}
            <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition-colors"
              >
                ຍົກເລີກ
              </button>
              <button
                type="button"
                onClick={handleUpdate}
                disabled={(!isFormValid() && addedProducts.length === 0) || isUpdating}
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? 'ກຳລັງອັບເດດ...' : 'ອະນຸມັດ'}
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
        message="ອັບເດດສະຖານະສິນຄ້າສຳເລັດແລ້ວ"
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

      {/* Mixed Status Popup */}
      <SuccessPopup
        open={showMixedStatusPopup}
        onOpenChange={setShowMixedStatusPopup}
        title="ແຈ້ງເຕືອນ"
        message="ສະຖານະຕ່າງກັນ (ບໍ່ສາມາດອັບເດດໄດ້)"
        autoCloseTimer={5000}
        showTimer={true}
      />
    </>
  );
};

export default UpdateStatusProductDialog;
