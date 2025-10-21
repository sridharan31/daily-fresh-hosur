import { createAsyncThunk } from '@reduxjs/toolkit';
import { AdminUserWithRole } from '../../../types/adminRoles';
import AdminUserManagementService from '../../services/adminUserManagementService';

export const fetchAdminUsers = createAsyncThunk(
  'admin/fetchAdminUsers',
  async (_, { rejectWithValue }) => {
    try {
      return await AdminUserManagementService.getAdminUsers();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAdminRoles = createAsyncThunk(
  'admin/fetchAdminRoles',
  async (_, { rejectWithValue }) => {
    try {
      return AdminUserManagementService.getAdminRoles();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createAdminUser = createAsyncThunk(
  'admin/createAdminUser',
  async (userData: {
    email: string;
    firstName: string;
    lastName: string;
    roleId: string;
    isActive: boolean;
  }, { rejectWithValue }) => {
    try {
      return await AdminUserManagementService.createAdminUser(userData);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateAdminUser = createAsyncThunk(
  'admin/updateAdminUser',
  async ({ 
    userId, 
    userData 
  }: { 
    userId: string; 
    userData: {
      firstName?: string;
      lastName?: string;
      roleId?: string;
      isActive?: boolean;
    } 
  }, { rejectWithValue }) => {
    try {
      return await AdminUserManagementService.updateAdminUser(userId, userData);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteAdminUser = createAsyncThunk(
  'admin/deleteAdminUser',
  async (userId: string, { rejectWithValue }) => {
    try {
      await AdminUserManagementService.deleteAdminUser(userId);
      return userId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Set current admin user - this would be called when an admin logs in
export const setCurrentAdminUser = createAsyncThunk(
  'admin/setCurrentAdminUser',
  async (userId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { admin: { adminUsers: AdminUserWithRole[] } };
      const user = state.admin.adminUsers.find(u => u.id === userId);
      
      if (!user) {
        // If user not found in state, fetch from service
        const allUsers = await AdminUserManagementService.getAdminUsers();
        const targetUser = allUsers.find(u => u.id === userId);
        if (!targetUser) {
          throw new Error('Admin user not found');
        }
        return targetUser;
      }
      
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);