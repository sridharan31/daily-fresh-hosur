# Address Loading and Display Fix

## Issue
After successfully adding an address, the user interface was still showing "Loading addresses..." and not displaying the newly added address. This issue was caused by:

1. The addresses were only loaded once when the component mounted
2. After adding a new address, the UI was not refreshed with the latest data from Supabase
3. Loading states were not properly synchronized between components

## Changes Made

### 1. Created Reusable Address Loading Function
Instead of loading addresses only on component mount, we extracted the logic into a reusable function:

```javascript
const loadAddresses = async () => {
  if (!user?.id) return;
  
  setIsAddressLoading(true);
  try {
    const addresses = await userService.getUserAddresses(user.id);
    
    // Map to DeliveryAddress format
    const mappedAddresses = addresses.map((addr) => { ... });
    
    setSavedAddresses(mappedAddresses);
    
    // Set selected address
    const defaultAddress = mappedAddresses.find(addr => addr.isDefault);
    if (defaultAddress) {
      setSelectedAddress(defaultAddress.id);
    } else if (mappedAddresses.length > 0) {
      setSelectedAddress(mappedAddresses[0].id);
    }
  } catch (error) {
    console.error('Failed to load addresses:', error);
    setSavedAddresses([]);
  } finally {
    setIsAddressLoading(false);
  }
};
```

### 2. Simplified Address Saving
Replaced the manual state management after saving an address with a call to reload all addresses:

```javascript
const handleSaveAddress = async (address: Address) => {
  try {
    setIsLoading(true);
    
    const savedAddress = await userService.addAddress(address);
    
    if (!savedAddress) {
      throw new Error('Failed to save address');
    }
    
    // Reload addresses from Supabase
    await loadAddresses();
    
    // Select the newly added address
    setSelectedAddress(savedAddress.id);
  } catch (error) {
    console.error('Error saving address:', error);
    alert('Failed to save address. Please try again.');
  } finally {
    setIsLoading(false);
    setAddressModalVisible(false);
  }
};
```

### 3. Improved Loading State Handling in AddressFormModal
Enhanced the AddressFormModal component to handle both internal and external loading states:

- Added `isSubmitting` prop to AddressFormModalProps
- Maintained backward compatibility with internal submission state
- Used combined loading state for UI rendering

```javascript
const isFormSubmitting = isSubmitting || internalSubmitting;
```

### 4. Improved UI Feedback
Now the UI provides better feedback during the address submission process:
- Button shows "Saving..." with a spinner during submission
- Modal can't be closed during submission
- Address list automatically refreshes after successful submission

## Testing

To verify the fix:
1. Open the checkout page
2. Add a new address
3. Verify that the address list refreshes automatically
4. Verify that the newly added address appears in the list
5. Verify that the loading indicator correctly shows when addresses are being loaded or saved

The fix ensures that users always see their most up-to-date address information after any changes.