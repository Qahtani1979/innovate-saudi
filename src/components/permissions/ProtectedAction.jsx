import React from 'react';
import { usePermissions } from './usePermissions';
import { Button } from "@/components/ui/button";
import { Lock } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Wrap actions (buttons, links) with permission checks
 * Usage: <ProtectedAction permission="challenge_delete">{deleteButton}</ProtectedAction>
 */
export default function ProtectedAction({ 
  permission, 
  permissions = [], 
  requireAll = true,
  children, 
  fallback = null,
  showLock = false 
}) {
  const { hasPermission, hasAnyPermission } = usePermissions();

  // Check single permission
  if (permission && !hasPermission(permission)) {
    return showLock ? (
      <Button 
        variant="ghost" 
        size="icon" 
        disabled 
        onClick={() => toast.error('Permission denied')}
      >
        <Lock className="h-4 w-4 text-slate-400" />
      </Button>
    ) : fallback;
  }

  // Check multiple permissions
  if (permissions.length > 0) {
    const hasAccess = requireAll 
      ? permissions.every(p => hasPermission(p))
      : hasAnyPermission(permissions);
    
    if (!hasAccess) {
      return showLock ? (
        <Button 
          variant="ghost" 
          size="icon" 
          disabled 
          onClick={() => toast.error('Permission denied')}
        >
          <Lock className="h-4 w-4 text-slate-400" />
        </Button>
      ) : fallback;
    }
  }

  return <>{children}</>;
}