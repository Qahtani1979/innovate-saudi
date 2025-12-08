import React from 'react';
import { usePermissions } from '../permissions/usePermissions';

/**
 * Field-level security for CitizenIdea
 * Hides PII (email, phone) from non-admins/non-evaluators
 */
export default function IdeaFieldSecurity({ idea, children }) {
  const { hasPermission, isAdmin, user } = usePermissions();
  
  const canViewPII = isAdmin || 
    hasPermission('citizen_idea_evaluate') || 
    idea.created_by === user?.email;

  const sanitizedIdea = canViewPII ? idea : {
    ...idea,
    contact_email: null,
    contact_phone: null,
    submitter_details: null
  };

  return typeof children === 'function' 
    ? children(sanitizedIdea, canViewPII) 
    : children;
}