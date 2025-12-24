import { useProgramPilotLinks } from '@/hooks/useProgramPilotLinks';
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from '../components/LanguageContext';
import { CheckCircle2, TrendingUp, Loader2 } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';

function ConversionFunnel() {
  const { t } = useLanguage();

  const { data: programLinks = [], isLoading } = useProgramPilotLinks();

  const funnelStages = [
    { stage: 'enrolled', count: programLinks.length, label: t({ en: 'Enrolled', ar: 'مسجل' }), color: 'bg-blue-600' },
    { stage: 'active', count: programLinks.filter(pl => pl?.['participation_status'] === 'active').length, label: t({ en: 'Active', ar: 'نشط' }), color: 'bg-purple-600' },
    { stage: 'completed', count: programLinks.filter(pl => pl?.['participation_status'] === 'completed').length, label: t({ en: 'Completed', ar: 'مكتمل' }), color: 'bg-amber-600' },
    { stage: 'in_progress', count: programLinks.filter(pl => pl?.['conversion_status'] === 'in_progress').length, label: t({ en: 'Pilot In Progress', ar: 'تجربة قيد التنفيذ' }), color: 'bg-green-600' },
    { stage: 'converted', count: programLinks.filter(pl => pl?.['conversion_status'] === 'converted').length, label: t({ en: 'Converted to Pilot', ar: 'تحول لتجربة' }), color: 'bg-green-700' }
  ];

  const overallConversion = programLinks.length > 0
    ? (funnelStages[4].count / programLinks.length) * 100
    : 0;

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
        title={{ en: 'Conversion Funnel', ar: 'مسار التحويل' }}
        subtitle={{ en: 'Program participant → Pilot conversion journey', ar: 'رحلة تحويل المشارك في البرنامج إلى تجربة' }}
        icon={<TrendingUp className="h-6 w-6 text-white" />}
        description=""
        action={null}
        actions={null}
        stats={[
          { icon: CheckCircle2, value: `${overallConversion.toFixed(1)}%`, label: { en: 'Conversion Rate', ar: 'معدل التحويل' } }
        ]}
      />

      <div className="space-y-4">
        {funnelStages.map((stage, idx) => {
          const percentage = programLinks.length > 0 ? (stage.count / programLinks.length) * 100 : 0;
          const dropoff = idx > 0 ? funnelStages[idx - 1].count - stage.count : 0;
          const dropoffRate = idx > 0 && funnelStages[idx - 1].count > 0
            ? (dropoff / funnelStages[idx - 1].count) * 100
            : 0;

          return (
            <Card key={stage.stage}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-12 h-12 ${stage.color} rounded-lg flex items-center justify-center text-white font-bold text-xl`}>
                        {idx + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{stage.label}</h3>
                        <p className="text-sm text-slate-600">{stage.count} {t({ en: 'participants', ar: 'مشارك' })}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-900">{percentage.toFixed(0)}%</p>
                    {dropoff > 0 && (
                      <p className="text-xs text-red-600">-{dropoff} ({dropoffRate.toFixed(0)}%)</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PageLayout>
  );
}

export default ProtectedPage(ConversionFunnel, { requireAdmin: true });
