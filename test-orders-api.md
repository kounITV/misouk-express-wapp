# Orders API Testing Guide

## API Endpoints

### POST `/api/orders` - Create Orders

This endpoint supports both single and multiple order creation.

## Single Order Creation

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "tracking_number": "852123",
    "client_name": "jack",
    "client_phone": "85465854",
    "amount": 10000,
    "currency": "LAK",
    "status": "AT_THAI_BRANCH",
    "is_paid": false
  }'
```

## Multiple Orders Creation

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "orders": [
      {
        "tracking_number": "852123",
        "client_name": "jack",
        "client_phone": "85465854",
        "amount": 10000,
        "currency": "LAK",
        "status": "AT_THAI_BRANCH",
        "is_paid": false
      },
      {
        "tracking_number": "64000582",
        "client_name": "kouns",
        "client_phone": "963256",
        "amount": 100,
        "currency": "LAK",
        "status": "AT_THAI_BRANCH",
        "is_paid": false
      }
    ]
  }'
```

## GET `/api/orders` - Retrieve Orders

```bash
# Get all orders
curl http://localhost:3000/api/orders

# Get orders with pagination
curl http://localhost:3000/api/orders?page=1&limit=10

# Get orders with search
curl http://localhost:3000/api/orders?search=jack

# Get orders with status filter
curl http://localhost:3000/api/orders?status=AT_THAI_BRANCH
```

## Response Format

### Success Response (Single Order)
```json
{
  "success": true,
  "message": "ສ້າງຄຳສັ່ງຊື້ສຳເລັດແລ້ວ",
  "data": {
    "id": "uuid-here",
    "tracking_number": "852123",
    "client_name": "jack",
    "client_phone": "85465854",
    "amount": 10000,
    "currency": "LAK",
    "status": "AT_THAI_BRANCH",
    "is_paid": false,
    "created_by": "uuid-here",
    "created_at": "2025-01-XX...",
    "updated_at": "2025-01-XX...",
    "deleted_at": null,
    "creator": { /* creator details */ }
  },
  "error": null
}
```

### Success Response (Multiple Orders)
```json
{
  "success": true,
  "message": "ສ້າງຄຳສັ່ງຊື້ 2 ລາຍການສຳເລັດແລ້ວ",
  "data": [
    { /* order 1 */ },
    { /* order 2 */ }
  ],
  "error": null
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message in Lao",
  "data": null,
  "error": "Detailed error message"
}
```

## Validation Rules

### Required Fields
- `tracking_number` (string)
- `client_name` (string) 
- `client_phone` (string)

### Optional Fields
- `amount` (number) - defaults to null
- `currency` (string) - defaults to "LAK"
- `status` (string) - defaults to "AT_THAI_BRANCH"
- `is_paid` (boolean) - defaults to false

### Business Rules
- Tracking numbers must be unique
- Duplicate tracking numbers will return 409 Conflict error
