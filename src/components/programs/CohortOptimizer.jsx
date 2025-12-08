import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Users, Sparkles, Loader2, Award } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { toast } from 'sonner';

export default function CohortOptimizer({ programId, applications }) {
  const { language, isRTL, t } = useLanguage();
  const [optimizing, setOptimizing] = useState(false);
  const [recommendations, setRecommendations] = useState(null);

  const optimizeCohort = async () => {
    setOptimizing(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Optimize cohort composition for diversity and synergy:

PROGRAM: Accelerator Cohort
APPLICANTS: ${applications.length}

Sample applicants:
${applications.slice(0, 15).map(a => `- ${a.startup_name}: ${a.sector}, Stage: ${a.startup_stage}, Team: ${a.team_size}`).join('\n')}

Recommend optimal cohort (20-25 participants):
1. Balance across sectors (aim for 3+ sectors)
2. Mix of stages (30% early, 40% growth, 30% scale)
3. Diversity in municipality sizes
4. Identify synergy opportunities (who should partner)
5. Predict cohort diversity score and collaboration potential`,
        response_json_schema: {
          type: "object",
          properties: {
            recommended_participants: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  startup: { type: "string" },
                  reason: { type: "string" }
                }
              }
            },
            diversity_score: { type: "number" },
            synergy_potential: { type: "string" },
            sector_distribution: {
              type: "object",
              properties: {
                transport: { type: "number" },
                environment: { type: "number" },
                digital: { type: "number" },
                other: { type: "number" }
              }
            },
            stage_distribution: {
              type: "object",
              properties: {
                early: { type: "number" },
                growth: { type: "number" },
                scale: { type: "number" }
              }
            }
          }
        }
      });

      setRecommendations(response);
      toast.success(t({ en: 'Cohort optimization complete', ar: 'اكتمل تحسين الفوج' }));
    } catch (error) {
      toast.error(t({ en: 'Optimization failed', ar: 'فشل التحسين' }));
    } finally {
      setOptimizing(false);
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
          <Button onClick={optimizeCohort} disabled={optimizing} size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600">
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