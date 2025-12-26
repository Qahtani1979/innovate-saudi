import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from './LanguageContext';
import { Sparkles, Loader2, Plus } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import {
  buildExemptionSuggesterPrompt,
  exemptionSuggesterSchema,
  EXEMPTION_SUGGESTER_SYSTEM_PROMPT
} from '@/lib/ai/prompts/core';
import { useExemptionSuggester } from '@/hooks/useAIInsights';
import { useSystemEntities } from '@/hooks/useSystemData';

export default function AIExemptionSuggester({ projectData, sandbox, onSelect }) {
  const { language, isRTL, t } = useLanguage();
  const [suggestions, setSuggestions] = useState(null);
  const [selected, setSelected] = useState([]);

  const { data: exemptions = [] } = useSystemEntities('RegulatoryExemption');
  const { suggestMutation, status, error, rateLimitInfo, isLoading, isAvailable } = useExemptionSuggester();

  const suggestExemptions = async () => {
    const availableExemptions = exemptions.filter(e =>
      e.domain === sandbox.domain && e.status === 'active'
    );

    suggestMutation.mutate({
      projectData,
      sandbox,
      availableExemptions,
      promptBuilder: buildExemptionSuggesterPrompt,
      schema: exemptionSuggesterSchema,
      systemPrompt: EXEMPTION_SUGGESTER_SYSTEM_PROMPT
    }, {
      onSuccess: (data) => {
        setSuggestions({
          ...data,
          additional_notes: language === 'ar' ? data.additional_notes_ar : data.additional_notes_en,
          recommended_exemptions: data.recommended_exemptions?.map(rec => ({
            ...rec,
            reasoning: language === 'ar' ? rec.reasoning_ar : rec.reasoning_en,
            risk_notes: language === 'ar' ? rec.risk_notes_ar : rec.risk_notes_en,
            compliance_requirements: language === 'ar' ? rec.compliance_requirements_ar : rec.compliance_requirements_en
          }))
        });
      }
    });
  };

  const handleToggle = (exemptionCode) => {
    setSelected(prev =>
      prev.includes(exemptionCode)
        ? prev.filter(c => c !== exemptionCode)
        : [...prev, exemptionCode]
    );
  };

  const handleApply = () => {
    const selectedExemptions = exemptions
      .filter(e => selected.includes(e.exemption_code))
      .map(e => e.title_en);
    onSelect(selectedExemptions);
  };

  const priorityColors = {
    essential: 'bg-red-100 text-red-700',
    recommended: 'bg-yellow-100 text-yellow-700',
    optional: 'bg-blue-100 text-blue-700'
  };

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          {t({ en: 'AI Exemption Suggestions', ar: 'اقتراحات الإعفاءات الذكية' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AIStatusIndicator status={status} error={error} rateLimitInfo={rateLimitInfo} showDetails />

        {!suggestions ? (
          <div className="text-center py-6">
            <Button
              onClick={suggestExemptions}
              disabled={isLoading || !isAvailable || !projectData.project_title || !projectData.project_description}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t({ en: 'Analyzing...', ar: 'جاري التحليل...' })}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {t({ en: 'Get AI Suggestions', ar: 'الحصول على اقتراحات ذكية' })}
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Compliance Score */}
            <div className="p-4 bg-white rounded-lg border-2 border-purple-200">
              <p className="text-sm text-slate-600 mb-1">
                {t({ en: 'Overall Compliance Score', ar: 'نقاط الامتثال الإجمالية' })}
              </p>
              <div className="flex items-end gap-2">
                <p className="text-4xl font-bold text-purple-600">
                  {suggestions.overall_compliance_score}
                </p>
                <p className="text-slate-500 mb-1">/100</p>
              </div>
            </div>

            {/* Suggested Exemptions */}
            <div className="space-y-3">
              {suggestions.recommended_exemptions?.map((rec, idx) => {
                const exemption = exemptions.find(e => e.exemption_code === rec.exemption_code);
                if (!exemption) return null;

                return (
                  <div key={idx} className="p-4 bg-white rounded-lg border">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selected.includes(rec.exemption_code)}
                        onCheckedChange={() => handleToggle(rec.exemption_code)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="font-mono">
                            {rec.exemption_code}
                          </Badge>
                          <Badge className={priorityColors[rec.priority]}>
                            {rec.priority}
                          </Badge>
                        </div>
                        <p className="font-medium text-slate-900">{exemption.title_en}</p>
                        <p className="text-sm text-slate-600 mt-1">{rec.reasoning}</p>

                        {rec.risk_notes && (
                          <div className="mt-2 p-2 bg-amber-50 rounded text-xs text-amber-800">
                            ⚠ {rec.risk_notes}
                          </div>
                        )}

                        {rec.compliance_requirements?.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-medium text-slate-700">
                              {t({ en: 'Requirements:', ar: 'المتطلبات:' })}
                            </p>
                            <ul className="text-xs text-slate-600 mt-1">
                              {rec.compliance_requirements.map((req, i) => (
                                <li key={i}>• {req}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Additional Notes */}
            {suggestions.additional_notes && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900">{suggestions.additional_notes}</p>
              </div>
            )}

            {/* Apply Button */}
            <Button
              onClick={handleApply}
              disabled={selected.length === 0}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t({ en: `Apply ${selected.length} Exemption(s)`, ar: `تطبيق ${selected.length} إعفاء` })}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
