import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/components/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Megaphone, Sparkles, Loader2, Target, Calendar, Users, CheckCircle2, Plus, Send } from 'lucide-react';
import { toast } from 'sonner';
import { useApprovalRequest } from '@/hooks/useApprovalRequest';

export default function StrategyToCampaignGenerator({ strategicPlanId, strategicPlan, onCampaignCreated }) {
  const { t, isRTL } = useLanguage();
  const { createApprovalRequest } = useApprovalRequest();
  const [additionalContext, setAdditionalContext] = useState('');
  const [campaignCount, setCampaignCount] = useState(3);
  const [campaigns, setCampaigns] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Use the passed strategicPlanId from global context
  const selectedPlanId = strategicPlanId;

  const handleGenerate = async () => {
    if (!selectedPlanId) {
      toast.error(t({ en: 'Please select a strategic plan', ar: 'الرجاء اختيار خطة استراتيجية' }));
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('strategy-campaign-generator', {
        body: {
          strategic_plan_id: selectedPlanId,
          strategic_context: additionalContext,
          campaign_count: campaignCount,
        },
      });

      if (error) throw error;
      setCampaigns(data?.campaigns || []);
      toast.success(t({ en: 'Campaigns generated successfully', ar: 'تم إنشاء الحملات بنجاح' }));
    } catch (error) {
      console.error('Generation error:', error);
      toast.error(t({ en: 'Failed to generate campaigns', ar: 'فشل في إنشاء الحملات' }));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveCampaign = async (campaign, index, submitForApproval = false) => {
    try {
      const { data, error } = await supabase
        .from('marketing_campaigns')
        .insert({
          name_en: campaign.name_en,
          name_ar: campaign.name_ar,
          objective_en: campaign.objective_en,
          objective_ar: campaign.objective_ar,
          target_audience_en: campaign.target_audience_en,
          target_audience_ar: campaign.target_audience_ar,
          duration: campaign.duration,
          channels: campaign.channels,
          kpis: campaign.kpis,
          strategic_plan_ids: [selectedPlanId],
          is_strategy_derived: true,
          strategy_derivation_date: new Date().toISOString(),
          status: submitForApproval ? 'pending' : 'draft',
        })
        .select()
        .single();

      if (error) throw error;

      // Create approval request if submitting (Phase 4 integration)
      if (submitForApproval) {
        await createApprovalRequest({
          entityType: 'campaign',
          entityId: data.id,
          entityTitle: campaign.name_en,
          isStrategyDerived: true,
          strategicPlanIds: [selectedPlanId],
          metadata: {
            channels: campaign.channels,
            source: 'cascade_generator',
          },
        });
      }

      const updated = [...campaigns];
      updated[index] = { ...updated[index], saved: true, savedId: data.id, submitted: submitForApproval };
      setCampaigns(updated);

      toast.success(
        t({
          en: submitForApproval ? 'Campaign saved and submitted for approval' : 'Campaign saved successfully',
          ar: submitForApproval ? 'تم حفظ الحملة وإرسالها للموافقة' : 'تم حفظ الحملة بنجاح',
        }),
      );
      onCampaignCreated?.(data);
    } catch (error) {
      console.error('Save error:', error);
      toast.error(t({ en: 'Failed to save campaign', ar: 'فشل في حفظ الحملة' }));
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary" />
            {t({ en: 'Strategic Campaign Generator', ar: 'مولد الحملات الاستراتيجية' })}
          </CardTitle>
          <CardDescription>
            {t({
              en: 'Generate marketing campaigns aligned with strategic objectives',
              ar: 'إنشاء حملات تسويقية متوافقة مع الأهداف الاستراتيجية',
            })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {strategicPlan && (
            <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
              <p className="text-sm text-indigo-700">
                <span className="font-medium">{t({ en: 'Active Plan:', ar: 'الخطة النشطة:' })}</span>{' '}
                {isRTL && strategicPlan.name_ar ? strategicPlan.name_ar : strategicPlan.name_en}
              </p>
            </div>
          )}

          <Textarea
            placeholder={t({
              en: 'Enter strategic objectives and target outcomes...',
              ar: 'أدخل الأهداف الاستراتيجية والنتائج المستهدفة...',
            })}
            value={additionalContext}
            onChange={(e) => setAdditionalContext(e.target.value)}
            rows={3}
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">{t({ en: 'Generate', ar: 'إنشاء' })}</label>
              <Select value={String(campaignCount)} onValueChange={(v) => setCampaignCount(Number(v))}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">{t({ en: 'campaigns', ar: 'حملات' })}</span>
            </div>

            <Button onClick={handleGenerate} disabled={isGenerating || !selectedPlanId}>
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              {t({ en: 'Generate Campaigns', ar: 'توليد الحملات' })}
            </Button>
          </div>
        </CardContent>
      </Card>

      {campaigns.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            {t({ en: 'Generated Campaigns', ar: 'الحملات المُنشأة' })}
            <Badge variant="secondary">{campaigns.length}</Badge>
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {campaigns.map((campaign, idx) => (
              <Card key={idx} className={campaign.saved ? 'border-green-500/50 bg-green-50/50' : ''}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">
                      {isRTL ? campaign.name_ar : campaign.name_en}
                    </CardTitle>
                    {campaign.saved ? (
                      <Badge
                        variant="outline"
                        className={campaign.submitted ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {campaign.submitted
                          ? t({ en: 'Submitted', ar: 'مُرسل' })
                          : t({ en: 'Saved', ar: 'محفوظ' })}
                      </Badge>
                    ) : (
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => handleSaveCampaign(campaign, idx, false)}>
                          <Plus className="h-3 w-3 mr-1" />
                          {t({ en: 'Save', ar: 'حفظ' })}
                        </Button>
                        <Button size="sm" onClick={() => handleSaveCampaign(campaign, idx, true)}>
                          <Send className="h-3 w-3 mr-1" />
                          {t({ en: 'Save & Submit', ar: 'حفظ وإرسال' })}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Target className="h-4 w-4 mt-1 text-muted-foreground" />
                    <span className="text-sm">{isRTL ? campaign.objective_ar : campaign.objective_en}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {isRTL ? campaign.target_audience_ar : campaign.target_audience_en}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{campaign.duration}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {campaign.channels?.map((channel) => (
                      <Badge key={channel} variant="secondary">
                        {channel}
                      </Badge>
                    ))}
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground mb-1">
                      {t({ en: 'KPIs', ar: 'مؤشرات الأداء' })}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {campaign.kpis?.map((kpi) => (
                        <Badge key={kpi} variant="outline" className="text-xs">
                          {kpi}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
