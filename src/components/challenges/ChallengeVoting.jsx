import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/lib/AuthContext';
import { ThumbsUp, Loader2 } from 'lucide-react';
import { useChallengeVoting } from '@/hooks/useChallengeVoting';

export default function ChallengeVoting({ challengeId, initialVotes = 0 }) {
  const { user } = useAuth();
  const { hasVoted, voteCount, isLoading, toggleVote } = useChallengeVoting(challengeId, initialVotes);

  // Use passed initialVotes for display if we are purely optimistic, 
  // but usually we rely on the parent to update the count via React Query invalidation
  // In this specific implementation, 'voteCount' from hook is just 'initialVotes' passed through,
  // but if we wanted real-time, we'd fetch it in the hook.
  // For now, consistent with previous behavior.

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={toggleVote}
        disabled={isLoading || !user}
        variant={hasVoted ? 'default' : 'outline'}
        size="sm"
        className={hasVoted ? 'bg-blue-600' : ''}
      >
        {isLoading ? (
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
