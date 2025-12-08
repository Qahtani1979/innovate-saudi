import React from 'react';
import { usePermissions } from '../permissions/usePermissions';

// Field permission configuration per entity and role
const FIELD_PERMISSIONS = {
  Challenge: {
    budget_estimate: ['admin', 'challenge_edit'],
    stakeholders: ['admin', 'challenge_view_all'],
    sensitive_data: ['admin']
  },
  Pilot: {
    budget: ['admin', 'pilot_edit'],
    budget_breakdown: ['admin', 'pilot_edit'],
    financial_details: ['admin'],
    evaluation_scores: ['admin', 'pilot_evaluate']
  },
  Solution: {
    pricing_details: ['admin', 'solution_verify'],
    cost_structure: ['admin'],
    contact_email: ['admin', 'solution_view_all']
  },
  RDProject: {
    budget: ['admin', 'rd_edit'],
    budget_breakdown: ['admin', 'rd_edit'],
    funding_source: ['admin']
  },
  Organization: {
    financial_data: ['admin', 'org_verify'],
    internal_notes: ['admin'],
    contracts: ['admin']
  }
};

export function useFieldPermissions(entityType) {
  const { hasPermission, isAdmin, user } = usePermissions();

  const canViewField = (fieldName) => {
    if (isAdmin) return true;
    
    const fieldRules = FIELD_PERMISSIONS[entityType]?.[fieldName];
    if (!fieldRules) return true; // No restrictions
    
    return fieldRules.some(rule => {
      if (rule === 'admin') return false;
      return hasPermission(rule);
    });
  };

  const filterSensitiveFields = (data) => {
    if (isAdmin) return data;
    if (!data) return data;
    
    const filtered = { ...data };
    const entityRules = FIELD_PERMISSIONS[entityType] || {};
    
    Object.keys(entityRules).forEach(fieldName => {
      if (!canViewField(fieldName)) {
        delete filtered[fieldName];
      }
    });
    
    return filtered;
  };

  return {
    canViewField,
    filterSensitiveFields
  };
}

// Component to wrap sensitive fields
export function SensitiveField({ fieldName, entityType, value, children, maskAs = '••••••' }) {
  const { canViewField } = useFieldPermissions(entityType);

  if (!canViewField(fieldName)) {
    return <span className="text-slate-400 italic">{maskAs}</span>;
  }

  return children || value;
}