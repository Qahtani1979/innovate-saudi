import { Button } from "@/components/ui/button";
import { Bookmark, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useBookmarks } from '@/hooks/useBookmarks';

/**
 * BookmarkButton
 * ✅ GOLD STANDARD COMPLIANT
 */
export default function BookmarkButton({ entityType, entityId, entityName }) {
  const { user } = useAuth();
  const { bookmarks, isLoading, toggleBookmark } = useBookmarks(user?.email);

  // Check if this specific entity is bookmarked
  const bookmark = bookmarks.find(b =>
    b.entity_type === entityType && b.entity_id === entityId
  );

  const isBookmarked = !!bookmark;

  const handleToggle = () => {
    if (!user) return;
    toggleBookmark.mutate({ entityType, entityId, entityName });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      disabled={toggleBookmark.isPending || isLoading || !user}
      className={isBookmarked ? 'text-yellow-600' : 'text-slate-400'}
      title={user ? (isBookmarked ? 'Remove bookmark' : 'Add bookmark') : 'Login to bookmark'}
    >
      {toggleBookmark.isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
      )}
    </Button>
  );
}
