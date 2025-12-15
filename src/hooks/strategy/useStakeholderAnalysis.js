import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Safe hook to get user email without throwing if outside AuthProvider
const useUserEmail = () => {
  const [email, setEmail] = useState(null);
  
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setEmail(user?.email || null);
    };
    getUser();
  }, []);
  
  return email;
};

export function useStakeholderAnalysis(strategicPlanId) {
  const userEmail = useUserEmail();
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
    if (!strategicPlanId || !userEmail) {
      toast.error('Please log in to save');
      return false;
    }

    setSaving(true);
    try {
      const payload = {
        strategic_plan_id: strategicPlanId,
        stakeholder_name_en: stakeholder.name_en || stakeholder.stakeholder_name_en,
        stakeholder_name_ar: stakeholder.name_ar || stakeholder.stakeholder_name_ar,
        stakeholder_type: stakeholder.type || stakeholder.stakeholder_type,
        power_level: stakeholder.power || stakeholder.power_level,
        interest_level: stakeholder.interest || stakeholder.interest_level,
        influence_description: stakeholder.influence || stakeholder.influence_description,
        expectations: stakeholder.expectations,
        engagement_strategy: stakeholder.engagement_strategy,
        contact_info: stakeholder.contact_info,
        created_by_email: userEmail,
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
  }, [strategicPlanId, userEmail]);

  // Delete stakeholder (soft delete)
  const deleteStakeholder = useCallback(async (id) => {
    try {
      const { error } = await supabase
        .from('stakeholder_analyses')
        .delete()
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
