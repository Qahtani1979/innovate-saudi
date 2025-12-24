import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useLanguage } from './LanguageContext';
import { Shield, Send, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Checkbox } from "@/components/ui/checkbox";
import AIExemptionSuggester from './AIExemptionSuggester';
import AISafetyProtocolGenerator from './AISafetyProtocolGenerator';

export default function SandboxApplicationForm({ sandbox, onSuccess }) {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const [showAIAssistants, setShowAIAssistants] = useState(false);
  const [formData, setFormData] = useState({
    applicant_organization: '',
    project_title: '',
    project_description: '',
    duration_months: 6,
    start_date: '',
    risk_assessment: '',
    public_safety_plan: '',
    requested_exemptions: []
  });

  const applicationMutation = useMutation({
    mutationFn: async (data) => {
      const { supabase } = await import('@/integrations/supabase/client');

      const { data: app, error: createError } = await supabase
        .from('sandbox_applications')
        .insert([{
          ...data,
          sandbox_id: sandbox.id,
          status: 'submitted'
        }])
        .select()
        .single();
      if (createError) throw createError;

      // Create notification for sandbox admin
      const { error: notifError } = await supabase
        .from('notifications')
        .insert([{
          title: `New Sandbox Application - ${sandbox.name_en}`,
          body: `${data.applicant_organization} has submitted an application for ${data.project_title}`,
          notification_type: 'approval',
          priority: 'high',
          link_url: `/SandboxDetail?id=${sandbox.id}`,
          entity_type: 'SandboxApplication',
          entity_id: app.id,
          action_required: true
        }]);
      if (notifError) throw notifError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['sandbox-applications']);
      toast.success(t({ en: 'Application submitted successfully', ar: 'تم إرسال الطلب بنجاح' }));
      if (onSuccess) onSuccess();
    }
  });

  const toggleExemption = (exemption) => {
    const current = formData.requested_exemptions;
    const updated = current.includes(exemption)
      ? current.filter(e => e !== exemption)
      : [...current, exemption];
    setFormData({ ...formData, requested_exemptions: updated });
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-600" />
              {t({ en: 'Apply for Sandbox Access', ar: 'التقديم للوصول إلى منطقة الاختبار' })}
            </CardTitle>
            <Button
              variant="outline"
              onClick={() => setShowAIAssistants(!showAIAssistants)}
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              {t({ en: 'AI Assistants', ar: 'المساعدين الأذكياء' })}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>{t({ en: 'Organization Name', ar: 'اسم المنظمة' })}</Label>
            <Input
              value={formData.applicant_organization}
              onChange={(e) => setFormData({ ...formData, applicant_organization: e.target.value })}
              placeholder="Your Company or Organization"
            />
          </div>

          <div>
            <Label>{t({ en: 'Project Title', ar: 'عنوان المشروع' })}</Label>
            <Input
              value={formData.project_title}
              onChange={(e) => setFormData({ ...formData, project_title: e.target.value })}
              placeholder="Autonomous Vehicle Testing Program"
            />
          </div>

          <div>
            <Label>{t({ en: 'Project Description', ar: 'وصف المشروع' })}</Label>
            <Textarea
              value={formData.project_description}
              onChange={(e) => setFormData({ ...formData, project_description: e.target.value })}
              rows={4}
              placeholder="Detailed description of what you'll test in the sandbox..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t({ en: 'Duration (months)', ar: 'المدة (أشهر)' })}</Label>
              <Input
                type="number"
                value={formData.duration_months}
                onChange={(e) => setFormData({ ...formData, duration_months: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label>{t({ en: 'Preferred Start Date', ar: 'تاريخ البدء المفضل' })}</Label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>
          </div>

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
            <Label>{t({ en: 'Risk Assessment', ar: 'تقييم المخاطر' })}</Label>
            <Textarea
              value={formData.risk_assessment}
              onChange={(e) => setFormData({ ...formData, risk_assessment: e.target.value })}
              rows={3}
              placeholder="Describe potential risks and mitigation strategies..."
            />
          </div>

          <div>
            <Label>{t({ en: 'Public Safety Plan', ar: 'خطة السلامة العامة' })}</Label>
            <Textarea
              value={formData.public_safety_plan}
              onChange={(e) => setFormData({ ...formData, public_safety_plan: e.target.value })}
              rows={3}
              placeholder="How will you ensure public safety during testing..."
            />
          </div>

          <Button
            onClick={() => applicationMutation.mutate(formData)}
            disabled={!formData.applicant_organization || !formData.project_title || applicationMutation.isPending}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
          >
            <Send className="h-4 w-4 mr-2" />
            {t({ en: 'Submit Application', ar: 'إرسال الطلب' })}
          </Button>
        </CardContent>
      </Card>

      {showAIAssistants && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AIExemptionSuggester
            projectDescription={formData.project_description}
            sandbox={sandbox}
            onSuggestionsApplied={(exemptions) => {
              setFormData({ ...formData, requested_exemptions: exemptions });
              toast.success('Exemptions applied to form');
            }}
          />
          <AISafetyProtocolGenerator
            projectDescription={formData.project_description}
            sandbox={sandbox}
            onProtocolGenerated={(protocol) => {
              setFormData({ ...formData, public_safety_plan: protocol });
              toast.success('Safety protocol applied to form');
            }}
          />
        </div>
      )}
    </div>
  );
}