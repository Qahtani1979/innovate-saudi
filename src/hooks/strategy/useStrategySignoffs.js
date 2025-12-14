import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useStrategySignoffs(planId) {
  const { toast } = useToast();

  const [signoffs, setSignoffs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSignoffs = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('strategy_signoffs')
        .select('*')
        .order('created_at', { ascending: false });

      if (planId) {
        query = query.eq('strategic_plan_id', planId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setSignoffs(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching signoffs', err);
      setError(err);
      toast({
        title: 'Error loading sign-offs',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [planId, toast]);

  useEffect(() => {
    fetchSignoffs();
  }, [fetchSignoffs]);

  // Mutation-like helpers with local state updates
  const [createPending, setCreatePending] = useState(false);
  const [updatePending, setUpdatePending] = useState(false);
  const [deletePending, setDeletePending] = useState(false);
  const [reminderPending, setReminderPending] = useState(false);

  const createSignoff = {
    isPending: createPending,
    mutateAsync: async (signoffData) => {
      setCreatePending(true);
      try {
        const { data, error } = await supabase
          .from('strategy_signoffs')
          .insert([signoffData])
          .select()
          .single();

        if (error) throw error;
        setSignoffs((prev) => [data, ...prev]);

        toast({
          title: 'Sign-off Request Sent',
          description: 'Stakeholder has been notified',
        });

        return data;
      } catch (err) {
        console.error('Error creating signoff', err);
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

  const updateSignoff = {
    isPending: updatePending,
    mutateAsync: async ({ id, ...updates }) => {
      setUpdatePending(true);
      try {
        const { data, error } = await supabase
          .from('strategy_signoffs')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        setSignoffs((prev) => prev.map((s) => (s.id === id ? data : s)));

        toast({
          title: 'Sign-off Updated',
          description: 'Changes saved successfully',
        });

        return data;
      } catch (err) {
        console.error('Error updating signoff', err);
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

  const deleteSignoff = {
    isPending: deletePending,
    mutateAsync: async (id) => {
      setDeletePending(true);
      try {
        const { error } = await supabase
          .from('strategy_signoffs')
          .delete()
          .eq('id', id);

        if (error) throw error;
        setSignoffs((prev) => prev.filter((s) => s.id !== id));

        toast({
          title: 'Sign-off Removed',
          description: 'Request has been removed',
        });
      } catch (err) {
        console.error('Error deleting signoff', err);
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

  const sendReminder = {
    isPending: reminderPending,
    mutateAsync: async (id) => {
      setReminderPending(true);
      try {
        const signoff = signoffs.find((s) => s.id === id);
        const { data, error } = await supabase
          .from('strategy_signoffs')
          .update({
            reminder_count: (signoff?.reminder_count || 0) + 1,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        setSignoffs((prev) => prev.map((s) => (s.id === id ? data : s)));

        toast({
          title: 'Reminder Sent',
          description: 'Stakeholder has been reminded',
        });

        return data;
      } catch (err) {
        console.error('Error sending reminder', err);
        toast({
          title: 'Error',
          description: err.message,
          variant: 'destructive',
        });
        throw err;
      } finally {
        setReminderPending(false);
      }
    },
  };

  return {
    signoffs,
    isLoading,
    error,
    createSignoff,
    updateSignoff,
    deleteSignoff,
    sendReminder,
    refetch: fetchSignoffs,
  };
}
