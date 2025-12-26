import React from 'react';
import { useMatchmakerApplications } from '@/hooks/useMatchmakerApplications';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import ProtectedPage from '../components/permissions/ProtectedPage';
import {
  CheckCircle2,
  Circle,
  Users,
  Shield,
  Award,
  Zap,
  Network,
  ArrowRight,
  TrendingUp,
  Search,
  CheckSquare,
  FileCheck
} from 'lucide-react';

/**
 * MatchmakerJourney
 * ✅ GOLD STANDARD COMPLIANT
 */
function MatchmakerJourney() {
  const { language, t, isRTL } = useLanguage();
  const { data: applications = [], isLoading } = useMatchmakerApplications();

  const journeyStages = [
    {
      id: 'discovery',
      name_en: '1. Discovery & Outreach',
      name_ar: '1. الاكتساب والتواصل',
      gate: 'Automated Check',
      owner: 'System',
      icon: Search,
      color: 'blue'
    },
    {
      id: 'application',
      name_en: '2. Application Submission',
      name_ar: '2. تقديم الطلب',
      gate: 'Completeness Check',
      owner: 'Submission Team',
      icon: Zap,
      color: 'cyan'
    },
    {
      id: 'evaluation',
      name_en: '3. Technical Evaluation',
      name_ar: '3. التقييم الفني',
      gate: 'Score Threshold',
      owner: 'Experts',
      icon: FileCheck,
      color: 'purple'
    },
    {
      id: 'shortlisting',
      name_en: '4. Shortlisting',
      name_ar: '4. القائمة المختصرة',
      gate: 'Committee Review',
      owner: 'Committee',
      icon: Users,
      color: 'amber'
    },
    {
      id: 'interviews',
      name_en: '5. Interviews',
      name_ar: '5. المقابلات',
      gate: 'Face-to-Face',
      owner: 'Panel',
      icon: Award,
      color: 'red'
    },
    {
      id: 'due_diligence',
      name_en: '6. Due Diligence',
      name_ar: '6. مراجعة المستندات',
      gate: 'Compliance Check',
      owner: 'Legal Team',
      icon: Shield,
      color: 'blue'
    },
    {
      id: 'matching',
      name_en: '7. Partner Matching',
      name_ar: '7. المطابقة مع الشركاء',
      gate: 'Mutual Agreement',
      owner: 'Network Admin',
      icon: Network,
      color: 'teal'
    },
    {
      id: 'contracting',
      name_en: '8. Contracting',
      name_ar: '8. التعاقد',
      gate: 'Signed Agreement',
      owner: 'Legal Team',
      icon: CheckSquare,
      color: 'green'
    },
    {
      id: 'pilot',
      name_en: '9. Pilot Conversion',
      name_ar: '9. التحويل لتجربة',
      gate: 'Final Approval',
      owner: 'Pilot Team',
      icon: CheckCircle2,
      color: 'green'
    }
  ];

  const getStageStats = (stageId) => {
    return applications.filter(a => a.workflow_stage === stageId).length;
  };

  const colorClasses = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700', icon: 'text-blue-600' },
    cyan: { bg: 'bg-cyan-50', border: 'border-cyan-300', text: 'text-cyan-700', icon: 'text-cyan-600' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-700', icon: 'text-purple-600' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700', icon: 'text-amber-600' },
    red: { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-700', icon: 'text-red-600' },
    green: { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-700', icon: 'text-green-600' },
    teal: { bg: 'bg-teal-50', border: 'border-teal-300', text: 'text-teal-700', icon: 'text-teal-600' }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 rounded-2xl text-white shadow-xl">
        <h1 className="text-4xl font-bold mb-2">{t({ en: 'Matchmaker Journey Tracker', ar: 'متتبع رحلة المطابقة' })}</h1>
        <p className="text-xl text-blue-100">{t({ en: 'End-to-end transparency in the startup-to-pilot lifecycle', ar: 'شفافية كاملة في دورة حياة الشركة الناشئة وحتى التجربة' })}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {journeyStages.map((stage, idx) => {
          const stats = getStageStats(stage.id);
          const colors = colorClasses[stage.color] || colorClasses.blue;
          const Icon = stage.icon;

          return (
            <Card key={stage.id} className={`${colors.bg} ${colors.border} border-2 hover:shadow-lg transition-shadow relative overflow-hidden`}>
              {idx < journeyStages.length - 1 && (
                <div className={`hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 p-1 bg-white rounded-full border ${colors.border}`}>
                  <ArrowRight className={`h-4 w-4 ${colors.text}`} />
                </div>
              )}
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg bg-white shadow-sm ${colors.icon}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <Badge variant="outline" className={`${colors.border} ${colors.text} bg-white font-bold`}>
                    {stats} {t({ en: 'Apps', ar: 'طلبات' })}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className={`text-lg font-bold ${colors.text} mb-1`}>
                  {language === 'ar' ? stage.name_ar : stage.name_en}
                </h3>
                <div className="space-y-2 mt-4">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span>{t({ en: 'Gate:', ar: 'البوابة:' })} {stage.gate}</span>
                    <span>{t({ en: 'Owner:', ar: 'المسؤول:' })} {stage.owner}</span>
                  </div>
                  <div className="w-full bg-white/50 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full ${colors.icon.replace('text', 'bg')} transition-all duration-1000`}
                      style={{ width: `${(stats / (applications.length || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-2 border-green-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Zap className="h-5 w-5 fill-green-500" />
            {t({ en: 'Success Pipeline Metrics', ar: 'مقاييس نجاح المسار' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-slate-900">
                {((applications.filter(a => a.workflow_stage === 'pilot').length / (applications.length || 1)) * 100).toFixed(1)}%
              </p>
              <p className="text-sm text-slate-600">{t({ en: 'Conversion Rate', ar: 'معدل التحويل' })}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-slate-900">
                {applications.filter(a => a.workflow_stage === 'interviews').length}
              </p>
              <p className="text-sm text-slate-600">{t({ en: 'Interview Success', ar: 'نجاح المقابلات' })}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <Shield className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p className="text-3xl font-bold text-slate-900">
                {applications.filter(a => a.workflow_stage === 'due_diligence').length}
              </p>
              <p className="text-sm text-slate-600">{t({ en: 'Legal Clearance', ar: 'التخليص القانوني' })}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-xl border border-green-200">
              <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-green-700">
                {applications.filter(a => a.workflow_stage === 'pilot').length}
              </p>
              <p className="text-sm text-green-800 font-medium">{t({ en: 'Live Pilots', ar: 'تجارب حية' })}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-dashed border-2 border-slate-300 bg-slate-50">
        <CardHeader>
          <CardTitle className="text-center text-slate-600 uppercase tracking-widest text-sm font-bold">
            {t({ en: 'Future Milestone Roadmap', ar: 'خارطة طريق المعالم المستقبلية' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-center gap-4 opacity-50 grayscale">
            <div className="p-4 bg-white border-2 border-slate-300 rounded-lg text-center">
              <Circle className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <p className="font-bold text-lg">Gate 4</p>
              <p className="text-sm text-slate-600">{t({ en: 'Board Approval', ar: 'موافقة مجلس الإدارة' })}</p>
            </div>
            <div className="p-4 bg-white border-2 border-slate-300 rounded-lg text-center">
              <Circle className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <p className="font-bold text-lg">Gate 5</p>
              <p className="text-sm text-slate-600">{t({ en: 'Budget Escrow', ar: 'ضمان الميزانية' })}</p>
            </div>
            <div className="p-4 bg-white border-2 border-green-300 rounded-lg text-center">
              <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="font-bold text-lg">Gate 6</p>
              <p className="text-sm text-slate-600">{t({ en: 'Final Approval', ar: 'الموافقة النهائية' })}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(MatchmakerJourney, { requiredPermissions: [] });