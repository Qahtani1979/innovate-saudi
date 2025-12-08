import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { toast } from 'sonner';
import {
  Lightbulb, ThumbsUp, MessageSquare, TrendingUp, Plus,
  Search, MapPin, Calendar, User, Filter, Sparkles, Eye
} from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';
import AIPrioritySorter from '../components/citizen/AIPrioritySorter';
import AdvancedFilters from '../components/citizen/AdvancedFilters';

function PublicIdeasBoard() {
  const { language, isRTL, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [sortedIdeas, setSortedIdeas] = useState([]);
  const [advancedFilters, setAdvancedFilters] = useState({});
  const queryClient = useQueryClient();

  // Real-time updates every 30 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries(['public-ideas']);
    }, 30000);
    return () => clearInterval(interval);
  }, [queryClient]);

  const { data: ideas = [], isLoading } = useQuery({
    queryKey: ['public-ideas'],
    queryFn: async () => {
      const all = await base44.entities.CitizenIdea.list('-created_date', 200);
      return all.filter(i => ['submitted', 'under_review', 'approved'].includes(i.status));
    }
  });

  const voteMutation = useMutation({
    mutationFn: async (ideaId) => {
      const idea = ideas.find(i => i.id === ideaId);
      await base44.entities.CitizenIdea.update(ideaId, {
        vote_count: (idea.vote_count || 0) + 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['public-ideas']);
      toast.success(t({ en: 'Vote recorded!', ar: 'تم تسجيل التصويت!' }));
    }
  });

  const baseIdeas = sortedIdeas.length > 0 ? sortedIdeas : ideas;

  const filteredIdeas = baseIdeas.filter(idea => {
    const matchesSearch = idea.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         idea.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || idea.category === categoryFilter;
    
    // Advanced filters
    const voteCount = idea.vote_count || 0;
    const matchesMinVotes = !advancedFilters.minVotes || voteCount >= advancedFilters.minVotes;
    const matchesMaxVotes = !advancedFilters.maxVotes || voteCount <= advancedFilters.maxVotes;
    
    const createdDate = new Date(idea.created_date);
    const matchesFromDate = !advancedFilters.fromDate || createdDate >= new Date(advancedFilters.fromDate);
    const matchesToDate = !advancedFilters.toDate || createdDate <= new Date(advancedFilters.toDate);
    
    const priorityScore = idea.ai_classification?.priority_score || 0;
    const matchesPriority = !advancedFilters.priorityRange || advancedFilters.priorityRange === 'all' ||
      (advancedFilters.priorityRange === 'high' && priorityScore >= 80) ||
      (advancedFilters.priorityRange === 'medium' && priorityScore >= 50 && priorityScore < 80) ||
      (advancedFilters.priorityRange === 'low' && priorityScore < 50);
    
    const matchesEmbedding = !advancedFilters.hasEmbedding || advancedFilters.hasEmbedding === 'all' ||
      (advancedFilters.hasEmbedding === 'yes' && idea.embedding?.length > 0) ||
      (advancedFilters.hasEmbedding === 'no' && !idea.embedding?.length);
    
    const matchesSentiment = !advancedFilters.sentiment || advancedFilters.sentiment === 'all' ||
      idea.ai_classification?.sentiment === advancedFilters.sentiment;
    
    return matchesSearch && matchesCategory && matchesMinVotes && matchesMaxVotes && 
           matchesFromDate && matchesToDate && matchesPriority && matchesEmbedding && matchesSentiment;
  });

  const displayIdeas = [...filteredIdeas].sort((a, b) => {
    if (sortBy === 'recent') return new Date(b.created_date) - new Date(a.created_date);
    if (sortBy === 'popular') return (b.vote_count || 0) - (a.vote_count || 0);
    if (sortBy === 'trending') return (b.comment_count || 0) - (a.comment_count || 0);
    return 0;
  });

  const stats = {
    total: ideas.length,
    popular: ideas.filter(i => (i.vote_count || 0) > 10).length,
    thisMonth: ideas.filter(i => new Date(i.created_date) > new Date(Date.now() - 30*24*60*60*1000)).length
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-block p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-lg">
          <Lightbulb className="h-12 w-12 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-900 to-pink-700 bg-clip-text text-transparent">
          {t({ en: 'Community Ideas Board', ar: 'لوحة أفكار المجتمع' })}
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          {t({ 
            en: 'Share your ideas, vote on others, and help shape the future of your city', 
            ar: 'شارك أفكارك، صوّت على أفكار الآخرين، وساعد في تشكيل مستقبل مدينتك' 
          })}
        </p>
        <Link to={createPageUrl('PublicIdeaSubmission')}>
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg">
            <Plus className="h-5 w-5 mr-2" />
            {t({ en: 'Submit Your Idea', ar: 'أرسل فكرتك' })}
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
            <p className="text-sm text-slate-600 mt-1">{t({ en: 'Total Ideas', ar: 'إجمالي الأفكار' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-white border-green-200">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-green-600">{stats.popular}</p>
            <p className="text-sm text-slate-600 mt-1">{t({ en: 'Popular Ideas', ar: 'الأفكار الشائعة' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-purple-600">{stats.thisMonth}</p>
            <p className="text-sm text-slate-600 mt-1">{t({ en: 'This Month', ar: 'هذا الشهر' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Sorting */}
      <Card className="p-4">
        <AIPrioritySorter ideas={ideas} onSort={setSortedIdeas} />
      </Card>

      {/* Advanced Filters */}
      <AdvancedFilters filters={advancedFilters} onChange={setAdvancedFilters} />

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400`} />
            <Input
              placeholder={t({ en: 'Search ideas...', ar: 'ابحث عن الأفكار...' })}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={isRTL ? 'pr-10' : 'pl-10'}
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder={t({ en: 'Category', ar: 'الفئة' })} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t({ en: 'All', ar: 'الكل' })}</SelectItem>
              <SelectItem value="transport">{t({ en: 'Transport', ar: 'النقل' })}</SelectItem>
              <SelectItem value="environment">{t({ en: 'Environment', ar: 'البيئة' })}</SelectItem>
              <SelectItem value="digital_services">{t({ en: 'Digital', ar: 'رقمي' })}</SelectItem>
              <SelectItem value="safety">{t({ en: 'Safety', ar: 'السلامة' })}</SelectItem>
              <SelectItem value="health">{t({ en: 'Health', ar: 'الصحة' })}</SelectItem>
              <SelectItem value="other">{t({ en: 'Other', ar: 'أخرى' })}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <TrendingUp className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">{t({ en: 'Most Recent', ar: 'الأحدث' })}</SelectItem>
              <SelectItem value="popular">{t({ en: 'Most Popular', ar: 'الأكثر شعبية' })}</SelectItem>
              <SelectItem value="trending">{t({ en: 'Trending', ar: 'الرائج' })}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Ideas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayIdeas.map((idea) => (
          <Card key={idea.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <Badge variant="outline" className="capitalize">
                  {idea.category?.replace(/_/g, ' ')}
                </Badge>
                {idea.status === 'approved' && (
                  <Badge className="bg-green-100 text-green-700">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {t({ en: 'Approved', ar: 'معتمد' })}
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg leading-tight">{idea.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600 line-clamp-3">{idea.description}</p>

              <div className="flex items-center gap-4 text-xs text-slate-500">
                {idea.submitter_name && (
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {idea.submitter_name}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(idea.created_date).toLocaleDateString()}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t">
                <div className="flex items-center gap-4">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => voteMutation.mutate(idea.id)}
                    disabled={voteMutation.isPending}
                    className="gap-1"
                  >
                    <ThumbsUp className="h-4 w-4 text-green-600" />
                    <span className="font-medium">{idea.vote_count || 0}</span>
                  </Button>
                  <div className="flex items-center gap-1 text-sm text-slate-600">
                    <MessageSquare className="h-4 w-4" />
                    {idea.comment_count || 0}
                  </div>
                </div>
                <Link to={createPageUrl(`IdeaDetail?id=${idea.id}`)}>
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-1" />
                    {t({ en: 'View', ar: 'عرض' })}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default ProtectedPage(PublicIdeasBoard, { requiredPermissions: [] });