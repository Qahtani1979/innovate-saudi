import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, Target, ArrowRight, CheckCircle2, Plus, Lightbulb } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

export default function StrategyToProgramGenerator({ onProgramCreated }) {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [generatedThemes, setGeneratedThemes] = useState([]);
  const [selectedThemes, setSelectedThemes] = useState([]);
  const { invokeAI, status: aiStatus, isLoading: aiLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const { data: strategicPlans = [] } = useQuery({
    queryKey: ['strategic-plans-generator'],
    queryFn: async () => {
      const { data, error } = await supabase.from('strategic_plans').select('*').eq('is_deleted', false);
      if (error) throw error;
      return data || [];
    }
  });

  const { data: sectors = [] } = useQuery({
    queryKey: ['sectors'],
    queryFn: async () => {
      const { data, error } = await supabase.from('sectors').select('*');
      if (error) throw error;
      return data || [];
    }
  });

  const selectedPlan = strategicPlans.find(p => p.id === selectedPlanId);

  const generateThemesMutation = useMutation({
    mutationFn: async () => {
      if (!selectedPlan) throw new Error('No plan selected');

      // Try edge function first
      try {
        const { data, error } = await supabase.functions.invoke('strategy-program-theme-generator', {
          body: {
            strategic_goals: selectedPlan.objectives || selectedPlan.strategic_objectives,
            sector_focus: selectedPlan.sector_id || 'general'
          }
        });
        
        if (!error && data?.themes?.length > 0) {
          return data.themes;
        }
      } catch (e) {
        console.log('Edge function fallback to AI hook:', e);
      }

      // Fallback to AI hook
      const result = await invokeAI({
        prompt: `Generate 3-5 strategic program themes for an innovation program.
        
Strategic Plan: ${selectedPlan.name_en || selectedPlan.title_en}
Vision: ${selectedPlan.vision_en || selectedPlan.description_en || ''}
Strategic Objectives: ${JSON.stringify(selectedPlan.objectives || selectedPlan.strategic_objectives || [])}

For each theme provide:
- Theme Name (bilingual: English and Arabic)
- Description (2-3 sentences, bilingual)
- Key Objectives (3 bullet points)
- Target Outcomes (3 measurable outcomes)
- Recommended Program Type (capacity_building, innovation_challenge, mentorship, etc.)`,
        response_json_schema: {
          type: 'object',
          properties: {
            themes: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name_en: { type: 'string' },
                  name_ar: { type: 'string' },
                  description_en: { type: 'string' },
                  description_ar: { type: 'string' },
                  objectives: { type: 'array', items: { type: 'string' } },
                  target_outcomes: { type: 'array', items: { type: 'string' } },
                  recommended_type: { type: 'string' }
                }
              }
            }
          }
        }
      });

      if (result.success && result.data?.themes) {
        return result.data.themes;
      }

      // Fallback themes
      return [
        {
          name_en: 'Digital Municipal Services',
          name_ar: 'الخدمات البلدية الرقمية',
          description_en: 'Accelerating digital transformation across municipal services through innovation programs.',
          description_ar: 'تسريع التحول الرقمي عبر الخدمات البلدية من خلال برامج الابتكار.',
          objectives: ['Modernize legacy systems', 'Improve citizen access', 'Enhance service efficiency'],
          target_outcomes: ['50% digital adoption', '30% faster processing', '25% cost reduction'],
          recommended_type: 'capacity_building'
        },
        {
          name_en: 'Sustainable Innovation',
          name_ar: 'الابتكار المستدام',
          description_en: 'Promoting environmentally conscious innovation solutions aligned with Saudi Vision 2030.',
          description_ar: 'تعزيز حلول الابتكار الصديقة للبيئة المتوافقة مع رؤية المملكة 2030.',
          objectives: ['Reduce carbon footprint', 'Promote green technology', 'Support circular economy'],
          target_outcomes: ['20% carbon reduction', 'Green procurement increase', 'Waste reduction targets'],
          recommended_type: 'innovation_challenge'
        },
        {
          name_en: 'Citizen Engagement Excellence',
          name_ar: 'التميز في مشاركة المواطن',
          description_en: 'Building stronger connections between municipalities and citizens through innovation.',
          description_ar: 'بناء روابط أقوى بين البلديات والمواطنين من خلال الابتكار.',
          objectives: ['Increase participation', 'Improve feedback loops', 'Build public trust'],
          target_outcomes: ['40% engagement rate', 'Faster response times', 'Higher satisfaction scores'],
          recommended_type: 'mentorship'
        }
      ];
    },
    onSuccess: (themes) => {
      setGeneratedThemes(themes);
      toast.success(t({ en: `Generated ${themes.length} program themes`, ar: `تم توليد ${themes.length} موضوعات للبرنامج` }));
    },
    onError: (error) => {
      console.error('Theme generation error:', error);
      toast.error(t({ en: 'Failed to generate themes', ar: 'فشل في توليد الموضوعات' }));
    }
  });

  const createProgramsMutation = useMutation({
    mutationFn: async () => {
      const themesToCreate = generatedThemes.filter((_, i) => selectedThemes.includes(i));
      const createdPrograms = [];

      for (const theme of themesToCreate) {
        const { data: program, error } = await supabase.from('programs').insert({
          name_en: theme.name_en,
          name_ar: theme.name_ar,
          description_en: theme.description_en,
          description_ar: theme.description_ar,
          program_type: theme.recommended_type || 'capacity_building',
          strategic_plan_ids: [selectedPlanId],
          status: 'draft',
          objectives: theme.objectives,
          target_outcomes: theme.target_outcomes?.map(o => ({ description: o, target: 100, current: 0 })),
          is_strategy_derived: true,
          strategy_derivation_date: new Date().toISOString()
        }).select().single();
        
        if (error) throw error;
        createdPrograms.push(program);
      }

      return createdPrograms;
    },
    onSuccess: (programs) => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      toast.success(t({ 
        en: `Created ${programs.length} programs from strategy`, 
        ar: `تم إنشاء ${programs.length} برامج من الاستراتيجية` 
      }));
      setGeneratedThemes([]);
      setSelectedThemes([]);
      onProgramCreated?.(programs);
    },
    onError: (error) => {
      console.error('Program creation error:', error);
      toast.error(t({ en: 'Failed to create programs', ar: 'فشل في إنشاء البرامج' }));
    }
  });

  const toggleTheme = (index) => {
    setSelectedThemes(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const programTypeLabels = {
    capacity_building: { en: 'Capacity Building', ar: 'بناء القدرات' },
    innovation_challenge: { en: 'Innovation Challenge', ar: 'تحدي الابتكار' },
    mentorship: { en: 'Mentorship', ar: 'الإرشاد' },
    accelerator: { en: 'Accelerator', ar: 'المسرّعة' },
    training: { en: 'Training', ar: 'التدريب' }
  };

  return (
    <Card className="border-2 border-indigo-200">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardTitle className="flex items-center gap-2 text-indigo-700">
          <Sparkles className="h-5 w-5" />
          {t({ en: 'Strategy → Program Generator', ar: 'مولّد البرامج من الاستراتيجية' })}
        </CardTitle>
        <p className="text-sm text-slate-600 mt-1">
          {t({ 
            en: 'Generate program themes directly from strategic plans', 
            ar: 'توليد موضوعات البرامج مباشرة من الخطط الاستراتيجية' 
          })}
        </p>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <AIStatusIndicator status={aiStatus} rateLimitInfo={rateLimitInfo} />

        {/* Step 1: Select Strategic Plan */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            {t({ en: '1. Select Strategic Plan', ar: '1. اختر الخطة الاستراتيجية' })}
          </label>
          <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
            <SelectTrigger>
              <SelectValue placeholder={t({ en: 'Choose a strategic plan...', ar: 'اختر خطة استراتيجية...' })} />
            </SelectTrigger>
            <SelectContent>
              {strategicPlans.map(plan => (
                <SelectItem key={plan.id} value={plan.id}>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-indigo-600" />
                    {language === 'ar' && plan.name_ar ? plan.name_ar : plan.name_en || plan.title_en}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Selected Plan Summary */}
        {selectedPlan && (
          <div className="p-4 bg-indigo-50 rounded-lg space-y-2">
            <h4 className="font-medium text-indigo-800">
              {language === 'ar' && selectedPlan.name_ar ? selectedPlan.name_ar : selectedPlan.name_en || selectedPlan.title_en}
            </h4>
            <p className="text-sm text-slate-600">
              {language === 'ar' && selectedPlan.description_ar ? selectedPlan.description_ar : selectedPlan.description_en || selectedPlan.vision_en}
            </p>
            {(selectedPlan.objectives || selectedPlan.strategic_objectives)?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {(selectedPlan.objectives || selectedPlan.strategic_objectives || []).slice(0, 3).map((obj, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {typeof obj === 'object' ? obj.name_en || obj.title : obj}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Generate Themes */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            {t({ en: '2. Generate Program Themes', ar: '2. توليد موضوعات البرامج' })}
          </label>
          <Button 
            onClick={() => generateThemesMutation.mutate()}
            disabled={!selectedPlanId || generateThemesMutation.isPending || aiLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
          >
            {generateThemesMutation.isPending || aiLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t({ en: 'Generating...', ar: 'جاري التوليد...' })}
              </>
            ) : (
              <>
                <Lightbulb className="h-4 w-4 mr-2" />
                {t({ en: 'Generate Program Themes', ar: 'توليد موضوعات البرنامج' })}
              </>
            )}
          </Button>
        </div>

        {/* Generated Themes */}
        {generatedThemes.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700">
                {t({ en: '3. Select Themes to Create as Programs', ar: '3. اختر الموضوعات لإنشاء برامج' })}
              </label>
              <Badge variant="secondary">
                {selectedThemes.length}/{generatedThemes.length} {t({ en: 'selected', ar: 'محدد' })}
              </Badge>
            </div>

            <div className="space-y-3">
              {generatedThemes.map((theme, index) => (
                <div 
                  key={index}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedThemes.includes(index) 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-slate-200 hover:border-indigo-300'
                  }`}
                  onClick={() => toggleTheme(index)}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox 
                      checked={selectedThemes.includes(index)}
                      onCheckedChange={() => toggleTheme(index)}
                      className="mt-1"
                    />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-slate-900">
                          {language === 'ar' && theme.name_ar ? theme.name_ar : theme.name_en}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {programTypeLabels[theme.recommended_type]?.[language] || theme.recommended_type}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">
                        {language === 'ar' && theme.description_ar ? theme.description_ar : theme.description_en}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {theme.objectives?.slice(0, 3).map((obj, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {obj}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {selectedThemes.includes(index) && (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Create Programs Button */}
            <Button 
              onClick={() => createProgramsMutation.mutate()}
              disabled={selectedThemes.length === 0 || createProgramsMutation.isPending}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {createProgramsMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t({ en: 'Creating Programs...', ar: 'جاري إنشاء البرامج...' })}
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  {t({ en: `Create ${selectedThemes.length} Program(s)`, ar: `إنشاء ${selectedThemes.length} برنامج(برامج)` })}
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
