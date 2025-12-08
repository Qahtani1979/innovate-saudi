import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Lightbulb, Loader2, Sparkles, ArrowRight, CheckCircle2, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import ProtectedPage from '../components/permissions/ProtectedPage';

function ProgramIdeaSubmission() {
  const { language, isRTL, t } = useLanguage();
  const urlParams = new URLSearchParams(window.location.search);
  const programId = urlParams.get('program_id');
  const [step, setStep] = useState(1);
  const [enhancing, setEnhancing] = useState(false);
  const [userEdits, setUserEdits] = useState({});
  const [lastSaved, setLastSaved] = useState(null);

  const [formData, setFormData] = useState({
    program_id: programId || '',
    title_en: '',
    title_ar: '',
    description_en: '',
    description_ar: '',
    proposal_type: 'solution',
    submitter_type: 'citizen',
    submitter_email: '',
    submitter_organization: '',
    implementation_plan: '',
    budget_estimate: '',
    timeline_proposal: '',
    team_composition: [],
    success_metrics_proposed: []
  });

  const { data: programs = [] } = useQuery({
    queryKey: ['programs-active'],
    queryFn: async () => {
      const all = await base44.entities.Program.list();
      return all.filter(p => p.status === 'applications_open');
    }
  });

  const { data: sectors = [] } = useQuery({
    queryKey: ['sectors'],
    queryFn: () => base44.entities.Sector.list()
  });

  const enhanceWithAI = async () => {
    setEnhancing(true);
    try {
      const program = programs.find(p => p.id === formData.program_id);
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Enhance this innovation proposal for program "${program?.name_en}":

Title: ${formData.title_en}
Description: ${formData.description_en}
Type: ${formData.proposal_type}

Generate:
1. Professional bilingual title (EN & AR)
2. Detailed description (EN & AR)
3. Implementation plan
4. Success metrics (5 measurable outcomes)
5. Timeline proposal
6. Team composition needed`,
        response_json_schema: {
          type: 'object',
          properties: {
            title_en: { type: 'string' },
            title_ar: { type: 'string' },
            description_en: { type: 'string' },
            description_ar: { type: 'string' },
            implementation_plan: { type: 'string' },
            success_metrics_proposed: { type: 'array', items: { type: 'string' } },
            timeline_proposal: { type: 'string' },
            team_composition: { type: 'array', items: { 
              type: 'object',
              properties: {
                role: { type: 'string' },
                expertise: { type: 'string' }
              }
            }}
          }
        }
      });

      setFormData({ ...formData, ...result });
      toast.success(t({ en: 'AI enhancement complete', ar: 'تم التحسين' }));
    } catch (error) {
      toast.error(t({ en: 'Enhancement failed', ar: 'فشل التحسين' }));
    } finally {
      setEnhancing(false);
    }
  };

  const submitMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me().catch(() => null);
      return await base44.entities.InnovationProposal.create({
        ...data,
        code: `PROP-${Date.now().toString().slice(-8)}`,
        status: 'submitted',
        created_by: user?.email || data.submitter_email
      });
    },
    onSuccess: () => {
      toast.success(t({ en: 'Proposal submitted!', ar: 'تم التقديم!' }));
      setStep(4);
    }
  });

  const selectedProgram = programs.find(p => p.id === formData.program_id);

  return (
    <div className="max-w-4xl mx-auto space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-900 to-pink-700 bg-clip-text text-transparent">
          {t({ en: 'Submit Innovation Proposal', ar: 'تقديم مقترح ابتكاري' })}
        </h1>
        <p className="text-slate-600 mt-2">
          {t({ en: 'Structured submission for innovation programs', ar: 'تقديم منظم لبرامج الابتكار' })}
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center flex-1">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
              step >= s ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              {step > s ? <CheckCircle2 className="h-6 w-6" /> : s}
            </div>
            {s < 4 && <div className={`flex-1 h-1 ${step > s ? 'bg-purple-600' : 'bg-slate-200'}`} />}
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6 space-y-6">
          {/* Step 1: Program & Basic Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label>{t({ en: 'Select Program', ar: 'اختر البرنامج' })}</Label>
                <Select value={formData.program_id} onValueChange={(v) => setFormData({ ...formData, program_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder={t({ en: 'Choose...', ar: 'اختر...' })} />
                  </SelectTrigger>
                  <SelectContent>
                    {programs.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name_en}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedProgram && (
                  <div className="mt-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-sm text-purple-900">{selectedProgram.description_en}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t({ en: 'Proposal Type', ar: 'نوع المقترح' })}</Label>
                  <Select value={formData.proposal_type} onValueChange={(v) => setFormData({ ...formData, proposal_type: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="problem">Problem</SelectItem>
                      <SelectItem value="solution">Solution</SelectItem>
                      <SelectItem value="research_question">Research Question</SelectItem>
                      <SelectItem value="implementation_plan">Implementation Plan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t({ en: 'Submitter Type', ar: 'نوع المقدم' })}</Label>
                  <Select value={formData.submitter_type} onValueChange={(v) => setFormData({ ...formData, submitter_type: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="citizen">Citizen</SelectItem>
                      <SelectItem value="startup">Startup</SelectItem>
                      <SelectItem value="researcher">Researcher</SelectItem>
                      <SelectItem value="organization">Organization</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t({ en: 'Email', ar: 'البريد' })}</Label>
                  <Input
                    type="email"
                    value={formData.submitter_email}
                    onChange={(e) => setFormData({ ...formData, submitter_email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>{t({ en: 'Organization (Optional)', ar: 'المنظمة (اختياري)' })}</Label>
                  <Input
                    value={formData.submitter_organization}
                    onChange={(e) => setFormData({ ...formData, submitter_organization: e.target.value })}
                  />
                </div>
              </div>

              <Button onClick={() => setStep(2)} disabled={!formData.program_id || !formData.submitter_email} className="w-full bg-purple-600">
                <ArrowRight className="h-4 w-4 mr-2" />
                {t({ en: 'Continue', ar: 'متابعة' })}
              </Button>
            </div>
          )}

          {/* Step 2: Proposal Details */}
          {step === 2 && (
            <div className="space-y-4">
              <Button onClick={enhanceWithAI} disabled={enhancing} variant="outline" className="w-full">
                {enhancing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                {t({ en: 'AI Enhance Proposal', ar: 'تحسين المقترح بالذكاء' })}
              </Button>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t({ en: 'Title (EN)', ar: 'العنوان (EN)' })}</Label>
                  <Input
                    value={formData.title_en}
                    onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>{t({ en: 'Title (AR)', ar: 'العنوان (AR)' })}</Label>
                  <Input
                    value={formData.title_ar}
                    onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                    dir="rtl"
                  />
                </div>
              </div>

              <div>
                <Label>{t({ en: 'Description (EN)', ar: 'الوصف (EN)' })}</Label>
                <Textarea
                  value={formData.description_en}
                  onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                  rows={5}
                  required
                />
              </div>

              <div>
                <Label>{t({ en: 'Description (AR)', ar: 'الوصف (AR)' })}</Label>
                <Textarea
                  value={formData.description_ar}
                  onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                  rows={5}
                  dir="rtl"
                />
              </div>

              <div className="flex gap-3">
                <Button onClick={() => setStep(1)} variant="outline">{t({ en: 'Back', ar: 'رجوع' })}</Button>
                <Button onClick={() => setStep(3)} disabled={!formData.title_en || !formData.description_en} className="flex-1 bg-purple-600">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  {t({ en: 'Continue', ar: 'متابعة' })}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Implementation Details */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <Label>{t({ en: 'Implementation Plan', ar: 'خطة التنفيذ' })}</Label>
                <Textarea
                  value={formData.implementation_plan}
                  onChange={(e) => setFormData({ ...formData, implementation_plan: e.target.value })}
                  rows={4}
                  placeholder={t({ en: 'How will you implement this?', ar: 'كيف ستنفذ هذا؟' })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t({ en: 'Budget Estimate (SAR)', ar: 'تقدير الميزانية (ريال)' })}</Label>
                  <Input
                    type="number"
                    value={formData.budget_estimate}
                    onChange={(e) => setFormData({ ...formData, budget_estimate: parseFloat(e.target.value) })}
                    placeholder="100000"
                  />
                </div>
                <div>
                  <Label>{t({ en: 'Timeline', ar: 'الجدول الزمني' })}</Label>
                  <Input
                    value={formData.timeline_proposal}
                    onChange={(e) => setFormData({ ...formData, timeline_proposal: e.target.value })}
                    placeholder={t({ en: '12 weeks', ar: '12 أسبوع' })}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={() => setStep(2)} variant="outline">{t({ en: 'Back', ar: 'رجوع' })}</Button>
                <Button 
                  onClick={() => submitMutation.mutate(formData)} 
                  disabled={submitMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  {submitMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Lightbulb className="h-4 w-4 mr-2" />
                  )}
                  {t({ en: 'Submit Proposal', ar: 'تقديم المقترح' })}
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <div className="text-center py-12 space-y-4">
              <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">
                {t({ en: 'Proposal Submitted!', ar: 'تم التقديم!' })}
              </h2>
              <p className="text-slate-600">
                {t({ en: 'Your proposal will be reviewed by the program team.', ar: 'سيتم مراجعة مقترحك من قبل فريق البرنامج.' })}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(ProgramIdeaSubmission, { requiredPermissions: [] });