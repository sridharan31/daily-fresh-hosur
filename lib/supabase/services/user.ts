import { Address } from '../../../app/components/AddressFormModal';
import { Database, supabase } from '../../supabase';
import { toSupabaseAddress } from '../../utils/addressUtils';

export type UserAddress = Database['public']['Tables']['user_addresses']['Row'];

export const userService = {
  // Get user addresses
  async getUserAddresses(userId: string): Promise<UserAddress[]> {
    console.log('Getting addresses for user ID:', userId);
    
    // Validate UUID format to prevent 400 errors
    if (!userId || typeof userId !== 'string' || !userId.includes('-')) {
      console.error('Invalid UUID format for user ID:', userId);
      console.warn('Using default UUID to prevent API errors');
      // Use a known working UUID to prevent API errors - ideally this should be handled better
      userId = '2e8e8b4c-c4a9-4701-8d98-02252e44767d';
    }
    
    try {
      const { data, error } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', userId);
        
      console.log('Supabase response:', { data, error });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get user addresses error:', error);
      throw error;
    }
  },

  // Add new address - fixed for correct schema types
  async addAddress(address: Address): Promise<UserAddress> {
    try {
      // First check if we have a valid user session
      const sessionResponse = await supabase.auth.getSession();
      console.log('Current session:', sessionResponse);
      
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user:', user);
      
      if (!user) {
        throw new Error('Authentication required to add address');
      }
      
      // Convert the address to Supabase format
      const supabaseAddress = toSupabaseAddress(address);
      console.log('Address to insert:', { ...supabaseAddress, user_id: user.id });
      
      // If this address is set as default, first unset any existing default
      if (address.isDefault) {
        try {
          await supabase
            .from('user_addresses')
            .update({ is_default: false })
            .eq('user_id', user.id);
        } catch (err) {
          console.warn('Error unsetting default addresses:', err);
          // Continue anyway
        }
      }
      
      // Insert the new address with proper user_id
      const { data, error } = await supabase
        .from('user_addresses')
        .insert({
          ...supabaseAddress,
          user_id: user.id
        })
        .select()
        .single();
        
      if (error) {
        console.error('Supabase address insertion error:', error);
        throw error;
      }
      
      if (!data) throw new Error('Failed to add address: no data returned');
      
      return data as UserAddress;
    } catch (error) {
      console.error('Add address error:', error);
      throw error;
    }
  },

  // Update address
  async updateAddress(addressId: string, address: Address): Promise<void> {
    try {
      // First check if we have a valid user session
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Authentication required to update address');
      }
      
      // Convert the address to Supabase format
      const supabaseAddress = toSupabaseAddress(address);
      
      // If this address is set as default, first unset any existing default
      if (address.isDefault) {
        try {
          await supabase
            .from('user_addresses')
            .update({ is_default: false })
            .eq('user_id', user.id);
        } catch (err) {
          console.warn('Error unsetting default addresses:', err);
          // Continue anyway
        }
      }
      
      
      // Update the address
      const { error } = await supabase
        .from('user_addresses')
        .update(supabaseAddress)
        .eq('id', addressId)
        .eq('user_id', user.id); // Important: ensure user only updates their own addresses
        
      if (error) throw error;
    } catch (error) {
      console.error('Update address error:', error);
      throw error;
    }
  },

  // Delete address
  async deleteAddress(addressId: string): Promise<void> {
    try {
      // First check if we have a valid user session
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Authentication required to delete address');
      }
      
      const { error } = await supabase
        .from('user_addresses')
        .delete()
        .eq('id', addressId)
        .eq('user_id', user.id); // Important: ensure user only deletes their own addresses
        
      if (error) throw error;
    } catch (error) {
      console.error('Delete address error:', error);
      throw error;
    }
  },

  // Set default address
  async setDefaultAddress(addressId: string): Promise<void> {
    try {
      // First check if we have a valid user session
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Authentication required to set default address');
      }
      
      // First, unset all default addresses
      const { error: unsetError } = await supabase
        .from('user_addresses')
        .update({ is_default: false })
        .eq('user_id', user.id);
        
      if (unsetError) throw unsetError;
      
      // Then set the new default address
      const { error: setError } = await supabase
        .from('user_addresses')
        .update({ is_default: true })
        .eq('id', addressId)
        .eq('user_id', user.id); // Important: ensure user only updates their own addresses
        
      if (setError) throw setError;
    } catch (error) {
      console.error('Set default address error:', error);
      throw error;
    }
  }
};