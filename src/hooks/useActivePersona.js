import { useState, useEffect, useCallback, useMemo } from 'react';
import { usePermissions } from '@/components/permissions/usePermissions.jsx';
import { SIDEBAR_MENUS } from '@/config/sidebarMenus';

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

// Default fallback values
const DEFAULT_PERSONA_DETAILS = {
  persona: 'user',
  label: { en: 'User', ar: 'مستخدم' },
  icon: null,
  color: 'from-gray-500 to-gray-600',
  priority: 99,
};

/**
 * Hook to manage active persona/role with session persistence
 * 
 * Priority logic:
 * 1. Last selected persona (stored in sessionStorage)
 * 2. Highest privilege role
 * 3. First role in array (fallback)
 */
export function useActivePersona() {
  // Safely call usePermissions - it handles its own errors
  const permissionsData = usePermissions();
  
  // Safely destructure with defaults
  const roles = permissionsData?.roles || [];
  const isAdmin = permissionsData?.isAdmin || false;
  
  // Get available personas based on user's roles
  const availablePersonas = useMemo(() => {
    if (!roles || !roles.length) return [];
    
    const personaSet = new Set();
    const personaDetails = [];
    
    roles.forEach(role => {
      const persona = ROLE_TO_PERSONA[role] || 'user';
      const menu = SIDEBAR_MENUS?.[persona];
      if (!personaSet.has(persona) && menu) {
        personaSet.add(persona);
        personaDetails.push({
          persona,
          role,
          label: menu.label || { en: persona, ar: persona },
          icon: menu.icon,
          color: menu.color || 'from-gray-500 to-gray-600',
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
    
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Validate stored persona is still available
        if (availablePersonas.some(p => p.persona === parsed.persona)) {
          return parsed.persona;
        }
      }
    } catch (e) {
      // Invalid storage, use default
    }
    return primaryPersona;
  });

  // Update when roles change or primary persona changes
  useEffect(() => {
    if (!availablePersonas.length) return;
    
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Check if stored persona is still valid
        if (availablePersonas.some(p => p.persona === parsed.persona)) {
          setActivePersonaState(parsed.persona);
          return;
        }
      }
    } catch (e) {
      // Invalid storage
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
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
        persona,
        timestamp: Date.now(),
      }));
    } catch (e) {
      // Storage error, continue without persisting
    }
  }, [availablePersonas]);

  // Get active persona details
  const activePersonaDetails = useMemo(() => {
    const found = availablePersonas.find(p => p.persona === activePersona);
    if (found) return found;
    
    // Fallback to sidebar menu info
    const menu = SIDEBAR_MENUS?.[activePersona] || SIDEBAR_MENUS?.user;
    if (!menu) return DEFAULT_PERSONA_DETAILS;
    
    return {
      persona: activePersona,
      label: menu.label || { en: activePersona, ar: activePersona },
      icon: menu.icon,
      color: menu.color || 'from-gray-500 to-gray-600',
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
