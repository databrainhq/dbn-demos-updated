import React from 'react';
import { User } from '../types/user';

interface PermissionGateProps {
  user: User;
  permission?: string;
  role?: string;
  roles?: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const PermissionGate: React.FC<PermissionGateProps> = ({
  user,
  permission,
  role,
  roles,
  children,
  fallback = null
}) => {
  // Check permission if specified
  const hasPermission = permission ? user.permissions.some(
    p => p.id === permission && p.enabled
  ) : true;

  // Check role if specified
  const hasRole = role ? user.role === role : true;

  // Check roles array if specified
  const hasAnyRole = roles ? roles.includes(user.role) : true;

  // User must satisfy all specified conditions
  const hasAccess = hasPermission && hasRole && hasAnyRole;

  if (hasAccess) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

export default PermissionGate;

