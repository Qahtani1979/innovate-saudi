import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Bell, BellOff } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';

export default function ChallengeFollowButton({ challengeId, variant = "outline", size = "sm" }) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: follows = [] } = useQuery({
    queryKey: ['challenge-follows', user?.email],
    queryFn: async () => {
      const { data } = await supabase.from('user_follows').select('*')
        .eq('follower_email', user.email)
        .eq('entity_type', 'challenge')
        .eq('entity_id', challengeId);
      return data || [];
    },
    enabled: !!user
  });

  const isFollowing = follows.length > 0;

  const followMutation = useMutation({
    mutationFn: async () => {
      if (isFollowing) {
        const { error } = await supabase.from('user_follows').delete().eq('id', follows[0].id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('user_follows').insert({
          follower_email: user.email,
          entity_type: 'challenge',
          entity_id: challengeId,
          notification_preferences: {
            status_changes: true,
            new_proposals: true,
            pilot_created: true
          }
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenge-follows'] });
      toast.success(isFollowing ? 'Unfollowed challenge' : 'Following challenge - you\'ll get updates');
    }
  });

  if (!user) return null;

  return (
    <Button
      onClick={() => followMutation.mutate()}
      disabled={followMutation.isPending}
      variant={variant}
      size={size}
      className={isFollowing ? 'bg-blue-600 text-white' : ''}
    >
      {isFollowing ? <BellOff className="h-4 w-4 mr-2" /> : <Bell className="h-4 w-4 mr-2" />}
      {isFollowing ? 'Following' : 'Follow'}
    </Button>
  );
}