import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';

export function useActionPlans(strategicPlanId) {
  const { user } = useAuth();
  const [actionPlans, setActionPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchActionPlans = useCallback(async () => {
    if (!strategicPlanId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch action plans
      const { data: plans, error: plansError } = await supabase
        .from('action_plans')
        .select('*')
        .eq('strategic_plan_id', strategicPlanId)
        .order('created_at', { ascending: true });

      if (plansError) throw plansError;

      // Fetch action items for each plan
      const plansWithItems = await Promise.all(
        (plans || []).map(async (plan) => {
          const { data: items } = await supabase
            .from('action_items')
            .select('*')
            .eq('action_plan_id', plan.id)
            .order('created_at', { ascending: true });
          
          return { ...plan, actions: items || [] };
        })
      );

      setActionPlans(plansWithItems);
    } catch (err) {
      console.error('Error fetching action plans:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [strategicPlanId]);

  useEffect(() => {
    fetchActionPlans();
  }, [fetchActionPlans]);

  const saveActionPlan = useCallback(async (plan) => {
    if (!user?.email) {
      toast.error('You must be logged in');
      return null;
    }

    setIsLoading(true);
    try {
      const { actions, ...planData } = plan;
      planData.strategic_plan_id = strategicPlanId;
      planData.updated_at = new Date().toISOString();

      let savedPlan;
      
      if (plan.id && !plan.id.startsWith('ap-')) {
        // Update existing plan
        const { data, error } = await supabase
          .from('action_plans')
          .update(planData)
          .eq('id', plan.id)
          .select()
          .single();

        if (error) throw error;
        savedPlan = data;
      } else {
        // Create new plan
        const { id, ...insertData } = planData;
        insertData.created_by = user.email;
        insertData.created_at = new Date().toISOString();
        
        const { data, error } = await supabase
          .from('action_plans')
          .insert(insertData)
          .select()
          .single();

        if (error) throw error;
        savedPlan = data;
      }

      // Save action items
      if (actions && actions.length > 0) {
        for (const action of actions) {
          const actionData = {
            ...action,
            action_plan_id: savedPlan.id,
            updated_at: new Date().toISOString()
          };

          if (action.id && !action.id.startsWith('action-')) {
            await supabase
              .from('action_items')
              .update(actionData)
              .eq('id', action.id);
          } else {
            const { id, ...insertAction } = actionData;
            insertAction.created_at = new Date().toISOString();
            await supabase
              .from('action_items')
              .insert(insertAction);
          }
        }
      }

      await fetchActionPlans();
      toast.success('Action plan saved successfully');
      return savedPlan;
    } catch (err) {
      console.error('Error saving action plan:', err);
      toast.error('Failed to save action plan');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [strategicPlanId, user, fetchActionPlans]);

  const saveBulkActionPlans = useCallback(async (plans) => {
    if (!user?.email) {
      toast.error('You must be logged in');
      return false;
    }

    setIsLoading(true);
    try {
      for (const plan of plans) {
        await saveActionPlan(plan);
      }
      toast.success('All action plans saved');
      return true;
    } catch (err) {
      console.error('Error saving action plans:', err);
      toast.error('Failed to save action plans');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [saveActionPlan, user]);

  const deleteActionPlan = useCallback(async (planId) => {
    if (planId.startsWith('ap-')) {
      setActionPlans(prev => prev.filter(p => p.id !== planId));
      return true;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('action_plans')
        .delete()
        .eq('id', planId);

      if (error) throw error;
      setActionPlans(prev => prev.filter(p => p.id !== planId));
      toast.success('Action plan deleted');
      return true;
    } catch (err) {
      console.error('Error deleting action plan:', err);
      toast.error('Failed to delete action plan');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteActionItem = useCallback(async (planId, actionId) => {
    if (actionId.startsWith('action-')) {
      setActionPlans(prev => prev.map(p => 
        p.id === planId 
          ? { ...p, actions: p.actions.filter(a => a.id !== actionId) }
          : p
      ));
      return true;
    }

    try {
      const { error } = await supabase
        .from('action_items')
        .delete()
        .eq('id', actionId);

      if (error) throw error;
      setActionPlans(prev => prev.map(p => 
        p.id === planId 
          ? { ...p, actions: p.actions.filter(a => a.id !== actionId) }
          : p
      ));
      return true;
    } catch (err) {
      console.error('Error deleting action item:', err);
      return false;
    }
  }, []);

  return {
    actionPlans,
    isLoading,
    error,
    fetchActionPlans,
    saveActionPlan,
    saveBulkActionPlans,
    deleteActionPlan,
    deleteActionItem,
    setActionPlans
  };
}
