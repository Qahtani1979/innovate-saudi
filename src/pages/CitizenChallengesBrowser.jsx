import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/components/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, Calendar, Building2, ArrowRight, ThumbsUp, Bookmark, Send, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/hooks/use-toast';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { 
  CitizenPageLayout, 
  CitizenPageHeader, 
  CitizenSearchFilter, 
  CitizenCardGrid, 
  CitizenEmptyState 
} from '@/components/citizen/CitizenPageLayout';

function CitizenChallengesBrowser() {
  const { language, isRTL, t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  const { data: challenges = [], isLoading, refetch } = useQuery({
    queryKey: ['citizen-challenges-browser'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('challenges')
        .select('*, municipalities(name_en, name_ar)')
        .eq('is_published', true)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const { data: userVotes = [], refetch: refetchVotes } = useQuery({
    queryKey: ['citizen-challenge-votes', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const { data, error } = await supabase
        .from('citizen_votes')
        .select('entity_id')
        .eq('user_email', user.email)
        .eq('entity_type', 'challenge');
      if (error) throw error;
      return data?.map(v => v.entity_id) || [];
    },
    enabled: !!user?.email
  });

  const { data: userBookmarks = [], refetch: refetchBookmarks } = useQuery({
    queryKey: ['citizen-challenge-bookmarks', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const { data, error } = await supabase
        .from('bookmarks')
        .select('entity_id')
        .eq('user_email', user.email)
        .eq('entity_type', 'challenge');
      if (error) throw error;
      return data?.map(b => b.entity_id) || [];
    },
    enabled: !!user?.email
  });

  const sectors = [...new Set(challenges.map(c => c.sector).filter(Boolean))];
  const priorities = ['critical', 'high', 'medium', 'low'];

  const filteredChallenges = challenges.filter(c => {
    const sectorMatch = selectedSector === 'all' || c.sector === selectedSector;
    const priorityMatch = selectedPriority === 'all' || c.priority === selectedPriority;
    const searchMatch = !searchTerm || 
      c.title_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title_ar?.includes(searchTerm) ||
      c.description_en?.toLowerCase().includes(searchTerm.toLowerCase());
    return sectorMatch && priorityMatch && searchMatch;
  });

  const handleVote = async (challengeId) => {
    if (!user?.email) {
      toast({ title: t({ en: 'Please login to vote', ar: 'يرجى تسجيل الدخول للتصويت' }), variant: 'destructive' });
      return;
    }
    try {
      const isVoted = userVotes.includes(challengeId);
      if (isVoted) {
        await supabase.from('citizen_votes').delete()
          .eq('user_email', user.email)
          .eq('entity_id', challengeId)
          .eq('entity_type', 'challenge');
        toast({ title: t({ en: 'Vote removed', ar: 'تم إزالة التصويت' }) });
      } else {
        await supabase.from('citizen_votes').insert({
          user_email: user.email,
          user_id: user.id,
          entity_id: challengeId,
          entity_type: 'challenge',
          vote_type: 'upvote'
        });
        toast({ title: t({ en: 'Voted!', ar: 'تم التصويت!' }) });
      }
      refetchVotes();
    } catch (err) {
      toast({ title: t({ en: 'Error voting', ar: 'خطأ في التصويت' }), variant: 'destructive' });
    }
  };

  const handleBookmark = async (challengeId) => {
    if (!user?.email) {
      toast({ title: t({ en: 'Please login to bookmark', ar: 'يرجى تسجيل الدخول للحفظ' }), variant: 'destructive' });
      return;
    }
    try {
      const isBookmarked = userBookmarks.includes(challengeId);
      if (isBookmarked) {
        await supabase.from('bookmarks').delete()
          .eq('user_email', user.email)
          .eq('entity_id', challengeId)
          .eq('entity_type', 'challenge');
        toast({ title: t({ en: 'Bookmark removed', ar: 'تم إزالة الإشارة' }) });
      } else {
        await supabase.from('bookmarks').insert({
          user_email: user.email,
          entity_id: challengeId,
          entity_type: 'challenge'
        });
        toast({ title: t({ en: 'Bookmarked!', ar: 'تم حفظ الإشارة!' }) });
      }
      refetchBookmarks();
    } catch (err) {
      toast({ title: t({ en: 'Error', ar: 'خطأ' }), variant: 'destructive' });
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'high': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    }
  };

  const activeFiltersCount = (selectedSector !== 'all' ? 1 : 0) + (selectedPriority !== 'all' ? 1 : 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <CitizenPageLayout>
      <CitizenPageHeader
        icon={Target}
        title={t({ en: 'Browse Challenges', ar: 'تصفح التحديات' })}
        description={t({ en: 'Explore municipal challenges and submit your innovative solutions', ar: 'استكشف التحديات البلدية وقدم حلولك المبتكرة' })}
        stats={[
          { value: challenges.length, label: t({ en: 'Challenges', ar: 'تحدي' }), icon: Target },
          { value: challenges.filter(c => c.priority === 'critical' || c.priority === 'high').length, label: t({ en: 'High Priority', ar: 'أولوية عالية' }) },
        ]}
        action={
          <Link to="/challenge-idea-response">
            <Button className="gap-2 bg-gradient-to-r from-slate-600 to-gray-500 hover:opacity-90 text-white shadow-lg">
              <Send className="h-4 w-4" />
              {t({ en: 'Submit Proposal', ar: 'تقديم مقترح' })}
            </Button>
          </Link>
        }
      />

      <CitizenSearchFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder={t({ en: 'Search challenges...', ar: 'ابحث عن التحديات...' })}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        activeFilters={activeFiltersCount}
        onClearFilters={() => { setSelectedSector('all'); setSelectedPriority('all'); }}
        filters={[
          {
            label: t({ en: 'Sectors', ar: 'القطاعات' }),
            placeholder: t({ en: 'Sector', ar: 'القطاع' }),
            value: selectedSector,
            onChange: setSelectedSector,
            options: sectors.map(s => ({ value: s, label: s }))
          },
          {
            label: t({ en: 'Priority', ar: 'الأولوية' }),
            placeholder: t({ en: 'Priority', ar: 'الأولوية' }),
            value: selectedPriority,
            onChange: setSelectedPriority,
            options: priorities.map(p => ({ value: p, label: t({ en: p.charAt(0).toUpperCase() + p.slice(1), ar: p }) }))
          }
        ]}
      />

      <CitizenCardGrid 
        viewMode={viewMode}
        emptyState={
          <CitizenEmptyState
            icon={Target}
            title={t({ en: 'No challenges found', ar: 'لم يتم العثور على تحديات' })}
            description={t({ en: 'Try adjusting your filters or check back later', ar: 'حاول تعديل الفلاتر أو تحقق لاحقاً' })}
          />
        }
      >
        {filteredChallenges.map(challenge => (
          <Card 
            key={challenge.id} 
            className={`group overflow-hidden border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 ${
              viewMode === 'list' ? 'flex flex-row' : ''
            }`}
          >
            <CardContent className={`p-5 ${viewMode === 'list' ? 'flex items-center gap-6 w-full' : ''}`}>
              <div className={viewMode === 'list' ? 'flex-1' : ''}>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge className={getPriorityColor(challenge.priority)}>
                      {challenge.priority || 'medium'}
                    </Badge>
                    {challenge.sector && (
                      <Badge variant="outline" className="text-xs">
                        {challenge.sector}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-8 w-8 p-0 ${userVotes.includes(challenge.id) ? 'text-primary' : 'text-muted-foreground'}`}
                      onClick={(e) => { e.preventDefault(); handleVote(challenge.id); }}
                    >
                      <ThumbsUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-8 w-8 p-0 ${userBookmarks.includes(challenge.id) ? 'text-amber-500' : 'text-muted-foreground'}`}
                      onClick={(e) => { e.preventDefault(); handleBookmark(challenge.id); }}
                    >
                      <Bookmark className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {language === 'ar' ? (challenge.title_ar || challenge.title_en) : (challenge.title_en || challenge.title_ar)}
                </h3>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {language === 'ar' ? (challenge.description_ar || challenge.description_en) : (challenge.description_en || challenge.description_ar)}
                </p>

                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                  {challenge.municipalities?.name_en && (
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {language === 'ar' ? challenge.municipalities.name_ar : challenge.municipalities.name_en}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(challenge.created_at).toLocaleDateString()}
                  </span>
                </div>

                <Link to={`/challenge-detail?id=${challenge.id}`}>
                  <Button variant="outline" size="sm" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {t({ en: 'View Details', ar: 'عرض التفاصيل' })}
                    <ArrowRight className={`h-4 w-4 ${isRTL ? 'mr-2 rotate-180' : 'ml-2'}`} />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </CitizenCardGrid>
    </CitizenPageLayout>
  );
}

export default ProtectedPage(CitizenChallengesBrowser, { requiredPermissions: [] });
