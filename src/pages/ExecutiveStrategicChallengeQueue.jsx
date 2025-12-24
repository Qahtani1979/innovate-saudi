
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Target, Zap, AlertTriangle, TrendingUp } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { toast } from 'sonner';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';

function ExecutiveStrategicChallengeQueue() {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();

  const { data: challenges = [] } = useQuery({
    queryKey: ['strategic-challenges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .order('overall_score', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    }
  });

  const fastTrackMutation = useMutation({
    mutationFn: async (challengeId) => {
      const { error } = await supabase
        .from('challenges')
        .update({
          priority: 'tier_1',
          is_featured: true
        })
        .eq('id', challengeId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['strategic-challenges']);
      toast.success(t({ en: 'Challenge fast-tracked!', ar: 'تم تسريع التحدي!' }));
    }
  });

  const strategicChallenges = challenges.filter(c =>
    c.strategic_plan_ids?.length > 0 ||
    c.priority === 'tier_1' ||
    c.is_featured ||
    c.overall_score >= 80
  );

  const highImpact = strategicChallenges.filter(c => c.impact_score >= 80);
  const needingAttention = strategicChallenges.filter(c =>
    c.status === 'under_review' || (c.status === 'approved' && !c.track)
  );

  return (
    <PageLayout>
      <PageHeader
        icon={Target}
        title={{ en: 'Executive Strategic Challenge Queue', ar: 'قائمة التحديات الاستراتيجية التنفيذية' }}
        description={{ en: 'High-priority challenges aligned with national strategic objectives', ar: 'التحديات عالية الأولوية المتوافقة مع الأهداف الاستراتيجية الوطنية' }}
        stats={[
          { icon: Target, value: strategicChallenges.length, label: { en: 'Strategic', ar: 'استراتيجي' } },
          { icon: AlertTriangle, value: needingAttention.length, label: { en: 'Need Attention', ar: 'تحتاج اهتمام' } },
          { icon: TrendingUp, value: highImpact.length, label: { en: 'High Impact', ar: 'تأثير عالي' } }
        ]}
      />

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200">
          <CardContent className="pt-6 text-center">
            <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">{strategicChallenges.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Strategic Challenges', ar: 'تحديات استراتيجية' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-white border-2 border-red-200">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-red-600">{needingAttention.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Need Attention', ar: 'تحتاج اهتمام' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white border-2 border-green-200">
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{highImpact.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'High Impact', ar: 'تأثير عالي' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200">
          <CardContent className="pt-6 text-center">
            <Zap className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">
              {strategicChallenges.filter(c => c.is_featured).length}
            </p>
            <p className="text-sm text-slate-600">{t({ en: 'Fast-Tracked', ar: 'معجّل' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Strategic Challenges List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
            {t({ en: 'Strategic Priority Challenges', ar: 'التحديات ذات الأولوية الاستراتيجية' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {strategicChallenges.length === 0 ? (
            <p className="text-center text-slate-500 py-8">
              {t({ en: 'No strategic challenges found', ar: 'لم يتم العثور على تحديات استراتيجية' })}
            </p>
          ) : (
            strategicChallenges.map((challenge) => (
              <div key={challenge.id} className="p-4 border-2 rounded-lg hover:bg-slate-50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{challenge.code}</Badge>
                      {challenge.is_featured && (
                        <Badge className="bg-purple-600">
                          <Zap className="h-3 w-3 mr-1" />
                          {t({ en: 'Fast-Track', ar: 'معجّل' })}
                        </Badge>
                      )}
                      <Badge className={
                        challenge.priority === 'tier_1' ? 'bg-red-600' :
                          challenge.priority === 'tier_2' ? 'bg-orange-600' :
                            'bg-blue-600'
                      }>
                        {challenge.priority}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-slate-900 text-lg">{challenge.title_en}</h3>
                    <p className="text-sm text-slate-600 mt-1 line-clamp-2">{challenge.description_en}</p>

                    <div className="flex gap-4 mt-3 text-xs text-slate-600">
                      <div>
                        <strong>{t({ en: 'Sector:', ar: 'القطاع:' })}</strong> {challenge.sector?.replace(/_/g, ' ')}
                      </div>
                      <div>
                        <strong>{t({ en: 'Impact:', ar: 'التأثير:' })}</strong> {challenge.impact_score}/100
                      </div>
                      <div>
                        <strong>{t({ en: 'Status:', ar: 'الحالة:' })}</strong> {challenge.status}
                      </div>
                    </div>

                    {challenge.strategic_plan_ids?.length > 0 && (
                      <div className="mt-2">
                        <Badge variant="outline" className="text-xs">
                          <Target className="h-3 w-3 mr-1" />
                          {challenge.strategic_plan_ids.length} {t({ en: 'strategic objective(s)', ar: 'هدف استراتيجي' })}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  {!challenge.is_featured && (
                    <Button
                      size="sm"
                      onClick={() => fastTrackMutation.mutate(challenge.id)}
                      disabled={fastTrackMutation.isPending}
                      className="bg-purple-600"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      {t({ en: 'Fast-Track', ar: 'تسريع' })}
                    </Button>
                  )}
                  <Link to={createPageUrl(`ChallengeDetail?id=${challenge.id}`)}>
                    <Button size="sm" variant="outline">
                      {t({ en: 'Review', ar: 'مراجعة' })}
                    </Button>
                  </Link>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </PageLayout>
  );
}

export default ProtectedPage(ExecutiveStrategicChallengeQueue, { requireAdmin: true });