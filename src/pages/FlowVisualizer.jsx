import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { ArrowRight, TrendingUp } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

function FlowVisualizerPage() {
  const { language, isRTL, t } = useLanguage();

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges-flow'],
    queryFn: () => base44.entities.Challenge.list()
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots-flow'],
    queryFn: () => base44.entities.Pilot.list()
  });

  const stages = [
    { name: { en: 'Discovery', ar: 'الاكتشاف' }, count: challenges.filter(c => c.status === 'draft' || c.status === 'submitted').length },
    { name: { en: 'Validation', ar: 'التحقق' }, count: challenges.filter(c => c.status === 'under_review').length },
    { name: { en: 'Treatment', ar: 'المعالجة' }, count: challenges.filter(c => c.status === 'in_treatment').length },
    { name: { en: 'Pilot Design', ar: 'تصميم التجربة' }, count: pilots.filter(p => p.stage === 'design').length },
    { name: { en: 'Active Pilots', ar: 'تجارب نشطة' }, count: pilots.filter(p => p.stage === 'active').length },
    { name: { en: 'Evaluation', ar: 'التقييم' }, count: pilots.filter(p => p.stage === 'evaluation').length },
    { name: { en: 'Scaled', ar: 'موسّع' }, count: pilots.filter(p => p.stage === 'scaled').length }
  ];

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-4xl font-bold text-slate-900">
          {t({ en: 'Innovation Flow Visualizer', ar: 'مصور تدفق الابتكار' })}
        </h1>
        <p className="text-slate-600 mt-2">
          {t({ en: 'Visualize innovation pipeline flow', ar: 'تصور تدفق خط الابتكار' })}
        </p>
      </div>

      {/* Flow Diagram */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {stages.map((stage, idx) => (
          <React.Fragment key={idx}>
            <Card className={`w-40 ${stage.count > 10 ? 'border-2 border-blue-500' : ''}`}>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-blue-600">{stage.count}</p>
                <p className="text-sm text-slate-600 mt-1">{stage.name[language]}</p>
              </CardContent>
            </Card>
            {idx < stages.length - 1 && (
              <ArrowRight className="h-6 w-6 text-slate-400" />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">
              {challenges.length > 0 ? Math.round((pilots.length / challenges.length) * 100) : 0}%
            </p>
            <p className="text-sm text-slate-600">{t({ en: 'Challenge→Pilot Rate', ar: 'معدل التحدي→التجربة' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">
              {pilots.length > 0 ? Math.round((pilots.filter(p => p.stage === 'scaled').length / pilots.length) * 100) : 0}%
            </p>
            <p className="text-sm text-slate-600">{t({ en: 'Pilot→Scaled Rate', ar: 'معدل التجربة→التوسع' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">
              {Math.round((stages.reduce((sum, s) => sum + s.count, 0) / 7))}
            </p>
            <p className="text-sm text-slate-600">{t({ en: 'Avg per Stage', ar: 'متوسط لكل مرحلة' })}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ProtectedPage(FlowVisualizerPage, { requiredPermissions: [] });