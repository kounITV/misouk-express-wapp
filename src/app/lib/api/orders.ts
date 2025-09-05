import { apiEndpoints } from '@/lib/config';

// Order creation interfaces
export interface CreateOrderData {
  tracking_number: string;
  client_name: string;
  client_phone: string;
  amount?: number | null;
  currency?: string | null;
  status?: string;
  is_paid?: boolean;
}

export interface CreateMultipleOrdersData {
  orders: CreateOrderData[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error: string | null;
}

// Create a single order
export async function createOrder(orderData: CreateOrderData, useOrdersArray: boolean = false): Promise<ApiResponse<any>> {
  try {
    // For Thai Admin orders array format, ensure only required fields
    let cleanOrderData;
    
    if (useOrdersArray) {
      // Thai Admin: Only keep required fields (no amount, no currency, no is_paid)
      cleanOrderData = {
        tracking_number: orderData.tracking_number,
        client_name: orderData.client_name,
        client_phone: orderData.client_phone,
        status: orderData.status
      };
    } else {
      // Other admins: use all provided data
      cleanOrderData = { ...orderData };
    }

    // For Thai Admin, send as orders array format
    const requestBody = useOrdersArray 
      ? { orders: [cleanOrderData] }
      : cleanOrderData;

    console.log('Thai Admin API Request Body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(apiEndpoints.orders, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || result.message || 'Failed to create order');
    }

    return result;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

// Create multiple orders
export async function createMultipleOrders(ordersData: CreateMultipleOrdersData): Promise<ApiResponse<any[]>> {
  try {
    const response = await fetch(apiEndpoints.orders, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ordersData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || result.message || 'Failed to create orders');
    }

    return result;
  } catch (error) {
    console.error('Error creating multiple orders:', error);
    throw error;
  }
}

// Get orders with pagination and filters
export async function getOrders(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}): Promise<ApiResponse<any[]>> {
  try {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);

    const url = `${apiEndpoints.orders}?${queryParams.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || result.message || 'Failed to fetch orders');
    }

    return result;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
}
