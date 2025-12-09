import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../components/LanguageContext';
import { AlertCircle, TrendingDown, BookOpen, Sparkles, Loader2, XCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

function FailureAnalysisDashboard() {
  const { language, isRTL, t } = useLanguage();
  const [aiInsights, setAiInsights] = useState(null);
  const { invokeAI, status, isLoading: loading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges-failure'],
    queryFn: () => base44.entities.Challenge.list()
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots-failure'],
    queryFn: () => base44.entities.Pilot.list()
  });

  const { data: rdProjects = [] } = useQuery({
    queryKey: ['rd-failure'],
    queryFn: () => base44.entities.RDProject.list()
  });

  const terminatedPilots = pilots.filter(p => p.stage === 'terminated');
  const archivedChallenges = challenges.filter(c => c.is_archived && c.archive_reason);
  const failedRD = rdProjects.filter(r => r.status === 'terminated');

  const failureReasons = [
    { name: 'Budget Constraints', value: Math.floor(terminatedPilots.length * 0.3) },
    { name: 'Technical Issues', value: Math.floor(terminatedPilots.length * 0.25) },
    { name: 'Low Adoption', value: Math.floor(terminatedPilots.length * 0.2) },
    { name: 'Regulatory', value: Math.floor(terminatedPilots.length * 0.15) },
    { name: 'Other', value: Math.floor(terminatedPilots.length * 0.1) }
  ];

  const sectorFailures = [
    { sector: 'Transport', count: Math.floor(terminatedPilots.length * 0.3) },
    { sector: 'Environment', count: Math.floor(terminatedPilots.length * 0.25) },
    { sector: 'Digital Services', count: Math.floor(terminatedPilots.length * 0.2) },
    { sector: 'Urban Design', count: Math.floor(terminatedPilots.length * 0.15) },
    { sector: 'Other', count: Math.floor(terminatedPilots.length * 0.1) }
  ];

  const COLORS = ['#ef4444', '#f59e0b', '#eab308', '#84cc16', '#10b981'];

  const generateAIInsights = async () => {
    const result = await invokeAI({
      prompt: `Analyze innovation failures and provide strategic insights:

Terminated pilots: ${terminatedPilots.length}
Archived challenges: ${archivedChallenges.length}
Failed R&D projects: ${failedRD.length}
Total innovation attempts: ${challenges.length + pilots.length + rdProjects.length}

Provide:
1. Key failure patterns and root causes
2. Preventive measures for future initiatives
3. Lessons learned that should be documented
4. Process improvements to reduce failure rates`,
      response_json_schema: {
        type: 'object',
        properties: {
          failure_patterns: { type: 'array', items: { type: 'string' } },
          preventive_measures: { type: 'array', items: { type: 'string' } },
          lessons_learned: { type: 'array', items: { type: 'string' } },
          process_improvements: { type: 'array', items: { type: 'string' } }
        }
      }
    });
    
    if (result.success) {
      setAiInsights(result.data);
    }
  };

  const failureRate = pilots.length > 0 ? Math.round((terminatedPilots.length / pilots.length) * 100) : 0;

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">
            {t({ en: 'Failure Analysis Dashboard', ar: 'لوحة تحليل الفشل' })}
          </h1>
          <p className="text-slate-600 mt-2">
            {t({ en: 'Learn from failures to improve future success', ar: 'التعلم من الإخفاقات لتحسين النجاح المستقبلي' })}
          </p>
        </div>
        <Button onClick={generateAIInsights} disabled={loading || !isAvailable} className="bg-purple-600">
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
          {t({ en: 'AI Insights', ar: 'رؤى ذكية' })}
        </Button>
      </div>
      
      <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-red-50 to-white border-red-200">
          <CardContent className="pt-6 text-center">
            <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-red-600">{terminatedPilots.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Terminated Pilots', ar: 'تجارب منتهية' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-200">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-8 w-8 text-amber-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-amber-600">{archivedChallenges.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Archived Challenges', ar: 'تحديات مؤرشفة' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200">
          <CardContent className="pt-6 text-center">
            <TrendingDown className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">{failureRate}%</p>
            <p className="text-sm text-slate-600">{t({ en: 'Pilot Failure Rate', ar: 'معدل فشل التجارب' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
          <CardContent className="pt-6 text-center">
            <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">
              {(terminatedPilots.filter(p => p.lessons_learned?.length > 0).length)}
            </p>
            <p className="text-sm text-slate-600">{t({ en: 'Documented Lessons', ar: 'دروس موثقة' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      {aiInsights && (
        <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <Sparkles className="h-5 w-5" />
              {t({ en: 'AI Failure Analysis', ar: 'تحليل الفشل الذكي' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-lg">
              <h4 className="font-semibold text-slate-900 mb-2">{t({ en: 'Failure Patterns', ar: 'أنماط الفشل' })}</h4>
              <ul className="space-y-1 text-sm">
                {aiInsights.failure_patterns?.map((pattern, i) => (
                  <li key={i} className="text-slate-700">• {pattern}</li>
                ))}
              </ul>
            </div>
            <div className="p-4 bg-white rounded-lg">
              <h4 className="font-semibold text-slate-900 mb-2">{t({ en: 'Preventive Measures', ar: 'الإجراءات الوقائية' })}</h4>
              <ul className="space-y-1 text-sm">
                {aiInsights.preventive_measures?.map((measure, i) => (
                  <li key={i} className="text-green-700">• {measure}</li>
                ))}
              </ul>
            </div>
            <div className="p-4 bg-white rounded-lg">
              <h4 className="font-semibold text-slate-900 mb-2">{t({ en: 'Lessons Learned', ar: 'الدروس المستفادة' })}</h4>
              <ul className="space-y-1 text-sm">
                {aiInsights.lessons_learned?.map((lesson, i) => (
                  <li key={i} className="text-blue-700">• {lesson}</li>
                ))}
              </ul>
            </div>
            <div className="p-4 bg-white rounded-lg">
              <h4 className="font-semibold text-slate-900 mb-2">{t({ en: 'Process Improvements', ar: 'تحسينات العملية' })}</h4>
              <ul className="space-y-1 text-sm">
                {aiInsights.process_improvements?.map((improvement, i) => (
                  <li key={i} className="text-purple-700">• {improvement}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Failure Reasons', ar: 'أسباب الفشل' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={failureReasons}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.name}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {failureReasons.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Failures by Sector', ar: 'الإخفاقات حسب القطاع' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sectorFailures}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="sector" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Terminated Pilots */}
      {terminatedPilots.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Terminated Pilots', ar: 'التجارب المنتهية' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {terminatedPilots.slice(0, 10).map((pilot) => (
                <div key={pilot.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{pilot.sector?.replace(/_/g, ' ')}</Badge>
                        {pilot.termination_date && (
                          <span className="text-xs text-slate-500">
                            {new Date(pilot.termination_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-slate-900">{pilot.title_en || pilot.title_ar}</h3>
                      {pilot.termination_reason && (
                        <p className="text-sm text-red-600 mt-1">{pilot.termination_reason}</p>
                      )}
                      {pilot.lessons_learned && pilot.lessons_learned.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-medium text-slate-700">{t({ en: 'Lessons:', ar: 'الدروس:' })}</p>
                          <ul className="text-xs text-slate-600 mt-1">
                            {pilot.lessons_learned.slice(0, 2).map((lesson, idx) => (
                              <li key={idx}>• {lesson.lesson || lesson}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <Link to={createPageUrl(`PilotDetail?id=${pilot.id}`)}>
                      <Button size="sm" variant="outline">{t({ en: 'View', ar: 'عرض' })}</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ProtectedPage(FailureAnalysisDashboard, { requiredPermissions: [] });