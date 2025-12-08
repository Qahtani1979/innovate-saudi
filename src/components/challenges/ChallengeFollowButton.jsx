import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Bell, BellOff } from 'lucide-react';
import { toast } from 'sonner';

export default function ChallengeFollowButton({ challengeId, variant = "outline", size = "sm" }) {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: follows = [] } = useQuery({
    queryKey: ['challenge-follows', user?.email],
    queryFn: () => base44.entities.UserFollow.filter({
      follower_email: user.email,
      entity_type: 'challenge',
      entity_id: challengeId
    }),
    enabled: !!user
  });

  const isFollowing = follows.length > 0;

  const followMutation = useMutation({
    mutationFn: async () => {
      if (isFollowing) {
        await base44.entities.UserFollow.delete(follows[0].id);
      } else {
        await base44.entities.UserFollow.create({
          follower_email: user.email,
          entity_type: 'challenge',
          entity_id: challengeId,
          notification_preferences: {
            status_changes: true,
            new_proposals: true,
            pilot_created: true
          }
        });
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