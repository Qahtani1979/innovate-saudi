import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { TrendingDown, Users, Target, TestTube, CheckCircle2 } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

function ConversionFunnel() {
  const { t } = useLanguage();

  const { data: programLinks = [], isLoading } = useQuery({
    queryKey: ['program-pilot-links'],
    queryFn: () => base44.entities.ProgramPilotLink.list()
  });

  const funnelStages = [
    { stage: 'enrolled', count: programLinks.length, label: t({ en: 'Enrolled', ar: 'مسجل' }), color: 'bg-blue-600' },
    { stage: 'active', count: programLinks.filter(pl => pl.participation_status === 'active').length, label: t({ en: 'Active', ar: 'نشط' }), color: 'bg-purple-600' },
    { stage: 'completed', count: programLinks.filter(pl => pl.participation_status === 'completed').length, label: t({ en: 'Completed', ar: 'مكتمل' }), color: 'bg-amber-600' },
    { stage: 'in_progress', count: programLinks.filter(pl => pl.conversion_status === 'in_progress').length, label: t({ en: 'Pilot In Progress', ar: 'تجربة قيد التنفيذ' }), color: 'bg-green-600' },
    { stage: 'converted', count: programLinks.filter(pl => pl.conversion_status === 'converted').length, label: t({ en: 'Converted to Pilot', ar: 'تحول لتجربة' }), color: 'bg-green-700' }
  ];

  const overallConversion = programLinks.length > 0
    ? (funnelStages[4].count / programLinks.length) * 100
    : 0;

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
          {t({ en: 'Conversion Funnel', ar: 'مسار التحويل' })}
        </h1>
        <p className="text-slate-600 mt-1">
          {t({ en: 'Program participant → Pilot conversion journey', ar: 'رحلة تحويل المشارك في البرنامج إلى تجربة' })}
        </p>
      </div>

      <Card className="bg-gradient-to-br from-green-50 to-white border-2 border-green-300">
        <CardContent className="pt-6 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-2" />
          <p className="text-5xl font-bold text-green-600">{overallConversion.toFixed(1)}%</p>
          <p className="text-sm text-slate-600 mt-2">{t({ en: 'Overall Conversion Rate', ar: 'معدل التحويل الإجمالي' })}</p>
        </CardContent>
      </Card>

      <div className="space-y-2">
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
    </div>
  );
}

export default ProtectedPage(ConversionFunnel, { requireAdmin: true });