import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Database, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

function DataQualityDashboard() {
  const { language, t } = useLanguage();

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges-quality'],
    queryFn: () => base44.entities.Challenge.list()
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots-quality'],
    queryFn: () => base44.entities.Pilot.list()
  });

  const challengeCompleteness = challenges.filter(c => 
    c.title_en && c.description_en && c.sector && c.municipality_id
  ).length / (challenges.length || 1) * 100;

  const pilotCompleteness = pilots.filter(p => 
    p.title_en && p.challenge_id && p.solution_id && p.municipality_id
  ).length / (pilots.length || 1) * 100;

  const qualityMetrics = [
    {
      label: { en: 'Challenge Data Quality', ar: 'جودة بيانات التحديات' },
      value: Math.round(challengeCompleteness),
      total: challenges.length,
      icon: AlertTriangle,
      color: challengeCompleteness >= 80 ? 'green' : challengeCompleteness >= 50 ? 'yellow' : 'red'
    },
    {
      label: { en: 'Pilot Data Quality', ar: 'جودة بيانات التجارب' },
      value: Math.round(pilotCompleteness),
      total: pilots.length,
      icon: CheckCircle,
      color: pilotCompleteness >= 80 ? 'green' : pilotCompleteness >= 50 ? 'yellow' : 'red'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Database className="h-8 w-8 text-blue-600" />
          {t({ en: 'Data Quality Dashboard', ar: 'لوحة جودة البيانات' })}
        </h1>
        <p className="text-slate-600 mt-1">
          {t({ en: 'Monitor data completeness and quality across entities', ar: 'مراقبة اكتمال وجودة البيانات عبر الكيانات' })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {qualityMetrics.map((metric, i) => {
          const Icon = metric.icon;
          const colorClass = metric.color === 'green' ? 'border-green-200 bg-green-50' : 
                            metric.color === 'yellow' ? 'border-yellow-200 bg-yellow-50' : 
                            'border-red-200 bg-red-50';
          const badgeClass = metric.color === 'green' ? 'bg-green-100 text-green-800' : 
                            metric.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800';

          return (
            <Card key={i} className={`border-2 ${colorClass}`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <Icon className={`h-8 w-8 text-${metric.color}-600`} />
                  <Badge className={badgeClass}>
                    {metric.value}%
                  </Badge>
                </div>
                <p className="font-medium text-slate-900">{metric.label[language]}</p>
                <p className="text-sm text-slate-600 mt-1">
                  {t({ en: `${metric.total} records analyzed`, ar: `${metric.total} سجل محلل` })}
                </p>
                <div className="w-full bg-white rounded-full h-2 mt-3">
                  <div 
                    className={`bg-${metric.color}-600 h-2 rounded-full transition-all`} 
                    style={{ width: `${metric.value}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            {t({ en: 'Data Quality Issues', ar: 'مشاكل جودة البيانات' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm font-medium text-red-900">
                {challenges.filter(c => !c.title_en).length} {t({ en: 'challenges missing title', ar: 'تحدي بدون عنوان' })}
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm font-medium text-yellow-900">
                {pilots.filter(p => !p.challenge_id).length} {t({ en: 'pilots not linked to challenge', ar: 'تجربة غير مرتبطة بتحدي' })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(DataQualityDashboard, { requiredPermissions: [], requiredRoles: ['Super Admin', 'Data Manager'] });