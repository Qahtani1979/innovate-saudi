import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from './LanguageContext';
import { TrendingUp, X, FileText, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import FileUploader from './FileUploader';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

export default function RDTRLAdvancement({ project, onClose }) {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const [newTRL, setNewTRL] = useState(project.trl_current || project.trl_start);
  const [evidenceUrls, setEvidenceUrls] = useState([]);
  const [justification, setJustification] = useState('');
  const [aiValidation, setAiValidation] = useState(null);
  const { invokeAI, status, isLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const advanceMutation = useMutation({
    mutationFn: async (data) => {
      await base44.entities.RDProject.update(project.id, {
        trl_current: data.newTRL,
        trl_advancement_history: [
          ...(project.trl_advancement_history || []),
          {
            from: project.trl_current || project.trl_start,
            to: data.newTRL,
            date: new Date().toISOString(),
            justification: data.justification,
            evidence_urls: data.evidence,
            ai_validation: data.aiValidation
          }
        ]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['rd-project']);
      toast.success(t({ en: 'TRL advanced', ar: 'تم تقدم مستوى الجاهزية' }));
      onClose();
    }
  });

  const runAIValidation = async () => {
    if (!justification || evidenceUrls.length === 0) {
      toast.error(t({ en: 'Please provide justification and evidence first', ar: 'يرجى تقديم المبرر والأدلة أولاً' }));
      return;
    }

    const prompt = `Validate TRL advancement for R&D project:

Project: ${project.title_en}
Current TRL: ${project.trl_current || project.trl_start}
Proposed TRL: ${newTRL}

TRL Levels:
1 = Basic principles observed
2 = Technology concept formulated
3 = Experimental proof of concept
4 = Technology validated in lab
5 = Technology validated in relevant environment
6 = Technology demonstrated in relevant environment
7 = System prototype demonstration in operational environment
8 = System complete and qualified
9 = Actual system proven in operational environment

Justification: ${justification}
Evidence documents: ${evidenceUrls.length} uploaded

Validate:
1. Is the advancement justified? (yes/no with reasoning)
2. TRL gap appropriate? (should not skip more than 1-2 levels)
3. Evidence sufficiency (sufficient/insufficient)
4. Recommendation (approve/require_more_evidence/reject)
5. Missing evidence types if any

Return structured validation.`;

    const response = await invokeAI({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          advancement_justified: { type: 'boolean' },
          justification_reasoning: { type: 'string' },
          trl_gap_appropriate: { type: 'boolean' },
          evidence_sufficient: { type: 'boolean' },
          missing_evidence: { type: 'array', items: { type: 'string' } },
          recommendation: { type: 'string' },
          confidence_score: { type: 'number' }
        }
      }
    });

    if (response.success && response.data) {
      setAiValidation(response.data);
    }
  };

  const handleAdvance = () => {
    advanceMutation.mutate({
      newTRL,
      justification,
      evidence: evidenceUrls,
      aiValidation
    });
  };

  const trlLevels = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const currentTRL = project.trl_current || project.trl_start;

  return (
    <Card className="w-full max-w-2xl" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-600" />
          {t({ en: 'TRL Advancement', ar: 'تقدم مستوى الجاهزية' })}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} className="mb-4" />
        <div className="p-4 bg-slate-50 rounded-lg">
          <p className="text-sm font-semibold text-slate-900">{project.title_en}</p>
          <div className="flex items-center gap-4 mt-3">
            <div className="text-center">
              <p className="text-xs text-slate-500">{t({ en: 'Current', ar: 'الحالي' })}</p>
              <Badge className="bg-blue-600 text-white mt-1">TRL {currentTRL}</Badge>
            </div>
            <div className="text-2xl text-slate-400">→</div>
            <div className="text-center">
              <p className="text-xs text-slate-500">{t({ en: 'Target', ar: 'المستهدف' })}</p>
              <Badge variant="outline" className="mt-1">TRL {project.trl_target}</Badge>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>{t({ en: 'New TRL Level', ar: 'مستوى الجاهزية الجديد' })}</Label>
          <Select value={newTRL?.toString()} onValueChange={(v) => setNewTRL(parseInt(v))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {trlLevels.map((level) => (
                <SelectItem key={level} value={level.toString()} disabled={level <= currentTRL || level > project.trl_target}>
                  TRL {level}
                  {level <= currentTRL && ' (current or below)'}
                  {level > project.trl_target && ' (above target)'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{t({ en: 'Advancement Justification', ar: 'مبرر التقدم' })} *</Label>
          <Textarea
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            placeholder={t({ en: 'Explain what evidence demonstrates this TRL level has been achieved...', ar: 'اشرح ما هي الأدلة التي تثبت تحقيق هذا المستوى...' })}
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label>{t({ en: 'Upload Evidence', ar: 'رفع الأدلة' })} *</Label>
          <FileUploader
            type="document"
            label={t({ en: 'Upload TRL evidence (reports, test results, demos)', ar: 'رفع أدلة الجاهزية (تقارير، نتائج، عروض)' })}
            maxSize={50}
            onUploadComplete={(url) => setEvidenceUrls([...evidenceUrls, url])}
          />
          {evidenceUrls.length > 0 && (
            <div className="space-y-1 mt-2">
              {evidenceUrls.map((url, i) => (
                <div key={i} className="flex items-center gap-2 p-2 border rounded bg-green-50">
                  <FileText className="h-4 w-4 text-green-600" />
                  <span className="text-xs text-slate-600 flex-1">{url.split('/').pop()}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEvidenceUrls(evidenceUrls.filter((_, idx) => idx !== i))}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {!aiValidation && (
          <Button
            onClick={runAIValidation}
            disabled={isLoading || !isAvailable || !justification || evidenceUrls.length === 0}
            variant="outline"
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Run AI Validation', ar: 'تشغيل التحقق الذكي' })}
          </Button>
        )}

        {aiValidation && (
          <div className="space-y-3">
            <div className={`p-4 rounded-lg border-2 ${aiValidation.advancement_justified ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
              <p className="text-sm font-semibold mb-2">
                {aiValidation.advancement_justified 
                  ? t({ en: '✓ AI Validation: APPROVED', ar: '✓ التحقق الذكي: موافق' })
                  : t({ en: '✗ AI Validation: CONCERNS', ar: '✗ التحقق الذكي: مخاوف' })}
              </p>
              <p className="text-sm text-slate-700">{aiValidation.justification_reasoning}</p>
            </div>

            {aiValidation.missing_evidence?.length > 0 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm font-semibold text-yellow-900 mb-2">{t({ en: 'Missing Evidence:', ar: 'الأدلة المفقودة:' })}</p>
                <ul className="text-sm text-slate-700 space-y-1">
                  {aiValidation.missing_evidence.map((item, i) => (
                    <li key={i}>• {item}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="text-sm font-semibold text-blue-900">{t({ en: 'AI Confidence', ar: 'ثقة الذكاء الاصطناعي' })}</span>
              <Badge className="bg-blue-600 text-white">{aiValidation.confidence_score}%</Badge>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} className="flex-1">
            {t({ en: 'Cancel', ar: 'إلغاء' })}
          </Button>
          <Button
            onClick={handleAdvance}
            disabled={!aiValidation || !aiValidation.advancement_justified || advanceMutation.isPending}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            {t({ en: 'Advance TRL', ar: 'تقدم المستوى' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}