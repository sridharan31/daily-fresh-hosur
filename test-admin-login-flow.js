// Test admin login flow
const fetch = require('node-fetch');

async function testAdminLogin() {
  try {
    console.log('🧪 Testing admin login flow...');
    
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@groceryapp.com',
        password: 'admin123456'
      })
    });

    const data = await response.json();
    
    console.log('✅ Login Response:', JSON.stringify(data, null, 2));
    
    if (data.success && data.data && data.data.user) {
      console.log('🔐 User Data:', {
        name: data.data.user.name,
        email: data.data.user.email,
        role: data.data.user.role,
        id: data.data.user.id
      });
      
      console.log('🧭 Navigation Logic Test:');
      console.log('  - isAuthenticated: true (after login)');
      console.log('  - user.role:', data.data.user.role);
      console.log('  - user.role === "admin":', data.data.user.role === 'admin');
      console.log('  - Should navigate to:', data.data.user.role === 'admin' ? 'AdminNavigator' : 'MainTabNavigator');
      
      if (data.data.user.role === 'admin') {
        console.log('✅ EXPECTED: Admin user should be routed to AdminNavigator');
      } else {
        console.log('❌ ISSUE: User role is not "admin", got:', data.data.user.role);
      }
    } else {
      console.log('❌ Login failed or unexpected response structure');
      console.log('Expected: {success: true, data: {user: {...}, token: "..."}}');
    }
    
  } catch (error) {
    console.error('❌ Error testing login:', error.message);
  }
}

testAdminLogin();