import { useAuth } from '@/hooks/useAuth';

interface PermissionGateProps {
  allowedRoles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGate({
  allowedRoles,
  children,
  fallback = null,
}: PermissionGateProps) {
  const user = useAuth((state) => state.user);
  if (!user || !allowedRoles.includes(user.role)) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
}
