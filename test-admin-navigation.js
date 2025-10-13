// Comprehensive admin navigation debug test
const fetch = require('node-fetch');

async function testAdminNavigation() {
  console.log('🔍 COMPREHENSIVE ADMIN NAVIGATION DEBUG');
  console.log('=' .repeat(50));
  
  try {
    // Test the admin login API
    console.log('\n1. TESTING BACKEND API...');
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@groceryapp.com',
        password: 'admin123456'
      })
    });

    const data = await response.json();
    
    console.log('✅ Backend Response:');
    console.log('   - success:', data.success);
    console.log('   - message:', data.message);
    console.log('   - data.user.role:', data.data?.user?.role);
    console.log('   - data.user.email:', data.data?.user?.email);
    console.log('   - data.user.name:', data.data?.user?.name);
    
    // Simulate the authSlice async thunk behavior
    console.log('\n2. SIMULATING AUTHSLICE ASYNC THUNK...');
    if (data.success && data.data) {
      const authSlicePayload = data.data; // This is what the async thunk returns
      console.log('✅ AuthSlice payload would be:');
      console.log('   - user.role:', authSlicePayload.user?.role);
      console.log('   - user.email:', authSlicePayload.user?.email);
      console.log('   - token present:', !!authSlicePayload.token);
      
      // Simulate Redux state after login
      console.log('\n3. SIMULATING REDUX STATE...');
      const mockReduxState = {
        isAuthenticated: true,
        user: authSlicePayload.user,
        token: authSlicePayload.token,
        isLoading: false
      };
      
      console.log('✅ Mock Redux state:');
      console.log('   - isAuthenticated:', mockReduxState.isAuthenticated);
      console.log('   - user.role:', mockReduxState.user?.role);
      console.log('   - user.email:', mockReduxState.user?.email);
      
      // Simulate AppNavigator logic
      console.log('\n4. SIMULATING APPNAVIGATOR LOGIC...');
      const { isAuthenticated, user } = mockReduxState;
      
      console.log('Navigation conditions:');
      console.log('   - !isAuthenticated:', !isAuthenticated);
      console.log('   - user?.role === "admin":', user?.role === 'admin');
      console.log('   - user?.role !== "admin":', user?.role !== 'admin');
      
      if (!isAuthenticated) {
        console.log('🧭 WOULD NAVIGATE TO: AuthNavigator');
      } else if (user?.role === 'admin') {
        console.log('🧭 WOULD NAVIGATE TO: AdminNavigator ✅');
      } else {
        console.log('🧭 WOULD NAVIGATE TO: MainTabNavigator');
      }
      
      // Additional debugging
      console.log('\n5. DETAILED ROLE ANALYSIS...');
      console.log('   - Role value:', JSON.stringify(user?.role));
      console.log('   - Role type:', typeof user?.role);
      console.log('   - Role length:', user?.role?.length);
      console.log('   - Exact match test:', user?.role === 'admin');
      console.log('   - Includes admin:', user?.role?.includes?.('admin'));
      console.log('   - Trimmed match:', user?.role?.trim?.() === 'admin');
      
    } else {
      console.log('❌ Backend login failed');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAdminNavigation();