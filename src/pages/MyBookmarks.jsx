import { useMyBookmarks } from '@/hooks/useMyBookmarks';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bookmark, Trash2, ExternalLink, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage } from '@/components/LanguageContext';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';
import { useAuth } from '@/lib/AuthContext';
import { StandardPagination } from '@/components/ui/StandardPagination';
import { EntityListSkeleton } from '@/components/ui/skeletons/EntityListSkeleton';

export default function MyBookmarks() {
  const { t } = useLanguage();
  const { user } = useAuth();

  return <MyBookmarksContent user={user} />;
}

// Inner component to handle state properly if we want to separate concerns
// OR simply implement state in the main component. 
// Let's implement directly for simplicity but note the state requirement.

import { useState } from 'react';

function MyBookmarksContent({ user }) {
  const { t } = useLanguage();
  const [page, setPage] = useState(1);

  // Pass page to hook (we need to update useMyBookmarks to accept options)
  const {
    bookmarks,
    isLoading,
    isEmpty,
    totalPages,
    removeMutation,
    clearAllMutation
  } = useMyBookmarks(user?.id, page);

  const getEntityPage = (entityType) => {
    // Mapping... (kept same)
    const pageMap = {
      Challenge: 'ChallengeDetail',
      challenge: 'ChallengeDetail',
      Pilot: 'PilotDetail',
      pilot: 'PilotDetail',
      Solution: 'SolutionDetail',
      solution: 'SolutionDetail',
      Program: 'ProgramDetail',
      program: 'ProgramDetail',
      RDProject: 'RDProjectDetail',
      rd_project: 'RDProjectDetail',
      Sandbox: 'SandboxDetail',
      sandbox: 'SandboxDetail',
      LivingLab: 'LivingLabDetail',
      living_lab: 'LivingLabDetail',
      Organization: 'OrganizationDetail',
      organization: 'OrganizationDetail',
      CitizenIdea: 'IdeaDetail',
      citizen_idea: 'IdeaDetail'
    };
    return pageMap[entityType] || 'Home';
  };

  if (!user) {
    return (
      <PageLayout>
        <PageHeader
          title={{ en: 'My Bookmarks', ar: 'إشاراتي المرجعية' }}
          subtitle={{ en: 'Please login to view your bookmarks', ar: 'يرجى تسجيل الدخول لعرض الإشارات المرجعية' }}
          icon={<Bookmark className="h-6 w-6 text-white" />}
          description=""
          action={null}
        />
        <Card>
          <CardContent className="py-12 text-center">
            <Bookmark className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">
              {t({ en: 'Please login to view and manage your bookmarks.', ar: 'يرجى تسجيل الدخول لعرض وإدارة الإشارات المرجعية.' })}
            </p>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        title={{ en: 'My Bookmarks', ar: 'إشاراتي المرجعية' }}
        subtitle={{ en: 'Quick access to your saved items', ar: 'وصول سريع للعناصر المحفوظة' }}
        icon={<Bookmark className="h-6 w-6 text-white" />}
        description=""
        action={
          bookmarks.length > 0 && (
            <Button
              variant="outline"
              onClick={() => clearAllMutation.mutate()}
              className="bg-white/50"
              disabled={clearAllMutation.isPending}
            >
              {clearAllMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              {t({ en: 'Clear All', ar: 'مسح الكل' })}
            </Button>
          )
        }
      />

      {isLoading ? (
        <EntityListSkeleton mode="grid" rowCount={6} />
      ) : isEmpty ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bookmark className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">
              {t({ en: 'No bookmarks yet. Click the bookmark icon on any item to save it here.', ar: 'لا توجد إشارات بعد. انقر على أيقونة الإشارة لحفظ العنصر.' })}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {bookmarks.map((bookmark) => (
              <Card key={bookmark.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{bookmark.entity_type}</Badge>
                        <Badge className="text-xs bg-slate-600">
                          {new Date(bookmark.created_at).toLocaleDateString()}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-slate-900 mb-3">
                        {bookmark.notes || `${bookmark.entity_type} item`}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Link to={createPageUrl(getEntityPage(bookmark.entity_type)) + `?id=${bookmark.entity_id}`}>
                          <Button size="sm">
                            <ExternalLink className="h-3 w-3 mr-2" />
                            {t({ en: 'View', ar: 'عرض' })}
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeMutation.mutate(bookmark.id)}
                          disabled={removeMutation.isPending}
                        >
                          {removeMutation.isPending ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3 text-red-600" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <StandardPagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </PageLayout>
  );
}
