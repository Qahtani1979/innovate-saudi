import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { TrendingUp, AlertCircle } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { usePartnershipById } from '@/hooks/usePartnerships';

export default function PartnershipPerformanceDashboard({ partnershipId }) {
  const { language, t } = useLanguage();

  const { data: partnership } = usePartnershipById(partnershipId);

  if (!partnership) return null;

  const completedMilestones = partnership.milestones?.filter(m => m.status === 'completed').length || 0;
  const totalMilestones = partnership.milestones?.length || 1;
  const milestoneProgress = Math.round((completedMilestones / totalMilestones) * 100);

  const overdueMilestones = partnership.milestones?.filter(m =>
    m.status !== 'completed' && new Date(m.due_date) < new Date()
  ).length || 0;

  const kpisOnTrack = partnership.kpis?.filter(k => {
    if (!k.target || !k.current) return false;
    const targetNum = parseFloat(k.target);
    const currentNum = parseFloat(k.current);
    return currentNum >= targetNum * 0.8;
  }).length || 0;

  const totalKPIs = partnership.kpis?.length || 1;
  const kpiProgress = Math.round((kpisOnTrack / totalKPIs) * 100);

  const daysSinceContact = partnership.engagement_history?.length > 0
    ? Math.floor((new Date() - new Date(partnership.engagement_history[partnership.engagement_history.length - 1].date)) / (1000 * 60 * 60 * 24))
    : 0;

  const communicationScore = daysSinceContact <= 7 ? 100 : daysSinceContact <= 14 ? 75 : daysSinceContact <= 30 ? 50 : 25;

  const healthScore = Math.round(
    (milestoneProgress * 0.4) + (kpiProgress * 0.4) + (communicationScore * 0.2)
  );

  const getHealthColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-4">
      <Card className="border-2 border-indigo-300">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-600" />
            {t({ en: 'Partnership Health', ar: 'صحة الشراكة' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-300 text-center">
            <p className="text-5xl font-bold text-indigo-600 mb-2">{healthScore}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Health Score', ar: 'درجة الصحة' })}</p>
            <Badge className={healthScore >= 80 ? 'bg-green-600 mt-2' : healthScore >= 60 ? 'bg-yellow-600 mt-2' : 'bg-red-600 mt-2'}>
              {healthScore >= 80 ? 'Excellent' : healthScore >= 60 ? 'Good' : 'Needs Attention'}
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-white rounded border">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-900">
                  {t({ en: 'Milestone Progress', ar: 'تقدم المعالم' })}
                </span>
                <span className={`text-xl font-bold ${getHealthColor(milestoneProgress)}`}>
                  {completedMilestones}/{totalMilestones}
                </span>
              </div>
              <Progress value={milestoneProgress} className="h-2" />
              {overdueMilestones > 0 && (
                <p className="text-xs text-red-600 mt-2">
                  <AlertCircle className="h-3 w-3 inline mr-1" />
                  {overdueMilestones} {t({ en: 'overdue', ar: 'متأخر' })}
                </p>
              )}
            </div>

            <div className="p-4 bg-white rounded border">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-900">
                  {t({ en: 'KPI Achievement', ar: 'إنجاز المؤشرات' })}
                </span>
                <span className={`text-xl font-bold ${getHealthColor(kpiProgress)}`}>
                  {kpisOnTrack}/{totalKPIs}
                </span>
              </div>
              <Progress value={kpiProgress} className="h-2" />
            </div>

            <div className="p-4 bg-white rounded border">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-900">
                  {t({ en: 'Communication', ar: 'التواصل' })}
                </span>
                <span className={`text-xl font-bold ${getHealthColor(communicationScore)}`}>
                  {communicationScore}%
                </span>
              </div>
              <Progress value={communicationScore} className="h-2" />
              <p className="text-xs text-slate-600 mt-2">
                {t({ en: `Last contact: ${daysSinceContact} days ago`, ar: `آخر اتصال: قبل ${daysSinceContact} يوم` })}
              </p>
            </div>
          </div>

          {healthScore < 60 && (
            <div className="p-4 bg-red-50 rounded border-2 border-red-300">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-900 mb-1">
                    {t({ en: 'Intervention Recommended', ar: 'التدخل موصى به' })}
                  </p>
                  <p className="text-xs text-red-700">
                    {t({
                      en: 'Partnership health is below target. Schedule review meeting.',
                      ar: 'صحة الشراكة أقل من الهدف. جدول اجتماع مراجعة.'
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
