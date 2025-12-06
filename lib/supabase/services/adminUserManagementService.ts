import { ADMIN_ROLES, AdminRole, AdminUserWithRole } from '../../types/adminRoles';
import { supabase } from '../supabaseClient';

/**
 * Service for managing admin users and roles in the Supabase backend
 */
export default class AdminUserManagementService {
  /**
   * Fetches all admin users with their roles
   * @returns A promise that resolves to an array of admin users with their roles
   */
  static async getAdminUsers(): Promise<AdminUserWithRole[]> {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select(`
          id,
          email,
          first_name,
          last_name,
          is_active,
          last_login,
          created_at,
          role_id
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      if (!data || data.length === 0) {
        console.warn('No admin users found in database');
        return [];
      }

      // Transform database records to AdminUserWithRole format
      return data.map(user => {
        const role = ADMIN_ROLES.find(r => r.id === user.role_id) as AdminRole;
        
        if (!role) {
          console.warn(`Unknown role_id: ${user.role_id} for user ${user.email}`);
        }

        return {
          id: user.id,
          email: user.email,
          firstName: user.first_name || '',
          lastName: user.last_name || '',
          role: role || ADMIN_ROLES.find(r => r.type === 'manager') as AdminRole, // Fallback to manager role
          isActive: user.is_active,
          lastLogin: user.last_login,
          createdAt: user.created_at,
        };
      });
    } catch (error) {
      console.error('Error fetching admin users:', error);
      throw error;
    }
  }

  /**
   * Creates a new admin user
   * @param userData The user data to create
   * @returns A promise that resolves to the created user
   */
  static async createAdminUser(userData: {
    email: string;
    firstName: string;
    lastName: string;
    roleId: string;
    isActive: boolean;
  }): Promise<AdminUserWithRole> {
    try {
      // Note: In a production environment, you would first create the user in Supabase Auth
      // using the Admin API. For now, we assume the auth user already exists.
      
      // Create a temporary ID for demonstration (in production, use actual auth user ID)
      const tempUserId = Math.random().toString(36).substring(2, 11);

      // Create the admin_users record
      const { data, error } = await supabase
        .from('admin_users')
        .insert([
          {
            id: tempUserId, // In production, use actual auth.users.id
            email: userData.email,
            first_name: userData.firstName,
            last_name: userData.lastName,
            role_id: userData.roleId,
            is_active: userData.isActive,
            created_at: new Date().toISOString(),
          }
        ])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error('Failed to create admin user');
      }

      const role = ADMIN_ROLES.find(r => r.id === userData.roleId) as AdminRole;

      return {
        id: data.id,
        email: data.email,
        firstName: data.first_name || '',
        lastName: data.last_name || '',
        role: role || ADMIN_ROLES.find(r => r.type === 'manager') as AdminRole,
        isActive: data.is_active,
        lastLogin: data.last_login,
        createdAt: data.created_at,
      };
    } catch (error) {
      console.error('Error creating admin user:', error);
      throw error;
    }
  }

  /**
   * Updates an existing admin user
   * @param userId The ID of the user to update
   * @param userData The updated user data
   * @returns A promise that resolves to the updated user
   */
  static async updateAdminUser(
    userId: string,
    userData: {
      firstName?: string;
      lastName?: string;
      roleId?: string;
      isActive?: boolean;
    }
  ): Promise<AdminUserWithRole> {
    try {
      const updateData: any = {};
      if (userData.firstName !== undefined) updateData.first_name = userData.firstName;
      if (userData.lastName !== undefined) updateData.last_name = userData.lastName;
      if (userData.roleId !== undefined) updateData.role_id = userData.roleId;
      if (userData.isActive !== undefined) updateData.is_active = userData.isActive;

      const { data, error } = await supabase
        .from('admin_users')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error('User not found');
      }

      const role = ADMIN_ROLES.find(r => r.id === data.role_id) as AdminRole;

      return {
        id: data.id,
        email: data.email,
        firstName: data.first_name || '',
        lastName: data.last_name || '',
        role: role || ADMIN_ROLES.find(r => r.type === 'manager') as AdminRole,
        isActive: data.is_active,
        lastLogin: data.last_login,
        createdAt: data.created_at,
      };
    } catch (error) {
      console.error('Error updating admin user:', error);
      throw error;
    }
  }

  /**
   * Deletes an admin user
   * @param userId The ID of the user to delete
   * @returns A promise that resolves when the user is deleted
   */
  static async deleteAdminUser(userId: string): Promise<void> {
    try {
      // In a real implementation, we would delete the user from Supabase
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', userId);

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error deleting admin user:', error);
      throw error;
    }
  }

  /**
   * Gets admin roles
   * @returns The list of available admin roles
   */
  static getAdminRoles(): AdminRole[] {
    return ADMIN_ROLES;
  }

}
