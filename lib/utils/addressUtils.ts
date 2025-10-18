// lib/utils/addressUtils.ts
import { Address } from '../../app/components/AddressFormModal';
import { Database } from '../supabase';

export type UserAddress = Database['public']['Tables']['user_addresses']['Row'];

/**
 * Convert from frontend Address format to Supabase user_addresses format
 */
export const toSupabaseAddress = (address: Address): Omit<Database['public']['Tables']['user_addresses']['Insert'], 'user_id'> => {
  return {
    title: getAddressTitle(address.type),
    address_line_1: address.street,
    address_line_2: address.landmark || null,
    city: address.city,
    state: address.state,
    pincode: address.pincode,
    landmark: address.landmark || null,
    is_default: address.isDefault || false
  };
};

/**
 * Convert from Supabase user_addresses format to frontend Address format
 */
export const fromSupabaseAddress = (address: UserAddress, userName: string = ''): Address => {
  return {
    id: address.id,
    name: userName || address.title,
    phone: '', // Phone is stored in user profile, not in address
    street: address.address_line_1,
    city: address.city,
    state: address.state,
    pincode: address.pincode,
    type: getAddressType(address.title),
    landmark: address.landmark || undefined,
    isDefault: address.is_default
  };
};

/**
 * Get address title from type
 */
function getAddressTitle(type: 'home' | 'work' | 'other'): string {
  switch (type) {
    case 'home': return 'Home';
    case 'work': return 'Work';
    case 'other': return 'Other';
    default: return 'Home';
  }
}

/**
 * Get address type from title
 */
function getAddressType(title: string): 'home' | 'work' | 'other' {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('home')) return 'home';
  if (lowerTitle.includes('work') || lowerTitle.includes('office')) return 'work';
  return 'other';
}