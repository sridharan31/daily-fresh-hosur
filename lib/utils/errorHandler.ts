import { Alert } from 'react-native';

export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
}

export class ErrorHandler {
  private static instance: ErrorHandler;

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  // Handle API errors
  handleApiError(error: any): AppError {
    let appError: AppError = {
      code: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred',
      timestamp: Date.now(),
    };

    if (error.response) {
      // Server responded with error
      const { status, data } = error.response;
      appError = {
        code: `HTTP_${status}`,
        message: data?.message || this.getHttpErrorMessage(status),
        details: data,
        timestamp: Date.now(),
      };
    } else if (error.request) {
      // Network error
      appError = {
        code: 'NETWORK_ERROR',
        message: 'Network connection failed. Please check your internet connection.',
        timestamp: Date.now(),
      };
    } else if (error.message) {
      // Other errors
      appError = {
        code: 'CLIENT_ERROR',
        message: error.message,
        timestamp: Date.now(),
      };
    }

    return appError;
  }

  // Handle validation errors
  handleValidationError(field: string, value: any): AppError | null {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return {
        code: 'VALIDATION_ERROR',
        message: `${field} is required`,
        timestamp: Date.now(),
      };
    }
    return null;
  }

  // Handle form validation
  validateForm(formData: Record<string, any>, rules: Record<string, any>): AppError[] {
    const errors: AppError[] = [];

    Object.keys(rules).forEach(field => {
      const rule = rules[field];
      const value = formData[field];

      if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
        errors.push({
          code: 'VALIDATION_ERROR',
          message: `${rule.label || field} is required`,
          details: { field },
          timestamp: Date.now(),
        });
      }

      if (value && rule.minLength && value.length < rule.minLength) {
        errors.push({
          code: 'VALIDATION_ERROR',
          message: `${rule.label || field} must be at least ${rule.minLength} characters`,
          details: { field },
          timestamp: Date.now(),
        });
      }

      if (value && rule.maxLength && value.length > rule.maxLength) {
        errors.push({
          code: 'VALIDATION_ERROR',
          message: `${rule.label || field} must not exceed ${rule.maxLength} characters`,
          details: { field },
          timestamp: Date.now(),
        });
      }

      if (value && rule.pattern && !rule.pattern.test(value)) {
        errors.push({
          code: 'VALIDATION_ERROR',
          message: `${rule.label || field} format is invalid`,
          details: { field },
          timestamp: Date.now(),
        });
      }

      if (value && rule.min && Number(value) < rule.min) {
        errors.push({
          code: 'VALIDATION_ERROR',
          message: `${rule.label || field} must be at least ${rule.min}`,
          details: { field },
          timestamp: Date.now(),
        });
      }

      if (value && rule.max && Number(value) > rule.max) {
        errors.push({
          code: 'VALIDATION_ERROR',
          message: `${rule.label || field} must not exceed ${rule.max}`,
          details: { field },
          timestamp: Date.now(),
        });
      }
    });

    return errors;
  }

  // Show error alert
  showError(error: AppError, title: string = 'Error'): void {
    Alert.alert(title, error.message);
  }

  // Show validation errors
  showValidationErrors(errors: AppError[]): void {
    if (errors.length === 1) {
      Alert.alert('Validation Error', errors[0].message);
    } else if (errors.length > 1) {
      const message = errors.map(error => `• ${error.message}`).join('\n');
      Alert.alert('Validation Errors', message);
    }
  }

  // Log error for debugging
  logError(error: AppError, context?: string): void {
    if (__DEV__) {
      console.group(`🚨 Error${context ? ` in ${context}` : ''}`);
      console.error('Code:', error.code);
      console.error('Message:', error.message);
      console.error('Timestamp:', new Date(error.timestamp).toISOString());
      if (error.details) {
        console.error('Details:', error.details);
      }
      console.groupEnd();
    }
  }

  // Get HTTP error message
  private getHttpErrorMessage(status: number): string {
    switch (status) {
      case 400:
        return 'Bad request. Please check your input.';
      case 401:
        return 'Unauthorized. Please log in again.';
      case 403:
        return 'Access denied. You do not have permission.';
      case 404:
        return 'Resource not found.';
      case 409:
        return 'Conflict. Resource already exists.';
      case 422:
        return 'Invalid data provided.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Server error. Please try again later.';
      case 502:
        return 'Bad gateway. Service temporarily unavailable.';
      case 503:
        return 'Service unavailable. Please try again later.';
      case 504:
        return 'Gateway timeout. Request took too long.';
      default:
        return 'An unexpected error occurred.';
    }
  }
}

// Validation rules for common use cases
export const ValidationRules = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address',
  },
  phone: {
    pattern: /^[0-9]{10}$/,
    message: 'Please enter a valid 10-digit phone number',
  },
  pincode: {
    pattern: /^[0-9]{6}$/,
    message: 'Please enter a valid 6-digit pincode',
  },
  price: {
    pattern: /^[0-9]+(\.[0-9]{1,2})?$/,
    message: 'Please enter a valid price',
  },
  password: {
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    message: 'Password must contain at least 8 characters with uppercase, lowercase, number and special character',
  },
};

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();

// Helper functions
export const handleAsyncError = async <T>(
  asyncFn: () => Promise<T>,
  context?: string
): Promise<{ data?: T; error?: AppError }> => {
  try {
    const data = await asyncFn();
    return { data };
  } catch (error) {
    const appError = errorHandler.handleApiError(error);
    if (context) {
      errorHandler.logError(appError, context);
    }
    return { error: appError };
  }
};

export const showErrorAlert = (error: any, title?: string) => {
  const appError = errorHandler.handleApiError(error);
  errorHandler.showError(appError, title);
};

export const validateAndShowErrors = (
  formData: Record<string, any>,
  rules: Record<string, any>
): boolean => {
  const errors = errorHandler.validateForm(formData, rules);
  if (errors.length > 0) {
    errorHandler.showValidationErrors(errors);
    return false;
  }
  return true;
};

