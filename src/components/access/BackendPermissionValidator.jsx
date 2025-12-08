import React from 'react';
import { base44 } from '@/api/base44Client';

/**
 * React Hook for Backend Permission Validation
 * Validates permissions via backend before allowing operations
 */

export const useBackendPermission = () => {
  const validatePermission = async (permission, entity_type = null, entity_id = null, action = null) => {
    try {
      const response = await base44.functions.invoke('validatePermission', {
        permission,
        entity_type,
        entity_id,
        action
      });

      return response.data;
    } catch (error) {
      console.error('Permission validation error:', error);
      return { allowed: false, reason: 'Validation failed' };
    }
  };

  const validateFieldAccess = async (entity_type, field_name, operation) => {
    try {
      const response = await base44.functions.invoke('checkFieldSecurity', {
        entity_type,
        field_name,
        operation
      });

      return response.data;
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