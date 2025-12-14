import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';

export function useNationalAlignments(strategicPlanId) {
  const { user } = useAuth();
  const [alignments, setAlignments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAlignments = useCallback(async () => {
    if (!strategicPlanId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('national_strategy_alignments')
        .select('*')
        .eq('strategic_plan_id', strategicPlanId)
        .order('national_strategy_type', { ascending: true });

      if (fetchError) throw fetchError;
      setAlignments(data || []);
    } catch (err) {
      console.error('Error fetching alignments:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [strategicPlanId]);

  useEffect(() => {
    fetchAlignments();
  }, [fetchAlignments]);

  const saveAlignment = useCallback(async (alignment) => {
    if (!user?.email) {
      toast.error('You must be logged in');
      return null;
    }

    setIsLoading(true);
    try {
      const alignmentData = {
        ...alignment,
        strategic_plan_id: strategicPlanId
      };

      if (alignment.id) {
        const { data, error } = await supabase
          .from('national_strategy_alignments')
          .update(alignmentData)
          .eq('id', alignment.id)
          .select()
          .single();

        if (error) throw error;
        setAlignments(prev => prev.map(a => a.id === alignment.id ? data : a));
        toast.success('Alignment updated');
        return data;
      } else {
        alignmentData.created_by = user.email;
        alignmentData.created_at = new Date().toISOString();
        
        const { data, error } = await supabase
          .from('national_strategy_alignments')
          .insert(alignmentData)
          .select()
          .single();

        if (error) throw error;
        setAlignments(prev => [...prev, data]);
        toast.success('Alignment created');
        return data;
      }
    } catch (err) {
      console.error('Error saving alignment:', err);
      toast.error('Failed to save alignment');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [strategicPlanId, user]);

  const saveBulkAlignments = useCallback(async (alignmentsArray) => {
    if (!user?.email) {
      toast.error('You must be logged in');
      return false;
    }

    setIsLoading(true);
    try {
      for (const alignment of alignmentsArray) {
        await saveAlignment(alignment);
      }
      toast.success('All alignments saved');
      return true;
    } catch (err) {
      console.error('Error saving alignments:', err);
      toast.error('Failed to save alignments');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [saveAlignment, user]);

  const deleteAlignment = useCallback(async (alignmentId) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('national_strategy_alignments')
        .delete()
        .eq('id', alignmentId);

      if (error) throw error;
      setAlignments(prev => prev.filter(a => a.id !== alignmentId));
      toast.success('Alignment deleted');
      return true;
    } catch (err) {
      console.error('Error deleting alignment:', err);
      toast.error('Failed to delete alignment');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getAlignmentsByType = useCallback((type) => {
    return alignments.filter(a => a.national_strategy_type === type);
  }, [alignments]);

  const getAlignmentScore = useCallback(() => {
    if (alignments.length === 0) return 0;
    const totalScore = alignments.reduce((sum, a) => sum + (a.alignment_score || 0), 0);
    return Math.round(totalScore / alignments.length);
  }, [alignments]);

  return {
    alignments,
    isLoading,
    error,
    fetchAlignments,
    saveAlignment,
    saveBulkAlignments,
    deleteAlignment,
    getAlignmentsByType,
    getAlignmentScore,
    setAlignments
  };
}
