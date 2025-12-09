import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from '../components/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import {
  Lightbulb, Heart, MessageSquare, Award, TrendingUp, CheckCircle2,
  Clock, XCircle, AlertCircle, Target, Sparkles, Trophy, Star, Users
} from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';
import FirstActionRecommender from '../components/onboarding/FirstActionRecommender';
import ProfileCompletenessCoach from '../components/onboarding/ProfileCompletenessCoach';

function CitizenDashboard() {
  const { user, userProfile } = useAuth();
  const { language, isRTL, t } = useLanguage();
  const citizenEmail = user?.email;

  // Fetch citizen ideas
  const { data: myIdeas = [] } = useQuery({
    queryKey: ['my-ideas', citizenEmail],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('citizen_ideas')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  // Fetch citizen votes
  const { data: myVotes = [] } = useQuery({
    queryKey: ['my-votes', citizenEmail],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('citizen_votes')
        .select('*')
        .eq('user_id', user?.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  // Fetch citizen points
  const { data: myPoints } = useQuery({
    queryKey: ['my-points', citizenEmail],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('citizen_points')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Fetch notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ['my-notifications', citizenEmail],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('citizen_notifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  const statusIcons = {
    submitted: { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
    under_review: { icon: AlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    approved: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
    rejected: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
    converted_to_challenge: { icon: Target, color: 'text-purple-600', bg: 'bg-purple-50' }
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {t({ en: 'My Citizen Dashboard', ar: 'لوحة مساهماتي' })}
          </h1>
          <p className="text-slate-600 mt-1">
            {t({ en: 'Track your ideas, votes, and contributions', ar: 'تابع أفكارك وتصويتاتك ومساهماتك' })}
          </p>
        </div>
        <Link to={createPageUrl('PublicIdeaSubmission')}>
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
            <Lightbulb className="h-4 w-4 mr-2" />
            {t({ en: 'Submit New Idea', ar: 'قدم فكرة جديدة' })}
          </Button>
        </Link>
      </div>

      {/* Profile Coach & Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">{t({ en: 'Ideas Submitted', ar: 'الأفكار المقدمة' })}</p>
                  <p className="text-3xl font-bold text-purple-600 mt-1">{myIdeas.length}</p>
                </div>
                <Lightbulb className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-50 to-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">{t({ en: 'Votes Cast', ar: 'الأصوات المدلى بها' })}</p>
                  <p className="text-3xl font-bold text-pink-600 mt-1">{myVotes.length}</p>
                </div>
                <Heart className="h-8 w-8 text-pink-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">{t({ en: 'Total Points', ar: 'النقاط الكلية' })}</p>
                  <p className="text-3xl font-bold text-amber-600 mt-1">{myPoints?.points || 0}</p>
                </div>
                <Trophy className="h-8 w-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-teal-50 to-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">{t({ en: 'Ideas Converted', ar: 'الأفكار المحولة' })}</p>
                  <p className="text-3xl font-bold text-teal-600 mt-1">
                    {myIdeas.filter(i => i.status === 'converted_to_challenge').length}
                  </p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-teal-600" />
              </div>
            </CardContent>
          </Card>
        </div>
        <div>
          <ProfileCompletenessCoach profile={userProfile} role="citizen" />
        </div>
      </div>

      {/* First Action Recommender */}
      <FirstActionRecommender user={{ role: 'citizen', email: user?.email || '' }} />

      {/* Level & Badges */}
      {myPoints && (
        <Card className="border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <Award className="h-5 w-5" />
              {t({ en: 'Your Impact Level', ar: 'مستوى تأثيرك' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <Star className="h-10 w-10 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-2xl font-bold text-amber-900 capitalize">{myPoints.level} Level</p>
                <div className="flex gap-2 mt-2">
                  {myPoints.badges_earned?.slice(0, 5).map((badge, i) => (
                    <Badge key={i} className="bg-amber-100 text-amber-700">
                      {badge}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600">{t({ en: 'National Rank', ar: 'الترتيب الوطني' })}</p>
                <p className="text-2xl font-bold text-purple-600">#{myPoints.rank_national || '—'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="ideas" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ideas">
            <Lightbulb className="h-4 w-4 mr-2" />
            {t({ en: 'My Ideas', ar: 'أفكاري' })}
          </TabsTrigger>
          <TabsTrigger value="votes">
            <Heart className="h-4 w-4 mr-2" />
            {t({ en: 'My Votes', ar: 'تصويتاتي' })}
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <MessageSquare className="h-4 w-4 mr-2" />
            {t({ en: 'Updates', ar: 'التحديثات' })}
          </TabsTrigger>
        </TabsList>

        {/* My Ideas Tab */}
        <TabsContent value="ideas" className="space-y-4">
          {myIdeas.length > 0 ? (
            myIdeas.map((idea) => {
              const statusInfo = statusIcons[idea.status] || statusIcons.submitted;
              const StatusIcon = statusInfo.icon;
              
              return (
                <Link key={idea.id} to={createPageUrl(`IdeaDetail?id=${idea.id}`)}>
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`p-2 rounded-lg ${statusInfo.bg}`}>
                              <StatusIcon className={`h-4 w-4 ${statusInfo.color}`} />
                            </div>
                            <Badge className="capitalize">{idea.status?.replace(/_/g, ' ')}</Badge>
                            {idea.vote_count > 0 && (
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Heart className="h-3 w-3" />
                                {idea.vote_count}
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-semibold text-slate-900">{idea.title}</h3>
                          <p className="text-sm text-slate-600 mt-1 line-clamp-2">{idea.description}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                            <span>{new Date(idea.created_date).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>{idea.category}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Lightbulb className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 mb-4">{t({ en: 'No ideas submitted yet', ar: 'لم تقدم أي أفكار بعد' })}</p>
                <Link to={createPageUrl('PublicIdeaSubmission')}>
                  <Button>{t({ en: 'Submit Your First Idea', ar: 'قدم فكرتك الأولى' })}</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* My Votes Tab */}
        <TabsContent value="votes" className="space-y-4">
          {myVotes.length > 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-slate-600">
                  {t({ en: `You've voted on ${myVotes.length} ideas`, ar: `لقد صوت على ${myVotes.length} فكرة` })}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Heart className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 mb-4">{t({ en: 'No votes cast yet', ar: 'لم تصوت بعد' })}</p>
                <Link to={createPageUrl('PublicIdeasBoard')}>
                  <Button>{t({ en: 'Browse Ideas', ar: 'تصفح الأفكار' })}</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          {notifications.length > 0 ? (
            notifications.map((notif) => (
              <Card key={notif.id} className={notif.is_read ? 'opacity-60' : ''}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">
                        {language === 'ar' && notif.title_ar ? notif.title_ar : notif.title_en}
                      </p>
                      <p className="text-sm text-slate-600 mt-1">
                        {language === 'ar' && notif.message_ar ? notif.message_ar : notif.message_en}
                      </p>
                      <p className="text-xs text-slate-500 mt-2">
                        {new Date(notif.created_date).toLocaleString()}
                      </p>
                    </div>
                    {notif.action_url && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={notif.action_url}>{t({ en: 'View', ar: 'عرض' })}</a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">{t({ en: 'No notifications yet', ar: 'لا توجد إشعارات بعد' })}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ProtectedPage(CitizenDashboard, { requiredPermissions: [] });