import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';

export function useStrategyBaselines(strategicPlanId) {
  const { user } = useAuth();
  const [baselines, setBaselines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch baselines from database
  const fetchBaselines = useCallback(async () => {
    if (!strategicPlanId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('strategy_baselines')
        .select('*')
        .eq('strategic_plan_id', strategicPlanId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform DB fields to component fields
      const transformedBaselines = (data || []).map(baseline => ({
        id: baseline.id,
        category: baseline.category,
        kpi_name_en: baseline.kpi_name_en,
        kpi_name_ar: baseline.kpi_name_ar,
        baseline_value: baseline.baseline_value,
        unit: baseline.unit,
        target_value: baseline.target_value,
        collection_date: baseline.collection_date,
        source: baseline.source,
        status: baseline.status,
        notes: baseline.notes
      }));
      
      setBaselines(transformedBaselines);
    } catch (error) {
      console.error('Error fetching baselines:', error);
    } finally {
      setLoading(false);
    }
  }, [strategicPlanId]);

  useEffect(() => {
    fetchBaselines();
  }, [fetchBaselines]);

  // Save baseline to database
  const saveBaseline = useCallback(async (baseline) => {
    if (!strategicPlanId || !user?.email) {
      toast.error('Please log in to save');
      return false;
    }

    setSaving(true);
    try {
      const payload = {
        strategic_plan_id: strategicPlanId,
        category: baseline.category,
        kpi_name_en: baseline.kpi_name_en,
        kpi_name_ar: baseline.kpi_name_ar,
        baseline_value: baseline.baseline_value,
        unit: baseline.unit,
        target_value: baseline.target_value,
        collection_date: baseline.collection_date || new Date().toISOString().split('T')[0],
        source: baseline.source,
        status: baseline.status,
        notes: baseline.notes,
        created_by_email: user.email,
        updated_at: new Date().toISOString()
      };

      let result;
      if (baseline.id && !baseline.id.startsWith('baseline-')) {
        result = await supabase
          .from('strategy_baselines')
          .update(payload)
          .eq('id', baseline.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('strategy_baselines')
          .insert(payload)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      const transformedBaseline = {
        id: result.data.id,
        category: result.data.category,
        kpi_name_en: result.data.kpi_name_en,
        kpi_name_ar: result.data.kpi_name_ar,
        baseline_value: result.data.baseline_value,
        unit: result.data.unit,
        target_value: result.data.target_value,
        collection_date: result.data.collection_date,
        source: result.data.source,
        status: result.data.status,
        notes: result.data.notes
      };

      setBaselines(prev => {
        const existingIndex = prev.findIndex(b => b.id === transformedBaseline.id);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = transformedBaseline;
          return updated;
        }
        return [transformedBaseline, ...prev];
      });

      toast.success('Baseline saved');
      return transformedBaseline;
    } catch (error) {
      console.error('Error saving baseline:', error);
      toast.error('Failed to save baseline');
      return false;
    } finally {
      setSaving(false);
    }
  }, [strategicPlanId, user]);

  // Delete baseline (soft delete)
  const deleteBaseline = useCallback(async (id) => {
    try {
      const { error } = await supabase
        .from('strategy_baselines')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setBaselines(prev => prev.filter(b => b.id !== id));
      toast.success('Baseline deleted');
      return true;
    } catch (error) {
      console.error('Error deleting baseline:', error);
      toast.error('Failed to delete baseline');
      return false;
    }
  }, []);

  return {
    baselines,
    setBaselines,
    loading,
    saving,
    saveBaseline,
    deleteBaseline,
    refetch: fetchBaselines
  };
}
