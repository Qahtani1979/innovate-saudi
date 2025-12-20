import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Calendar, Sparkles, Users, Loader2, Award, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

function ProgramPortfolioPlanner() {
  const { language, isRTL, t } = useLanguage();
  const [aiRoadmap, setAiRoadmap] = useState(null);
  const { invokeAI, status, isLoading: loading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const { data: programs = [] } = useQuery({
    queryKey: ['programs'],
    queryFn: () => base44.entities.Program.list()
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => base44.entities.Challenge.list()
  });

  const generateRoadmap = async () => {
    const result = await invokeAI({
      prompt: `Create a strategic program portfolio roadmap for Saudi municipal innovation:

Current Programs: ${programs.length}
- Accelerators: ${programs.filter(p => p.program_type === 'accelerator').length}
- Hackathons: ${programs.filter(p => p.program_type === 'hackathon').length}
- Training: ${programs.filter(p => p.program_type === 'training').length}

Challenges needing capacity: ${challenges.filter(c => !c.track).length}

Generate bilingual program roadmap for next 12 months:
1. Recommended programs (type, timing, theme)
2. Cohort scheduling strategy
3. Theme-based planning aligned to strategic goals
4. Expected participant numbers and outcomes
5. Budget allocation per program type`,
      response_json_schema: {
        type: 'object',
        properties: {
          recommended_programs: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name_en: { type: 'string' },
                name_ar: { type: 'string' },
                type: { type: 'string' },
                theme_en: { type: 'string' },
                theme_ar: { type: 'string' },
                quarter: { type: 'string' },
                expected_participants: { type: 'number' },
                budget: { type: 'number' },
                priority: { type: 'string' }
              }
            }
          },
          cohort_strategy: {
            type: 'object',
            properties: {
              strategy_en: { type: 'string' },
              strategy_ar: { type: 'string' },
              cadence_en: { type: 'string' },
              cadence_ar: { type: 'string' }
            }
          }
        }
      }
    });

    if (result.success) {
      setAiRoadmap(result.data);
      toast.success(t({ en: 'Program roadmap generated', ar: 'تم إنشاء خارطة طريق البرامج' }));
    }
  };

  const typeDistribution = programs.reduce((acc, p) => {
    acc[p.program_type] = (acc[p.program_type] || 0) + 1;
    return acc;
  }, {});

  const typeData = Object.entries(typeDistribution).map(([type, count]) => ({
    type: type.replace(/_/g, ' '),
    count
  }));

  const statusData = [
    { status: 'Planning', count: programs.filter(p => p.status === 'planning').length },
    { status: 'Open', count: programs.filter(p => p.status === 'applications_open').length },
    { status: 'Active', count: programs.filter(p => p.status === 'active').length },
    { status: 'Completed', count: programs.filter(p => p.status === 'completed').length }
  ];

  const priorityColors = {
    high: 'bg-red-600',
    medium: 'bg-yellow-600',
    low: 'bg-blue-600'
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-orange-600 via-pink-600 to-purple-600 p-8 text-white">
        <h1 className="text-5xl font-bold mb-2">
          {t({ en: '📅 Program Portfolio Planner', ar: '📅 مخطط محفظة البرامج' })}
        </h1>
        <p className="text-xl text-white/90">
          {t({ en: 'Strategic program roadmap, cohort planning, and capacity building', ar: 'خارطة طريق البرامج الاستراتيجية وتخطيط المجموعات وبناء القدرات' })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-orange-50 to-white">
          <CardContent className="pt-6 text-center">
            <Award className="h-10 w-10 text-orange-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-orange-600">{programs.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Total Programs', ar: 'إجمالي البرامج' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6 text-center">
            <Users className="h-10 w-10 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">
              {programs.reduce((sum, p) => sum + (p.accepted_count || 0), 0)}
            </p>
            <p className="text-sm text-slate-600">{t({ en: 'Participants', ar: 'المشاركين' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6 text-center">
            <Calendar className="h-10 w-10 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">
              {programs.filter(p => p.status === 'active').length}
            </p>
            <p className="text-sm text-slate-600">{t({ en: 'Active Now', ar: 'نشط الآن' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6 text-center">
            <Target className="h-10 w-10 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">
              {programs.filter(p => p.status === 'planning').length}
            </p>
            <p className="text-sm text-slate-600">{t({ en: 'Planned', ar: 'مخطط' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Generate */}
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
        <CardContent className="pt-6">
          <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />
          <div className="flex items-center justify-between mt-2">
            <div>
              <p className="font-semibold text-purple-900 mb-1 text-lg">
                {t({ en: 'AI Program Portfolio Optimizer', ar: 'محسن محفظة البرامج الذكي' })}
              </p>
              <p className="text-sm text-slate-600">
                {t({ en: 'Generate optimized program roadmap with cohort scheduling and theme alignment', ar: 'إنشاء خارطة طريق برامج محسنة مع جدولة المجموعات ومواءمة المحاور' })}
              </p>
            </div>
            <Button onClick={generateRoadmap} disabled={loading || !isAvailable} className="bg-gradient-to-r from-purple-600 to-pink-600">
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              {t({ en: 'Generate Roadmap', ar: 'إنشاء خارطة طريق' })}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Portfolio */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Programs by Type', ar: 'البرامج حسب النوع' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={typeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#f97316" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Program Status Distribution', ar: 'توزيع حالة البرامج' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* AI Roadmap */}
      {aiRoadmap?.recommended_programs?.length > 0 && (
        <Card className="border-2 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <Calendar className="h-5 w-5" />
              {t({ en: 'AI-Generated Program Roadmap', ar: 'خارطة طريق البرامج المُنشأة بالذكاء' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {aiRoadmap.recommended_programs.map((prog, idx) => (
                <div key={idx} className={`p-4 bg-gradient-to-r from-green-50 to-white border-2 border-green-200 rounded-lg`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 text-lg" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                        {language === 'ar' ? prog.name_ar : prog.name_en}
                      </p>
                      <p className="text-sm text-slate-600 mt-1" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                        {language === 'ar' ? prog.theme_ar : prog.theme_en}
                      </p>
                    </div>
                    <Badge className={priorityColors[prog.priority]}>
                      {prog.priority}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="p-2 bg-white rounded border text-center">
                      <p className="text-xs text-slate-500">{t({ en: 'Type', ar: 'النوع' })}</p>
                      <Badge variant="outline" className="text-xs mt-1">{prog.type}</Badge>
                    </div>
                    <div className="p-2 bg-white rounded border text-center">
                      <p className="text-xs text-slate-500">{t({ en: 'Quarter', ar: 'الربع' })}</p>
                      <p className="font-medium text-sm">{prog.quarter}</p>
                    </div>
                    <div className="p-2 bg-white rounded border text-center">
                      <p className="text-xs text-slate-500">{t({ en: 'Participants', ar: 'المشاركين' })}</p>
                      <p className="font-bold text-blue-600">{prog.expected_participants}</p>
                    </div>
                    <div className="p-2 bg-white rounded border text-center">
                      <p className="text-xs text-slate-500">{t({ en: 'Budget', ar: 'الميزانية' })}</p>
                      <p className="font-bold text-green-600">{(prog.budget / 1000).toFixed(0)}K</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cohort Strategy */}
      {aiRoadmap?.cohort_strategy && (
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Users className="h-5 w-5" />
              {t({ en: 'Cohort Strategy', ar: 'استراتيجية المجموعات' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-white rounded-lg border">
              <p className="text-sm font-medium text-slate-700 mb-2">{t({ en: 'Strategy:', ar: 'الاستراتيجية:' })}</p>
              <p className="text-sm text-slate-900" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                {language === 'ar' ? aiRoadmap.cohort_strategy.strategy_ar : aiRoadmap.cohort_strategy.strategy_en}
              </p>
            </div>
            <div className="p-4 bg-white rounded-lg border">
              <p className="text-sm font-medium text-slate-700 mb-2">{t({ en: 'Cadence:', ar: 'الإيقاع:' })}</p>
              <p className="text-sm text-slate-900" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                {language === 'ar' ? aiRoadmap.cohort_strategy.cadence_ar : aiRoadmap.cohort_strategy.cadence_en}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ProtectedPage(ProgramPortfolioPlanner, { requiredPermissions: [], requiredRoles: ['Executive Leadership', 'Program Director', 'GDISB Strategy Lead'] });