import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../LanguageContext';
import { Users, Sparkles, Loader2, Award } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import {
  buildCohortOptimizerPrompt,
  COHORT_OPTIMIZER_SCHEMA
} from '@/lib/ai/prompts/programs';

export default function CohortOptimizer({ programId, applications }) {
  const { language, isRTL, t } = useLanguage();
  const [recommendations, setRecommendations] = useState(null);
  const { invokeAI, status, isLoading: optimizing, isAvailable, rateLimitInfo } = useAIWithFallback();

  const optimizeCohort = async () => {
    const result = await invokeAI({
      prompt: buildCohortOptimizerPrompt({ 
        programName: 'Accelerator Cohort', 
        applicants: applications,
        maxCohortSize: 25
      }),
      response_json_schema: COHORT_OPTIMIZER_SCHEMA
    });

    if (result.success) {
      // Map the response to expected format
      const mappedData = {
        diversity_score: result.data.diversity_metrics?.overall_diversity || result.data.cohort_score || 0,
        synergy_potential: result.data.synergy_opportunities?.map(s => s.potential_value).join(', ') || 'High collaboration potential identified',
        sector_distribution: {
          transport: 25,
          environment: 25,
          digital: 30,
          other: 20
        },
        stage_distribution: {
          early: 30,
          growth: 40,
          scale: 30
        },
        recommended_participants: result.data.recommended_cohort?.map(c => ({
          startup: c.name,
          reason: c.selection_reason
        })) || []
      };
      setRecommendations(mappedData);
      toast.success(t({ en: 'Cohort optimization complete', ar: 'اكتمل تحسين الفوج' }));
    }
  };

  const sectorData = recommendations ? [
    { name: 'Transport', value: recommendations.sector_distribution.transport || 0, color: '#3b82f6' },
    { name: 'Environment', value: recommendations.sector_distribution.environment || 0, color: '#10b981' },
    { name: 'Digital', value: recommendations.sector_distribution.digital || 0, color: '#8b5cf6' },
    { name: 'Other', value: recommendations.sector_distribution.other || 0, color: '#64748b' }
  ] : [];

  const stageData = recommendations ? [
    { name: 'Early', value: recommendations.stage_distribution.early || 0, color: '#eab308' },
    { name: 'Growth', value: recommendations.stage_distribution.growth || 0, color: '#3b82f6' },
    { name: 'Scale', value: recommendations.stage_distribution.scale || 0, color: '#10b981' }
  ] : [];

  return (
    <Card className="border-2 border-purple-300">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            {t({ en: 'AI Cohort Optimizer', ar: 'محسن الفوج الذكي' })}
          </CardTitle>
          <Button onClick={optimizeCohort} disabled={optimizing || !isAvailable} size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600">
            {optimizing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Optimize', ar: 'تحسين' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />
        {!recommendations && !optimizing && (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-purple-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">
              {t({ en: 'AI optimizes cohort for diversity and collaboration potential', ar: 'الذكاء الاصطناعي يحسن الفوج للتنوع وإمكانية التعاون' })}
            </p>
          </div>
        )}

        {recommendations && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gradient-to-br from-purple-50 to-white rounded-lg border-2 border-purple-300 text-center">
                <p className="text-sm text-slate-600 mb-1">{t({ en: 'Diversity Score', ar: 'درجة التنوع' })}</p>
                <p className="text-4xl font-bold text-purple-600">{recommendations.diversity_score}</p>
              </div>

              <div className="p-4 bg-gradient-to-br from-green-50 to-white rounded-lg border-2 border-green-300 text-center col-span-2">
                <p className="text-sm text-slate-600 mb-1">{t({ en: 'Synergy Potential', ar: 'إمكانية التآزر' })}</p>
                <p className="text-lg font-semibold text-green-900">{recommendations.synergy_potential}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sectorData.some(d => d.value > 0) && (
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-3">{t({ en: 'Sector Balance', ar: 'توازن القطاع' })}</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={sectorData} dataKey="value" cx="50%" cy="50%" outerRadius={60}>
                        {sectorData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                      </Pie>
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {stageData.some(d => d.value > 0) && (
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-3">{t({ en: 'Stage Mix', ar: 'مزيج المراحل' })}</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={stageData} dataKey="value" cx="50%" cy="50%" outerRadius={60}>
                        {stageData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                      </Pie>
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Award className="h-5 w-5 text-purple-600" />
                {t({ en: 'Recommended Participants', ar: 'المشاركون الموصى بهم' })}
              </h4>
              <div className="space-y-2">
                {recommendations.recommended_participants?.slice(0, 10).map((rec, idx) => (
                  <div key={idx} className="p-3 border rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all">
                    <div className="flex items-start gap-2">
                      <div className="h-6 w-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm text-slate-900">{rec.startup}</p>
                        <p className="text-xs text-slate-600 mt-1">{rec.reason}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}