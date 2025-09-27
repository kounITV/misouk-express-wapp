"use client";

import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Plus, Search, Edit3, X } from "lucide-react";
import Image from "next/image";
import { AuthService } from "@/lib/auth-service";
import { useAuth } from "@/lib/hooks/use-auth";
import EnhancedActionsDropdown from "@/components/ui/enhanced-actions-dropdown";
import EditProductDialog from "@/components/product/EditProductDialog";
import RoleBasedEditDialog from "@/components/product/RoleBasedEditDialog";
import UpdateStatusProductDialog from "@/components/product/UpdateStatusProductDialog";
import { LogoutButton } from "@/components/ui/logout-button";
import { Pagination } from "@/components/ui/pagination";
import { SidebarMenu } from "@/components/ui/sidebar-menu";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import { SuccessPopup } from "@/components/ui/success-popup";
import ReceiptPopup from "@/components/ui/receipt-popup";
import { apiEndpoints } from "@/lib/config";
import { getRolePermissions, normalizeRole } from "@/lib/utils/role-permissions";
import { createOrder, CreateOrderData } from "@/lib/api/orders";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { useDirectPrint } from "@/components/ui/direct-print";
import { FloatingPrintButton } from "@/components/ui/floating-print-button";
import { usePrintSelectedProducts } from "@/components/ui/print-selected-products";

// Simple Copy Component for tracking number (no tooltip)
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
      await navigator.clipboard.writeText(text);

      // Show toast notification
      toast({
        title: "ຄັດລອກສຳເລັດ!",
        description: `ລະຫັດ: ${text}`,
        duration: 2000,
      });
    } catch (err) {
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

// Copy Tooltip Component for remark (with tooltip)
interface CopyTooltipProps {
  text: string;
  children: React.ReactNode;
  className?: string;
}

const CopyTooltip: React.FC<CopyTooltipProps> = ({ text, children, className = "" }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tooltipTimeout, setTooltipTimeout] = useState<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (tooltipTimeout) {
        clearTimeout(tooltipTimeout);
      }
    };
  }, [tooltipTimeout]);

  const handleMouseEnter = () => {
    // Clear any existing timeout
    if (tooltipTimeout) {
      clearTimeout(tooltipTimeout);
    }

    // Set a 3-second delay before showing tooltip
    const timeout = setTimeout(() => {
      setShowTooltip(true);
    }, 3000);

    setTooltipTimeout(timeout);
  };

  const handleMouseLeave = () => {
    // Clear the timeout if mouse leaves before 3 seconds
    if (tooltipTimeout) {
      clearTimeout(tooltipTimeout);
      setTooltipTimeout(null);
    }
    setShowTooltip(false);
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-black text-sm rounded-lg shadow-lg z-50 whitespace-nowrap">
          <div className="flex items-center gap-2">
            <span>{copied ? 'ຄັດລອກແລ້ວ!' : 'ຄັດລອກ'}</span>
            <button
              onClick={handleCopy}
              className="text-black hover:text-gray-300 transition-colors"
              title="ຄັດລອກ"
            >
              {copied ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          </div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
        </div>
      )}
    </div>
  );
};

// Helper function to get user-friendly error messages
const getUserFriendlyErrorMessage = (error: any): string => {
  // Handle API response errors
  if (error && typeof error === 'object') {
    // Handle specific API error messages
    if (error.message) {
      // Status restriction error for Thai Admin
      if (error.message.includes('ສະຖານະທີ່ອະນຸຍາດມີແຕ່ EXIT_THAI_BRANCH ເທົ່ານັ້ນ')) {
        return 'ກະລຸນາເລືອກສະຖານະ';
      }

      // Amount validation error
      if (error.message.includes('Validation failed') || error.message.includes('ລາຄາຕ້ອງບໍ່ຕິດລົບ')) {
        return 'ກະລຸນາຕື່ມຂໍ້ມູນໃຫ້ຖືກຕ້ອງ';
      }

      // Permission denied errors
      if (error.message.includes('ບໍ່ສາມາດແກ້ໄຂຈຳນວນເງິນ, ສະກຸນເງິນ ຫຼື ສະຖານະການຈ່າຍເງິນ')) {
        return 'ກະລຸນາເລືອກສະຖານະ';
      }

      // Access denied error
      if (error.message.includes('ບໍ່ມີສິດໃນການເຂົ້າເຖິງ')) {
        return 'ເກີດຂໍ້ຜິດພາດບໍ່ສາມາດສ້າງລາຍການໄດ້';
      }

      // Cannot edit items that have already left Thai branch
      if (error.message.includes('ບໍ່ສາມາດແກ້ໄຂລາຍການທີ່ອອກຈາກສາຂາໄທແລ້ວ')) {
        return 'ກະລຸນາເລືອກສາຖານະເພື່ອອັບເດດ';
      }


      return error.message;
    }

    // Handle error arrays
    if (error.error && Array.isArray(error.error) && error.error.length > 0) {
      // Extract all validation error messages
      const errorMessages = error.error.map((err: any) => {
        if (err.message) {
          return err.message;
        }
        return `${err.field}: ${err.type}`;
      });
      
      // Return all error messages joined with newlines
      return errorMessages.join('\n');
    }
  }

  // Handle string errors
  if (typeof error === 'string') {
    if (error.includes('API Error: 403')) {
      return 'ກະລຸນາເລືອກສະຖານະ';
    }
    if (error.includes('Validation failed')) {
      return 'ກະລຸນາຕື່ມຂໍ້ມູນໃຫ້ຖືກຕ້ອງ';
    }
    return error;
  }

  return 'ເກີດຂໍ້ຜິດພາດ ກະລຸນາລອງໃໝ່ອີກຄັ້ງ';
};

// Import optimized modules
import { PRODUCT_TEXT, LABELS, PLACEHOLDERS, BUTTONS, MESSAGES, SEARCH } from "@/lib/constants/text";
import { Product, ApiProduct, FormData, PaginationData } from "@/types/product";
import {
  formatDate,
  formatAmount,
  formatCurrency,
  getStatusName,
  getStatusColor,
  normalizeProduct,
  validateForm,
  resetForm,
  DEFAULT_ITEMS_PER_PAGE,
  STATUS_CONFIG,
  convertStatusToAPI,
  convertStatusFromAPI
} from "@/lib/utils/product";
import ProductDialog from "@/components/product/ProductDialog";

interface PagedResponse<T> {
  result?: T[];
  meta?: {
    currentPage?: number;
    nextPage?: number | null;
    isLastPage?: boolean;
    pageCount?: number | null;
  };
  success?: boolean;
  data?: T[];
  pagination?: PaginationData;
}

const getServiceTypeName = (serviceType: string): string => {
  switch (serviceType) {
    case 'send_money': return 'ສົ່ງເງິນໂດຍໃຊ້';
    case 'send_package': return 'ສົ່ງຂອງທົ່ວໄປ';
    case 'send_document': return 'ສົ່ງເອກະສານສຳຄັນ';
    case 'other': return 'ອື່ນໆ';
    default: return serviceType || '';
  }
};

const getRoleName = (role: any): string => {
  const roleName = typeof role === 'string' ? role : (role?.name || role?.id || '');

  switch (roleName) {
    case 'super_admin': return 'ຊູບເປີແອັດມິນ';
    case 'thai_admin': return 'ແອັດມິນສາຂາໄທ';
    case 'lao_admin': return 'ແອັດມິນສາຂາລາວ';
    default: return String(roleName || '');
  }
};

// Helper functions for data formatting
const DATE_FORMAT_OPTIONS = {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit'
};


export default function ProductManagementPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [openCreate, setOpenCreate] = useState<boolean>(false);
  const [creating, setCreating] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [loadingEditId, setLoadingEditId] = useState<string | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState<boolean>(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [openRoleBasedCreate, setOpenRoleBasedCreate] = useState<boolean>(false);
  const [openRoleBasedEdit, setOpenRoleBasedEdit] = useState<boolean>(false);
  const [openUpdateStatus, setOpenUpdateStatus] = useState<boolean>(false);
  const [showMixedStatusPopup, setShowMixedStatusPopup] = useState<boolean>(false);
  const [showErrorPopup, setShowErrorPopup] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showCopySuccess, setShowCopySuccess] = useState<boolean>(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState<boolean>(false);
  const [showCreateSuccess, setShowCreateSuccess] = useState<boolean>(false);
  const [showReceiptPopup, setShowReceiptPopup] = useState<boolean>(false);
  const [productForReceipt, setProductForReceipt] = useState<Product | null>(null);

  // Use the direct print hook
  const { printProductReceipt } = useDirectPrint();
  
  // Use the print selected products hook
  const { printSelectedProducts } = usePrintSelectedProducts();

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

  const [itemsPerPage, setItemsPerPage] = useState<number>(DEFAULT_ITEMS_PER_PAGE);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    current_page: 1,
    total_pages: 1,
    per_page: DEFAULT_ITEMS_PER_PAGE,
    next_page: null,
    prev_page: null,
  });
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  const { user: currentUser, isMounted } = useAuth();

  // Get user role and permissions
  const userRole = normalizeRole(currentUser?.role ? (typeof currentUser.role === 'string' ? currentUser.role : currentUser.role.name) : undefined);
  
  const [form, setForm] = useState<FormData>(resetForm(userRole));
  const permissions = getRolePermissions(userRole);

  // Debug logging for thai_admin
  useEffect(() => {
    console.log('=== Role Debug Info ===');
    console.log('Current User:', currentUser);
    console.log('User Role (raw):', currentUser?.role);
    console.log('User Role (normalized):', userRole);
    console.log('Permissions:', permissions);
    console.log('Is Mounted:', isMounted);
  }, [currentUser, userRole, permissions, isMounted]);

  const isFormValid = useMemo(() => {
    const baseValidation = Boolean(
      form.status &&
      form.productCode.trim() &&
      form.senderName.trim()
    );

    // Amount and currency are now optional for all roles
    return baseValidation;
  }, [form, userRole]);

  const fetchProducts = async (page: number = 1, limit: number = 50) => {
    setLoading(true);
    try {
      const token = AuthService.getStoredToken();
      if (!token) throw new Error("No token");

      let url = `${apiEndpoints.orders}?page=${page}&limit=${limit}`;

      // Add search and filter parameters
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }
      if (statusFilter) {
        // Convert UI status to API status before sending to server
        const apiStatus = convertStatusToAPI(statusFilter);
        url += `&status=${encodeURIComponent(apiStatus)}`;
      }

      console.log('=== Fetch Products Debug ===');
      console.log('Fetching orders from:', url);
      console.log('Token available:', !!token);
      console.log('User role:', userRole);
      console.log('Current user:', currentUser);

      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
        mode: 'cors',
        credentials: 'omit',
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('=== API REQUEST FAILED ===');
        console.error('Status:', res.status);
        console.error('Status Text:', res.statusText);
        console.error('Response Headers:', Object.fromEntries(res.headers.entries()));
        console.error('Response Body:', errorText);
        console.error('Request URL:', url);
        console.error('=== END API REQUEST FAILED ===');
        throw new Error(`API request failed: ${res.status} - ${res.statusText}`);
      }

      const responseText = await res.text();

      if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
        console.error('Received HTML instead of JSON');
        throw new Error('Server returned HTML instead of JSON');
      }

      const data: PagedResponse<ApiProduct> = JSON.parse(responseText);

      const incoming = (data.data ?? data.result ?? []) as ApiProduct[];
      const normalized: Product[] = incoming.map(normalizeProduct);

      setProducts(normalized);

      if (data.pagination) {
        setPagination(data.pagination);
      }
    } catch (err) {

      // Show user-friendly error message
      setErrorMessage(`ບໍ່ສາມາດໂຫຼດຂໍ້ມູນ: ${err instanceof Error ? err.message : 'ເກີດຂໍ້ຜິດພາດທີ່ບໍ່ຮູ້ສາເຫດ'}`);
      setShowErrorPopup(true);

      // Mock data for development - using orders structure
      const mockProducts: Product[] = Array.from({ length: 3 }, (_, i) => {
        const baseDate = new Date('2025-08-18T15:20:33.486Z');
        const createdDate = new Date(baseDate.getTime() + (i * 60000)); // Add i minutes
        const updatedDate = new Date(createdDate.getTime() + (i * 30000)); // Add i*30 seconds

        return {
          id: `a9906737-85ee-47fe-aeb0-b4805fe3ce7${i}`,
          tracking_number: i === 0 ? "545" : i === 1 ? "5423543" : "123",
          client_name: "koun",
          client_phone: "43243255555",
          amount: i === 2 ? null : 100,
          currency: i === 2 ? null : "LAK",
          status: "AT_THAI_BRANCH",
          is_paid: false,
          remark: `Mock remark ${i + 1}`,
          created_by: "d6a58ee7-94b6-4324-bb06-36785318d871",
          created_at: createdDate.toISOString(),
          updated_at: updatedDate.toISOString(),
          deleted_at: null,
          creator: {
            id: "d6a58ee7-94b6-4324-bb06-36785318d871",
            username: "admin",
            firstname: "admin",
            lastname: "admin",
            gender: "male",
            phone: "12345678",
            role_id: "a14e09ef-bd24-4e02-b3cc-d92aa4224177",
            role: {
              id: "a14e09ef-bd24-4e02-b3cc-d92aa4224177",
              name: "super_admin",
              description: "Super Administrator with full access to all resources"
            },
            created_at: "2025-07-14T13:39:43.371Z",
            updated_at: "2025-07-14T13:39:43.371Z",
            deleted_at: null
          }
        };
      });
      setProducts(mockProducts);
      setPagination({
        total: 5000,
        current_page: 1,
        total_pages: 100,
        per_page: DEFAULT_ITEMS_PER_PAGE,
        next_page: 2,
        prev_page: null,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!isFormValid) return;
    setCreating(true);
    try {
      // Prepare order data based on user role
      let orderData: CreateOrderData;

      if (userRole === 'thai_admin') {
        // Thai Admin: Only send required fields
        orderData = {
          tracking_number: form.productCode,
          client_name: form.senderName,
          client_phone: form.senderPhone,
          status: form.status || 'EXIT_THAI_BRANCH'
        };
      } else {
        // Other admins: Send all fields
        orderData = {
          tracking_number: form.productCode,
          client_name: form.senderName,
          client_phone: form.senderPhone,
          status: form.status || 'AT_THAI_BRANCH',
          is_paid: false,
          amount: form.amount ? parseFloat(form.amount) : 0,
          currency: form.currency || null
        };
      }

      // Create order using the API (use orders array format for thai_admin)
      const result = await createOrder(orderData, userRole === 'thai_admin');

      if (result.success) {
        console.log('Order created successfully:', result.data);

        // Create a new product object for immediate display
        const newProduct: Product = {
          id: result.data?.id || crypto.randomUUID(),
          tracking_number: form.productCode,
          client_name: form.senderName,
          client_phone: form.senderPhone,
          amount: userRole === 'thai_admin' ? null : (form.amount ? parseFloat(form.amount) : null),
          currency: userRole === 'thai_admin' ? null : (form.currency || null),
          status: form.status || 'AT_THAI_BRANCH',
          is_paid: false,
          remark: form.remark || null,
          created_by: currentUser?.id || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null,
          creator: currentUser ? {
            id: currentUser.id || '',
            username: currentUser.username || '',
            firstname: currentUser.firstname || '',
            lastname: currentUser.lastname || '',
            gender: currentUser.gender || 'male',
            phone: currentUser.phone || '',
            role_id: currentUser.role_id || '',
            role: {
              id: currentUser.role?.id || '',
              name: currentUser.role?.name || 'super_admin',
              description: currentUser.role?.description || ''
            },
            created_at: currentUser.created_at || new Date().toISOString(),
            updated_at: currentUser.updated_at || new Date().toISOString(),
            deleted_at: currentUser.deleted_at || null
          } : undefined
        };

        // Immediately add the new product to the local state
        setProducts(prevProducts => [newProduct, ...prevProducts]);

        // Reset form and close dialog
        setOpenCreate(false);
        setEditingProduct(null);
        setForm(resetForm(userRole));

        // Refresh the products list from server in background
        await fetchProducts(pagination.current_page, itemsPerPage);

        // Show success popup
        setShowCreateSuccess(true);
      } else {
        throw new Error(result.message || 'Failed to create order');
      }
    } catch (error) {
      console.error('Create order error:', error);
      const errorMessage = error instanceof Error ? getUserFriendlyErrorMessage(error.message) : 'ຜິດພາດໃນການສ້າງສິນຄ້າ';
      setErrorMessage(errorMessage);
      setShowErrorPopup(true);
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = async () => {
    if (!isFormValid || !editingProduct) return;
    setCreating(true);
    try {
      const token = AuthService.getStoredToken();
      if (!token) throw new Error("No token");

      const payload = {
        ...form,
        amount: parseFloat(form.amount),
      };

      const res = await fetch(`${apiEndpoints.products || '/api/products'}/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`Update failed ${res.status}: ${errBody}`);
      }

      setOpenCreate(false);
      setEditingProduct(null);
      setForm(resetForm(userRole));
      await fetchProducts(pagination.current_page, itemsPerPage);
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (product: Product) => {
    setDeleting(true);
    try {
      const token = AuthService.getStoredToken();
      if (!token) throw new Error("No token");

      const res = await fetch(`${apiEndpoints.orders}/${product.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        mode: 'cors',
        credentials: 'omit',
      });

      if (res.ok) {
        // Success - parse response
        const result = await res.json();
        if (result.success) {
          setProductToDelete(null);
          await fetchProducts(pagination.current_page, itemsPerPage);
          // Show success message using dedicated success popup
          setShowDeleteSuccess(true);
        } else {
          // API returned success: false
          setErrorMessage(result.message || 'ບໍ່ສາມາດລຶບສິນຄ້າໄດ້');
          setShowErrorPopup(true);
        }
      } else {
        // HTTP error - use helper function to handle specific status codes
        const errorMsg = await handleApiError(res);
        setErrorMessage(errorMsg);
        setShowErrorPopup(true);
      }
    } catch (e) {
      console.error(e);
      setErrorMessage('ຜິດພາດໃນການເຊື່ອມຕໍ່ກັບເຊີເວີ: ' + e);
      setShowErrorPopup(true);
    } finally {
      setDeleting(false);
    }
  };

  const openLegacyEditDialog = (product: Product) => {
    setEditingProduct(product);
    setForm({
      productCode: product.tracking_number,
      senderName: product.client_name,
      receiverName: "",
      senderPhone: product.client_phone || "",
      amount: product.amount?.toString() || "",
      currency: product.currency || "",
      serviceType: "send_money",
      status: product.status,
      isPaid: product.is_paid,
      remark: product.remark || "",
    });
    setOpenCreate(true);
  };

  const openDeleteDialog = (product: Product) => {
    setProductToDelete(product);
  };

  const handlePageChange = useCallback((page: number) => {
    fetchProducts(page, itemsPerPage);
  }, [itemsPerPage]);

  const handleItemsPerPageChange = useCallback((newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    fetchProducts(1, newItemsPerPage);
  }, []);

  const handleSearch = useCallback(() => {
    fetchProducts(1, itemsPerPage);
  }, [searchTerm, statusFilter, itemsPerPage]);

  const handleClearFilters = useCallback(() => {
    setSearchTerm("");
    setStatusFilter("");
    fetchProducts(1, itemsPerPage);
  }, [itemsPerPage]);

  // Auto search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim().length > 0) {
        fetchProducts(1, itemsPerPage);
      } else if (searchTerm.trim().length === 0) {
        fetchProducts(1, itemsPerPage);
      }
    }, 500); // 500ms delay

    return () => clearTimeout(timeoutId);
  }, [searchTerm, statusFilter, itemsPerPage]);

  useEffect(() => {
    fetchProducts();
  }, [statusFilter]); // Fetch when status filter changes

  // Update selectAll state when products change
  useEffect(() => {
    if (products.length === 0) {
      setSelectAll(false);
      setSelectedItems(new Set());
    } else {
      setSelectAll(selectedItems.size === products.length);
    }
  }, [products.length, selectedItems.size]);

  const handleLogout = useCallback(() => {
    AuthService.clearAuth();
    AuthService.redirectToHome();
  }, []);

  // Select all/unselect all functionality
  const handleSelectAll = useCallback(() => {
    if (selectAll) {
      // Unselect all
      setSelectedItems(new Set());
      setSelectAll(false);
    } else {
      // Select all
      const allIds = new Set(products.map(product => product.id));
      setSelectedItems(allIds);
      setSelectAll(true);
    }
  }, [selectAll, products]);

  // Check if selected products have mixed statuses
  const checkMixedStatuses = useCallback(() => {
    if (selectedItems.size === 0) return false;

    const selectedProducts = products.filter(product => selectedItems.has(product.id));
    if (selectedProducts.length === 0) return false;

    const firstProduct = selectedProducts[0];
    if (!firstProduct) return false;

    const firstStatus = firstProduct.status;
    return selectedProducts.some(product => product.status !== firstStatus);
  }, [selectedItems, products]);

  // Handle update status button click
  const handleUpdateStatusClick = useCallback(() => {
    // If products are selected, check for mixed statuses
    if (selectedItems.size > 0 && checkMixedStatuses()) {
      // Show mixed status popup directly without opening dialog
      setShowMixedStatusPopup(true);
    } else {
      // Open dialog normally (even with empty selection)
      setOpenUpdateStatus(true);
    }
  }, [checkMixedStatuses, selectedItems.size]);

  // Handle individual item selection
  const handleItemSelect = useCallback((productId: string) => {
    setSelectedItems(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(productId)) {
        newSelected.delete(productId);
      } else {
        newSelected.add(productId);
      }

      // Update selectAll state based on whether all items are selected
      setSelectAll(newSelected.size === products.length && products.length > 0);

      return newSelected;
    });
  }, [products.length]);

  // Handle real-time product updates from dialog
  const handleProductsUpdate = useCallback((newProducts: Product[]) => {
    setProducts(prevProducts => {
      // Add new products to the beginning of the list
      const updatedProducts = [...newProducts, ...prevProducts];
      // Remove duplicates based on ID
      const uniqueProducts = updatedProducts.filter((product, index, self) =>
        index === self.findIndex(p => p.id === product.id)
      );
      return uniqueProducts;
    });

    // Refresh from server to get the latest data
    setTimeout(() => {
      fetchProducts(pagination.current_page, itemsPerPage);
    }, 1000);
  }, [pagination.current_page, itemsPerPage]);

  // Handle opening edit dialog
  const handleOpenEditDialog = useCallback((product: Product) => {
    setProductToEdit(product);
    setOpenRoleBasedEdit(true);
  }, []);

  // Handle opening receipt popup
  const handleOpenReceiptPopup = useCallback((product: Product) => {
    setProductForReceipt(product);
    setShowReceiptPopup(true);
  }, []);

  // Handle direct print selected products
  const handlePrintSelected = useCallback(() => {
    if (selectedItems.size === 0) return;
    
    const selectedProducts = products.filter(product => selectedItems.has(product.id));
    
    // Print with callback to clear selection after successful print
    printSelectedProducts(selectedProducts, () => {
      // Clear selection after successful print
      setSelectedItems(new Set());
      setSelectAll(false);
    });
  }, [selectedItems, products, printSelectedProducts]);

  // Handle direct print without popup
  const handleDirectPrintReceipt = useCallback((product: Product) => {
    printProductReceipt(product);
  }, [printProductReceipt]);

  // Handle role-based create
  const handleRoleBasedCreate = useCallback(async (data: CreateOrderData) => {
    let orderData: CreateOrderData;

    if (userRole === 'thai_admin') {
      // Thai Admin: Only send required fields
      orderData = {
        tracking_number: data.tracking_number,
        client_name: data.client_name,
        client_phone: data.client_phone || null,
        status: data.status || 'EXIT_THAI_BRANCH'
      };
    } else {
      // Other admins: Send all fields
      orderData = {
        tracking_number: data.tracking_number,
        client_name: data.client_name,
        client_phone: data.client_phone || null,
        status: data.status || 'AT_THAI_BRANCH',
        is_paid: false
      };

      // Add amount/currency if provided
      if (data.amount !== undefined && data.amount !== null) {
        orderData.amount = data.amount;
      }
      if (data.currency !== undefined && data.currency !== null) {
        orderData.currency = data.currency;
      }
    }

    // Create order using the API (use orders array format for thai_admin)
    const result = await createOrder(orderData, userRole === 'thai_admin');

    if (result.success) {
      console.log('Order created successfully:', result.data);

      // Create a new product object for immediate display
      const newProduct: Product = {
        id: result.data?.id || crypto.randomUUID(),
        tracking_number: data.tracking_number,
        client_name: data.client_name,
        client_phone: data.client_phone || null,
        amount: data.amount || null,
        currency: data.currency || null,
        status: data.status || 'AT_THAI_BRANCH',
        is_paid: false,
        remark: data.remark || null,
        created_by: currentUser?.id || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
        creator: currentUser ? {
          id: currentUser.id || '',
          username: currentUser.username || '',
          firstname: currentUser.firstname || '',
          lastname: currentUser.lastname || '',
          gender: currentUser.gender || 'male',
          phone: currentUser.phone || '',
          role_id: currentUser.role_id || '',
          role: {
            id: currentUser.role?.id || '',
            name: currentUser.role?.name || 'super_admin',
            description: currentUser.role?.description || ''
          },
          created_at: currentUser.created_at || new Date().toISOString(),
          updated_at: currentUser.updated_at || new Date().toISOString(),
          deleted_at: currentUser.deleted_at || null
        } : undefined
      };

      // Immediately add the new product to the local state
      setProducts(prevProducts => [newProduct, ...prevProducts]);

      // Refresh the products list from server in background
      await fetchProducts(pagination.current_page, itemsPerPage);
    } else {
      throw new Error(result.message || 'Failed to create order');
    }
  }, [currentUser, pagination.current_page, itemsPerPage]);

  // Handle status update
  const handleStatusUpdate = useCallback(async (product: Product, newStatus: string) => {
    console.log('=== STATUS UPDATE DEBUG ===');
    console.log('Product:', product);
    console.log('New Status:', newStatus);
    console.log('User Role:', userRole);
    console.log('=== END STATUS UPDATE DEBUG ===');

    const token = AuthService.getStoredToken();
    if (!token) throw new Error("No token");

    // Convert status before preparing request body
    const apiStatus = convertStatusToAPI(newStatus);

    // Prepare the request body with all required fields
    const requestBody: any = {
      tracking_number: product.tracking_number,
      client_name: product.client_name,
      status: apiStatus // Use converted status
    };

    // Only include client_phone if it's not empty
    if (product.client_phone && product.client_phone.trim() !== '') {
      requestBody.client_phone = product.client_phone.trim();
    }

    // Only include amount, currency, and is_paid based on user role permissions
    if (userRole !== 'thai_admin' && product.amount !== null && product.amount !== undefined) {
      requestBody.amount = product.amount;
    }
    if (userRole !== 'thai_admin' && product.currency !== null && product.currency !== undefined) {
      requestBody.currency = product.currency;
    }
    if (userRole !== 'thai_admin' && product.is_paid !== null && product.is_paid !== undefined) {
      requestBody.is_paid = product.is_paid;
    }

    // Optimistically update the UI
    const updatedProduct = { ...product, status: newStatus };
    setProducts(prev => prev.map(p =>
      p.id === product.id ? updatedProduct : p
    ));

    // Make API call to update status on server
    const response = await fetch(`${apiEndpoints.orders}/${product.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      // Revert the optimistic update on error
      fetchProducts(pagination.current_page, itemsPerPage);

      try {
        const errorJson = JSON.parse(errorText);
        const friendlyMessage = getUserFriendlyErrorMessage(errorJson);
        throw new Error(friendlyMessage);
      } catch (parseError) {
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
      }
    }

    const result = await response.json();
    console.log('Status update result:', result);

    if (!result.success) {
      // Revert the optimistic update on error
      fetchProducts(pagination.current_page, itemsPerPage);
      const friendlyMessage = getUserFriendlyErrorMessage(result);
      throw new Error(friendlyMessage);
    }
  }, [pagination.current_page, itemsPerPage, userRole]);

  // Handle bulk status update
  const handleBulkStatusUpdate = useCallback(async (selectedProductIds: string[], newStatus: string) => {
    try {
      const token = AuthService.getStoredToken();
      if (!token) throw new Error("No token");

      const selectedProducts = products.filter(p => selectedProductIds.includes(p.id));

      // Convert status before preparing request body
      const apiStatus = convertStatusToAPI(newStatus);

      // Prepare the bulk request body
      const requestBody = {
        orders: selectedProducts.map(product => {
          const orderUpdate: any = {
            id: product.id,
            tracking_number: product.tracking_number,
            client_name: product.client_name,
            status: apiStatus // Use converted status
          };

          // Only include client_phone if it's not empty
          if (product.client_phone && product.client_phone.trim() !== '') {
            orderUpdate.client_phone = product.client_phone.trim();
          }

          // Only include amount, currency, and is_paid based on user role permissions
          if (userRole !== 'thai_admin' && product.amount !== null && product.amount !== undefined) {
            orderUpdate.amount = product.amount;
          }
          if (userRole !== 'thai_admin' && product.currency !== null && product.currency !== undefined) {
            orderUpdate.currency = product.currency;
          }
          if (userRole !== 'thai_admin' && product.is_paid !== null && product.is_paid !== undefined) {
            orderUpdate.is_paid = product.is_paid;
          }

          return orderUpdate;
        })
      };

      // Optimistically update the UI
      setProducts(prev => prev.map(p =>
        selectedProductIds.includes(p.id) ? { ...p, status: newStatus } : p
      ));

      // Make API call to bulk update
      const response = await fetch(`${apiEndpoints.ordersBulk}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorJson = JSON.parse(errorText);
          const friendlyMessage = getUserFriendlyErrorMessage(errorJson);
          throw new Error(friendlyMessage);
        } catch (parseError) {
          throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
        }
      }

      const result = await response.json();
      console.log('Bulk update result:', result);

      if (!result.success) {
        const friendlyMessage = getUserFriendlyErrorMessage(result);
        throw new Error(friendlyMessage);
      }

      // Clear selections after successful update
      setSelectedItems(new Set());
      setSelectAll(false);

    } catch (error) {
      console.error('Failed to bulk update status:', error);
      // Revert the optimistic update on error
      fetchProducts(pagination.current_page, itemsPerPage);
      const errorMessage = error instanceof Error ? error.message : 'ຜິດພາດໃນການອັບເດດສະຖານະ';
      alert(errorMessage);
    }
  }, [products, pagination.current_page, itemsPerPage]);

  // Handle save edit
  const handleSaveEdit = useCallback(async (updatedProduct: Product) => {
    const token = AuthService.getStoredToken();
    if (!token) throw new Error("No token");

    // Convert status before preparing request body
    const apiStatus = convertStatusToAPI(updatedProduct.status);

    // Prepare the request body according to the API specification
    const requestBody: any = {
      tracking_number: updatedProduct.tracking_number,
      client_name: updatedProduct.client_name,
      client_phone: updatedProduct.client_phone,
      status: apiStatus // Use converted status
    };

    // Only include amount, currency, and is_paid based on user role permissions
    if (userRole !== 'thai_admin' && updatedProduct.amount !== null && updatedProduct.amount !== undefined) {
      requestBody.amount = updatedProduct.amount;
    }
    if (userRole !== 'thai_admin' && updatedProduct.currency !== null && updatedProduct.currency !== undefined) {
      requestBody.currency = updatedProduct.currency;
    }
    if (userRole !== 'thai_admin' && updatedProduct.is_paid !== null && updatedProduct.is_paid !== undefined) {
      requestBody.is_paid = updatedProduct.is_paid;
    }

    // Include remark field for all roles
    if (updatedProduct.remark !== null && updatedProduct.remark !== undefined) {
      requestBody.remark = updatedProduct.remark;
    }

    // Debug: Log what's being sent to the API
    console.log('=== EDIT REQUEST DEBUG ===');
    console.log('User Role:', userRole);
    console.log('Updated Product:', updatedProduct);
    console.log('Product ID:', updatedProduct.id);
    console.log('Request Body:', requestBody);
    console.log('API Endpoint:', `${apiEndpoints.orders}/${updatedProduct.id}`);
    console.log('=== END EDIT REQUEST DEBUG ===');

    // Make API call to update product
    const response = await fetch(`${apiEndpoints.orders}/${updatedProduct.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorJson = JSON.parse(errorText);
        // Extract the message directly from the API response
        if (errorJson.message) {
          throw new Error(errorJson.message);
        } else {
          const friendlyMessage = getUserFriendlyErrorMessage(errorJson);
          throw new Error(friendlyMessage);
        }
      } catch (parseError) {
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
      }
    }

    const result = await response.json();
    console.log('Update result:', result);

    if (result.success) {
      // Update the local state with the response data
      setProducts(prev => prev.map(p =>
        p.id === updatedProduct.id ? { ...p, ...updatedProduct } : p
      ));

      setOpenEditDialog(false);
      setProductToEdit(null);

      // Refresh the data to ensure consistency
      fetchProducts(pagination.current_page, itemsPerPage);
    } else {
      const friendlyMessage = getUserFriendlyErrorMessage(result);
      throw new Error(friendlyMessage);
    }
  }, [pagination.current_page, itemsPerPage]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row overflow-x-hidden">
      {/* Responsive Sidebar */}
      <SidebarMenu
        currentUserRole={currentUser?.role ? (typeof currentUser.role === 'string' ? currentUser.role : currentUser.role.name) : 'super_admin'}
        currentPath="/product"
        onMenuClick={(href) => {
          window.location.href = href;
        }}
        onCollapseChange={() => {
          // Handle sidebar collapse if needed
        }}
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="flex-1 flex bg-gray-50 flex-col transition-all duration-300 ml-0 lg:ml-0 min-w-0">
        {/* Header */}
        <header className="bg-[#0c64b0] text-white px-4 md:px-6 py-4 flex justify-between lg:justify-end items-center">
          {/* Mobile Menu Button - Hide when menu is open */}
          <div className={`lg:hidden ${isMobileMenuOpen ? 'hidden' : 'block'}`}>
            <button
              className="text-white p-2"
              aria-label="Menu"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Desktop Logo - Positioned absolutely, only visible on large screens */}
          <Image src="/logo-01.png" alt="MISOUK EXPRESS" width={120} height={40} className="hidden lg:block h-8 w-auto absolute left-20" />

          {/* User info and logout - Only visible on large screens (desktop) */}
          <div className="hidden lg:flex items-center gap-2 md:gap-4">
            <div className="text-white text-xs md:text-sm">
              <div className="font-medium">{isMounted && currentUser ? currentUser.username : 'Super Admin'}</div>
              {isMounted && currentUser && currentUser.role && (
                <div className="text-xs text-blue-200">{getRoleName(currentUser.role)}</div>
              )}
            </div>
            <LogoutButton onLogout={handleLogout} className="text-white" />
          </div>
        </header>
        {/* Content Area */}
        <main className="flex-1 p-6 overflow-hidden">
          <div className="max-w-7xl mx-auto w-full">
            {/* Page Title and Add Button */}
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold text-gray-800">ຈັດການສິນຄ້າ</h1>

            </div>

            {/* Product Table */}
            <Card className="bg-white shadow-sm">
              <CardHeader className="border-b border-gray-200 p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
                  {/* Search Input */}
                  <div className="relative flex-1 min-w-[250px]">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="ຊອກຫາຄຳສັ່ງຊື້ທີ່ຕ້ອງການ..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-20 text-black w-full"
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Button
                      onClick={handleSearch}
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-[#0c64b0] hover:bg-[#247dc9] text-white px-3 md:px-4 py-1 text-sm h-8"
                    >
                      <span className="hidden sm:inline">ຄົ້ນຫາ</span>
                      <Search className="w-4 h-4 sm:hidden" />
                    </Button>
                  </div>

                  {/* Status Filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0c64b0] focus:border-transparent text-black text-sm w-full sm:w-auto"
                  >
                    <option value="">ສະຖານະທັງໝົດ</option>
                    <option value="AT_THAI_BRANCH">ສິນຄ້າຮອດໄທ</option>
                    <option value="EXIT_THAI_BRANCH">ສິນຄ້າອອກຈາກໄທ</option>
                    {userRole !== 'thai_admin' && (
                      <>
                        <option value="AT_LAO_BRANCH">ສິນຄ້າຮອດລາວ</option>
                        <option value="COMPLETED">ລູກຄ້າຮັບເອົາສິນຄ້າ</option>
                      </>
                    )}
                  </select>

                  {/* Clear Filters Button - Only show when filters are active */}
                  {(searchTerm.trim() || statusFilter) && (
                    <Button
                      onClick={handleClearFilters}
                      variant="outline"
                      // className="px-3 py-2 text-sm border-gray-300 text-gray-600 hover:bg-gray-50 whitespace-nowrap"
                      className="bg-[#e41616] hover:bg-[#f49393] text-white text-sm px-3 py-2 flex items-center gap-2"
                    >
                      <X className="w-4 h-4 mr-1" />
                      ລຶບຕົວກອງ
                    </Button>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Button
                      onClick={handleUpdateStatusClick}
                      className="bg-[#0c64b0] hover:bg-[#247dc9] text-white text-sm px-3 py-2 flex items-center gap-2"
                    //disabled={selectedItems.size === 0}
                    >
                      <span className="hidden sm:inline">ອັບເດດສະຖານະ</span>
                      <span className="sm:hidden">ອັບເດດ</span>
                    </Button>

                    {permissions.canCreate && (
                      <Button
                        onClick={() => setOpenCreate(true)}
                        className="bg-[#0c64b0] hover:bg-[#247dc9] text-white flex items-center"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        ເພີ່ມສິນຄ້າ
                      </Button>
                    )}
                  </div>
                </div>

              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                {/* Mobile-First Responsive Table View */}
                <div className="overflow-x-auto relative">
                  {/* Mobile scroll indicator */}
                  <div className="sm:hidden text-xs text-gray-500 mb-2 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l4-4m0 0l4-4m-4 4H3m18 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    ເລື່ອນຊ້າຍຂວາເພື່ອເບິ່ງຂໍ້ມູນເພີ່ມເຕີມ
                  </div>
                  {/* Ensure minimum width for small screens to show role-based columns */}
                  <table className={`w-full text-sm ${userRole === 'super_admin' || userRole === 'lao_admin' ? 'min-w-[1100px]' : 'min-w-[800px]'}`}>
                    {/* Role-based table header */}
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-1 sm:px-3 lg:px-6 py-2 sm:py-3 text-left">
                          <input
                            type="checkbox"
                            className="rounded w-3 h-3 sm:w-4 sm:h-4"
                            checked={selectAll}
                            onChange={handleSelectAll}
                          />
                        </th>
                        <th className="px-1 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-bold text-black uppercase tracking-wider whitespace-nowrap">
                          #
                        </th>
                        <th className="px-1 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-bold text-black uppercase tracking-wider whitespace-nowrap min-w-[100px]">
                          ຊື່ລູກຄ້າ
                        </th>
                        <th className="px-1 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-bold text-black uppercase tracking-wider whitespace-nowrap min-w-[80px]">
                          ລຫັດ
                        </th>
                        <th className="px-1 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-bold text-black uppercase tracking-wider whitespace-nowrap min-w-[100px]">
                          ເບີໂທ
                        </th>
                        <th className="px-1 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-bold text-black uppercase tracking-wider whitespace-nowrap min-w-[100px]">
                          ສະຖານະ
                        </th>
                        {(userRole === 'super_admin' || userRole === 'lao_admin') && (
                          <>
                            <th className="px-1 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-bold text-black uppercase tracking-wider whitespace-nowrap min-w-[80px]">
                              ລາຄາ
                            </th>
                            <th className="px-1 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-bold text-black uppercase tracking-wider whitespace-nowrap min-w-[80px]">
                              ສະກຸນເງິນ
                            </th>
                            <th className="px-1 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-bold text-black uppercase tracking-wider whitespace-nowrap min-w-[100px]">
                              ການຊຳລະ
                            </th>
                            <th className="px-1 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-bold text-black uppercase tracking-wider whitespace-nowrap min-w-[120px]">
                              ໝາຍເຫດ
                            </th>
                          </>
                        )}
                        {userRole === 'thai_admin' && (
                          <th className="px-1 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-bold text-black uppercase tracking-wider whitespace-nowrap min-w-[120px]">
                            ໝາຍເຫດ
                          </th>
                        )}
                        <th className="px-1 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-bold text-black uppercase tracking-wider whitespace-nowrap min-w-[120px]">
                          ວັນທີອອກໃບບິນ
                        </th>
                        <th className="px-1 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-bold text-black uppercase tracking-wider whitespace-nowrap min-w-[120px]">
                          ວັນທີແກ້ໄຂ
                        </th>
                        {/* Creator - Only for super_admin and lao_admin */}
                        {(userRole === 'super_admin' || userRole === 'lao_admin') && (
                          <th className="px-1 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-bold text-black uppercase tracking-wider whitespace-nowrap min-w-[100px]">
                            ຜູ້ສ້າງ
                          </th>
                        )}
                        <th className="px-1 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-bold text-black uppercase tracking-wider whitespace-nowrap">
                          ຈັດການ
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loading && (
                        <tr>
                          <td className="px-1 sm:px-3 lg:px-6 py-8 sm:py-12 text-center" colSpan={userRole === 'super_admin' || userRole === 'lao_admin' ? 13 : 9}>
                            <div className="flex flex-col items-center justify-center space-y-4">
                              <div className="relative">
                                <div className="w-8 h-8 sm:w-12 sm:h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                              </div>
                              <div className="text-xs sm:text-sm text-gray-600">ກຳລັງໂຫຼດຂໍ້ມູນ...</div>
                            </div>
                          </td>
                        </tr>
                      )}
                      {!loading && products.length === 0 && (
                        <tr>
                          <td className="px-1 sm:px-3 lg:px-6 py-8 sm:py-12 text-center" colSpan={userRole === 'super_admin' || userRole === 'lao_admin' ? 13 : 9}>
                            <div className="flex flex-col items-center justify-center space-y-4">
                              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                <Package className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                              </div>
                              <div className="text-xs sm:text-sm text-gray-500">ບໍ່ພົບຂໍ້ມູນຄຳສັ່ງຊື້</div>
                            </div>
                          </td>
                        </tr>
                      )}
                      {!loading && products.map((product, index) => (
                        <tr key={product.id} className="hover:bg-gray-50">
                          {/* Checkbox */}
                          <td className="px-1 sm:px-3 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              className="rounded w-3 h-3 sm:w-4 sm:h-4"
                              checked={selectedItems.has(product.id)}
                              onChange={() => handleItemSelect(product.id)}
                            />
                          </td>
                          {/* ລຳດັບ */}
                          <td className="px-1 sm:px-3 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 font-medium">
                            {((pagination.current_page - 1) * itemsPerPage) + index + 1}
                          </td>
                          {/* ຊື່ລູກຄ້າ */}
                          <td className="px-1 sm:px-3 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 min-w-[100px]">
                            <div className="max-w-[100px] truncate font-medium" title={product.client_name}>
                              {product.client_name}
                            </div>
                          </td>
                          {/* ລຫັດ */}
                          <td className="px-1 sm:px-3 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-blue-600 font-bold min-w-[80px]">
                            <CopyText text={product.tracking_number} className="max-w-[80px]">
                              {/* {product.tracking_number.length > 8
                                ? `${product.tracking_number.substring(0, 8)}...`
                                : product.tracking_number} */}
                                {product.tracking_number}
                            </CopyText>
                          </td>
                          {/* ເບີໂທ - Always visible */}
                          <td className="px-1 sm:px-3 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 min-w-[100px]">
                            <div className="max-w-[100px] truncate" title={product.client_phone || '-'}>
                              {product.client_phone || '-'}
                            </div>
                          </td>
                          {/* ສະຖານະ - Always visible */}
                          <td className="px-1 sm:px-3 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm min-w-[100px]">
                            <span className={`inline-flex items-center px-1 sm:px-2 py-0.5 rounded-full text-xs font-medium ${product.status === 'AT_THAI_BRANCH' ? 'bg-blue-100 text-blue-800' :
                              product.status === 'EXIT_THAI_BRANCH' ? 'bg-yellow-100 text-yellow-800' :
                                product.status === 'AT_LAO_BRANCH' ? 'bg-purple-100 text-purple-800' :
                                  'bg-green-100 text-green-800'
                              }`}>
                              {getStatusName(product.status)}
                            </span>
                          </td>
                          {/* ລາຄາ - Only for super_admin and lao_admin */}
                          {(userRole === 'super_admin' || userRole === 'lao_admin') && (
                            <td className="px-1 sm:px-3 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 font-medium min-w-[80px]">
                              <div className="max-w-[80px] truncate" title={product.amount ? formatAmount(product.amount) : '-'}>
                                {product.amount ? formatAmount(product.amount) : '-'}
                              </div>
                            </td>
                          )}
                          {/* ສະກຸນເງິນ - Only for super_admin and lao_admin */}
                          {(userRole === 'super_admin' || userRole === 'lao_admin') && (
                            <td className="px-1 sm:px-3 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 min-w-[80px]">
                              <div className="max-w-[80px] truncate" title={formatCurrency(product.currency)}>
                                {formatCurrency(product.currency)}
                              </div>
                            </td>
                          )}
                          {/* ການຊຳລະ - Only for super_admin and lao_admin */}
                          {(userRole === 'super_admin' || userRole === 'lao_admin') && (
                            <td className="px-1 sm:px-3 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm min-w-[100px]">
                              <span className={`inline-flex items-center px-1 sm:px-2 py-0.5 rounded-full text-xs font-medium ${product.is_paid
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                                }`}>
                                {product.is_paid ? 'ຊຳລະແລ້ວ' : 'ຍັງບໍ່ຊຳລະ'}
                              </span>
                            </td>
                          )}
                          {/* ໝາຍເຫດ - For super_admin and lao_admin (after payment) */}
                          {(userRole === 'super_admin' || userRole === 'lao_admin') && (
                            <td className="px-1 sm:px-3 lg:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 min-w-[120px]">
                              <CopyTooltip text={product.remark || ''}>
                                <div className="max-w-[120px] truncate cursor-pointer hover:underline" title={product.remark || '-'}>
                                  {product.remark || '-'}
                                </div>
                              </CopyTooltip>
                            </td>
                          )}
                          {/* ໝາຍເຫດ - For thai_admin (after status) */}
                          {userRole === 'thai_admin' && (
                            <td className="px-1 sm:px-3 lg:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 min-w-[120px]">
                              <CopyTooltip text={product.remark || ''}>
                                <div className="max-w-[120px] truncate cursor-pointer hover:underline" title={product.remark || '-'}>
                                  {product.remark || '-'}
                                </div>
                              </CopyTooltip>
                            </td>
                          )}
                          {/* ວັນທີອອກໃບບິນ - Always visible */}
                          <td className="px-1 sm:px-3 lg:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 min-w-[120px]">
                            <div className="whitespace-pre-line max-w-[120px] truncate" title={formatDate(product.created_at)}>
                              {formatDate(product.created_at)}
                            </div>
                          </td>
                          {/* ວັນທີແກ້ໄຂ - Always visible */}
                          <td className="px-1 sm:px-3 lg:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 min-w-[120px]">
                            <div className="whitespace-pre-line max-w-[120px] truncate" title={formatDate(product.updated_at || product.created_at)}>
                              {formatDate(product.updated_at || product.created_at)}
                            </div>
                          </td>
                          {/* ຜູ້ສ້າງ - Only for super_admin and lao_admin */}
                          {(userRole === 'super_admin' || userRole === 'lao_admin') && (
                            <td className="px-1 sm:px-3 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600 min-w-[100px]">
                              <div className="flex flex-col max-w-[100px]">
                                <span className="font-medium truncate" title={product.creator?.username || '-'}>
                                  {product.creator?.username || '-'}
                                </span>
                                <span className="text-xs text-gray-500 truncate" title={getRoleName(product.creator?.role)}>
                                  {getRoleName(product.creator?.role)}
                                </span>
                              </div>
                            </td>
                          )}
                          {/* ຈັດການ */}
                          <td className="px-1 sm:px-3 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                            {loadingEditId === product.id ? (
                              <div className="flex justify-center">
                                <div className="w-4 h-4 sm:w-6 sm:h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                              </div>
                            ) : (
                              <EnhancedActionsDropdown
                                onEdit={() => handleOpenEditDialog(product)}
                                onDelete={() => openDeleteDialog(product)}
                                onStatusUpdate={async (status) => await handleStatusUpdate(product, status)}
                                onPrintReceipt={() => handleDirectPrintReceipt(product)}
                                align="end"
                                isLastItems={index >= products.length - 3}
                                currentStatus={product.status}
                                userRole={userRole}
                              />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
              <Pagination
                totalRecords={pagination.total}
                currentPage={pagination.current_page}
                totalPages={pagination.total_pages}
                nextPage={pagination.next_page}
                prevPage={pagination.prev_page}
                onPageChange={handlePageChange}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            </Card>

            {/* Create/Edit Dialog */}
            <ProductDialog
              open={openCreate}
              onOpenChange={(open) => {
                setOpenCreate(open);
                if (!open) {
                  setForm(resetForm(userRole));
                  setEditingProduct(null);
                }
              }}
              form={form}
              onFormChange={setForm}
              onReset={() => setForm(resetForm(userRole))}
              onSubmit={editingProduct ? handleEdit : handleCreate}
              isFormValid={isFormValid}
              creating={creating}
              editingProduct={editingProduct}
              products={products}
              formatAmount={formatAmount}
              formatCurrency={formatCurrency}
              onProductsUpdate={handleProductsUpdate}
              userRole={userRole}
            />

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmationDialog
              open={!!productToDelete}
              onOpenChange={(open) => {
                if (!open) setProductToDelete(null);
              }}
              onConfirm={() => {
                if (productToDelete) {
                  handleDelete(productToDelete);
                }
              }}
              title="ທ່ານຕ້ອງການລຶບລາຍການນີ້ແທ້ ຫຼື ບໍ່ ?"
              loading={deleting}
            />

            {/* Role-Based Edit Dialog */}
            <RoleBasedEditDialog
              open={openRoleBasedEdit}
              onOpenChange={setOpenRoleBasedEdit}
              product={productToEdit}
              onSave={handleSaveEdit}
              onCancel={() => {
                setOpenRoleBasedEdit(false);
                setProductToEdit(null);
              }}
              userRole={userRole}
            />

            {/* Legacy Edit Product Dialog */}
            <EditProductDialog
              open={openEditDialog}
              onOpenChange={setOpenEditDialog}
              product={productToEdit}
              onSave={handleSaveEdit}
              onCancel={() => {
                setOpenEditDialog(false);
                setProductToEdit(null);
              }}
              userRole={userRole}
            />

            {/* Update Status Dialog */}
            <UpdateStatusProductDialog
              open={openUpdateStatus}
              onOpenChange={setOpenUpdateStatus}
              selectedProducts={products.filter(product => selectedItems.has(product.id))}
              onUpdateSuccess={() => {
                setSelectedItems(new Set());
                setSelectAll(false);
                fetchProducts();
              }}
              onRemoveSelectedProduct={(productId) => {
                setSelectedItems(prev => {
                  const newSet = new Set(prev);
                  newSet.delete(productId);
                  return newSet;
                });
              }}
              onClose={() => {
                setSelectedItems(new Set());
                setSelectAll(false);
              }}
              userRole={userRole}
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

            <SuccessPopup
              open={showErrorPopup}
              onOpenChange={setShowErrorPopup}
              title="ແຈ້ງເຕືອນ"
              message={errorMessage}
              autoCloseTimer={5000}
              showTimer={true}
            />

            {/* Copy Success Popup */}
            <SuccessPopup
              open={showCopySuccess}
              onOpenChange={setShowCopySuccess}
              title="ສຳເລັດ!"
              message="ຄັດລອກລະຫັດຕິດຕາມສຳເລັດແລ້ວ"
              autoCloseTimer={2000}
              showTimer={false}
            />

            {/* Delete Success Popup */}
            <SuccessPopup
              open={showDeleteSuccess}
              onOpenChange={setShowDeleteSuccess}
              title="ສຳເລັດ!"
              message="ລຶບສິນຄ້າສຳເລັດແລ້ວ"
              autoCloseTimer={3000}
              showTimer={true}
            />

            {/* Create Success Popup */}
            <SuccessPopup
              open={showCreateSuccess}
              onOpenChange={setShowCreateSuccess}
              title="ສຳເລັດ!"
              message="ສ້າງສິນຄ້າສຳເລັດແລ້ວ"
              autoCloseTimer={3000}
              showTimer={true}
            />

            {/* Receipt Popup */}
            <ReceiptPopup
              open={showReceiptPopup}
              onOpenChange={setShowReceiptPopup}
              product={productForReceipt}
              userRole={userRole}
            />


          </div>
        </main>
      </div>

      {/* Floating Print Button - Only for super_admin and lao_admin */}
      {(userRole === 'super_admin' || userRole === 'lao_admin') && (
        <FloatingPrintButton
          isVisible={selectedItems.size > 0}
          selectedCount={selectedItems.size}
          onPrint={handlePrintSelected}
        />
      )}

      {/* Toast notifications */}
      <Toaster />
    </div>
  );
}