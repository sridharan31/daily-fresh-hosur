# Daily Fresh Hosur Cart Testing Guide

This document outlines test cases for verifying the cart functionality in the Daily Fresh Hosur app, including both authenticated and guest user flows.

## Prerequisites

- Make sure the app is running in development mode with `npx expo start --web --offline --clear`
- Clear browser cache before testing to ensure a clean state

## Test Cases

### 1. Guest Cart Functionality

#### 1.1 Adding Products to Cart
- [ ] Navigate to Home page
- [ ] Click "Add to Cart" on any product
- [ ] Verify the cart icon in the header shows the correct item count
- [ ] Verify a success toast appears with the correct product details

#### 1.2 Viewing Cart as Guest
- [ ] Navigate to Cart page
- [ ] Verify all added products are displayed correctly
- [ ] Verify product quantities, prices, and subtotal are correct
- [ ] Verify the order summary shows correct subtotal, delivery charge, and total

#### 1.3 Updating Cart Quantities
- [ ] In the Cart page, increase quantity of an item
- [ ] Verify quantity updates correctly
- [ ] Verify subtotal and total update accordingly
- [ ] Decrease quantity and verify updates
- [ ] Remove an item completely and verify it disappears from the cart

#### 1.4 Guest Checkout Flow
- [ ] With items in the cart, click "Checkout"
- [ ] Verify you're directed to the checkout page
- [ ] Complete the guest checkout form with valid information
- [ ] Verify the guest checkout form validates required fields
- [ ] Submit the form and verify you can continue to payment options
- [ ] Test the guest account creation prompt

### 2. Authenticated User Cart Functionality

#### 2.1 User Authentication
- [ ] Log in with valid credentials
- [ ] Verify the cart syncs correctly after login
- [ ] Add items to cart while authenticated
- [ ] Verify items are added correctly

#### 2.2 Cart Persistence
- [ ] Add items to cart while authenticated
- [ ] Log out
- [ ] Log back in
- [ ] Verify the cart items are still present

#### 2.3 Authenticated Checkout
- [ ] With items in the cart, proceed to checkout
- [ ] Verify saved addresses are loaded
- [ ] Select an address and proceed
- [ ] Verify order summary and delivery options are correct

### 3. Edge Cases and Error Handling

#### 3.1 Empty Cart Scenarios
- [ ] Attempt to checkout with an empty cart
- [ ] Verify appropriate error message is shown

#### 3.2 Network Issues
- [ ] Disable network connection
- [ ] Attempt to add items to cart
- [ ] Verify cart still functions for guest users
- [ ] Verify appropriate offline indicators or messages

#### 3.3 Product Availability
- [ ] Attempt to add out-of-stock items
- [ ] Verify appropriate messaging
- [ ] Verify checkout prevents ordering unavailable items

## Regression Testing

After completing the above tests, perform these regression checks:

- [ ] Verify navigation between screens works correctly
- [ ] Verify home page product listing and filtering works
- [ ] Verify category pages load and display products correctly
- [ ] Verify product detail pages show correct information
- [ ] Verify search functionality works

## Known Issues

- Authentication state may not sync immediately on app start - may require refreshing the cart page
- Guest cart items are not persisted if the page is refreshed - will be fixed in future update

## Reporting Issues

When reporting issues, please include:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Screenshots if applicable
5. Browser/device information