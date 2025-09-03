"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Product } from "../../types/product";
import { apiEndpoints } from "@/lib/config";
import { AuthService } from "@/lib/auth-service";
import { SuccessPopup } from "../ui/success-popup";
import { AlertPopup } from "../ui/alert-popup";
import { createOrder, CreateOrderData } from "@/lib/api/orders";
import Image from "next/image";

interface ComprehensiveUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedProducts: Product[];
  onUpdateSuccess?: () => void;
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

export const ComprehensiveUpdateDialog: React.FC<ComprehensiveUpdateDialogProps> = ({
  open,
  onOpenChange,
  selectedProducts,
  onUpdateSuccess
}) => {
  // State for status update (Row 1)
  const [statusUpdateData, setStatusUpdateData] = useState<UpdateFormData>({
    currentStatus: '',
    newStatus: '',
    isPaid: false
  });

  // State for new product data (Row 2, Column 1)
  const [newProductData, setNewProductData] = useState<NewProductData>({
    trackingNumber: '',
    clientPhone: '',
    clientName: '',
    amount: '',
    currency: 'LAK',
    isPaid: false
  });

  // State for added products list (Row 2, Column 2)
  const [addedProducts, setAddedProducts] = useState<Product[]>([]);
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Initialize form when dialog opens
  useEffect(() => {
    if (open && selectedProducts.length > 0) {
      // Get the most common status from selected products
      const statusCounts = selectedProducts.reduce((acc, product) => {
        acc[product.status] = (acc[product.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const mostCommonStatus = Object.entries(statusCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || '';
      
      setStatusUpdateData({
        currentStatus: mostCommonStatus,
        newStatus: '',
        isPaid: false
      });
    }

    // Reset added products when dialog opens
    setAddedProducts([]);
  }, [open, selectedProducts]);

  const getStatusLabel = (status: string) => {
    return STATUS_OPTIONS.find(option => option.value === status)?.label || status;
  };

  const handleStatusUpdateChange = (field: keyof UpdateFormData, value: string | boolean) => {
    setStatusUpdateData(prev => ({ ...prev, [field]: value }));
  };

  const handleNewProductChange = (field: keyof NewProductData, value: string | boolean) => {
    setNewProductData(prev => ({ ...prev, [field]: value }));
  };

  const isStatusUpdateValid = () => {
    return statusUpdateData.newStatus && selectedProducts.length > 0;
  };

  const isNewProductValid = () => {
    return newProductData.trackingNumber.trim() && 
           newProductData.clientPhone.trim() && 
           newProductData.clientName.trim() && 
           newProductData.amount.trim();
  };

  const handleAddProduct = async () => {
    if (!isNewProductValid()) {
      setErrorMessage('ກະລຸນາຕື່ມຂໍ້ມູນໃຫ້ຄົບຖ້ວນ');
      setShowErrorPopup(true);
      return;
    }

    try {
      // Create order data
      const orderData: CreateOrderData = {
        tracking_number: newProductData.trackingNumber,
        client_name: newProductData.clientName,
        client_phone: newProductData.clientPhone,
        amount: parseFloat(newProductData.amount),
        currency: newProductData.currency,
        status: statusUpdateData.newStatus || 'AT_THAI_BRANCH',
        is_paid: newProductData.isPaid
      };

      // Create order using the API
      const result = await createOrder(orderData);

      if (result.success) {
        // Create a new product object for the table
        const newProduct: Product = {
          id: result.data?.id || crypto.randomUUID(),
          tracking_number: newProductData.trackingNumber,
          client_name: newProductData.clientName,
          client_phone: newProductData.clientPhone,
          amount: parseFloat(newProductData.amount),
          currency: newProductData.currency,
          status: statusUpdateData.newStatus || 'AT_THAI_BRANCH',
          is_paid: newProductData.isPaid,
          created_by: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null,
          creator: undefined
        };

        // Add to the list
        setAddedProducts(prev => [...prev, newProduct]);

        // Reset form
        setNewProductData({
          trackingNumber: '',
          clientPhone: '',
          clientName: '',
          amount: '',
          currency: 'LAK',
          isPaid: false
        });

        console.log('Product added successfully:', result.data);
      } else {
        throw new Error(result.message || 'Failed to create product');
      }
    } catch (error) {
      console.error('Add product error:', error);
      setErrorMessage('ຜິດພາດໃນການເພີ່ມສິນຄ້າ: ' + error);
      setShowErrorPopup(true);
    }
  };

  const handleResetForm = () => {
    setNewProductData({
      trackingNumber: '',
      clientPhone: '',
      clientName: '',
      amount: '',
      currency: 'LAK',
      isPaid: false
    });
  };

  const handleRemoveProduct = (productId: string) => {
    setAddedProducts(prev => prev.filter(product => product.id !== productId));
  };

  const handleApprove = async () => {
    if (!isStatusUpdateValid() && addedProducts.length === 0) {
      setErrorMessage('ກະລຸນາເລືອກສະຖານະໃໝ່ ຫຼື ເພີ່ມສິນຄ້າ');
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
      // Update selected products status if valid
      if (isStatusUpdateValid()) {
        const updateData = {
          orders: selectedProducts.map(product => ({
            id: product.id,
            tracking_number: product.tracking_number,
            client_name: product.client_name,
            client_phone: product.client_phone,
            amount: product.amount || 0,
            currency: product.currency,
            status: statusUpdateData.newStatus,
            is_paid: statusUpdateData.isPaid
          }))
        };

        const response = await fetch(apiEndpoints.ordersBulk, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(updateData)
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API Error: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.message || 'Failed to update products');
        }
      }

      setShowSuccessPopup(true);
      
      // Close dialog after success
      setTimeout(() => {
        onOpenChange(false);
        if (onUpdateSuccess) {
          onUpdateSuccess();
        }
      }, 2000);

    } catch (error) {
      console.error('Update error:', error);
      setErrorMessage('ຜິດພາດໃນການອັບເດດ: ' + error);
      setShowErrorPopup(true);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setStatusUpdateData({
      currentStatus: '',
      newStatus: '',
      isPaid: false
    });
    setNewProductData({
      trackingNumber: '',
      clientPhone: '',
      clientName: '',
      amount: '',
      currency: 'LAK',
      isPaid: false
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

            {/* Row 1: ອັບເດດສະຖານະສິນຄ້າ */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-700 mb-4 bg-gray-100 p-3 rounded">
                ອັບເດດສະຖານະສິນຄ້າ
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Box 1: ສະຖານະປະຈຸບັນ */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ສະຖານະປະຈຸບັນ <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                    value={statusUpdateData.currentStatus}
                    disabled
                  >
                    <option value="">{getStatusLabel(statusUpdateData.currentStatus) || 'ສິນຄ້າຮອດໄທ'}</option>
                  </select>
                </div>

                {/* Box 2: ສະຖານະທີຕ້ອງການອັບເດດ */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ສະຖານະທີ່ຕ້ອງການອັບເດດ <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={statusUpdateData.newStatus}
                    onChange={(e) => handleStatusUpdateChange('newStatus', e.target.value)}
                  >
                    <option value="">ກະລຸນາເລືອກ</option>
                    {STATUS_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Box 3: ການຊຳລະ */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ການຊຳລະ
                  </label>
                  <select
                    className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={statusUpdateData.isPaid.toString()}
                    onChange={(e) => handleStatusUpdateChange('isPaid', e.target.value === 'true')}
                  >
                    {PAYMENT_OPTIONS.map(option => (
                      <option key={option.value.toString()} value={option.value.toString()}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Row 2: ຂໍ້ມູນສິນຄ້າ */}
            <div>
              <h2 className="text-lg font-medium text-gray-700 mb-4 bg-gray-100 p-3 rounded">
                ຂໍ້ມູນສິນຄ້າ
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Column 1: Form Input */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* ລະຫັດສິນຄ້າ */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ລະຫັດສິນຄ້າ <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={newProductData.clientName}
                        onChange={(e) => handleNewProductChange('clientName', e.target.value)}
                        placeholder="ຊື່ລູກຄ້າ"
                      />
                    </div>

                    {/* ລາຄາ */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ລາຄາ <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={newProductData.amount}
                        onChange={(e) => handleNewProductChange('amount', e.target.value)}
                        placeholder="ລາຄາ"
                      />
                    </div>

                    {/* ສະກຸນເງິນ */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ສະກຸນເງິນ <span className="text-red-500">*</span>
                      </label>
                      <select
                        className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

                    {/* ການຊຳລະ */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ການຊຳລະ <span className="text-red-500">*</span>
                      </label>
                      <select
                        className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

                {/* Column 2: Table */}
                <div className="bg-white rounded-lg border border-gray-200 min-h-[400px] flex flex-col">
                  <div className="flex-1 overflow-y-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">ລຳດັບ</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">ຊື່ລູກຄ້າ</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">ລະຫັດ</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">ເບີໂທ</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">ລາຄາ</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">ການຊຳລະ</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">ສະກຸນເງິນ</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">ຈັດການ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {addedProducts.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="px-3 py-12">
                              <div className="flex flex-col items-center justify-center">
                                <Image 
                                  src="/product-empty.png" 
                                  alt="No products" 
                                  width={96}
                                  height={96}
                                  className="mb-4 opacity-50"
                                />
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
                    </table>
                  </div>
                </div>
                grgreg
                <div className="bg-white rounded-lg border border-gray-200 min-h-[400px] flex flex-col">
  <div className="flex-1 overflow-x-auto">
    <table className="w-full min-w-[600px]">
      <thead className="bg-gray-50 sticky top-0">
        <tr>
          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">ລຳດັບ</th>
          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">ຊື່ລູກຄ້າ</th>
          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">ລະຫັດ</th>
          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">ເບີໂທ</th>
          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">ລາຄາ</th>
          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">ການຊຳລະ</th>
          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">ສະກຸນເງິນ</th>
          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">ຈັດການ</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {addedProducts.length === 0 ? (
          <tr>
            <td colSpan={8} className="px-3 py-12">
              <div className="flex flex-col items-center justify-center">
                <Image 
                  src="/product-empty.png" 
                  alt="No products" 
                  width={96}
                  height={96}
                  className="mb-4 opacity-50"
                />
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
              <td className="px-3 py-3 text-sm text-blue-600 font-medium">{product.tracking_number}</td>
              <td className="px-3 py-3 text-sm text-gray-900">{product.client_phone}</td>
              <td className="px-3 py-3 text-sm text-gray-900">{product.amount ? product.amount.toLocaleString() : '0'}</td>
              <td className="px-3 py-3 text-sm">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.is_paid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
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
    </table>
  </div>
</div>

              </div>
            </div>

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
                onClick={handleApprove}
                disabled={(!isStatusUpdateValid() && addedProducts.length === 0) || isUpdating}
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
        message="ອັບເດດສິນຄ້າສຳເລັດແລ້ວ"
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

export default ComprehensiveUpdateDialog;