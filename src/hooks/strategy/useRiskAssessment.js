import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';

export function useRiskAssessment(strategicPlanId) {
  const { user } = useAuth();
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch risks from database
  const fetchRisks = useCallback(async () => {
    if (!strategicPlanId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('strategy_risks')
        .select('*')
        .eq('strategic_plan_id', strategicPlanId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform DB fields to component fields
      const transformedRisks = (data || []).map(risk => ({
        id: risk.id,
        name_en: risk.name_en,
        name_ar: risk.name_ar,
        description: risk.description,
        category: risk.risk_category,
        probability: risk.probability,
        impact: risk.impact,
        status: risk.status,
        owner: risk.owner,
        mitigation_strategy: risk.mitigation_strategy,
        contingency_plan: risk.contingency_plan,
        triggers: risk.triggers,
        residual_probability: risk.residual_probability,
        residual_impact: risk.residual_impact
      }));
      
      setRisks(transformedRisks);
    } catch (error) {
      console.error('Error fetching risks:', error);
    } finally {
      setLoading(false);
    }
  }, [strategicPlanId]);

  useEffect(() => {
    fetchRisks();
  }, [fetchRisks]);

  // Save risk to database
  const saveRisk = useCallback(async (risk) => {
    if (!strategicPlanId || !user?.email) {
      toast.error('Please log in to save');
      return false;
    }

    setSaving(true);
    try {
      const payload = {
        strategic_plan_id: strategicPlanId,
        name_en: risk.name_en,
        name_ar: risk.name_ar,
        description: risk.description,
        risk_category: risk.category,
        probability: risk.probability,
        impact: risk.impact,
        risk_score: risk.probability * risk.impact,
        status: risk.status,
        owner: risk.owner,
        mitigation_strategy: risk.mitigation_strategy,
        contingency_plan: risk.contingency_plan,
        triggers: risk.triggers,
        residual_probability: risk.residual_probability,
        residual_impact: risk.residual_impact,
        created_by_email: user.email,
        updated_at: new Date().toISOString()
      };

      let result;
      if (risk.id && !risk.id.startsWith('risk-')) {
        result = await supabase
          .from('strategy_risks')
          .update(payload)
          .eq('id', risk.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('strategy_risks')
          .insert(payload)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      const transformedRisk = {
        id: result.data.id,
        name_en: result.data.name_en,
        name_ar: result.data.name_ar,
        description: result.data.description,
        category: result.data.risk_category,
        probability: result.data.probability,
        impact: result.data.impact,
        status: result.data.status,
        owner: result.data.owner,
        mitigation_strategy: result.data.mitigation_strategy,
        contingency_plan: result.data.contingency_plan,
        triggers: result.data.triggers,
        residual_probability: result.data.residual_probability,
        residual_impact: result.data.residual_impact
      };

      setRisks(prev => {
        const existingIndex = prev.findIndex(r => r.id === transformedRisk.id);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = transformedRisk;
          return updated;
        }
        return [transformedRisk, ...prev];
      });

      toast.success('Risk saved');
      return transformedRisk;
    } catch (error) {
      console.error('Error saving risk:', error);
      toast.error('Failed to save risk');
      return false;
    } finally {
      setSaving(false);
    }
  }, [strategicPlanId, user]);

  // Delete risk (soft delete)
  const deleteRisk = useCallback(async (id) => {
    try {
      const { error } = await supabase
        .from('strategy_risks')
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      setRisks(prev => prev.filter(r => r.id !== id));
      toast.success('Risk deleted');
      return true;
    } catch (error) {
      console.error('Error deleting risk:', error);
      toast.error('Failed to delete risk');
      return false;
    }
  }, []);

  return {
    risks,
    setRisks,
    loading,
    saving,
    saveRisk,
    deleteRisk,
    refetch: fetchRisks
  };
}
