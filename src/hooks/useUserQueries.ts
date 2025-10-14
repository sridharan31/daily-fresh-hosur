import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { supabase } from '../../lib/supabase';
import authService from '../../lib/services/api/authService';
import { ApiResponse } from '../../lib/types/api';
import { User } from '../../lib/types/auth';

// Query keys
export const userQueryKeys = {
  all: ['users'] as const,
  profile: () => [...userQueryKeys.all, 'profile'] as const,
  orders: () => [...userQueryKeys.all, 'orders'] as const,
  addresses: () => [...userQueryKeys.all, 'addresses'] as const,
};

// Custom hook for user profile with React Query
export const useUserProfile = () => {
  return useQuery({
    queryKey: userQueryKeys.profile(),
    queryFn: async (): Promise<User> => {
      // Use Supabase auth + profiles table
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (authErr) throw authErr;

      if (!user?.id) throw new Error('Not authenticated');

      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        // If profile missing, return basic auth user info
        return { id: user.id, email: user.email ?? '', firstName: user.user_metadata?.firstName ?? '', lastName: user.user_metadata?.lastName ?? '' } as unknown as User;
      }

      return profile as User;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (cache time)
  });
};

// Custom hook for updating user profile
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: Partial<User>): Promise<User> => {
      const response: ApiResponse<User> = await authService.updateProfile(userData);
      return response.data!;
    },
    onSuccess: (updatedUser) => {
      // Update the profile cache
      queryClient.setQueryData(userQueryKeys.profile(), updatedUser);
      
      // Invalidate related queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
    },
    onError: (error) => {
      console.error('Profile update failed:', error);
    },
  });
};

// Custom hook for user orders
export const useUserOrders = (enabled: boolean = true) => {
  return useQuery({
    queryKey: userQueryKeys.orders(),
    queryFn: async () => {
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (authErr) throw authErr;
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled, // Only fetch when enabled
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Custom hook for user addresses
export const useUserAddresses = () => {
  return useQuery({
    queryKey: userQueryKeys.addresses(),
    queryFn: async () => {
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (authErr) throw authErr;
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_primary', { ascending: false });

      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Custom hook for prefetching data
export const usePrefetchUserData = () => {
  const queryClient = useQueryClient();

  const prefetchProfile = () => {
    queryClient.prefetchQuery({
      queryKey: userQueryKeys.profile(),
      queryFn: async (): Promise<User> => {
        const response = await fetch('/api/auth/me');
        return response.json();
      },
      staleTime: 5 * 60 * 1000,
    });
  };

  const prefetchOrders = () => {
    queryClient.prefetchQuery({
      queryKey: userQueryKeys.orders(),
      queryFn: async () => {
        const response = await fetch('/api/user/orders');
        return response.json();
      },
      staleTime: 2 * 60 * 1000,
    });
  };

  return { prefetchProfile, prefetchOrders };
};

export default {
  useUserProfile,
  useUpdateProfile,
  useUserOrders,
  useUserAddresses,
  usePrefetchUserData,
};