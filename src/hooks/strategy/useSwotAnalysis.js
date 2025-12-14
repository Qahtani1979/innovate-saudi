import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';

export function useSwotAnalysis(strategicPlanId) {
  const { user } = useAuth();
  const [swotData, setSwotData] = useState({
    strengths: [],
    weaknesses: [],
    opportunities: [],
    threats: [],
    metadata: { created_at: null, updated_at: null, version: 1 }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch SWOT analysis from database
  const fetchSwotAnalysis = useCallback(async () => {
    if (!strategicPlanId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('swot_analyses')
        .select('*')
        .eq('strategic_plan_id', strategicPlanId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSwotData({
          id: data.id,
          strengths: data.strengths || [],
          weaknesses: data.weaknesses || [],
          opportunities: data.opportunities || [],
          threats: data.threats || [],
          metadata: {
            created_at: data.created_at,
            updated_at: data.updated_at,
            version: data.version || 1
          }
        });
      }
    } catch (error) {
      console.error('Error fetching SWOT analysis:', error);
    } finally {
      setLoading(false);
    }
  }, [strategicPlanId]);

  useEffect(() => {
    fetchSwotAnalysis();
  }, [fetchSwotAnalysis]);

  // Save SWOT analysis to database
  const saveSwotAnalysis = useCallback(async (data) => {
    if (!strategicPlanId || !user?.email) {
      toast.error('Please log in to save');
      return false;
    }

    setSaving(true);
    try {
      const payload = {
        strategic_plan_id: strategicPlanId,
        strengths: data.strengths || [],
        weaknesses: data.weaknesses || [],
        opportunities: data.opportunities || [],
        threats: data.threats || [],
        created_by_email: user.email,
        version: (data.metadata?.version || 0) + 1,
        updated_at: new Date().toISOString()
      };

      const { data: existing } = await supabase
        .from('swot_analyses')
        .select('id')
        .eq('strategic_plan_id', strategicPlanId)
        .maybeSingle();

      let result;
      if (existing) {
        result = await supabase
          .from('swot_analyses')
          .update(payload)
          .eq('id', existing.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('swot_analyses')
          .insert(payload)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      setSwotData(prev => ({
        ...prev,
        id: result.data.id,
        metadata: {
          ...prev.metadata,
          updated_at: result.data.updated_at,
          version: result.data.version
        }
      }));

      toast.success('SWOT analysis saved');
      return true;
    } catch (error) {
      console.error('Error saving SWOT analysis:', error);
      toast.error('Failed to save SWOT analysis');
      return false;
    } finally {
      setSaving(false);
    }
  }, [strategicPlanId, user]);

  return {
    swotData,
    setSwotData,
    loading,
    saving,
    saveSwotAnalysis,
    refetch: fetchSwotAnalysis
  };
}
