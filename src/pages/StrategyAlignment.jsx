import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Target, Network, AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

function StrategyAlignment() {
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

  const alignedChallenges = links.filter(l => l.alignment_status === 'aligned').length;
  const misalignedChallenges = links.filter(l => l.alignment_status === 'misaligned').length;

  const byPlan = plans.map(plan => ({
    name: plan.title_en || plan.title_ar,
    linked: links.filter(l => l.strategic_plan_id === plan.id).length,
    aligned: links.filter(l => l.strategic_plan_id === plan.id && l.alignment_status === 'aligned').length
  })).filter(p => p.linked > 0);

  const stats = {
    total_links: links.length,
    aligned: alignedChallenges,
    misaligned: misalignedChallenges,
    coverage: plans.length > 0 ? (links.length / challenges.length) * 100 : 0
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
          {t({ en: 'Strategy Alignment', ar: 'التوافق الاستراتيجي' })}
        </h1>
        <p className="text-slate-600 mt-1">
          {t({ en: 'Strategic plans ↔ Challenge alignment tracking', ar: 'تتبع توافق الخطط الاستراتيجية مع التحديات' })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Network className="h-10 w-10 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{stats.total_links}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Total Links', ar: 'إجمالي الروابط' })}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-10 w-10 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{stats.aligned}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Aligned', ar: 'متوافق' })}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-amber-200 bg-amber-50">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-10 w-10 text-amber-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-amber-600">{stats.misaligned}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Misaligned', ar: 'غير متوافق' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6 text-center">
            <Target className="h-10 w-10 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">{stats.coverage.toFixed(0)}%</p>
            <p className="text-xs text-slate-600">{t({ en: 'Coverage', ar: 'التغطية' })}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Alignment by Strategic Plan', ar: 'التوافق حسب الخطة الاستراتيجية' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {byPlan.map((plan, idx) => (
              <div key={idx} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-slate-900">{plan.name}</h3>
                  <Badge className="bg-green-600">
                    {plan.aligned} / {plan.linked} {t({ en: 'aligned', ar: 'متوافق' })}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span>{t({ en: 'Linked challenges:', ar: 'التحديات المربوطة:' })}</span>
                  <span className="font-medium">{plan.linked}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(StrategyAlignment, { requireAdmin: true });