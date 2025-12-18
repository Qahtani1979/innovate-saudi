/**
 * Integrity Tab Component for Data Management Hub
 */
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import { Database, Loader2, Check, X } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import { buildIntegrityAnalysisPrompt, INTEGRITY_ANALYSIS_SCHEMA } from '@/lib/ai/prompts/dataManagement/integrityAnalysis';

export function IntegrityTab({ 
  regions, 
  cities, 
  organizations,
  getOrphanedRecords,
  getDataQualityIssues,
  calculateDataScore
}) {
  const { language, t } = useLanguage();
  const queryClient = useQueryClient();
  const { invokeAI } = useAIWithFallback();
  const [aiFixing, setAiFixing] = useState(false);
  const [aiFixResults, setAiFixResults] = useState(null);

  const handleAIAnalyze = async () => {
    setAiFixing(true);
    setAiFixResults(null);

    const { orphanedCities, orphanedOrgs } = getOrphanedRecords();
    const qualityIssues = getDataQualityIssues();

    const prompt = buildIntegrityAnalysisPrompt({
      regions,
      cities,
      orphanedCities,
      orphanedOrgs,
      qualityIssues,
      calculateDataScore
    });

    const result = await invokeAI({
      prompt,
      response_json_schema: INTEGRITY_ANALYSIS_SCHEMA
    });

    if (result.success) {
      setAiFixResults(result.data);
    }
    setAiFixing(false);
  };

  const applyFixMutation = useMutation({
    mutationFn: async ({ type, fix, index }) => {
      if (type === 'city') {
        if (fix.action === 'DELETE' || fix.action === 'DELETE_DUPLICATE') {
          await base44.entities.City.delete(fix.city_id);
        } else if (fix.action === 'REASSIGN' && fix.target_region_id) {
          const updates = { region_id: fix.target_region_id };
          if (fix.estimated_population) updates.population = fix.estimated_population;
          await base44.entities.City.update(fix.city_id, updates);
        } else if (fix.action === 'UPDATE_POPULATION' && fix.estimated_population) {
          await base44.entities.City.update(fix.city_id, { population: fix.estimated_population });
        }
      } else if (type === 'org') {
        if (fix.action === 'DELETE' || fix.action === 'DELETE_DUPLICATE') {
          await base44.entities.Organization.delete(fix.org_id);
        } else if (fix.action === 'REASSIGN') {
          const updates = {};
          if (fix.target_region_id) updates.region_id = fix.target_region_id;
          if (fix.target_city_id) updates.city_id = fix.target_city_id;
          await base44.entities.Organization.update(fix.org_id, updates);
        } else if (fix.action === 'NULLIFY') {
          await base44.entities.Organization.update(fix.org_id, { region_id: null, city_id: null });
        }
      }
      return { type, index };
    },
    onSuccess: (data) => {
      setAiFixResults(prev => {
        if (!prev) return prev;
        const updated = { ...prev };
        if (data.type === 'city') {
          updated.city_fixes = prev.city_fixes.filter((_, i) => i !== data.index);
        } else {
          updated.org_fixes = prev.org_fixes.filter((_, i) => i !== data.index);
        }
        return updated;
      });

      queryClient.invalidateQueries();
      toast.success(t({ en: 'Fix applied', ar: 'تم تطبيق الإصلاح' }));
    },
    onError: (error) => {
      console.error('Fix error:', error);
      toast.error(t({ en: 'Fix failed', ar: 'فشل الإصلاح' }));
    }
  });

  const { orphanedCities, orphanedOrgs } = getOrphanedRecords();
  const dataQualityIssues = getDataQualityIssues();
  const hasIssues = orphanedCities.length > 0 || orphanedOrgs.length > 0 || dataQualityIssues.length > 0;

  const issueConfig = {
    duplicate_organizations: {
      title: { en: 'Duplicate Organizations', ar: 'منظمات مكررة' },
      desc: { en: 'Similar organization names detected', ar: 'تم اكتشاف أسماء منظمات متشابهة' },
      color: 'red'
    },
    duplicate_cities: {
      title: { en: 'Duplicate Cities', ar: 'مدن مكررة' },
      desc: { en: 'Duplicate city entries', ar: 'مدخلات مدن مكررة' },
      color: 'red'
    },
    partnership_mismatch: {
      title: { en: 'Partnership Inconsistencies', ar: 'تعارضات الشراكة' },
      desc: { en: 'Mismatched partnership flags', ar: 'علامات شراكة متضاربة' },
      color: 'orange'
    },
    incomplete_profile: {
      title: { en: 'Incomplete Profiles', ar: 'ملفات غير مكتملة' },
      desc: { en: 'Missing critical info', ar: 'معلومات حرجة مفقودة' },
      color: 'blue'
    },
    unverified_partners: {
      title: { en: 'Unverified Partners', ar: 'شركاء غير موثقين' },
      desc: { en: 'Pending verification', ar: 'بانتظار التوثيق' },
      color: 'red'
    },
    missing_population: {
      title: { en: 'Missing Population', ar: 'سكان مفقودون' },
      desc: { en: 'Need population data', ar: 'تحتاج بيانات سكانية' },
      color: 'slate'
    },
    funding_inconsistency: {
      title: { en: 'Funding Inconsistency', ar: 'تعارض التمويل' },
      desc: { en: 'Funding stage lacks details', ar: 'مرحلة تمويل بدون تفاصيل' },
      color: 'orange'
    },
    compliance_data_missing: {
      title: { en: 'Missing Compliance', ar: 'امتثال مفقود' },
      desc: { en: 'Need compliance data', ar: 'تحتاج بيانات امتثال' },
      color: 'red'
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-red-600" />
            {t({ en: 'Data Integrity Check', ar: 'فحص سلامة البيانات' })}
          </div>
          {hasIssues && (
            <Button
              onClick={handleAIAnalyze}
              disabled={aiFixing}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              {aiFixing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t({ en: '✨ AI Analyze', ar: '✨ تحليل ذكي' })}
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {aiFixResults && (
          <div className="space-y-4">
            <div className="p-4 border border-blue-200 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-blue-900">
                  {t({ en: 'AI Analysis Complete', ar: 'اكتمل التحليل الذكي' })}
                </h3>
                {aiFixResults.total_issues > 0 && (
                  <div className="flex gap-2">
                    <Badge className="bg-red-100 text-red-700">
                      {aiFixResults.critical_count || 0} {t({ en: 'critical', ar: 'حرج' })}
                    </Badge>
                    <Badge variant="outline">
                      {aiFixResults.total_issues} {t({ en: 'total', ar: 'إجمالي' })}
                    </Badge>
                  </div>
                )}
              </div>
              <p className="text-sm text-blue-700">{aiFixResults.summary}</p>
            </div>

            {aiFixResults.city_fixes?.map((fix, i) => {
              const severityColor = fix.action === 'DELETE' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50';
              return (
                <div key={i} className={`p-4 border rounded-lg ${severityColor}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-foreground">{fix.city_name}</p>
                        <Badge variant="outline" className="text-xs">City</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        <span className="font-medium">Action:</span> {fix.action}
                        {fix.target_region_name && ` → ${fix.target_region_name}`}
                        {fix.estimated_population && ` (Pop: ${fix.estimated_population.toLocaleString()})`}
                      </p>
                      <p className="text-sm text-foreground mt-2 italic">{fix.reason}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => applyFixMutation.mutate({ type: 'city', fix, index: i })}
                        disabled={applyFixMutation.isPending}
                      >
                        {applyFixMutation.isPending ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4 mr-1" />
                        )}
                        {t({ en: 'Apply', ar: 'تطبيق' })}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setAiFixResults(prev => ({
                            ...prev,
                            city_fixes: prev.city_fixes.filter((_, idx) => idx !== i)
                          }));
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}

            {aiFixResults.org_fixes?.map((fix, i) => {
              const severityColors = {
                'DELETE': 'border-red-200 bg-red-50',
                'FIX_PARTNERSHIP': 'border-orange-200 bg-orange-50',
                'VERIFY': 'border-green-200 bg-green-50',
                'ENRICH_DATA': 'border-blue-200 bg-blue-50',
                'REASSIGN': 'border-yellow-200 bg-yellow-50',
                'NULLIFY': 'border-slate-200 bg-slate-50'
              };
              const severityColor = severityColors[fix.action] || 'border-slate-200 bg-white';

              return (
                <div key={i} className={`p-4 border rounded-lg ${severityColor}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-foreground">{fix.org_name}</p>
                        <Badge variant="outline" className="text-xs">Organization</Badge>
                        {fix.issue_type && (
                          <Badge className="text-xs bg-slate-700 text-white">{fix.issue_type}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        <span className="font-medium">Action:</span> {fix.action}
                      </p>
                      <p className="text-sm text-foreground mt-2 italic">{fix.reason}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => applyFixMutation.mutate({ type: 'org', fix, index: i })}
                        disabled={applyFixMutation.isPending}
                      >
                        {applyFixMutation.isPending ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4 mr-1" />
                        )}
                        {t({ en: 'Apply', ar: 'تطبيق' })}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setAiFixResults(prev => ({
                            ...prev,
                            org_fixes: prev.org_fixes.filter((_, idx) => idx !== i)
                          }));
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}

            {aiFixResults && (!aiFixResults.city_fixes?.length && !aiFixResults.org_fixes?.length) && (
              <div className="text-center py-8">
                <Check className="h-12 w-12 text-green-600 mx-auto mb-3" />
                <p className="text-muted-foreground">{t({ en: 'All issues resolved!', ar: 'تم حل جميع المشاكل!' })}</p>
              </div>
            )}
          </div>
        )}

        {!aiFixResults && (hasIssues ? (
          <>
            {dataQualityIssues.map((issue, idx) => {
              const config = issueConfig[issue.type] || {};

              return (
                <div key={idx} className="p-4 border rounded-lg bg-muted/30">
                  <h3 className="font-semibold flex items-center gap-2 mb-2">
                    {config.title?.[language]} ({issue.count})
                    <Badge>{issue.severity}</Badge>
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {config.desc?.[language]}
                  </p>
                  <div className="text-xs text-muted-foreground">
                    {t({ en: 'Click AI Analyze for fixes', ar: 'اضغط تحليل ذكي للحلول' })}
                  </div>
                </div>
              );
            })}

            {orphanedCities.length > 0 && (
              <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                <h3 className="font-semibold text-red-900 mb-2">
                  {t({ en: 'Orphaned Cities', ar: 'مدن يتيمة' })} ({orphanedCities.length})
                </h3>
                <p className="text-sm text-red-700 mb-3">
                  {t({ en: 'Reference deleted regions', ar: 'تشير إلى مناطق محذوفة' })}
                </p>
              </div>
            )}

            {orphanedOrgs.length > 0 && (
              <div className="p-4 border border-orange-200 rounded-lg bg-orange-50">
                <h3 className="font-semibold text-orange-900 mb-2">
                  {t({ en: 'Orphaned Organizations', ar: 'منظمات يتيمة' })} ({orphanedOrgs.length})
                </h3>
                <p className="text-sm text-orange-700">
                  {t({ en: 'Reference deleted regions/cities', ar: 'تشير إلى مناطق/مدن محذوفة' })}
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <Check className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              {t({ en: 'All Good!', ar: 'كل شيء على ما يرام!' })}
            </h3>
            <p className="text-muted-foreground">
              {t({ en: 'No orphaned records. Data integrity maintained.', ar: 'لا توجد سجلات يتيمة. سلامة البيانات محفوظة.' })}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default IntegrityTab;
