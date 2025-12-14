import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';

export function useStrategyOwnership(strategicPlanId) {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAssignments = useCallback(async () => {
    if (!strategicPlanId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('strategy_ownership')
        .select('*')
        .eq('strategic_plan_id', strategicPlanId)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;
      setAssignments(data || []);
    } catch (err) {
      console.error('Error fetching ownership assignments:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [strategicPlanId]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const saveAssignment = useCallback(async (assignment) => {
    if (!user?.email) {
      toast.error('You must be logged in to save assignments');
      return null;
    }

    setIsLoading(true);
    try {
      const assignmentData = {
        ...assignment,
        strategic_plan_id: strategicPlanId,
        updated_at: new Date().toISOString()
      };

      if (assignment.id) {
        const { data, error } = await supabase
          .from('strategy_ownership')
          .update(assignmentData)
          .eq('id', assignment.id)
          .select()
          .single();

        if (error) throw error;
        setAssignments(prev => prev.map(a => a.id === assignment.id ? data : a));
        return data;
      } else {
        assignmentData.created_by = user.email;
        assignmentData.created_at = new Date().toISOString();
        
        const { data, error } = await supabase
          .from('strategy_ownership')
          .insert(assignmentData)
          .select()
          .single();

        if (error) throw error;
        setAssignments(prev => [...prev, data]);
        return data;
      }
    } catch (err) {
      console.error('Error saving assignment:', err);
      toast.error('Failed to save ownership assignment');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [strategicPlanId, user]);

  const saveBulkAssignments = useCallback(async (assignmentsArray) => {
    if (!user?.email) {
      toast.error('You must be logged in');
      return false;
    }

    setIsLoading(true);
    try {
      const upsertData = assignmentsArray.map(a => ({
        ...a,
        strategic_plan_id: strategicPlanId,
        created_by: a.created_by || user.email,
        updated_at: new Date().toISOString()
      }));

      // Use upsert for existing records, insert for new
      for (const assignment of upsertData) {
        await saveAssignment(assignment);
      }
      
      toast.success('Ownership assignments saved successfully');
      return true;
    } catch (err) {
      console.error('Error saving assignments:', err);
      toast.error('Failed to save assignments');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [strategicPlanId, user, saveAssignment]);

  const deleteAssignment = useCallback(async (assignmentId) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('strategy_ownership')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;
      setAssignments(prev => prev.filter(a => a.id !== assignmentId));
      toast.success('Assignment deleted');
      return true;
    } catch (err) {
      console.error('Error deleting assignment:', err);
      toast.error('Failed to delete assignment');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    assignments,
    isLoading,
    error,
    fetchAssignments,
    saveAssignment,
    saveBulkAssignments,
    deleteAssignment,
    setAssignments
  };
}
