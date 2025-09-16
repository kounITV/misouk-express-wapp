"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Product } from "../../types/product";
import { apiEndpoints } from "@/lib/config";
import { AuthService } from "@/lib/auth-service";
import { SuccessPopup } from "../ui/success-popup";
import { AlertPopup } from "../ui/alert-popup";
import { useToast } from "../ui/use-toast";
import { Toaster } from "../ui/toaster";

interface UpdateStatusProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedProducts: Product[];
  onUpdateSuccess?: () => void;
  onRemoveSelectedProduct?: (productId: string) => void; // Add callback for removing selected products
  onClose?: () => void; // Add callback for when dialog is closed
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
  remark: string;
}

const STATUS_OPTIONS = [
  { value: 'AT_THAI_BRANCH', label: 'ສິນຄ້າຮອດໄທ' },
  { value: 'EXIT_THAI_BRANCH', label: 'ສິ້ນຄ້າອອກຈາກໄທ' },
  { value: 'AT_LAO_BRANCH', label: 'ສິ້ນຄ້າຮອດລາວ' },
  { value: 'COMPLETED', label: 'ລູກຄ້າຮັບເອົາສິນຄ້າ' }
];

// Status progression logic
const getNextStatus = (currentStatus: string): string => {
  switch (currentStatus) {
    case 'AT_THAI_BRANCH':
      return 'EXIT_THAI_BRANCH';
    case 'EXIT_THAI_BRANCH':
      return 'AT_LAO_BRANCH';
    case 'AT_LAO_BRANCH':
      return 'COMPLETED';
    case 'COMPLETED':
      return 'COMPLETED'; // Last status, no progression
    default:
      return 'AT_THAI_BRANCH'; // Default starting status
  }
};

// Check if a status update is a rollback (going backwards)
const isRollback = (currentStatus: string, newStatus: string): boolean => {
  const statusOrder = ['AT_THAI_BRANCH', 'EXIT_THAI_BRANCH', 'AT_LAO_BRANCH', 'COMPLETED'];
  const currentIndex = statusOrder.indexOf(currentStatus);
  const newIndex = statusOrder.indexOf(newStatus);
  
  // If either status is not found in the order, it's not a rollback
  if (currentIndex === -1 || newIndex === -1) {
    return false;
  }
  
  // If new index is less than current index, it's a rollback
  return newIndex < currentIndex;
};

// Role-specific status options
const getStatusOptionsForRole = (userRole: string) => {
  if (userRole === 'thai_admin') {
    return [
      { value: 'AT_THAI_BRANCH', label: 'ສິນຄ້າຮອດໄທ' },
      { value: 'EXIT_THAI_BRANCH', label: 'ສິ້ນຄ້າອອກຈາກໄທ' }
    ];
  }
  return STATUS_OPTIONS;
};

const PAYMENT_OPTIONS = [
  { value: true, label: 'ຊຳລະແລ້ວ' },
  { value: false, label: 'ຍັງບໍ່ໄດ້ຊຳລະ' }
];

const CURRENCY_OPTIONS = [
  { value: 'LAK', label: 'ກີບ (LAK)' },
  { value: 'THB', label: 'ບາດ (THB)' }
];

// Simple Copy Component without Tooltip
interface CopyTextProps {
  text: string;
  children: React.ReactNode;
  className?: string;
}

const CopyText: React.FC<CopyTextProps> = ({ text, children, className = "" }) => {
  const { toast } = useToast();

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      console.log('Copying text:', text);
      await navigator.clipboard.writeText(text);
      console.log('Text copied successfully');
      
      // Show toast notification
      toast({
        title: "ຄັດລອກສຳເລັດ!",
        description: `ລະຫັດ: ${text}`,
        duration: 2000,
      });
    } catch (err) {
      console.error('Failed to copy text: ', err);
      toast({
        title: "ຜິດພາດ",
        description: "ບໍ່ສາມາດຄັດລອກໄດ້",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  return (
    <span 
      className={`cursor-pointer hover:underline ${className}`}
      onClick={handleCopy}
      title="ຄັດລອກລະຫັດ"
    >
      {children}
    </span>
  );
};

export const UpdateStatusProductDialog: React.FC<UpdateStatusProductDialogProps> = ({
  open,
  onOpenChange,
  selectedProducts,
  onUpdateSuccess,
  onRemoveSelectedProduct,
  onClose,
  userRole
}) => {
  const [formData, setFormData] = useState<UpdateFormData>({
    currentStatus: '',
    newStatus: '',
    isPaid: false
  });

  // State to track if status fields have been locked (should not change until approve)
  const [statusFieldsLocked, setStatusFieldsLocked] = useState(false);

  // State for new product data
  const [newProductData, setNewProductData] = useState<NewProductData>({
    trackingNumber: '',
    clientPhone: '',
    clientName: '',
    amount: '',
    currency: '',
    isPaid: false,
    remark: ''
  });

  // State for added products list
  const [addedProducts, setAddedProducts] = useState<Product[]>([]);
  
  // State for tracking edited selected products
  const [editedSelectedProducts, setEditedSelectedProducts] = useState<Record<string, Partial<Product>>>({});

  const [isUpdating, setIsUpdating] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showMixedStatusPopup, setShowMixedStatusPopup] = useState(false);
  const [isCheckingTracking, setIsCheckingTracking] = useState(false);
  const [trackingDataFound, setTrackingDataFound] = useState(false);
  const [showTrackingNotFoundPopup, setShowTrackingNotFoundPopup] = useState(false);
  const [existingProductData, setExistingProductData] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Product>>({});
  const [inlineEditingId, setInlineEditingId] = useState<string | null>(null);
  const [inlineEditData, setInlineEditData] = useState<Partial<Product>>({});

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

    // Initialize form when dialog opens
  useEffect(() => {
    if (open) {
      if (selectedProducts.length === 0) {
        // No products selected - only reset form if status fields are not locked
        if (!statusFieldsLocked) {
          setFormData({
            currentStatus: '',
            newStatus: '',
            isPaid: false
          });
        }
        // Don't clear addedProducts - keep them for the user
      } else {
        // Check if all selected products have the same status
        const firstProduct = selectedProducts[0];
        if (firstProduct) {
          const allSameStatus = selectedProducts.every(product => product.status === firstProduct.status);
          
          if (allSameStatus) {
            // All products have the same status - use that status
            // Only set if current status is empty (first time)
            if (!formData.currentStatus) {
              // Always show the next status by default
              const nextStatus = getNextStatus(firstProduct.status);
              setFormData({
                currentStatus: firstProduct.status,
                newStatus: nextStatus,
                isPaid: false
              });
              // Lock status fields once they're set
              setStatusFieldsLocked(true);
            }

            // Status validation removed - only check when pressing "ເພີ່ມລາຍການ"
          } else {
            // Products have different statuses - this should not happen now
            // as we check at the parent level, but keep this as fallback
            if (!formData.currentStatus) {
              setFormData({
                currentStatus: 'MIXED_STATUS',
                newStatus: '',
                isPaid: false
              });
            }
          }
        }
      }
    } else {
      // Dialog closed - clear all state
      setFormData({
        currentStatus: '',
        newStatus: '',
        isPaid: false
      });
      setStatusFieldsLocked(false);
      setNewProductData({
        trackingNumber: '',
        clientPhone: '',
        clientName: '',
        amount: '',
        currency: '',
        isPaid: false,
        remark: ''
      });
      setAddedProducts([]);
      setEditedSelectedProducts({});
      setExistingProductData(null);
      setTrackingDataFound(false);
      setInlineEditingId(null);
      setInlineEditData({});
      setEditingProduct(null);
      setEditFormData({});
      setIsUpdating(false);
      setIsCheckingTracking(false);
      // Don't reset popup state here - let the timer handle it
    }
  }, [open, selectedProducts, onOpenChange, newProductData.trackingNumber, existingProductData, statusFieldsLocked]);



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
    if (selectedProducts.length === 0 && addedProducts.length === 0) {
      // When no products selected and no added products, need both current and new status
      return formData.currentStatus && formData.newStatus;
    }
    if (formData.currentStatus === 'MIXED_STATUS') return false;
    if (!formData.newStatus) return false;
    return true;
  };

  const isNewProductValid = () => {
    const baseValidation = newProductData.trackingNumber &&
      newProductData.clientName;
    
    // Amount, currency, and isPaid are now optional for all roles
    return baseValidation;
  };

  const handleNewProductChange = (field: keyof NewProductData, value: string | boolean) => {
    setNewProductData(prev => ({ ...prev, [field]: value }));
    // Reset tracking data found state when tracking number changes
    if (field === 'trackingNumber') {
      setTrackingDataFound(false);
      setExistingProductData(null);
    }
  };

  const handleCheckTrackingNumber = async () => {
    if (!newProductData.trackingNumber.trim()) {
      setErrorMessage('ກະລຸນາໃສ່ລະຫັດສິນຄ້າກ່ອນ');
      setShowErrorPopup(true);
      return;
    }

    setIsCheckingTracking(true);
    try {
      
      const response = await fetch(`${apiEndpoints.orders}/tracking/${encodeURIComponent(newProductData.trackingNumber)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AuthService.getStoredToken()}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          // Tracking number found - populate form with existing data
          const existingProduct = data.data;

          // Store the existing product data with its original ID
          setExistingProductData(existingProduct);
          
          setNewProductData(prev => ({
            ...prev,
            clientPhone: existingProduct.client_phone || '',
            clientName: existingProduct.client_name || '',
            amount: existingProduct.amount ? existingProduct.amount.toString() : '',
            currency: existingProduct.currency || 'LAK',
            isPaid: existingProduct.is_paid || false,
            remark: existingProduct.remark || ''
          }));
          
          console.log('Updated form data with:', {
            clientPhone: existingProduct.client_phone || '',
            clientName: existingProduct.client_name || '',
            amount: existingProduct.amount ? existingProduct.amount.toString() : '',
            currency: existingProduct.currency || 'LAK',
            isPaid: existingProduct.is_paid || false,
            remark: existingProduct.remark || ''
          });
          
          setTrackingDataFound(true);

          // Only update status fields if no selected products, status fields are not locked, and no current status is set
          if (selectedProducts.length === 0 && !statusFieldsLocked && !formData.currentStatus) {
            // No selected products - update status fields based on tracking number
            const currentStatus = existingProduct.status;
            // Always show the next status by default
            const nextStatus = getNextStatus(currentStatus);
            
            console.log('Tracking number found - updating status fields:', {
              currentStatus,
              nextStatus,
              existingProduct
            });
            
            setFormData(prev => {
              const newFormData = {
                ...prev,
                currentStatus: currentStatus,
                newStatus: nextStatus
              };
              console.log('Setting form data:', newFormData);
              return newFormData;
            });
            // Lock status fields once they're set
            setStatusFieldsLocked(true);
          }
          // If selected products exist, don't change the status fields - keep them as they are
          
          // No popup when data is found - just populate the form
        } else {
          // Tracking number not found
          setShowTrackingNotFoundPopup(true);
          setTrackingDataFound(false);
        }
      } else {
        // HTTP error - use helper function to handle specific status codes
        const errorMsg = await handleApiError(response);
        setErrorMessage(errorMsg);
        setShowErrorPopup(true);
      }
    } catch (error) {
      setErrorMessage('ຜິດພາດໃນການກວດສອບລະຫັດສິນຄ້າ');
      setShowErrorPopup(true);
    } finally {
      setIsCheckingTracking(false);
    }
  };

  const handleAddProduct = () => {
    console.log('handleAddProduct called with:', {
      newProductData,
      existingProductData,
      formData,
      userRole,
      selectedProducts: selectedProducts.length,
      isSuperAdmin: userRole === 'super_admin'
    });

    if (!isNewProductValid()) {
      console.log('Product validation failed');
      return;
    }

    // Check if tracking number already exists in addedProducts or selectedProducts
    const trackingNumber = newProductData.trackingNumber;
    const existingInAdded = addedProducts.some(p => p.tracking_number === trackingNumber);
    const existingInSelected = selectedProducts.some(p => p.tracking_number === trackingNumber);
    
    if (existingInAdded || existingInSelected) {
      console.log('Tracking number already exists');
      setErrorMessage(`ລະຫັດສິນຄ້ານີ້ ${trackingNumber} ມີແລ້ວ`);
      setShowErrorPopup(true);
      return;
    }

    // Status validation: Check if tracking number status differs from current status field
    // TEMPORARY: Force validation for all users to test
    if (existingProductData) {
      const trackingStatus = existingProductData.status;
      
      console.log('Status validation check:', {
        trackingStatus,
        currentStatus: formData.currentStatus,
        userRole,
        existingProductData
      });
      
      // If current status is set, check if it matches tracking number status
      if (formData.currentStatus && trackingStatus && formData.currentStatus !== trackingStatus) {
        const currentStatusLabel = getStatusLabel(formData.currentStatus);
        const trackingStatusLabel = getStatusLabel(trackingStatus);
        console.log('🚨 STATUS MISMATCH DETECTED - BLOCKING ADD:', {
          trackingStatus,
          trackingStatusLabel,
          currentStatus: formData.currentStatus,
          currentStatusLabel,
          userRole
        });
        setErrorMessage(`<span style="color: black;">ສະຖານະຕ້ອງເປັນ:</span> <span style="color: red; font-weight: bold;">${currentStatusLabel}</span>`);
        setShowErrorPopup(true);
        return;
      }
      
      // If statuses match, log success
      if (formData.currentStatus && trackingStatus && formData.currentStatus === trackingStatus) {
        console.log('✅ STATUS MATCH - ALLOWING ADD:', {
          trackingStatus,
          currentStatus: formData.currentStatus,
          userRole
        });
      }
      
      // If no current status is set but we have tracking data, require current status to be set
      if (!formData.currentStatus && trackingStatus) {
        setErrorMessage('ກະລຸນາເລືອກສະຖານະປະຈຸບັນກ່ອນ');
        setShowErrorPopup(true);
        return;
      }
    }

    // Status validation: Check if the status in the table (selectedProducts) matches the current status
    if (selectedProducts.length > 0) {
      // Check if all selected products have the same status
      const firstStatus = selectedProducts[0]?.status;
      if (firstStatus) {
        const allSameStatus = selectedProducts.every(product => product.status === firstStatus);
        
        if (!allSameStatus) {
          setErrorMessage('ສະຖານະຕ່າງກັນ (ບໍ່ສາມາດເພີ່ມໄດ້)');
          setShowErrorPopup(true);
          return;
        }
        
        // Also check if the tracking number status matches the selected products status
        if (existingProductData && existingProductData.status !== firstStatus) {
          const currentStatusLabel = getStatusLabel(firstStatus);
          setErrorMessage(`ສະຖານະຕ້ອງເປັນ: <span style="color: red; font-weight: bold;">${currentStatusLabel}</span>`);
          setShowErrorPopup(true);
          return;
        }
      }
    }

    // Use existing product data if available, otherwise create new product
    const newProduct: Product = existingProductData ? {
      ...existingProductData,
      // Update with form data
      client_name: newProductData.clientName,
      client_phone: newProductData.clientPhone,
      amount: userRole === 'thai_admin' ? existingProductData.amount : parseFloat(newProductData.amount),
      currency: userRole === 'thai_admin' ? existingProductData.currency : newProductData.currency,
      is_paid: userRole === 'thai_admin' ? existingProductData.is_paid : newProductData.isPaid,
      remark: newProductData.remark,
      // Keep original timestamps and creator info
    } : {
      // Create new product if no existing data
      id: crypto.randomUUID(),
      tracking_number: newProductData.trackingNumber,
      client_name: newProductData.clientName,
      client_phone: newProductData.clientPhone,
      amount: userRole === 'thai_admin' ? null : parseFloat(newProductData.amount),
      currency: userRole === 'thai_admin' ? null : newProductData.currency,
      status: 'AT_THAI_BRANCH',
      is_paid: userRole === 'thai_admin' ? false : newProductData.isPaid,
      remark: newProductData.remark,
      created_by: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
      creator: undefined
    };

    setAddedProducts(prev => {
      const updated = [...prev, newProduct];
      return updated;
    });

    // Reset form
    setNewProductData({
      trackingNumber: '',
      clientPhone: '',
      clientName: '',
      amount: '',
      currency: '',
      isPaid: false,
      remark: ''
    });
    setExistingProductData(null);
    setTrackingDataFound(false);
  };

  const handleEditProduct = (productId: string) => {
    // Allow editing of both added products and selected products
    const productToEdit = addedProducts.find(p => p.id === productId) || selectedProducts.find(p => p.id === productId);
    if (productToEdit) {
      setInlineEditingId(productId);
      setInlineEditData({
        client_name: productToEdit.client_name,
        client_phone: productToEdit.client_phone,
        amount: productToEdit.amount,
        currency: productToEdit.currency,
        is_paid: productToEdit.is_paid,
        remark: productToEdit.remark
      });

      // Auto-scroll to the edited row
      setTimeout(() => {
        const editedRow = document.querySelector(`[data-product-id="${productId}"]`);
        if (editedRow) {
          editedRow.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          });
        }
      }, 100);
    }
  };

  const handleSaveInlineEdit = () => {
    if (!inlineEditingId) return;

    // Check if it's an added product or selected product
    const isAddedProduct = addedProducts.some(p => p.id === inlineEditingId);
    
    if (isAddedProduct) {
      // Update the product in addedProducts
      setAddedProducts(prev => prev.map(product =>
        product.id === inlineEditingId
          ? { ...product, ...inlineEditData }
          : product
      ));
    } else {
      // For selected products, save the edits to local state
      setEditedSelectedProducts(prev => ({
        ...prev,
        [inlineEditingId]: inlineEditData
      }));
    }

    // Reset inline editing state
    setInlineEditingId(null);
    setInlineEditData({});
  };

  const handleCancelInlineEdit = () => {
    setInlineEditingId(null);
    setInlineEditData({});
  };

  // Helper function to get display value for selected products (with edits applied)
  const getDisplayValue = (product: Product, field: keyof Product): any => {
    const editedData = editedSelectedProducts[product.id];
    return editedData && editedData[field] !== undefined ? editedData[field] : product[field];
  };

  const handleSaveEdit = () => {
    if (!editingProduct) return;

    // Update the product in addedProducts
    setAddedProducts(prev => prev.map(product =>
      product.id === editingProduct.id
        ? { ...product, ...editFormData }
        : product
    ));

    // Reset editing state
    setEditingProduct(null);
    setEditFormData({});
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setEditFormData({});
  };

  const handleRemoveProduct = (productId: string) => {
    setAddedProducts(prev => prev.filter(product => product.id !== productId));
  };

  const handleRemoveSelectedProduct = (productId: string) => {
    // Use the callback to remove the selected product
    if (onRemoveSelectedProduct) {
      onRemoveSelectedProduct(productId);
    } else {
      // Fallback message if no callback provided
      setErrorMessage('ກະລຸນາຍົກເລືອກສິນຄ້ານີ້ຈາກຕາຕະລາງຫຼັກເພື່ອລຶບອອກ');
      setShowErrorPopup(true);
    }
  };

  const handleResetForm = () => {
    setNewProductData({
      trackingNumber: '',
      clientPhone: '',
      clientName: '',
      amount: '',
      currency: '',
      isPaid: false,
      remark: ''
    });
    setExistingProductData(null);
    setTrackingDataFound(false);
    setEditingProduct(null);
    setEditFormData({});
    setInlineEditingId(null);
    setInlineEditData({});
  };

  const handleUpdate = async () => {
    if (!isFormValid()) {
      if (selectedProducts.length === 0 && addedProducts.length === 0) {
        setErrorMessage('ກະລຸນາເລືອກສະຖານະປະຈຸບັນ ແລະ ສະຖານະໃໝ່ ຫຼື ເພີ່ມສິນຄ້າ');
      } else if (formData.currentStatus === 'MIXED_STATUS') {
        setErrorMessage('ບໍ່ສາມາດອັບເດດສະຖານະໄດ້ ເນື່ອງຈາກສິນຄ້າທີ່ເລືອກມີສະຖານະຕ່າງກັນ ກະລຸນາເລືອກສິນຄ້າທີ່ມີສະຖານະດຽວກັນ');
      } else {
        setErrorMessage('ກະລຸນາເລືອກສະຖານະໃໝ່ ຫຼື ເພີ່ມສິນຄ້າ');
      }
      setShowErrorPopup(true);
      return;
    }

    // Check for rollback restriction for Lao Admin
    if (userRole === 'lao_admin' && formData.currentStatus && formData.newStatus) {
      if (isRollback(formData.currentStatus, formData.newStatus)) {
        setErrorMessage('ແອັດມິນສາຂາລາວບໍ່ສາມາດກັບຄືນສະຖານະໄດ້');
        setShowErrorPopup(true);
        return;
      }
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
        if (selectedProducts.length === 0 && addedProducts.length === 0) {
          // When no products selected and no new products added, show error
          setErrorMessage('ກະລຸນາເລືອກສິນຄ້າຈາກຕາຕະລາງ ຫຼື ເພີ່ມສິນຄ້າໃໝ່');
          setShowErrorPopup(true);
          setIsUpdating(false);
          return;
        }

      // Prepare the bulk update data based on user role
      // Combine selected products and added products, applying edits to selected products
      const allProducts = [
        ...selectedProducts.map(product => ({
          ...product,
          ...editedSelectedProducts[product.id]
        })),
        ...addedProducts
      ];
      
      const updateData = {
        orders: allProducts.map(product => {
          const orderUpdate: any = {
            id: product.id,
            tracking_number: product.tracking_number,
            client_name: product.client_name,
            status: formData.newStatus
          };

          // Only include client_phone if it's not empty
          if (product.client_phone && product.client_phone.trim() !== '') {
            orderUpdate.client_phone = product.client_phone.trim();
          }

          // Include remark field for all roles
          if (product.remark !== null && product.remark !== undefined) {
            orderUpdate.remark = product.remark;
          }

          // Only include amount, currency, and is_paid for non-thai_admin roles
          if (userRole !== 'thai_admin') {
            // Only include amount if it has a valid numeric value
            if (product.amount !== null && product.amount !== undefined && !isNaN(Number(product.amount))) {
              orderUpdate.amount = Number(product.amount);
            }
            // Always include currency and is_paid
            orderUpdate.currency = product.currency || 'LAK';
            orderUpdate.is_paid = product.is_paid;
          }

          return orderUpdate;
        })
      };

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

      if (response.ok) {
        const result = await response.json();

        if (result.success) {
          setShowSuccessPopup(true);

          // Reset status fields lock after successful update
          setStatusFieldsLocked(false);

          // Call success callback and close dialog
            if (onUpdateSuccess) {
              onUpdateSuccess();
            }
          
          // Close dialog after successful update
          onOpenChange(false);
        } else {
          setErrorMessage(result.message || 'ບໍ່ສາມາດອັບເດດສະຖານະໄດ້');
          setShowErrorPopup(true);
        }
      } else {
        // HTTP error - use helper function to handle specific status codes
        const errorMsg = await handleApiError(response);
        setErrorMessage(errorMsg);
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
    // Cancel directly without showing popup
    confirmCancel();
  };

  const confirmCancel = () => {
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
      currency: '',
      isPaid: false,
      remark: ''
    });
    setAddedProducts([]);
    setExistingProductData(null);
    setTrackingDataFound(false);
    setEditingProduct(null);
    setEditFormData({});
    setInlineEditingId(null);
    setInlineEditData({});
    if (onClose) {
      onClose();
    }
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(open) => {
        if (!open) {
          if (onClose) {
            onClose();
          }
        }
        onOpenChange(open);
      }}>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Current Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ສະຖານະປະຈຸບັນ <span className="text-red-500">*</span>
                  </label>
                  <select
                    className={`w-full p-3 border border-gray-300 rounded-md ${statusFieldsLocked || selectedProducts.length > 0 || trackingDataFound
                        ? 'bg-gray-100 text-gray-700'
                        : 'bg-white text-gray-700'
                    }`}
                    value={formData.currentStatus}
                    disabled={statusFieldsLocked || selectedProducts.length > 0 || trackingDataFound}
                    onChange={(e) => setFormData(prev => ({ ...prev, currentStatus: e.target.value }))}
                  >
                    {!trackingDataFound && selectedProducts.length === 0 && (
                    <option value="">
                        ກະລຸນາເລືອກສະຖານະທີ່ຕ້ອງການອັບເດດ
                    </option>
                    )}
                    {selectedProducts.length === 0 && (
                      trackingDataFound && formData.currentStatus ? (
                        <option value={formData.currentStatus}>
                          {getStatusLabel(formData.currentStatus)}
                        </option>
                      ) : (
                        getStatusOptionsForRole(userRole || '').map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                        ))
                      )
                    )}
                    {selectedProducts.length > 0 && formData.currentStatus && (
                      <option value={formData.currentStatus}>
                        {formData.currentStatus === 'MIXED_STATUS'
                          ? 'ສະຖານະຕ່າງກັນ (ບໍ່ສາມາດອັບເດດໄດ້)'
                          : getStatusLabel(formData.currentStatus)
                        }
                      </option>
                    )}
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
                    {getStatusOptionsForRole(userRole || '').map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

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
                      <div className="flex gap-2">
                        <input
                          type="text"
                          className="flex-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black placeholder-[#818A91]"
                          value={newProductData.trackingNumber}
                          onChange={(e) => handleNewProductChange('trackingNumber', e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              console.log('Enter key pressed - checking tracking number:', newProductData.trackingNumber);
                              handleCheckTrackingNumber();
                            }
                          }}
                          placeholder="ລະຫັດສິນຄ້າ"
                        />
                        <button
                          type="button"
                          onClick={handleCheckTrackingNumber}
                          disabled={isCheckingTracking}
                          className="px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 whitespace-nowrap disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          {isCheckingTracking ? 'ກຳລັງກວດສອບ...' : 'ກວດສອບ'}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        💡 ກົດ Enter ເພື່ອກວດສອບລະຫັດສິນຄ້າ
                      </p>
                    </div>

                    {/* ເບີໂທລູກຄ້າ */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ເບີໂທລູກຄ້າ
                      </label>
                      <input
                        type="tel"
                        className={`w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black placeholder-[#818A91] ${!trackingDataFound ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                        value={newProductData.clientPhone}
                        onChange={(e) => handleNewProductChange('clientPhone', e.target.value)}
                        placeholder="ເບີໂທລູກຄ້າ"
                        disabled={!trackingDataFound}
                      />
                    </div>

                    {/* ຊື່ລູກຄ້າ */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ຊື່ລູກຄ້າ <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className={`w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black placeholder-[#818A91] ${!trackingDataFound ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                        value={newProductData.clientName}
                        onChange={(e) => handleNewProductChange('clientName', e.target.value)}
                        placeholder="ຊື່ລູກຄ້າ"
                        disabled={!trackingDataFound}
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
                          className={`w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black placeholder-[#818A91] ${!trackingDataFound ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                          value={newProductData.amount}
                          onChange={(e) => handleNewProductChange('amount', e.target.value)}
                          placeholder="ລາຄາ"
                          disabled={!trackingDataFound}
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
                          className={`w-full p-3 border border-gray-300 rounded-md text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${!trackingDataFound ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                          value={newProductData.currency}
                          onChange={(e) => handleNewProductChange('currency', e.target.value)}
                          disabled={!trackingDataFound}
                        >
                          <option value="">ເລືອກສະກຸນເງິນ</option>
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
                          className={`w-full p-3 border border-gray-300 rounded-md text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${!trackingDataFound ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                          value={newProductData.isPaid.toString()}
                          onChange={(e) => handleNewProductChange('isPaid', e.target.value === 'true')}
                          disabled={!trackingDataFound}
                        >
                          {PAYMENT_OPTIONS.map(option => (
                            <option key={option.value.toString()} value={option.value.toString()}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* ໝາຍເຫດ - Remark field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ໝາຍເຫດ
                      </label>
                      <textarea
                        className={`w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black placeholder-[#818A91] resize-none ${!trackingDataFound ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                        value={newProductData.remark}
                        onChange={(e) => handleNewProductChange('remark', e.target.value)}
                        placeholder="ໝາຍເຫດ"
                        disabled={!trackingDataFound}
                        rows={3}
                      />
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

                {/* Column 2: Added Products Table */}
                <div className="bg-white rounded-lg border border-gray-200 min-h-[400px] flex flex-col">
                  <div className={`flex-1 overflow-y-auto overflow-x-auto max-w-full ${inlineEditingId ? 'max-w-[800px]' : ''}`}>
                    <table className="w-full min-w-[900px]">
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
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">ສະກຸນເງິນ</th>
                        )}
                        {(userRole === 'super_admin' || userRole === 'lao_admin') && (
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">ການຊຳລະ</th>
                        )}
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">ໝາຍເຫດ</th>
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
                              <tr key={`added-${product.id}`} className="hover:bg-gray-50" data-product-id={product.id}>
                                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{index + 1}</td>
                                
                                {/* Client Name - Editable */}
                                <td className="px-3 py-3 text-sm whitespace-nowrap overflow-x-auto max-w-[200px]">
                                  {inlineEditingId === product.id ? (
                                    <input
                                      type="text"
                                      className="w-full p-1 border border-gray-300 rounded text-sm placeholder-[#818A91]"
                                      value={inlineEditData.client_name || product.client_name || ''}
                                      onChange={(e) => setInlineEditData(prev => ({ ...prev, client_name: e.target.value }))}
                                    />
                                  ) : (
                                    <span className="text-gray-900">{product.client_name}</span>
                                  )}
                                </td>
                                
                                {/* Tracking Number - Read-only */}
                                <td className="px-3 py-3 text-sm whitespace-nowrap overflow-x-auto max-w-[200px]">
                                  <CopyText text={product.tracking_number} className="text-blue-600 font-medium">
                                    {product.tracking_number.length > 8 
                                      ? `${product.tracking_number.substring(0, 8)}...` 
                                      : product.tracking_number}
                                  </CopyText>
                                </td>
                                
                                {/* Client Phone - Editable */}
                                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap overflow-x-auto max-w-[120px]">
                                  {inlineEditingId === product.id ? (
                                    <input
                                      type="tel"
                                      className="w-full p-1 border border-gray-300 rounded text-sm placeholder-[#818A91]"
                                      value={inlineEditData.client_phone || product.client_phone || ''}
                                      onChange={(e) => setInlineEditData(prev => ({ ...prev, client_phone: e.target.value }))}
                                    />
                                  ) : (
                                    <span>{product.client_phone || '-'}</span>
                                  )}
                                </td>
                                
                                {/* Amount - Editable for super_admin and lao_admin */}
                                {(userRole === 'super_admin' || userRole === 'lao_admin') && (
                                  <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">
                                    {inlineEditingId === product.id ? (
                                      <input
                                        type="number"
                                        step="0.01"
                                        className="w-full p-1 border border-gray-300 rounded text-sm placeholder-[#818A91]"
                                        value={inlineEditData.amount || product.amount || ''}
                                        onChange={(e) => setInlineEditData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                                      />
                                    ) : (
                                      <span>{getDisplayValue(product, 'amount') ? getDisplayValue(product, 'amount')?.toLocaleString() : '-'}</span>
                                    )}
                                  </td>
                                )}
                                
                                
                                {/* Currency - Editable for super_admin and lao_admin */}
                                {(userRole === 'super_admin' || userRole === 'lao_admin') && (
                                  <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">
                                    {inlineEditingId === product.id ? (
                                      <select
                                        className="w-full p-1 border border-gray-300 rounded text-sm"
                                        value={inlineEditData.currency || product.currency || 'LAK'}
                                        onChange={(e) => setInlineEditData(prev => ({ ...prev, currency: e.target.value }))}
                                      >
                                        <option value="LAK">ກີບ</option>
                                        <option value="THB">ບາດ</option>
                                      </select>
                                    ) : (
                                      <span>
                                        {getDisplayValue(product, 'currency') === 'LAK'
                                          ? 'ກີບ'
                                          : getDisplayValue(product, 'currency') === 'THB'
                                            ? 'ບາດ'
                                            : getDisplayValue(product, 'currency')}
                                      </span>
                                    )}
                                  </td>
                                )}

                                {/* Payment Status - Only for super_admin and lao_admin */}
                                {(userRole === 'super_admin' || userRole === 'lao_admin') && (
                                  <td className="px-3 py-3 text-sm whitespace-nowrap">
                                    {inlineEditingId === product.id ? (
                                      <select
                                        className="w-full p-1 border border-gray-300 rounded text-sm"
                                        value={inlineEditData.is_paid ? 'true' : 'false'}
                                        onChange={(e) => setInlineEditData(prev => ({ ...prev, is_paid: e.target.value === 'true' }))}
                                      >
                                        <option value="false">ຍັງບໍ່ຊຳລະ</option>
                                        <option value="true">ຊຳລະແລ້ວ</option>
                                      </select>
                                    ) : (
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${getDisplayValue(product, 'is_paid') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}
                                    >
                                        {getDisplayValue(product, 'is_paid') ? 'ຊຳລະແລ້ວ' : 'ຍັງບໍ່ຊຳລະ'}
                                    </span>
                                    )}
                                  </td>
                                )}
                                
                                {/* Remark */}
                                  <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">
                                  {inlineEditingId === product.id ? (
                                    <textarea
                                      className="w-full p-1 border border-gray-300 rounded text-sm placeholder-[#818A91] resize-none"
                                      value={inlineEditData.remark || product.remark || ''}
                                      onChange={(e) => setInlineEditData(prev => ({ ...prev, remark: e.target.value }))}
                                      placeholder="ໝາຍເຫດ"
                                      rows={2}
                                    />
                                  ) : (
                                    <CopyText text={getDisplayValue(product, 'remark') || ''} className="max-w-[150px] truncate block">
                                      {getDisplayValue(product, 'remark') || '-'}
                                    </CopyText>
                                  )}
                                </td>
                                
                                {/* Actions */}
                                <td className="px-3 py-3 text-sm flex items-center space-x-3 whitespace-nowrap">
                                  {inlineEditingId === product.id ? (
                                    <>
                                      {/* Save button */}
                                      <button
                                        onClick={handleSaveInlineEdit}
                                        className="text-green-600 hover:text-green-800"
                                        title="ບັນທຶກ"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                      </button>
                                      {/* Cancel button */}
                                      <button
                                        onClick={handleCancelInlineEdit}
                                        className="text-gray-600 hover:text-gray-800"
                                        title="ຍົກເລີກ"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                  {/* Edit button */}
                                  <button
                                        onClick={() => handleEditProduct(product.id)}
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
                                    </>
                                  )}
                                </td>
                              </tr>
                            ))}

                            {/* Selected products */}
                            {selectedProducts.map((product, index) => (
                              <tr key={`selected-${product.id}`} className="hover:bg-gray-50" data-product-id={product.id}>
                                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{addedProducts.length + index + 1}</td>
                                
                                {/* Client Name - Editable */}
                                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap overflow-x-auto max-w-[150px]">
                                  {inlineEditingId === product.id ? (
                                    <input
                                      type="text"
                                      className="w-full p-1 border border-gray-300 rounded text-sm placeholder-[#818A91]"
                                      value={inlineEditData.client_name || product.client_name || ''}
                                      onChange={(e) => setInlineEditData(prev => ({ ...prev, client_name: e.target.value }))}
                                      placeholder="ຊື່ລູກຄ້າ"
                                    />
                                  ) : (
                                    <span>{getDisplayValue(product, 'client_name')}</span>
                                  )}
                                </td>
                                
                                {/* Tracking Number - Editable */}
                                <td className="px-3 py-3 text-sm whitespace-nowrap overflow-x-auto max-w-[200px]">
                                  {inlineEditingId === product.id ? (
                                    <input
                                      type="text"
                                      className="w-full p-1 border border-gray-300 rounded text-sm placeholder-[#818A91]"
                                      value={inlineEditData.tracking_number || product.tracking_number || ''}
                                      onChange={(e) => setInlineEditData(prev => ({ ...prev, tracking_number: e.target.value }))}
                                      placeholder="ລະຫັດສິນຄ້າ"
                                    />
                                  ) : (
                                    <CopyText text={product.tracking_number} className="text-blue-600 font-medium">
                                      {product.tracking_number.length > 8 
                                        ? `${product.tracking_number.substring(0, 8)}...` 
                                        : product.tracking_number}
                                    </CopyText>
                                  )}
                                </td>
                                
                                {/* Client Phone - Editable */}
                                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap overflow-x-auto max-w-[120px]">
                                  {inlineEditingId === product.id ? (
                                    <input
                                      type="tel"
                                      className="w-full p-1 border border-gray-300 rounded text-sm placeholder-[#818A91]"
                                      value={inlineEditData.client_phone || product.client_phone || ''}
                                      onChange={(e) => setInlineEditData(prev => ({ ...prev, client_phone: e.target.value }))}
                                      placeholder="ເບີໂທ"
                                    />
                                  ) : (
                                    <span>{getDisplayValue(product, 'client_phone') || '-'}</span>
                                  )}
                                </td>
                                
                                {/* Amount - Editable for super_admin and lao_admin */}
                                {(userRole === 'super_admin' || userRole === 'lao_admin') && (
                                  <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">
                                    {inlineEditingId === product.id ? (
                                      <input
                                        type="number"
                                        step="0.01"
                                        className="w-full p-1 border border-gray-300 rounded text-sm placeholder-[#818A91]"
                                        value={inlineEditData.amount || product.amount || ''}
                                        onChange={(e) => setInlineEditData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                                      />
                                    ) : (
                                      <span>{getDisplayValue(product, 'amount') ? getDisplayValue(product, 'amount')?.toLocaleString() : '-'}</span>
                                    )}
                                  </td>
                                )}
                                
                                
                                {/* Currency - Editable for super_admin and lao_admin */}
                                {(userRole === 'super_admin' || userRole === 'lao_admin') && (
                                  <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">
                                    {inlineEditingId === product.id ? (
                                      <select
                                        className="w-full p-1 border border-gray-300 rounded text-sm"
                                        value={inlineEditData.currency || product.currency || 'LAK'}
                                        onChange={(e) => setInlineEditData(prev => ({ ...prev, currency: e.target.value }))}
                                      >
                                        <option value="LAK">ກີບ</option>
                                        <option value="THB">ບາດ</option>
                                      </select>
                                    ) : (
                                      <span>
                                        {getDisplayValue(product, 'currency') === 'LAK'
                                          ? 'ກີບ'
                                          : getDisplayValue(product, 'currency') === 'THB'
                                            ? 'ບາດ'
                                            : getDisplayValue(product, 'currency')}
                                      </span>
                                    )}
                                  </td>
                                )}

                                {/* Payment Status - Only for super_admin and lao_admin */}
                                {(userRole === 'super_admin' || userRole === 'lao_admin') && (
                                  <td className="px-3 py-3 text-sm whitespace-nowrap">
                                    {inlineEditingId === product.id ? (
                                      <select
                                        className="w-full p-1 border border-gray-300 rounded text-sm"
                                        value={inlineEditData.is_paid ? 'true' : 'false'}
                                        onChange={(e) => setInlineEditData(prev => ({ ...prev, is_paid: e.target.value === 'true' }))}
                                      >
                                        <option value="false">ຍັງບໍ່ຊຳລະ</option>
                                        <option value="true">ຊຳລະແລ້ວ</option>
                                      </select>
                                    ) : (
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${getDisplayValue(product, 'is_paid') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}
                                    >
                                        {getDisplayValue(product, 'is_paid') ? 'ຊຳລະແລ້ວ' : 'ຍັງບໍ່ຊຳລະ'}
                                    </span>
                                    )}
                                  </td>
                                )}
                                
                                {/* Remark - Editable */}
                                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">
                                  {inlineEditingId === product.id ? (
                                    <textarea
                                      className="w-full p-1 border border-gray-300 rounded text-sm placeholder-[#818A91] resize-none"
                                      value={inlineEditData.remark || product.remark || ''}
                                      onChange={(e) => setInlineEditData(prev => ({ ...prev, remark: e.target.value }))}
                                      placeholder="ໝາຍເຫດ"
                                      rows={2}
                                    />
                                  ) : (
                                    <CopyText text={getDisplayValue(product, 'remark') || ''} className="max-w-[150px] truncate block">
                                      {getDisplayValue(product, 'remark') || '-'}
                                    </CopyText>
                                  )}
                              </td>
                                {/* Actions */}
                                <td className="px-3 py-3 text-sm flex items-center space-x-3 whitespace-nowrap">
                                  {inlineEditingId === product.id ? (
                                    <>
                                      {/* Save button */}
                                <button 
                                        onClick={handleSaveInlineEdit}
                                        className="text-green-600 hover:text-green-800"
                                        title="ບັນທຶກ"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                          />
                                  </svg>
                                </button>
                                      {/* Cancel button */}
                                      <button
                                        onClick={handleCancelInlineEdit}
                                        className="text-red-600 hover:text-red-800"
                                        title="ຍົກເລີກ"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                          />
                                </svg>
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      {/* Edit button */}
                                      <button
                                        onClick={() => handleEditProduct(product.id)}
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
                                        onClick={() => handleRemoveSelectedProduct(product.id)}
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
                                    </>
                                  )}
                          </td>
                        </tr>
                            ))}
                          </>
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
                onClick={handleUpdate}
                 disabled={!isFormValid() || isUpdating}
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

      {/* Tracking Not Found Popup */}
      <AlertPopup
        open={showTrackingNotFoundPopup}
        onOpenChange={setShowTrackingNotFoundPopup}
        title="ບໍ່ພົບຂໍ້ມູນ"
        message={`ບໍ່ມີ '${newProductData.trackingNumber}' ນີ້ໃນບະບົບ`}
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

      {/* Toast notifications */}
      <Toaster />

    </>
  );
};

export default UpdateStatusProductDialog;
