import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/components/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ScrollText, Sparkles, Loader2, Scale, FileText, AlertTriangle, CheckCircle2, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function StrategyToPolicyGenerator({ onPolicyCreated }) {
  const { t, isRTL } = useLanguage();
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [policyCount, setPolicyCount] = useState(2);
  const [policies, setPolicies] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: strategicPlans } = useQuery({
    queryKey: ['strategic-plans-for-policy-gen'],
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
      const { data, error } = await supabase.functions.invoke('strategy-policy-generator', {
        body: {
          strategic_plan_id: selectedPlanId,
          strategic_context: additionalContext,
          policy_count: policyCount
        }
      });

      if (error) throw error;
      setPolicies(data?.policies || []);
      toast.success(t({ en: 'Policies generated successfully', ar: 'تم إنشاء السياسات بنجاح' }));
    } catch (error) {
      console.error('Generation error:', error);
      toast.error(t({ en: 'Failed to generate policies', ar: 'فشل في إنشاء السياسات' }));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSavePolicy = async (policy, index) => {
    try {
      const { data, error } = await supabase
        .from('policies')
        .insert({
          title_en: policy.title_en,
          title_ar: policy.title_ar,
          description_en: policy.description_en,
          description_ar: policy.description_ar,
          policy_type: policy.type,
          scope: policy.scope,
          objectives: policy.objectives,
          stakeholders: policy.stakeholders,
          risk_level: policy.risk_level,
          strategic_plan_id: selectedPlanId,
          status: 'draft'
        })
        .select()
        .single();

      if (error) throw error;

      const updated = [...policies];
      updated[index] = { ...updated[index], saved: true, savedId: data.id };
      setPolicies(updated);
      
      toast.success(t({ en: 'Policy saved successfully', ar: 'تم حفظ السياسة بنجاح' }));
      onPolicyCreated?.(data);
    } catch (error) {
      console.error('Save error:', error);
      toast.error(t({ en: 'Failed to save policy', ar: 'فشل في حفظ السياسة' }));
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'High': return 'destructive';
      case 'Medium': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ScrollText className="h-5 w-5 text-primary" />
            {t({ en: 'Strategic Policy Generator', ar: 'مولد السياسات الاستراتيجية' })}
          </CardTitle>
          <CardDescription>
            {t({ en: 'Generate governance policies aligned with strategic priorities', ar: 'إنشاء سياسات الحوكمة المتوافقة مع الأولويات الاستراتيجية' })}
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
            placeholder={t({ en: 'Enter strategic priorities and governance requirements...', ar: 'أدخل الأولويات الاستراتيجية ومتطلبات الحوكمة...' })}
            value={additionalContext}
            onChange={(e) => setAdditionalContext(e.target.value)}
            rows={3}
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">{t({ en: 'Generate', ar: 'إنشاء' })}</label>
              <Select value={String(policyCount)} onValueChange={(v) => setPolicyCount(Number(v))}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map(n => (
                    <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">{t({ en: 'policies', ar: 'سياسات' })}</span>
            </div>

            <Button onClick={handleGenerate} disabled={isGenerating || !selectedPlanId}>
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
              {t({ en: 'Generate Policies', ar: 'توليد السياسات' })}
            </Button>
          </div>
        </CardContent>
      </Card>

      {policies.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <ScrollText className="h-5 w-5" />
            {t({ en: 'Generated Policies', ar: 'السياسات المُنشأة' })}
            <Badge variant="secondary">{policies.length}</Badge>
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {policies.map((policy, idx) => (
              <Card key={idx} className={policy.saved ? 'border-green-500/50 bg-green-50/50' : ''}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{isRTL ? policy.title_ar : policy.title_en}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={getRiskColor(policy.risk_level)}>
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {policy.risk_level}
                      </Badge>
                      {policy.saved ? (
                        <Badge variant="outline" className="bg-green-100 text-green-700">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          {t({ en: 'Saved', ar: 'محفوظ' })}
                        </Badge>
                      ) : (
                        <Button size="sm" onClick={() => handleSavePolicy(policy, idx)}>
                          <Plus className="h-3 w-3 mr-1" />
                          {t({ en: 'Save', ar: 'حفظ' })}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Scale className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="outline">{policy.type}</Badge>
                    <span className="text-sm text-muted-foreground">• {policy.scope}</span>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{t({ en: 'Objectives', ar: 'الأهداف' })}</p>
                    <ul className="text-sm space-y-1">
                      {policy.objectives?.map((obj, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <FileText className="h-3 w-3 text-primary" />
                          {obj}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground mb-1">{t({ en: 'Stakeholders', ar: 'أصحاب المصلحة' })}</p>
                    <div className="flex flex-wrap gap-1">
                      {policy.stakeholders?.map((s) => (
                        <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
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
