import React from 'react';
import { usePermissions } from './usePermissions';

/**
 * Conditionally render fields based on permissions
 * Usage: <FieldPermission permission="challenge_edit_strategic">{children}</FieldPermission>
 */
export default function FieldPermission({ permission, children, fallback = null }) {
  const { hasPermission } = usePermissions();

  if (!hasPermission(permission)) {
    return fallback;
  }

  return <>{children}</>;
}

/**
 * Disable fields based on permissions
 * Usage: <Input {...fieldProps(hasPermission('challenge_edit_title'))} />
 */
export function fieldProps(hasPermission) {
  return {
    disabled: !hasPermission,
    className: !hasPermission ? 'opacity-50 cursor-not-allowed' : ''
  };
}