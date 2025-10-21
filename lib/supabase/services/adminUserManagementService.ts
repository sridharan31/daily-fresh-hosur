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
      // In a real implementation, we would fetch users from Supabase
      // For now, return mock data
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

      // For now, return mock data since we don't have actual data in Supabase yet
      return this.getMockAdminUsers();
    } catch (error) {
      console.error('Error fetching admin users:', error);
      return this.getMockAdminUsers();
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
      // In a real implementation, we would create the user in Supabase Auth
      // and then create a record in our admin_users table

      // Step 1: Create the user in Supabase Auth (mock)
      const authUser = {
        id: Math.random().toString(36).substring(2, 11),
      };

      // Step 2: Create the admin_users record
      const { data, error } = await supabase
        .from('admin_users')
        .insert([
          {
            id: authUser.id,
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

      // For now, return a mock user
      const role = ADMIN_ROLES.find(r => r.id === userData.roleId) as AdminRole;

      return {
        id: authUser.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role,
        isActive: userData.isActive,
        lastLogin: null,
        createdAt: new Date().toISOString(),
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
      // In a real implementation, we would update the user in Supabase
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

      // For now, return a mock updated user
      const mockUsers = this.getMockAdminUsers();
      const existingUser = mockUsers.find(u => u.id === userId);

      if (!existingUser) {
        throw new Error('User not found');
      }

      const role = userData.roleId 
        ? ADMIN_ROLES.find(r => r.id === userData.roleId) as AdminRole 
        : existingUser.role;

      return {
        ...existingUser,
        firstName: userData.firstName ?? existingUser.firstName,
        lastName: userData.lastName ?? existingUser.lastName,
        role,
        isActive: userData.isActive ?? existingUser.isActive,
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

  /**
   * Gets mock admin users for development
   * @returns An array of mock admin users
   */
  private static getMockAdminUsers(): AdminUserWithRole[] {
    return [
      {
        id: '1',
        email: 'admin@dailyfreshhosur.com',
        firstName: 'Admin',
        lastName: 'User',
        role: ADMIN_ROLES.find(role => role.type === 'super_admin') as AdminRole,
        isActive: true,
        lastLogin: '2025-10-15T08:30:00.000Z',
        createdAt: '2025-01-01T00:00:00.000Z',
      },
      {
        id: '2',
        email: 'manager@dailyfreshhosur.com',
        firstName: 'Store',
        lastName: 'Manager',
        role: ADMIN_ROLES.find(role => role.type === 'manager') as AdminRole,
        isActive: true,
        lastLogin: '2025-10-17T14:45:00.000Z',
        createdAt: '2025-03-15T00:00:00.000Z',
      },
      {
        id: '3',
        email: 'content@dailyfreshhosur.com',
        firstName: 'Content',
        lastName: 'Editor',
        role: ADMIN_ROLES.find(role => role.type === 'content_editor') as AdminRole,
        isActive: true,
        lastLogin: '2025-10-16T11:20:00.000Z',
        createdAt: '2025-05-10T00:00:00.000Z',
      },
      {
        id: '4',
        email: 'sales@dailyfreshhosur.com',
        firstName: 'Sales',
        lastName: 'Representative',
        role: ADMIN_ROLES.find(role => role.type === 'sales_agent') as AdminRole,
        isActive: false,
        lastLogin: '2025-09-28T09:15:00.000Z',
        createdAt: '2025-06-20T00:00:00.000Z',
      },
      {
        id: '5',
        email: 'support@dailyfreshhosur.com',
        firstName: 'Customer',
        lastName: 'Support',
        role: ADMIN_ROLES.find(role => role.type === 'support_staff') as AdminRole,
        isActive: true,
        lastLogin: '2025-10-18T10:05:00.000Z',
        createdAt: '2025-07-05T00:00:00.000Z',
      },
    ];
  }
}