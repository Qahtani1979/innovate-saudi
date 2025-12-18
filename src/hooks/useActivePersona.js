import React from 'react';
import { usePermissions } from '@/components/permissions/usePermissions';
import { SIDEBAR_MENUS } from '@/config/sidebarMenus';

const { useState, useEffect, useCallback, useMemo } = React;

// Role priority order (highest privilege first)
const ROLE_PRIORITY = {
  admin: 1,
  executive: 2,
  deputyship_admin: 3,
  deputyship_staff: 4,
  deputyship: 4,
  municipality_admin: 5,
  municipality_director: 6,
  municipality_manager: 7,
  municipality_coordinator: 8,
  municipality_staff: 9,
  municipality_innovation_officer: 10,
  municipality_viewer: 11,
  municipality: 11,
  provider_admin: 12,
  provider: 13,
  startup: 13,
  expert: 14,
  evaluator: 14,
  researcher: 15,
  citizen: 16,
  viewer: 17,
  user: 18,
};

// Map roles to persona types
const ROLE_TO_PERSONA = {
  admin: 'admin',
  executive: 'executive',
  deputyship_admin: 'deputyship',
  deputyship_staff: 'deputyship',
  deputyship: 'deputyship',
  municipality_admin: 'municipality',
  municipality_director: 'municipality',
  municipality_manager: 'municipality',
  municipality_coordinator: 'municipality',
  municipality_staff: 'municipality',
  municipality_innovation_officer: 'municipality',
  municipality_viewer: 'municipality',
  municipality: 'municipality',
  provider_admin: 'provider',
  provider: 'provider',
  startup: 'provider',
  expert: 'expert',
  evaluator: 'expert',
  researcher: 'researcher',
  citizen: 'citizen',
  viewer: 'viewer',
  user: 'user',
};

const STORAGE_KEY = 'saudi_innovates_active_persona';

/**
 * Hook to manage active persona/role with session persistence
 * 
 * Priority logic:
 * 1. Last selected persona (stored in sessionStorage)
 * 2. Highest privilege role
 * 3. First role in array (fallback)
 */
export function useActivePersona() {
  const { roles = [], isAdmin, userRoles = [] } = usePermissions();
  
  // Get available personas based on user's roles
  const availablePersonas = useMemo(() => {
    if (!roles.length) return [];
    
    const personaSet = new Set();
    const personaDetails = [];
    
    roles.forEach(role => {
      const persona = ROLE_TO_PERSONA[role] || 'user';
      if (!personaSet.has(persona) && SIDEBAR_MENUS[persona]) {
        personaSet.add(persona);
        const menu = SIDEBAR_MENUS[persona];
        personaDetails.push({
          persona,
          role,
          label: menu.label,
          icon: menu.icon,
          color: menu.color,
          priority: ROLE_PRIORITY[role] || 99,
        });
      }
    });
    
    // Sort by priority (highest privilege first)
    return personaDetails.sort((a, b) => a.priority - b.priority);
  }, [roles]);

  // Get primary persona (highest privilege)
  const primaryPersona = useMemo(() => {
    if (isAdmin) return 'admin';
    if (!availablePersonas.length) return 'user';
    return availablePersonas[0].persona;
  }, [availablePersonas, isAdmin]);

  // Initialize active persona from storage or compute default
  const [activePersona, setActivePersonaState] = useState(() => {
    if (typeof window === 'undefined') return primaryPersona;
    
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Validate stored persona is still available
        if (availablePersonas.some(p => p.persona === parsed.persona)) {
          return parsed.persona;
        }
      } catch (e) {
        // Invalid storage, use default
      }
    }
    return primaryPersona;
  });

  // Update when roles change or primary persona changes
  useEffect(() => {
    if (!availablePersonas.length) return;
    
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Check if stored persona is still valid
        if (availablePersonas.some(p => p.persona === parsed.persona)) {
          setActivePersonaState(parsed.persona);
          return;
        }
      } catch (e) {
        // Invalid storage
      }
    }
    // Fall back to primary persona
    setActivePersonaState(primaryPersona);
  }, [availablePersonas, primaryPersona]);

  // Set active persona and persist to storage
  const setActivePersona = useCallback((persona) => {
    const isValid = availablePersonas.some(p => p.persona === persona);
    if (!isValid && persona !== 'admin') {
      console.warn(`Invalid persona: ${persona}`);
      return;
    }
    
    setActivePersonaState(persona);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
      persona,
      timestamp: Date.now(),
    }));
  }, [availablePersonas]);

  // Get active persona details
  const activePersonaDetails = useMemo(() => {
    const found = availablePersonas.find(p => p.persona === activePersona);
    if (found) return found;
    
    // Fallback to sidebar menu info
    const menu = SIDEBAR_MENUS[activePersona] || SIDEBAR_MENUS.user;
    return {
      persona: activePersona,
      label: menu.label,
      icon: menu.icon,
      color: menu.color,
      priority: ROLE_PRIORITY[activePersona] || 99,
    };
  }, [activePersona, availablePersonas]);

  // Check if user has multiple personas
  const hasMultiplePersonas = availablePersonas.length > 1;

  return {
    activePersona,
    setActivePersona,
    availablePersonas,
    primaryPersona,
    activePersonaDetails,
    hasMultiplePersonas,
    isAdmin,
  };
}

export default useActivePersona;
