// Example components demonstrating all installed packages
export { default as PackageDemo } from './PackageDemo';
export { default as SimpleProfileExample } from './SimpleProfileExample';
export { default as UserProfileForm } from './UserProfileForm';

// Re-export for convenience
export { ProfileExample } from './ProfileExample';

/**
 * Package Implementation Examples
 * 
 * This directory contains comprehensive examples showing how to use
 * all the recently installed packages:
 * 
 * 1. NativeWind (Tailwind CSS for React Native)
 *    - Custom design system with colors, spacing, and typography
 *    - Responsive layouts and modern styling patterns
 *    - Example: ProfileExample.tsx (with TypeScript configuration)
 * 
 * 2. React Query (@tanstack/react-query)
 *    - Data fetching with caching and background updates
 *    - Mutation handling with optimistic updates
 *    - Example: useUserQueries.ts + SimpleProfileExample.tsx
 * 
 * 3. React Hook Form + Zod
 *    - Type-safe form validation and handling
 *    - Custom form fields with error states
 *    - Example: UserProfileForm.tsx
 * 
 * 4. React Native Vector Icons
 *    - Feather icon library integration
 *    - Consistent iconography across the app
 *    - Example: All components use Feather icons
 * 
 * 5. Expo Image Picker
 *    - Camera and gallery access with permissions
 *    - Image selection and preview functionality
 *    - Example: PackageDemo.tsx (Image tab)
 * 
 * 6. Expo Linear Gradient
 *    - Beautiful gradient backgrounds and effects
 *    - Enhanced visual design elements
 *    - Example: All components use gradient headers
 * 
 * 7. Zustand (State Management)
 *    - Lightweight state management alternative to Redux
 *    - Simple and performant global state
 *    - Ready for implementation
 * 
 * 8. Axios (HTTP Client)
 *    - Enhanced HTTP requests with interceptors
 *    - Better error handling and request/response transformation
 *    - Integrated with React Query for data fetching
 * 
 * Usage:
 * Import and use these components in your app to see the packages in action:
 * 
 * ```tsx
 * import { PackageDemo } from '@/src/components/examples';
 * 
 * export default function DemoScreen() {
 *   return <PackageDemo />;
 * }
 * ```
 */