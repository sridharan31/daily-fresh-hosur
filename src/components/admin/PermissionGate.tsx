import React from 'react';
import { AdminUserWithRole, hasPermission } from '../../../lib/types/adminRoles';

interface PermissionGateProps {
  user: AdminUserWithRole;
  permission: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * A component that conditionally renders its children based on whether
 * the specified user has the required permission.
 * 
 * @example
 * <PermissionGate user={currentUser} permission="products_manage">
 *   <EditProductButton />
 * </PermissionGate>
 * 
 * @example
 * <PermissionGate 
 *   user={currentUser} 
 *   permission="orders_view"
 *   fallback={<AccessDeniedMessage />}
 * >
 *   <OrderDetails />
 * </PermissionGate>
 */
const PermissionGate: React.FC<PermissionGateProps> = ({ 
  user, 
  permission, 
  fallback = null, 
  children 
}) => {
  // Check if the user has the required permission
  if (hasPermission(user, permission)) {
    return <>{children}</>;
  }
  
  // Return fallback or null if no fallback is provided
  return <>{fallback}</>;
};

export default PermissionGate;