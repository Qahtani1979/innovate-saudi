import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Target, Network, CheckCircle2, TrendingUp } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

function InitiativeMap() {
  const { t } = useLanguage();

  const { data: links = [], isLoading } = useQuery({
    queryKey: ['strategic-plan-challenge-links'],
    queryFn: () => base44.entities.StrategicPlanChallengeLink.list()
  });

  const { data: plans = [] } = useQuery({
    queryKey: ['strategic-plans'],
    queryFn: () => base44.entities.StrategicPlan.list()
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => base44.entities.Challenge.list()
  });

  const stats = {
    total_initiatives: plans.length,
    linked_challenges: links.length,
    aligned: links.filter(l => l.alignment_status === 'aligned').length,
    contributing: links.filter(l => l.contribution_level === 'high').length
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {t({ en: 'Initiative Map', ar: 'خريطة المبادرات' })}
        </h1>
        <p className="text-slate-600 mt-1">
          {t({ en: 'Visual map of strategic initiatives and linked challenges', ar: 'خريطة مرئية للمبادرات الاستراتيجية والتحديات المرتبطة' })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Target className="h-10 w-10 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{stats.total_initiatives}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Initiatives', ar: 'المبادرات' })}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200">
          <CardContent className="pt-6 text-center">
            <Network className="h-10 w-10 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">{stats.linked_challenges}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Linked Challenges', ar: 'التحديات المرتبطة' })}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-10 w-10 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{stats.aligned}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Aligned', ar: 'متوافق' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-10 w-10 text-amber-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-amber-600">{stats.contributing}</p>
            <p className="text-xs text-slate-600">{t({ en: 'High Impact', ar: 'تأثير عالي' })}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Strategic Initiatives', ar: 'المبادرات الاستراتيجية' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {plans.map(plan => {
              const planLinks = links.filter(l => l.strategic_plan_id === plan.id);
              const aligned = planLinks.filter(l => l.alignment_status === 'aligned').length;

              return (
                <div key={plan.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-900">{plan.name_en || plan.title_en || plan.name_ar || plan.title_ar}</h3>
                      <Badge variant="outline" className="mt-1">{plan.status}</Badge>
                    </div>
                    <Badge className="bg-blue-600">
                      {planLinks.length} {t({ en: 'challenges', ar: 'تحدي' })}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-slate-600">
                      {aligned} {t({ en: 'aligned', ar: 'متوافق' })} ({planLinks.length > 0 ? ((aligned / planLinks.length) * 100).toFixed(0) : 0}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(InitiativeMap, { requireAdmin: true });