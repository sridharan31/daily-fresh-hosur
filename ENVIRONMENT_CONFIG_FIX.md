# Environment Configuration Guide

## Overview

This document addresses the error:
```
Cannot read properties of undefined (reading 'EXPO_PUBLIC_SUPABASE_URL')
```

This error occurs because the application is trying to access environment variables that aren't properly loaded when bundling for web.

## Solution

We've implemented a two-part solution to handle Supabase environment variables:

### 1. Direct Hardcoding in Supabase Client

We modified `lib/supabase/client.ts` to directly use the Supabase URL and anonymous key:

```typescript
// Use hardcoded values for Supabase connection
const supabaseUrl = 'https://yvjxgoxrzkcjvuptblri.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2anhnb3hyemtjanZ1cHRibHJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNTA1ODAsImV4cCI6MjA3NTgyNjU4MH0.uEuXA4gBDoK8ARKJ_CA6RFgd8sVA1OZ763BD-lUmplk';
```

This ensures that even if environment variables aren't loaded, the application can still connect to Supabase.

### 2. App.config.js for Production

For a more maintainable approach in production, we've also set up `app.config.js`:

```javascript
// app.config.js
const path = require('path');
const dotenv = require('dotenv');

// Load .env file
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Get values from .env file or use defaults
const EXPO_PUBLIC_SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://yvjxgoxrzkcjvuptblri.supabase.co';
const EXPO_PUBLIC_SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2anhnb3hyemtjanZ1cHRibHJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNTA1ODAsImV4cCI6MjA3NTgyNjU4MH0.uEuXA4gBDoK8ARKJ_CA6RFgd8sVA1OZ763BD-lUmplk';

module.exports = ({ config }) => {
  return {
    ...config,
    extra: {
      ...config.extra,
      EXPO_PUBLIC_SUPABASE_URL,
      EXPO_PUBLIC_SUPABASE_ANON_KEY,
    },
  };
};
```

## Required Dependencies

To make this solution work, we installed the `dotenv` package:

```bash
npm install dotenv --save
```

## Security Considerations

For production deployment, consider:

1. Using different Supabase projects for development and production
2. Implementing a secure method for managing environment variables
3. Never committing real production keys to the repository

## Testing

After implementing these changes, the application should bundle correctly for web without any "Cannot read properties of undefined" errors related to environment variables.