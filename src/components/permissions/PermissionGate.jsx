import { usePermissions } from '@/hooks/usePermissions';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

/**
 * Component to conditionally render children based on permissions.
 * 
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to show if permission is granted
 * @param {string} [props.permission] - Single permission required
 * @param {string[]} [props.permissions] - Multiple permissions required
 * @param {boolean} [props.anyPermission=false] - If true, grant access if any of the permissions match
 * @param {string} [props.role] - Single role required
 * @param {string[]} [props.roles] - Multiple roles required
 * @param {boolean} [props.requireAdmin=false] - If true, requires admin role
 * @param {React.ReactNode} [props.fallback=null] - Content to show if permission is denied
 * @param {boolean} [props.showMessage=true] - Whether to show a lock icon/message or nothing
 */
export default function PermissionGate({
  children,
  permission,
  permissions = [],
  anyPermission = false,
  role,
  roles = [],
  requireAdmin = false,
  fallback = null,
  showMessage = true
}) {
  const { t } = useLanguage();
  const { hasPermission, hasAnyPermission, hasAllPermissions, isAdmin, user } = usePermissions();

  // Admin check
  if (requireAdmin && !isAdmin) {
    return fallback || (showMessage ? (
      <Alert className="max-w-md">
        <Lock className="h-4 w-4" />
        <AlertDescription>
          {t({ en: 'Admin access required', ar: 'مطلوب وصول المسؤول' })}
        </AlertDescription>
      </Alert>
    ) : null);
  }

  // Role check
  if (role || roles.length > 0) {
    const requiredRoles = role ? [role] : roles;
    const userRoleIds = user?.assigned_roles || [];
    const hasRequiredRole = requiredRoles.some(r => userRoleIds.includes(r));

    if (!hasRequiredRole) {
      return fallback || (showMessage ? (
        <Alert className="max-w-md">
          <Lock className="h-4 w-4" />
          <AlertDescription>
            {t({ en: 'Required role not assigned', ar: 'الدور المطلوب غير معين' })}
          </AlertDescription>
        </Alert>
      ) : null);
    }
  }

  // Permission check
  const requiredPermissions = permission ? [permission] : permissions;

  if (requiredPermissions.length > 0) {
    const hasAccess = anyPermission
      ? hasAnyPermission(requiredPermissions)
      : hasAllPermissions(requiredPermissions);

    if (!hasAccess) {
      return fallback || (showMessage ? (
        <Alert className="max-w-md">
          <Lock className="h-4 w-4" />
          <AlertDescription>
            {t({ en: 'Insufficient permissions', ar: 'صلاحيات غير كافية' })}
          </AlertDescription>
        </Alert>
      ) : null);
    }
  }

  return <>{children}</>;
}
