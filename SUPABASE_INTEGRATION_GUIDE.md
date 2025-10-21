# Supabase Integration Guide

This guide covers key aspects of working with Supabase in the Daily Fresh Hosur application.

## Core Services

### Authentication

The authentication system is fully implemented with Supabase Auth.

```typescript
// Sign up
const signUp = async (email, password, userData) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData // Additional user metadata
    }
  });
  
  if (error) throw error;
  return data;
};

// Sign in
const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) throw error;
  return data;
};

// Sign out
const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};
```

### Database Operations

Products, orders and user profiles are stored in Supabase tables.

```typescript
// Fetch products with filtering
const getProducts = async ({ category, search, sortBy, limit = 20 }) => {
  let query = supabase
    .from('products')
    .select('*');
  
  // Apply filters
  if (category) {
    query = query.eq('category_id', category);
  }
  
  if (search) {
    query = query.ilike('name', `%${search}%`);
  }
  
  // Apply sorting
  if (sortBy === 'price_asc') {
    query = query.order('price', { ascending: true });
  } else if (sortBy === 'price_desc') {
    query = query.order('price', { ascending: false });
  }
  
  const { data, error } = await query.limit(limit);
  if (error) throw error;
  return data;
};
```

## Real-time Features

The app uses Supabase's real-time subscriptions for cart updates.

```typescript
// Subscribe to cart changes
const subscribeToCart = (userId, onUpdate) => {
  const subscription = supabase
    .from(`cart_items:user_id=eq.${userId}`)
    .on('*', payload => {
      onUpdate(payload.new);
    })
    .subscribe();
  
  return () => {
    supabase.removeSubscription(subscription);
  };
};
```

## Storage

Product images and user avatars are stored in Supabase Storage.

```typescript
// Upload product image
const uploadProductImage = async (file, productId) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${productId}-${Date.now()}.${fileExt}`;
  const filePath = `product-images/${fileName}`;
  
  const { error } = await supabase.storage
    .from('product-images')
    .upload(filePath, file);
  
  if (error) throw error;
  
  const { data } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath);
  
  return data.publicUrl;
};
```

## Error Handling

```typescript
const handleSupabaseError = (error) => {
  // Log the error to monitoring service
  console.error('Supabase error:', error);
  
  // Translate common errors to user-friendly messages
  if (error.message.includes('User already registered')) {
    return 'This email is already registered.';
  }
  
  if (error.message.includes('Invalid login credentials')) {
    return 'Incorrect email or password.';
  }
  
  return 'Something went wrong. Please try again later.';
};
```

## Redux Integration

```typescript
// Auth slice example
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    session: null,
    isLoading: false,
    error: null
  },
  reducers: {
    // ...reducers
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.session = action.payload.session;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  }
});
```