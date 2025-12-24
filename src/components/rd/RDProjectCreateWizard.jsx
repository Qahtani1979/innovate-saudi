import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { useLanguage } from '../LanguageContext';
import { useRDCallsWithVisibility } from '@/hooks/useRDCallsWithVisibility';
import { useRDProjectMutations } from '@/hooks/useRDProjectMutations';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import AIProposalWriter from './AIProposalWriter';
import { useEmailTrigger } from '@/hooks/useEmailTrigger';

export default function RDProjectCreateWizard() {
  const { language, isRTL, t } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { triggerEmail } = useEmailTrigger();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title_en: '',
    title_ar: '',
    abstract_en: '',
    abstract_ar: '',
    institution_en: '',
    institution_ar: '',
    institution_type: 'university',
    research_area_en: '',
    research_area_ar: '',
    methodology_en: '',
    methodology_ar: '',
    principal_investigator: {},
    team_members: [],
    budget: 0,
    duration_months: 12,
    trl_start: 3,
    trl_target: 6,
    expected_outputs: [],
    research_themes: [],
    keywords: [],
    budget_breakdown: [],
    status: 'proposal'
  });

  const { data: rdCalls = [] } = useRDCallsWithVisibility({ limit: 100 });

  const { createRDProject } = useRDProjectMutations();

  const handleCreate = async () => {
    try {
      const project = await /** @type {any} */(createRDProject.mutateAsync(formData));

      // Trigger rd.project_created email
      try {
        await triggerEmail('rd.project_created', {
          entityType: 'rd_project',
          entityId: project.id,
          variables: {
            projectTitle: formData.title_en,
            institution: formData.institution_en,
            researchArea: formData.research_area_en,
            trlStart: formData.trl_start,
            trlTarget: formData.trl_target
          }
        });
      } catch (error) {
        console.error('Failed to send rd.project_created email:', error);
      }

      // Toast and navigation handled in hook/component
      // Actually hook handles toast. Navigation needed here?
      // Hook doesn't navigate.
      navigate(createPageUrl(`RDProjectDetail?id=${project.id}`));

    } catch (error) {
      // Error handled in hook toast
      console.error(error);
    }
  };

  const handleAIProposalGenerated = (proposalData) => {
    setFormData(prev => ({
      ...prev,
      title_en: proposalData.title_en || prev.title_en,
      title_ar: proposalData.title_ar || prev.title_ar,
      abstract_en: proposalData.abstract_en || prev.abstract_en,
      abstract_ar: proposalData.abstract_ar || prev.abstract_ar,
      methodology_en: proposalData.methodology_en || prev.methodology_en,
      methodology_ar: proposalData.methodology_ar || prev.methodology_ar,
      expected_outputs: proposalData.expected_outputs || prev.expected_outputs,
      team_members: proposalData.team_requirements?.map(req => ({
        role_en: req.role_en,
        role_ar: req.role_ar,
        expertise: req.expertise
      })) || prev.team_members,
      budget_breakdown: proposalData.budget_breakdown || prev.budget_breakdown
    }));
    setCurrentStep(2);
  };

  const steps = [
    { num: 1, label: { en: 'AI Assistant', ar: 'المساعد الذكي' } },
    { num: 2, label: { en: 'Basic Info', ar: 'معلومات أساسية' } },
    { num: 3, label: { en: 'Research Design', ar: 'التصميم البحثي' } },
    { num: 4, label: { en: 'Team & Budget', ar: 'الفريق والميزانية' } },
    { num: 5, label: { en: 'Review', ar: 'مراجعة' } }
  ];

  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="max-w-5xl mx-auto space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {t({ en: 'Create R&D Project', ar: 'إنشاء مشروع بحث وتطوير' })}
        </h1>
        <Progress value={progress} className="mt-4" />
        <div className="flex justify-between mt-2">
          {steps.map(step => (
            <div key={step.num} className={`text-xs ${currentStep >= step.num ? 'text-blue-600 font-semibold' : 'text-slate-400'}`}>
              {step.num}. {step.label[language]}
            </div>
          ))}
        </div>
      </div>

      {currentStep === 1 && (
        <AIProposalWriter
          onGenerated={handleAIProposalGenerated}
          rdCallId={null}
          rdCallContext={null}
        />
      )}

      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Basic Information', ar: 'المعلومات الأساسية' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">{t({ en: 'Title (EN) *', ar: 'العنوان (EN) *' })}</label>
                <Input value={formData.title_en} onChange={(e) => setFormData({ ...formData, title_en: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">{t({ en: 'Title (AR)', ar: 'العنوان (AR)' })}</label>
                <Input value={formData.title_ar} onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })} dir="rtl" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">{t({ en: 'Institution (EN) *', ar: 'المؤسسة (EN) *' })}</label>
                <Input value={formData.institution_en} onChange={(e) => setFormData({ ...formData, institution_en: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">{t({ en: 'Institution (AR)', ar: 'المؤسسة (AR)' })}</label>
                <Input value={formData.institution_ar} onChange={(e) => setFormData({ ...formData, institution_ar: e.target.value })} dir="rtl" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">{t({ en: 'Institution Type', ar: 'نوع المؤسسة' })}</label>
              <Select value={formData.institution_type} onValueChange={(v) => setFormData({ ...formData, institution_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="university">{t({ en: 'University', ar: 'جامعة' })}</SelectItem>
                  <SelectItem value="research_center">{t({ en: 'Research Center', ar: 'مركز بحثي' })}</SelectItem>
                  <SelectItem value="corporate_rd">{t({ en: 'Corporate R&D', ar: 'بحث شركات' })}</SelectItem>
                  <SelectItem value="government_lab">{t({ en: 'Government Lab', ar: 'مختبر حكومي' })}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">{t({ en: 'Research Area (EN) *', ar: 'المجال (EN) *' })}</label>
                <Input value={formData.research_area_en} onChange={(e) => setFormData({ ...formData, research_area_en: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">{t({ en: 'Research Area (AR)', ar: 'المجال (AR)' })}</label>
                <Input value={formData.research_area_ar} onChange={(e) => setFormData({ ...formData, research_area_ar: e.target.value })} dir="rtl" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Research Design', ar: 'التصميم البحثي' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">{t({ en: 'Abstract (EN)', ar: 'الملخص (EN)' })}</label>
                <Textarea value={formData.abstract_en} onChange={(e) => setFormData({ ...formData, abstract_en: e.target.value })} rows={5} />
              </div>
              <div>
                <label className="text-sm font-medium">{t({ en: 'Abstract (AR)', ar: 'الملخص (AR)' })}</label>
                <Textarea value={formData.abstract_ar} onChange={(e) => setFormData({ ...formData, abstract_ar: e.target.value })} rows={5} dir="rtl" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">{t({ en: 'Methodology (EN)', ar: 'المنهجية (EN)' })}</label>
                <Textarea value={formData.methodology_en} onChange={(e) => setFormData({ ...formData, methodology_en: e.target.value })} rows={4} />
              </div>
              <div>
                <label className="text-sm font-medium">{t({ en: 'Methodology (AR)', ar: 'المنهجية (AR)' })}</label>
                <Textarea value={formData.methodology_ar} onChange={(e) => setFormData({ ...formData, methodology_ar: e.target.value })} rows={4} dir="rtl" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">{t({ en: 'TRL Start', ar: 'مستوى البداية' })}</label>
                <Input type="number" min="1" max="9" value={formData.trl_start?.toString() || ''} onChange={(e) => setFormData({ ...formData, trl_start: parseInt(e.target.value) })} />
              </div>
              <div>
                <label className="text-sm font-medium">{t({ en: 'TRL Target', ar: 'مستوى الهدف' })}</label>
                <Input type="number" min="1" max="9" value={formData.trl_target?.toString() || ''} onChange={(e) => setFormData({ ...formData, trl_target: parseInt(e.target.value) })} />
              </div>
              <div>
                <label className="text-sm font-medium">{t({ en: 'Duration (months)', ar: 'المدة (أشهر)' })}</label>
                <Input type="number" value={formData.duration_months?.toString() || ''} onChange={(e) => setFormData({ ...formData, duration_months: parseInt(e.target.value) })} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Team & Budget', ar: 'الفريق والميزانية' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">{t({ en: 'Budget (SAR)', ar: 'الميزانية (ريال)' })}</label>
              <Input
                type="number"
                value={formData.budget?.toString() || ''}
                onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) })}
                placeholder="500000"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 5 && (
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Review & Submit', ar: 'مراجعة وإرسال' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">{formData.title_en}</h3>
              <p className="text-sm text-slate-700">{formData.institution_en}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge>{formData.research_area_en}</Badge>
                <Badge variant="outline">TRL {formData.trl_start} → {formData.trl_target}</Badge>
                <Badge variant="outline">{formData.duration_months} months</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t({ en: 'Previous', ar: 'السابق' })}
        </Button>
        {currentStep < steps.length ? (
          <Button
            onClick={() => setCurrentStep(currentStep + 1)}
            className="bg-gradient-to-r from-purple-600 to-indigo-600"
          >
            {t({ en: 'Next', ar: 'التالي' })}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleCreate}
            disabled={createRDProject.isPending || !formData.title_en || !formData.institution_en || !formData.research_area_en}
            className="bg-gradient-to-r from-green-600 to-blue-600"
          >
            {createRDProject.isPending ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t({ en: 'Creating...', ar: 'جاري الإنشاء...' })}</>
            ) : (
              <><CheckCircle2 className="h-4 w-4 mr-2" />{t({ en: 'Create Project', ar: 'إنشاء المشروع' })}</>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}