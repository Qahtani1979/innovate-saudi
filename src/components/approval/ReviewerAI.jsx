import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, AlertTriangle, CheckCircle2, Loader2, Brain } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { 
  buildReviewerAnalysisPrompt 
} from '@/lib/ai/prompts/approval';

/**
 * ReviewerAI - AI Assistant for Reviewers/Approvers
 * Provides risk assessment, compliance check, recommendations
 */
export default function ReviewerAI({ 
  entityType, 
  entityData, 
  gateName, 
  gateConfig,
  approvalRequest 
}) {
  const { t, isRTL } = useLanguage();
  const [aiReview, setAIReview] = useState(approvalRequest?.ai_review_assistance || null);
  const { invokeAI, status, isLoading: loading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const runAIReview = async () => {
    const prompt = buildReviewerAnalysisPrompt({
      gateName,
      gateConfig,
      entityType,
      entityData,
      approvalRequest
    });

    const response = await invokeAI({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          risk_score: { type: 'number' },
          risk_level: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
          compliance_check: { type: 'boolean' },
          compliance_details: { 
            type: 'object',
            properties: {
              en: { type: 'string' },
              ar: { type: 'string' }
            }
          },
          concerns: { 
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
          similar_cases: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                case: { 
                  type: 'object',
                  properties: {
                    en: { type: 'string' },
                    ar: { type: 'string' }
                  }
                },
                outcome: { 
                  type: 'object',
                  properties: {
                    en: { type: 'string' },
                    ar: { type: 'string' }
                  }
                },
                relevance: { 
                  type: 'object',
                  properties: {
                    en: { type: 'string' },
                    ar: { type: 'string' }
                  }
                }
              }
            }
          },
          suggested_decision: { 
            type: 'string',
            enum: ['approve', 'reject', 'conditional', 'request_info']
          },
          decision_rationale: { 
            type: 'object',
            properties: {
              en: { type: 'string' },
              ar: { type: 'string' }
            }
          },
          review_summary: { 
            type: 'object',
            properties: {
              en: { type: 'string' },
              ar: { type: 'string' }
            }
          }
        }
      }
    });

    if (response.success) {
      setAIReview(response.data);
    }
  };

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            <span className="text-blue-900">
              {t({ en: '🤖 AI Review Assistance', ar: '🤖 مساعدة المراجعة الذكية' })}
            </span>
          </div>
          <Button
            size="sm"
            onClick={runAIReview}
            disabled={loading || !isAvailable}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t({ en: 'Analyzing...', ar: 'يحلل...' })}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                {t({ en: 'AI Review', ar: 'مراجعة ذكية' })}
              </>
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />
        {!aiReview && !loading && (
          <p className="text-sm text-slate-600 text-center py-4">
            {t({ 
              en: 'Click "AI Review" for intelligent analysis and recommendations', 
              ar: 'انقر "مراجعة ذكية" للحصول على تحليل وتوصيات ذكية' 
            })}
          </p>
        )}

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        )}

        {aiReview && (
          <div className="space-y-4">
            {/* Risk Assessment */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-white rounded-lg border-2 border-blue-300">
                <p className="text-sm text-slate-600 mb-2">
                  {t({ en: 'Risk Score', ar: 'درجة المخاطر' })}
                </p>
                <p className={`text-4xl font-bold ${
                  aiReview.risk_score <= 30 ? 'text-green-600' :
                  aiReview.risk_score <= 60 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {aiReview.risk_score}
                </p>
                <Badge className={`mt-2 ${
                  aiReview.risk_level === 'low' ? 'bg-green-100 text-green-700' :
                  aiReview.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {aiReview.risk_level}
                </Badge>
              </div>

              <div className="text-center p-4 bg-white rounded-lg border-2 border-blue-300">
                <p className="text-sm text-slate-600 mb-2">
                  {t({ en: 'Compliance', ar: 'الامتثال' })}
                </p>
                {aiReview.compliance_check ? (
                  <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-2" />
                ) : (
                  <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-2" />
                )}
                <Badge className={aiReview.compliance_check ? 
                  'bg-green-100 text-green-700' : 
                  'bg-red-100 text-red-700'
                }>
                  {aiReview.compliance_check ? 
                    t({ en: 'Compliant', ar: 'ممتثل' }) : 
                    t({ en: 'Issues Found', ar: 'مشاكل محددة' })
                  }
                </Badge>
              </div>
            </div>

            {/* Compliance Details */}
            {aiReview.compliance_details && (
              <div className="p-3 bg-slate-50 rounded border">
                <p className="text-sm text-slate-700">
                  {typeof aiReview.compliance_details === 'object' 
                    ? t(aiReview.compliance_details) 
                    : aiReview.compliance_details}
                </p>
              </div>
            )}

            {/* Concerns */}
            {aiReview.concerns?.length > 0 && (
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="font-semibold text-red-900 mb-2">
                  {t({ en: '⚠️ Concerns:', ar: '⚠️ مخاوف:' })}
                </p>
                <ul className="space-y-1">
                  {aiReview.concerns.map((concern, idx) => (
                    <li key={idx} className="text-sm text-red-700">
                      • {typeof concern === 'object' ? t(concern) : concern}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {aiReview.recommendations?.length > 0 && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="font-semibold text-blue-900 mb-2">
                  {t({ en: '💡 Recommendations:', ar: '💡 توصيات:' })}
                </p>
                <ul className="space-y-1">
                  {aiReview.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-sm text-blue-700">
                      • {typeof rec === 'object' ? t(rec) : rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Similar Cases */}
            {aiReview.similar_cases?.length > 0 && (
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <p className="font-semibold text-purple-900 mb-2">
                  {t({ en: '📚 Similar Cases:', ar: '📚 حالات مشابهة:' })}
                </p>
                <div className="space-y-2">
                  {aiReview.similar_cases.map((caseItem, idx) => (
                    <div key={idx} className="text-sm bg-white p-2 rounded border">
                      <p className="font-medium text-slate-900">
                        {typeof caseItem.case === 'object' ? t(caseItem.case) : caseItem.case}
                      </p>
                      <p className="text-xs text-slate-600">
                        {t({ en: 'Outcome:', ar: 'النتيجة:' })} {typeof caseItem.outcome === 'object' ? t(caseItem.outcome) : caseItem.outcome}
                      </p>
                      <p className="text-xs text-purple-600">
                        {typeof caseItem.relevance === 'object' ? t(caseItem.relevance) : caseItem.relevance}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Decision */}
            <div className="p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg border-2 border-blue-300">
              <p className="font-bold text-blue-900 mb-2">
                {t({ en: '🎯 AI Suggested Decision:', ar: '🎯 القرار المقترح:' })}
              </p>
              <Badge className={`mb-2 ${
                aiReview.suggested_decision === 'approve' ? 'bg-green-600 text-white' :
                aiReview.suggested_decision === 'reject' ? 'bg-red-600 text-white' :
                'bg-yellow-600 text-white'
              }`}>
                {aiReview.suggested_decision?.toUpperCase()}
              </Badge>
              <p className="text-sm text-slate-700 mt-2">
                {typeof aiReview.decision_rationale === 'object' 
                  ? t(aiReview.decision_rationale) 
                  : aiReview.decision_rationale}
              </p>
            </div>

            {/* Review Summary */}
            <div className="p-3 bg-white rounded-lg border-2 border-slate-200">
              <p className="text-sm text-slate-700 leading-relaxed">
                {typeof aiReview.review_summary === 'object' 
                  ? t(aiReview.review_summary) 
                  : aiReview.review_summary}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}