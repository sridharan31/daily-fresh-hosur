# Order Creation Process Documentation

## Overview

This document describes the order creation process in the Daily Fresh Hosur application, specifically how orders are created in the Supabase database using a stored procedure.

## `create_order` Stored Procedure

The `create_order` stored procedure handles the complete order creation process in a single transaction, including:

1. Creating the main order record
2. Adding order items
3. Updating inventory stock levels
4. Recording order status history

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `p_user_id` | UUID | ID of the user placing the order |
| `p_shipping_address_id` | UUID | ID of the shipping address |
| `p_payment_method` | TEXT | Payment method (cash, card, upi, wallet, online) |
| `p_total_amount` | DECIMAL | Total order amount including taxes and fees |
| `p_delivery_date` | TIMESTAMP | Optional scheduled delivery date |
| `p_delivery_time_slot` | TEXT | Optional delivery time slot |
| `p_order_items` | JSONB | Array of order items with product ID, quantity, and price |

### Order Items JSON Format

```json
[
  {
    "productId": "UUID-string",
    "quantity": 2,
    "price": 25.50
  },
  {
    "productId": "UUID-string",
    "quantity": 1,
    "price": 27.75
  }
]
```

### Return Value

Returns a JSONB object containing:
- `id`: The generated order ID (UUID)
- `order_number`: The generated order number (string)
- `items_count`: Number of items processed (integer)

### Features

1. **Single Transaction**: Everything happens in a single database transaction for data integrity
2. **Auto-generated Order Number**: Creates a unique, readable order number (e.g., ORD-20251019-1234)
3. **GST Calculation**: Automatically calculates CGST and SGST based on the total amount
4. **Inventory Updates**: Decreases product stock and increases sold count
5. **Address Storage**: Stores the complete shipping address details at the time of order
6. **Status History**: Creates the initial status history record

## How to Use

### From TypeScript:

```typescript
const { data, error } = await supabase.rpc('create_order', {
  p_user_id: 'user-uuid',
  p_shipping_address_id: 'address-uuid',
  p_payment_method: 'online',
  p_total_amount: 78.75,
  p_order_items: [
    { productId: 'product-uuid-1', quantity: 2, price: 25.50 },
    { productId: 'product-uuid-2', quantity: 1, price: 27.75 }
  ]
});

if (error) throw error;
const orderId = data.id;
```

### From REST API:

```
POST https://yvjxgoxrzkcjvuptblri.supabase.co/rest/v1/rpc/create_order
Content-Type: application/json
apikey: your-anon-key
authorization: Bearer user-jwt-token

{
  "p_user_id": "2e8e8b4c-c4a9-4701-8d98-02252e44767d",
  "p_shipping_address_id": "1d4f554a-0303-4fa4-b928-13ae36f52b25",
  "p_payment_method": "online",
  "p_total_amount": 78.75,
  "p_order_items": [
    { "productId": "3fa85f64-5717-4562-b3fc-2c963f66afa6", "quantity": 2, "price": 25.50 },
    { "productId": "7ea85f64-5717-4562-b3fc-2c963f66afb9", "quantity": 1, "price": 27.75 }
  ]
}
```

## Testing the Function

You can test the function with the provided SQL test script:

```sql
-- test-create-order-function.sql
SELECT create_order(
  '2e8e8b4c-c4a9-4701-8d98-02252e44767d', -- User ID
  '1d4f554a-0303-4fa4-b928-13ae36f52b25', -- Shipping Address ID
  'online', -- Payment Method
  78.75, -- Total Amount
  NULL, -- Delivery Date
  NULL, -- Delivery Time Slot
  '[
    {"productId": "3fa85f64-5717-4562-b3fc-2c963f66afa6", "quantity": 2, "price": 25.50},
    {"productId": "7ea85f64-5717-4562-b3fc-2c963f66afb9", "quantity": 1, "price": 27.75}
  ]'::jsonb -- Order Items
);
```

## Troubleshooting

If you receive a 404 error when calling the function, ensure:
1. The function has been deployed to your Supabase instance
2. You have the correct permissions (function is granted to authenticated users)
3. The parameters match exactly what the function expects