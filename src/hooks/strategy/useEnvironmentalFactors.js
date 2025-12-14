import { useState, useEffect, useCallback, useContext } from 'react';
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

export function useEnvironmentalFactors(strategicPlanId) {
  const userEmail = useUserEmail();
  const [factors, setFactors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch factors from database
  const fetchFactors = useCallback(async () => {
    if (!strategicPlanId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('environmental_factors')
        .select('*')
        .eq('strategic_plan_id', strategicPlanId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform DB fields to component fields
      const transformedFactors = (data || []).map(factor => ({
        id: factor.id,
        category: factor.category,
        title_en: factor.title_en,
        title_ar: factor.title_ar,
        description_en: factor.description_en,
        description_ar: factor.description_ar,
        impact_type: factor.impact_type,
        impact_level: factor.impact_level,
        trend: factor.trend,
        source: factor.source,
        date_identified: factor.date_identified
      }));
      
      setFactors(transformedFactors);
    } catch (error) {
      console.error('Error fetching environmental factors:', error);
    } finally {
      setLoading(false);
    }
  }, [strategicPlanId]);

  useEffect(() => {
    fetchFactors();
  }, [fetchFactors]);

  // Save factor to database
  const saveFactor = useCallback(async (factor) => {
    if (!strategicPlanId || !userEmail) {
      toast.error('Please log in to save');
      return false;
    }

    setSaving(true);
    try {
      const payload = {
        strategic_plan_id: strategicPlanId,
        category: factor.category,
        title_en: factor.title_en,
        title_ar: factor.title_ar,
        description_en: factor.description_en,
        description_ar: factor.description_ar,
        impact_type: factor.impact_type,
        impact_level: factor.impact_level,
        trend: factor.trend,
        source: factor.source,
        date_identified: factor.date_identified || new Date().toISOString().split('T')[0],
        created_by_email: userEmail,
        updated_at: new Date().toISOString()
      };

      let result;
      if (factor.id && !factor.id.startsWith('factor-')) {
        result = await supabase
          .from('environmental_factors')
          .update(payload)
          .eq('id', factor.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('environmental_factors')
          .insert(payload)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      const transformedFactor = {
        id: result.data.id,
        category: result.data.category,
        title_en: result.data.title_en,
        title_ar: result.data.title_ar,
        description_en: result.data.description_en,
        description_ar: result.data.description_ar,
        impact_type: result.data.impact_type,
        impact_level: result.data.impact_level,
        trend: result.data.trend,
        source: result.data.source,
        date_identified: result.data.date_identified
      };

      setFactors(prev => {
        const existingIndex = prev.findIndex(f => f.id === transformedFactor.id);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = transformedFactor;
          return updated;
        }
        return [transformedFactor, ...prev];
      });

      toast.success('Environmental factor saved');
      return transformedFactor;
    } catch (error) {
      console.error('Error saving environmental factor:', error);
      toast.error('Failed to save environmental factor');
      return false;
    } finally {
      setSaving(false);
    }
  }, [strategicPlanId, userEmail]);

  // Delete factor (soft delete)
  const deleteFactor = useCallback(async (id) => {
    try {
      const { error } = await supabase
        .from('environmental_factors')
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      setFactors(prev => prev.filter(f => f.id !== id));
      toast.success('Environmental factor deleted');
      return true;
    } catch (error) {
      console.error('Error deleting environmental factor:', error);
      toast.error('Failed to delete environmental factor');
      return false;
    }
  }, []);

  return {
    factors,
    setFactors,
    loading,
    saving,
    saveFactor,
    deleteFactor,
    refetch: fetchFactors
  };
}
