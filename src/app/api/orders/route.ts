import { NextRequest, NextResponse } from 'next/server';

// Mock database to store orders (same as in bulk route)
const mockOrders: any[] = [
  {
    "id": "a9906737-85ee-47fe-aeb0-b4805fe3ce7e",
    "tracking_number": "545",
    "client_name": "koun",
    "client_phone": "43243255555",
    "amount": 100,
    "currency": "LAK",
    "status": "AT_THAI_BRANCH",
    "is_paid": false,
    "remark": "ສິນຄ້າສຳລັບການທົດສອບ",
    "created_by": "d6a58ee7-94b6-4324-bb06-36785318d871",
    "created_at": "2025-08-18T15:20:33.486Z",
    "updated_at": "2025-08-18T15:20:33.486Z",
    "deleted_at": null,
    "creator": {
      "id": "d6a58ee7-94b6-4324-bb06-36785318d871",
      "username": "admin",
      "firstname": "admin",
      "lastname": "admin",
      "gender": "male",
      "phone": "12345678",
      "role_id": "a14e09ef-bd24-4e02-b3cc-d92aa4224177",
      "role": {
        "id": "a14e09ef-bd24-4e02-b3cc-d92aa4224177",
        "name": "super_admin",
        "description": "Super Administrator with full access to all resources"
      },
      "created_at": "2025-07-14T13:39:43.371Z",
      "updated_at": "2025-07-14T13:39:43.371Z",
      "deleted_at": null
    }
  },
  {
    "id": "b9906737-85ee-47fe-aeb0-b4805fe3ce7f",
    "tracking_number": "fsafdnsaf",
    "client_name": "Test User",
    "client_phone": "02012345678",
    "amount": 250,
    "currency": "THB",
    "status": "IN_TRANSIT",
    "is_paid": true,
    "remark": "ສິນຄ້າທົດສອບທີ່ສອງ",
    "created_by": "d6a58ee7-94b6-4324-bb06-36785318d871",
    "created_at": "2025-08-18T16:20:33.486Z",
    "updated_at": "2025-08-18T16:20:33.486Z",
    "deleted_at": null,
    "creator": {
      "id": "d6a58ee7-94b6-4324-bb06-36785318d871",
      "username": "admin",
      "firstname": "admin",
      "lastname": "admin",
      "gender": "male",
      "phone": "12345678",
      "role_id": "a14e09ef-bd24-4e02-b3cc-d92aa4224177",
      "role": {
        "id": "a14e09ef-bd24-4e02-b3cc-d92aa4224177",
        "name": "super_admin",
        "description": "Super Administrator with full access to all resources"
      },
      "created_at": "2025-07-14T13:39:43.371Z",
      "updated_at": "2025-07-14T13:39:43.371Z",
      "deleted_at": null
    }
  }
];

// GET handler to retrieve all orders with pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    // Filter orders based on search and status
    let filteredOrders = mockOrders;
    
    if (search) {
      filteredOrders = filteredOrders.filter(order => 
        order.tracking_number.toLowerCase().includes(search.toLowerCase()) ||
        order.client_name.toLowerCase().includes(search.toLowerCase()) ||
        order.client_phone?.includes(search)
      );
    }
    
    if (status) {
      filteredOrders = filteredOrders.filter(order => order.status === status);
    }

    // Calculate pagination
    const total = filteredOrders.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

    return NextResponse.json(
      {
        success: true,
        message: 'Orders retrieved successfully',
        data: {
          orders: paginatedOrders,
          pagination: {
            current_page: page,
            total_pages: totalPages,
            total_items: total,
            items_per_page: limit,
            has_next: page < totalPages,
            has_prev: page > 1
          }
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

// PUT handler to update a specific order
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id') || body.id;

    if (!orderId) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Order ID is required',
          errors: ['Order ID must be provided'] 
        },
        { status: 400 }
      );
    }

    // Find the order to update
    const orderIndex = mockOrders.findIndex(order => order.id === orderId);
    
    if (orderIndex === -1) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Order with ID ${orderId} not found`,
          errors: [`Order with ID ${orderId} not found`] 
        },
        { status: 404 }
      );
    }

    // Update the order
    const existingOrder = mockOrders[orderIndex];
    const updatedOrder = {
      ...existingOrder,
      ...body,
      updated_at: new Date().toISOString()
    };

    mockOrders[orderIndex] = updatedOrder;

    return NextResponse.json(
      {
        success: true,
        message: 'Order updated successfully',
        data: {
          order: updatedOrder
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        errors: ['Failed to update order'] 
      },
      { status: 500 }
    );
  }
}

// DELETE handler to delete a specific order
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');

    if (!orderId) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Order ID is required',
          errors: ['Order ID must be provided'] 
        },
        { status: 400 }
      );
    }

    // Find the order to delete
    const orderIndex = mockOrders.findIndex(order => order.id === orderId);
    
    if (orderIndex === -1) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Order with ID ${orderId} not found`,
          errors: [`Order with ID ${orderId} not found`] 
        },
        { status: 404 }
      );
    }

    // Delete the order
    mockOrders.splice(orderIndex, 1);

    return NextResponse.json(
      {
        success: true,
        message: 'Order deleted successfully',
        data: null
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        errors: ['Failed to delete order'] 
      },
      { status: 500 }
    );
  }
}
