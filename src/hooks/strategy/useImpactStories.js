import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

export function useImpactStories(options = {}) {
  const { strategicPlanId, entityType, entityId, publishedOnly = false, featuredOnly = false } = options;
  const queryClient = useAppQueryClient();

  const { data: stories = [], isLoading, error } = useQuery({
    queryKey: ['impact-stories', strategicPlanId, entityType, entityId, publishedOnly, featuredOnly],
    queryFn: async () => {
      let query = supabase
        .from('impact_stories')
        .select('*')
        .order('created_at', { ascending: false });

      if (strategicPlanId) {
        query = query.eq('strategic_plan_id', strategicPlanId);
      }
      if (entityType) {
        query = query.eq('entity_type', entityType);
      }
      if (entityId) {
        query = query.eq('entity_id', entityId);
      }
      if (publishedOnly) {
        query = query.eq('is_published', true);
      }
      if (featuredOnly) {
        query = query.eq('is_featured', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  const createStory = useMutation({
    mutationFn: async (storyData) => {
      const { data, error } = await supabase
        .from('impact_stories')
        .insert([storyData])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['impact-stories'] });
    }
  });

  const updateStory = useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { data, error } = await supabase
        .from('impact_stories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['impact-stories'] });
    }
  });

  const publishStory = useMutation({
    mutationFn: async (id) => {
      const { data, error } = await supabase
        .from('impact_stories')
        .update({ 
          is_published: true, 
          published_date: new Date().toISOString() 
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['impact-stories'] });
    }
  });

  const incrementViewCount = useMutation({
    mutationFn: async (id) => {
      const { data, error } = await supabase.rpc('increment_story_view', { story_id: id });
      if (error) {
        // Fallback if RPC doesn't exist
        const story = stories.find(s => s.id === id);
        if (story) {
          await supabase
            .from('impact_stories')
            .update({ view_count: (story.view_count || 0) + 1 })
            .eq('id', id);
        }
      }
      return data;
    }
  });

  const deleteStory = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('impact_stories')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['impact-stories'] });
    }
  });

  return {
    stories,
    isLoading,
    error,
    createStory: createStory.mutateAsync,
    updateStory: updateStory.mutateAsync,
    publishStory: publishStory.mutateAsync,
    deleteStory: deleteStory.mutateAsync,
    incrementViewCount: incrementViewCount.mutate,
    isCreating: createStory.isPending,
    isUpdating: updateStory.isPending
  };
}

export default useImpactStories;

