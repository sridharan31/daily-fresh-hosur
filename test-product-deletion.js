// Test script to verify product deletion functionality
const fetch = require('node-fetch');

const testProductDeletion = async () => {
  const supabaseUrl = 'https://yvjxgoxrzkcjvuptblri.supabase.co';
  const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2anhnb3hyemtjanZ1cHRibHJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNTA1ODAsImV4cCI6MjA3NTgyNjU4MH0.uEuXA4gBDoK8ARKJ_CA6RFgd8sVA1OZ763BD-lUmplk';
  const authToken = 'Bearer eyJhbGciOiJIUzI1NiIsImtpZCI6ImdMdk9KU0IxUGt3M3dBVkYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3l2anhnb3hyemtjanZ1cHRibHJpLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI1ZmY4ZTRhMC1kNmVmLTQ4YjItODdiZS1kODU4NDk2NmQ3YzciLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzYxMTUzNTk3LCJpYXQiOjE3NjExNDk5OTcsImVtYWlsIjoiYWRtaW5AZnJlc2guY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJlbWFpbCI6ImFkbWluQGZyZXNoLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmdWxsX25hbWUiOiJhZG1pbiBhZG1pbiIsInBob25lIjoiKzkxODc2MDA4ODU5NCIsInBob25lX3ZlcmlmaWVkIjp0cnVlLCJwcmVmZXJyZWRfbGFuZ3VhZ2UiOiJlbiIsInJvbGUiOiJhZG1pbiIsInN1YiI6IjVmZjhlNGEwLWQ2ZWYtNDhiMi04N2JlLWQ4NTg0OTY2ZDdjNyJ9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6InBhc3N3b3JkIiwidGltZXN0YW1wIjoxNzYxMTQ5OTk3fV0sInNlc3Npb25faWQiOiIwZTYyZmM5Zi03NWI5LTQxZWUtYjg3Ny01Nzg3NjVmYzMyYWQiLCJpc19hbm9ueW1vdXMiOmZhbHNlfQ.LAh2m4Efq-E8-SWENpRuOZR3Ph-RLGWOyQg3YetqfRE';

  try {
    console.log('🔍 Testing Product Deletion Functionality...\n');

    // Step 1: Get list of existing products
    console.log('1. Fetching existing products...');
    const getResponse = await fetch(`${supabaseUrl}/rest/v1/products?select=id,name_en&limit=5`, {
      method: 'GET',
      headers: {
        'apikey': apiKey,
        'Authorization': authToken,
        'Content-Type': 'application/json',
      }
    });

    const products = await getResponse.json();
    
    if (!Array.isArray(products) || products.length === 0) {
      console.log('❌ No products found to test deletion');
      return;
    }

    console.log(`✅ Found ${products.length} products:`);
    products.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name_en} (ID: ${product.id})`);
    });

    // Step 2: Create a test product to delete
    console.log('\n2. Creating a test product for deletion...');
    const testProduct = {
      name_en: 'Test Product for Deletion',
      name_ta: 'நீக்கப்படும் சோதனை தயாரிப்பு',
      description_en: 'This is a test product that will be deleted',
      description_ta: 'இது நீக்கப்படும் ஒரு சோதனை தயாரிப்பு ஆகும்',
      category_id: '550e8400-e29b-41d4-a716-446655440000', // Vegetables
      category_en: 'vegetables',
      category_ta: 'காய்கறிகள்',
      price: 10.0,
      stock_quantity: 5,
      unit: 'kg',
      is_organic: false,
      is_featured: false,
      is_active: true,
      images: ['https://via.placeholder.com/300x300.png']
    };

    const createResponse = await fetch(`${supabaseUrl}/rest/v1/products`, {
      method: 'POST',
      headers: {
        'apikey': apiKey,
        'Authorization': authToken,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify([testProduct])
    });

    const createdProducts = await createResponse.json();
    
    if (!createResponse.ok || !Array.isArray(createdProducts) || createdProducts.length === 0) {
      console.log('❌ Failed to create test product:', createdProducts);
      return;
    }

    const testProductId = createdProducts[0].id;
    console.log(`✅ Created test product: "${testProduct.name_en}" (ID: ${testProductId})`);

    // Step 3: Test deletion
    console.log('\n3. Testing product deletion...');
    const deleteResponse = await fetch(`${supabaseUrl}/rest/v1/products?id=eq.${testProductId}`, {
      method: 'DELETE',
      headers: {
        'apikey': apiKey,
        'Authorization': authToken,
        'Content-Type': 'application/json',
      }
    });

    if (deleteResponse.ok) {
      console.log('✅ Product deleted successfully!');
      
      // Step 4: Verify deletion
      console.log('\n4. Verifying deletion...');
      const verifyResponse = await fetch(`${supabaseUrl}/rest/v1/products?id=eq.${testProductId}`, {
        method: 'GET',
        headers: {
          'apikey': apiKey,
          'Authorization': authToken,
          'Content-Type': 'application/json',
        }
      });

      const verifyResult = await verifyResponse.json();
      
      if (Array.isArray(verifyResult) && verifyResult.length === 0) {
        console.log('✅ Deletion verified - product no longer exists in database');
        console.log('\n🎉 DELETION FUNCTIONALITY TEST: PASSED');
      } else {
        console.log('❌ Deletion verification failed - product still exists');
        console.log('🚫 DELETION FUNCTIONALITY TEST: FAILED');
      }
    } else {
      const error = await deleteResponse.json();
      console.log('❌ Failed to delete product:', error);
      console.log('🚫 DELETION FUNCTIONALITY TEST: FAILED');
    }

  } catch (error) {
    console.error('❌ Test error:', error.message);
    console.log('🚫 DELETION FUNCTIONALITY TEST: FAILED');
  }
};

// Run the test
testProductDeletion();