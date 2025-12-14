import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useStrategyVersions(planId) {
  const { toast } = useToast();

  const [versions, setVersions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVersions = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('strategy_versions')
        .select('*')
        .order('created_at', { ascending: false });

      if (planId) {
        query = query.eq('strategic_plan_id', planId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setVersions(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching versions', err);
      setError(err);
      toast({
        title: 'Error loading versions',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [planId, toast]);

  useEffect(() => {
    fetchVersions();
  }, [fetchVersions]);

  const [createPending, setCreatePending] = useState(false);
  const [updatePending, setUpdatePending] = useState(false);
  const [restorePending, setRestorePending] = useState(false);

  const createVersion = {
    isPending: createPending,
    mutateAsync: async (versionData) => {
      setCreatePending(true);
      try {
        const { data, error } = await supabase
          .from('strategy_versions')
          .insert([versionData])
          .select()
          .single();

        if (error) throw error;
        setVersions((prev) => [data, ...prev]);

        toast({
          title: 'Version Created',
          description: 'New version has been saved',
        });

        return data;
      } catch (err) {
        console.error('Error creating version', err);
        toast({
          title: 'Error',
          description: err.message,
          variant: 'destructive',
        });
        throw err;
      } finally {
        setCreatePending(false);
      }
    },
  };

  const updateVersion = {
    isPending: updatePending,
    mutateAsync: async ({ id, ...updates }) => {
      setUpdatePending(true);
      try {
        const { data, error } = await supabase
          .from('strategy_versions')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        setVersions((prev) => prev.map((v) => (v.id === id ? data : v)));

        toast({
          title: 'Version Updated',
          description: 'Changes saved successfully',
        });

        return data;
      } catch (err) {
        console.error('Error updating version', err);
        toast({
          title: 'Error',
          description: err.message,
          variant: 'destructive',
        });
        throw err;
      } finally {
        setUpdatePending(false);
      }
    },
  };

  const restoreVersion = {
    isPending: restorePending,
    mutateAsync: async (versionId) => {
      setRestorePending(true);
      try {
        // Mark current approved as superseded
        const currentApproved = versions.find((v) => v.status === 'approved');
        if (currentApproved) {
          await supabase
            .from('strategy_versions')
            .update({ status: 'superseded' })
            .eq('id', currentApproved.id);
        }

        // Mark selected version as approved
        const { data, error } = await supabase
          .from('strategy_versions')
          .update({ status: 'approved' })
          .eq('id', versionId)
          .select()
          .single();

        if (error) throw error;

        setVersions((prev) =>
          prev.map((v) => {
            if (v.id === versionId) return data;
            if (v.id === currentApproved?.id) return { ...v, status: 'superseded' };
            return v;
          })
        );

        toast({
          title: 'Version Restored',
          description: 'Previous version has been restored as current',
        });

        return data;
      } catch (err) {
        console.error('Error restoring version', err);
        toast({
          title: 'Error',
          description: err.message,
          variant: 'destructive',
        });
        throw err;
      } finally {
        setRestorePending(false);
      }
    },
  };

  const getNextVersionNumber = () => {
    if (!versions || versions.length === 0) return '1.0.0';
    const latest = versions[0]?.version_number || '1.0.0';
    const [major, minor] = latest.split('.').map(Number);
    return `${major}.${minor + 1}.0`;
  };

  return {
    versions,
    isLoading,
    error,
    createVersion,
    updateVersion,
    restoreVersion,
    getNextVersionNumber,
    refetch: fetchVersions,
  };
}
