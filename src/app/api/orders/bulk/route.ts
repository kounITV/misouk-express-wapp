import { NextRequest, NextResponse } from 'next/server';

// Mock database to store orders (same as in route.ts)
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

// POST method - bulk create orders
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Bulk create request:', body);

    if (!body.orders || !Array.isArray(body.orders)) {
      return NextResponse.json(
        {
          success: false,
          message: 'ຂໍ້ມູນບໍ່ຖືກຕ້ອງ - ກະລຸນາສົ່ງລາຍການສິນຄ້າ',
          data: null,
          error: 'Invalid request format'
        },
        { status: 400 }
      );
    }

    const createdOrders: any[] = [];
    const errors: string[] = [];

    // Process each order creation
    for (const orderData of body.orders) {
      // Check if tracking number already exists
      const existingOrder = mockOrders.find(order => order.tracking_number === orderData.tracking_number);
      
      if (existingOrder) {
        errors.push(`ລະຫັດສິນຄ້າ ${orderData.tracking_number} ມີຢູ່ແລ້ວ`);
        continue;
      }

      // Create new order
      const newOrder = {
        id: orderData.id || crypto.randomUUID(),
        tracking_number: orderData.tracking_number,
        client_name: orderData.client_name || '',
        client_phone: orderData.client_phone || null,
        amount: orderData.amount || null,
        currency: orderData.currency || null,
        status: orderData.status || 'AT_THAI_BRANCH',
        is_paid: orderData.is_paid || false,
        created_by: 'd6a58ee7-94b6-4324-bb06-36785318d871',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
        creator: {
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
      };

      mockOrders.push(newOrder);
      createdOrders.push(newOrder);
    }

    if (errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'ມີຂໍ້ຜິດພາດໃນການສ້າງສິນຄ້າ',
          data: null,
          errors: errors
        },
        { status: 400 }
      );
    }

    const successMessage = createdOrders.length === 1 
      ? 'ເພີ່ມສິນຄ້າສຳເລັດແລ້ວ' 
      : `ເພີ່ມສິນຄ້າ ${createdOrders.length} ລາຍການສຳເລັດແລ້ວ`;

    return NextResponse.json(
      {
        success: true,
        message: successMessage,
        data: createdOrders,
        error: null
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Orders Bulk POST API error:', error);
   
    return NextResponse.json(
      {
        success: false,
        message: 'ເກີດຂໍ້ຜິດພາດໃນການສ້າງສິນຄ້າ',
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT method - bulk update orders
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Bulk update request:', body);

    if (!body.orders || !Array.isArray(body.orders)) {
      return NextResponse.json(
        {
          success: false,
          message: 'ຂໍ້ມູນບໍ່ຖືກຕ້ອງ - ກະລຸນາສົ່ງລາຍການສິນຄ້າ',
          data: null,
          error: 'Invalid request format'
        },
        { status: 400 }
      );
    }

    const updatedOrders: any[] = [];
    const errors: string[] = [];

    // Process each order update
    for (const orderUpdate of body.orders) {
      if (!orderUpdate.id && !orderUpdate.tracking_number) {
        errors.push('ລະຫັດສິນຄ້າຫຼື ID ຕ້ອງມີ');
        continue;
      }

      // Find existing order by ID or tracking number
      let existingOrderIndex = -1;
      if (orderUpdate.id) {
        existingOrderIndex = mockOrders.findIndex(order => order.id === orderUpdate.id);
      } else if (orderUpdate.tracking_number) {
        existingOrderIndex = mockOrders.findIndex(order => order.tracking_number === orderUpdate.tracking_number);
      }

      if (existingOrderIndex === -1) {
        // Create new order if not found
        const newOrder = {
          id: orderUpdate.id || crypto.randomUUID(),
          tracking_number: orderUpdate.tracking_number,
          client_name: orderUpdate.client_name || '',
          client_phone: orderUpdate.client_phone || '',
          amount: orderUpdate.amount || null,
          currency: orderUpdate.currency || 'LAK',
          status: orderUpdate.status || 'AT_THAI_BRANCH',
          is_paid: orderUpdate.is_paid || false,
          created_by: 'd6a58ee7-94b6-4324-bb06-36785318d871',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null,
          creator: {
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
        };

        mockOrders.push(newOrder);
        updatedOrders.push(newOrder);
      } else {
        // Update existing order
        const existingOrder = mockOrders[existingOrderIndex];
        const updatedOrder = {
          ...existingOrder,
          client_name: orderUpdate.client_name || existingOrder.client_name,
          client_phone: orderUpdate.client_phone || existingOrder.client_phone,
          amount: orderUpdate.amount !== undefined ? orderUpdate.amount : existingOrder.amount,
          currency: orderUpdate.currency || existingOrder.currency,
          status: orderUpdate.status || existingOrder.status,
          is_paid: orderUpdate.is_paid !== undefined ? orderUpdate.is_paid : existingOrder.is_paid,
          updated_at: new Date().toISOString()
        };

        mockOrders[existingOrderIndex] = updatedOrder;
        updatedOrders.push(updatedOrder);
      }
    }

    const successMessage = updatedOrders.length === 1 
      ? 'ອັບເດດສະຖານະສິນຄ້າສຳເລັດແລ້ວ' 
      : `ອັບເດດສະຖານະສິນຄ້າ ${updatedOrders.length} ລາຍການສຳເລັດແລ້ວ`;

    return NextResponse.json(
      {
        success: true,
        message: successMessage,
        data: updatedOrders,
        error: errors.length > 0 ? errors.join(', ') : null
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Orders Bulk PUT API error:', error);
   
    return NextResponse.json(
      {
        success: false,
        message: 'ເກີດຂໍ້ຜິດພາດໃນການອັບເດດສະຖານະ',
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

