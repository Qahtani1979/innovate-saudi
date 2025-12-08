import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Bookmark } from 'lucide-react';
import { toast } from 'sonner';

export default function BookmarkButton({ entityType, entityId, entityName }) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    setIsBookmarked(bookmarks.some(b => b.entityType === entityType && b.entityId === entityId));
  }, [entityType, entityId]);

  const toggleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    
    if (isBookmarked) {
      const updated = bookmarks.filter(b => !(b.entityType === entityType && b.entityId === entityId));
      localStorage.setItem('bookmarks', JSON.stringify(updated));
      setIsBookmarked(false);
      toast.success('Removed from bookmarks');
    } else {
      bookmarks.push({ 
        entityType, 
        entityId, 
        entityName, 
        bookmarkedAt: new Date().toISOString() 
      });
      localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
      setIsBookmarked(true);
      toast.success('Added to bookmarks');
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleBookmark}
      className={isBookmarked ? 'text-yellow-600' : 'text-slate-400'}
    >
      <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
    </Button>
  );
}