import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/components/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, FlaskConical, Loader2, CheckCircle2, Plus, MapPin } from 'lucide-react';
import { toast } from 'sonner';

export default function StrategyToLivingLabGenerator({ onLabCreated }) {
  const { t, isRTL } = useLanguage();
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [selectedMunicipality, setSelectedMunicipality] = useState('');
  const [researchFocus, setResearchFocus] = useState('');
  const [targetPopulation, setTargetPopulation] = useState('');
  const [generatedLabs, setGeneratedLabs] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: strategicPlans } = useQuery({
    queryKey: ['strategic-plans-for-lab-gen'],
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

  const { data: municipalities } = useQuery({
    queryKey: ['municipalities-for-lab-gen'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('municipalities')
        .select('id, name_en, name_ar')
        .eq('is_active', true)
        .order('name_en');
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
      const { data, error } = await supabase.functions.invoke('strategy-lab-research-generator', {
        body: {
          strategic_plan_id: selectedPlanId,
          municipality_id: selectedMunicipality || null,
          research_focus: researchFocus,
          target_population: targetPopulation
        }
      });

      if (error) throw error;
      setGeneratedLabs(data?.living_labs || []);
      toast.success(t({ en: 'Living lab concepts generated', ar: 'تم إنشاء مفاهيم المختبرات الحية' }));
    } catch (error) {
      console.error('Generation error:', error);
      toast.error(t({ en: 'Failed to generate living labs', ar: 'فشل في إنشاء المختبرات الحية' }));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveLab = async (lab, index) => {
    try {
      const { data, error } = await supabase
        .from('living_labs')
        .insert({
          name_en: lab.name_en,
          name_ar: lab.name_ar,
          description_en: lab.description_en,
          description_ar: lab.description_ar,
          research_focus: lab.research_focus,
          target_outcomes: lab.target_outcomes,
          municipality_id: selectedMunicipality || null,
          strategic_plan_ids: [selectedPlanId],
          is_strategy_derived: true,
          strategy_derivation_date: new Date().toISOString(),
          status: 'planning'
        })
        .select()
        .single();

      if (error) throw error;

      const updated = [...generatedLabs];
      updated[index] = { ...updated[index], saved: true, savedId: data.id };
      setGeneratedLabs(updated);
      
      toast.success(t({ en: 'Living lab saved successfully', ar: 'تم حفظ المختبر الحي بنجاح' }));
      onLabCreated?.(data);
    } catch (error) {
      console.error('Save error:', error);
      toast.error(t({ en: 'Failed to save living lab', ar: 'فشل في حفظ المختبر الحي' }));
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-primary" />
            {t({ en: 'Living Lab Generator', ar: 'مولد المختبرات الحية' })}
          </CardTitle>
          <CardDescription>
            {t({ 
              en: 'Generate living lab concepts from strategic research priorities',
              ar: 'إنشاء مفاهيم المختبرات الحية من أولويات البحث الاستراتيجي'
            })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t({ en: 'Host Municipality', ar: 'البلدية المضيفة' })}
              </label>
              <Select value={selectedMunicipality} onValueChange={setSelectedMunicipality}>
                <SelectTrigger>
                  <SelectValue placeholder={t({ en: 'Select municipality', ar: 'اختر البلدية' })} />
                </SelectTrigger>
                <SelectContent>
                  {municipalities?.map(mun => (
                    <SelectItem key={mun.id} value={mun.id}>
                      {isRTL ? mun.name_ar : mun.name_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t({ en: 'Research Focus Areas', ar: 'مجالات التركيز البحثي' })}
            </label>
            <Textarea
              value={researchFocus}
              onChange={(e) => setResearchFocus(e.target.value)}
              placeholder={t({ 
                en: 'e.g., Smart mobility, Urban sustainability, Digital inclusion...',
                ar: 'مثال: التنقل الذكي، الاستدامة الحضرية، الشمول الرقمي...'
              })}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t({ en: 'Target Population', ar: 'الفئة المستهدفة' })}
            </label>
            <Input
              value={targetPopulation}
              onChange={(e) => setTargetPopulation(e.target.value)}
              placeholder={t({ 
                en: 'e.g., Youth, Elderly, Small businesses...',
                ar: 'مثال: الشباب، كبار السن، المشاريع الصغيرة...'
              })}
            />
          </div>

          <Button onClick={handleGenerate} disabled={isGenerating || !selectedPlanId} className="w-full">
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {t({ en: 'Generating...', ar: 'جاري الإنشاء...' })}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                {t({ en: 'Generate Living Lab Concepts', ar: 'إنشاء مفاهيم المختبرات الحية' })}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedLabs.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FlaskConical className="h-5 w-5" />
            {t({ en: 'Generated Living Labs', ar: 'المختبرات الحية المُنشأة' })}
            <Badge variant="secondary">{generatedLabs.length}</Badge>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {generatedLabs.map((lab, idx) => (
              <Card key={idx} className={lab.saved ? 'border-green-500/50 bg-green-50/50' : ''}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">
                      {isRTL ? lab.name_ar : lab.name_en}
                    </CardTitle>
                    {lab.saved ? (
                      <Badge variant="outline" className="bg-green-100 text-green-700">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {t({ en: 'Saved', ar: 'محفوظ' })}
                      </Badge>
                    ) : (
                      <Button size="sm" onClick={() => handleSaveLab(lab, idx)}>
                        <Plus className="h-3 w-3 mr-1" />
                        {t({ en: 'Save', ar: 'حفظ' })}
                      </Button>
                    )}
                  </div>
                  <CardDescription>
                    {isRTL ? lab.description_ar : lab.description_en}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {lab.research_focus}
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
