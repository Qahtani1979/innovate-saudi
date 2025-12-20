import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../components/LanguageContext';
import { Sparkles, ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

export default function ProposalWizard() {
  const { language, isRTL, t } = useLanguage();
  const urlParams = new URLSearchParams(window.location.search);
  const preselectedCallId = urlParams.get('callId');
  
  const [step, setStep] = useState(preselectedCallId ? 2 : 1);
  const [formData, setFormData] = useState({
    rd_call_id: preselectedCallId || '',
    title_en: '',
    title_ar: '',
    tagline_en: '',
    tagline_ar: '',
    abstract_en: '',
    abstract_ar: '',
    lead_institution: '',
    institution_type: 'university',
    research_area: '',
    methodology_en: '',
    methodology_ar: '',
    principal_investigator: {
      name: '',
      title: '',
      email: '',
      expertise: []
    },
    team_members: [],
    trl_start: 3,
    trl_target: 7,
    duration_months: 12,
    budget_requested: 0,
    budget_breakdown: [],
    expected_outputs: [],
    impact_statement: '',
    innovation_claim: ''
  });
  const { invokeAI, status, isLoading: aiEnhancing, isAvailable, rateLimitInfo } = useAIWithFallback();

  const { data: rdCalls = [] } = useQuery({
    queryKey: ['open-rd-calls'],
    queryFn: async () => {
      const all = await base44.entities.RDCall.list();
      return all.filter(c => c.status === 'open');
    }
  });

  const submitMutation = useMutation({
    mutationFn: (data) => base44.entities.RDProposal.create(data),
    onSuccess: () => {
      setStep(4);
    }
  });

  const selectedCall = rdCalls.find(c => c.id === formData.rd_call_id);

  const handleAIEnhance = async () => {
    if (!formData.title_en) {
      toast.error(t({ en: 'Please enter a title first', ar: 'يرجى إدخال العنوان أولاً' }));
      return;
    }

    const result = await invokeAI({
      prompt: `Enhance this research proposal for Saudi municipal innovation R&D funding:

Title: ${formData.title_en}
Lead Institution: ${formData.lead_institution || 'N/A'}
Research Area: ${formData.research_area || 'N/A'}
Current Abstract: ${formData.abstract_en || 'N/A'}
Current Methodology: ${formData.methodology_en || 'N/A'}
R&D Call Context: ${selectedCall?.title_en || 'General R&D Call'}

Generate comprehensive bilingual content:
1. Enhanced title (EN + AR) - academic, precise, compelling
2. Catchy taglines (EN + AR)
3. Detailed abstracts (EN + AR) - 400+ words covering research problem, objectives, methodology, expected outcomes, significance
4. Methodology description (EN + AR) - detailed scientific approach
5. Impact statement - explaining academic, practical, and policy impacts
6. Innovation claim - what makes this research novel
7. 4-6 expected outputs with types (publication, patent, prototype, dataset, etc.)
8. Research keywords (8-12 terms)

Align with Saudi Vision 2030 and municipal innovation goals.`,
      response_json_schema: {
        type: 'object',
        properties: {
          title_en: { type: 'string' },
          title_ar: { type: 'string' },
          tagline_en: { type: 'string' },
          tagline_ar: { type: 'string' },
          abstract_en: { type: 'string' },
          abstract_ar: { type: 'string' },
          methodology_en: { type: 'string' },
          methodology_ar: { type: 'string' },
          impact_statement: { type: 'string' },
          innovation_claim: { type: 'string' },
          expected_outputs: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                output: { type: 'string' },
                type: { type: 'string' }
              }
            }
          },
          keywords: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    if (result.success) {
      setFormData(prev => ({
        ...prev,
        title_en: result.data.title_en || prev.title_en,
        title_ar: result.data.title_ar || prev.title_ar,
        tagline_en: result.data.tagline_en || prev.tagline_en,
        tagline_ar: result.data.tagline_ar || prev.tagline_ar,
        abstract_en: result.data.abstract_en || prev.abstract_en,
        abstract_ar: result.data.abstract_ar || prev.abstract_ar,
        methodology_en: result.data.methodology_en || prev.methodology_en,
        methodology_ar: result.data.methodology_ar || prev.methodology_ar,
        impact_statement: result.data.impact_statement || prev.impact_statement,
        innovation_claim: result.data.innovation_claim || prev.innovation_claim,
        expected_outputs: result.data.expected_outputs || prev.expected_outputs,
        keywords: result.data.keywords || prev.keywords
      }));
      toast.success(t({ en: '✨ AI enhancement complete! All fields updated.', ar: '✨ تم التحسين! تم تحديث جميع الحقول.' }));
    }
  };

  const handleSubmit = () => {
    submitMutation.mutate({ ...formData, status: 'submitted' });
  };

  const progress = (step / 4) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {t({ en: 'Submit Research Proposal', ar: 'تقديم مقترح بحثي' })}
        </h1>
        <p className="text-slate-600 mt-1">
          {t({ en: 'Apply for R&D funding opportunities', ar: 'التقديم على فرص التمويل البحثي' })}
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{t({ en: `Step ${step} of 4`, ar: `الخطوة ${step} من 4` })}</span>
              <span className="text-sm text-slate-600">{progress.toFixed(0)}%</span>
            </div>
            <Progress value={progress} />
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">{t({ en: 'Select R&D Call', ar: 'اختر الإعلان البحثي' })}</h2>
              <Select value={formData.rd_call_id} onValueChange={(v) => setFormData({ ...formData, rd_call_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder={t({ en: 'Choose an R&D call...', ar: 'اختر إعلان...' })} />
                </SelectTrigger>
                <SelectContent>
                  {rdCalls.map((call) => (
                    <SelectItem key={call.id} value={call.id}>
                      {language === 'ar' && call.title_ar ? call.title_ar : call.title_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedCall && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-4">
                    <h3 className="font-semibold text-blue-900 mb-2">
                      {language === 'ar' && selectedCall.title_ar ? selectedCall.title_ar : selectedCall.title_en}
                    </h3>
                    <p className="text-sm text-blue-700 mb-2">
                      {language === 'ar' && selectedCall.description_ar ? selectedCall.description_ar?.substring(0, 200) : selectedCall.description_en?.substring(0, 200)}...
                    </p>
                    <div className="flex gap-2 text-xs">
                      {selectedCall.timeline?.submission_close && (
                        <Badge variant="outline" className="border-blue-300">
                          {t({ en: 'Deadline', ar: 'الموعد النهائي' })}: {selectedCall.timeline.submission_close}
                        </Badge>
                      )}
                      {selectedCall.total_funding && (
                        <Badge variant="outline" className="border-blue-300">
                          {(selectedCall.total_funding / 1000000).toFixed(1)}M SAR
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">{t({ en: 'Proposal Details', ar: 'تفاصيل المقترح' })}</h2>
                <Button variant="outline" onClick={handleAIEnhance} disabled={aiEnhancing || !isAvailable} className="gap-2">
                  {aiEnhancing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t({ en: 'Enhancing...', ar: 'جاري التحسين...' })}
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      {t({ en: 'AI Enhance All', ar: 'تحسين ذكي شامل' })}
                    </>
                  )}
                </Button>
              </div>
              <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />
              
              {/* Titles */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">{t({ en: 'Title (English) *', ar: 'العنوان (إنجليزي) *' })}</label>
                  <Input value={formData.title_en} onChange={(e) => setFormData({ ...formData, title_en: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">{t({ en: 'Title (Arabic)', ar: 'العنوان (عربي)' })}</label>
                  <Input value={formData.title_ar} onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })} className="mt-1" dir="rtl" />
                </div>
              </div>
              
              {/* Taglines */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">{t({ en: 'Tagline (English)', ar: 'الشعار (إنجليزي)' })}</label>
                  <Input value={formData.tagline_en} onChange={(e) => setFormData({ ...formData, tagline_en: e.target.value })} className="mt-1" placeholder={t({ en: 'A brief catchy summary', ar: 'ملخص موجز وجذاب' })} />
                </div>
                <div>
                  <label className="text-sm font-medium">{t({ en: 'Tagline (Arabic)', ar: 'الشعار (عربي)' })}</label>
                  <Input value={formData.tagline_ar} onChange={(e) => setFormData({ ...formData, tagline_ar: e.target.value })} className="mt-1" dir="rtl" />
                </div>
              </div>
              
              {/* Institution & Research Area */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">{t({ en: 'Lead Institution *', ar: 'المؤسسة الرائدة *' })}</label>
                  <Input value={formData.lead_institution} onChange={(e) => setFormData({ ...formData, lead_institution: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">{t({ en: 'Research Area', ar: 'مجال البحث' })}</label>
                  <Input value={formData.research_area} onChange={(e) => setFormData({ ...formData, research_area: e.target.value })} className="mt-1" />
                </div>
              </div>
              
              {/* Abstracts */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">{t({ en: 'Abstract (English) *', ar: 'الملخص (إنجليزي) *' })}</label>
                  <Textarea value={formData.abstract_en} onChange={(e) => setFormData({ ...formData, abstract_en: e.target.value })} rows={5} className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">{t({ en: 'Abstract (Arabic)', ar: 'الملخص (عربي)' })}</label>
                  <Textarea value={formData.abstract_ar} onChange={(e) => setFormData({ ...formData, abstract_ar: e.target.value })} rows={5} className="mt-1" dir="rtl" />
                </div>
              </div>
              
              {/* Methodology */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">{t({ en: 'Methodology (English)', ar: 'المنهجية (إنجليزي)' })}</label>
                  <Textarea value={formData.methodology_en} onChange={(e) => setFormData({ ...formData, methodology_en: e.target.value })} rows={4} className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">{t({ en: 'Methodology (Arabic)', ar: 'المنهجية (عربي)' })}</label>
                  <Textarea value={formData.methodology_ar} onChange={(e) => setFormData({ ...formData, methodology_ar: e.target.value })} rows={4} className="mt-1" dir="rtl" />
                </div>
              </div>
              
              {/* Impact & Innovation */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">{t({ en: 'Impact Statement', ar: 'بيان التأثير' })}</label>
                  <Textarea value={formData.impact_statement} onChange={(e) => setFormData({ ...formData, impact_statement: e.target.value })} rows={3} className="mt-1" placeholder={t({ en: 'Describe academic, practical, and policy impacts', ar: 'صف التأثيرات الأكاديمية والعملية والسياسية' })} />
                </div>
                <div>
                  <label className="text-sm font-medium">{t({ en: 'Innovation Claim', ar: 'ادعاء الابتكار' })}</label>
                  <Textarea value={formData.innovation_claim} onChange={(e) => setFormData({ ...formData, innovation_claim: e.target.value })} rows={3} className="mt-1" placeholder={t({ en: 'What makes this research novel?', ar: 'ما الذي يجعل هذا البحث مبتكراً؟' })} />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">{t({ en: 'Team & Technical Details', ar: 'الفريق والتفاصيل التقنية' })}</h2>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">{t({ en: 'PI Name *', ar: 'اسم الباحث الرئيسي *' })}</label>
                  <Input
                    value={formData.principal_investigator?.name || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      principal_investigator: {...(formData.principal_investigator || {}), name: e.target.value} 
                    })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">{t({ en: 'PI Title', ar: 'لقب الباحث الرئيسي' })}</label>
                  <Input
                    value={formData.principal_investigator?.title || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      principal_investigator: {...(formData.principal_investigator || {}), title: e.target.value} 
                    })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">{t({ en: 'PI Email *', ar: 'بريد الباحث الرئيسي *' })}</label>
                  <Input
                    type="email"
                    value={formData.principal_investigator?.email || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      principal_investigator: {...(formData.principal_investigator || {}), email: e.target.value} 
                    })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">{t({ en: 'Starting TRL', ar: 'المستوى التقني الحالي' })}</label>
                  <Input
                    type="number"
                    min="1"
                    max="9"
                    value={formData.trl_start}
                    onChange={(e) => setFormData({ ...formData, trl_start: parseInt(e.target.value) })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">{t({ en: 'Target TRL', ar: 'المستوى المستهدف' })}</label>
                  <Input
                    type="number"
                    min="1"
                    max="9"
                    value={formData.trl_target}
                    onChange={(e) => setFormData({ ...formData, trl_target: parseInt(e.target.value) })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">{t({ en: 'Duration (months)', ar: 'المدة (أشهر)' })}</label>
                  <Input
                    type="number"
                    value={formData.duration_months}
                    onChange={(e) => setFormData({ ...formData, duration_months: parseInt(e.target.value) })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">{t({ en: 'Budget (SAR)', ar: 'الميزانية (ريال)' })}</label>
                  <Input
                    type="number"
                    value={formData.budget_requested}
                    onChange={(e) => setFormData({ ...formData, budget_requested: parseFloat(e.target.value) })}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="text-center py-12">
              <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                {t({ en: 'Proposal Submitted!', ar: 'تم تقديم المقترح!' })}
              </h2>
              <p className="text-slate-600">
                {t({ en: 'We will review your proposal and notify you soon', ar: 'سنراجع مقترحك ونبلغك قريباً' })}
              </p>
            </div>
          )}

          {step < 4 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                disabled={step === 1}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t({ en: 'Back', ar: 'السابق' })}
              </Button>
              {step < 3 ? (
                <Button onClick={() => setStep(step + 1)}>
                  {t({ en: 'Next', ar: 'التالي' })}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} className="bg-gradient-to-r from-blue-600 to-teal-600">
                  {t({ en: 'Submit Proposal', ar: 'تقديم المقترح' })}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}