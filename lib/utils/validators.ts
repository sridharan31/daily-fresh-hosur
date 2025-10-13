// app/utils/validators.ts
import { validationHelpers } from './helpers';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validators = {
  validateEmail: (email: string): ValidationResult => {
    const errors: string[] = [];
    
    if (!email) {
      errors.push('Email is required');
    } else if (!validationHelpers.isValidEmail(email)) {
      errors.push('Please enter a valid email address');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },
  
  validatePassword: (password: string): ValidationResult => {
    const errors: string[] = [];
    
    if (!password) {
      errors.push('Password is required');
    } else {
      if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
      }
      if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
      }
      if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
      }
      if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },
  
  validatePhone: (phone: string): ValidationResult => {
    const errors: string[] = [];
    
    if (!phone) {
      errors.push('Phone number is required');
    } else if (!validationHelpers.isValidPhoneUAE(phone)) {
      errors.push('Please enter a valid UAE phone number');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },
  
  validateName: (name: string, fieldName: string = 'Name'): ValidationResult => {
    const errors: string[] = [];
    
    if (!name || !name.trim()) {
      errors.push(`${fieldName} is required`);
    } else if (name.trim().length < 2) {
      errors.push(`${fieldName} must be at least 2 characters long`);
    } else if (name.trim().length > 50) {
      errors.push(`${fieldName} must be less than 50 characters`);
    } else if (!/^[a-zA-Z\s]+$/.test(name)) {
      errors.push(`${fieldName} must contain only letters and spaces`);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },
  
  validateAddress: (address: {
    street: string;
    area: string;
    city: string;
    pincode: string;
  }): ValidationResult => {
    const errors: string[] = [];
    
    if (!address.street || !address.street.trim()) {
      errors.push('Street address is required');
    }
    
    if (!address.area || !address.area.trim()) {
      errors.push('Area is required');
    }
    
    if (!address.city || !address.city.trim()) {
      errors.push('City is required');
    }
    
    if (!address.pincode || !address.pincode.trim()) {
      errors.push('PIN code is required');
    } else if (!validationHelpers.isValidPincode(address.pincode)) {
      errors.push('Please enter a valid UAE PIN code');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },
  
  validateCardNumber: (cardNumber: string): ValidationResult => {
    const errors: string[] = [];
    const cleaned = cardNumber.replace(/\s/g, '');
    
    if (!cleaned) {
      errors.push('Card number is required');
    } else if (!/^\d{13,19}$/.test(cleaned)) {
      errors.push('Please enter a valid card number');
    } else if (!luhnCheck(cleaned)) {
      errors.push('Please enter a valid card number');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },
  
  validateExpiryDate: (expiryDate: string): ValidationResult => {
    const errors: string[] = [];
    
    if (!expiryDate) {
      errors.push('Expiry date is required');
    } else if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
      errors.push('Please enter expiry date in MM/YY format');
    } else {
      const [month, year] = expiryDate.split('/');
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear() % 100;
      
      const expMonth = parseInt(month, 10);
      const expYear = parseInt(year, 10);
      
      if (expMonth < 1 || expMonth > 12) {
        errors.push('Please enter a valid month');
      } else if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
        errors.push('Card has expired');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },
  
  validateCVV: (cvv: string): ValidationResult => {
    const errors: string[] = [];
    
    if (!cvv) {
      errors.push('CVV is required');
    } else if (!/^\d{3,4}$/.test(cvv)) {
      errors.push('Please enter a valid CVV');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },
};

// Individual validator functions for easier use
export const validatePassword = (password: string): string | null => {
  const result = validators.validatePassword(password);
  return result.isValid ? null : result.errors[0];
};

export const validateConfirmPassword = (password: string, confirmPassword: string): string | null => {
  if (!confirmPassword) {
    return 'Please confirm your password';
  }
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  return null;
};

export const validateEmail = (email: string): string | null => {
  const result = validators.validateEmail(email);
  return result.isValid ? null : result.errors[0];
};

export const validatePhoneNumber = (phone: string): string | null => {
  const result = validators.validatePhone(phone);
  return result.isValid ? null : result.errors[0];
};

export const validateName = (name: string): string | null => {
  const result = validators.validateName(name);
  return result.isValid ? null : result.errors[0];
};

// Luhn algorithm for credit card validation
function luhnCheck(cardNumber: string): boolean {
  let sum = 0;
  let alternate = false;
  
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let n = parseInt(cardNumber.charAt(i), 10);
    
    if (alternate) {
      n *= 2;
      if (n > 9) {
        n = (n % 10) + 1;
      }
    }
    
    sum += n;
    alternate = !alternate;
  }
  
  return sum % 10 === 0;
}
