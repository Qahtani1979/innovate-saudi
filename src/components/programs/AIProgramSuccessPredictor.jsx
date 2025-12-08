import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Sparkles, TrendingUp, Users, Award, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AIProgramSuccessPredictor({ program }) {
  const { t } = useLanguage();
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeProgramSuccess = async () => {
    setLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this innovation program and predict its success metrics:

Program: ${program.name_en}
Type: ${program.program_type}
Duration: ${program.duration_weeks} weeks
Cohort Size: ${program.target_participants?.max_participants || 'N/A'}
Funding: ${program.funding_details?.total_pool || 0} SAR
Curriculum: ${program.curriculum?.length || 0} weeks planned
Focus Areas: ${program.focus_areas?.join(', ') || 'N/A'}
Operator: ${program.operator_organization_id || 'N/A'}
Previous Cohorts: ${program.cohort_number || 0}

Predict success metrics with confidence scores:`,
        response_json_schema: {
          type: 'object',
          properties: {
            graduation_rate: { type: 'number', description: 'Expected % completing program (0-100)' },
            graduation_confidence: { type: 'number', description: 'Confidence 0-100' },
            post_program_employment_rate: { type: 'number', description: 'Expected % employed/successful post-program (0-100)' },
            employment_confidence: { type: 'number', description: 'Confidence 0-100' },
            participant_satisfaction: { type: 'number', description: 'Expected satisfaction 1-10' },
            satisfaction_confidence: { type: 'number', description: 'Confidence 0-100' },
            key_success_factors: { type: 'array', items: { type: 'string' } },
            risk_factors: { type: 'array', items: { type: 'string' } },
            recommendations: { type: 'array', items: { type: 'string' } }
          }
        }
      });
      setPredictions(result);
      toast.success(t({ en: 'Predictions generated', ar: 'تم توليد التنبؤات' }));
    } catch (error) {
      toast.error(t({ en: 'Failed to generate predictions', ar: 'فشل توليد التنبؤات' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <Sparkles className="h-5 w-5" />
            {t({ en: 'AI Success Predictor', ar: 'متنبئ النجاح الذكي' })}
          </CardTitle>
          <Button onClick={analyzeProgramSuccess} disabled={loading} size="sm">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t({ en: 'Analyzing...', ar: 'جاري التحليل...' })}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                {t({ en: 'Predict Success', ar: 'تنبؤ بالنجاح' })}
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      {predictions && (
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-lg border-2 border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Award className="h-5 w-5 text-green-600" />
                <p className="text-xs text-slate-600">{t({ en: 'Graduation Rate', ar: 'معدل التخرج' })}</p>
              </div>
              <p className="text-3xl font-bold text-green-600">{predictions.graduation_rate}%</p>
              <Badge variant="outline" className="mt-2 text-xs">
                {predictions.graduation_confidence}% {t({ en: 'confidence', ar: 'ثقة' })}
              </Badge>
            </div>

            <div className="p-4 bg-white rounded-lg border-2 border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <p className="text-xs text-slate-600">{t({ en: 'Employment Rate', ar: 'معدل التوظيف' })}</p>
              </div>
              <p className="text-3xl font-bold text-blue-600">{predictions.post_program_employment_rate}%</p>
              <Badge variant="outline" className="mt-2 text-xs">
                {predictions.employment_confidence}% {t({ en: 'confidence', ar: 'ثقة' })}
              </Badge>
            </div>

            <div className="p-4 bg-white rounded-lg border-2 border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-amber-600" />
                <p className="text-xs text-slate-600">{t({ en: 'Satisfaction', ar: 'الرضا' })}</p>
              </div>
              <p className="text-3xl font-bold text-amber-600">{predictions.participant_satisfaction}/10</p>
              <Badge variant="outline" className="mt-2 text-xs">
                {predictions.satisfaction_confidence}% {t({ en: 'confidence', ar: 'ثقة' })}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="font-semibold text-green-900 mb-2 text-sm">
                {t({ en: '✓ Success Factors', ar: '✓ عوامل النجاح' })}
              </p>
              <ul className="text-xs text-green-800 space-y-1">
                {predictions.key_success_factors?.map((factor, i) => (
                  <li key={i}>• {factor}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="font-semibold text-red-900 mb-2 text-sm flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                {t({ en: 'Risk Factors', ar: 'عوامل الخطر' })}
              </p>
              <ul className="text-xs text-red-800 space-y-1">
                {predictions.risk_factors?.map((risk, i) => (
                  <li key={i}>• {risk}</li>
                ))}
              </ul>
            </div>
          </div>

          {predictions.recommendations?.length > 0 && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="font-semibold text-blue-900 mb-2 text-sm">
                {t({ en: '💡 Recommendations', ar: '💡 التوصيات' })}
              </p>
              <ul className="text-xs text-blue-800 space-y-1">
                {predictions.recommendations.map((rec, i) => (
                  <li key={i}>• {rec}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}