// Product related types
export interface Product {
  id: string;
  tracking_number: string;
  client_name: string;
  client_phone: string | null;
  amount: number | null;
  currency: string | null;
  status: string;
  is_paid: boolean;
  created_by: string;
  created_at: string;
  updated_at?: string | undefined;
  deleted_at?: string | null;
  creator: {
    id: string;
    username: string;
    firstname: string;
    lastname: string;
    gender: string;
    phone: string;
    role_id: string;
    role: {
      id: string;
      name: string;
      description: string;
    };
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  } | undefined;
}

export interface ApiProduct {
  id?: string;
  _id?: string;
  tracking_number?: string;
  client_name?: string;
  client_phone?: string;
  amount?: number | null;
  currency?: string | null;
  status?: string;
  is_paid?: boolean;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  creator?: {
    id?: string;
    username?: string;
    firstname?: string;
    lastname?: string;
    gender?: string;
    phone?: string;
    role_id?: string;
    role?: {
      id?: string;
      name?: string;
      description?: string;
    };
    created_at?: string;
    updated_at?: string;
    deleted_at?: string | null;
  };
}

export interface FormData {
  productCode: string;
  senderName: string;
  receiverName: string;
  senderPhone: string;
  amount: string;
  currency: string;
  serviceType: string;
  status: string;
}

export interface PaginationData {
  total: number;
  per_page: number;
  current_page: number;
  total_pages: number;
  next_page: number | null;
  prev_page: number | null;
}

// Status configuration
export interface StatusConfig {
  [key: string]: {
    label: string;
    color: string;
  };
}

// Table column configuration
export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
}
