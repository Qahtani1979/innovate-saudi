import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Handshake, Sparkles, ChevronRight, ChevronLeft, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import {
  PARTNERSHIP_PROPOSAL_SYSTEM_PROMPT,
  buildPartnershipProposalPrompt,
  PARTNERSHIP_PROPOSAL_SCHEMA
} from '@/lib/ai/prompts/collaboration/partnershipProposal';

export default function PartnershipProposalWizard({ onClose, prefilledData }) {
  const { language, isRTL, t } = useLanguage();
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    partnership_type: '',
    partner_organization: '',
    proposal_title: '',
    objectives: '',
    scope: '',
    duration_months: '',
    expected_outcomes: '',
    ...prefilledData
  });
  const [aiDraft, setAiDraft] = useState(null);
  const { invokeAI, status, isLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const generateAIDraft = async () => {
    const result = await invokeAI({
      system_prompt: PARTNERSHIP_PROPOSAL_SYSTEM_PROMPT,
      prompt: buildPartnershipProposalPrompt(data),
      response_json_schema: PARTNERSHIP_PROPOSAL_SCHEMA
    });

    if (result.success) {
      setAiDraft(result.data);
      toast.success(t({ en: 'AI draft generated', ar: 'تم إنشاء المسودة الذكية' }));
    }
  };

  const handleSubmit = async () => {
    toast.success(t({ en: 'Partnership proposal submitted', ar: 'تم تقديم مقترح الشراكة' }));
    if (onClose) onClose();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Handshake className="h-5 w-5 text-blue-600" />
            {t({ en: 'Partnership Proposal Wizard', ar: 'معالج مقترح الشراكة' })}
          </CardTitle>
          <Badge>{t({ en: `Step ${step}/3`, ar: `خطوة ${step}/3` })}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label>{t({ en: 'Partnership Type', ar: 'نوع الشراكة' })}</Label>
              <Select value={data.partnership_type} onValueChange={(v) => setData({...data, partnership_type: v})}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder={t({ en: 'Select type', ar: 'اختر النوع' })} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pilot_collaboration">Pilot Collaboration</SelectItem>
                  <SelectItem value="rd_partnership">R&D Partnership</SelectItem>
                  <SelectItem value="knowledge_exchange">Knowledge Exchange</SelectItem>
                  <SelectItem value="resource_sharing">Resource Sharing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{t({ en: 'Partner Organization', ar: 'المنظمة الشريكة' })}</Label>
              <Input
                value={data.partner_organization}
                onChange={(e) => setData({...data, partner_organization: e.target.value})}
                placeholder={t({ en: 'Organization name', ar: 'اسم المنظمة' })}
                className="mt-1"
              />
            </div>

            <div>
              <Label>{t({ en: 'Proposal Title', ar: 'عنوان المقترح' })}</Label>
              <Input
                value={data.proposal_title}
                onChange={(e) => setData({...data, proposal_title: e.target.value})}
                placeholder={t({ en: 'Enter title', ar: 'أدخل العنوان' })}
                className="mt-1"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <Label>{t({ en: 'Objectives', ar: 'الأهداف' })}</Label>
              <Textarea
                value={data.objectives}
                onChange={(e) => setData({...data, objectives: e.target.value})}
                rows={4}
                className="mt-1"
              />
            </div>

            <div>
              <Label>{t({ en: 'Scope & Activities', ar: 'النطاق والأنشطة' })}</Label>
              <Textarea
                value={data.scope}
                onChange={(e) => setData({...data, scope: e.target.value})}
                rows={4}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t({ en: 'Duration (months)', ar: 'المدة (أشهر)' })}</Label>
                <Input
                  type="number"
                  value={data.duration_months}
                  onChange={(e) => setData({...data, duration_months: e.target.value})}
                  className="mt-1"
                />
              </div>
            </div>

            <Button onClick={generateAIDraft} disabled={isLoading || !isAvailable} variant="outline" className="w-full">
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              {t({ en: 'Generate AI Draft', ar: 'إنشاء مسودة ذكية' })}
            </Button>
          </div>
        )}

        {step === 3 && aiDraft && (
          <div className="space-y-4">
            <Card className="bg-gradient-to-br from-blue-50 to-white">
              <CardHeader>
                <CardTitle className="text-sm">{t({ en: 'Executive Summary', ar: 'الملخص التنفيذي' })}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-700 leading-relaxed">{aiDraft.executive_summary}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">{t({ en: 'Proposed KPIs', ar: 'المؤشرات المقترحة' })}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {aiDraft.kpis?.map((kpi, idx) => (
                    <li key={idx} className="text-sm text-slate-700">• {kpi}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              {t({ en: 'Back', ar: 'رجوع' })}
            </Button>
          )}
          {step < 3 ? (
            <Button onClick={() => setStep(step + 1)} className="ml-auto bg-blue-600">
              {t({ en: 'Next', ar: 'التالي' })}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="ml-auto bg-green-600">
              <Check className="h-4 w-4 mr-2" />
              {t({ en: 'Submit Proposal', ar: 'تقديم المقترح' })}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
