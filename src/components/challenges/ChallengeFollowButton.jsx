import { Button } from "@/components/ui/button";
import { Bell, BellOff } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useChallengeFollow } from '@/hooks/useChallengeMutations'; // We will add this to the hooks file

export default function ChallengeFollowButton({ challengeId, variant = "outline", size = "sm" }) {
  const { user } = useAuth();

  // New Hook Usage
  const { isFollowing, follow, unfollow, isLoading } = useChallengeFollow(challengeId);

  if (!user) return null;

  const handleToggle = () => {
    if (isFollowing) unfollow();
    else follow();
  };

  return (
    <Button
      onClick={handleToggle}
      disabled={isLoading}
      variant={variant}
      size={size}
      className={isFollowing ? 'bg-blue-600 text-white' : ''}
    >
      {isFollowing ? <BellOff className="h-4 w-4 mr-2" /> : <Bell className="h-4 w-4 mr-2" />}
      {isFollowing ? 'Following' : 'Follow'}
    </Button>
  );
}