import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/lib/AuthContext';
import { ThumbsUp, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ChallengeVoting({ challengeId, initialVotes = 0 }) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: userVote } = useQuery({
    queryKey: ['user-vote', challengeId, user?.email],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('citizen_votes')
        .select('*')
        .eq('user_email', user?.email)
        .eq('entity_type', 'challenge')
        .eq('entity_id', challengeId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const voteMutation = useMutation({
    mutationFn: async () => {
      if (userVote) {
        // Unvote - delete the vote
        const { error: deleteError } = await supabase
          .from('citizen_votes')
          .delete()
          .eq('id', userVote.id);
        if (deleteError) throw deleteError;
        
        // Update challenge vote count
        const { error: updateError } = await supabase
          .from('challenges')
          .update({ citizen_votes_count: Math.max(0, (initialVotes || 0) - 1) })
          .eq('id', challengeId);
        if (updateError) throw updateError;
      } else {
        // Vote - insert new vote
        const { error: insertError } = await supabase
          .from('citizen_votes')
          .insert({
            user_email: user.email,
            user_id: user.id,
            entity_type: 'challenge',
            entity_id: challengeId,
            vote_type: 'upvote'
          });
        if (insertError) throw insertError;
        
        // Update challenge vote count
        const { error: updateError } = await supabase
          .from('challenges')
          .update({ citizen_votes_count: (initialVotes || 0) + 1 })
          .eq('id', challengeId);
        if (updateError) throw updateError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-vote'] });
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      toast.success(userVote ? 'Vote removed' : 'Vote recorded');
    }
  });

  const hasVoted = !!userVote;
  const voteCount = initialVotes || 0;

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={() => voteMutation.mutate()}
        disabled={voteMutation.isPending || !user}
        variant={hasVoted ? 'default' : 'outline'}
        size="sm"
        className={hasVoted ? 'bg-blue-600' : ''}
      >
        {voteMutation.isPending ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <ThumbsUp className={`h-4 w-4 mr-2 ${hasVoted ? 'fill-current' : ''}`} />
        )}
        {hasVoted ? 'Voted' : 'Vote'}
      </Button>
      <Badge variant="outline" className="text-sm">
        {voteCount} {voteCount === 1 ? 'vote' : 'votes'}
      </Badge>
    </div>
  );
}