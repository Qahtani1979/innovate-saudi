import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '@/components/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  Sparkles, 
  Loader2, 
  Target, 
  Users, 
  Lightbulb, 
  Building, 
  Globe, 
  Shield, 
  Zap, 
  Heart,
  Plus,
  Trash2,
  Save
} from 'lucide-react';

const PILLAR_ICONS = {
  Target, Users, Lightbulb, Building, Globe, Shield, Zap, Heart
};

export default function StrategyPillarGenerator({ strategicPlanId, onPillarsGenerated }) {
  const { t, isRTL } = useLanguage();
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);
  const [pillars, setPillars] = useState([]);
  const [visionStatement, setVisionStatement] = useState('');
  const [municipalityContext, setMunicipalityContext] = useState('');
  const [pillarCount, setPillarCount] = useState(4);

  const generatePillars = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('strategy-pillar-generator', {
        body: {
          strategic_plan_id: strategicPlanId,
          vision_statement: visionStatement,
          municipality_context: municipalityContext,
          pillar_count: pillarCount
        }
      });

      if (error) throw error;

      if (data?.pillars) {
        setPillars(data.pillars);
        toast.success(t({ 
          en: `Generated ${data.pillars.length} strategic pillars`, 
          ar: `تم إنشاء ${data.pillars.length} ركائز استراتيجية` 
        }));
        onPillarsGenerated?.(data.pillars);
      }
    } catch (error) {
      console.error('Error generating pillars:', error);
      toast.error(t({ en: 'Failed to generate pillars', ar: 'فشل في إنشاء الركائز' }));
    } finally {
      setIsGenerating(false);
    }
  };

  const updatePillar = (index, field, value) => {
    const updated = [...pillars];
    updated[index] = { ...updated[index], [field]: value };
    setPillars(updated);
  };

  const removePillar = (index) => {
    setPillars(pillars.filter((_, i) => i !== index));
  };

  const addPillar = () => {
    setPillars([...pillars, {
      name_en: '',
      name_ar: '',
      description_en: '',
      description_ar: '',
      icon: 'Target',
      color: '#3B82F6',
      vision_2030_alignment: 'Ambitious Nation',
      priority_order: pillars.length + 1,
      key_themes: [],
      success_indicators: []
    }]);
  };

  const savePillars = async () => {
    if (!strategicPlanId) {
      toast.error(t({ en: 'No strategic plan selected', ar: 'لم يتم تحديد خطة استراتيجية' }));
      return;
    }

    try {
      const { error } = await supabase
        .from('strategic_plans')
        .update({ 
          pillars,
          pillars_generated_at: new Date().toISOString()
        })
        .eq('id', strategicPlanId);

      if (error) throw error;

      queryClient.invalidateQueries(['strategic-plans']);
      toast.success(t({ en: 'Pillars saved successfully', ar: 'تم حفظ الركائز بنجاح' }));
    } catch (error) {
      console.error('Error saving pillars:', error);
      toast.error(t({ en: 'Failed to save pillars', ar: 'فشل في حفظ الركائز' }));
    }
  };

  const getIconComponent = (iconName) => {
    const IconComponent = PILLAR_ICONS[iconName] || Target;
    return IconComponent;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          {t({ en: 'Strategic Pillars Generator', ar: 'مولد الركائز الاستراتيجية' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">
              {t({ en: 'Vision Statement', ar: 'بيان الرؤية' })}
            </label>
            <Textarea
              value={visionStatement}
              onChange={(e) => setVisionStatement(e.target.value)}
              placeholder={t({ en: 'Enter vision statement for context...', ar: 'أدخل بيان الرؤية للسياق...' })}
              rows={3}
            />
          </div>
          <div>
            <label className="text-sm font-medium">
              {t({ en: 'Municipality Context', ar: 'سياق البلدية' })}
            </label>
            <Textarea
              value={municipalityContext}
              onChange={(e) => setMunicipalityContext(e.target.value)}
              placeholder={t({ en: 'Describe municipality focus areas...', ar: 'وصف مجالات تركيز البلدية...' })}
              rows={3}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div>
            <label className="text-sm font-medium">
              {t({ en: 'Number of Pillars', ar: 'عدد الركائز' })}
            </label>
            <Input
              type="number"
              min={2}
              max={8}
              value={pillarCount}
              onChange={(e) => setPillarCount(parseInt(e.target.value) || 4)}
              className="w-24"
            />
          </div>
          <Button 
            onClick={generatePillars} 
            disabled={isGenerating}
            className="mt-5"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Generate Pillars', ar: 'إنشاء الركائز' })}
          </Button>
        </div>

        {/* Generated Pillars */}
        {pillars.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">
                {t({ en: 'Generated Pillars', ar: 'الركائز المُنشأة' })}
              </h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={addPillar}>
                  <Plus className="h-4 w-4 mr-1" />
                  {t({ en: 'Add', ar: 'إضافة' })}
                </Button>
                <Button size="sm" onClick={savePillars}>
                  <Save className="h-4 w-4 mr-1" />
                  {t({ en: 'Save All', ar: 'حفظ الكل' })}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pillars.map((pillar, index) => {
                const IconComponent = getIconComponent(pillar.icon);
                return (
                  <Card key={index} className="border-l-4" style={{ borderLeftColor: pillar.color }}>
                    <CardContent className="pt-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="p-2 rounded-lg"
                            style={{ backgroundColor: `${pillar.color}20` }}
                          >
                            <IconComponent className="h-5 w-5" style={{ color: pillar.color }} />
                          </div>
                          <div>
                            <Input
                              value={pillar.name_en}
                              onChange={(e) => updatePillar(index, 'name_en', e.target.value)}
                              placeholder="Pillar name (EN)"
                              className="font-semibold border-none p-0 h-auto"
                            />
                            <Input
                              value={pillar.name_ar}
                              onChange={(e) => updatePillar(index, 'name_ar', e.target.value)}
                              placeholder="اسم الركيزة (AR)"
                              className="text-sm text-muted-foreground border-none p-0 h-auto"
                              dir="rtl"
                            />
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removePillar(index)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <Textarea
                        value={pillar.description_en}
                        onChange={(e) => updatePillar(index, 'description_en', e.target.value)}
                        placeholder="Description..."
                        rows={2}
                        className="text-sm"
                      />

                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" className="text-xs">
                          {pillar.vision_2030_alignment}
                        </Badge>
                        {pillar.key_themes?.slice(0, 3).map((theme, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {theme}
                          </Badge>
                        ))}
                      </div>

                      <div className="text-xs text-muted-foreground">
                        <strong>{t({ en: 'Success Indicators:', ar: 'مؤشرات النجاح:' })}</strong>
                        <ul className="list-disc list-inside mt-1">
                          {pillar.success_indicators?.map((indicator, i) => (
                            <li key={i}>{indicator}</li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {pillars.length === 0 && !isGenerating && (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>{t({ en: 'Configure options and click Generate to create strategic pillars', ar: 'قم بتكوين الخيارات وانقر على إنشاء لإنشاء الركائز الاستراتيجية' })}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
