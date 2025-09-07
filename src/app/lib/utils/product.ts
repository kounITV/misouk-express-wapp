import { Product, ApiProduct, FormData, StatusConfig } from '@/types/product';
import { STATUS_OPTIONS } from '@/lib/constants/text';

// Date format options
export const DATE_FORMAT_OPTIONS = { hour12: false } as const;

// Status mapping - now using same values for UI and API
export const STATUS_API_MAPPING = {
  'AT_THAI_BRANCH': 'AT_THAI_BRANCH',
  'EXIT_THAI_BRANCH': 'EXIT_THAI_BRANCH',
  'AT_LAO_BRANCH': 'AT_LAO_BRANCH',
  'COMPLETED': 'COMPLETED'
};

// Reverse mapping from API to UI - same values
export const STATUS_UI_MAPPING = {
  'AT_THAI_BRANCH': 'AT_THAI_BRANCH',
  'EXIT_THAI_BRANCH': 'EXIT_THAI_BRANCH',
  'AT_LAO_BRANCH': 'AT_LAO_BRANCH',
  'COMPLETED': 'COMPLETED'
};

// Status configuration with custom colors
export const STATUS_CONFIG: StatusConfig = {
  'AT_THAI_BRANCH': {
    label: 'ສິນຄ້າຮອດໄທ',
    color: 'text-white'
  },
  'EXIT_THAI_BRANCH': {
    label: 'ສິ້ນຄ້າອອກຈາກໄທ',
    color: 'text-white'
  },
  'AT_LAO_BRANCH': {
    label: 'ສິ້ນຄ້າຮອດລາວ',
    color: 'text-white'
  },
  'COMPLETED': {
    label: 'ລູກຄ້າຮັບເອົາສິນຄ້າ',
    color: 'text-white'
  },
  'pending': {
    label: 'ລໍຖ້າສົ່ງ',
    color: 'bg-yellow-100 text-yellow-800'
  },
  'sent': {
    label: 'ສຳເລັດແລ້ວ',
    color: 'bg-green-100 text-green-800'
  },
  'cancelled': {
    label: 'ຍົກເລີກ',
    color: 'bg-red-100 text-red-800'
  }
};

// Default form values
export const DEFAULT_FORM_VALUES: FormData = {
  productCode: "",
  senderName: "",
  receiverName: "",
  senderPhone: "",
  amount: "",
  currency: "LAK",
  serviceType: "send_money",
  status: "AT_THAI_BRANCH",
};

// Constants
export const DEFAULT_ITEMS_PER_PAGE = 50;
export const DEFAULT_STATUS = "AT_THAI_BRANCH";

// Helper functions
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString('en-GB');
    const timeStr = date.toLocaleTimeString('en-GB', DATE_FORMAT_OPTIONS);
    return `${dateStr}\n${timeStr}`;
  } catch {
    return dateString;
  }
};

export const formatAmount = (amount: number | null): string => {
  return amount ? amount.toLocaleString() : '-';
};

export const formatCurrency = (currency: string | null): string => {
  return currency || '-';
};

export const getStatusName = (status: string): string => {
  return STATUS_CONFIG[status]?.label || status;
};

export const getStatusColor = (status: string): string => {
  const statusColors: { [key: string]: string } = {
    'AT_THAI_BRANCH': 'bg-[#121136] text-white',
    'EXIT_THAI_BRANCH': 'bg-[#BF0000] text-white', 
    'AT_LAO_BRANCH': 'bg-[#015C96] text-white',
    'COMPLETED': 'bg-[#00693e] text-white',
  };
  
  return statusColors[status] || STATUS_CONFIG[status]?.color || 'bg-gray-100 text-gray-800';
};

// Convert UI status to API status - now just pass through since values are the same
export const convertStatusToAPI = (uiStatus: string): string => {
  return uiStatus; // No conversion needed since UI and API use same values
};

// Convert API status to UI status - now just pass through since values are the same
export const convertStatusFromAPI = (apiStatus: string): string => {
  return apiStatus; // No conversion needed since UI and API use same values
};

// Data normalization
export const normalizeProduct = (p: ApiProduct): Product => ({
  id: p.id ?? p._id ?? crypto.randomUUID(),
  tracking_number: p.tracking_number ?? "",
  client_name: p.client_name ?? "",
  client_phone: p.client_phone ?? "",
  amount: p.amount ?? null,
  currency: p.currency ?? null,
  status: convertStatusFromAPI(p.status ?? '') || DEFAULT_STATUS, // Convert API status to UI status
  is_paid: p.is_paid ?? false,
  created_by: p.created_by ?? "",
  created_at: p.created_at ?? new Date().toISOString(),
  updated_at: p.updated_at,
  deleted_at: p.deleted_at ?? null,
  creator: p.creator ? {
    id: p.creator.id ?? "",
    username: p.creator.username ?? "",
    firstname: p.creator.firstname ?? "",
    lastname: p.creator.lastname ?? "",
    gender: p.creator.gender ?? "",
    phone: p.creator.phone ?? "",
    role_id: p.creator.role_id ?? "",
    role: {
      id: p.creator.role?.id ?? "",
      name: p.creator.role?.name ?? "",
      description: p.creator.role?.description ?? ""
    },
    created_at: p.creator.created_at ?? new Date().toISOString(),
    updated_at: p.creator.updated_at ?? new Date().toISOString(),
    deleted_at: p.creator.deleted_at ?? null
  } : undefined,
});

// Form validation
export const validateForm = (form: FormData, userRole?: string | null): boolean => {
  const baseValidation = Boolean(
    form.productCode.trim() &&
    form.senderName.trim()
  );
  
  // Amount and currency are now optional for all roles
  return baseValidation;
};

// Reset form helper
export const resetForm = (userRole?: string | null): FormData => {
  const baseValues = { ...DEFAULT_FORM_VALUES };
  
  // For Thai Admin, don't set default amount and currency, and use correct status
  if (userRole === 'thai_admin') {
    baseValues.amount = "";
    baseValues.currency = "";
    baseValues.status = "EXIT_THAI_BRANCH";
  }
  
  return baseValues;
};

// Mock data generator
export const generateMockProducts = (count: number = 6): Product[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `mock-${i + 1}`,
    tracking_number: `AGDYU6DTYF98`,
    client_name: "koun",
    client_phone: "12345678",
    amount: 10000,
    currency: i % 2 === 0 ? "LAK" : "THB",
    status: "AT_THAI_BRANCH",
    is_paid: i % 2 === 0,
    created_by: "admin",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
    creator: {
      id: "admin-1",
      username: "admin",
      firstname: "Admin",
      lastname: "User",
      gender: "male",
      phone: "123456789",
      role_id: "1",
      role: {
        id: "1",
        name: "Admin",
        description: "Administrator"
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    }
  }));
};
