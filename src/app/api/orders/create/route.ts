import { NextRequest, NextResponse } from 'next/server';

// Single order interface
interface OrderData {
  tracking_number: string;
  client_name: string;
  client_phone: string;
  amount?: number | null;
  currency?: string | null;
  status: string;
  is_paid: boolean;
}

// Multiple orders interface
interface OrdersRequest {
  orders: OrderData[];
}

// Mock database storage (in real app, this would be a database)
const mockOrders: any[] = [];
let nextId = 1;

// Helper function to create a single order
function createOrder(orderData: OrderData) {
  const newOrder = {
    id: nextId.toString(),
    tracking_number: orderData.tracking_number,
    client_name: orderData.client_name,
    client_phone: orderData.client_phone,
    amount: orderData.amount || null,
    currency: orderData.currency || null,
    status: orderData.status,
    is_paid: orderData.is_paid,
    created_by: "admin", // In real app, get from auth
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
        name: "super_admin",
        description: "Super Administrator"
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    }
  };
  
  nextId++;
  mockOrders.push(newOrder);
  return newOrder;
}

// Validation function
function validateOrderData(data: any): string | null {
  if (!data.tracking_number || typeof data.tracking_number !== 'string') {
    return 'tracking_number is required and must be a string';
  }
  if (!data.client_name || typeof data.client_name !== 'string') {
    return 'client_name is required and must be a string';
  }
  // client_phone is optional - if provided, must be a string
  if (data.client_phone !== undefined && data.client_phone !== null && typeof data.client_phone !== 'string') {
    return 'client_phone must be a string if provided';
  }
  
  // Amount is optional - if provided, must be a positive number or null
  if (data.amount !== undefined && data.amount !== null) {
    if (typeof data.amount !== 'number' || data.amount < 0) {
      return 'amount must be a positive number or null';
    }
  }
  
  // Currency is optional - if provided, must be a valid string
  if (data.currency !== undefined && data.currency !== null) {
    if (typeof data.currency !== 'string') {
      return 'currency must be a string or null';
    }
    
    // Validate currency options
    const validCurrencies = ['LAK', 'THB'];
    if (!validCurrencies.includes(data.currency)) {
      return `currency must be one of: ${validCurrencies.join(', ')}`;
    }
  }
  
  if (!data.status || typeof data.status !== 'string') {
    return 'status is required and must be a string';
  }
  if (typeof data.is_paid !== 'boolean') {
    return 'is_paid is required and must be a boolean';
  }
  
  // Validate status options
  const validStatuses = ['AT_THAI_BRANCH', 'IN_TRANSIT', 'AT_LAO_BRANCH', 'COMPLETED', 'CANCELLED'];
  if (!validStatuses.includes(data.status)) {
    return `status must be one of: ${validStatuses.join(', ')}`;
  }
  
  return null;
}

// POST handler for creating orders
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Check if it's a single order or multiple orders
    if (body.orders && Array.isArray(body.orders)) {
      // Handle multiple orders
      const { orders } = body as OrdersRequest;
      
      if (!orders || orders.length === 0) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Orders array is required and cannot be empty',
            errors: ['At least one order is required'] 
          },
          { status: 400 }
        );
      }
      
      // Validate all orders first
      const validationErrors: string[] = [];
      orders.forEach((order, index) => {
        const error = validateOrderData(order);
        if (error) {
          validationErrors.push(`Order ${index + 1}: ${error}`);
        }
      });
      
      if (validationErrors.length > 0) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Validation failed for one or more orders',
            errors: validationErrors 
          },
          { status: 400 }
        );
      }
      
      // Create all orders
      const createdOrders = orders.map(orderData => createOrder(orderData));
      
      return NextResponse.json(
        {
          success: true,
          message: `Successfully created ${createdOrders.length} orders`,
          data: {
            orders: createdOrders,
            count: createdOrders.length
          }
        },
        { status: 201 }
      );
      
    } else {
      // Handle single order
      const orderData = body as OrderData;
      
      // Validate single order
      const validationError = validateOrderData(orderData);
      if (validationError) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Validation failed',
            errors: [validationError] 
          },
          { status: 400 }
        );
      }
      
      // Create single order
      const createdOrder = createOrder(orderData);
      
      return NextResponse.json(
        {
          success: true,
          message: 'Order created successfully',
          data: {
            order: createdOrder
          }
        },
        { status: 201 }
      );
    }
    
  } catch (error) {
    console.error('Error creating order(s):', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        errors: ['Failed to process request'] 
      },
      { status: 500 }
    );
  }
}

// GET handler to retrieve all created orders (for testing)
export async function GET() {
  try {
    return NextResponse.json(
      {
        success: true,
        message: 'Orders retrieved successfully',
        data: {
          orders: mockOrders,
          total: mockOrders.length
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error retrieving orders:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        errors: ['Failed to retrieve orders'] 
      },
      { status: 500 }
    );
  }
}
