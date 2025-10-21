-- create_order stored procedure for Supabase
-- This function creates a new order and returns the order ID

CREATE OR REPLACE FUNCTION create_order(
  p_user_id UUID,
  p_shipping_address_id UUID,
  p_payment_method TEXT,
  p_total_amount DECIMAL,
  p_delivery_date TIMESTAMP DEFAULT NULL,
  p_delivery_time_slot TEXT DEFAULT NULL,
  p_order_items JSONB DEFAULT NULL
) 
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_id UUID;
  v_order_number TEXT;
BEGIN
  -- Generate a unique order number
  v_order_number := 'ORD-' || to_char(NOW(), 'YYYYMMDD') || '-' || floor(random() * 9000 + 1000)::text;
  
  -- Create the order record
  INSERT INTO orders (
    user_id,
    order_number,
    status,
    payment_method,
    payment_status,
    subtotal,
    cgst_amount,
    sgst_amount,
    gst_amount,
    delivery_charge,
    total_amount,
    delivery_address
  ) 
  VALUES (
    p_user_id,
    v_order_number,
    'pending',
    p_payment_method,
    'pending',
    p_total_amount * 0.85,  -- Assuming 18% GST, 0.85 is approx subtotal
    p_total_amount * 0.075, -- 9% CGST (half of 18%)
    p_total_amount * 0.075, -- 9% SGST (half of 18%)
    p_total_amount * 0.15,  -- 18% total GST
    0,                      -- Assuming free delivery for now
    p_total_amount,
    (SELECT jsonb_build_object(
        'id', id,
        'name', address_line_1,
        'address_line1', address_line_1,
        'address_line2', address_line_2,
        'city', city,
        'state', state,
        'postal_code', pincode,
        'phone', ''
    ) FROM user_addresses WHERE id = p_shipping_address_id)
  )
  RETURNING id INTO v_order_id;
  
  -- Insert order items if provided
  IF p_order_items IS NOT NULL AND jsonb_array_length(p_order_items) > 0 THEN
    -- Loop through order items array and insert each item
    FOR i IN 0..jsonb_array_length(p_order_items) - 1 LOOP
      INSERT INTO order_items (
        order_id,
        product_id,
        product_name,
        product_image,
        quantity,
        price,
        total,
        gst_rate
      )
      SELECT
        v_order_id,
        (p_order_items->i->>'productId')::UUID,
        COALESCE(
          (SELECT name_en FROM products WHERE id = (p_order_items->i->>'productId')::UUID),
          'Product'
        ),
        COALESCE(
          (SELECT images[1] FROM products WHERE id = (p_order_items->i->>'productId')::UUID),
          NULL
        ),
        (p_order_items->i->>'quantity')::INTEGER,
        (p_order_items->i->>'price')::DECIMAL,
        (p_order_items->i->>'quantity')::INTEGER * (p_order_items->i->>'price')::DECIMAL,
        COALESCE(
          (SELECT gst_rate FROM products WHERE id = (p_order_items->i->>'productId')::UUID),
          18.0
        );
    END LOOP;
    
    -- After inserting order items, also update product inventory
    -- This could be moved to a trigger if preferred
    FOR i IN 0..jsonb_array_length(p_order_items) - 1 LOOP
      UPDATE products
      SET stock_quantity = stock_quantity - (p_order_items->i->>'quantity')::INTEGER,
          sold_count = sold_count + (p_order_items->i->>'quantity')::INTEGER
      WHERE id = (p_order_items->i->>'productId')::UUID
      AND stock_quantity >= (p_order_items->i->>'quantity')::INTEGER;
    END LOOP;
    
    -- Add a record to order status history
    INSERT INTO order_status_history (
      order_id,
      status,
      notes,
      updated_by
    ) VALUES (
      v_order_id,
      'pending',
      'Order created',
      p_user_id
    );
  END IF;
  
  -- Return the order ID and number in a JSON object
  RETURN jsonb_build_object(
    'id', v_order_id, 
    'order_number', v_order_number,
    'items_count', CASE WHEN p_order_items IS NULL THEN 0 ELSE jsonb_array_length(p_order_items) END
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_order TO authenticated;