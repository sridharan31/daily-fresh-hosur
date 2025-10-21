-- Test the create_order function with order items
SELECT create_order(
  '2e8e8b4c-c4a9-4701-8d98-02252e44767d', -- User ID
  '1d4f554a-0303-4fa4-b928-13ae36f52b25', -- Shipping Address ID
  'online', -- Payment Method
  78.75, -- Total Amount
  NULL, -- Delivery Date
  NULL, -- Delivery Time Slot
  '[
    {
      "productId": "3fa85f64-5717-4562-b3fc-2c963f66afa6", 
      "quantity": 2, 
      "price": 25.50
    },
    {
      "productId": "7ea85f64-5717-4562-b3fc-2c963f66afb9", 
      "quantity": 1, 
      "price": 27.75
    }
  ]'::jsonb -- Order Items
);