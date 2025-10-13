import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

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
      // This would need to be implemented in your API
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer TOKEN_HERE`,
        },
      });
      return response.json();
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
      // Replace with actual order service call
      const response = await fetch('/api/user/orders');
      return response.json();
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
      // Replace with actual address service call
      const response = await fetch('/api/user/addresses');
      return response.json();
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