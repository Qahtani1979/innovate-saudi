import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';

export function useSectorStrategies(parentPlanId) {
  const { user } = useAuth();
  const [sectorStrategies, setSectorStrategies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSectorStrategies = useCallback(async () => {
    if (!parentPlanId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('sector_strategies')
        .select(`
          *,
          sectors:sector_id (id, name_en, name_ar)
        `)
        .eq('parent_plan_id', parentPlanId)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;
      setSectorStrategies(data || []);
    } catch (err) {
      console.error('Error fetching sector strategies:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [parentPlanId]);

  useEffect(() => {
    fetchSectorStrategies();
  }, [fetchSectorStrategies]);

  const saveSectorStrategy = useCallback(async (strategy) => {
    if (!user?.email) {
      toast.error('You must be logged in');
      return null;
    }

    setIsLoading(true);
    try {
      const strategyData = {
        ...strategy,
        parent_plan_id: parentPlanId,
        updated_at: new Date().toISOString()
      };

      // Remove joined data
      delete strategyData.sectors;

      if (strategy.id) {
        const { data, error } = await supabase
          .from('sector_strategies')
          .update(strategyData)
          .eq('id', strategy.id)
          .select()
          .single();

        if (error) throw error;
        setSectorStrategies(prev => prev.map(s => s.id === strategy.id ? data : s));
        toast.success('Sector strategy updated');
        return data;
      } else {
        strategyData.created_by = user.email;
        strategyData.created_at = new Date().toISOString();
        
        const { data, error } = await supabase
          .from('sector_strategies')
          .insert(strategyData)
          .select()
          .single();

        if (error) throw error;
        setSectorStrategies(prev => [...prev, data]);
        toast.success('Sector strategy created');
        return data;
      }
    } catch (err) {
      console.error('Error saving sector strategy:', err);
      toast.error('Failed to save sector strategy');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [parentPlanId, user]);

  const saveBulkSectorStrategies = useCallback(async (strategies) => {
    if (!user?.email) {
      toast.error('You must be logged in');
      return false;
    }

    setIsLoading(true);
    try {
      for (const strategy of strategies) {
        await saveSectorStrategy(strategy);
      }
      toast.success('All sector strategies saved');
      return true;
    } catch (err) {
      console.error('Error saving sector strategies:', err);
      toast.error('Failed to save sector strategies');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [saveSectorStrategy, user]);

  const deleteSectorStrategy = useCallback(async (strategyId) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('sector_strategies')
        .delete()
        .eq('id', strategyId);

      if (error) throw error;
      setSectorStrategies(prev => prev.filter(s => s.id !== strategyId));
      toast.success('Sector strategy deleted');
      return true;
    } catch (err) {
      console.error('Error deleting sector strategy:', err);
      toast.error('Failed to delete sector strategy');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateStrategyStatus = useCallback(async (strategyId, status) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('sector_strategies')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', strategyId)
        .select()
        .single();

      if (error) throw error;
      setSectorStrategies(prev => prev.map(s => s.id === strategyId ? data : s));
      toast.success(`Strategy ${status}`);
      return data;
    } catch (err) {
      console.error('Error updating strategy status:', err);
      toast.error('Failed to update status');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    sectorStrategies,
    isLoading,
    error,
    fetchSectorStrategies,
    saveSectorStrategy,
    saveBulkSectorStrategies,
    deleteSectorStrategy,
    updateStrategyStatus,
    setSectorStrategies
  };
}
