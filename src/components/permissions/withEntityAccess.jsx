/**
 * HOC wrapper for detail pages to enforce visibility
 */
import React from 'react';
import { useEntityAccessCheck } from '@/hooks/useEntityAccessCheck';

export function withEntityAccess(Component, options = {}) {
  return function ProtectedEntityDetail(props) {
    const { entity, ...restProps } = props;
    const accessCheck = useEntityAccessCheck(entity, options);

    if (accessCheck.isLoading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!accessCheck.canAccess) {
      return (
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-semibold text-muted-foreground mb-2">
            Access Denied
          </h2>
          <p className="text-muted-foreground">
            You don't have permission to view this content.
          </p>
        </div>
      );
    }

    return <Component {...restProps} entity={entity} accessLevel={accessCheck} />;
  };
}

export default withEntityAccess;
