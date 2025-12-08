import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bookmark, Trash2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useLanguage } from '../components/LanguageContext';
import { toast } from 'sonner';

export default function MyBookmarks() {
  const { t, isRTL } = useLanguage();
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = () => {
    const stored = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    setBookmarks(stored.sort((a, b) => new Date(b.bookmarkedAt) - new Date(a.bookmarkedAt)));
  };

  const removeBookmark = (entityType, entityId) => {
    const updated = bookmarks.filter(b => !(b.entityType === entityType && b.entityId === entityId));
    localStorage.setItem('bookmarks', JSON.stringify(updated));
    setBookmarks(updated);
    toast.success(t({ en: 'Bookmark removed', ar: 'تمت الإزالة' }));
  };

  const clearAll = () => {
    localStorage.setItem('bookmarks', '[]');
    setBookmarks([]);
    toast.success(t({ en: 'All bookmarks cleared', ar: 'تم مسح جميع الإشارات' }));
  };

  const getEntityPage = (entityType) => {
    const pageMap = {
      Challenge: 'ChallengeDetail',
      Pilot: 'PilotDetail',
      Solution: 'SolutionDetail',
      Program: 'ProgramDetail',
      RDProject: 'RDProjectDetail',
      Sandbox: 'SandboxDetail',
      LivingLab: 'LivingLabDetail',
      Organization: 'OrganizationDetail',
      CitizenIdea: 'IdeaDetail'
    };
    return pageMap[entityType] || 'Home';
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">
            {t({ en: 'My Bookmarks', ar: 'إشاراتي المرجعية' })}
          </h1>
          <p className="text-slate-600 mt-2">
            {t({ en: 'Quick access to your saved items', ar: 'وصول سريع للعناصر المحفوظة' })}
          </p>
        </div>
        {bookmarks.length > 0 && (
          <Button variant="outline" onClick={clearAll}>
            <Trash2 className="h-4 w-4 mr-2" />
            {t({ en: 'Clear All', ar: 'مسح الكل' })}
          </Button>
        )}
      </div>

      {bookmarks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bookmark className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">
              {t({ en: 'No bookmarks yet. Click the bookmark icon on any item to save it here.', ar: 'لا توجد إشارات بعد. انقر على أيقونة الإشارة لحفظ العنصر.' })}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bookmarks.map((bookmark, idx) => (
            <Card key={idx} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{bookmark.entityType}</Badge>
                      <Badge className="text-xs bg-slate-600">
                        {new Date(bookmark.bookmarkedAt).toLocaleDateString()}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-3">{bookmark.entityName}</h3>
                    <div className="flex items-center gap-2">
                      <Link to={createPageUrl(getEntityPage(bookmark.entityType)) + `?id=${bookmark.entityId}`}>
                        <Button size="sm">
                          <ExternalLink className="h-3 w-3 mr-2" />
                          {t({ en: 'View', ar: 'عرض' })}
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeBookmark(bookmark.entityType, bookmark.entityId)}
                      >
                        <Trash2 className="h-3 w-3 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}