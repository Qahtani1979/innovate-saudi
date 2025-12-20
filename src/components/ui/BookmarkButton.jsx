import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Bookmark, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';

export default function BookmarkButton({ entityType, entityId, entityName }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: bookmark, isLoading } = useQuery({
    queryKey: ['bookmark', entityType, entityId, user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_email', user.email)
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.email && !!entityId
  });

  const toggleMutation = useMutation({
    mutationFn: async () => {
      if (!user?.email) throw new Error('Login required');
      
      if (bookmark) {
        // Remove bookmark
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('id', bookmark.id);
        if (error) throw error;
      } else {
        // Add bookmark
        const { error } = await supabase
          .from('bookmarks')
          .insert({
            user_email: user.email,
            entity_type: entityType,
            entity_id: entityId,
            notes: entityName || null
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['bookmark', entityType, entityId]);
      queryClient.invalidateQueries(['user-bookmarks']);
      toast.success(bookmark ? 'Removed from bookmarks' : 'Added to bookmarks');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update bookmark');
    }
  });

  const isBookmarked = !!bookmark;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => toggleMutation.mutate()}
      disabled={toggleMutation.isPending || isLoading || !user}
      className={isBookmarked ? 'text-yellow-600' : 'text-slate-400'}
      title={user ? (isBookmarked ? 'Remove bookmark' : 'Add bookmark') : 'Login to bookmark'}
    >
      {toggleMutation.isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
      )}
    </Button>
  );
}
