import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../components/LanguageContext';
import { Target, AlertTriangle, TrendingUp, CheckCircle2, ChevronRight, Sparkles, AlertCircle, TestTube, Microscope, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function StrategicExecutionDashboard() {
  const { language, isRTL, t } = useLanguage();
  const [aiInsights, setAiInsights] = useState(null);
  const { invokeAI, status, isLoading, rateLimitInfo, isAvailable } = useAIWithFallback();

  const { data: strategicPlans = [] } = useQuery({
    queryKey: ['strategic-plans'],
    queryFn: () => base44.entities.StrategicPlan.list()
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => base44.entities.Challenge.list()
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots'],
    queryFn: () => base44.entities.Pilot.list()
  });

  const { data: rdProjects = [] } = useQuery({
    queryKey: ['rd-projects'],
    queryFn: () => base44.entities.RDProject.list()
  });

  const { data: programs = [] } = useQuery({
    queryKey: ['programs'],
    queryFn: () => base44.entities.Program.list()
  });

  const activePlan = strategicPlans.find(p => p.status === 'active') || strategicPlans[0];

  const calculateThemeProgress = (theme) => {
    if (!theme || !activePlan) return { completed: 0, total: 0, percentage: 0 };

    const themeName = theme.name_en?.toLowerCase();
    const relatedChallenges = challenges.filter(c => 
      c.strategic_goal?.toLowerCase().includes(themeName) || 
      c.tags?.some(t => t.toLowerCase().includes(themeName))
    );
    const relatedPilots = pilots.filter(p => 
      p.tags?.some(t => t.toLowerCase().includes(themeName))
    );

    const total = relatedChallenges.length + relatedPilots.length;
    const completed = relatedChallenges.filter(c => c.status === 'resolved').length + 
                      relatedPilots.filter(p => p.stage === 'completed' || p.stage === 'scaled').length;

    return {
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      challenges: relatedChallenges.length,
      pilots: relatedPilots.length
    };
  };

  const getThemeStatus = (percentage) => {
    if (percentage >= 75) return { color: 'green', label: t({ en: 'On Track', ar: 'على المسار' }) };
    if (percentage >= 50) return { color: 'yellow', label: t({ en: 'At Risk', ar: 'في خطر' }) };
    return { color: 'red', label: t({ en: 'Off Track', ar: 'خارج المسار' }) };
  };

  const generateAIInsights = async () => {
    if (!activePlan) return;

    const themeProgress = activePlan.strategic_themes?.map(theme => ({
      name: theme.name_en,
      ...calculateThemeProgress(theme)
    })) || [];

    const { success, data } = await invokeAI({
      prompt: `Analyze strategic plan execution progress and provide actionable insights.

Plan: ${activePlan.name_en}
Themes Progress: ${JSON.stringify(themeProgress)}
Total Challenges: ${challenges.length}
Active Pilots: ${pilots.filter(p => p.stage === 'active').length}
Completed Pilots: ${pilots.filter(p => p.stage === 'completed').length}

Provide 3-5 critical insights about:
1. Themes that are behind schedule and recommended actions
2. Opportunities to accelerate progress
3. Resource reallocation suggestions

Be specific and actionable.`,
      response_json_schema: {
        type: "object",
        properties: {
          insights: {
            type: "array",
            items: {
              type: "object",
              properties: {
                type: { type: "string", enum: ["alert", "recommendation", "opportunity"] },
                title: { type: "string" },
                description: { type: "string" },
                action: { type: "string" }
              }
            }
          }
        }
      }
    });

    if (success) {
      setAiInsights(data);
    }
  };

  if (!activePlan) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600">{t({ en: 'No active strategic plan found', ar: 'لم يتم العثور على خطة استراتيجية نشطة' })}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {t({ en: 'Strategic Plan Execution', ar: 'تنفيذ الخطة الاستراتيجية' })}
          </h1>
          <p className="text-slate-600 mt-1">
            {language === 'ar' && activePlan.name_ar ? activePlan.name_ar : activePlan.name_en} ({activePlan.start_year}-{activePlan.end_year})
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={generateAIInsights} disabled={isLoading || !isAvailable} className="bg-gradient-to-r from-purple-600 to-pink-600">
            <Sparkles className="h-4 w-4 mr-2" />
            {t({ en: 'AI Insights', ar: 'رؤى الذكاء الاصطناعي' })}
          </Button>
          <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />
        </div>
      </div>

      {/* Overall Progress */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-blue-600">{challenges.length}</p>
              <p className="text-sm text-slate-600">{t({ en: 'Challenges', ar: 'التحديات' })}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6">
            <div className="text-center">
              <TestTube className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-purple-600">{pilots.filter(p => p.stage === 'active').length}</p>
              <p className="text-sm text-slate-600">{t({ en: 'Active Pilots', ar: 'التجارب النشطة' })}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6">
            <div className="text-center">
              <Microscope className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-green-600">{rdProjects.filter(p => p.status === 'active').length}</p>
              <p className="text-sm text-slate-600">{t({ en: 'R&D Projects', ar: 'مشاريع البحث' })}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-6">
            <div className="text-center">
              <Calendar className="h-8 w-8 text-amber-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-amber-600">{programs.filter(p => p.status === 'active').length}</p>
              <p className="text-sm text-slate-600">{t({ en: 'Programs', ar: 'البرامج' })}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      {aiInsights && (
        <Card className="bg-gradient-to-br from-purple-50 to-white border-2 border-purple-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              {t({ en: 'AI Strategic Insights', ar: 'رؤى استراتيجية ذكية' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {aiInsights.insights?.map((insight, idx) => {
              const iconMap = {
                alert: AlertTriangle,
                recommendation: Target,
                opportunity: TrendingUp
              };
              const Icon = iconMap[insight.type] || Sparkles;
              const colorMap = {
                alert: 'text-red-700 bg-red-50',
                recommendation: 'text-blue-700 bg-blue-50',
                opportunity: 'text-green-700 bg-green-50'
              };

              return (
                <div key={idx} className={`p-4 rounded-lg ${colorMap[insight.type]}`}>
                  <div className="flex items-start gap-3">
                    <Icon className="h-5 w-5 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{insight.title}</h4>
                      <p className="text-sm mb-2">{insight.description}</p>
                      <p className="text-sm font-medium">💡 {insight.action}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Strategic Themes Progress */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Strategic Themes Progress', ar: 'تقدم المحاور الاستراتيجية' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activePlan.strategic_themes?.map((theme, idx) => {
              const progress = calculateThemeProgress(theme);
              const status = getThemeStatus(progress.percentage);
              const statusColors = {
                green: 'bg-green-500',
                yellow: 'bg-yellow-500',
                red: 'bg-red-500'
              };

              return (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`h-3 w-3 rounded-full ${statusColors[status.color]}`} />
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900">
                          {language === 'ar' && theme.name_ar ? theme.name_ar : theme.name_en}
                        </h4>
                        <p className="text-sm text-slate-600">
                          {progress.total} {t({ en: 'initiatives', ar: 'مبادرة' })} ({progress.challenges} {t({ en: 'challenges', ar: 'تحديات' })}, {progress.pilots} {t({ en: 'pilots', ar: 'تجارب' })})
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={status.color === 'green' ? 'bg-green-100 text-green-700' : status.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}>
                        {status.label}
                      </Badge>
                      <p className="text-2xl font-bold text-slate-900 mt-1">{progress.percentage}%</p>
                    </div>
                  </div>
                  <Progress value={progress.percentage} className="h-3" />
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>{progress.completed} {t({ en: 'completed', ar: 'مكتمل' })}</span>
                    <span>{progress.total - progress.completed} {t({ en: 'in progress', ar: 'قيد التنفيذ' })}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Milestones */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Strategic Milestones', ar: 'المعالم الاستراتيجية' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activePlan.milestones?.slice(0, 5).map((milestone, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {milestone.status === 'completed' ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : milestone.status === 'in_progress' ? (
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  ) : milestone.status === 'delayed' ? (
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  ) : (
                    <Target className="h-5 w-5 text-slate-400" />
                  )}
                  <div>
                    <p className="font-medium text-slate-900">
                      {language === 'ar' && milestone.name_ar ? milestone.name_ar : milestone.name_en}
                    </p>
                    <p className="text-sm text-slate-600">{t({ en: 'Target', ar: 'الهدف' })}: {milestone.target_date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={
                    milestone.status === 'completed' ? 'bg-green-100 text-green-700' :
                    milestone.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                    milestone.status === 'delayed' ? 'bg-red-100 text-red-700' :
                    'bg-slate-100 text-slate-700'
                  }>
                    {milestone.status?.replace(/_/g, ' ')}
                  </Badge>
                  {milestone.completion_percentage > 0 && (
                    <p className="text-sm font-medium mt-1">{milestone.completion_percentage}%</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}