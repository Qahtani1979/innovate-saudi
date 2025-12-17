import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link2, Lightbulb, Calendar, Loader2, Sparkles, ArrowRight, Plus } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { getProgramEventCorrelatorPrompt, programEventCorrelatorSchema } from '@/lib/ai/prompts/events';
import { getSystemPrompt } from '@/lib/saudiContext';

export function AIProgramEventCorrelator({ 
  programs = [],
  events = [],
  onSuggestionSelect
}) {
  const { t, isRTL, language } = useLanguage();
  const [analysis, setAnalysis] = useState(null);
  const { invokeAI, status, isLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const analyzeCorrelations = async () => {
    const prompt = getProgramEventCorrelatorPrompt(programs, events, language);
    
    const result = await invokeAI({
      prompt,
      response_json_schema: programEventCorrelatorSchema,
      system_prompt: getSystemPrompt('FULL', true)
    });
    
    if (result.success && result.data) {
      setAnalysis(result.data);
    }
  };

  const getHealthColor = (status) => {
    const colors = {
      good: 'bg-green-100 text-green-700',
      needs_attention: 'bg-amber-100 text-amber-700',
      critical: 'bg-red-100 text-red-700'
    };
    return colors[status] || colors.needs_attention;
  };

  const getImpactColor = (impact) => {
    const colors = {
      high: 'bg-green-100 text-green-700',
      medium: 'bg-blue-100 text-blue-700',
      low: 'bg-slate-100 text-slate-700'
    };
    return colors[impact] || colors.medium;
  };

  return (
    <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Link2 className="h-5 w-5 text-indigo-600" />
            {t({ en: 'Program-Event Correlator', ar: 'محلل علاقة البرامج والفعاليات' })}
          </CardTitle>
          <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!analysis ? (
          <div className="text-center py-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Lightbulb className="h-10 w-10 text-indigo-400" />
              <ArrowRight className="h-6 w-6 text-indigo-300" />
              <Calendar className="h-10 w-10 text-purple-400" />
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {t({ 
                en: 'Analyze relationships between programs and events to find gaps and opportunities',
                ar: 'تحليل العلاقات بين البرامج والفعاليات لإيجاد الفجوات والفرص'
              })}
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mb-4">
              <span><strong>{programs.length}</strong> {t({ en: 'Programs', ar: 'برنامج' })}</span>
              <span>•</span>
              <span><strong>{events.length}</strong> {t({ en: 'Events', ar: 'فعالية' })}</span>
            </div>
            <Button 
              onClick={analyzeCorrelations}
              disabled={isLoading || !isAvailable || (programs.length === 0 && events.length === 0)}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {t({ en: 'Analyzing...', ar: 'جاري التحليل...' })}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {t({ en: 'Analyze Correlations', ar: 'تحليل العلاقات' })}
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Overall Health */}
            {analysis.overall_health && (
              <div className="p-4 bg-white rounded-lg border text-center">
                <div className="text-3xl font-bold text-indigo-600 mb-1">
                  {analysis.overall_health.score}%
                </div>
                <Badge className={getHealthColor(analysis.overall_health.status)}>
                  {analysis.overall_health.status === 'good' ? t({ en: 'Healthy', ar: 'صحي' }) :
                   analysis.overall_health.status === 'needs_attention' ? t({ en: 'Needs Attention', ar: 'يحتاج اهتمام' }) :
                   t({ en: 'Critical', ar: 'حرج' })}
                </Badge>
                <p className="text-xs text-muted-foreground mt-2">{analysis.overall_health.summary}</p>
              </div>
            )}

            {/* Programs Without Events */}
            {analysis.programs_without_events && analysis.programs_without_events.length > 0 && (
              <div className="p-3 bg-white rounded-lg border">
                <p className="font-medium text-sm mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-600" />
                  {t({ en: 'Programs Needing Events', ar: 'برامج تحتاج فعاليات' })}
                </p>
                <div className="space-y-2">
                  {analysis.programs_without_events.slice(0, 3).map((p, i) => (
                    <div key={i} className="p-2 bg-amber-50 rounded border border-amber-100">
                      <p className="text-sm font-medium">{p.program_name}</p>
                      {p.suggested_events && p.suggested_events.slice(0, 2).map((e, j) => (
                        <div key={j} className="flex items-center justify-between mt-1">
                          <span className="text-xs text-muted-foreground">
                            {e.type}: {e.topic}
                          </span>
                          <Link to={createPageUrl('EventCreate') + `?program_id=${p.program_id}`}>
                            <Button size="sm" variant="ghost" className="h-6 text-xs">
                              <Plus className="h-3 w-3 mr-1" />
                              {t({ en: 'Create', ar: 'إنشاء' })}
                            </Button>
                          </Link>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Synergy Opportunities */}
            {analysis.synergy_opportunities && analysis.synergy_opportunities.length > 0 && (
              <div className="p-3 bg-white rounded-lg border">
                <p className="font-medium text-sm mb-2 flex items-center gap-2">
                  <Link2 className="h-4 w-4 text-green-600" />
                  {t({ en: 'Synergy Opportunities', ar: 'فرص التآزر' })}
                </p>
                <div className="space-y-2">
                  {analysis.synergy_opportunities.slice(0, 3).map((s, i) => (
                    <div key={i} className="p-2 bg-green-50 rounded border border-green-100">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{s.opportunity}</span>
                        <Badge className={getImpactColor(s.impact)}>{s.impact}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {s.programs.join(' + ')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Event Gaps */}
            {analysis.event_gaps && analysis.event_gaps.length > 0 && (
              <div className="p-3 bg-white rounded-lg border">
                <p className="font-medium text-sm mb-2">{t({ en: 'Identified Gaps', ar: 'الفجوات المحددة' })}</p>
                <ul className="space-y-1">
                  {analysis.event_gaps.slice(0, 3).map((gap, i) => (
                    <li key={i} className="text-xs text-muted-foreground">
                      <Badge variant="outline" className="mr-2 text-xs">{gap.gap_type}</Badge>
                      {gap.description}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Button 
              variant="outline" 
              size="sm" 
              onClick={analyzeCorrelations}
              className="w-full"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {t({ en: 'Refresh Analysis', ar: 'تحديث التحليل' })}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AIProgramEventCorrelator;
