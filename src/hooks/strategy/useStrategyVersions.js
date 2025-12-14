import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useStrategyVersions(planId) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: versions, isLoading, error } = useQuery({
    queryKey: ['strategy-versions', planId],
    queryFn: async () => {
      let query = supabase
        .from('strategy_versions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (planId) {
        query = query.eq('strategic_plan_id', planId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: true
  });

  const createVersion = useMutation({
    mutationFn: async (versionData) => {
      const { data, error } = await supabase
        .from('strategy_versions')
        .insert([versionData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategy-versions'] });
      toast({
        title: 'Version Created',
        description: 'New version has been saved'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const updateVersion = useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { data, error } = await supabase
        .from('strategy_versions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategy-versions'] });
      toast({
        title: 'Version Updated',
        description: 'Changes saved successfully'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const restoreVersion = useMutation({
    mutationFn: async (versionId) => {
      // Mark current approved as superseded
      const currentApproved = versions?.find(v => v.status === 'approved');
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
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategy-versions'] });
      toast({
        title: 'Version Restored',
        description: 'Previous version has been restored as current'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

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
    getNextVersionNumber
  };
}
