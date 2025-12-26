import { useStrategiesWithVisibility } from '@/hooks/useStrategiesWithVisibility';
import { useStrategicLinks } from '@/hooks/useStrategicLinks';
import { useChallengesWithVisibility } from '@/hooks/useChallengesWithVisibility';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Target, Network, CheckCircle2, TrendingUp, Loader2 } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';

function InitiativeMap() {
  const { t } = useLanguage();

  const { links, isLoading: isLinksLoading } = useStrategicLinks();
  const { data: plans = [], isLoading: isPlansLoading } = useStrategiesWithVisibility();
  const { data: challenges = [], isLoading: isChallengesLoading } = useChallengesWithVisibility();

  const isLoading = isLinksLoading || isPlansLoading || isChallengesLoading;

  const stats = {
    total_initiatives: plans.length,
    linked_challenges: links.length,
    aligned: (links || []).filter(l => l?.['alignment_status'] === 'aligned').length,
    contributing: (links || []).filter(l => l?.['contribution_level'] === 'high').length
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        title={{ en: 'Initiative Map', ar: 'خريطة المبادرات' }}
        subtitle={{ en: 'Visual map of strategic initiatives and linked challenges', ar: 'خريطة مرئية للمبادرات الاستراتيجية والتحديات المرتبطة' }}
        icon={<TrendingUp className="h-6 w-6 text-white" />}
        description=""
        action={null}
        actions={null}
        stats={[
          { icon: Target, value: stats.total_initiatives, label: { en: 'Initiatives', ar: 'المبادرات' } },
          { icon: Network, value: stats.linked_challenges, label: { en: 'Linked Challenges', ar: 'التحديات المرتبطة' } },
          { icon: CheckCircle2, value: stats.aligned, label: { en: 'Aligned', ar: 'متوافق' } },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Strategic Initiatives', ar: 'المبادرات الاستراتيجية' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {plans.map(plan => {
              const planLinks = (links || []).filter(l => l?.['strategic_plan_id'] === plan?.['id']);
              const aligned = planLinks.filter(l => l?.['alignment_status'] === 'aligned').length;

              return (
                <div key={plan.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-900">{plan?.['name_en'] || plan?.['title_en'] || plan?.['name_ar'] || plan?.['title_ar']}</h3>
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
    </PageLayout>
  );
}

export default ProtectedPage(InitiativeMap, { requireAdmin: true });
