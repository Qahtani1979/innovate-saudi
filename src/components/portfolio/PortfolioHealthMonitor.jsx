import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Activity, Sparkles, Loader2, TrendingUp, AlertTriangle, Target } from 'lucide-react';
import { toast } from 'sonner';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { getPortfolioHealthPrompt, portfolioHealthSchema } from '@/lib/ai/prompts/portfolio';
import { getSystemPrompt } from '@/lib/saudiContext';

export default function PortfolioHealthMonitor() {
  const { language, t } = useLanguage();
  const [healthReport, setHealthReport] = useState(null);
  const { invokeAI, status, isLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => base44.entities.Challenge.list()
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots'],
    queryFn: () => base44.entities.Pilot.list()
  });

  const { data: programs = [] } = useQuery({
    queryKey: ['programs'],
    queryFn: () => base44.entities.Program.list()
  });

  const { data: rdProjects = [] } = useQuery({
    queryKey: ['rd-projects'],
    queryFn: () => base44.entities.RDProject.list()
  });

  const analyzeHealth = async () => {
    const portfolioData = { challenges, pilots, programs, rdProjects };
    const prompt = getPortfolioHealthPrompt(portfolioData);
    
    const result = await invokeAI({
      prompt,
      response_json_schema: portfolioHealthSchema,
      system_prompt: getSystemPrompt('FULL', true)
    });

    if (result.success) {
      setHealthReport(result.data);
      toast.success(t({ en: 'Health analysis complete', ar: 'التحليل الصحي مكتمل' }));
    }
  };

  const sectorData = [...new Set(challenges.map(c => c.sector))].map(sector => ({
    name: sector?.replace(/_/g, ' ') || 'other',
    value: challenges.filter(c => c.sector === sector).length
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <Card className="border-2 border-purple-300">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-600" />
            {t({ en: 'Portfolio Health Monitor', ar: 'مراقب صحة المحفظة' })}
          </CardTitle>
          <Button onClick={analyzeHealth} disabled={isLoading || !isAvailable} size="sm" className="bg-purple-600">
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Analyze', ar: 'تحليل' })}
          </Button>
        </div>
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} showDetails className="mt-2" />
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="p-3 bg-blue-50 rounded text-center">
            <p className="text-2xl font-bold text-blue-600">{challenges.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Challenges', ar: 'تحديات' })}</p>
          </div>
          <div className="p-3 bg-green-50 rounded text-center">
            <p className="text-2xl font-bold text-green-600">{pilots.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Pilots', ar: 'تجارب' })}</p>
          </div>
          <div className="p-3 bg-purple-50 rounded text-center">
            <p className="text-2xl font-bold text-purple-600">{rdProjects.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'R&D', ar: 'بحث' })}</p>
          </div>
          <div className="p-3 bg-amber-50 rounded text-center">
            <p className="text-2xl font-bold text-amber-600">{programs.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Programs', ar: 'برامج' })}</p>
          </div>
        </div>

        {sectorData.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-slate-700 mb-3">
              {t({ en: 'Sector Distribution', ar: 'توزيع القطاعات' })}
            </h4>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={sectorData} dataKey="value" cx="50%" cy="50%" outerRadius={70} label>
                  {sectorData.map((entry, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {!healthReport && !isLoading && (
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-purple-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">
              {t({ en: 'AI analyzes portfolio balance, pipeline flow, and risk areas', ar: 'الذكاء يحلل توازن المحفظة، تدفق الخط، ومجالات المخاطر' })}
            </p>
          </div>
        )}

        {healthReport && (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg border-2 ${
              healthReport.overall_health === 'excellent' ? 'bg-green-50 border-green-300' :
              healthReport.overall_health === 'good' ? 'bg-blue-50 border-blue-300' :
              healthReport.overall_health === 'fair' ? 'bg-yellow-50 border-yellow-300' :
              'bg-red-50 border-red-300'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-lg">
                  {t({ en: 'Overall Health', ar: 'الصحة الإجمالية' })}
                </h4>
                <Badge className={
                  healthReport.overall_health === 'excellent' ? 'bg-green-600' :
                  healthReport.overall_health === 'good' ? 'bg-blue-600' :
                  healthReport.overall_health === 'fair' ? 'bg-yellow-600' :
                  'bg-red-600'
                }>
                  {healthReport.overall_health?.toUpperCase()}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="text-center p-2 bg-white rounded">
                  <p className="text-2xl font-bold text-purple-600">{healthReport.health_score}</p>
                  <p className="text-xs text-slate-600">{t({ en: 'Health Score', ar: 'درجة الصحة' })}</p>
                </div>
                <div className="text-center p-2 bg-white rounded">
                  <p className="text-2xl font-bold text-blue-600">{healthReport.balance_score}</p>
                  <p className="text-xs text-slate-600">{t({ en: 'Balance', ar: 'التوازن' })}</p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-blue-50 rounded border border-blue-300">
              <h4 className="font-semibold text-sm text-blue-900 mb-1 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                {t({ en: 'Pipeline Flow', ar: 'تدفق الخط' })}
              </h4>
              <p className="text-sm text-slate-700">{healthReport.pipeline_flow}</p>
            </div>

            {healthReport.strengths?.length > 0 && (
              <div className="p-3 bg-green-50 rounded border border-green-300">
                <h4 className="font-semibold text-sm text-green-900 mb-2">
                  {t({ en: '✅ Strengths', ar: '✅ نقاط القوة' })}
                </h4>
                <ul className="space-y-1">
                  {healthReport.strengths.map((s, i) => (
                    <li key={i} className="text-sm text-slate-700">✓ {s}</li>
                  ))}
                </ul>
              </div>
            )}

            {healthReport.risk_areas?.length > 0 && (
              <div className="p-3 bg-red-50 rounded border border-red-300">
                <h4 className="font-semibold text-sm text-red-900 mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  {t({ en: 'Risk Areas', ar: 'مجالات المخاطر' })}
                </h4>
                <ul className="space-y-1">
                  {healthReport.risk_areas.map((r, i) => (
                    <li key={i} className="text-sm text-slate-700">⚠️ {r}</li>
                  ))}
                </ul>
              </div>
            )}

            {healthReport.recommendations?.length > 0 && (
              <div className="p-4 bg-purple-50 rounded border-2 border-purple-300">
                <h4 className="font-semibold text-sm text-purple-900 mb-2">
                  {t({ en: '🎯 Strategic Recommendations', ar: '🎯 التوصيات الاستراتيجية' })}
                </h4>
                <div className="space-y-2">
                  {healthReport.recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="h-6 w-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {i + 1}
                      </div>
                      <p className="text-sm text-slate-700 pt-0.5">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
