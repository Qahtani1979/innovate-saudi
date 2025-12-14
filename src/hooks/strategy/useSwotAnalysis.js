import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
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
  // Table uses individual records with quadrant field instead of array columns
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
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by quadrant
      const grouped = {
        strengths: [],
        weaknesses: [],
        opportunities: [],
        threats: []
      };

      (data || []).forEach(item => {
        const quadrant = item.quadrant?.toLowerCase();
        if (grouped[quadrant]) {
          grouped[quadrant].push({
            id: item.id,
            title_en: item.title_en,
            title_ar: item.title_ar,
            description_en: item.description_en,
            description_ar: item.description_ar,
            impact_level: item.impact_level,
            priority: item.priority,
            source: item.source
          });
        }
      });

      const latestItem = data?.[0];
      setSwotData({
        ...grouped,
        metadata: {
          created_at: latestItem?.created_at,
          updated_at: latestItem?.updated_at,
          version: data?.length || 0
        }
      });
    } catch (error) {
      console.error('Error fetching SWOT analysis:', error);
    } finally {
      setLoading(false);
    }
  }, [strategicPlanId]);

  useEffect(() => {
    fetchSwotAnalysis();
  }, [fetchSwotAnalysis]);

  // Save single SWOT item to database
  const saveSwotItem = useCallback(async (quadrant, item) => {
    if (!strategicPlanId || !user?.email) {
      toast.error('Please log in to save');
      return false;
    }

    setSaving(true);
    try {
      const payload = {
        strategic_plan_id: strategicPlanId,
        quadrant: quadrant,
        title_en: item.title_en,
        title_ar: item.title_ar,
        description_en: item.description_en,
        description_ar: item.description_ar,
        impact_level: item.impact_level,
        priority: item.priority,
        source: item.source,
        created_by_email: user.email,
        updated_at: new Date().toISOString()
      };

      let result;
      if (item.id && !item.id.startsWith('swot-')) {
        result = await supabase
          .from('swot_analyses')
          .update(payload)
          .eq('id', item.id)
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

      // Update local state
      setSwotData(prev => {
        const quadrantKey = quadrant.toLowerCase();
        const existingIndex = prev[quadrantKey]?.findIndex(i => i.id === result.data.id);
        const updatedItem = {
          id: result.data.id,
          title_en: result.data.title_en,
          title_ar: result.data.title_ar,
          description_en: result.data.description_en,
          description_ar: result.data.description_ar,
          impact_level: result.data.impact_level,
          priority: result.data.priority,
          source: result.data.source
        };

        if (existingIndex >= 0) {
          const updated = [...prev[quadrantKey]];
          updated[existingIndex] = updatedItem;
          return { ...prev, [quadrantKey]: updated };
        }
        return { ...prev, [quadrantKey]: [updatedItem, ...prev[quadrantKey]] };
      });

      toast.success('SWOT item saved');
      return result.data;
    } catch (error) {
      console.error('Error saving SWOT item:', error);
      toast.error('Failed to save SWOT item');
      return false;
    } finally {
      setSaving(false);
    }
  }, [strategicPlanId, user]);

  // Delete SWOT item
  const deleteSwotItem = useCallback(async (quadrant, id) => {
    try {
      const { error } = await supabase
        .from('swot_analyses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSwotData(prev => {
        const quadrantKey = quadrant.toLowerCase();
        return {
          ...prev,
          [quadrantKey]: prev[quadrantKey].filter(i => i.id !== id)
        };
      });

      toast.success('SWOT item deleted');
      return true;
    } catch (error) {
      console.error('Error deleting SWOT item:', error);
      toast.error('Failed to delete SWOT item');
      return false;
    }
  }, []);

  // Save multiple items at once (for bulk operations)
  const saveSwotAnalysis = useCallback(async (data) => {
    if (!strategicPlanId || !user?.email) {
      toast.error('Please log in to save');
      return false;
    }

    setSaving(true);
    try {
      const quadrants = ['strengths', 'weaknesses', 'opportunities', 'threats'];
      
      for (const quadrant of quadrants) {
        const items = data[quadrant] || [];
        for (const item of items) {
          await saveSwotItem(quadrant, item);
        }
      }

      toast.success('SWOT analysis saved');
      return true;
    } catch (error) {
      console.error('Error saving SWOT analysis:', error);
      toast.error('Failed to save SWOT analysis');
      return false;
    } finally {
      setSaving(false);
    }
  }, [strategicPlanId, user, saveSwotItem]);

  return {
    swotData,
    setSwotData,
    loading,
    saving,
    saveSwotItem,
    deleteSwotItem,
    saveSwotAnalysis,
    refetch: fetchSwotAnalysis
  };
}
