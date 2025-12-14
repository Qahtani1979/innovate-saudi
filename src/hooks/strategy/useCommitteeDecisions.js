import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useCommitteeDecisions(planId) {
  const { toast } = useToast();

  const [decisions, setDecisions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDecisions = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('committee_decisions')
        .select('*')
        .order('meeting_date', { ascending: false });

      if (planId) {
        query = query.eq('strategic_plan_id', planId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setDecisions(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching decisions', err);
      setError(err);
      toast({
        title: 'Error loading decisions',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [planId, toast]);

  useEffect(() => {
    fetchDecisions();
  }, [fetchDecisions]);

  const [createPending, setCreatePending] = useState(false);
  const [updatePending, setUpdatePending] = useState(false);
  const [deletePending, setDeletePending] = useState(false);

  const createDecision = {
    isPending: createPending,
    mutateAsync: async (decisionData) => {
      setCreatePending(true);
      try {
        const { data, error } = await supabase
          .from('committee_decisions')
          .insert([decisionData])
          .select()
          .single();

        if (error) throw error;
        setDecisions((prev) => [data, ...prev]);

        toast({
          title: 'Decision Recorded',
          description: 'Committee decision has been saved',
        });

        return data;
      } catch (err) {
        console.error('Error creating decision', err);
        toast({
          title: 'Error',
          description: err.message,
          variant: 'destructive',
        });
        throw err;
      } finally {
        setCreatePending(false);
      }
    },
  };

  const updateDecision = {
    isPending: updatePending,
    mutateAsync: async ({ id, ...updates }) => {
      setUpdatePending(true);
      try {
        const { data, error } = await supabase
          .from('committee_decisions')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        setDecisions((prev) => prev.map((d) => (d.id === id ? data : d)));

        toast({
          title: 'Decision Updated',
          description: 'Changes saved successfully',
        });

        return data;
      } catch (err) {
        console.error('Error updating decision', err);
        toast({
          title: 'Error',
          description: err.message,
          variant: 'destructive',
        });
        throw err;
      } finally {
        setUpdatePending(false);
      }
    },
  };

  const deleteDecision = {
    isPending: deletePending,
    mutateAsync: async (id) => {
      setDeletePending(true);
      try {
        const { error } = await supabase
          .from('committee_decisions')
          .delete()
          .eq('id', id);

        if (error) throw error;
        setDecisions((prev) => prev.filter((d) => d.id !== id));

        toast({
          title: 'Decision Removed',
          description: 'Decision has been deleted',
        });
      } catch (err) {
        console.error('Error deleting decision', err);
        toast({
          title: 'Error',
          description: err.message,
          variant: 'destructive',
        });
        throw err;
      } finally {
        setDeletePending(false);
      }
    },
  };

  return {
    decisions,
    isLoading,
    error,
    createDecision,
    updateDecision,
    deleteDecision,
    refetch: fetchDecisions,
  };
}
