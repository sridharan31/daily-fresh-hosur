const fetch = require('node-fetch');

const testDuplicateCheck = async () => {
  const supabaseUrl = 'https://yvjxgoxrzkcjvuptblri.supabase.co';
  const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2anhnb3hyemtjanZ1cHRibHJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNTA1ODAsImV4cCI6MjA3NTgyNjU4MH0.uEuXA4gBDoK8ARKJ_CA6RFgd8sVA1OZ763BD-lUmplk';
  const authToken = 'Bearer eyJhbGciOiJIUzI1NiIsImtpZCI6ImdMdk9KU0IxUGt3M3dBVkYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3l2anhnb3hyemtjanZ1cHRibHJpLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI1ZmY4ZTRhMC1kNmVmLTQ4YjItODdiZS1kODU4NDk2NmQ3YzciLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzYxMTUzNTk3LCJpYXQiOjE3NjExNDk5OTcsImVtYWlsIjoiYWRtaW5AZnJlc2guY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJlbWFpbCI6ImFkbWluQGZyZXNoLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmdWxsX25hbWUiOiJhZG1pbiBhZG1pbiIsInBob25lIjoiKzkxODc2MDA4ODU5NCIsInBob25lX3ZlcmlmaWVkIjp0cnVlLCJwcmVmZXJyZWRfbGFuZ3VhZ2UiOiJlbiIsInJvbGUiOiJhZG1pbiIsInN1YiI6IjVmZjhlNGEwLWQ2ZWYtNDhiMi04N2JlLWQ4NTg0OTY2ZDdjNyJ9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6InBhc3N3b3JkIiwidGltZXN0YW1wIjoxNzYxMTQ5OTk3fV0sInNlc3Npb25faWQiOiIwZTYyZmM5Zi03NWI5LTQxZWUtYjg3Ny01Nzg3NjVmYzMyYWQiLCJpc19hbm9ueW1vdXMiOmZhbHNlfQ.LAh2m4Efq-E8-SWENpRuOZR3Ph-RLGWOyQg3YetqfRE';

  try {
    // First, check what products exist with the name "Test Orange Fixed"
    console.log('🔍 Checking for existing products...');
    const checkResponse = await fetch(`${supabaseUrl}/rest/v1/products?select=name_en,name_ta&or=name_en.eq.Test Orange Fixed,name_ta.eq.சோதனை ஆரஞ்சு`, {
      method: 'GET',
      headers: {
        'apikey': apiKey,
        'Authorization': authToken,
        'Content-Type': 'application/json',
      }
    });

    const existingProducts = await checkResponse.json();
    console.log(`Found ${existingProducts.length} existing products:`, existingProducts);

    if (existingProducts.length > 0) {
      console.log('⚠️  DUPLICATE DETECTED: Products with this name already exist!');
      console.log('Duplicate prevention should block this creation.');
      return;
    }

    console.log('✅ No duplicates found, proceeding with creation...');

    // Test creating a product (this should work since there are no duplicates)
    // But we know there ARE duplicates, so this is testing the logic
    
  } catch (error) {
    console.error('❌ Error during duplicate check:', error.message);
  }
};

testDuplicateCheck();