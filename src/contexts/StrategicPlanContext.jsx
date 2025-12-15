import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const StrategicPlanContext = createContext();

export const useActivePlan = () => {
  const context = useContext(StrategicPlanContext);
  if (!context) {
    return { 
      activePlanId: null, 
      activePlan: null, 
      setActivePlanId: () => {}, 
      strategicPlans: [], 
      isLoading: false,
      clearActivePlan: () => {}
    };
  }
  return context;
};

export const StrategicPlanProvider = ({ children }) => {
  // Persist selection in localStorage
  const [activePlanId, setActivePlanIdState] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('activePlanId') || null;
    }
    return null;
  });

  // Fetch only non-template, non-deleted plans for the active plan selector
  const { data: strategicPlans = [], isLoading } = useQuery({
    queryKey: ['strategic-plans-global'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('strategic_plans')
        .select('*')
        .eq('is_template', false)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Get the full plan object
  const activePlan = strategicPlans.find(p => p.id === activePlanId) || null;

  // Auto-select first plan if none selected and plans are available
  useEffect(() => {
    if (!activePlanId && strategicPlans.length > 0) {
      const activeOrFirst = strategicPlans.find(p => p.status === 'active') || strategicPlans[0];
      if (activeOrFirst) {
        setActivePlanIdState(activeOrFirst.id);
        localStorage.setItem('activePlanId', activeOrFirst.id);
      }
    }
  }, [activePlanId, strategicPlans]);

  // Validate that the stored plan still exists
  useEffect(() => {
    if (activePlanId && strategicPlans.length > 0) {
      const planExists = strategicPlans.some(p => p.id === activePlanId);
      if (!planExists) {
        const fallback = strategicPlans[0];
        setActivePlanIdState(fallback?.id || null);
        if (fallback) {
          localStorage.setItem('activePlanId', fallback.id);
        } else {
          localStorage.removeItem('activePlanId');
        }
      }
    }
  }, [activePlanId, strategicPlans]);

  const setActivePlanId = (id) => {
    setActivePlanIdState(id);
    if (id) {
      localStorage.setItem('activePlanId', id);
    } else {
      localStorage.removeItem('activePlanId');
    }
  };

  const clearActivePlan = () => {
    setActivePlanIdState(null);
    localStorage.removeItem('activePlanId');
  };

  return (
    <StrategicPlanContext.Provider value={{
      activePlanId,
      activePlan,
      setActivePlanId,
      strategicPlans,
      isLoading,
      clearActivePlan
    }}>
      {children}
    </StrategicPlanContext.Provider>
  );
};
