// Address Loading Test Runner
// This script bypasses module issues with ES modules vs CommonJS

// Execute the test
require('./test-address-loading.js').testAddressLoading().catch(err => {
  console.error('Test failed with error:', err);
  process.exit(1);
});