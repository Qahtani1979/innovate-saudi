import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { CheckCircle2, X, Loader2, Sparkles } from 'lucide-react';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import { useRDMutations } from '@/hooks/useRDMutations';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

export default function RDOutputValidation({ project, onClose }) {
  const { language, isRTL, t } = useLanguage();

  const [validationResults, setValidationResults] = useState(null);
  const [validatorNotes, setValidatorNotes] = useState('');
  const { invokeAI, status, isLoading: validating, isAvailable, rateLimitInfo } = useAIWithFallback();

  const { validateProjectOutputs } = useRDMutations();

  const runAIValidation = async () => {
    const prompt = `Validate R&D project outputs:

Project: ${project.title_en}
Duration: ${project.duration_months} months
Budget: ${project.budget} SAR
TRL Start: ${project.trl_start} → Target: ${project.trl_target}

Outputs:
Publications: ${project.publications?.length || 0}
${project.publications?.map(p => `- ${p.title} (${p.publication}, ${p.year})`).join('\n') || 'None'}

Patents: ${project.patents?.length || 0}
${project.patents?.map(p => `- ${p.title} (${p.status})`).join('\n') || 'None'}

Datasets: ${project.datasets_generated?.length || 0}
${project.datasets_generated?.map(d => d.name).join(', ') || 'None'}

Expected Outputs: ${project.expected_outputs?.map(o => o.output).join(', ') || 'Not specified'}

Validate:
1. Publication quality (check if in reputable venues)
2. Patent relevance and status
3. Dataset completeness
4. Achievement vs expectations (%)
5. TRL progression evidence
6. Overall quality score (0-100)

Return structured validation.`;

    const result = await invokeAI({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          publication_quality: { type: 'string' },
          patent_relevance: { type: 'string' },
          dataset_quality: { type: 'string' },
          achievement_percentage: { type: 'number' },
          trl_evidence: { type: 'string' },
          quality_score: { type: 'number' },
          strengths: { type: 'array', items: { type: 'string' } },
          gaps: { type: 'array', items: { type: 'string' } },
          recommendation: { type: 'string' }
        }
      }
    });

    if (result.success) {
      setValidationResults(result.data);
    }
  };

  const handleValidate = () => {
    validateProjectOutputs.mutate({
      projectId: project.id,
      notes: validatorNotes,
      results: validationResults,
      qualityScore: validationResults.quality_score
    }, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  return (
    <Card className="w-full" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle>{t({ en: 'R&D Output Validation', ar: 'التحقق من مخرجات البحث' })}</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-slate-50 rounded-lg">
          <p className="text-sm font-semibold text-slate-900">{project.title_en}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">{project.publications?.length || 0} {t({ en: 'Publications', ar: 'منشورات' })}</Badge>
            <Badge variant="outline">{project.patents?.length || 0} {t({ en: 'Patents', ar: 'براءات' })}</Badge>
            <Badge variant="outline">{project.datasets_generated?.length || 0} {t({ en: 'Datasets', ar: 'مجموعات بيانات' })}</Badge>
          </div>
        </div>

        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} className="mb-4" />

        {!validationResults && !validating && (
          <div className="text-center py-8">
            <Sparkles className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <p className="text-sm text-slate-600 mb-4">
              {t({ en: 'AI will validate research outputs quality and completeness', ar: 'سيتحقق الذكاء الاصطناعي من جودة واكتمال مخرجات البحث' })}
            </p>
            <Button onClick={runAIValidation} disabled={!isAvailable} className="bg-purple-600 hover:bg-purple-700">
              <Sparkles className="h-4 w-4 mr-2" />
              {t({ en: 'Run AI Validation', ar: 'تشغيل التحقق الذكي' })}
            </Button>
          </div>
        )}

        {validating && (
          <div className="text-center py-8">
            <Loader2 className="h-12 w-12 text-purple-600 mx-auto mb-4 animate-spin" />
            <p className="text-sm text-slate-600">
              {t({ en: 'AI analyzing research outputs...', ar: 'الذكاء الاصطناعي يحلل مخرجات البحث...' })}
            </p>
          </div>
        )}

        {validationResults && (
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-purple-900">{t({ en: 'Quality Score', ar: 'درجة الجودة' })}</span>
                <span className="text-3xl font-bold text-purple-600">{validationResults.quality_score}/100</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 border rounded-lg">
                <p className="text-xs text-slate-500 mb-1">{t({ en: 'Achievement', ar: 'الإنجاز' })}</p>
                <p className="text-2xl font-bold text-blue-600">{validationResults.achievement_percentage}%</p>
              </div>
              <div className="p-3 border rounded-lg">
                <p className="text-xs text-slate-500 mb-1">{t({ en: 'Publications', ar: 'المنشورات' })}</p>
                <p className="text-sm text-slate-700">{validationResults.publication_quality}</p>
              </div>
            </div>

            {validationResults.strengths?.length > 0 && (
              <div>
                <Label className="text-sm font-semibold text-green-900">{t({ en: 'Strengths', ar: 'نقاط القوة' })}</Label>
                <div className="space-y-1 mt-2">
                  {validationResults.strengths.map((strength, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-green-700">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{strength}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {validationResults.gaps?.length > 0 && (
              <div>
                <Label className="text-sm font-semibold text-orange-900">{t({ en: 'Gaps', ar: 'الفجوات' })}</Label>
                <div className="space-y-1 mt-2">
                  {validationResults.gaps.map((gap, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-orange-700">
                      <X className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{gap}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {validationResults.recommendation && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-semibold text-blue-900 mb-2">AI Recommendation:</p>
                <p className="text-sm text-slate-700">{validationResults.recommendation}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label>{t({ en: 'Validator Notes', ar: 'ملاحظات المحقق' })}</Label>
              <Textarea
                value={validatorNotes}
                onChange={(e) => setValidatorNotes(e.target.value)}
                placeholder={t({ en: 'Add your validation notes...', ar: 'أضف ملاحظاتك للتحقق...' })}
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" onClick={onClose} className="flex-1">
                {t({ en: 'Cancel', ar: 'إلغاء' })}
              </Button>
              <Button
                onClick={handleValidate}
                disabled={validateProjectOutputs.isPending}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {t({ en: 'Confirm Validation', ar: 'تأكيد التحقق' })}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
