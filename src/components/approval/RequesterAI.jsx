import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, CheckCircle2, AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { 
  buildRequesterAssessmentPrompt, 
  REQUESTER_ASSESSMENT_SCHEMA 
} from '@/lib/ai/prompts/approval';

/**
 * RequesterAI - AI Assistant for Requesters
 * Helps complete self-check, verifies readiness, suggests improvements
 */
export default function RequesterAI({ 
  entityType, 
  entityData, 
  gateName, 
  gateConfig,
  onSelfCheckUpdate 
}) {
  const { t, isRTL } = useLanguage();
  const { invokeAI, status, isLoading: loading, rateLimitInfo, isAvailable } = useAIWithFallback();
  const [assessment, setAssessment] = useState(null);

  const runAIAssessment = async () => {
    if (!isAvailable) return;
    
    const prompt = buildRequesterAssessmentPrompt({
      gateName,
      gateConfig,
      entityType,
      entityData
    });

    const response = await invokeAI({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          readiness_score: { type: 'number' },
          checklist_status: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                item: { type: 'string' },
                status: { type: 'string', enum: ['complete', 'incomplete', 'partial'] },
                ai_verified: { type: 'boolean' },
                notes: { 
                  type: 'object',
                  properties: {
                    en: { type: 'string' },
                    ar: { type: 'string' }
                  }
                }
              }
            }
          },
          issues: { 
            type: 'array', 
            items: { 
              type: 'object',
              properties: {
                en: { type: 'string' },
                ar: { type: 'string' }
              }
            }
          },
          recommendations: { 
            type: 'array', 
            items: { 
              type: 'object',
              properties: {
                en: { type: 'string' },
                ar: { type: 'string' }
              }
            }
          },
          overall_assessment: { 
            type: 'object',
            properties: {
              en: { type: 'string' },
              ar: { type: 'string' }
            }
          }
        }
      }
    });

    if (response.success && response.data) {
      setAssessment(response.data);
      
      // Update parent with AI assessment
      if (onSelfCheckUpdate) {
        onSelfCheckUpdate({
          ai_assessment: {
            readiness_score: response.data.readiness_score,
            issues: response.data.issues,
            recommendations: response.data.recommendations
          },
          checklist_items: response.data.checklist_status
        });
      }
    }
  };

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <span className="text-purple-900">
              {t({ en: '🤖 AI Readiness Check', ar: '🤖 فحص الجاهزية الذكي' })}
            </span>
          </div>
          <Button
            size="sm"
            onClick={runAIAssessment}
            disabled={loading || !isAvailable}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t({ en: 'Analyzing...', ar: 'يحلل...' })}
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                {t({ en: 'Run AI Check', ar: 'تشغيل الفحص' })}
              </>
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />
        
        {!assessment && !loading && (
          <p className="text-sm text-slate-600 text-center py-4">
            {t({ 
              en: 'Click "Run AI Check" to verify your submission readiness', 
              ar: 'انقر "تشغيل الفحص" للتحقق من جاهزية التقديم' 
            })}
          </p>
        )}

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        )}

        {assessment && (
          <div className="space-y-4">
            {/* Readiness Score */}
            <div className="text-center p-4 bg-white rounded-lg border-2 border-purple-300">
              <p className="text-sm text-slate-600 mb-2">
                {t({ en: 'Readiness Score', ar: 'درجة الجاهزية' })}
              </p>
              <p className={`text-5xl font-bold ${
                assessment.readiness_score >= 90 ? 'text-green-600' :
                assessment.readiness_score >= 70 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {assessment.readiness_score}%
              </p>
              <Badge className={`mt-2 ${
                assessment.readiness_score >= 90 ? 'bg-green-100 text-green-700' :
                assessment.readiness_score >= 70 ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {assessment.readiness_score >= 90 ? 
                  t({ en: 'Ready to Submit', ar: 'جاهز للتقديم' }) :
                  assessment.readiness_score >= 70 ?
                  t({ en: 'Needs Minor Fixes', ar: 'يحتاج إصلاحات بسيطة' }) :
                  t({ en: 'Not Ready', ar: 'غير جاهز' })
                }
              </Badge>
            </div>

            {/* Checklist Status */}
            <div>
              <p className="font-semibold text-slate-900 mb-2">
                {t({ en: 'Self-Check Items:', ar: 'عناصر الفحص الذاتي:' })}
              </p>
              <div className="space-y-2">
                {assessment.checklist_status?.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2 bg-white rounded border">
                    {item.status === 'complete' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                    ) : item.status === 'partial' ? (
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">
                        {typeof item.item === 'object' ? t(item.item) : item.item}
                      </p>
                      {item.notes && (
                        <p className="text-xs text-slate-600 mt-1">
                          {typeof item.notes === 'object' ? t(item.notes) : item.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Issues */}
            {assessment.issues?.length > 0 && (
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="font-semibold text-red-900 mb-2">
                  {t({ en: '⚠️ Issues Found:', ar: '⚠️ مشاكل محددة:' })}
                </p>
                <ul className="space-y-1">
                  {assessment.issues.map((issue, idx) => (
                    <li key={idx} className="text-sm text-red-700">
                      • {typeof issue === 'object' ? t(issue) : issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {assessment.recommendations?.length > 0 && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="font-semibold text-blue-900 mb-2">
                  {t({ en: '💡 AI Recommendations:', ar: '💡 توصيات الذكاء:' })}
                </p>
                <ul className="space-y-1">
                  {assessment.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-sm text-blue-700">
                      • {typeof rec === 'object' ? t(rec) : rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Overall Assessment */}
            <div className="p-3 bg-slate-50 rounded-lg border">
              <p className="text-sm text-slate-700">
                {typeof assessment.overall_assessment === 'object' 
                  ? t(assessment.overall_assessment) 
                  : assessment.overall_assessment}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}