import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Sparkles, TrendingUp, AlertTriangle, Award, Zap, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { toast } from 'sonner';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

function PatternRecognition() {
  const { language, isRTL, t } = useLanguage();
  const [patterns, setPatterns] = useState(null);
  const { invokeAI, status, isLoading: analyzing, rateLimitInfo, isAvailable } = useAIWithFallback();

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots'],
    queryFn: () => base44.entities.Pilot.list()
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => base44.entities.Challenge.list()
  });

  const { data: municipalities = [] } = useQuery({
    queryKey: ['municipalities'],
    queryFn: () => base44.entities.Municipality.list()
  });

  const analyzePatterns = async () => {
    // Successful pilots data
    const successfulPilots = pilots.filter(p => p.stage === 'scaled' || p.recommendation === 'scale');
    const failedPilots = pilots.filter(p => p.stage === 'terminated' || p.recommendation === 'terminate');

    const result = await invokeAI({
      prompt: `Analyze historical innovation data to identify success patterns and anti-patterns:

SUCCESSFUL PILOTS (${successfulPilots.length}):
${successfulPilots.slice(0, 10).map(p => `- ${p.title_en}: Sector ${p.sector}, Budget ${p.budget}, Duration ${p.duration_weeks}w, Team ${p.team?.length || 'N/A'}`).join('\n')}

FAILED PILOTS (${failedPilots.length}):
${failedPilots.slice(0, 10).map(p => `- ${p.title_en}: Sector ${p.sector}, Budget ${p.budget}, Team ${p.team?.length || 'N/A'}`).join('\n')}

RESOLVED CHALLENGES (${challenges.filter(c => c.status === 'resolved').length}):
Sectors: ${[...new Set(challenges.filter(c => c.status === 'resolved').map(c => c.sector))].join(', ')}

Identify:
1. Success patterns (5 patterns with evidence)
2. Anti-patterns to avoid (3 patterns)
3. Optimal portfolio mix (% allocation across tracks)
4. Sector-specific recommendations
5. Municipality type patterns (which cities succeed with what approaches)`,
      response_json_schema: {
        type: "object",
        properties: {
          success_patterns: {
            type: "array",
            items: {
              type: "object",
              properties: {
                pattern: { type: "string" },
                evidence: { type: "string" },
                success_rate: { type: "number" },
                recommendation: { type: "string" }
              }
            }
          },
          anti_patterns: {
            type: "array",
            items: {
              type: "object",
              properties: {
                pattern: { type: "string" },
                failure_rate: { type: "number" },
                avoid_by: { type: "string" }
              }
            }
          },
          optimal_mix: {
            type: "object",
            properties: {
              pilots: { type: "number" },
              rd: { type: "number" },
              programs: { type: "number" },
              scaling: { type: "number" }
            }
          },
          sector_insights: {
            type: "array",
            items: {
              type: "object",
              properties: {
                sector: { type: "string" },
                insight: { type: "string" }
              }
            }
          },
          municipality_patterns: {
            type: "array",
            items: {
              type: "object",
              properties: {
                type: { type: "string" },
                pattern: { type: "string" }
              }
            }
          }
        }
      }
    });

    if (result.success) {
      setPatterns(result.data);
      toast.success(t({ en: 'Success patterns identified', ar: 'تم تحديد أنماط النجاح' }));
    }
  };

  const mixData = patterns?.optimal_mix ? [
    { category: 'Pilots', recommended: patterns.optimal_mix.pilots, current: (pilots.length / (pilots.length + challenges.length)) * 100 },
    { category: 'R&D', recommended: patterns.optimal_mix.rd, current: 25 },
    { category: 'Programs', recommended: patterns.optimal_mix.programs, current: 20 },
    { category: 'Scaling', recommended: patterns.optimal_mix.scaling, current: 15 }
  ] : [];

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {t({ en: 'Pattern Recognition Tool', ar: 'أداة التعرف على الأنماط' })}
          </h1>
          <p className="text-slate-600 mt-1">
            {t({ en: 'ML-powered analysis of success patterns and portfolio optimization', ar: 'تحليل مدعوم بالتعلم الآلي لأنماط النجاح وتحسين المحفظة' })}
          </p>
        </div>
        <Button onClick={analyzePatterns} disabled={analyzing || !isAvailable} className="bg-gradient-to-r from-purple-600 to-pink-600">
          {analyzing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
          {analyzing ? t({ en: 'Analyzing...', ar: 'جاري التحليل...' }) : t({ en: 'Analyze Patterns', ar: 'تحليل الأنماط' })}
        </Button>
      </div>

      <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-10 w-10 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{pilots.filter(p => p.stage === 'scaled').length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Successful Pilots', ar: 'التجارب الناجحة' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6 text-center">
            <Award className="h-10 w-10 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{patterns?.success_patterns?.length || 0}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Patterns Found', ar: 'أنماط محددة' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-white">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-10 w-10 text-red-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-red-600">{patterns?.anti_patterns?.length || 0}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Anti-Patterns', ar: 'أنماط مضادة' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6 text-center">
            <Zap className="h-10 w-10 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">{municipalities.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Municipalities', ar: 'البلديات' })}</p>
          </CardContent>
        </Card>
      </div>

      {patterns && (
        <div className="space-y-6">
          {/* Success Patterns */}
          <Card className="bg-gradient-to-br from-green-50 to-white border-2 border-green-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-900">
                <Award className="h-5 w-5" />
                {t({ en: 'Validated Success Patterns', ar: 'أنماط النجاح المحققة' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {patterns.success_patterns?.map((pattern, idx) => (
                <div key={idx} className="p-4 bg-white rounded-lg border border-green-200">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-slate-900">✅ {pattern.pattern}</h4>
                    <Badge className="bg-green-100 text-green-700">{pattern.success_rate}% success</Badge>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">
                    <strong>{t({ en: 'Evidence:', ar: 'الدليل:' })}</strong> {pattern.evidence}
                  </p>
                  <p className="text-sm text-blue-700">
                    💡 <strong>{t({ en: 'Apply:', ar: 'التطبيق:' })}</strong> {pattern.recommendation}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Anti-Patterns */}
          <Card className="bg-gradient-to-br from-red-50 to-white border-2 border-red-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-900">
                <AlertTriangle className="h-5 w-5" />
                {t({ en: 'Anti-Patterns to Avoid', ar: 'أنماط يجب تجنبها' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {patterns.anti_patterns?.map((pattern, idx) => (
                <div key={idx} className="p-4 bg-white rounded-lg border border-red-200">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-red-900">❌ {pattern.pattern}</h4>
                    <Badge className="bg-red-100 text-red-700">{pattern.failure_rate}% fail</Badge>
                  </div>
                  <p className="text-sm text-slate-700">
                    🛡️ <strong>{t({ en: 'Avoid by:', ar: 'تجنب بـ:' })}</strong> {pattern.avoid_by}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Optimal Mix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t({ en: 'Optimal Portfolio Mix', ar: 'المزيج الأمثل للمحفظة' })}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mixData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="recommended" fill="#10b981" name="Recommended" />
                    <Bar dataKey="current" fill="#64748b" name="Current" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t({ en: 'Sector Insights', ar: 'رؤى القطاعات' })}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {patterns.sector_insights?.map((insight, idx) => (
                    <div key={idx} className="p-3 border rounded-lg">
                      <Badge variant="outline" className="mb-2">{insight.sector}</Badge>
                      <p className="text-sm text-slate-700">{insight.insight}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Municipality Patterns */}
          <Card className="bg-gradient-to-br from-blue-50 to-white">
            <CardHeader>
              <CardTitle>{t({ en: 'Municipality Type Patterns', ar: 'أنماط أنواع البلديات' })}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {patterns.municipality_patterns?.map((mp, idx) => (
                  <div key={idx} className="p-4 border rounded-lg bg-white">
                    <Badge className="bg-blue-100 text-blue-700 mb-2">{mp.type}</Badge>
                    <p className="text-sm text-slate-700">{mp.pattern}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {!patterns && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Sparkles className="h-16 w-16 text-purple-300 mx-auto mb-4" />
              <p className="text-slate-600 mb-4">
                {t({ en: 'Click "Analyze Patterns" to discover success formulas from historical data', ar: 'انقر "تحليل الأنماط" لاكتشاف صيغ النجاح من البيانات التاريخية' })}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ProtectedPage(PatternRecognition, { requiredPermissions: [] });
