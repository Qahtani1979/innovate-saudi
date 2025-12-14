import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';

export function useStrategyInputs(strategicPlanId) {
  const { user } = useAuth();
  const [inputs, setInputs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch inputs from database
  const fetchInputs = useCallback(async () => {
    if (!strategicPlanId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('strategy_inputs')
        .select('*')
        .eq('strategic_plan_id', strategicPlanId)
        .eq('is_deleted', false)
        .order('priority_votes', { ascending: false });

      if (error) throw error;
      
      // Transform DB fields to component fields
      const transformedInputs = (data || []).map(input => ({
        id: input.id,
        source_type: input.source_type,
        source_name: input.source_name,
        input_text: input.input_text,
        theme: input.theme,
        sentiment: input.sentiment,
        priority_votes: input.priority_votes,
        ai_extracted_themes: input.ai_extracted_themes || [],
        created_at: input.created_at
      }));
      
      setInputs(transformedInputs);
    } catch (error) {
      console.error('Error fetching strategy inputs:', error);
    } finally {
      setLoading(false);
    }
  }, [strategicPlanId]);

  useEffect(() => {
    fetchInputs();
  }, [fetchInputs]);

  // Save input to database
  const saveInput = useCallback(async (input) => {
    if (!strategicPlanId || !user?.email) {
      toast.error('Please log in to save');
      return false;
    }

    setSaving(true);
    try {
      const payload = {
        strategic_plan_id: strategicPlanId,
        source_type: input.source_type,
        source_name: input.source_name,
        input_text: input.input_text,
        theme: input.theme,
        sentiment: input.sentiment,
        priority_votes: input.priority_votes || 0,
        ai_extracted_themes: input.ai_extracted_themes || [],
        created_by_email: user.email,
        updated_at: new Date().toISOString()
      };

      let result;
      if (input.id && !input.id.startsWith('input-')) {
        result = await supabase
          .from('strategy_inputs')
          .update(payload)
          .eq('id', input.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('strategy_inputs')
          .insert(payload)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      const transformedInput = {
        id: result.data.id,
        source_type: result.data.source_type,
        source_name: result.data.source_name,
        input_text: result.data.input_text,
        theme: result.data.theme,
        sentiment: result.data.sentiment,
        priority_votes: result.data.priority_votes,
        ai_extracted_themes: result.data.ai_extracted_themes || [],
        created_at: result.data.created_at
      };

      setInputs(prev => {
        const existingIndex = prev.findIndex(i => i.id === transformedInput.id);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = transformedInput;
          return updated;
        }
        return [transformedInput, ...prev];
      });

      toast.success('Strategy input saved');
      return transformedInput;
    } catch (error) {
      console.error('Error saving strategy input:', error);
      toast.error('Failed to save strategy input');
      return false;
    } finally {
      setSaving(false);
    }
  }, [strategicPlanId, user]);

  // Vote on input
  const voteOnInput = useCallback(async (id, direction) => {
    const input = inputs.find(i => i.id === id);
    if (!input) return;

    const newVotes = input.priority_votes + (direction === 'up' ? 1 : -1);
    
    try {
      const { error } = await supabase
        .from('strategy_inputs')
        .update({ priority_votes: newVotes })
        .eq('id', id);

      if (error) throw error;

      setInputs(prev => prev.map(i => 
        i.id === id ? { ...i, priority_votes: newVotes } : i
      ));
    } catch (error) {
      console.error('Error voting:', error);
    }
  }, [inputs]);

  // Delete input (soft delete)
  const deleteInput = useCallback(async (id) => {
    try {
      const { error } = await supabase
        .from('strategy_inputs')
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      setInputs(prev => prev.filter(i => i.id !== id));
      toast.success('Strategy input deleted');
      return true;
    } catch (error) {
      console.error('Error deleting strategy input:', error);
      toast.error('Failed to delete strategy input');
      return false;
    }
  }, []);

  return {
    inputs,
    setInputs,
    loading,
    saving,
    saveInput,
    voteOnInput,
    deleteInput,
    refetch: fetchInputs
  };
}
