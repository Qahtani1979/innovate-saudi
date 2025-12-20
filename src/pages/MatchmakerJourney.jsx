import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from '../components/LanguageContext';
import { CheckCircle2, Circle, Users, Shield, Award, Zap, Network, ArrowRight } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

function MatchmakerJourney() {
  const { language, isRTL, t } = useLanguage();

  const { data: applications = [] } = useQuery({
    queryKey: ['matchmaker-applications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matchmaker_applications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
    initialData: []
  });

  const stages = [
    {
      id: 'intake',
      name_en: '1. Intake',
      name_ar: '1. الاستقبال',
      gate: 'Completeness Check',
      owner: 'Admin Team',
      icon: Circle,
      color: 'blue'
    },
    {
      id: 'screening',
      name_en: '2. Screening',
      name_ar: '2. الفحص الأولي',
      gate: 'Technical Validation',
      owner: 'Screening Team',
      icon: Shield,
      color: 'cyan'
    },
    {
      id: 'stakeholder_review',
      name_en: '3. Stakeholder Review',
      name_ar: '3. مراجعة الأطراف',
      gate: 'Business Owner Approval',
      owner: 'Business Owners',
      icon: Users,
      color: 'purple'
    },
    {
      id: 'detailed_evaluation',
      name_en: '4. Detailed Evaluation',
      name_ar: '4. التقييم التفصيلي',
      gate: 'Scoring & Classification',
      owner: 'Evaluation Committee',
      icon: Award,
      color: 'amber'
    },
    {
      id: 'executive_review',
      name_en: '5. Executive Review',
      name_ar: '5. المراجعة التنفيذية',
      gate: 'Leadership Decision',
      owner: 'Executive Team',
      icon: Zap,
      color: 'red'
    },
    {
      id: 'approved',
      name_en: '6. Approved',
      name_ar: '6. معتمد',
      gate: 'Ready for Matching',
      owner: 'Matching Team',
      icon: CheckCircle2,
      color: 'green'
    },
    {
      id: 'matching',
      name_en: '7. AI Matching',
      name_ar: '7. المطابقة الذكية',
      gate: 'Match Quality',
      owner: 'AI Engine',
      icon: Network,
      color: 'teal'
    },
    {
      id: 'engagement',
      name_en: '8. Engagement',
      name_ar: '8. المشاركة',
      gate: 'Partnership Formation',
      owner: 'Engagement Team',
      icon: Users,
      color: 'indigo'
    },
    {
      id: 'pilot_conversion',
      name_en: '9. Pilot Conversion',
      name_ar: '9. التحويل لتجربة',
      gate: 'Final Approval',
      owner: 'Pilot Team',
      icon: CheckCircle2,
      color: 'green'
    }
  ];

  const getStageStats = (stageId) => {
    return applications.filter(a => a.stage === stageId).length;
  };

  const colorClasses = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700', icon: 'text-blue-600' },
    cyan: { bg: 'bg-cyan-50', border: 'border-cyan-300', text: 'text-cyan-700', icon: 'text-cyan-600' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-700', icon: 'text-purple-600' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700', icon: 'text-amber-600' },
    red: { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-700', icon: 'text-red-600' },
    green: { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-700', icon: 'text-green-600' },
    teal: { bg: 'bg-teal-50', border: 'border-teal-300', text: 'text-teal-700', icon: 'text-teal-600' },
    indigo: { bg: 'bg-indigo-50', border: 'border-indigo-300', text: 'text-indigo-700', icon: 'text-indigo-600' }
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold">{t({ en: 'Matchmaker Journey & Workflow', ar: 'رحلة وسير عمل التوفيق' })}</h1>
        <p className="text-slate-600 mt-2">{t({ en: 'Staged process with stakeholder & executive touchpoints', ar: 'عملية متدرجة مع نقاط التواصل للأطراف والقيادة' })}</p>
      </div>

      {/* Journey Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: '🗺️ Application Journey (9 Stages)', ar: '🗺️ رحلة الطلب (9 مراحل)' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stages.map((stage, index) => {
              const Icon = stage.icon;
              const colors = colorClasses[stage.color];
              const count = getStageStats(stage.id);

              return (
                <div key={stage.id}>
                  <div className={`p-6 rounded-xl border-2 ${colors.border} ${colors.bg}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`h-12 w-12 rounded-xl ${colors.bg} border-2 ${colors.border} flex items-center justify-center`}>
                          <Icon className={`h-6 w-6 ${colors.icon}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg">{language === 'ar' ? stage.name_ar : stage.name_en}</h3>
                          <p className="text-sm text-slate-600">
                            🚪 Gate: <span className="font-medium">{stage.gate}</span>
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            👤 Owner: {stage.owner}
                          </p>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className={`text-3xl font-bold ${colors.text}`}>{count}</div>
                        <p className="text-xs text-slate-500">{t({ en: 'apps', ar: 'طلبات' })}</p>
                      </div>
                    </div>
                  </div>
                  {index < stages.length - 1 && (
                    <div className="flex justify-center py-2">
                      <ArrowRight className="h-6 w-6 text-slate-400" style={{ transform: isRTL ? 'rotate(180deg)' : 'none' }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Touchpoints Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: '🤝 Stakeholder Touchpoints', ar: '🤝 نقاط التواصل مع الأطراف' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-4 bg-purple-50 border-2 border-purple-300 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Users className="h-5 w-5 text-purple-600" />
                <h4 className="font-bold">{t({ en: 'Stage 3: Business Owner Review', ar: 'المرحلة 3: مراجعة أصحاب العمل' })}</h4>
              </div>
              <p className="text-sm text-slate-700">
                {t({ 
                  en: 'Business owners from relevant sectors review applications for strategic fit and provide priority recommendations.',
                  ar: 'أصحاب الأعمال من القطاعات ذات الصلة يراجعون الطلبات للتوافق الاستراتيجي ويقدمون توصيات الأولوية.'
                })}
              </p>
            </div>

            <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Zap className="h-5 w-5 text-red-600" />
                <h4 className="font-bold">{t({ en: 'Stage 5: Executive Decision', ar: 'المرحلة 5: قرار القيادة' })}</h4>
              </div>
              <p className="text-sm text-slate-700">
                {t({ 
                  en: 'Fast Pass (≥85) and high-priority applications go to executive leadership for final approval and resource allocation.',
                  ar: 'التمرير السريع (≥85) والطلبات ذات الأولوية العالية تذهب للقيادة التنفيذية للموافقة النهائية وتخصيص الموارد.'
                })}
              </p>
            </div>

            <div className="p-4 bg-teal-50 border-2 border-teal-300 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Network className="h-5 w-5 text-teal-600" />
                <h4 className="font-bold">{t({ en: 'Stage 8: Municipal Engagement', ar: 'المرحلة 8: التواصل مع البلديات' })}</h4>
              </div>
              <p className="text-sm text-slate-700">
                {t({ 
                  en: 'Municipalities are introduced to approved providers, meetings scheduled, and partnership agreements drafted.',
                  ar: 'يتم تعريف البلديات بالمزودين المعتمدين وجدولة الاجتماعات وصياغة اتفاقيات الشراكة.'
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Decision Gates */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: '🚪 Decision Gates Summary', ar: '🚪 ملخص بوابات القرار' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-white border-2 border-blue-300 rounded-lg text-center">
              <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="font-bold text-lg">Gate 1</p>
              <p className="text-sm text-slate-600">{t({ en: 'Intake', ar: 'الاستقبال' })}</p>
            </div>
            <div className="p-4 bg-white border-2 border-purple-300 rounded-lg text-center">
              <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="font-bold text-lg">Gate 2</p>
              <p className="text-sm text-slate-600">{t({ en: 'Stakeholder', ar: 'الأطراف' })}</p>
            </div>
            <div className="p-4 bg-white border-2 border-amber-300 rounded-lg text-center">
              <Award className="h-8 w-8 text-amber-600 mx-auto mb-2" />
              <p className="font-bold text-lg">Gate 3</p>
              <p className="text-sm text-slate-600">{t({ en: 'Evaluation', ar: 'التقييم' })}</p>
            </div>
            <div className="p-4 bg-white border-2 border-red-300 rounded-lg text-center">
              <Zap className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <p className="font-bold text-lg">Gate 4</p>
              <p className="text-sm text-slate-600">{t({ en: 'Executive', ar: 'القيادة' })}</p>
            </div>
            <div className="p-4 bg-white border-2 border-teal-300 rounded-lg text-center">
              <Network className="h-8 w-8 text-teal-600 mx-auto mb-2" />
              <p className="font-bold text-lg">Gate 5</p>
              <p className="text-sm text-slate-600">{t({ en: 'Match Quality', ar: 'جودة المطابقة' })}</p>
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