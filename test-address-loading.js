// This file implements a test for user address loading using direct API calls
// Run this code to verify that addresses can be loaded properly

// Import libraries
const https = require('https');

// Supabase configuration
const supabaseUrl = 'yvjxgoxrzkcjvuptblri.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2anhnb3hyemtjanZ1cHRibHJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNTA1ODAsImV4cCI6MjA3NTgyNjU4MH0.uEuXA4gBDoK8ARKJ_CA6RFgd8sVA1OZ763BD-lUmplk';
const authToken = 'eyJhbGciOiJIUzI1NiIsImtpZCI6ImdMdk9KU0IxUGt3M3dBVkYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3l2anhnb3hyemtjanZ1cHRibHJpLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiIyZThlOGI0Yy1jNGE5LTQ3MDEtOGQ5OC0wMjI1MmU0NDc2N2QiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzYwODYxODQ0LCJpYXQiOjE3NjA4NTgyNDQsImVtYWlsIjoianVzdGluc3JpZGhhckBnbWFpbC5jb20iLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7ImVtYWlsIjoianVzdGluc3JpZGhhckBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZnVsbF9uYW1lIjoiU1JJREhBUkFOIFBFUklZQU5OQU4iLCJwaG9uZSI6Iis5NzE1ODk2MTk4MTciLCJwaG9uZV92ZXJpZmllZCI6dHJ1ZSwicHJlZmVycmVkX2xhbmd1YWdlIjoiZW4iLCJyb2xlIjoiY3VzdG9tZXIiLCJzdWIiOiIyZThlOGI0Yy1jNGE5LTQ3MDEtOGQ5OC0wMjI1MmU0NDc2N2QifSwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJhYWwiOiJhYWwxIiwiYW1yIjpbeyJtZXRob2QiOiJwYXNzd29yZCIsInRpbWVzdGFtcCI6MTc2MDg1ODI0NH1dLCJzZXNzaW9uX2lkIjoiM2RmNGMwMzYtZDMwNi00YWU3LTk5OGUtN2RkZTc4Njg5MjdlIiwiaXNfYW5vbnltb3VzIjpmYWxzZX0.G0DqlgXOzA-jvGTQeF4G4gPu9_UMDfZn28wTfjX0Qb8';

// Helper function to make HTTP requests to Supabase
function makeSupabaseRequest(path, params = '') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: supabaseUrl,
      path: `/rest/v1/${path}${params}`,
      method: 'GET',
      headers: {
        'accept': '*/*',
        'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
        'accept-profile': 'public',
        'apikey': supabaseAnonKey,
        'authorization': `Bearer ${authToken}`,
        'x-client-info': 'supabase-js-test/1.0.0'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsedData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.end();
  });
}

// Function to test address loading
async function testAddressLoading() {
  try {
    console.log('Running address loading tests with direct API calls');
    
    // Get the current user ID from the JWT token
    const userId = '2e8e8b4c-c4a9-4701-8d98-02252e44767d'; // From the token payload
    console.log('Using user ID from token:', userId);
    // 1. Testing with numeric ID (should fail)
    console.log('\n--- Testing with numeric ID (should fail) ---');
    console.log('Making request with numeric ID "1"');
    const invalidResult = await makeSupabaseRequest('user_addresses', '?select=*&user_id=eq.1');
    console.log('Status code:', invalidResult.status);
    console.log('Response data:', invalidResult.data);
    
    // 2. Testing with actual UUID from your data (should succeed)
    console.log('\n--- Testing with correct UUID format ---');
    const knownUuid = '2e8e8b4c-c4a9-4701-8d98-02252e44767d';
    console.log('Testing with known UUID:', knownUuid);
    
    const correctResult = await makeSupabaseRequest('user_addresses', `?select=*&user_id=eq.${knownUuid}`);
    console.log('Status code:', correctResult.status);
    console.log('Addresses found:', Array.isArray(correctResult.data) ? correctResult.data.length : 'N/A');
    console.log('Addresses:', JSON.stringify(correctResult.data, null, 2));
    
    // 3. Create a test address if none exist
    if (!Array.isArray(correctResult.data) || correctResult.data.length === 0) {
      console.log('\n--- No addresses found, would create a test address here ---');
      // Note: POST requests would require additional code
    }
  } catch (error) {
    console.error('Error during address test:', error);
  }
}

// Function to make a POST request to create an address
async function createTestAddress(userId) {
  return new Promise((resolve, reject) => {
    const testAddress = {
      user_id: userId,
      title: 'Test Address',
      address_line_1: 'Test Street 123',
      city: 'Test City',
      state: 'Test State',
      pincode: '600001',
      is_default: true
    };
    
    const data = JSON.stringify(testAddress);
    
    const options = {
      hostname: supabaseUrl,
      path: '/rest/v1/user_addresses',
      method: 'POST',
      headers: {
        'accept': '*/*',
        'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
        'accept-profile': 'public',
        'apikey': supabaseAnonKey,
        'authorization': `Bearer ${authToken}`,
        'content-type': 'application/json',
        'prefer': 'return=representation',
        'x-client-info': 'supabase-js-test/1.0.0'
      }
    };
    
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsedData });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.write(data);
    req.end();
  });
}

// Export the test function
module.exports = { testAddressLoading, createTestAddress };

// Run immediately if this file is executed directly
if (require.main === module) {
  testAddressLoading().catch(console.error);
}