// Test script for Daily Fresh Hosur Supabase integration
// This script tests the core functionality after the migration cleanup

// 1. Authentication test
async function testAuthentication() {
  console.log('Testing authentication with Supabase...');
  
  try {
    // Try to sign in with test credentials
    const response = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'password123'
    });
    
    if (response.error) {
      console.error('Authentication test failed:', response.error.message);
      return false;
    }
    
    console.log('Authentication successful:', response.data.user.email);
    
    // Test sign out
    await supabase.auth.signOut();
    console.log('Sign out successful');
    
    return true;
  } catch (error) {
    console.error('Authentication test error:', error.message);
    return false;
  }
}

// 2. Products test
async function testProducts() {
  console.log('Testing product retrieval with Supabase...');
  
  try {
    // Get product categories
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*')
      .limit(5);
      
    if (catError) {
      console.error('Categories test failed:', catError.message);
      return false;
    }
    
    console.log(`Retrieved ${categories.length} categories`);
    
    // Get products
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('*')
      .limit(10);
      
    if (prodError) {
      console.error('Products test failed:', prodError.message);
      return false;
    }
    
    console.log(`Retrieved ${products.length} products`);
    
    return true;
  } catch (error) {
    console.error('Products test error:', error.message);
    return false;
  }
}

// 3. Cart test
async function testCart() {
  console.log('Testing cart operations with Supabase...');
  
  try {
    const userId = '123'; // Replace with actual test user ID
    
    // Add item to cart
    const { error: addError } = await supabase
      .from('cart_items')
      .insert({
        user_id: userId,
        product_id: '1',
        quantity: 2
      });
      
    if (addError) {
      console.error('Cart add test failed:', addError.message);
      return false;
    }
    
    console.log('Item added to cart');
    
    // Get cart items
    const { data: cartItems, error: getError } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', userId);
      
    if (getError) {
      console.error('Cart get test failed:', getError.message);
      return false;
    }
    
    console.log(`Retrieved ${cartItems.length} cart items`);
    
    // Clear cart
    const { error: clearError } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId);
      
    if (clearError) {
      console.error('Cart clear test failed:', clearError.message);
      return false;
    }
    
    console.log('Cart cleared successfully');
    
    return true;
  } catch (error) {
    console.error('Cart test error:', error.message);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  const results = {
    auth: await testAuthentication(),
    products: await testProducts(),
    cart: await testCart()
  };
  
  console.log('\n--- Test Results ---');
  console.log(`Authentication: ${results.auth ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Products: ${results.products ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Cart: ${results.cart ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPassed = Object.values(results).every(result => result === true);
  console.log(`\nOverall: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
}

// Execute tests
runAllTests();