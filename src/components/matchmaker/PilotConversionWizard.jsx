import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Rocket, FileText, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

export default function PilotConversionWizard({ application, challenge, onClose }) {
  const { language, isRTL, t } = useLanguage();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [pilotData, setPilotData] = useState({
    title_en: '',
    title_ar: '',
    objective_en: '',
    objective_ar: '',
    partnership_agreement_url: '',
    duration_weeks: 12,
    budget: 0
  });

  const { invokeAI, status, error, rateLimitInfo, isLoading, isAvailable } = useAIWithFallback({
    showToasts: true,
    fallbackData: null
  });

  const autoPopulateFromMatch = async () => {
    const title_en = `Pilot: ${challenge?.title_en || application.organization_name_en}`;
    const title_ar = challenge?.title_ar || application.organization_name_ar || '';
    
    setPilotData({
      ...pilotData,
      title_en,
      title_ar,
      objective_en: `Test ${application.organization_name_en} solution for ${challenge?.title_en}`,
      objective_ar: title_ar ? `اختبار حل ${application.organization_name_ar} لـ ${challenge.title_ar}` : ''
    });
    
    toast.success(t({ en: 'Auto-populated from match', ar: 'تم الملء التلقائي من المطابقة' }));
  };

  const generatePartnershipAgreement = async () => {
    const { success, data } = await invokeAI({
      prompt: `Generate a partnership agreement template for this Matchmaker-to-Pilot conversion:

PROVIDER: ${application.organization_name_en}
CHALLENGE: ${challenge?.title_en}
PILOT OBJECTIVE: ${pilotData.objective_en}
DURATION: ${pilotData.duration_weeks} weeks
BUDGET: ${pilotData.budget} SAR

Generate professional MOU/Partnership Agreement in both Arabic and English with:
1. Parties and background
2. Scope of collaboration
3. Roles and responsibilities
4. Duration and milestones
5. Budget and resource allocation
6. IP and data ownership
7. Success criteria
8. Exit clauses`,
      response_json_schema: {
        type: 'object',
        properties: {
          agreement_en: { type: 'string' },
          agreement_ar: { type: 'string' },
          key_terms: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    if (success && data) {
      // In real implementation, format as PDF and upload
      setPilotData({...pilotData, partnership_agreement_url: 'generated_agreement_url'});
      toast.success(t({ en: 'Agreement generated', ar: 'تم إنشاء الاتفاقية' }));
    }
  };

  const createPilot = async () => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const pilot = await base44.entities.Pilot.create({
        ...pilotData,
        challenge_id: challenge?.id,
        solution_id: application.organization_id,
        stage: 'design',
        sector: challenge?.sector,
        municipality_id: challenge?.municipality_id
      });

      await base44.entities.MatchmakerApplication.update(application.id, {
        conversion_status: 'pilot_created',
        converted_pilot_id: pilot.id,
        stage: 'pilot_conversion'
      });

      // Send pilot created email notification via email-trigger-hub
      try {
        const recipientEmail = application.contact_email || application.organization_email;
        if (recipientEmail) {
          await supabase.functions.invoke('email-trigger-hub', {
            body: {
              trigger: 'pilot.created',
              recipient_email: recipientEmail,
              entity_type: 'pilot',
              entity_id: pilot.id,
              variables: {
                pilotTitle: pilotData.title_en || pilotData.title_ar,
                pilotCode: pilot.code || `PLT-${pilot.id?.substring(0, 8)}`,
                startDate: new Date().toISOString().split('T')[0],
                dashboardUrl: window.location.origin + '/pilots/' + pilot.id
              },
              language: language,
              triggered_by: 'system'
            }
          });
        }
      } catch (emailError) {
        console.error('Failed to send pilot created email:', emailError);
      }

      toast.success(t({ en: 'Pilot created successfully!', ar: 'تم إنشاء التجربة بنجاح!' }));
      navigate(createPageUrl(`PilotDetail?id=${pilot.id}`));
    } catch (error) {
      toast.error(t({ en: 'Failed to create pilot', ar: 'فشل إنشاء التجربة' }));
    }
  };

  return (
    <Card className="border-2 border-green-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rocket className="h-5 w-5 text-green-600" />
          {t({ en: 'Pilot Conversion Wizard', ar: 'معالج التحويل لتجربة' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AIStatusIndicator status={status} error={error} rateLimitInfo={rateLimitInfo} />
        
        <div className="flex items-center gap-2 mb-4">
          {[1, 2, 3].map(s => (
            <div key={s} className={`flex-1 h-2 rounded-full ${step >= s ? 'bg-green-600' : 'bg-slate-200'}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <p className="font-medium">{t({ en: 'Step 1: Auto-Populate Pilot Details', ar: 'الخطوة 1: الملء التلقائي لتفاصيل التجربة' })}</p>
            
            <Button onClick={autoPopulateFromMatch} variant="outline" className="w-full">
              <Sparkles className="h-4 w-4 mr-2" />
              {t({ en: 'Auto-Fill from Match', ar: 'ملء تلقائي من المطابقة' })}
            </Button>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-600">{t({ en: 'Pilot Title (EN)', ar: 'عنوان التجربة (EN)' })}</label>
                <Input
                  value={pilotData.title_en}
                  onChange={(e) => setPilotData({...pilotData, title_en: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs text-slate-600">{t({ en: 'Pilot Title (AR)', ar: 'عنوان التجربة (AR)' })}</label>
                <Input
                  value={pilotData.title_ar}
                  onChange={(e) => setPilotData({...pilotData, title_ar: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-600">{t({ en: 'Duration (weeks)', ar: 'المدة (أسابيع)' })}</label>
                  <Input
                    type="number"
                    value={pilotData.duration_weeks}
                    onChange={(e) => setPilotData({...pilotData, duration_weeks: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600">{t({ en: 'Budget (SAR)', ar: 'الميزانية (ريال)' })}</label>
                  <Input
                    type="number"
                    value={pilotData.budget}
                    onChange={(e) => setPilotData({...pilotData, budget: parseInt(e.target.value)})}
                  />
                </div>
              </div>
            </div>

            <Button onClick={() => setStep(2)} className="w-full bg-green-600 hover:bg-green-700">
              {t({ en: 'Next: Partnership Agreement', ar: 'التالي: اتفاقية الشراكة' })}
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="font-medium">{t({ en: 'Step 2: Partnership Agreement', ar: 'الخطوة 2: اتفاقية الشراكة' })}</p>
            
            <Button
              onClick={generatePartnershipAgreement}
              disabled={isLoading || !isAvailable}
              variant="outline"
              className="w-full"
            >
              {isLoading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t({ en: 'Generating...', ar: 'جاري الإنشاء...' })}</>
              ) : (
                <><Sparkles className="h-4 w-4 mr-2" />{t({ en: 'Generate Agreement (AI)', ar: 'إنشاء اتفاقية (ذكاء)' })}</>
              )}
            </Button>

            {pilotData.partnership_agreement_url && (
              <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600 mb-2" />
                <p className="text-sm text-green-900">{t({ en: 'Partnership agreement ready', ar: 'اتفاقية الشراكة جاهزة' })}</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={() => setStep(1)} variant="outline" className="flex-1">
                {t({ en: 'Back', ar: 'رجوع' })}
              </Button>
              <Button onClick={() => setStep(3)} className="flex-1 bg-green-600 hover:bg-green-700">
                {t({ en: 'Next: Review', ar: 'التالي: مراجعة' })}
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <p className="font-medium">{t({ en: 'Step 3: Review & Create', ar: 'الخطوة 3: مراجعة وإنشاء' })}</p>
            
            <div className="p-4 bg-white border rounded-lg space-y-2 text-sm">
              <div><span className="text-slate-600">{t({ en: 'Pilot:', ar: 'التجربة:' })}</span> <span className="font-medium">{pilotData.title_en}</span></div>
              <div><span className="text-slate-600">{t({ en: 'Challenge:', ar: 'التحدي:' })}</span> <span className="font-medium">{challenge?.title_en}</span></div>
              <div><span className="text-slate-600">{t({ en: 'Provider:', ar: 'المزود:' })}</span> <span className="font-medium">{application.organization_name_en}</span></div>
              <div><span className="text-slate-600">{t({ en: 'Duration:', ar: 'المدة:' })}</span> <span className="font-medium">{pilotData.duration_weeks} weeks</span></div>
              <div><span className="text-slate-600">{t({ en: 'Budget:', ar: 'الميزانية:' })}</span> <span className="font-medium">{pilotData.budget.toLocaleString()} SAR</span></div>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => setStep(2)} variant="outline" className="flex-1">
                {t({ en: 'Back', ar: 'رجوع' })}
              </Button>
              <Button onClick={createPilot} className="flex-1 bg-green-600 hover:bg-green-700">
                <Rocket className="h-4 w-4 mr-2" />
                {t({ en: 'Create Pilot', ar: 'إنشاء التجربة' })}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
