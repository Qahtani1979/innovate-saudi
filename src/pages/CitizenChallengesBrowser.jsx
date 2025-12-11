import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/components/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Target, Calendar, Building2, ArrowRight, ThumbsUp, MessageSquare, Bookmark, Send } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/hooks/use-toast';
import ProtectedPage from '../components/permissions/ProtectedPage';

function CitizenChallengesBrowser() {
  const { language, isRTL, t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');

  const { data: challenges = [], isLoading } = useQuery({
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

  // Get user's votes
  const { data: userVotes = [] } = useQuery({
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

  // Get user's bookmarks
  const { data: userBookmarks = [] } = useQuery({
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
    if (!user?.email) return;
    try {
      const isVoted = userVotes.includes(challengeId);
      if (isVoted) {
        await supabase
          .from('citizen_votes')
          .delete()
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
    } catch (err) {
      toast({ title: t({ en: 'Error voting', ar: 'خطأ في التصويت' }), variant: 'destructive' });
    }
  };

  const handleBookmark = async (challengeId) => {
    if (!user?.email) return;
    try {
      const isBookmarked = userBookmarks.includes(challengeId);
      if (isBookmarked) {
        await supabase
          .from('bookmarks')
          .delete()
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
    } catch (err) {
      toast({ title: t({ en: 'Error', ar: 'خطأ' }), variant: 'destructive' });
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-green-100 text-green-700';
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Target className="h-5 w-5 text-primary" />
            </div>
            {t({ en: 'Browse Challenges', ar: 'تصفح التحديات' })}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t({ en: 'Explore municipal challenges and submit your innovative solutions', ar: 'استكشف التحديات البلدية وقدم حلولك المبتكرة' })}
          </p>
        </div>
        <Link to="/challenge-idea-response">
          <Button className="gap-2">
            <Send className="h-4 w-4" />
            {t({ en: 'Submit Proposal', ar: 'تقديم مقترح' })}
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className={`absolute top-3 h-4 w-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
              <Input
                placeholder={t({ en: 'Search challenges...', ar: 'ابحث عن التحديات...' })}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={isRTL ? 'pr-10' : 'pl-10'}
              />
            </div>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="px-4 py-2 border rounded-md bg-background"
            >
              <option value="all">{t({ en: 'All Sectors', ar: 'جميع القطاعات' })}</option>
              {sectors.map(sector => (
                <option key={sector} value={sector}>{sector}</option>
              ))}
            </select>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-4 py-2 border rounded-md bg-background"
            >
              <option value="all">{t({ en: 'All Priorities', ar: 'جميع الأولويات' })}</option>
              <option value="critical">{t({ en: 'Critical', ar: 'حرج' })}</option>
              <option value="high">{t({ en: 'High', ar: 'عالي' })}</option>
              <option value="medium">{t({ en: 'Medium', ar: 'متوسط' })}</option>
              <option value="low">{t({ en: 'Low', ar: 'منخفض' })}</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{challenges.length}</p>
            <p className="text-sm text-muted-foreground">{t({ en: 'Total Challenges', ar: 'إجمالي التحديات' })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{challenges.filter(c => c.priority === 'critical').length}</p>
            <p className="text-sm text-muted-foreground">{t({ en: 'Critical', ar: 'حرجة' })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{userVotes.length}</p>
            <p className="text-sm text-muted-foreground">{t({ en: 'Your Votes', ar: 'تصويتاتك' })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{userBookmarks.length}</p>
            <p className="text-sm text-muted-foreground">{t({ en: 'Bookmarked', ar: 'محفوظة' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Challenges Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-1/4 mb-4" />
                <div className="h-6 bg-muted rounded w-3/4 mb-3" />
                <div className="h-4 bg-muted rounded w-full mb-2" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredChallenges.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {t({ en: 'No challenges found', ar: 'لم يتم العثور على تحديات' })}
            </h3>
            <p className="text-muted-foreground">
              {t({ en: 'Try adjusting your search or filters.', ar: 'حاول تعديل البحث أو الفلاتر.' })}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChallenges.map(challenge => (
            <Card key={challenge.id} className="hover:shadow-lg transition-shadow group">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  {challenge.priority && (
                    <Badge className={getPriorityColor(challenge.priority)}>
                      {challenge.priority}
                    </Badge>
                  )}
                  {challenge.sector && (
                    <Badge variant="outline">{challenge.sector}</Badge>
                  )}
                  {challenge.status && (
                    <Badge variant="secondary">{challenge.status}</Badge>
                  )}
                </div>
                
                <h3 className="font-bold text-lg text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
                  {language === 'ar' && challenge.title_ar ? challenge.title_ar : challenge.title_en}
                </h3>
                
                <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                  {language === 'ar' && challenge.description_ar ? challenge.description_ar : challenge.description_en}
                </p>
                
                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                  {challenge.municipalities && (
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      <span>
                        {language === 'ar' && challenge.municipalities.name_ar 
                          ? challenge.municipalities.name_ar 
                          : challenge.municipalities.name_en}
                      </span>
                    </div>
                  )}
                  {challenge.created_at && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(challenge.created_at).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}</span>
                    </div>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-4 border-t">
                  <Button
                    variant={userVotes.includes(challenge.id) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleVote(challenge.id)}
                    className="flex-1 gap-1"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    {t({ en: 'Vote', ar: 'صوّت' })}
                  </Button>
                  <Button
                    variant={userBookmarks.includes(challenge.id) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleBookmark(challenge.id)}
                  >
                    <Bookmark className="h-4 w-4" />
                  </Button>
                  <Link to={`/challenge-idea-response?challengeId=${challenge.id}`}>
                    <Button size="sm" className="gap-1">
                      <Send className="h-4 w-4" />
                      {t({ en: 'Respond', ar: 'استجب' })}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProtectedPage(CitizenChallengesBrowser, { requiredPermissions: [] });
