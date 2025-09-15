import { apiEndpoints } from '@/lib/config';

// Order creation interfaces
export interface CreateOrderData {
  tracking_number: string;
  client_name: string;
  client_phone?: string | null;
  amount?: number | null;
  currency?: string | null;
  status?: string;
  is_paid?: boolean;
  remark?: string | null;
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

// Helper function to clean order data - only include fields that have values
function cleanOrderDataClient(data: CreateOrderData): any {
  const cleaned: any = {
    tracking_number: data.tracking_number,
    client_name: data.client_name,
    status: data.status || 'AT_THAI_BRANCH'
  };

  // Only include optional fields if they have values (not empty strings)
  if (data.client_phone !== undefined && data.client_phone !== null && data.client_phone !== '' && data.client_phone.trim() !== '') {
    cleaned.client_phone = data.client_phone.trim();
  }
  
  if (data.amount !== undefined && data.amount !== null && String(data.amount) !== '' && data.amount !== 0) {
    cleaned.amount = typeof data.amount === 'string' ? parseFloat(data.amount) : data.amount;
  }
  
  if (data.currency !== undefined && data.currency !== null && data.currency !== '' && data.currency.trim() !== '') {
    cleaned.currency = data.currency.trim();
  }
  
  if (data.is_paid !== undefined && data.is_paid !== null) {
    cleaned.is_paid = data.is_paid;
  }
  
  if (data.remark !== undefined && data.remark !== null && data.remark !== '' && data.remark.trim() !== '') {
    cleaned.remark = data.remark.trim();
  }

  console.log('=== CLEAN ORDER DATA CLIENT ===');
  console.log('Input:', data);
  console.log('Output:', cleaned);
  console.log('=== END CLEAN ORDER DATA CLIENT ===');

  return cleaned;
}

// Helper function to clean order data for updates - only include fields that have values
function cleanOrderDataForUpdate(data: any): any {
  console.log('=== CLEANING DATA FOR UPDATE ===');
  console.log('Input data:', data);
  
  const cleaned: any = {};

  // Only include fields that have values (not empty strings, null, or undefined)
  if (data.tracking_number !== undefined && data.tracking_number !== null && data.tracking_number !== '' && data.tracking_number.trim() !== '') {
    cleaned.tracking_number = data.tracking_number.trim();
  }
  
  if (data.client_name !== undefined && data.client_name !== null && data.client_name !== '' && data.client_name.trim() !== '') {
    cleaned.client_name = data.client_name.trim();
  }
  
  if (data.client_phone !== undefined && data.client_phone !== null && data.client_phone !== '' && data.client_phone.trim() !== '') {
    cleaned.client_phone = data.client_phone.trim();
  }
  
  if (data.amount !== undefined && data.amount !== null && String(data.amount) !== '' && data.amount !== 0) {
    cleaned.amount = typeof data.amount === 'string' ? parseFloat(data.amount) : data.amount;
  }
  
  if (data.currency !== undefined && data.currency !== null && data.currency !== '' && data.currency.trim() !== '') {
    cleaned.currency = data.currency.trim();
  }
  
  if (data.status !== undefined && data.status !== null && data.status !== '' && data.status.trim() !== '') {
    cleaned.status = data.status.trim();
  }
  
  if (data.is_paid !== undefined && data.is_paid !== null) {
    cleaned.is_paid = data.is_paid;
  }
  
  if (data.remark !== undefined && data.remark !== null && data.remark !== '' && data.remark.trim() !== '') {
    cleaned.remark = data.remark.trim();
  }

  console.log('Cleaned data:', cleaned);
  console.log('=== END CLEANING ===');
  
  return cleaned;
}

// Create a single order
export async function createOrder(orderData: CreateOrderData, useOrdersArray: boolean = false): Promise<ApiResponse<any>> {
  try {
    console.log('=== CREATE ORDER DEBUG ===');
    console.log('Input orderData:', orderData);
    console.log('useOrdersArray:', useOrdersArray);
    
    // Clean the order data first to remove empty fields
    const cleanedOrderData = cleanOrderDataClient(orderData);
    console.log('Cleaned order data:', cleanedOrderData);
    
    // For Thai Admin orders array format, ensure only required fields
    let finalOrderData;
    
    if (useOrdersArray) {
      // Thai Admin: Only keep required fields (no amount, no currency, no is_paid)
      finalOrderData = {
        tracking_number: cleanedOrderData.tracking_number,
        client_name: cleanedOrderData.client_name,
        status: cleanedOrderData.status
      } as any;
      
      // Only add client_phone if it exists
      if (cleanedOrderData.client_phone) {
        finalOrderData.client_phone = cleanedOrderData.client_phone;
      }
    } else {
      // Other admins: use all cleaned data
      finalOrderData = cleanedOrderData;
    }

    // For Thai Admin, send as orders array format
    const requestBody = useOrdersArray 
      ? { orders: [finalOrderData] }
      : finalOrderData;

    console.log('Final request body:', JSON.stringify(requestBody, null, 2));
    console.log('=== END CREATE ORDER DEBUG ===');

    const response = await fetch(apiEndpoints.orders, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('=== NETWORK RESPONSE DEBUG ===');
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    const result = await response.json();
    console.log('Response data:', result);
    console.log('=== END NETWORK RESPONSE DEBUG ===');

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
    // Clean all orders data to remove empty fields
    const cleanedOrdersData = {
      orders: ordersData.orders.map(order => cleanOrderDataClient(order))
    };

    const response = await fetch(apiEndpoints.orders, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cleanedOrdersData),
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

// Bulk update orders (create new or update existing)
export async function bulkUpdateOrders(ordersData: any[]): Promise<ApiResponse<any[]>> {
  try {
    console.log('=== BULK UPDATE ORDERS DEBUG ===');
    console.log('Input ordersData:', ordersData);
    
    // Clean all orders data to remove empty fields
    const cleanedOrdersData = ordersData.map(order => cleanOrderDataForUpdate(order));
    console.log('Cleaned orders data:', cleanedOrdersData);

    const requestBody = { orders: cleanedOrdersData };
    console.log('Final bulk request body:', JSON.stringify(requestBody, null, 2));
    console.log('=== END BULK UPDATE DEBUG ===');

    const response = await fetch(`${apiEndpoints.orders}/bulk`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || result.message || 'Failed to bulk update orders');
    }

    return result;
  } catch (error) {
    console.error('Error bulk updating orders:', error);
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
