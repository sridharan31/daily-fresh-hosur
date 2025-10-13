#!/usr/bin/env node

/**
 * Phone Number Format Validator for Indian Numbers
 * Your API call had: "+971589619817" (UAE format)
 * Should be: "+919876543210" (Indian format)
 */

function validateAndFormatIndianPhone(phone) {
  console.log('📱 Phone Number Validation for India');
  console.log('====================================');
  
  console.log('Original:', phone);
  
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  console.log('Digits only:', digits);
  
  // Check if it's a UAE number (starts with 971)
  if (digits.startsWith('971')) {
    console.log('❌ This is a UAE number (+971)');
    console.log('🔄 Converting to Indian format...');
    
    // Remove UAE code and add Indian code
    const localNumber = digits.substring(3);
    if (localNumber.length === 9) {
      const indianNumber = '+91' + localNumber;
      console.log('✅ Converted:', indianNumber);
      return indianNumber;
    }
  }
  
  // Check if it's already Indian format
  if (digits.startsWith('91') && digits.length === 12) {
    const formatted = `+${digits}`;
    console.log('✅ Already Indian format:', formatted);
    return formatted;
  }
  
  // If it's 10 digits, assume it's Indian without country code
  if (digits.length === 10) {
    const formatted = '+91' + digits;
    console.log('✅ Added Indian country code:', formatted);
    return formatted;
  }
  
  console.log('❌ Invalid phone number format');
  return null;
}

// Test with your original number
const originalPhone = "+971589619817";
const correctedPhone = validateAndFormatIndianPhone(originalPhone);

console.log('\n📋 API Call Fix:');
console.log('================');
console.log('❌ Original API data:');
console.log('"phone":"+971589619817"');
console.log('\n✅ Corrected API data:');
console.log(`"phone":"${correctedPhone}"`);

console.log('\n🔧 Updated curl command:');
console.log(`curl 'https://yvjxgoxrzkcjvuptblri.supabase.co/rest/v1/users' \\
  -H 'apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \\
  --data-raw '{"id":"2e8e8b4c-c4a9-4701-8d98-02252e44767d","email":"justinsridhar@gmail.com","phone":"${correctedPhone}","full_name":"SRIDHARAN PERIYANNAN","role":"customer","preferred_language":"en","is_verified":false}'`);

console.log('\n⚠️  Remember: Deploy database schema first to fix 500 error!');
console.log('📍 Go to: https://supabase.com/dashboard → SQL Editor → Run schema_safe.sql');