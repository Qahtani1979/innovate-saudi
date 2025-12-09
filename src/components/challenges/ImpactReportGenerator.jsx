import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { TrendingUp, Users, DollarSign, Target, Lightbulb, AlertCircle, Sparkles, Loader2, BarChart3, CheckCircle2 } from 'lucide-react';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

export default function ImpactReportGenerator({ challenge, pilots = [], contracts = [] }) {
  const { language, isRTL, t } = useLanguage();
  const [report, setReport] = useState(null);

  const { invokeAI, status, error, rateLimitInfo, isLoading, isAvailable } = useAIWithFallback({
    showToasts: true,
    fallbackData: null
  });

  const generateReport = async () => {
    const prompt = `Generate comprehensive BILINGUAL impact report for resolved municipal challenge:

Challenge: ${challenge.title_en} / ${challenge.title_ar}
Sector: ${challenge.sector}
Municipality: ${challenge.municipality_id}
Resolution Summary: ${challenge.resolution_summary || 'N/A'}
Impact Achieved: ${challenge.impact_achieved || 'N/A'}
Lessons Learned: ${JSON.stringify(challenge.lessons_learned || [])}

Linked Pilots: ${pilots.length} (Stages: ${pilots.map(p => p.stage).join(', ')})
Total Budget Spent: ${pilots.reduce((sum, p) => sum + (p.budget_spent || 0), 0)} SAR
Contracts: ${contracts.length} valued at ${contracts.reduce((sum, c) => sum + (c.contract_value || 0), 0)} SAR

Population Affected: ${challenge.affected_population_size || 'Unknown'}

Generate COMPLETE BILINGUAL (EN + AR) impact report with:
1. Executive summary (2-3 paragraphs, EN + AR)
2. Key outcomes achieved (5-7 bullet points, EN + AR)
3. Population benefited (breakdown if data available)
4. Financial ROI analysis (investment vs impact)
5. Success factors (what worked well, EN + AR)
6. Challenges faced (obstacles overcome, EN + AR)
7. Recommendations for replication (3-5 actionable recommendations, EN + AR)
8. Scaling potential (where else this could work)`;

    const result = await invokeAI({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          executive_summary_en: { type: 'string' },
          executive_summary_ar: { type: 'string' },
          key_outcomes: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                en: { type: 'string' },
                ar: { type: 'string' }
              }
            }
          },
          population_impact: {
            type: 'object',
            properties: {
              total_beneficiaries: { type: 'number' },
              direct_beneficiaries: { type: 'number' },
              indirect_beneficiaries: { type: 'number' },
              demographics_reached: { type: 'string' }
            }
          },
          financial_roi: {
            type: 'object',
            properties: {
              total_investment_sar: { type: 'number' },
              cost_per_beneficiary_sar: { type: 'number' },
              estimated_annual_savings_sar: { type: 'number' },
              roi_percentage: { type: 'number' }
            }
          },
          success_factors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                en: { type: 'string' },
                ar: { type: 'string' }
              }
            }
          },
          challenges_faced: {
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
                ar: { type: 'string' },
                priority: { type: 'string' }
              }
            }
          },
          scaling_potential: {
            type: 'object',
            properties: {
              readiness_score: { type: 'number' },
              target_municipalities: { type: 'number' },
              estimated_national_impact: { type: 'string' }
            }
          }
        }
      }
    });

    if (result.success) {
      setReport(result.data);
    }
  };

  if (!report) {
    return (
      <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
        <CardContent className="py-12 text-center">
          <AIStatusIndicator status={status} error={error} rateLimitInfo={rateLimitInfo} showDetails />
          <TrendingUp className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            {t({ en: 'Generate Impact Report', ar: 'إنشاء تقرير الأثر' })}
          </h3>
          <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
            {t({ 
              en: 'AI will analyze the challenge resolution, pilot outcomes, and generate a comprehensive impact assessment', 
              ar: 'سيحلل الذكاء الاصطناعي حل التحدي ونتائج التجارب وينشئ تقييماً شاملاً للأثر' 
            })}
          </p>
          <Button
            onClick={generateReport}
            disabled={isLoading || !isAvailable}
            className="bg-gradient-to-r from-green-600 to-teal-600"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                {t({ en: 'Generating Report...', ar: 'جاري إنشاء التقرير...' })}
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                {t({ en: 'Generate AI Impact Report', ar: 'إنشاء تقرير الأثر بالذكاء' })}
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const totalInvestment = (challenge.budget_estimate || 0) + pilots.reduce((sum, p) => sum + (p.budget_spent || 0), 0);
  const totalBeneficiaries = report.population_impact?.total_beneficiaries || challenge.affected_population_size || 0;

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Executive Summary */}
      <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-6 w-6 text-green-600" />
              {t({ en: 'Executive Summary', ar: 'الملخص التنفيذي' })}
            </CardTitle>
            <Badge className="bg-green-600 text-white">
              <CheckCircle2 className="h-4 w-4 mr-1" />
              {t({ en: 'Resolved', ar: 'محلول' })}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            {language === 'ar' && report.executive_summary_ar ? report.executive_summary_ar : report.executive_summary_en}
          </p>
        </CardContent>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Beneficiaries', ar: 'المستفيدون' })}</p>
                <p className="text-3xl font-bold text-green-600">
                  {totalBeneficiaries > 1000 ? (totalBeneficiaries / 1000).toFixed(1) + 'K' : totalBeneficiaries}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Investment', ar: 'الاستثمار' })}</p>
                <p className="text-3xl font-bold text-blue-600">
                  {(totalInvestment / 1000000).toFixed(1)}M
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'ROI', ar: 'العائد' })}</p>
                <p className="text-3xl font-bold text-purple-600">
                  {report.financial_roi?.roi_percentage || 0}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Pilots', ar: 'التجارب' })}</p>
                <p className="text-3xl font-bold text-orange-600">{pilots.length}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Outcomes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            {t({ en: 'Key Outcomes Achieved', ar: 'النتائج الرئيسية المحققة' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {report.key_outcomes?.map((outcome, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                  {language === 'ar' && outcome.ar ? outcome.ar : outcome.en}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Financial Impact */}
      {report.financial_roi && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              {t({ en: 'Financial Impact & ROI', ar: 'الأثر المالي والعائد' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-xs text-slate-600 mb-1">{t({ en: 'Total Investment', ar: 'الاستثمار الكلي' })}</p>
                <p className="text-2xl font-bold text-blue-700">
                  {(report.financial_roi.total_investment_sar / 1000000).toFixed(2)}M SAR
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-xs text-slate-600 mb-1">{t({ en: 'Cost per Beneficiary', ar: 'التكلفة لكل مستفيد' })}</p>
                <p className="text-2xl font-bold text-green-700">
                  {report.financial_roi.cost_per_beneficiary_sar?.toFixed(0)} SAR
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-xs text-slate-600 mb-1">{t({ en: 'Est. Annual Savings', ar: 'التوفير السنوي المقدر' })}</p>
                <p className="text-2xl font-bold text-purple-700">
                  {(report.financial_roi.estimated_annual_savings_sar / 1000000).toFixed(2)}M SAR
                </p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-xs text-slate-600 mb-1">{t({ en: 'ROI', ar: 'العائد على الاستثمار' })}</p>
                <p className="text-2xl font-bold text-orange-700">
                  {report.financial_roi.roi_percentage}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Factors */}
      {report.success_factors?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
              {t({ en: 'Success Factors', ar: 'عوامل النجاح' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {report.success_factors.map((factor, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <div className="h-6 w-6 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {i + 1}
                  </div>
                  <p className="text-slate-700 pt-0.5" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    {language === 'ar' && factor.ar ? factor.ar : factor.en}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Challenges Faced */}
      {report.challenges_faced?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              {t({ en: 'Challenges & Obstacles', ar: 'التحديات والعقبات' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {report.challenges_faced.map((item, i) => (
                <div key={i} className="p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                  <p className="text-sm text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    {language === 'ar' && item.ar ? item.ar : item.en}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations for Replication */}
      {report.recommendations?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-indigo-600" />
              {t({ en: 'Recommendations for Replication', ar: 'توصيات للتكرار' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {report.recommendations.map((rec, i) => (
                <div key={i} className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Badge className={
                      rec.priority === 'high' ? 'bg-red-600' :
                      rec.priority === 'medium' ? 'bg-orange-600' :
                      'bg-blue-600'
                    }>
                      {rec.priority || 'medium'}
                    </Badge>
                    <p className="text-sm text-slate-700 flex-1" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                      {language === 'ar' && rec.ar ? rec.ar : rec.en}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scaling Potential */}
      {report.scaling_potential && (
        <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              {t({ en: 'Scaling Potential', ar: 'إمكانية التوسع' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-lg border">
                <p className="text-3xl font-bold text-purple-600">{report.scaling_potential.readiness_score}/100</p>
                <p className="text-xs text-slate-600 mt-1">{t({ en: 'Readiness Score', ar: 'درجة الجاهزية' })}</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border">
                <p className="text-3xl font-bold text-blue-600">{report.scaling_potential.target_municipalities}</p>
                <p className="text-xs text-slate-600 mt-1">{t({ en: 'Target Cities', ar: 'المدن المستهدفة' })}</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border">
                <p className="text-xl font-bold text-green-600">{report.scaling_potential.estimated_national_impact}</p>
                <p className="text-xs text-slate-600 mt-1">{t({ en: 'National Impact', ar: 'الأثر الوطني' })}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Regenerate Button */}
      <Button
        onClick={generateReport}
        variant="outline"
        className="w-full"
        disabled={isLoading || !isAvailable}
      >
        <Sparkles className="h-4 w-4 mr-2" />
        {t({ en: 'Regenerate Report', ar: 'إعادة إنشاء التقرير' })}
      </Button>
    </div>
  );
}
