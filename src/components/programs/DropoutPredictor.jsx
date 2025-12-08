import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { AlertTriangle, Sparkles, Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function DropoutPredictor({ programId, participants }) {
  const { language, isRTL, t } = useLanguage();
  const [analyzing, setAnalyzing] = useState(false);
  const [predictions, setPredictions] = useState([]);

  const analyzeDropoutRisk = async () => {
    setAnalyzing(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Predict dropout risk for program participants:

PROGRAM: Accelerator
PARTICIPANTS: ${participants.length}

Sample data:
${participants.slice(0, 10).map(p => `- ${p.startup_name}: Attendance ${p.attendance_rate || 85}%, Participation ${p.participation_score || 70}%, Last active: ${p.last_active_days || 3} days ago`).join('\n')}

For each at-risk participant, provide:
1. Dropout probability (0-100%)
2. Risk factors
3. Intervention recommendations`,
        response_json_schema: {
          type: "object",
          properties: {
            at_risk_count: { type: "number" },
            predictions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  participant: { type: "string" },
                  dropout_probability: { type: "number" },
                  risk_factors: { type: "array", items: { type: "string" } },
                  interventions: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        }
      });

      setPredictions(response.predictions || []);
      toast.success(t({ en: `${response.at_risk_count} at-risk participants identified`, ar: `تم تحديد ${response.at_risk_count} مشاركين في خطر` }));
    } catch (error) {
      toast.error(t({ en: 'Analysis failed', ar: 'فشل التحليل' }));
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <Card className="border-2 border-red-300">
      <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            {t({ en: 'Dropout Risk Predictor', ar: 'متنبئ مخاطر الانسحاب' })}
          </CardTitle>
          <Button onClick={analyzeDropoutRisk} disabled={analyzing} size="sm" className="bg-red-600">
            {analyzing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Analyze', ar: 'تحليل' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {!predictions.length && !analyzing && (
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-red-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">
              {t({ en: 'AI predicts which participants might drop out', ar: 'الذكاء الاصطناعي يتنبأ بالمشاركين الذين قد ينسحبون' })}
            </p>
          </div>
        )}

        {predictions.length > 0 && (
          <div className="space-y-3">
            {predictions.map((pred, idx) => {
              const riskLevel = pred.dropout_probability >= 70 ? 'high' : pred.dropout_probability >= 40 ? 'medium' : 'low';
              const colors = {
                high: { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-700' },
                medium: { bg: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-700' },
                low: { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-700' }
              };
              const style = colors[riskLevel];

              return (
                <div key={idx} className={`p-4 rounded-lg border-2 ${style.border} ${style.bg}`}>
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="font-semibold text-slate-900">{pred.participant}</h5>
                    <Badge className={`${style.bg} ${style.text}`}>
                      {pred.dropout_probability}% risk
                    </Badge>
                  </div>

                  {pred.risk_factors?.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-slate-700 mb-1">
                        {t({ en: 'Risk Factors:', ar: 'عوامل المخاطر:' })}
                      </p>
                      <ul className="text-xs text-slate-600 space-y-0.5">
                        {pred.risk_factors.map((factor, i) => (
                          <li key={i}>⚠️ {factor}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {pred.interventions?.length > 0 && (
                    <div className="p-3 bg-white rounded border">
                      <p className="text-sm font-medium text-blue-900 mb-2 flex items-center gap-1">
                        <Sparkles className="h-4 w-4" />
                        {t({ en: 'Recommended Interventions:', ar: 'التدخلات الموصى بها:' })}
                      </p>
                      <div className="space-y-1">
                        {pred.interventions.map((action, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                            <span className="text-blue-600 font-bold">{i + 1}.</span>
                            <span>{action}</span>
                          </div>
                        ))}
                      </div>
                      <Button size="sm" className="mt-3 w-full bg-blue-600">
                        <Send className="h-3 w-3 mr-1" />
                        {t({ en: 'Send Support Email', ar: 'إرسال بريد دعم' })}
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}