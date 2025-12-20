import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { toast } from 'sonner';
import {
  Lightbulb, ThumbsUp, TrendingUp, Plus, Calendar, Loader2, ArrowRight
} from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAuth } from '@/lib/AuthContext';
import { 
  CitizenPageLayout, 
  CitizenPageHeader, 
  CitizenSearchFilter, 
  CitizenCardGrid, 
  CitizenEmptyState 
} from '@/components/citizen/CitizenPageLayout';

function PublicIdeasBoard() {
  const { language, isRTL, t } = useLanguage();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState('grid');
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries(['public-ideas']);
    }, 30000);
    return () => clearInterval(interval);
  }, [queryClient]);

  const { data: ideas = [], isLoading } = useQuery({
    queryKey: ['public-ideas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('citizen_ideas')
        .select('*')
        .in('status', ['submitted', 'under_review', 'approved'])
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return data || [];
    }
  });

  const { data: userVotes = [], refetch: refetchVotes } = useQuery({
    queryKey: ['idea-votes', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from('citizen_votes')
        .select('entity_id')
        .eq('user_id', user.id)
        .eq('entity_type', 'idea');
      return data?.map(v => v.entity_id) || [];
    },
    enabled: !!user?.id
  });

  const voteMutation = useMutation({
    mutationFn: async (ideaId) => {
      if (!user?.id) throw new Error('Not logged in');
      const isVoted = userVotes.includes(ideaId);
      
      if (isVoted) {
        await supabase.from('citizen_votes').delete()
          .eq('user_id', user.id)
          .eq('entity_id', ideaId)
          .eq('entity_type', 'idea');
      } else {
        await supabase.from('citizen_votes').insert({
          user_id: user.id,
          user_email: user.email,
          entity_id: ideaId,
          entity_type: 'idea',
          vote_type: 'upvote'
        });
      }

      // Update vote count
      const idea = ideas.find(i => i.id === ideaId);
      const newCount = isVoted ? (idea?.votes_count || 1) - 1 : (idea?.votes_count || 0) + 1;
      await supabase.from('citizen_ideas').update({ votes_count: newCount }).eq('id', ideaId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['public-ideas']);
      refetchVotes();
      toast.success(t({ en: 'Vote recorded!', ar: 'تم تسجيل التصويت!' }));
    },
    onError: () => {
      toast.error(t({ en: 'Please login to vote', ar: 'يرجى تسجيل الدخول للتصويت' }));
    }
  });

  const categories = [
    { value: 'transport', label: t({ en: 'Transport', ar: 'النقل' }) },
    { value: 'environment', label: t({ en: 'Environment', ar: 'البيئة' }) },
    { value: 'digital_services', label: t({ en: 'Digital Services', ar: 'الخدمات الرقمية' }) },
    { value: 'public_safety', label: t({ en: 'Public Safety', ar: 'السلامة العامة' }) },
    { value: 'urban_planning', label: t({ en: 'Urban Planning', ar: 'التخطيط العمراني' }) },
    { value: 'other', label: t({ en: 'Other', ar: 'أخرى' }) },
  ];

  const filteredIdeas = ideas.filter(idea => {
    const matchesSearch = !searchTerm || 
      idea.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      idea.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || idea.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const sortedIdeas = [...filteredIdeas].sort((a, b) => {
    if (sortBy === 'recent') return new Date(b.created_at) - new Date(a.created_at);
    if (sortBy === 'popular') return (b.votes_count || 0) - (a.votes_count || 0);
    return 0;
  });

  const stats = {
    total: ideas.length,
    popular: ideas.filter(i => (i.votes_count || 0) > 10).length,
    thisMonth: ideas.filter(i => new Date(i.created_at) > new Date(Date.now() - 30*24*60*60*1000)).length
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'under_review': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    }
  };

  const activeFiltersCount = categoryFilter !== 'all' ? 1 : 0;

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
        icon={Lightbulb}
        title={t({ en: 'Ideas Board', ar: 'لوحة الأفكار' })}
        description={t({ en: 'Share your ideas, vote on others, and help shape the future of your city', ar: 'شارك أفكارك، صوّت على أفكار الآخرين، وساعد في تشكيل مستقبل مدينتك' })}
        stats={[
          { value: stats.total, label: t({ en: 'Total Ideas', ar: 'إجمالي الأفكار' }), icon: Lightbulb },
          { value: stats.popular, label: t({ en: 'Popular', ar: 'شائعة' }), icon: TrendingUp },
          { value: stats.thisMonth, label: t({ en: 'This Month', ar: 'هذا الشهر' }), icon: Calendar },
        ]}
        action={
          <Link to={createPageUrl('CitizenIdeaSubmission')}>
            <Button className="gap-2 bg-gradient-to-r from-slate-600 to-gray-500 hover:opacity-90 text-white shadow-lg">
              <Plus className="h-4 w-4" />
              {t({ en: 'Submit Your Idea', ar: 'أرسل فكرتك' })}
            </Button>
          </Link>
        }
      />

      <CitizenSearchFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder={t({ en: 'Search ideas...', ar: 'ابحث عن الأفكار...' })}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        activeFilters={activeFiltersCount}
        onClearFilters={() => setCategoryFilter('all')}
        filters={[
          {
            label: t({ en: 'Category', ar: 'الفئة' }),
            placeholder: t({ en: 'Category', ar: 'الفئة' }),
            value: categoryFilter,
            onChange: setCategoryFilter,
            options: categories
          }
        ]}
      />

      {/* Sort options */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{t({ en: 'Sort by:', ar: 'ترتيب حسب:' })}</span>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[140px] bg-background/80 border-border/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover border shadow-lg">
            <SelectItem value="recent">{t({ en: 'Most Recent', ar: 'الأحدث' })}</SelectItem>
            <SelectItem value="popular">{t({ en: 'Most Popular', ar: 'الأكثر شيوعاً' })}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <CitizenCardGrid 
        viewMode={viewMode}
        emptyState={
          <CitizenEmptyState
            icon={Lightbulb}
            title={t({ en: 'No ideas found', ar: 'لم يتم العثور على أفكار' })}
            description={t({ en: 'Be the first to share your idea!', ar: 'كن أول من يشارك فكرته!' })}
            action={
              <Link to={createPageUrl('CitizenIdeaSubmission')}>
                <Button className="bg-gradient-to-r from-slate-600 to-gray-500 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  {t({ en: 'Submit Idea', ar: 'إرسال فكرة' })}
                </Button>
              </Link>
            }
          />
        }
      >
        {sortedIdeas.map(idea => (
          <Card 
            key={idea.id} 
            className={`group overflow-hidden border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 ${
              viewMode === 'list' ? 'flex flex-row' : ''
            }`}
          >
            <CardContent className={`p-5 ${viewMode === 'list' ? 'flex items-center gap-6 w-full' : ''}`}>
              <div className={viewMode === 'list' ? 'flex-1' : ''}>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge className={getStatusColor(idea.status)}>
                      {idea.status?.replace(/_/g, ' ')}
                    </Badge>
                    {idea.category && (
                      <Badge variant="outline" className="text-xs">
                        {categories.find(c => c.value === idea.category)?.label || idea.category}
                      </Badge>
                    )}
                  </div>
                </div>

                <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {idea.title}
                </h3>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {idea.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(idea.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`gap-1 ${userVotes.includes(idea.id) ? 'text-primary' : 'text-muted-foreground'}`}
                      onClick={() => voteMutation.mutate(idea.id)}
                      disabled={voteMutation.isPending}
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span className="font-medium">{idea.votes_count || 0}</span>
                    </Button>
                  </div>
                </div>

                <Link to={`/idea-detail?id=${idea.id}`} className="block mt-3">
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

export default ProtectedPage(PublicIdeasBoard, { requiredPermissions: [] });
