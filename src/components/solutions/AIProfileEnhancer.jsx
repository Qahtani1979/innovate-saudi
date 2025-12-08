import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Sparkles, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AIProfileEnhancer({ solution, onUpdate }) {
  const { language, isRTL, t } = useLanguage();
  const [analyzing, setAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState(null);

  const calculateCompleteness = () => {
    const fields = [
      'name_en', 'description_en', 'features', 'value_proposition', 
      'pricing_model', 'technical_specifications', 'certifications',
      'case_studies', 'image_url', 'demo_url', 'video_url'
    ];
    
    const filled = fields.filter(f => solution[f] && 
      (typeof solution[f] === 'string' ? solution[f].length > 0 : 
       Array.isArray(solution[f]) ? solution[f].length > 0 : true)
    );
    
    return Math.round((filled.length / fields.length) * 100);
  };

  const analyzeProfile = async () => {
    setAnalyzing(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this solution profile and suggest improvements:

SOLUTION: ${solution.name_en}
PROVIDER: ${solution.provider_name}
DESCRIPTION: ${solution.description_en || 'N/A'}
FEATURES: ${solution.features?.length || 0}
CASE STUDIES: ${solution.case_studies?.length || 0}
CERTIFICATIONS: ${solution.certifications?.length || 0}
DEPLOYMENTS: ${solution.deployment_count || 0}

Provide:
1. Missing critical fields
2. Weak areas needing improvement
3. Competitive gaps (compared to top solutions)
4. Specific content suggestions
5. Impact of improvements on visibility/matching`,
        response_json_schema: {
          type: "object",
          properties: {
            completeness_score: { type: "number" },
            missing_fields: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field: { type: "string" },
                  importance: { type: "string" },
                  impact: { type: "string" }
                }
              }
            },
            weak_areas: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  area: { type: "string" },
                  issue: { type: "string" },
                  suggestion: { type: "string" }
                }
              }
            },
            competitive_gaps: { type: "array", items: { type: "string" } },
            quick_wins: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  estimated_impact: { type: "string" }
                }
              }
            }
          }
        }
      });

      setSuggestions(response);
      toast.success(t({ en: 'Profile analysis complete', ar: 'اكتمل تحليل الملف' }));
    } catch (error) {
      toast.error(t({ en: 'Analysis failed', ar: 'فشل التحليل' }));
    } finally {
      setAnalyzing(false);
    }
  };

  const completeness = calculateCompleteness();

  return (
    <Card className="border-2 border-purple-300">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            {t({ en: 'AI Profile Enhancement', ar: 'تحسين الملف بالذكاء الاصطناعي' })}
          </CardTitle>
          <Button onClick={analyzeProfile} disabled={analyzing} size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600">
            {analyzing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Analyze', ar: 'تحليل' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="p-4 bg-slate-50 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-700">
              {t({ en: 'Profile Completeness', ar: 'اكتمال الملف' })}
            </p>
            <Badge className={
              completeness >= 80 ? 'bg-green-100 text-green-700' :
              completeness >= 60 ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }>
              {completeness}%
            </Badge>
          </div>
          <div className="flex-1 bg-slate-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all ${
                completeness >= 80 ? 'bg-green-600' :
                completeness >= 60 ? 'bg-yellow-600' :
                'bg-red-600'
              }`}
              style={{ width: `${completeness}%` }}
            />
          </div>
        </div>

        {suggestions && (
          <div className="space-y-4">
            {suggestions.missing_fields?.length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  {t({ en: 'Missing Critical Fields', ar: 'الحقول الحرجة المفقودة' })}
                </h4>
                <div className="space-y-2">
                  {suggestions.missing_fields.map((field, idx) => (
                    <div key={idx} className="p-3 bg-red-50 rounded border border-red-200">
                      <div className="flex items-start justify-between mb-1">
                        <p className="font-medium text-sm text-slate-900">{field.field}</p>
                        <Badge className="bg-red-100 text-red-700">{field.importance}</Badge>
                      </div>
                      <p className="text-xs text-slate-700">{field.impact}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {suggestions.quick_wins?.length > 0 && (
              <div className="p-4 bg-green-50 rounded-lg border-2 border-green-300">
                <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  {t({ en: '⚡ Quick Wins', ar: '⚡ المكاسب السريعة' })}
                </h4>
                <div className="space-y-2">
                  {suggestions.quick_wins.map((win, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-green-600 font-bold">{idx + 1}.</span>
                      <div className="flex-1">
                        <p className="text-slate-900">{win.action}</p>
                        <p className="text-xs text-green-700 mt-0.5">Impact: {win.estimated_impact}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {suggestions.competitive_gaps?.length > 0 && (
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-300">
                <h4 className="font-semibold text-yellow-900 mb-2">
                  {t({ en: 'Competitive Gaps', ar: 'الفجوات التنافسية' })}
                </h4>
                <ul className="space-y-1">
                  {suggestions.competitive_gaps.map((gap, idx) => (
                    <li key={idx} className="text-sm text-slate-700">⚠️ {gap}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}