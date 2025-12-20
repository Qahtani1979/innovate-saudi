import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from './LanguageContext';
import { AlertTriangle, Send, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { buildIncidentReportPrompt } from '@/lib/ai/prompts/sandbox';

export default function IncidentReportForm({ sandbox, applicationId }) {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const { invokeAI, status, isLoading: aiGenerating, isAvailable, rateLimitInfo } = useAIWithFallback();
  const [formData, setFormData] = useState({
    incident_type: 'safety',
    severity: 'medium',
    title: '',
    description: '',
    location_details: '',
    incident_date: new Date().toISOString()
  });

  const generateAIDraft = async () => {
    const prompt = buildIncidentReportPrompt({
      incidentType: formData.incident_type,
      severity: formData.severity,
      description: formData.description,
      location: formData.location_details,
      sandbox
    });

    const result = await invokeAI({ prompt });

    if (result.success) {
      const response = result.data;
      const lines = typeof response === 'string' ? response.split('\n') : [];
      const title = lines[0]?.replace(/^(Title:|Incident Title:)/i, '').trim() || '';
      const description = lines.slice(1).join('\n').trim() || (typeof response === 'string' ? response : '');
      
      setFormData({
        ...formData,
        title: title.substring(0, 100),
        description: description
      });
      toast.success(t({ en: 'AI draft generated', ar: 'تم إنشاء المسودة الذكية' }));
    }
  };

  const reportMutation = useMutation({
    mutationFn: async (data) => {
      const incident = await base44.entities.SandboxIncident.create({
        ...data,
        sandbox_id: sandbox.id,
        application_id: applicationId,
        status: 'reported'
      });

      await base44.entities.Notification.create({
        title: `${data.severity.toUpperCase()} Incident Reported - ${sandbox.name_en}`,
        body: `${data.title}: ${data.description.substring(0, 100)}`,
        notification_type: 'alert',
        priority: data.severity === 'critical' || data.severity === 'high' ? 'urgent' : 'high',
        entity_type: 'SandboxIncident',
        entity_id: incident.id,
        action_required: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['sandbox-incidents']);
      setFormData({
        incident_type: 'safety',
        severity: 'medium',
        title: '',
        description: '',
        location_details: '',
        incident_date: new Date().toISOString()
      });
      toast.success(t({ en: 'Incident reported successfully', ar: 'تم الإبلاغ عن الحادث بنجاح' }));
    }
  });

  return (
    <Card dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          {t({ en: 'Report Incident', ar: 'الإبلاغ عن حادث' })}
        </CardTitle>
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} showDetails className="mt-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={generateAIDraft}
            disabled={aiGenerating || !isAvailable}
            className="gap-2"
          >
            {aiGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t({ en: 'Generating...', ar: 'جاري الإنشاء...' })}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-purple-600" />
                {t({ en: 'AI Draft Report', ar: 'مسودة ذكية' })}
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>{t({ en: 'Incident Type', ar: 'نوع الحادث' })}</Label>
            <Select value={formData.incident_type} onValueChange={(v) => setFormData({...formData, incident_type: v})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="safety">Safety</SelectItem>
                <SelectItem value="compliance">Compliance</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="public_complaint">Public Complaint</SelectItem>
                <SelectItem value="regulatory_violation">Regulatory Violation</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>{t({ en: 'Severity', ar: 'الخطورة' })}</Label>
            <Select value={formData.severity} onValueChange={(v) => setFormData({...formData, severity: v})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label>{t({ en: 'Title', ar: 'العنوان' })}</Label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            placeholder="Brief incident description"
          />
        </div>

        <div>
          <Label>{t({ en: 'Description', ar: 'الوصف' })}</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            rows={4}
            placeholder="Detailed incident information..."
          />
        </div>

        <div>
          <Label>{t({ en: 'Location Details', ar: 'تفاصيل الموقع' })}</Label>
          <Input
            value={formData.location_details}
            onChange={(e) => setFormData({...formData, location_details: e.target.value})}
            placeholder="Specific location within sandbox zone"
          />
        </div>

        <Button
          onClick={() => reportMutation.mutate(formData)}
          disabled={!formData.title || !formData.description || reportMutation.isPending}
          className="w-full bg-gradient-to-r from-orange-600 to-red-600"
        >
          <Send className="h-4 w-4 mr-2" />
          {t({ en: 'Submit Incident Report', ar: 'إرسال تقرير الحادث' })}
        </Button>
      </CardContent>
    </Card>
  );
}
