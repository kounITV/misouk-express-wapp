"use client";

import React, { memo, useState, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PRODUCT_TEXT, LABELS, PLACEHOLDERS, STATUS_OPTIONS, CURRENCY_OPTIONS, PAYMENT_OPTIONS, BUTTONS } from "@/lib/constants/text";
//import { Product } from "@/app/types/product";
import { Product } from "../../types/product";
import { apiEndpoints } from "@/lib/config";
import { AuthService } from "@/lib/auth-service";
import SuccessPopup from "../ui/success-popup";
import AlertPopup from "../ui/alert-popup";

// Helper function to handle API error responses
const handleApiError = async (response: Response) => {
  const errorText = await response.text();
  const specificStatusCodes = [400, 402, 403, 404, 409];
  
  try {
    const errorResult = JSON.parse(errorText);
    if (errorResult.message) {
      return errorResult.message;
    }
  } catch {
    // JSON parsing failed, continue to status code check
  }
  
  // If no message from API and it's a specific status code, show fallback message
  if (specificStatusCodes.includes(response.status)) {
    return 'ລະບົບຂັດຂ້ອງ, ກະລຸນາລອງໃໝ່';
  }
  
  // For other status codes, show the original error
  return `ຜິດພາດ ${response.status}: ${errorText}`;
};

interface FormData {
  productCode: string;
  senderName: string;
  receiverName: string;
  senderPhone: string;
  amount: string;
  currency: string;
  serviceType: string;
  status: string;
  isPaid: boolean;
  remark: string;
}

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: FormData;
  onFormChange: (form: FormData) => void;
  onReset: () => void;
  onSubmit: () => void;
  isFormValid: boolean;
  creating: boolean;
  editingProduct: Product | null;
  products: Product[];
  formatAmount: (amount: number | null) => string;
  formatCurrency: (currency: string | null) => string;
  onProductsUpdate?: (products: Product[]) => void; // New prop for real-time updates
  userRole?: string | null; // Add user role prop
}

const ProductDialog = memo(({
  open,
  onOpenChange,
  form,
  onFormChange,
  onReset,
  onSubmit,
  isFormValid,
  creating,
  editingProduct,
  products,
  formatAmount,
  formatCurrency,
  onProductsUpdate,
  userRole,
}: ProductDialogProps) => {
  // Local state for products added through this dialog
  const [dialogProducts, setDialogProducts] = useState<Product[]>([]);
  const [isApproving, setIsApproving] = useState(false);

  // Popup states
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showAlertPopup, setShowAlertPopup] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'info' as 'error' | 'warning' | 'info'
  });

  // Inline editing states
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Partial<Product>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  // Reset dialog products when dialog opens/closes
  useEffect(() => {
    if (open) {
      setDialogProducts([]);
    }
  }, [open]);

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    onFormChange({ ...form, [field]: value });
  };

  // Helper function to show alerts
  const showAlert = (message: string, type: 'error' | 'warning' | 'info' = 'error', title?: string) => {
    setAlertConfig({ title: title || '', message, type });
    setShowAlertPopup(true);
  };

  // Inline editing functions
  const startEditing = (product: Product) => {
    setEditingProductId(product.id);
    setEditingData({
      client_name: product.client_name,
      tracking_number: product.tracking_number,
      client_phone: product.client_phone,
      amount: product.amount,
      currency: product.currency,
      remark: product.remark
    });
  };

  const cancelEditing = () => {
    setEditingProductId(null);
    setEditingData({});
  };

  const saveEditing = () => {
    if (!editingProductId) return;


    setDialogProducts(prev => prev.map(product =>
      product.id === editingProductId
        ? { ...product, ...editingData }
        : product
    ));

    setEditingProductId(null);
    setEditingData({});
  };

  const confirmDelete = (productId: string) => {
    setProductToDelete(productId);
    setShowDeleteConfirm(true);
  };

  const handleDelete = () => {
    if (productToDelete) {
      setDialogProducts(prev => prev.filter(product => product.id !== productToDelete));
      setProductToDelete(null);
      setShowDeleteConfirm(false);
    }
  };

  // Handle form submission and add to local dialog products
  const handleSubmit = () => {
    if (!isFormValid) return;


    // Check if product with same code already exists
    const existingProduct = dialogProducts.find(
      product => product.tracking_number === form.productCode
    );

    if (existingProduct) {
      showAlert('ສິນຄ້ານີ້ມີໃນຕາຕະລາງແລ້ວ ກະລຸນາເລືອກລະຫັດອື່ນ', 'warning');
      return;
    }

    // Create new product from form data
    const newProduct: Product = {
      id: crypto.randomUUID(),
      tracking_number: form.productCode,
      client_name: form.senderName,
      client_phone: form.senderPhone ? form.senderPhone : null,
      amount: form.amount ? parseFloat(form.amount) : null,
      currency: (form.currency && form.currency !== 'LAK') ? form.currency : null,
      status: form.status,
      is_paid: form.isPaid,
      remark: form.remark || null,
      created_by: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
      creator: undefined
    };

    // Add to local dialog products
    setDialogProducts(prev => [newProduct, ...prev]);

    // Clear Product Code, Price, and Remark fields
    onFormChange({
      ...form,
      productCode: "",
      amount: "",
      remark: ""
    });
  };

  // Handle approve button - send all products to API
  const handleApprove = async () => {
    if (dialogProducts.length === 0) return;

    // Check if user is authenticated
    const token = AuthService.getStoredToken();
    if (!token) {
      showAlert('ກະລຸນາເຂົ້າສູ່ລະບົບກ່ອນ', 'warning');
      return;
    }

    setIsApproving(true);

    try {
      // Prepare orders data in the required format based on user role
      const ordersData = {
        orders: dialogProducts.map(product => {
          const orderData: any = {
            id: crypto.randomUUID(), // Add required UUID
            tracking_number: product.tracking_number,
            client_name: product.client_name,
            client_phone: product.client_phone,
            status: product.status,
            remark: product.remark
          };

          // Only include amount, currency, and is_paid for non-thai_admin roles
          if (userRole !== 'thai_admin') {
            // Validate amount - database has precision 10, scale 2 (max 99,999,999.99)
            const amount = product.amount || 0;

            orderData.amount = amount; // Send as number, not string
            
            // Only include currency if it has a value
            if (product.currency && product.currency.trim()) {
              orderData.currency = product.currency;
            }
            
            orderData.is_paid = product.is_paid;
          }

          return orderData;
        })
      };

      console.log('Sending orders data:', ordersData);
      console.log('API endpoint:', apiEndpoints.ordersBulk);
      console.log('Number of orders:', ordersData.orders.length);
      console.log('Auth token:', token ? 'Present' : 'Missing');

      // Call the orders API - using the bulk endpoint
      const response = await fetch(apiEndpoints.ordersBulk, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(ordersData)
      });

      console.log('Response status:', response.status);
      console.log('Response status text:', response.statusText);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      const responseText = await response.text();
      console.log('Response body:', responseText);

      if (response.ok) {
        try {
          const result = JSON.parse(responseText);
          console.log('Parsed API response:', result);
          if (result.success) {
            // Show success popup
            setShowSuccessPopup(true);

            // Update parent component with new data for real-time updates
            if (onProductsUpdate && result.data) {
              const createdProducts = Array.isArray(result.data) ? result.data :
                result.data.orders ? result.data.orders : [];
              onProductsUpdate(createdProducts);
            }

            // Reset form but keep dialog open
            setDialogProducts([]);
            onReset();
          } else {
            // Handle API error response
            let errorMessage = result.message || 'ບໍ່ສາມາດເພີ່ມສິນຄ້າໄດ້';

            // If there are specific errors, show them
            if (result.errors && Array.isArray(result.errors) && result.errors.length > 0) {
              errorMessage = result.errors.join('\n');
            }

            showAlert(errorMessage, 'error', 'ຜິດພາດ');
          }
        } catch (parseError) {
          console.error('Error parsing JSON response:', parseError);
          showAlert('ຜິດພາດໃນການອ່ານຂໍ້ມູນຈາກເຊີເວີ', 'error');
        }
      } else {
        console.error('API error:', response.status, responseText);

        // Try to parse error response to get message
        let errorMessage = `${response.status} ${response.statusText}`;
        try {
          const errorResult = JSON.parse(responseText);
          if (errorResult.message) {
            errorMessage = errorResult.message;
            // If there are specific errors, show them
            if (errorResult.errors && Array.isArray(errorResult.errors) && errorResult.errors.length > 0) {
              errorMessage += '\n' + errorResult.errors.join('\n');
            }
          }
        } catch (parseError) {
          // If parsing fails, use the raw response text
          errorMessage += `\n\n${responseText}`;
        }

        showAlert(errorMessage, 'error', 'ຜິດພາດ');
      }
    } catch (error) {
      console.error('Network error:', error);
      showAlert('ຜິດພາດໃນການເຊື່ອມຕໍ່ກັບເຊີເວີ: ' + error, 'error');
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm w-full mx-2 sm:mx-4 max-h-[95vh] sm:max-h-[100vh] sm:max-w-2xl md:max-w-3xl lg:max-w-5xl xl:max-w-7xl bg-white flex flex-col">
        <div className="flex-1 overflow-y-auto p-0">
          {/* Title */}
          <h1 className="text-xl font-semibold text-[#0d0d0d] mb-6 text-left">
            {PRODUCT_TEXT.ADD_PRODUCT}
          </h1>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-[#F1F1F1]">
            <h2 className="text-base font-medium text-[#0d0d0d] mb-2">
              {PRODUCT_TEXT.PRODUCT_INFO}
            </h2>
          </div>
          <br />
          <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 h-full">
            {/* Column 1 - Form Section */}
            <div className="flex flex-col">
              <div className="border-2 border-dashed border-[#cccccc] p-3 sm:p-6 rounded-lg bg-[#ffffff] flex-1">
                <div className="space-y-4">
                  {/* Status */}
                  {(userRole === 'super_admin' || userRole === 'lao_admin') && (
                    <div>
                      <label className="block text-sm font-medium text-[#0d0d0d] mb-2">
                        {LABELS.STATUS}
                      </label>
                      <select
                        className="w-full p-3 border border-[#dddddd] rounded-md bg-[#ffffff] text-[#0d0d0d] focus:ring-[#015c96] focus:border-[#015c96]"
                        value={form.status}
                        onChange={(e) => handleInputChange('status', e.target.value)}
                      >
                        <option value="">{PLACEHOLDERS.SELECT_STATUS}</option>
                        <option value="AT_THAI_BRANCH">ສິນຄ້າຮອດໄທ</option>
                        <option value="EXIT_THAI_BRANCH">ສິ້ນຄ້າອອກຈາກໄທ</option>
                        {(userRole as string) !== 'thai_admin' && (
                          <>
                            <option value="AT_LAO_BRANCH">ສິ້ນຄ້າຮອດລາວ</option>
                            <option value="COMPLETED">ລູກຄ້າຮັບເອົາສິນຄ້າ</option>
                          </>
                        )}
                      </select>
                    </div>
                  )}
                  {/* Product Code */}
                  <div>
                    <label className="block text-sm font-medium text-[#0d0d0d] mb-2">
                      {LABELS.PRODUCT_CODE} <span className="text-[#ff0000]">{PRODUCT_TEXT.REQUIRED}</span>
                    </label>
                    <input
                      type="text"
                      placeholder={PLACEHOLDERS.ENTER_CODE}
                      className="w-full p-3 border border-[#dddddd] rounded-md bg-[#ffffff] text-[#0d0d0d] placeholder-[#818A91] focus:ring-[#015c96] focus:border-[#015c96]"
                      value={form.productCode}
                      onChange={(e) => handleInputChange('productCode', e.target.value)}
                    />
                  </div>

                  {/* Customer Phone */}
                  <div>
                    <label className="block text-sm font-medium text-[#0d0d0d] mb-2">
                      {LABELS.CUSTOMER_PHONE}
                    </label>
                    <input
                      type="tel"
                      placeholder={PLACEHOLDERS.ENTER_PHONE}
                      pattern="[0-9]*"
                      className="w-full p-3 border border-[#dddddd] rounded-md bg-[#ffffff] text-[#0d0d0d] placeholder-[#818A91] focus:ring-[#015c96] focus:border-[#015c96]"
                      value={form.senderPhone}
                      onChange={(e) => {
                        // Only allow numbers
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        handleInputChange('senderPhone', value);
                      }}
                    />
                  </div>

                  {/* Customer Name */}
                  <div>
                    <label className="block text-sm font-medium text-[#0d0d0d] mb-2">
                      {LABELS.CUSTOMER_NAME} <span className="text-[#ff0000]">{PRODUCT_TEXT.REQUIRED}</span>
                    </label>
                    <input
                      type="text"
                      placeholder={PLACEHOLDERS.ENTER_NAME}
                      className="w-full p-3 border border-[#dddddd] rounded-md bg-[#ffffff] text-[#0d0d0d] placeholder-[#818A91] focus:ring-[#015c96] focus:border-[#015c96]"
                      value={form.senderName}
                      onChange={(e) => handleInputChange('senderName', e.target.value)}
                    />
                  </div>

                  {/* Price - Only for super_admin and lao_admin */}
                  {(userRole === 'super_admin' || userRole === 'lao_admin') && (
                    <div>
                      <label className="block text-sm font-medium text-[#0d0d0d] mb-2">
                        {LABELS.PRICE}
                      </label>
                      <input
                        type="number"
                        placeholder={PLACEHOLDERS.ENTER_PRICE}
                        min="0"
                        step="0.01"
                        className="w-full p-3 border border-[#dddddd] rounded-md bg-[#ffffff] text-[#0d0d0d] placeholder-[#818A91] focus:ring-[#015c96] focus:border-[#015c96]"
                        value={form.amount}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          if (value < 0) {
                            return; // Don't allow negative values
                          }
                          handleInputChange('amount', e.target.value);
                        }}
                      />
                    </div>
                  )}

                  {/* Currency - Only for super_admin and lao_admin */}
                  {(userRole === 'super_admin' || userRole === 'lao_admin') && (
                    <div>
                      <label className="block text-sm font-medium text-[#0d0d0d] mb-2">
                        {LABELS.CURRENCY}
                      </label>
                      <select
                        className="w-full p-3 border border-[#dddddd] rounded-md bg-[#ffffff] text-[#0d0d0d] focus:ring-[#015c96] focus:border-[#015c96]"
                        value={form.currency === 'LAK' ? '' : form.currency}
                        onChange={(e) => handleInputChange('currency', e.target.value)}
                      >
                        <option value="">{PLACEHOLDERS.SELECT_CURRENCY}</option>
                        <option value="LAK">{CURRENCY_OPTIONS.LAK}</option>
                        <option value="THB">{CURRENCY_OPTIONS.THB}</option>
                      </select>
                    </div>
                  )}

                  {/* Payment Status - Only for super_admin and lao_admin */}
                  {(userRole === 'super_admin' || userRole === 'lao_admin') && (
                    <div>
                      <label className="block text-sm font-medium text-[#0d0d0d] mb-2">
                        {LABELS.PAYMENT_STATUS}
                      </label>
                      <select
                        className="w-full p-3 border border-[#dddddd] rounded-md bg-[#ffffff] text-[#0d0d0d] focus:ring-[#015c96] focus:border-[#015c96]"
                        value={form.isPaid.toString()}
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

                  {/* Remark Field */}
                  <div>
                    <label className="block text-sm font-medium text-[#0d0d0d] mb-2">
                      ໝາຍເຫດ
                    </label>
                    <textarea
                      className="w-full p-3 border border-[#dddddd] rounded-md bg-[#ffffff] text-[#0d0d0d] focus:ring-[#015c96] focus:border-[#015c96] placeholder-[#818A91] resize-none"
                      value={form.remark}
                      onChange={(e) => handleInputChange('remark', e.target.value)}
                      placeholder="ໝາຍເຫດ (ສາມາດປະໄວ້ເປົ່າໄດ້)"
                      rows={3}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={onReset}
                      className="bg-[#015c96] text-[#ffffff] p-3 rounded-md hover:bg-[#247dc9] transition-colors"
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
                      onClick={handleSubmit}
                      disabled={!isFormValid}
                      className="bg-[#ffffff] text-[#015c96] px-6 py-2 border border-[#015c96] rounded-md hover:bg-[#f1f1f1] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {BUTTONS.ADD_ITEM}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2 - Table Section */}
            <div className="bg-[#ffffff] rounded-lg overflow-hidden border border-[#e9ecef] h-full flex flex-col">

              {/* Table Structure - Always Visible with Scroll */}
              <div className="flex-1 overflow-y-auto overflow-x-auto max-w-full">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-[#F1F1F1] sticky top-0 z-10">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-[#495057]">{LABELS.ROW_NUMBER}</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-[#495057]">{LABELS.CUSTOMER_NAME}</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-[#495057]">{LABELS.PRODUCT_CODE}</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-[#495057]">{LABELS.PHONE}</th>
                      {(userRole === 'super_admin' || userRole === 'lao_admin') && (
                        <th className="px-3 py-2 text-left text-xs font-medium text-[#495057]">{LABELS.PRICE}</th>
                      )}
                      {(userRole === 'super_admin' || userRole === 'lao_admin') && (
                        <th className="px-3 py-2 text-left text-xs font-medium text-[#495057]">{LABELS.CURRENCY}</th>
                      )}
                      <th className="px-3 py-2 text-left text-xs font-medium text-[#495057]">ໝາຍເຫດ</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-[#495057]">{LABELS.ACTIONS}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#dee2e6]">
                    {dialogProducts.length === 0 ? (
                      // Empty state within table structure
                      <tr>
                        <td colSpan={userRole === 'super_admin' || userRole === 'lao_admin' ? 8 : 6} className="px-3 py-12">
                          <div className="flex flex-col items-center justify-center">
                            <img
                              src="/product-empty.png"
                              alt="No products"
                              className="w-24 h-24 mb-4 opacity-50"
                            />
                            <p className="text-sm text-gray-500 text-center">
                              ບໍ່ມີຂໍ້ມູນສິນຄ້າ<br />
                              ກະລຸນາເພີ່ມສິນຄ້າກ່ອນ
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      // Products data
                      dialogProducts.map((product, index) => {
                        const isEditing = editingProductId === product.id;
                        return (
                          <tr key={product.id} className="hover:bg-[#f8f9fa]">
                            <td className="px-3 py-2 text-xs text-[#495057]">{index + 1}</td>

                            {/* Customer Name */}
                            <td className="px-3 py-2 text-xs text-[#495057]">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editingData.client_name || ''}
                                  onChange={(e) => setEditingData({ ...editingData, client_name: e.target.value })}
                                  className="w-full px-1 py-1 text-xs border border-gray-300 rounded"
                                />
                              ) : (
                                product.client_name
                              )}
                            </td>

                            {/* Product Code */}
                            <td className="px-3 py-2 text-xs">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editingData.tracking_number || ''}
                                  onChange={(e) => setEditingData({ ...editingData, tracking_number: e.target.value })}
                                  className="w-full px-1 py-1 text-xs border border-gray-300 rounded"
                                />
                              ) : (
                                <span className="text-[#007bff]">
                                  {product.tracking_number.length > 8 
                                    ? `${product.tracking_number.substring(0, 8)}...` 
                                    : product.tracking_number}
                                </span>
                              )}
                            </td>

                            {/* Phone */}
                            <td className="px-3 py-2 text-xs text-[#495057]">
                              {isEditing ? (
                                <input
                                  type="tel"
                                  value={editingData.client_phone || ''}
                                  onChange={(e) => {
                                    const value = e.target.value.replace(/[^0-9]/g, '');
                                    setEditingData({ ...editingData, client_phone: value });
                                  }}
                                  className="w-full px-1 py-1 text-xs border border-gray-300 rounded"
                                />
                              ) : (
                                product.client_phone || '-'
                              )}
                            </td>

                            {/* Price - Only for super_admin and lao_admin */}
                            {(userRole === 'super_admin' || userRole === 'lao_admin') && (
                              <td className="px-3 py-2 text-xs text-[#495057]">
                                {isEditing ? (
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={editingData.amount || ''}
                                    onChange={(e) => setEditingData({ ...editingData, amount: parseFloat(e.target.value) || 0 })}
                                    className="w-full px-1 py-1 text-xs border border-gray-300 rounded"
                                  />
                                ) : (
                                  formatAmount(product.amount)
                                )}
                              </td>
                            )}

                            {/* Currency - Only for super_admin and lao_admin */}
                            {(userRole === 'super_admin' || userRole === 'lao_admin') && (
                              <td className="px-3 py-2 text-xs text-[#495057]">
                                {isEditing ? (
                                  <select
                                    value={editingData.currency || ''}
                                    onChange={(e) => setEditingData({ ...editingData, currency: e.target.value })}
                                    className="w-full px-1 py-1 text-xs border border-gray-300 rounded"
                                  >
                                    <option value="LAK">ກີບ</option>
                                    <option value="THB">ບາດ</option>
                                  </select>
                                ) : (
                                  product.currency === 'LAK' ? 'ກີບ' : product.currency === 'THB' ? 'ບາດ' : product.currency
                                )}
                              </td>
                            )}

                            {/* Remark */}
                            <td className="px-3 py-2 text-xs text-[#495057]">
                              {isEditing ? (
                                <textarea
                                  value={editingData.remark || ''}
                                  onChange={(e) => setEditingData({ ...editingData, remark: e.target.value })}
                                  className="w-full px-1 py-1 text-xs border border-gray-300 rounded resize-none"
                                  rows={2}
                                  placeholder="ໝາຍເຫດ"
                                />
                              ) : (
                                <div className="max-w-[150px] truncate" title={product.remark || ''}>
                                  {product.remark || '-'}
                                </div>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="px-3 py-2 text-xs">
                              {isEditing ? (
                                <div className="flex gap-1">
                                  <button
                                    onClick={saveEditing}
                                    className="text-green-600 hover:text-green-800"
                                    title="ບັນທຶກ"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={cancelEditing}
                                    className="text-red-600 hover:text-red-800"
                                    title="ຍົກເລີກ"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                              ) : (
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => startEditing(product)}
                                    className="text-blue-600 hover:text-blue-800"
                                    title="ແກ້ໄຂ"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => confirmDelete(product.id)}
                                    className="text-red-600 hover:text-red-800"
                                    title="ລຶບ"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Bottom Action Buttons */}
          <div className="flex justify-end gap-2 pt-1 mt-3">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="bg-[#dc3545] text-[#ffffff] px-6 py-2 rounded-md hover:bg-[#c82333] transition-colors"
            >
              {BUTTONS.CANCEL}
            </button>
            <button
              type="button"
              onClick={handleApprove}
              disabled={dialogProducts.length === 0 || isApproving}
              className="bg-[#007bff] text-[#ffffff] px-6 py-2 rounded-md hover:bg-[#0056b3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isApproving ? 'ກຳລາການຢືນຢັນ...' : BUTTONS.APPROVE}
            </button>
          </div>
        </div>
      </DialogContent>

      {/* Success Popup */}
      <SuccessPopup
        open={showSuccessPopup}
        onOpenChange={setShowSuccessPopup}
        title="ສຳເລັດ!"
        message="ໄດ້ເພີ່ມສິນຄ້າສຳເລັດແລ້ວ"
      />

      {/* Alert Popup */}
      <AlertPopup
        open={showAlertPopup}
        onOpenChange={setShowAlertPopup}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
      />

      {/* Delete Confirmation Dialog */}
      <AlertPopup
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="ຢືນຢັນການລຶບ"
        message="ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບລາຍການນີ້?"
        type="warning"
        onConfirm={handleDelete}
        confirmText="ລຶບ"
        cancelText="ຍົກເລີກ"
      />
    </Dialog>
  );
});

ProductDialog.displayName = 'ProductDialog';

export default ProductDialog;

