import { usePermissions } from '@/hooks/usePermissions';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

/**
 * HOC to protect pages with permission checks
 * Usage: export default ProtectedPage(MyPage, { requiredPermissions: ['challenge_view_all'] })
 */
export default function ProtectedPage(Component, options = {}) {
  const {
    requiredPermissions = [],
    requiredRoles = [],
    requireAdmin = false,
    requireAllPermissions = false, // New option: if true, requires ALL permissions; if false, requires ANY
    fallback = null
  } = options;

  return function ProtectedComponent(props) {
    const { t } = useLanguage();
    const { hasPermission, hasAnyPermission, isAdmin, user } = usePermissions();

    // Admin check
    if (requireAdmin && !isAdmin) {
      return fallback || (
        <div className="flex items-center justify-center h-96">
          <Alert className="max-w-md">
            <Lock className="h-4 w-4" />
            <AlertDescription>
              {t({ en: 'Admin access required', ar: 'مطلوب وصول المسؤول' })}
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    // Role check
    if (requiredRoles.length > 0) {
      const userRoles = user?.assigned_roles || [];
      const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));

      if (!hasRequiredRole) {
        return fallback || (
          <div className="flex items-center justify-center h-96">
            <Alert className="max-w-md">
              <Lock className="h-4 w-4" />
              <AlertDescription>
                {t({ en: 'Required role not assigned', ar: 'الدور المطلوب غير معين' })}
              </AlertDescription>
            </Alert>
          </div>
        );
      }
    }

    // Permission check - use hasAnyPermission by default for flexibility
    if (requiredPermissions.length > 0) {
      const hasAccess = requireAllPermissions
        ? requiredPermissions.every(perm => hasPermission(perm))
        : hasAnyPermission(requiredPermissions);

      if (!hasAccess) {
        return fallback || (
          <div className="flex items-center justify-center h-96">
            <Alert className="max-w-md">
              <Lock className="h-4 w-4" />
              <AlertDescription>
                {t({ en: 'You do not have permission to view this page', ar: 'ليس لديك إذن لعرض هذه الصفحة' })}
              </AlertDescription>
            </Alert>
          </div>
        );
      }
    }

    return <Component {...props} />;
  };
}
