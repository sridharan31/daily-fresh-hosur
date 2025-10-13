// Authentication components with Zod validation and error handling
export { default as LoginForm } from './LoginForm';
export { default as RegisterForm } from './RegisterForm';

/**
 * Authentication Components
 * 
 * This directory contains comprehensive authentication forms with:
 * 
 * 1. Zod Schema Validation
 *    - Type-safe form validation
 *    - Custom validation rules
 *    - Real-time field validation
 * 
 * 2. Comprehensive Error Handling
 *    - API response errors (400, 401, 403, 409, 429, 500+)
 *    - Network errors and timeouts
 *    - Field-specific error display
 *    - Global error messages
 * 
 * 3. Modern UI Design
 *    - Gradient backgrounds and buttons
 *    - Vector icons integration
 *    - Loading states and animations
 *    - Responsive design
 *    - Accessibility support
 * 
 * 4. React Hook Form Integration
 *    - Optimized form performance
 *    - Real-time validation
 *    - Form state management
 *    - Custom field controllers
 * 
 * 5. Security Features
 *    - Password strength indicator
 *    - Input sanitization
 *    - Rate limiting handling
 *    - Secure text entry
 * 
 * Usage Examples:
 * 
 * ```tsx
 * import { LoginForm, RegisterForm } from '@/src/components/auth';
 * 
 * // In your authentication screen
 * export default function AuthScreen() {
 *   const [isLogin, setIsLogin] = useState(true);
 *   
 *   return isLogin ? <LoginForm /> : <RegisterForm />;
 * }
 * ```
 * 
 * Error Handling:
 * - Displays field-specific errors from Zod validation
 * - Shows API errors with appropriate messages
 * - Handles network connectivity issues
 * - Provides user-friendly error recovery options
 * 
 * API Integration:
 * - Compatible with backend auth endpoints
 * - Proper request/response handling
 * - Token management ready
 * - User data persistence support
 */