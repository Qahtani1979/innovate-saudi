import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';

export function useStrategyMilestones(strategicPlanId) {
  const { user } = useAuth();
  const [milestones, setMilestones] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMilestones = useCallback(async () => {
    if (!strategicPlanId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('strategy_milestones')
        .select('*')
        .eq('strategic_plan_id', strategicPlanId)
        .order('start_date', { ascending: true });

      if (fetchError) throw fetchError;
      setMilestones(data || []);
    } catch (err) {
      console.error('Error fetching milestones:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [strategicPlanId]);

  useEffect(() => {
    fetchMilestones();
  }, [fetchMilestones]);

  const saveMilestone = useCallback(async (milestone) => {
    if (!user?.email) {
      toast.error('You must be logged in to save milestones');
      return null;
    }

    setIsLoading(true);
    try {
      const milestoneData = {
        ...milestone,
        strategic_plan_id: strategicPlanId,
        updated_at: new Date().toISOString()
      };

      if (milestone.id && !milestone.id.startsWith('milestone-')) {
        // Update existing
        const { data, error } = await supabase
          .from('strategy_milestones')
          .update(milestoneData)
          .eq('id', milestone.id)
          .select()
          .single();

        if (error) throw error;
        setMilestones(prev => prev.map(m => m.id === milestone.id ? data : m));
        toast.success('Milestone updated successfully');
        return data;
      } else {
        // Create new
        const { id, ...insertData } = milestoneData;
        insertData.created_by = user.email;
        insertData.created_at = new Date().toISOString();
        
        const { data, error } = await supabase
          .from('strategy_milestones')
          .insert(insertData)
          .select()
          .single();

        if (error) throw error;
        setMilestones(prev => [...prev, data]);
        toast.success('Milestone created successfully');
        return data;
      }
    } catch (err) {
      console.error('Error saving milestone:', err);
      toast.error('Failed to save milestone');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [strategicPlanId, user]);

  const deleteMilestone = useCallback(async (milestoneId) => {
    if (!milestoneId || milestoneId.startsWith('milestone-')) {
      setMilestones(prev => prev.filter(m => m.id !== milestoneId));
      return true;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('strategy_milestones')
        .delete()
        .eq('id', milestoneId);

      if (error) throw error;
      setMilestones(prev => prev.filter(m => m.id !== milestoneId));
      toast.success('Milestone deleted successfully');
      return true;
    } catch (err) {
      console.error('Error deleting milestone:', err);
      toast.error('Failed to delete milestone');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveBulkMilestones = useCallback(async (milestonesArray) => {
    if (!user?.email) {
      toast.error('You must be logged in');
      return false;
    }

    setIsLoading(true);
    try {
      for (const milestone of milestonesArray) {
        await saveMilestone(milestone);
      }
      toast.success('All milestones saved successfully');
      return true;
    } catch (err) {
      console.error('Error saving milestones:', err);
      toast.error('Failed to save milestones');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [saveMilestone, user]);

  return {
    milestones,
    isLoading,
    error,
    fetchMilestones,
    saveMilestone,
    deleteMilestone,
    saveBulkMilestones,
    setMilestones
  };
}
