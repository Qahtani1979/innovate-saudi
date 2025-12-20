import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useLanguage } from './LanguageContext';
import { Shield, Send, Sparkles, ChevronLeft, ChevronRight, Users, FileText, AlertTriangle, Target } from 'lucide-react';
import { toast } from 'sonner';
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AIExemptionSuggester from './AIExemptionSuggester';
import AISafetyProtocolGenerator from './AISafetyProtocolGenerator';

export default function SandboxApplicationWizard({ sandbox, onSuccess }) {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [showAI, setShowAI] = useState(false);
  
  const [formData, setFormData] = useState({
    applicant_organization: '',
    applicant_contact_name: '',
    applicant_contact_email: '',
    applicant_contact_phone: '',
    project_title: '',
    project_description: '',
    testing_scope: '',
    expected_outcomes: '',
    technical_requirements: [],
    team_members: [],
    duration_months: 6,
    start_date: '',
    budget_range: 'under_100k',
    funding_source: '',
    requested_exemptions: [],
    risk_assessment: '',
    risk_mitigation_plan: '',
    public_safety_plan: '',
    environmental_impact: '',
    data_collection_plan: '',
    success_metrics: []
  });

  const applicationMutation = useMutation({
    mutationFn: async (data) => {
      const app = await base44.entities.SandboxApplication.create({
        ...data,
        sandbox_id: sandbox.id,
        status: 'submitted'
      });

      await base44.entities.Notification.create({
        title: `New Sandbox Application - ${sandbox.name_en}`,
        body: `${data.applicant_organization} has submitted an application for ${data.project_title}`,
        notification_type: 'approval',
        priority: 'high',
        link_url: `/SandboxApplicationDetail?id=${app.id}`,
        entity_type: 'SandboxApplication',
        entity_id: app.id,
        action_required: true
      });

      return app;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['sandbox-applications']);
      toast.success(t({ en: 'Application submitted successfully', ar: 'تم إرسال الطلب بنجاح' }));
      if (onSuccess) onSuccess();
    }
  });

  const steps = [
    { id: 1, title: { en: 'Basic Info', ar: 'المعلومات الأساسية' }, icon: FileText },
    { id: 2, title: { en: 'Project Details', ar: 'تفاصيل المشروع' }, icon: Target },
    { id: 3, title: { en: 'Team & Budget', ar: 'الفريق والميزانية' }, icon: Users },
    { id: 4, title: { en: 'Risk & Safety', ar: 'المخاطر والسلامة' }, icon: AlertTriangle },
    { id: 5, title: { en: 'Review', ar: 'المراجعة' }, icon: Shield }
  ];

  const addTeamMember = () => {
    setFormData({
      ...formData,
      team_members: [...formData.team_members, { name: '', role: '', email: '', qualifications: '' }]
    });
  };

  const updateTeamMember = (index, field, value) => {
    const updated = [...formData.team_members];
    updated[index][field] = value;
    setFormData({ ...formData, team_members: updated });
  };

  const addMetric = () => {
    setFormData({
      ...formData,
      success_metrics: [...formData.success_metrics, { metric: '', target: '' }]
    });
  };

  const updateMetric = (index, field, value) => {
    const updated = [...formData.success_metrics];
    updated[index][field] = value;
    setFormData({ ...formData, success_metrics: updated });
  };

  const toggleExemption = (exemption) => {
    const current = formData.requested_exemptions;
    const updated = current.includes(exemption)
      ? current.filter(e => e !== exemption)
      : [...current, exemption];
    setFormData({ ...formData, requested_exemptions: updated });
  };

  const canProceed = () => {
    if (step === 1) return formData.applicant_organization && formData.applicant_contact_name && formData.applicant_contact_email;
    if (step === 2) return formData.project_title && formData.project_description && formData.testing_scope;
    if (step === 3) return formData.duration_months && formData.start_date && formData.budget_range;
    if (step === 4) return formData.risk_assessment && formData.public_safety_plan;
    return true;
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Progress Indicator */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            {steps.map((s, idx) => {
              const Icon = s.icon;
              const isActive = step === s.id;
              const isComplete = step > s.id;
              return (
                <div key={s.id} className="flex items-center">
                  <div className={`flex flex-col items-center ${idx > 0 ? 'ml-4' : ''}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isComplete ? 'bg-green-600 text-white' :
                      isActive ? 'bg-blue-600 text-white' :
                      'bg-slate-200 text-slate-500'
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={`text-xs mt-2 ${isActive ? 'font-semibold' : ''}`}>
                      {s.title[language]}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-2 ${step > s.id ? 'bg-green-600' : 'bg-slate-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-600" />
              {steps[step - 1].title[language]}
            </CardTitle>
            {(step === 2 || step === 4) && (
              <Button variant="outline" onClick={() => setShowAI(!showAI)} className="gap-2">
                <Sparkles className="h-4 w-4" />
                {t({ en: 'AI Help', ar: 'مساعد ذكي' })}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <>
              <div>
                <Label>{t({ en: 'Organization Name *', ar: 'اسم المنظمة *' })}</Label>
                <Input
                  value={formData.applicant_organization}
                  onChange={(e) => setFormData({ ...formData, applicant_organization: e.target.value })}
                  placeholder="Acme Innovation Labs"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>{t({ en: 'Contact Name *', ar: 'اسم المسؤول *' })}</Label>
                  <Input
                    value={formData.applicant_contact_name}
                    onChange={(e) => setFormData({ ...formData, applicant_contact_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>{t({ en: 'Email *', ar: 'البريد الإلكتروني *' })}</Label>
                  <Input
                    type="email"
                    value={formData.applicant_contact_email}
                    onChange={(e) => setFormData({ ...formData, applicant_contact_email: e.target.value })}
                  />
                </div>
                <div>
                  <Label>{t({ en: 'Phone', ar: 'الهاتف' })}</Label>
                  <Input
                    value={formData.applicant_contact_phone}
                    onChange={(e) => setFormData({ ...formData, applicant_contact_phone: e.target.value })}
                  />
                </div>
              </div>
            </>
          )}

          {/* Step 2: Project Details */}
          {step === 2 && (
            <>
              <div>
                <Label>{t({ en: 'Project Title *', ar: 'عنوان المشروع *' })}</Label>
                <Input
                  value={formData.project_title}
                  onChange={(e) => setFormData({ ...formData, project_title: e.target.value })}
                />
              </div>
              <div>
                <Label>{t({ en: 'Project Description *', ar: 'وصف المشروع *' })}</Label>
                <Textarea
                  value={formData.project_description}
                  onChange={(e) => setFormData({ ...formData, project_description: e.target.value })}
                  rows={4}
                />
              </div>
              <div>
                <Label>{t({ en: 'Testing Scope *', ar: 'نطاق الاختبار *' })}</Label>
                <Textarea
                  value={formData.testing_scope}
                  onChange={(e) => setFormData({ ...formData, testing_scope: e.target.value })}
                  rows={3}
                  placeholder="What specifically will be tested in the sandbox..."
                />
              </div>
              <div>
                <Label>{t({ en: 'Expected Outcomes', ar: 'النتائج المتوقعة' })}</Label>
                <Textarea
                  value={formData.expected_outcomes}
                  onChange={(e) => setFormData({ ...formData, expected_outcomes: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label>{t({ en: 'Success Metrics', ar: 'مقاييس النجاح' })}</Label>
                {formData.success_metrics.map((metric, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <Input
                      placeholder="Metric name"
                      value={metric.metric}
                      onChange={(e) => updateMetric(idx, 'metric', e.target.value)}
                    />
                    <Input
                      placeholder="Target"
                      value={metric.target}
                      onChange={(e) => updateMetric(idx, 'target', e.target.value)}
                    />
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addMetric}>+ Add Metric</Button>
              </div>
            </>
          )}

          {/* Step 3: Team & Budget */}
          {step === 3 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>{t({ en: 'Duration (months) *', ar: 'المدة (أشهر) *' })}</Label>
                  <Input
                    type="number"
                    value={formData.duration_months}
                    onChange={(e) => setFormData({ ...formData, duration_months: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>{t({ en: 'Start Date *', ar: 'تاريخ البدء *' })}</Label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>{t({ en: 'Budget Range (SAR) *', ar: 'نطاق الميزانية *' })}</Label>
                  <Select value={formData.budget_range} onValueChange={(val) => setFormData({ ...formData, budget_range: val })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="under_100k">Under 100K</SelectItem>
                      <SelectItem value="100k_500k">100K - 500K</SelectItem>
                      <SelectItem value="500k_1m">500K - 1M</SelectItem>
                      <SelectItem value="1m_5m">1M - 5M</SelectItem>
                      <SelectItem value="over_5m">Over 5M</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t({ en: 'Funding Source', ar: 'مصدر التمويل' })}</Label>
                  <Input
                    value={formData.funding_source}
                    onChange={(e) => setFormData({ ...formData, funding_source: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>{t({ en: 'Team Members', ar: 'أعضاء الفريق' })}</Label>
                {formData.team_members.map((member, idx) => (
                  <div key={idx} className="grid grid-cols-2 gap-2 mb-2 p-3 border rounded">
                    <Input
                      placeholder="Name"
                      value={member.name}
                      onChange={(e) => updateTeamMember(idx, 'name', e.target.value)}
                    />
                    <Input
                      placeholder="Role"
                      value={member.role}
                      onChange={(e) => updateTeamMember(idx, 'role', e.target.value)}
                    />
                    <Input
                      placeholder="Email"
                      value={member.email}
                      onChange={(e) => updateTeamMember(idx, 'email', e.target.value)}
                    />
                    <Input
                      placeholder="Qualifications"
                      value={member.qualifications}
                      onChange={(e) => updateTeamMember(idx, 'qualifications', e.target.value)}
                    />
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addTeamMember}>+ Add Team Member</Button>
              </div>
            </>
          )}

          {/* Step 4: Risk & Safety */}
          {step === 4 && (
            <>
              {sandbox.available_exemptions && sandbox.available_exemptions.length > 0 && (
                <div>
                  <Label className="mb-3 block">{t({ en: 'Requested Exemptions', ar: 'الإعفاءات المطلوبة' })}</Label>
                  <div className="space-y-2">
                    {sandbox.available_exemptions.map((exemption, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Checkbox
                          checked={formData.requested_exemptions.includes(exemption)}
                          onCheckedChange={() => toggleExemption(exemption)}
                        />
                        <span className="text-sm">{exemption}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <Label>{t({ en: 'Risk Assessment *', ar: 'تقييم المخاطر *' })}</Label>
                <Textarea
                  value={formData.risk_assessment}
                  onChange={(e) => setFormData({ ...formData, risk_assessment: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label>{t({ en: 'Risk Mitigation Plan', ar: 'خطة تخفيف المخاطر' })}</Label>
                <Textarea
                  value={formData.risk_mitigation_plan}
                  onChange={(e) => setFormData({ ...formData, risk_mitigation_plan: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label>{t({ en: 'Public Safety Plan *', ar: 'خطة السلامة العامة *' })}</Label>
                <Textarea
                  value={formData.public_safety_plan}
                  onChange={(e) => setFormData({ ...formData, public_safety_plan: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label>{t({ en: 'Environmental Impact', ar: 'الأثر البيئي' })}</Label>
                <Textarea
                  value={formData.environmental_impact}
                  onChange={(e) => setFormData({ ...formData, environmental_impact: e.target.value })}
                  rows={2}
                />
              </div>
            </>
          )}

          {/* Step 5: Review */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold mb-2">{t({ en: 'Application Summary', ar: 'ملخص الطلب' })}</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-slate-600">{t({ en: 'Organization:', ar: 'المنظمة:' })}</span>
                    <p className="font-medium">{formData.applicant_organization}</p>
                  </div>
                  <div>
                    <span className="text-slate-600">{t({ en: 'Project:', ar: 'المشروع:' })}</span>
                    <p className="font-medium">{formData.project_title}</p>
                  </div>
                  <div>
                    <span className="text-slate-600">{t({ en: 'Duration:', ar: 'المدة:' })}</span>
                    <p className="font-medium">{formData.duration_months} months</p>
                  </div>
                  <div>
                    <span className="text-slate-600">{t({ en: 'Budget:', ar: 'الميزانية:' })}</span>
                    <p className="font-medium">{formData.budget_range}</p>
                  </div>
                  <div>
                    <span className="text-slate-600">{t({ en: 'Team Members:', ar: 'أعضاء الفريق:' })}</span>
                    <p className="font-medium">{formData.team_members.length}</p>
                  </div>
                  <div>
                    <span className="text-slate-600">{t({ en: 'Exemptions:', ar: 'الإعفاءات:' })}</span>
                    <p className="font-medium">{formData.requested_exemptions.length}</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-600">
                {t({ en: 'Please review your application before submitting.', ar: 'يرجى مراجعة طلبك قبل الإرسال.' })}
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              disabled={step === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              {t({ en: 'Back', ar: 'السابق' })}
            </Button>
            {step < 5 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="bg-gradient-to-r from-purple-600 to-blue-600"
              >
                {t({ en: 'Next', ar: 'التالي' })}
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={() => applicationMutation.mutate(formData)}
                disabled={applicationMutation.isPending}
                className="bg-gradient-to-r from-green-600 to-teal-600"
              >
                <Send className="h-4 w-4 mr-2" />
                {t({ en: 'Submit Application', ar: 'إرسال الطلب' })}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI Assistants */}
      {showAI && step === 4 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AIExemptionSuggester
            projectDescription={formData.project_description}
            sandbox={sandbox}
            onSuggestionsApplied={(exemptions) => {
              setFormData({ ...formData, requested_exemptions: exemptions });
              toast.success('Exemptions applied');
            }}
          />
          <AISafetyProtocolGenerator
            projectDescription={formData.project_description}
            sandbox={sandbox}
            onProtocolGenerated={(protocol) => {
              setFormData({ ...formData, public_safety_plan: protocol });
              toast.success('Safety protocol applied');
            }}
          />
        </div>
      )}
    </div>
  );
}