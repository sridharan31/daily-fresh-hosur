// Debug admin login and check Redux state
const fetch = require('node-fetch');

async function debugLoginFlow() {
  console.log('🧪 Testing login flow with detailed logging...');
  
  // Test admin login
  console.log('\n=== ADMIN LOGIN TEST ===');
  try {
    const adminResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@groceryapp.com',
        password: 'admin123456'
      })
    });
    
    const adminData = await adminResponse.json();
    console.log('✅ Admin Login Response Structure:');
    console.log('- success:', adminData.success);
    console.log('- data.user.role:', adminData.data?.user?.role);
    console.log('- data.user.email:', adminData.data?.user?.email);
    console.log('- Expected navigation: AdminNavigator');
    console.log('- Condition check: user?.role === "admin":', adminData.data?.user?.role === 'admin');
    
  } catch (error) {
    console.error('❌ Admin login failed:', error.message);
  }

  // Test customer login
  console.log('\n=== CUSTOMER LOGIN TEST ===');
  try {
    const customerResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'justinsridhar@gmail.com',
        password: 'your_password_here' // You'll need to provide the actual password
      })
    });
    
    const customerData = await customerResponse.json();
    console.log('✅ Customer Login Response Structure:');
    console.log('- success:', customerData.success);
    console.log('- data.user.role:', customerData.data?.user?.role);
    console.log('- data.user.email:', customerData.data?.user?.email);
    console.log('- Expected navigation: MainTabNavigator');
    console.log('- Condition check: user?.role !== "admin":', customerData.data?.user?.role !== 'admin');
    
  } catch (error) {
    console.error('❌ Customer login failed:', error.message);
  }

  console.log('\n=== NAVIGATION LOGIC ANALYSIS ===');
  console.log('AppNavigator conditional structure:');
  console.log('1. !isAuthenticated → AuthNavigator');
  console.log('2. user?.role === "admin" → AdminNavigator');
  console.log('3. else (authenticated but not admin) → MainTabNavigator');
  console.log('\nMake sure:');
  console.log('- Redux state is properly updated with user data');
  console.log('- isAuthenticated becomes true after login');
  console.log('- user object contains the role property');
}

debugLoginFlow();