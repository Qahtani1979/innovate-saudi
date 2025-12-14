import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';

export function useStakeholderAnalysis(strategicPlanId) {
  const { user } = useAuth();
  const [stakeholders, setStakeholders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch stakeholders from database
  const fetchStakeholders = useCallback(async () => {
    if (!strategicPlanId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('stakeholder_analyses')
        .select('*')
        .eq('strategic_plan_id', strategicPlanId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStakeholders(data || []);
    } catch (error) {
      console.error('Error fetching stakeholders:', error);
    } finally {
      setLoading(false);
    }
  }, [strategicPlanId]);

  useEffect(() => {
    fetchStakeholders();
  }, [fetchStakeholders]);

  // Save stakeholder to database
  const saveStakeholder = useCallback(async (stakeholder) => {
    if (!strategicPlanId || !user?.email) {
      toast.error('Please log in to save');
      return false;
    }

    setSaving(true);
    try {
      const payload = {
        strategic_plan_id: strategicPlanId,
        name_en: stakeholder.name_en,
        name_ar: stakeholder.name_ar,
        stakeholder_type: stakeholder.type,
        power_level: stakeholder.power,
        interest_level: stakeholder.interest,
        influence_description: stakeholder.influence,
        expectations: stakeholder.expectations,
        engagement_strategy: stakeholder.engagement_strategy,
        contact_info: stakeholder.contact_info,
        created_by_email: user.email,
        updated_at: new Date().toISOString()
      };

      let result;
      if (stakeholder.id && !stakeholder.id.startsWith('stakeholder-')) {
        result = await supabase
          .from('stakeholder_analyses')
          .update(payload)
          .eq('id', stakeholder.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('stakeholder_analyses')
          .insert(payload)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      setStakeholders(prev => {
        const existingIndex = prev.findIndex(s => s.id === result.data.id);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = result.data;
          return updated;
        }
        return [result.data, ...prev];
      });

      toast.success('Stakeholder saved');
      return result.data;
    } catch (error) {
      console.error('Error saving stakeholder:', error);
      toast.error('Failed to save stakeholder');
      return false;
    } finally {
      setSaving(false);
    }
  }, [strategicPlanId, user]);

  // Delete stakeholder (soft delete)
  const deleteStakeholder = useCallback(async (id) => {
    try {
      const { error } = await supabase
        .from('stakeholder_analyses')
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      setStakeholders(prev => prev.filter(s => s.id !== id));
      toast.success('Stakeholder deleted');
      return true;
    } catch (error) {
      console.error('Error deleting stakeholder:', error);
      toast.error('Failed to delete stakeholder');
      return false;
    }
  }, []);

  return {
    stakeholders,
    setStakeholders,
    loading,
    saving,
    saveStakeholder,
    deleteStakeholder,
    refetch: fetchStakeholders
  };
}
