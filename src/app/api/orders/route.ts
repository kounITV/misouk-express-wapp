import { NextRequest, NextResponse } from 'next/server';

// Mock database to store orders
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
  }
];

// GET method - retrieve orders
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters for pagination
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    // Filter orders based on search and status
    let filteredOrders = mockOrders;

    if (search) {
      filteredOrders = filteredOrders.filter(order => 
        order.client_name.toLowerCase().includes(search.toLowerCase()) ||
        order.tracking_number.toLowerCase().includes(search.toLowerCase()) ||
        order.client_phone.includes(search)
      );
    }

    if (status) {
      filteredOrders = filteredOrders.filter(order => order.status === status);
    }

    // Pagination logic
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

    const totalRecords = filteredOrders.length;
    const totalPages = Math.ceil(totalRecords / limit);

    const response = {
      "success": true,
      "message": "ດຶງຂໍ້ມູນສຳເລັດ",
      "data": paginatedOrders,
      "pagination": {
        "total_records": totalRecords,
        "current_page": page,
        "total_pages": totalPages,
        "next_page": page < totalPages ? page + 1 : null,
        "prev_page": page > 1 ? page - 1 : null
      },
      "error": null
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Orders GET API error:', error);
   
    return NextResponse.json(
      {
        success: false,
        message: 'ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນ',
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST method - create orders (single or multiple)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Generate mock creator data
    const mockCreator = {
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
    };

    let ordersToCreate: any[] = [];
    const createdOrders: any[] = [];

    // Check if it's a single order or multiple orders
    if (body.orders && Array.isArray(body.orders)) {
      // Multiple orders
      ordersToCreate = body.orders;
    } else if (body.tracking_number || body.client_name) {
      // Single order
      ordersToCreate = [body];
    } else {
      return NextResponse.json(
        {
          success: false,
          message: 'ຂໍ້ມູນບໍ່ຖືກຕ້ອງ - ກະລຸນາສົ່ງຂໍ້ມູນຄຳສັ່ງຊື້',
          data: null,
          error: 'Invalid request format'
        },
        { status: 400 }
      );
    }

    // Validate and create orders
    for (const orderData of ordersToCreate) {
      // Validate required fields
      if (!orderData.tracking_number || !orderData.client_name || !orderData.client_phone) {
        return NextResponse.json(
          {
            success: false,
            message: 'ຂໍ້ມູນບໍ່ຄົບຖ້ວນ - ກະລຸນາໃສ່ລະຫັດຕິດຕາມ, ຊື່ລູກຄ້າ, ແລະເບີໂທ',
            data: null,
            error: 'Missing required fields: tracking_number, client_name, client_phone'
          },
          { status: 400 }
        );
      }

      // Check if tracking number already exists
      const existingOrder = mockOrders.find(order => order.tracking_number === orderData.tracking_number);
      if (existingOrder) {
        return NextResponse.json(
          {
            success: false,
            message: `ລະຫັດຕິດຕາມ ${orderData.tracking_number} ມີຢູ່ແລ້ວ`,
            data: null,
            error: 'Tracking number already exists'
          },
          { status: 409 }
        );
      }

      // Create new order
      const newOrder = {
        id: crypto.randomUUID(),
        tracking_number: orderData.tracking_number,
        client_name: orderData.client_name,
        client_phone: orderData.client_phone,
        amount: orderData.amount || null,
        currency: orderData.currency || 'LAK',
        status: orderData.status || 'AT_THAI_BRANCH',
        is_paid: orderData.is_paid || false,
        created_by: mockCreator.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
        creator: mockCreator
      };

      // Add to mock database
      mockOrders.push(newOrder);
      createdOrders.push(newOrder);
    }

    const successMessage = createdOrders.length === 1 
      ? 'ສ້າງຄຳສັ່ງຊື້ສຳເລັດແລ້ວ' 
      : `ສ້າງຄຳສັ່ງຊື້ ${createdOrders.length} ລາຍການສຳເລັດແລ້ວ`;

    return NextResponse.json(
      {
        success: true,
        message: successMessage,
        data: createdOrders.length === 1 ? createdOrders[0] : createdOrders,
        error: null
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Orders POST API error:', error);
   
    return NextResponse.json(
      {
        success: false,
        message: 'ເກີດຂໍ້ຜິດພາດໃນການສ້າງຄຳສັ່ງຊື້',
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}