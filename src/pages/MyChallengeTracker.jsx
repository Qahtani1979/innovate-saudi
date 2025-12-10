import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { AlertCircle, CheckCircle2, Clock, TrendingUp, Heart, Lightbulb } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAuth } from '@/components/auth/AuthContext';

function MyChallengeTracker() {
  const { language, isRTL, t } = useLanguage();
  const { user } = useAuth();

  // Get challenges created from user's ideas
  const { data: myIdeas = [] } = useQuery({
    queryKey: ['my-ideas', user?.email],
    queryFn: async () => {
      const { data } = await supabase.from('citizen_ideas').select('*').eq('created_by', user?.email);
      return data || [];
    },
    enabled: !!user
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges-from-my-ideas', myIdeas],
    queryFn: async () => {
      const myIdeaIds = myIdeas.map(i => i.id);
      if (myIdeaIds.length === 0) return [];
      const { data } = await supabase.from('challenges').select('*').in('citizen_origin_idea_id', myIdeaIds);
      return data || [];
    },
    enabled: myIdeas.length > 0
  });

  const statusBreakdown = {
    draft: challenges.filter(c => c.status === 'draft').length,
    submitted: challenges.filter(c => c.status === 'submitted').length,
    under_review: challenges.filter(c => c.status === 'under_review').length,
    approved: challenges.filter(c => c.status === 'approved').length,
    in_treatment: challenges.filter(c => c.status === 'in_treatment').length,
    resolved: challenges.filter(c => c.status === 'resolved').length
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-900 to-teal-900 bg-clip-text text-transparent">
          {t({ en: 'My Challenge Tracker', ar: 'متتبع تحدياتي' })}
        </h1>
        <p className="text-slate-600 mt-2">
          {t({ en: 'Track challenges created from your ideas', ar: 'تتبع التحديات المنشأة من أفكارك' })}
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200">
          <CardContent className="pt-6 text-center">
            <Lightbulb className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{myIdeas.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'My Ideas', ar: 'أفكاري' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200">
          <CardContent className="pt-6 text-center">
            <Heart className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">{challenges.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Became Challenges', ar: 'أصبحت تحديات' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white border-2 border-amber-200">
          <CardContent className="pt-6 text-center">
            <Clock className="h-8 w-8 text-amber-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-amber-600">{statusBreakdown.in_treatment}</p>
            <p className="text-sm text-slate-600">{t({ en: 'In Treatment', ar: 'قيد المعالجة' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white border-2 border-green-200">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{statusBreakdown.resolved}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Resolved', ar: 'محلول' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Challenges List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t({ en: 'Challenges From Your Ideas', ar: 'التحديات من أفكارك' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {challenges.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">
                {t({ en: 'No challenges created from your ideas yet', ar: 'لم يتم إنشاء تحديات من أفكارك بعد' })}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {challenges.map((challenge) => (
                <div key={challenge.id} className="p-4 border-2 rounded-lg hover:bg-slate-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="font-mono">{challenge.code}</Badge>
                        <Badge className={
                          challenge.status === 'resolved' ? 'bg-green-100 text-green-700' :
                          challenge.status === 'in_treatment' ? 'bg-purple-100 text-purple-700' :
                          challenge.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'
                        }>
                          {challenge.status?.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-slate-900">{challenge.title_en}</h3>
                      <p className="text-sm text-slate-600 mt-1 line-clamp-2">{challenge.description_en}</p>

                      {challenge.status === 'in_treatment' && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-slate-600">
                              {t({ en: 'Treatment Progress', ar: 'تقدم المعالجة' })}
                            </span>
                            <span className="text-xs font-medium text-purple-600">65%</span>
                          </div>
                          <Progress value={65} className="h-2" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">
                        {challenge.sector?.replace(/_/g, ' ')}
                      </Badge>
                      {challenge.linked_pilot_ids?.length > 0 && (
                        <Badge className="bg-teal-100 text-teal-700 text-xs">
                          {challenge.linked_pilot_ids.length} {t({ en: 'pilot(s)', ar: 'تجربة' })}
                        </Badge>
                      )}
                    </div>
                    <Link to={createPageUrl(`ChallengeDetail?id=${challenge.id}`)}>
                      <Button size="sm" variant="outline">
                        {t({ en: 'View Details', ar: 'عرض التفاصيل' })}
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(MyChallengeTracker, { requiredPermissions: [] });