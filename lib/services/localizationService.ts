import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../supabase';

// Tamil translations for the Daily Fresh Hosur app
export const translations = {
  en: {
    // Common
    'app_name': 'Daily Fresh Hosur',
    'welcome': 'Welcome',
    'loading': 'Loading...',
    'error': 'Error',
    'success': 'Success',
    'cancel': 'Cancel',
    'ok': 'OK',
    'yes': 'Yes',
    'no': 'No',
    'save': 'Save',
    'edit': 'Edit',
    'delete': 'Delete',
    'search': 'Search',
    'filter': 'Filter',
    'sort': 'Sort',
    'back': 'Back',
    'next': 'Next',
    'done': 'Done',
    'retry': 'Retry',
    'refresh': 'Refresh',
    'view_all': 'View All',
    'show_more': 'Show More',
    'show_less': 'Show Less',
    
    // Authentication
    'sign_in': 'Sign In',
    'sign_up': 'Sign Up',
    'sign_out': 'Sign Out',
    'email': 'Email',
    'password': 'Password',
    'confirm_password': 'Confirm Password',
    'phone_number': 'Phone Number',
    'full_name': 'Full Name',
    'forgot_password': 'Forgot Password?',
    'enter_otp': 'Enter OTP',
    'verify_otp': 'Verify OTP',
    'resend_otp': 'Resend OTP',
    'login_with_phone': 'Login with Phone',
    'login_with_email': 'Login with Email',
    'create_account': 'Create Account',
    'already_have_account': 'Already have an account?',
    'dont_have_account': "Don't have an account?",
    
    // Categories
    'vegetables': 'Vegetables',
    'fruits': 'Fruits',
    'dairy': 'Dairy',
    'grocery': 'Grocery',
    'spices': 'Spices',
    'organic': 'Organic',
    'frozen': 'Frozen',
    'bakery': 'Bakery',
    'beverages': 'Beverages',
    'snacks': 'Snacks',
    'meat_fish': 'Meat & Fish',
    'personal_care': 'Personal Care',
    'household': 'Household',
    
    // Product
    'add_to_cart': 'Add to Cart',
    'buy_now': 'Buy Now',
    'out_of_stock': 'Out of Stock',
    'in_stock': 'In Stock',
    'price': 'Price',
    'mrp': 'MRP',
    'discount': 'Discount',
    'you_save': 'You Save',
    'product_details': 'Product Details',
    'ingredients': 'Ingredients',
    'nutrition_facts': 'Nutrition Facts',
    'storage_instructions': 'Storage Instructions',
    'origin': 'Origin',
    'expiry': 'Expiry',
    'quantity': 'Quantity',
    'unit': 'Unit',
    'kg': 'kg',
    'grams': 'grams',
    'pieces': 'pieces',
    'liter': 'liter',
    'ml': 'ml',
    'dozen': 'dozen',
    'packet': 'packet',
    'fresh': 'Fresh',
    'seasonal': 'Seasonal',
    'locally_sourced': 'Locally Sourced',
    
    // Cart
    'cart': 'Cart',
    'my_cart': 'My Cart',
    'cart_empty': 'Your cart is empty',
    'continue_shopping': 'Continue Shopping',
    'item_count': 'items',
    'subtotal': 'Subtotal',
    'delivery_charge': 'Delivery Charge',
    'free_delivery': 'Free Delivery',
    'gst': 'GST (18%)',
    'cgst': 'CGST (9%)',
    'sgst': 'SGST (9%)',
    'total': 'Total',
    'total_savings': 'Total Savings',
    'proceed_to_checkout': 'Proceed to Checkout',
    'remove_item': 'Remove Item',
    'increase_quantity': 'Increase Quantity',
    'decrease_quantity': 'Decrease Quantity',
    'maximum_quantity_reached': 'Maximum quantity reached',
    'minimum_quantity': 'Minimum quantity is',
    
    // Checkout
    'checkout': 'Checkout',
    'delivery_address': 'Delivery Address',
    'add_address': 'Add Address',
    'edit_address': 'Edit Address',
    'select_address': 'Select Address',
    'delivery_slot': 'Delivery Slot',
    'select_delivery_slot': 'Select Delivery Slot',
    'available_slots': 'Available Slots',
    'no_slots_available': 'No slots available',
    'today': 'Today',
    'tomorrow': 'Tomorrow',
    'morning': 'Morning',
    'evening': 'Evening',
    'payment_method': 'Payment Method',
    'online_payment': 'Online Payment',
    'cash_on_delivery': 'Cash on Delivery',
    'cod_charges': 'COD Charges',
    'place_order': 'Place Order',
    'order_summary': 'Order Summary',
    'delivery_instructions': 'Delivery Instructions',
    'coupon_code': 'Coupon Code',
    'apply_coupon': 'Apply Coupon',
    'coupon_applied': 'Coupon Applied',
    'invalid_coupon': 'Invalid Coupon',
    'minimum_order_amount': 'Minimum order amount',
    
    // Orders
    'orders': 'Orders',
    'my_orders': 'My Orders',
    'order_details': 'Order Details',
    'order_number': 'Order Number',
    'order_date': 'Order Date',
    'order_status': 'Order Status',
    'payment_status': 'Payment Status',
    'delivery_date': 'Delivery Date',
    'track_order': 'Track Order',
    'cancel_order': 'Cancel Order',
    'reorder': 'Reorder',
    'rate_order': 'Rate Order',
    'order_confirmed': 'Order Confirmed',
    'order_preparing': 'Preparing',
    'out_for_delivery': 'Out for Delivery',
    'delivered': 'Delivered',
    'cancelled': 'Cancelled',
    'pending': 'Pending',
    'paid': 'Paid',
    'failed': 'Failed',
    'refunded': 'Refunded',
    'invoice': 'Invoice',
    'download_invoice': 'Download Invoice',
    'no_orders': 'No orders found',
    'order_history': 'Order History',
    
    // Payment
    'payment': 'Payment',
    'pay_now': 'Pay Now',
    'payment_successful': 'Payment Successful',
    'payment_failed': 'Payment Failed',
    'payment_pending': 'Payment Pending',
    'razorpay': 'Razorpay',
    'upi': 'UPI',
    'cards': 'Cards',
    'netbanking': 'Net Banking',
    'wallets': 'Wallets',
    'emi': 'EMI',
    'google_pay': 'Google Pay',
    'phone_pe': 'PhonePe',
    'paytm': 'Paytm',
    'amazon_pay': 'Amazon Pay',
    'credit_card': 'Credit Card',
    'debit_card': 'Debit Card',
    'payment_methods': 'Payment Methods',
    'select_payment_method': 'Select Payment Method',
    'processing_payment': 'Processing Payment...',
    'payment_gateway': 'Payment Gateway',
    
    // Profile
    'profile': 'Profile',
    'my_profile': 'My Profile',
    'edit_profile': 'Edit Profile',
    'account_settings': 'Account Settings',
    'addresses': 'Addresses',
    'my_addresses': 'My Addresses',
    'add_new_address': 'Add New Address',
    'home': 'Home',
    'office': 'Office',
    'other': 'Other',
    'address_line_1': 'Address Line 1',
    'address_line_2': 'Address Line 2',
    'city': 'City',
    'state': 'State',
    'pincode': 'Pincode',
    'landmark': 'Landmark',
    'set_as_default': 'Set as Default',
    'default_address': 'Default Address',
    'notifications': 'Notifications',
    'language': 'Language',
    'about': 'About',
    'help_support': 'Help & Support',
    'privacy_policy': 'Privacy Policy',
    'terms_conditions': 'Terms & Conditions',
    'contact_us': 'Contact Us',
    'rate_app': 'Rate App',
    'share_app': 'Share App',
    'logout': 'Logout',
    
    // Location
    'hosur': 'Hosur',
    'tamil_nadu': 'Tamil Nadu',
    'india': 'India',
    'select_location': 'Select Location',
    'current_location': 'Current Location',
    'change_location': 'Change Location',
    'delivery_area': 'Delivery Area',
    'we_deliver_to': 'We deliver to',
    'location_not_serviceable': 'We don\'t deliver to this location yet',
    'coming_soon': 'Coming Soon',
    
    // Search & Filter
    'search_products': 'Search Products',
    'search_results': 'Search Results',
    'no_results_found': 'No results found',
    'filter_by': 'Filter by',
    'sort_by': 'Sort by',
    'price_low_to_high': 'Price: Low to High',
    'price_high_to_low': 'Price: High to Low',
    'popularity': 'Popularity',
    'rating': 'Rating',
    'newest_first': 'Newest First',
    'clear_filters': 'Clear Filters',
    'apply_filters': 'Apply Filters',
    'category': 'Category',
    'brand': 'Brand',
    'price_range': 'Price Range',
    'organic_only': 'Organic Only',
    'in_stock_only': 'In Stock Only',
    
    // Reviews
    'reviews': 'Reviews',
    'write_review': 'Write Review',
    'rate_product': 'Rate Product',
    'your_rating': 'Your Rating',
    'review_title': 'Review Title',
    'review_comment': 'Review Comment',
    'submit_review': 'Submit Review',
    'helpful': 'Helpful',
    'not_helpful': 'Not Helpful',
    'verified_purchase': 'Verified Purchase',
    'no_reviews': 'No reviews yet',
    'be_first_to_review': 'Be the first to review',
    'average_rating': 'Average Rating',
    'total_reviews': 'Total Reviews',
    
    // Offers & Coupons
    'offers': 'Offers',
    'coupons': 'Coupons',
    'my_coupons': 'My Coupons',
    'available_offers': 'Available Offers',
    'expired_offers': 'Expired Offers',
    'discount_coupons': 'Discount Coupons',
    'free_delivery_coupons': 'Free Delivery Coupons',
    'cashback_offers': 'Cashback Offers',
    'first_order_discount': 'First Order Discount',
    'bulk_order_discount': 'Bulk Order Discount',
    'seasonal_offers': 'Seasonal Offers',
    'weekend_special': 'Weekend Special',
    'valid_till': 'Valid Till',
    'use_code': 'Use Code',
    'terms_apply': 'Terms & Conditions Apply',
    
    // Customer Support
    'customer_support': 'Customer Support',
    'call_us': 'Call Us',
    'email_us': 'Email Us',
    'chat_with_us': 'Chat with Us',
    'faq': 'FAQ',
    'report_issue': 'Report Issue',
    'feedback': 'Feedback',
    'suggestion': 'Suggestion',
    'complaint': 'Complaint',
    'order_issue': 'Order Issue',
    'payment_issue': 'Payment Issue',
    'delivery_issue': 'Delivery Issue',
    'product_quality_issue': 'Product Quality Issue',
    'refund_request': 'Refund Request',
    'return_request': 'Return Request',
    
    // Delivery
    'delivery': 'Delivery',
    'free_delivery_above': 'Free delivery above',
    'estimated_delivery': 'Estimated Delivery',
    'delivery_partner': 'Delivery Partner',
    'track_delivery': 'Track Delivery',
    'delivery_address_updated': 'Delivery address updated',
    'delivery_slot_updated': 'Delivery slot updated',
    'delivery_instructions_updated': 'Delivery instructions updated',
    'safe_delivery': 'Safe Delivery',
    'contactless_delivery': 'Contactless Delivery',
    'delivered_by': 'Delivered by',
    'delivery_otp': 'Delivery OTP',
    
    // Error Messages
    'network_error': 'Network error. Please check your connection.',
    'server_error': 'Server error. Please try again later.',
    'invalid_credentials': 'Invalid credentials. Please check your email and password.',
    'user_not_found': 'User not found.',
    'email_already_exists': 'Email already exists.',
    'phone_already_exists': 'Phone number already exists.',
    'invalid_phone_number': 'Invalid phone number.',
    'invalid_email': 'Invalid email address.',
    'password_too_short': 'Password must be at least 6 characters.',
    'passwords_dont_match': 'Passwords don\'t match.',
    'otp_expired': 'OTP has expired. Please request a new one.',
    'invalid_otp': 'Invalid OTP. Please try again.',
    'session_expired': 'Session expired. Please login again.',
    'insufficient_stock': 'Insufficient stock.',
    'item_not_available': 'Item is not available.',
    'delivery_not_available': 'Delivery not available to this location.',
    'payment_cancelled': 'Payment was cancelled.',
    'order_not_found': 'Order not found.',
    'address_not_found': 'Address not found.',
    'coupon_expired': 'Coupon has expired.',
    'coupon_not_applicable': 'Coupon is not applicable.',
    'minimum_order_not_met': 'Minimum order amount not met.',
    
    // Success Messages
    'login_successful': 'Login successful!',
    'registration_successful': 'Registration successful!',
    'otp_sent': 'OTP sent successfully.',
    'otp_verified': 'OTP verified successfully.',
    'password_updated': 'Password updated successfully.',
    'profile_updated': 'Profile updated successfully.',
    'address_added': 'Address added successfully.',
    'address_updated': 'Address updated successfully.',
    'address_deleted': 'Address deleted successfully.',
    'item_added_to_cart': 'Item added to cart.',
    'item_removed_from_cart': 'Item removed from cart.',
    'cart_updated': 'Cart updated successfully.',
    'order_placed': 'Order placed successfully!',
    'order_cancelled': 'Order cancelled successfully.',
    'payment_successful_msg': 'Payment completed successfully!',
    'review_submitted': 'Review submitted successfully.',
    'feedback_submitted': 'Feedback submitted successfully.',
    'coupon_applied_msg': 'Coupon applied successfully.',
    
    // Units
    'per_kg': 'per kg',
    'per_piece': 'per piece',
    'per_liter': 'per liter',
    'per_packet': 'per packet',
    'per_dozen': 'per dozen',
    'per_bundle': 'per bundle',
    'per_box': 'per box',
    
    // Time
    'today': 'Today',
    'tomorrow': 'Tomorrow',
    'yesterday': 'Yesterday',
    'morning': 'Morning',
    'afternoon': 'Afternoon',
    'evening': 'Evening',
    'night': 'Night',
    'am': 'AM',
    'pm': 'PM',
    'mins': 'mins',
    'hours': 'hours',
    'days': 'days',
    'weeks': 'weeks',
    'months': 'months',
    
    // Currency
    'rupees': 'Rupees',
    'free': 'Free',
    'currency_symbol': '₹',
  },
  
  ta: {
    // Common
    'app_name': 'டெய்லி ஃபிரெஷ் ஓசூர்',
    'welcome': 'வணக்கம்',
    'loading': 'ஏற்றுகிறது...',
    'error': 'பிழை',
    'success': 'வெற்றி',
    'cancel': 'ரத்து',
    'ok': 'சரி',
    'yes': 'ஆம்',
    'no': 'இல்லை',
    'save': 'சேமி',
    'edit': 'தொகு',
    'delete': 'நீக்கு',
    'search': 'தேடு',
    'filter': 'வடிகட்டு',
    'sort': 'வரிசைப்படுத்து',
    'back': 'பின்',
    'next': 'அடுத்து',
    'done': 'முடிந்தது',
    'retry': 'மீண்டும் முயல்',
    'refresh': 'புதுப்பி',
    'view_all': 'அனைத்தையும் பார்',
    'show_more': 'மேலும் பார்',
    'show_less': 'குறைவாக பார்',
    
    // Authentication
    'sign_in': 'உள்நுழை',
    'sign_up': 'பதிவு செய்',
    'sign_out': 'வெளியே',
    'email': 'மின்னஞ்சல்',
    'password': 'கடவுச்சொல்',
    'confirm_password': 'கடவுச்சொல் உறுதி',
    'phone_number': 'தொலைபேசி எண்',
    'full_name': 'முழு பெயர்',
    'forgot_password': 'கடவுச்சொல் மறந்தீர்களா?',
    'enter_otp': 'OTP உள்ளிடவும்',
    'verify_otp': 'OTP சரிபார்',
    'resend_otp': 'OTP மீண்டும் அனுப்பு',
    'login_with_phone': 'தொலைபேசி மூலம் உள்நுழை',
    'login_with_email': 'மின்னஞ்சல் மூலம் உள்நுழை',
    'create_account': 'கணக்கு உருவாக்கு',
    'already_have_account': 'ஏற்கனவே கணக்கு உள்ளதா?',
    'dont_have_account': 'கணக்கு இல்லையா?',
    
    // Categories
    'vegetables': 'காய்கறிகள்',
    'fruits': 'பழங்கள்',
    'dairy': 'பால் பொருட்கள்',
    'grocery': 'மளிகை',
    'spices': 'மசாலா பொருட்கள்',
    'organic': 'இயற்கை',
    'frozen': 'உறைந்த',
    'bakery': 'பேக்கரி',
    'beverages': 'பானங்கள்',
    'snacks': 'தின்பண்டங்கள்',
    'meat_fish': 'இறைச்சி & மீன்',
    'personal_care': 'தனிப்பட்ட பராமரிப்பு',
    'household': 'வீட்டுப் பொருட்கள்',
    
    // Product
    'add_to_cart': 'கூடையில் சேர்',
    'buy_now': 'இப்போது வாங்கு',
    'out_of_stock': 'தீர்ந்துவிட்டது',
    'in_stock': 'கிடைக்கிறது',
    'price': 'விலை',
    'mrp': 'அதிகபட்ச விலை',
    'discount': 'தள்ளுபடி',
    'you_save': 'நீங்கள் சேமிக்கும்',
    'product_details': 'பொருள் விவரங்கள்',
    'ingredients': 'சேர்க்கைகள்',
    'nutrition_facts': 'ஊட்டச்சத்து தகவல்',
    'storage_instructions': 'சேமிப்பு வழிமுறைகள்',
    'origin': 'தோற்றம்',
    'expiry': 'காலாவதி',
    'quantity': 'அளவு',
    'unit': 'அலகு',
    'kg': 'கிலோ',
    'grams': 'கிராம்',
    'pieces': 'துண்டுகள்',
    'liter': 'லிட்டர்',
    'ml': 'மி.லி',
    'dozen': 'டஜன்',
    'packet': 'பாக்கெட்',
    'fresh': 'புதிய',
    'seasonal': 'பருவகால',
    'locally_sourced': 'உள்ளூர் விளைச்சல்',
    
    // Cart
    'cart': 'கூடை',
    'my_cart': 'என் கூடை',
    'cart_empty': 'உங்கள் கூடை காலியாக உள்ளது',
    'continue_shopping': 'வாங்குதலைத் தொடர்',
    'item_count': 'பொருட்கள்',
    'subtotal': 'துணைத் தொகை',
    'delivery_charge': 'டெலிவரி கட்டணம்',
    'free_delivery': 'இலவச டெலிவரி',
    'gst': 'ஜிஎஸ்டி (18%)',
    'cgst': 'சிஜிஎஸ்டி (9%)',
    'sgst': 'எஸ்ஜிஎஸ்டி (9%)',
    'total': 'மொத்தம்',
    'total_savings': 'மொத்த சேமிப்பு',
    'proceed_to_checkout': 'பணம் செலுத்தச் செல்',
    'remove_item': 'பொருளை நீக்கு',
    'increase_quantity': 'அளவு அதிகரி',
    'decrease_quantity': 'அளவு குறை',
    'maximum_quantity_reached': 'அதிகபட்ச அளவு எட்டப்பட்டது',
    'minimum_quantity': 'குறைந்தபட்ச அளவு',
    
    // Checkout
    'checkout': 'பணம் செலுத்து',
    'delivery_address': 'டெலிவரி முகவரி',
    'add_address': 'முகவரி சேர்',
    'edit_address': 'முகவரி தொகு',
    'select_address': 'முகவரி தேர்ந்தெடு',
    'delivery_slot': 'டெலிவரி நேரம்',
    'select_delivery_slot': 'டெலிவரி நேரம் தேர்ந்தெடு',
    'available_slots': 'கிடைக்கும் நேரங்கள்',
    'no_slots_available': 'நேரங்கள் கிடைக்கவில்லை',
    'today': 'இன்று',
    'tomorrow': 'நாளை',
    'morning': 'காலை',
    'evening': 'மாலை',
    'payment_method': 'பணம் செலுத்தும் முறை',
    'online_payment': 'ஆன்லைன் பணம்',
    'cash_on_delivery': 'பொருள் வந்த பின் பணம்',
    'cod_charges': 'COD கட்டணம்',
    'place_order': 'ஆர்டர் செய்',
    'order_summary': 'ஆர்டர் சுருக்கம்',
    'delivery_instructions': 'டெலிவரி வழிமுறைகள்',
    'coupon_code': 'கூப்பன் கோட்',
    'apply_coupon': 'கூப்பன் பயன்படுத்து',
    'coupon_applied': 'கூப்பன் பயன்படுத்தப்பட்டது',
    'invalid_coupon': 'தவறான கூப்பன்',
    'minimum_order_amount': 'குறைந்தபட்ச ஆர்டர் தொகை',
    
    // Orders
    'orders': 'ஆர்டர்கள்',
    'my_orders': 'என் ஆர்டர்கள்',
    'order_details': 'ஆர்டர் விவரங்கள்',
    'order_number': 'ஆர்டர் எண்',
    'order_date': 'ஆர்டர் தேதி',
    'order_status': 'ஆர்டர் நிலை',
    'payment_status': 'பணம் செலுத்தல் நிலை',
    'delivery_date': 'டெலிவரி தேதி',
    'track_order': 'ஆர்டர் கண்காணி',
    'cancel_order': 'ஆர்டர் ரத்து செய்',
    'reorder': 'மீண்டும் ஆர்டர்',
    'rate_order': 'ஆர்டருக்கு மதிப்பீடு',
    'order_confirmed': 'ஆர்டர் உறுதி',
    'order_preparing': 'தயாரிக்கிறது',
    'out_for_delivery': 'டெலிவரிக்கு வெளியே',
    'delivered': 'டெலிவரி ஆனது',
    'cancelled': 'ரத்து செய்யப்பட்டது',
    'pending': 'நிலுவையில்',
    'paid': 'பணம் செலுத்தப்பட்டது',
    'failed': 'தோல்வி',
    'refunded': 'திரும்பப் பெற்றது',
    'invoice': 'பில்',
    'download_invoice': 'பில் டவுன்லோட்',
    'no_orders': 'ஆர்டர்கள் கிடைக்கவில்லை',
    'order_history': 'ஆர்டர் வரலாறு',
    
    // Payment
    'payment': 'பணம் செலுத்துதல்',
    'pay_now': 'இப்போது செலுத்து',
    'payment_successful': 'பணம் செலுத்தல் வெற்றி',
    'payment_failed': 'பணம் செலுத்தல் தோல்வி',
    'payment_pending': 'பணம் செலுத்தல் நிலுவை',
    'razorpay': 'ரேசர்பே',
    'upi': 'UPI',
    'cards': 'கார்டுகள்',
    'netbanking': 'நெட் பாங்கிங்',
    'wallets': 'வாலெட்கள்',
    'emi': 'EMI',
    'google_pay': 'கூகிள் பே',
    'phone_pe': 'போன் பே',
    'paytm': 'பேடிஎம்',
    'amazon_pay': 'அமேசான் பே',
    'credit_card': 'கிரெடிட் கார்டு',
    'debit_card': 'டெபிட் கார்டு',
    'payment_methods': 'பணம் செலுத்தும் முறைகள்',
    'select_payment_method': 'பணம் செலுத்தும் முறை தேர்ந்தெடு',
    'processing_payment': 'பணம் செலுத்துதல் செயலாக்கம்...',
    'payment_gateway': 'பணம் செலுத்தும் கேட்வே',
    
    // Profile
    'profile': 'சுயவிவரம்',
    'my_profile': 'என் சுயவிவரம்',
    'edit_profile': 'சுயவிவரம் தொகு',
    'account_settings': 'கணக்கு அமைப்புகள்',
    'addresses': 'முகவரிகள்',
    'my_addresses': 'என் முகவரிகள்',
    'add_new_address': 'புதிய முகவரி சேர்',
    'home': 'வீடு',
    'office': 'அலுவலகம்',
    'other': 'மற்றவை',
    'address_line_1': 'முகவரி வரி 1',
    'address_line_2': 'முகவரி வரி 2',
    'city': 'நகரம்',
    'state': 'மாநிலம்',
    'pincode': 'பின்கோட்',
    'landmark': 'அடையாளம்',
    'set_as_default': 'இயல்புநிலை ஆக்கு',
    'default_address': 'இயல்புநிலை முகவரி',
    'notifications': 'அறிவிப்புகள்',
    'language': 'மொழி',
    'about': 'பற்றி',
    'help_support': 'உதவி & ஆதரவு',
    'privacy_policy': 'தனியுரிமை கொள்கை',
    'terms_conditions': 'விதிமுறைகள் & நிபந்தனைகள்',
    'contact_us': 'எங்களை தொடர்பு கொள்',
    'rate_app': 'ஆப்பை மதிப்பிடு',
    'share_app': 'ஆப்பை பகிர்',
    'logout': 'வெளியேறு',
    
    // Location
    'hosur': 'ஓசூர்',
    'tamil_nadu': 'தமிழ்நாடு',
    'india': 'இந்தியா',
    'select_location': 'இடம் தேர்ந்தெடு',
    'current_location': 'தற்போதைய இடம்',
    'change_location': 'இடம் மாற்று',
    'delivery_area': 'டெலிவரி பகுதி',
    'we_deliver_to': 'நாங்கள் டெலிவரி செய்யும் இடங்கள்',
    'location_not_serviceable': 'இந்த இடத்திற்கு இன்னும் டெலிவரி கிடைக்கவில்லை',
    'coming_soon': 'விரைவில் வரும்',
    
    // Search & Filter
    'search_products': 'பொருட்களை தேடு',
    'search_results': 'தேடல் முடிவுகள்',
    'no_results_found': 'முடிவுகள் கிடைக்கவில்லை',
    'filter_by': 'வடிகட்டு',
    'sort_by': 'வரிசைப்படுத்து',
    'price_low_to_high': 'விலை: குறைவு முதல் அதிகம்',
    'price_high_to_low': 'விலை: அதிகம் முதல் குறைவு',
    'popularity': 'பிரபலம்',
    'rating': 'மதிப்பீடு',
    'newest_first': 'புதியவை முதலில்',
    'clear_filters': 'வடிகட்டிகளை அழி',
    'apply_filters': 'வடிகட்டிகளை பயன்படுத்து',
    'category': 'வகை',
    'brand': 'பிராண்ட்',
    'price_range': 'விலை வரம்பு',
    'organic_only': 'இயற்கை மட்டும்',
    'in_stock_only': 'கிடைக்கும் பொருட்கள் மட்டும்',
    
    // Reviews
    'reviews': 'மதிப்புரைகள்',
    'write_review': 'மதிப்புரை எழுது',
    'rate_product': 'பொருளுக்கு மதிப்பீடு',
    'your_rating': 'உங்கள் மதிப்பீடு',
    'review_title': 'மதிப்புரை தலைப்பு',
    'review_comment': 'மதிப்புரை கருத்து',
    'submit_review': 'மதிப்புரை சமர்ப்பி',
    'helpful': 'உபயோகமானது',
    'not_helpful': 'உபயோகமற்றது',
    'verified_purchase': 'சரிபார்க்கப்பட்ட வாங்குதல்',
    'no_reviews': 'மதிப்புரைகள் இல்லை',
    'be_first_to_review': 'முதலில் மதிப்புரை எழுதுங்கள்',
    'average_rating': 'சராசரி மதிப்பீடு',
    'total_reviews': 'மொத்த மதிப்புரைகள்',
    
    // Offers & Coupons
    'offers': 'சலுகைகள்',
    'coupons': 'கூப்பன்கள்',
    'my_coupons': 'என் கூப்பன்கள்',
    'available_offers': 'கிடைக்கும் சலுகைகள்',
    'expired_offers': 'காலாவதியான சலுகைகள்',
    'discount_coupons': 'தள்ளுபடி கூப்பன்கள்',
    'free_delivery_coupons': 'இலவச டெலிவரி கூப்பன்கள்',
    'cashback_offers': 'கேஷ்பேக் சலுகைகள்',
    'first_order_discount': 'முதல் ஆர்டர் தள்ளுபடி',
    'bulk_order_discount': 'மொத்த ஆர்டர் தள்ளுபடி',
    'seasonal_offers': 'பருவகால சலுகைகள்',
    'weekend_special': 'வீக்கெண்ட் ஸ்பெஷல்',
    'valid_till': 'இது வரை செல்லுபடியாகும்',
    'use_code': 'கோட் பயன்படுத்தவும்',
    'terms_apply': 'விதிமுறைகள் பொருந்தும்',
    
    // Customer Support
    'customer_support': 'வாடிக்கையாளர் ஆதரவு',
    'call_us': 'எங்களை அழைக்கவும்',
    'email_us': 'எங்களுக்கு மின்னஞ்சல்',
    'chat_with_us': 'எங்களுடன் அரட்டை',
    'faq': 'அடிக்கடி கேட்கப்படும் கேள்விகள்',
    'report_issue': 'பிரச்சனை தெரிவி',
    'feedback': 'கருத்து',
    'suggestion': 'பரிந்துரை',
    'complaint': 'புகார்',
    'order_issue': 'ஆர்டர் பிரச்சனை',
    'payment_issue': 'பணம் செலுத்தல் பிரச்சனை',
    'delivery_issue': 'டெலிவரி பிரச்சனை',
    'product_quality_issue': 'பொருள் தரம் பிரச்சனை',
    'refund_request': 'பணம் திரும்ப கேட்கும் கோரிக்கை',
    'return_request': 'பொருள் திரும்ப கேட்கும் கோரிக்கை',
    
    // Delivery
    'delivery': 'டெலிவரி',
    'free_delivery_above': 'இதற்கு மேல் இலவச டெலிவரி',
    'estimated_delivery': 'மதிப்பிடப்பட்ட டெலிவரி',
    'delivery_partner': 'டெலிவரி பார்ட்னர்',
    'track_delivery': 'டெலிவரி கண்காணி',
    'delivery_address_updated': 'டெலிவரி முகவரி புதுப்பிக்கப்பட்டது',
    'delivery_slot_updated': 'டெலிவரி நேரம் புதுப்பிக்கப்பட்டது',
    'delivery_instructions_updated': 'டெலிவரி வழிமுறைகள் புதுப்பிக்கப்பட்டது',
    'safe_delivery': 'பாதுகாப்பான டெலிவரி',
    'contactless_delivery': 'தொடர்பற்ற டெலிவரி',
    'delivered_by': 'டெலிவரி செய்தவர்',
    'delivery_otp': 'டெலிவரி OTP',
    
    // Units
    'per_kg': 'ஒரு கிலோவுக்கு',
    'per_piece': 'ஒரு துண்டுக்கு',
    'per_liter': 'ஒரு லிட்டருக்கு',
    'per_packet': 'ஒரு பாக்கெட்டுக்கு',
    'per_dozen': 'ஒரு டஜனுக்கு',
    'per_bundle': 'ஒரு கட்டுக்கு',
    'per_box': 'ஒரு பெட்டிக்கு',
    
    // Time
    'today': 'இன்று',
    'tomorrow': 'நாளை',
    'yesterday': 'நேற்று',
    'morning': 'காலை',
    'afternoon': 'மதியம்',
    'evening': 'மாலை',
    'night': 'இரவு',
    'am': 'காலை',
    'pm': 'மாலை',
    'mins': 'நிமிடங்கள்',
    'hours': 'மணி',
    'days': 'நாட்கள்',
    'weeks': 'வாரங்கள்',
    'months': 'மாதங்கள்',
    
    // Currency
    'rupees': 'ரூபாய்',
    'free': 'இலவசம்',
    'currency_symbol': '₹',
  }
};

class LocalizationService {
  private currentLanguage: string = 'en';
  
  constructor() {
    this.loadSavedLanguage();
  }

  // Load saved language from storage
  async loadSavedLanguage(): Promise<void> {
    try {
      const savedLanguage = await AsyncStorage.getItem('app_language');
      if (savedLanguage && ['en', 'ta'].includes(savedLanguage)) {
        this.currentLanguage = savedLanguage;
      } else {
        // Try to get user's preferred language from profile
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('users')
            .select('preferred_language')
            .eq('id', user.id)
            .single();
          
          if (profile?.preferred_language && ['en', 'ta'].includes(profile.preferred_language)) {
            this.currentLanguage = profile.preferred_language;
            await this.setLanguage(profile.preferred_language);
          }
        }
      }
    } catch (error) {
      console.error('Load saved language error:', error);
    }
  }

  // Get current language
  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  // Set language
  async setLanguage(language: 'en' | 'ta'): Promise<void> {
    try {
      this.currentLanguage = language;
      await AsyncStorage.setItem('app_language', language);
      
      // Update user profile if logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('users')
          .update({ preferred_language: language })
          .eq('id', user.id);
      }
    } catch (error) {
      console.error('Set language error:', error);
    }
  }

  // Get translation for a key
  t(key: string): string {
    const languageTranslations = translations[this.currentLanguage as keyof typeof translations];
    return languageTranslations[key as keyof typeof languageTranslations] || key;
  }

  // Get translation with parameters
  tWithParams(key: string, params: { [key: string]: string | number }): string {
    let translation = this.t(key);
    
    Object.keys(params).forEach(param => {
      translation = translation.replace(`{{${param}}}`, String(params[param]));
    });
    
    return translation;
  }

  // Format currency
  formatCurrency(amount: number): string {
    const symbol = this.t('currency_symbol');
    return `${symbol}${amount.toFixed(2)}`;
  }

  // Format date in local language
  formatDate(date: Date): string {
    if (this.currentLanguage === 'ta') {
      // Tamil date formatting can be added here
      return date.toLocaleDateString('ta-IN');
    }
    return date.toLocaleDateString('en-IN');
  }

  // Get localized product name
  getLocalizedProductName(product: any): string {
    if (this.currentLanguage === 'ta' && product.name_ta) {
      return product.name_ta;
    }
    return product.name_en || product.name;
  }

  // Get localized product description
  getLocalizedProductDescription(product: any): string {
    if (this.currentLanguage === 'ta' && product.description_ta) {
      return product.description_ta;
    }
    return product.description_en || product.description || '';
  }

  // Get localized category name
  getLocalizedCategoryName(category: any): string {
    if (this.currentLanguage === 'ta' && category.name_ta) {
      return category.name_ta;
    }
    return category.name_en || category.name;
  }

  // Get available languages
  getAvailableLanguages(): Array<{ code: string; name: string; nativeName: string }> {
    return [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' }
    ];
  }

  // Check if current language is RTL
  isRTL(): boolean {
    // Tamil is not RTL, but this can be extended for other languages
    return false;
  }

  // Get language direction
  getDirection(): 'ltr' | 'rtl' {
    return this.isRTL() ? 'rtl' : 'ltr';
  }

  // Format phone number for display
  formatPhoneNumber(phone: string): string {
    if (phone.startsWith('+91')) {
      const number = phone.substring(3);
      return `+91 ${number.substring(0, 5)} ${number.substring(5)}`;
    }
    return phone;
  }

  // Format order number
  formatOrderNumber(orderNumber: string): string {
    // Add localized prefix if needed
    return orderNumber;
  }

  // Get localized error message
  getErrorMessage(error: any): string {
    if (typeof error === 'string') {
      return this.t(error) || error;
    }
    
    if (error.message) {
      return this.t(error.message) || error.message;
    }
    
    return this.t('error');
  }

  // Get time format preference
  getTimeFormat(): '12h' | '24h' {
    // Indian users typically prefer 12-hour format
    return '12h';
  }

  // Format time based on preference
  formatTime(date: Date): string {
    const format = this.getTimeFormat();
    
    if (format === '12h') {
      return date.toLocaleTimeString('en-IN', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } else {
      return date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    }
  }

  // Get localized day name
  getDayName(date: Date): string {
    const days = this.currentLanguage === 'ta' 
      ? ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி']
      : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    return days[date.getDay()];
  }

  // Get localized month name
  getMonthName(date: Date): string {
    const months = this.currentLanguage === 'ta'
      ? ['ஜனவரி', 'பிப்ரவரி', 'மார்ச்', 'ஏப்ரல்', 'மே', 'ஜூன்', 
         'ஜூலை', 'ஆகஸ்ட்', 'செப்டம்பர்', 'அக்டோபர்', 'நவம்பர்', 'டிசம்பர்']
      : ['January', 'February', 'March', 'April', 'May', 'June',
         'July', 'August', 'September', 'October', 'November', 'December'];
    
    return months[date.getMonth()];
  }
}

export default new LocalizationService();