const fetch = require('node-fetch');

const testProductCreation = async () => {
  const productData = [{
    "name_en": "Test Orange Fixed",
    "name_ta": "சோதனை ஆரஞ்சு",
    "description_en": "Test orange description",
    "description_ta": "சோதனை ஆரஞ்சு விளக்கம்",
    "category_id": "550e8400-e29b-41d4-a716-446655440001",
    "category_en": "fruits",
    "category_ta": "பழங்கள்",
    "price": 35.0,
    "stock_quantity": 20,
    "unit": "kg",
    "is_organic": false,
    "is_featured": false,
    "is_active": true,
    "images": ["https://via.placeholder.com/300x300.png"]
  }];

  try {
    const response = await fetch('https://yvjxgoxrzkcjvuptblri.supabase.co/rest/v1/products', {
      method: 'POST',
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2anhnb3hyemtjanZ1cHRibHJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNTA1ODAsImV4cCI6MjA3NTgyNjU4MH0.uEuXA4gBDoK8ARKJ_CA6RFgd8sVA1OZ763BD-lUmplk',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsImtpZCI6ImdMdk9KU0IxUGt3M3dBVkYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3l2anhnb3hyemtjanZ1cHRibHJpLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI1ZmY4ZTRhMC1kNmVmLTQ4YjItODdiZS1kODU4NDk2NmQ3YzciLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzYxMTUzNTk3LCJpYXQiOjE3NjExNDk5OTcsImVtYWlsIjoiYWRtaW5AZnJlc2guY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJlbWFpbCI6ImFkbWluQGZyZXNoLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmdWxsX25hbWUiOiJhZG1pbiBhZG1pbiIsInBob25lIjoiKzkxODc2MDA4ODU5NCIsInBob25lX3ZlcmlmaWVkIjp0cnVlLCJwcmVmZXJyZWRfbGFuZ3VhZ2UiOiJlbiIsInJvbGUiOiJhZG1pbiIsInN1YiI6IjVmZjhlNGEwLWQ2ZWYtNDhiMi04N2JlLWQ4NTg0OTY2ZDdjNyJ9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6InBhc3N3b3JkIiwidGltZXN0YW1wIjoxNzYxMTQ5OTk3fV0sInNlc3Npb25faWQiOiIwZTYyZmM5Zi03NWI5LTQxZWUtYjg3Ny01Nzg3NjVmYzMyYWQiLCJpc19hbm9ueW1vdXMiOmZhbHNlfQ.LAh2m4Efq-E8-SWENpRuOZR3Ph-RLGWOyQg3YetqfRE',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(productData)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ SUCCESS: Product created successfully!');
      console.log('Product data:', JSON.stringify(result, null, 2));
    } else {
      console.log('❌ ERROR: Failed to create product');
      console.log('Status:', response.status);
      console.log('Error:', JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
};

testProductCreation();