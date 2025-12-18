import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Zap, FileText, CheckCircle2, XCircle, Clock, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { 
  EXECUTIVE_REVIEW_PROMPTS,
  buildExecutiveBriefPrompt,
  EXECUTIVE_BRIEF_SCHEMA 
} from '@/lib/ai/prompts/matchmaker';

export default function ExecutiveReviewGate({ application, onComplete }) {
  const { language, isRTL, t } = useLanguage();
  const [briefUrl, setBriefUrl] = useState(application.executive_review_gate?.executive_briefing_url || null);
  const [decision, setDecision] = useState({
    decision: '',
    executive_comments: '',
    conditions: []
  });

  const { invokeAI, status, error, rateLimitInfo, isLoading, isAvailable } = useAIWithFallback({
    showToasts: true,
    fallbackData: null
  });

  const generateExecutiveBrief = async () => {
    // Build application context for the prompt
    const applicationContext = {
      provider_name: application.organization_name_en,
      challenge_title: application.strategic_challenges?.join(', ') || 'Multiple Challenges',
      proposed_solution: `Sectors: ${application.sectors?.join(', ')}`,
      budget_estimate: application.evaluation_score?.total_score * 10000, // Estimate based on score
      timeline: application.company_stage,
      team_size: 'TBD',
      status: application.classification
    };

    const { success, data } = await invokeAI({
      systemPrompt: EXECUTIVE_REVIEW_PROMPTS.systemPrompt,
      prompt: buildExecutiveBriefPrompt(applicationContext),
      response_json_schema: EXECUTIVE_BRIEF_SCHEMA
    });

    if (success && data) {
      // In real implementation, you'd format this as PDF and upload
      setBriefUrl('generated_brief_url');
      toast.success(t({ en: 'Executive brief generated', ar: 'تم إنشاء الموجز التنفيذي' }));
    }
  };

  const isFastPass = application.classification === 'fast_pass';

  return (
    <Card className="border-2 border-red-300 bg-gradient-to-br from-red-50 to-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-red-600" />
          {t({ en: 'Executive Review Gate', ar: 'بوابة المراجعة التنفيذية' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <AIStatusIndicator status={status} error={error} rateLimitInfo={rateLimitInfo} />
        
        {/* Fast Pass Banner */}
        {isFastPass && (
          <div className="p-4 bg-purple-600 text-white rounded-lg">
            <div className="flex items-center gap-3">
              <Zap className="h-8 w-8" />
              <div>
                <p className="font-bold text-lg">{t({ en: 'FAST PASS APPLICATION', ar: 'طلب تمرير سريع' })}</p>
                <p className="text-sm text-white/90">{t({ en: 'Priority review recommended', ar: 'يوصى بمراجعة ذات أولوية' })}</p>
              </div>
            </div>
          </div>
        )}

        {/* Application Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-white border-2 border-blue-300 rounded-lg text-center">
            <p className="text-sm text-slate-600">{t({ en: 'Base Score', ar: 'الدرجة الأساسية' })}</p>
            <p className="text-3xl font-bold text-blue-600">{application.evaluation_score?.base_score || 0}</p>
          </div>
          <div className="p-4 bg-white border-2 border-amber-300 rounded-lg text-center">
            <p className="text-sm text-slate-600">{t({ en: 'Bonus', ar: 'إضافي' })}</p>
            <p className="text-3xl font-bold text-amber-600">+{application.evaluation_score?.bonus_points || 0}</p>
          </div>
          <div className="p-4 bg-white border-2 border-purple-300 rounded-lg text-center">
            <p className="text-sm text-slate-600">{t({ en: 'Total', ar: 'المجموع' })}</p>
            <p className="text-3xl font-bold text-purple-600">{application.evaluation_score?.total_score || 0}</p>
          </div>
        </div>

        {/* Generate Brief */}
        <div>
          <Button
            onClick={generateExecutiveBrief}
            disabled={isLoading || !isAvailable}
            variant="outline"
            className="w-full"
          >
            {isLoading ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t({ en: 'Generating...', ar: 'جاري الإنشاء...' })}</>
            ) : (
              <><Sparkles className="h-4 w-4 mr-2" />{t({ en: 'Generate Executive Brief (AI)', ar: 'إنشاء الموجز التنفيذي (ذكاء)' })}</>
            )}
          </Button>
          {briefUrl && (
            <Button variant="outline" className="w-full mt-2">
              <FileText className="h-4 w-4 mr-2" />
              {t({ en: 'View Executive Brief', ar: 'عرض الموجز التنفيذي' })}
            </Button>
          )}
        </div>

        {/* Decision */}
        <div className="space-y-3">
          <p className="font-medium text-sm">{t({ en: 'Executive Decision:', ar: 'قرار القيادة:' })}</p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={decision.decision === 'approved' ? 'default' : 'outline'}
              onClick={() => setDecision({...decision, decision: 'approved'})}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {t({ en: 'Approve', ar: 'الموافقة' })}
            </Button>
            <Button
              variant={decision.decision === 'conditional_approval' ? 'default' : 'outline'}
              onClick={() => setDecision({...decision, decision: 'conditional_approval'})}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Clock className="h-4 w-4 mr-2" />
              {t({ en: 'Conditional', ar: 'مشروط' })}
            </Button>
            <Button
              variant={decision.decision === 'deferred' ? 'default' : 'outline'}
              onClick={() => setDecision({...decision, decision: 'deferred'})}
              className="bg-slate-600 hover:bg-slate-700 text-white"
            >
              <Clock className="h-4 w-4 mr-2" />
              {t({ en: 'Defer', ar: 'تأجيل' })}
            </Button>
            <Button
              variant={decision.decision === 'rejected' ? 'default' : 'outline'}
              onClick={() => setDecision({...decision, decision: 'rejected'})}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <XCircle className="h-4 w-4 mr-2" />
              {t({ en: 'Reject', ar: 'رفض' })}
            </Button>
          </div>

          <Textarea
            rows={4}
            value={decision.executive_comments}
            onChange={(e) => setDecision({...decision, executive_comments: e.target.value})}
            placeholder={t({ en: 'Executive comments and rationale...', ar: 'تعليقات القيادة والمبررات...' })}
          />
        </div>

        <Button
          onClick={() => onComplete(decision)}
          disabled={!decision.decision}
          className="w-full bg-red-600 hover:bg-red-700"
        >
          {t({ en: 'Submit Executive Decision', ar: 'تقديم قرار القيادة' })}
        </Button>
      </CardContent>
    </Card>
  );
}
