// User role and permission types
export type AdminRoleType = 'super_admin' | 'admin' | 'manager' | 'content_editor' | 'sales_agent' | 'support_staff';

export interface AdminPermission {
  id: string;
  name: string;
  description: string;
  key: string;
}

export interface AdminRole {
  id: string;
  name: string;
  description: string;
  type: AdminRoleType;
  permissions: string[]; // Permission keys
}

export interface AdminUserWithRole {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: AdminRole;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
}

// Permission definitions
export const ADMIN_PERMISSIONS: AdminPermission[] = [
  // Dashboard permissions
  {
    id: 'dashboard_view',
    name: 'View Dashboard',
    description: 'Can view the basic dashboard statistics',
    key: 'dashboard_view',
  },
  {
    id: 'dashboard_advanced',
    name: 'View Advanced Dashboard',
    description: 'Can access advanced analytics and reporting',
    key: 'dashboard_advanced',
  },
  
  // Product permissions
  {
    id: 'products_view',
    name: 'View Products',
    description: 'Can view product catalog',
    key: 'products_view',
  },
  {
    id: 'products_create',
    name: 'Create Products',
    description: 'Can add new products',
    key: 'products_create',
  },
  {
    id: 'products_edit',
    name: 'Edit Products',
    description: 'Can modify existing products',
    key: 'products_edit',
  },
  {
    id: 'products_delete',
    name: 'Delete Products',
    description: 'Can remove products',
    key: 'products_delete',
  },
  
  // Category permissions
  {
    id: 'categories_manage',
    name: 'Manage Categories',
    description: 'Can create, edit and delete product categories',
    key: 'categories_manage',
  },
  
  // Order permissions
  {
    id: 'orders_view',
    name: 'View Orders',
    description: 'Can view customer orders',
    key: 'orders_view',
  },
  {
    id: 'orders_process',
    name: 'Process Orders',
    description: 'Can update order status and details',
    key: 'orders_process',
  },
  {
    id: 'orders_refund',
    name: 'Issue Refunds',
    description: 'Can issue refunds for orders',
    key: 'orders_refund',
  },
  
  // Customer permissions
  {
    id: 'customers_view',
    name: 'View Customers',
    description: 'Can view customer profiles',
    key: 'customers_view',
  },
  {
    id: 'customers_edit',
    name: 'Edit Customers',
    description: 'Can edit customer information',
    key: 'customers_edit',
  },
  
  // User permissions
  {
    id: 'users_view',
    name: 'View Users',
    description: 'Can view admin users',
    key: 'users_view',
  },
  {
    id: 'users_manage',
    name: 'Manage Users',
    description: 'Can create, edit and delete admin users',
    key: 'users_manage',
  },
  
  // Settings permissions
  {
    id: 'settings_view',
    name: 'View Settings',
    description: 'Can view store settings',
    key: 'settings_view',
  },
  {
    id: 'settings_edit',
    name: 'Edit Settings',
    description: 'Can modify store settings',
    key: 'settings_edit',
  },
];

// Predefined roles with their respective permissions
export const ADMIN_ROLES: AdminRole[] = [
  {
    id: 'super_admin',
    name: 'Super Admin',
    description: 'Has full access to all features',
    type: 'super_admin',
    permissions: ADMIN_PERMISSIONS.map(p => p.key),
  },
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Can access most features except critical system settings',
    type: 'admin',
    permissions: [
      'dashboard_view', 'dashboard_advanced',
      'products_view', 'products_create', 'products_edit', 'products_delete',
      'categories_manage',
      'orders_view', 'orders_process', 'orders_refund',
      'customers_view', 'customers_edit',
      'users_view',
      'settings_view',
    ],
  },
  {
    id: 'manager',
    name: 'Store Manager',
    description: 'Can manage products, orders and customers',
    type: 'manager',
    permissions: [
      'dashboard_view',
      'products_view', 'products_create', 'products_edit',
      'categories_manage',
      'orders_view', 'orders_process',
      'customers_view',
      'settings_view',
    ],
  },
  {
    id: 'content_editor',
    name: 'Content Editor',
    description: 'Can manage products and categories only',
    type: 'content_editor',
    permissions: [
      'dashboard_view',
      'products_view', 'products_create', 'products_edit',
      'categories_manage',
    ],
  },
  {
    id: 'sales_agent',
    name: 'Sales Agent',
    description: 'Can view and process orders',
    type: 'sales_agent',
    permissions: [
      'dashboard_view',
      'products_view',
      'orders_view', 'orders_process',
      'customers_view',
    ],
  },
  {
    id: 'support_staff',
    name: 'Support Staff',
    description: 'Can view orders and assist customers',
    type: 'support_staff',
    permissions: [
      'dashboard_view',
      'products_view',
      'orders_view',
      'customers_view',
    ],
  },
];

// Helper function to check if user has permission
export const hasPermission = (user: AdminUserWithRole, permissionKey: string): boolean => {
  if (!user || !user.role) {
    return false;
  }
  
  // Super admin has all permissions
  if (user.role.type === 'super_admin') {
    return true;
  }
  
  return user.role.permissions.includes(permissionKey);
};

// Helper function to get permissions by role
export const getPermissionsByRole = (roleType: AdminRoleType): string[] => {
  const role = ADMIN_ROLES.find(r => r.type === roleType);
  return role ? role.permissions : [];
};