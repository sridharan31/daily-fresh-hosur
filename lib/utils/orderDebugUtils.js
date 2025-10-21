// Debug utility for order confirmation data issues
// This file helps debug issues with the order confirmation screen

/**
 * Helper function to debug order data received from the API
 * @param orderData The raw order data object
 * @returns The normalized order data
 */
export function debugOrderData(orderData) {
  console.group('Order Data Debug');
  
  // Log the original data structure
  console.log('Original Order Data:', orderData);
  
  // Check for essential fields
  console.log('Essential fields check:');
  console.log('- Order ID:', orderData?.id || 'MISSING');
  console.log('- Order Number:', orderData?.order_number || 'MISSING');
  console.log('- Payment Method:', orderData?.payment_method || 'MISSING');
  console.log('- Payment Status:', orderData?.payment_status || 'MISSING');
  
  // Check for pricing fields
  console.log('Pricing fields:');
  console.log('- Subtotal:', orderData?.subtotal || orderData?.pricing?.subtotal || 'MISSING');
  console.log('- Total:', orderData?.total || orderData?.total_amount || orderData?.pricing?.total || 'MISSING');
  console.log('- Tax/GST:', orderData?.tax || orderData?.gst_amount || orderData?.pricing?.vatAmount || 'MISSING');
  
  // Check items structure
  console.log('Items structure:');
  if (Array.isArray(orderData?.items) && orderData.items.length > 0) {
    const sampleItem = orderData.items[0];
    console.log('- Sample item:', sampleItem);
    console.log('- Product info available as:', 
      sampleItem.product ? 'item.product object' : 
      sampleItem.product_name ? 'item.product_name' : 'MISSING');
    console.log('- Price field:', 
      sampleItem.price !== undefined ? 'item.price' :
      sampleItem.unit_price !== undefined ? 'item.unit_price' : 'MISSING');
  } else {
    console.log('No items or invalid items structure');
  }
  
  // Check address data
  console.log('Shipping address:');
  if (orderData?.shipping_address) {
    console.log('- Address format:', Object.keys(orderData.shipping_address).join(', '));
  } else if (orderData?.delivery_address) {
    console.log('- Address available as delivery_address');
  } else {
    console.log('- No address data found');
  }
  
  console.groupEnd();
  
  // Return normalized data for consistency
  return normalizeOrderData(orderData);
}

/**
 * Normalizes order data to ensure consistent field names and formats
 * @param data The raw order data
 * @returns Normalized order data with consistent field names
 */
export function normalizeOrderData(data) {
  if (!data) return null;
  
  // Normalize items to ensure consistent format
  const normalizedItems = data.items ? data.items.map(item => ({
    ...item,
    product_name: item.product_name || 
                 (item.product?.name_en) || 
                 (item.product?.name) || 
                 'Product',
    unit_price: item.unit_price || item.price || 0,
    quantity: item.quantity || 1
  })) : [];
  
  // Extract address data
  const shippingAddress = data.shipping_address || data.delivery_address || null;
  
  // Normalize price fields
  return {
    ...data,
    id: data.id || '',
    order_number: data.order_number || '',
    items: normalizedItems,
    shipping_address: shippingAddress,
    subtotal: data.subtotal || data.pricing?.subtotal || 
              (data.total_amount ? data.total_amount * 0.85 : 0),
    shipping_fee: data.shipping_fee || data.delivery_charge || 
                  data.pricing?.deliveryCharge || 0,
    discount: data.discount || data.pricing?.discount || 0,
    tax: data.tax || data.gst_amount || data.pricing?.vatAmount || 
          (data.total_amount ? data.total_amount * 0.15 : 0),
    total: data.total || data.total_amount || data.pricing?.total || 0,
    payment_status: data.payment_status || 'pending',
    status: data.status || 'pending'
  };
}