import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { FileText, Download, Loader2, Sparkles, Copy } from 'lucide-react';
import { toast } from 'sonner';

export default function PolicyExecutiveSummaryGenerator({ policy }) {
  const { language, isRTL, t } = useLanguage();
  const [summary, setSummary] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateSummary = async () => {
    setIsGenerating(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate an EXECUTIVE POLICY BRIEF in Arabic for senior Saudi leadership (English translation will be auto-generated):

Policy (Arabic): ${policy.title_ar}
Code: ${policy.code || 'N/A'}
Recommendation (Arabic): ${policy.recommendation_text_ar}
Framework: ${policy.regulatory_framework || 'N/A'}
Regulatory Change: ${policy.regulatory_change_needed ? 'Required' : 'Not required'}
Timeline: ${policy.timeline_months || 'TBD'} months
Priority: ${policy.priority_level}
Status: ${policy.workflow_stage || policy.status}

Generate a concise executive brief in ARABIC (max 300 words) covering:
1. **What**: One-sentence policy objective
2. **Why**: Core problem this solves
3. **Impact**: Expected benefits (quantified if possible)
4. **Implementation**: Key steps and timeline
5. **Stakeholders**: Who's involved and affected
6. **Risks**: Main implementation challenges
7. **Decision**: Recommended action for leadership

Format as professional executive brief suitable for ministerial review.`,
        response_json_schema: {
          type: 'object',
          properties: {
            summary_ar: { type: 'string' },
            key_stats: {
              type: 'object',
              properties: {
                timeline: { type: 'string' },
                affected_population: { type: 'string' },
                estimated_impact: { type: 'string' },
                risk_level: { type: 'string' }
              }
            },
            recommendation: { 
              type: 'string',
              enum: ['approve', 'approve_with_conditions', 'defer', 'reject']
            },
            conditions: {
              type: 'array',
              items: { type: 'string' }
            }
          }
        }
      });

      // Auto-translate to English
      const translationResponse = await base44.functions.invoke('translatePolicy', {
        arabic_fields: {
          title_ar: 'Executive Summary',
          recommendation_text_ar: result.summary_ar,
          implementation_steps: [],
          success_metrics: [],
          stakeholder_involvement_ar: ''
        }
      });

      setSummary({
        ...result,
        summary_en: translationResponse.data.recommendation_text_en
      });
      toast.success(t({ en: 'Summary generated', ar: 'تم إنشاء الملخص' }));
    } catch (error) {
      toast.error(t({ en: 'Generation failed', ar: 'فشل الإنشاء' }));
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadBrief = () => {
    if (!summary) return;

    const briefContent = `
EXECUTIVE POLICY BRIEF
${policy.code || policy.id}

${policy.title_en}
${policy.title_ar || ''}

Generated: ${new Date().toLocaleDateString()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ENGLISH SUMMARY:

${summary.summary_en}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ARABIC SUMMARY:

${summary.summary_ar || 'Not available'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

KEY STATISTICS:
• Timeline: ${summary.key_stats?.timeline || policy.timeline_months + ' months'}
• Affected Population: ${summary.key_stats?.affected_population || 'TBD'}
• Estimated Impact: ${summary.key_stats?.estimated_impact || 'TBD'}
• Risk Level: ${summary.key_stats?.risk_level || policy.implementation_complexity}

RECOMMENDATION: ${summary.recommendation?.toUpperCase()}

${summary.conditions?.length > 0 ? `
CONDITIONS:
${summary.conditions.map((c, i) => `${i + 1}. ${c}`).join('\n')}
` : ''}
    `;

    const blob = new Blob([briefContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Executive_Brief_${policy.code || policy.id}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();

    toast.success(t({ en: 'Brief downloaded', ar: 'تم تنزيل الملخص' }));
  };

  const copyToClipboard = () => {
    if (!summary) return;
    navigator.clipboard.writeText(language === 'ar' ? summary.summary_ar : summary.summary_en);
    toast.success(t({ en: 'Copied to clipboard', ar: 'تم النسخ' }));
  };

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            {t({ en: 'Executive Summary', ar: 'الملخص التنفيذي' })}
          </CardTitle>
          {!summary && (
            <Button
              onClick={generateSummary}
              disabled={isGenerating}
              size="sm"
              className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {t({ en: 'Generate', ar: 'إنشاء' })}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {summary ? (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                {language === 'ar' ? summary.summary_ar : summary.summary_en}
              </p>
            </div>

            {summary.key_stats && (
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-slate-50 rounded text-center">
                  <p className="text-xs text-slate-600">{t({ en: 'Timeline', ar: 'المدة' })}</p>
                  <p className="font-bold text-slate-900">{summary.key_stats.timeline}</p>
                </div>
                <div className="p-2 bg-slate-50 rounded text-center">
                  <p className="text-xs text-slate-600">{t({ en: 'Risk', ar: 'المخاطر' })}</p>
                  <Badge className={
                    summary.key_stats.risk_level?.toLowerCase().includes('high') ? 'bg-red-100 text-red-700' :
                    summary.key_stats.risk_level?.toLowerCase().includes('medium') ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }>
                    {summary.key_stats.risk_level}
                  </Badge>
                </div>
              </div>
            )}

            {summary.recommendation && (
              <div className={`p-3 rounded-lg border-l-4 ${
                summary.recommendation === 'approve' ? 'bg-green-50 border-green-500' :
                summary.recommendation === 'approve_with_conditions' ? 'bg-yellow-50 border-yellow-500' :
                summary.recommendation === 'defer' ? 'bg-orange-50 border-orange-500' :
                'bg-red-50 border-red-500'
              }`}>
                <p className="text-xs font-semibold text-slate-900 mb-1">
                  {t({ en: 'AI Recommendation:', ar: 'توصية الذكاء:' })}
                </p>
                <p className="text-sm font-bold uppercase">
                  {summary.recommendation.replace(/_/g, ' ')}
                </p>
                {summary.conditions?.length > 0 && (
                  <ul className="mt-2 text-xs text-slate-700 space-y-1">
                    {summary.conditions.map((c, i) => (
                      <li key={i}>• {c}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={copyToClipboard} variant="outline" size="sm" className="flex-1 gap-2">
                <Copy className="h-3 w-3" />
                {t({ en: 'Copy', ar: 'نسخ' })}
              </Button>
              <Button onClick={downloadBrief} variant="outline" size="sm" className="flex-1 gap-2">
                <Download className="h-3 w-3" />
                {t({ en: 'Download', ar: 'تنزيل' })}
              </Button>
              <Button onClick={() => setSummary(null)} variant="outline" size="sm">
                {t({ en: 'Regenerate', ar: 'إعادة إنشاء' })}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">
              {t({ en: 'Generate AI-powered executive summary', ar: 'إنشاء ملخص تنفيذي ذكي' })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}