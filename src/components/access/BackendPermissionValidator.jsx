import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import rbacService from '@/services/rbac/rbacService';
import { useAuth } from '@/lib/AuthContext';

/**
 * React Hook for Backend Permission Validation
 * Validates permissions via unified rbac-manager edge function
 */

export const useBackendPermission = () => {
  const { user } = useAuth();
  
  const validatePermission = async (permission, entity_type = null, entity_id = null, action = null) => {
    try {
      // Use unified rbac-manager
      const result = await rbacService.validatePermission({
        user_id: user?.id,
        user_email: user?.email,
        permission,
        resource: entity_type,
        action
      });

      return result;
    } catch (error) {
      console.error('Permission validation error:', error);
      return { allowed: false, reason: 'Validation failed' };
    }
  };

  const validateFieldAccess = async (entity_type, field_name, operation) => {
    try {
      const { data, error } = await supabase.functions.invoke('check-field-security', {
        body: { entity_type, field_name, operation }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Field security check error:', error);
      return { allowed: false, reason: 'Validation failed' };
    }
  };

  return {
    validatePermission,
    validateFieldAccess
  };
};

/**
 * Protected Action Component
 * Wraps actions that require backend permission validation
 */
export const ProtectedBackendAction = ({ 
  permission, 
  entity_type, 
  entity_id, 
  action, 
  children, 
  fallback = null 
}) => {
  const [allowed, setAllowed] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const { validatePermission } = useBackendPermission();

  React.useEffect(() => {
    const checkPermission = async () => {
      const result = await validatePermission(permission, entity_type, entity_id, action);
      setAllowed(result.allowed);
      setLoading(false);
    };

    checkPermission();
  }, [permission, entity_type, entity_id, action]);

  if (loading) return null;
  if (!allowed) return fallback;
  return <>{children}</>;
};

export default useBackendPermission;
