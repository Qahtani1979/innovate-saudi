import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/components/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Megaphone, Sparkles, Loader2, Target, Calendar, Users, CheckCircle2, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function StrategyToCampaignGenerator({ onCampaignCreated }) {
  const { t, isRTL } = useLanguage();
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [campaignCount, setCampaignCount] = useState(3);
  const [campaigns, setCampaigns] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: strategicPlans } = useQuery({
    queryKey: ['strategic-plans-for-campaign-gen'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('strategic_plans')
        .select('id, name_en, name_ar, objectives')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

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
          campaign_count: campaignCount
        }
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

  const handleSaveCampaign = async (campaign, index) => {
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
          status: 'draft'
        })
        .select()
        .single();

      if (error) throw error;

      const updated = [...campaigns];
      updated[index] = { ...updated[index], saved: true, savedId: data.id };
      setCampaigns(updated);
      
      toast.success(t({ en: 'Campaign saved successfully', ar: 'تم حفظ الحملة بنجاح' }));
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
            {t({ en: 'Generate marketing campaigns aligned with strategic objectives', ar: 'إنشاء حملات تسويقية متوافقة مع الأهداف الاستراتيجية' })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t({ en: 'Strategic Plan', ar: 'الخطة الاستراتيجية' })}
            </label>
            <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
              <SelectTrigger>
                <SelectValue placeholder={t({ en: 'Select a plan', ar: 'اختر خطة' })} />
              </SelectTrigger>
              <SelectContent>
                {strategicPlans?.map(plan => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {isRTL ? plan.name_ar : plan.name_en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Textarea
            placeholder={t({ en: 'Enter strategic objectives and target outcomes...', ar: 'أدخل الأهداف الاستراتيجية والنتائج المستهدفة...' })}
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
                  {[1, 2, 3, 4, 5].map(n => (
                    <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">{t({ en: 'campaigns', ar: 'حملات' })}</span>
            </div>

            <Button onClick={handleGenerate} disabled={isGenerating || !selectedPlanId}>
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
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
                    <CardTitle className="text-lg">{isRTL ? campaign.name_ar : campaign.name_en}</CardTitle>
                    {campaign.saved ? (
                      <Badge variant="outline" className="bg-green-100 text-green-700">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {t({ en: 'Saved', ar: 'محفوظ' })}
                      </Badge>
                    ) : (
                      <Button size="sm" onClick={() => handleSaveCampaign(campaign, idx)}>
                        <Plus className="h-3 w-3 mr-1" />
                        {t({ en: 'Save', ar: 'حفظ' })}
                      </Button>
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
                    <span className="text-sm">{isRTL ? campaign.target_audience_ar : campaign.target_audience_en}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{campaign.duration}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {campaign.channels?.map((channel) => (
                      <Badge key={channel} variant="secondary">{channel}</Badge>
                    ))}
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground mb-1">{t({ en: 'KPIs', ar: 'مؤشرات الأداء' })}</p>
                    <div className="flex flex-wrap gap-1">
                      {campaign.kpis?.map((kpi) => (
                        <Badge key={kpi} variant="outline" className="text-xs">{kpi}</Badge>
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
