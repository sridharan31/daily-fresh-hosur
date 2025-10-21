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
      eas: {
        projectId: "your-project-id"
      }
    },
    // Make environment variables available to the app
    extra: {
      EXPO_PUBLIC_SUPABASE_URL,
      EXPO_PUBLIC_SUPABASE_ANON_KEY,
    },
    // Make environment variables available to the app at build time
    plugins: [
      ...config.plugins || [],
    ],
  };
};