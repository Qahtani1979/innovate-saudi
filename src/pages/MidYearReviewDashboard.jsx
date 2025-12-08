import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '../components/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, TrendingUp } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import ProtectedPage from '../components/permissions/ProtectedPage';

function MidYearReviewDashboard() {
  const { language, isRTL, t } = useLanguage();

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots-review'],
    queryFn: () => base44.entities.Pilot.list()
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges-review'],
    queryFn: () => base44.entities.Challenge.list()
  });

  const pilotTarget = 150;
  const pilotActual = pilots.length;
  const challengeTarget = 200;
  const challengeActual = challenges.filter(c => c.status === 'resolved').length;

  const goals = [
    {
      name: { en: 'Pilots Launched', ar: 'تجارب مطلقة' },
      target: pilotTarget,
      actual: pilotActual,
      progress: Math.round((pilotActual / pilotTarget) * 100),
      status: pilotActual / pilotTarget >= 0.5 ? 'on-track' : 'at-risk'
    },
    {
      name: { en: 'Challenges Resolved', ar: 'تحديات محلولة' },
      target: challengeTarget,
      actual: challengeActual,
      progress: Math.round((challengeActual / challengeTarget) * 100),
      status: challengeActual / challengeTarget >= 0.5 ? 'on-track' : 'at-risk'
    }
  ];

  const onTrack = goals.filter(g => g.status === 'on-track').length;
  const atRisk = goals.filter(g => g.status === 'at-risk').length;

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-4xl font-bold text-slate-900">
          {t({ en: 'Mid-Year Review Dashboard', ar: 'لوحة المراجعة النصفية' })}
        </h1>
        <p className="text-slate-600 mt-2">
          {t({ en: 'H1 2025 Performance vs Annual Targets', ar: 'أداء النصف الأول 2025 مقابل الأهداف السنوية' })}
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{onTrack}</p>
            <p className="text-sm text-slate-600">{t({ en: 'On Track', ar: 'على المسار' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-8 w-8 text-amber-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-amber-600">{atRisk}</p>
            <p className="text-sm text-slate-600">{t({ en: 'At Risk', ar: 'في خطر' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">
              {Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length)}%
            </p>
            <p className="text-sm text-slate-600">{t({ en: 'Avg Achievement', ar: 'متوسط الإنجاز' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Goals Progress */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Annual Goals Progress', ar: 'تقدم الأهداف السنوية' })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {goals.map((goal, idx) => (
            <div key={idx} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-slate-900">{goal.name[language]}</h4>
                <Badge className={goal.status === 'on-track' ? 'bg-green-600' : 'bg-amber-600'}>
                  {goal.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">
                  {goal.actual} / {goal.target}
                </span>
                <span className="text-sm font-medium text-slate-900">{goal.progress}%</span>
              </div>
              <Progress value={goal.progress} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(MidYearReviewDashboard, { requiredPermissions: [] });