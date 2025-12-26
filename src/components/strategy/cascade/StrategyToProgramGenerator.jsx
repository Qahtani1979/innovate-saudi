import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, Target, CheckCircle2, Plus, Lightbulb } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { toast } from 'sonner';
import { useStrategicPlans } from '@/hooks/useStrategicPlans';
import { useProgramMutations } from '@/hooks/useProgramMutations';
import { useStrategyThemeGenerator } from '@/hooks/strategy/useStrategyThemeGenerator';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';

export default function StrategyToProgramGenerator({ strategicPlanId, onProgramCreated }) {
  const { language, t } = useLanguage();
  const [selectedPlanId, setSelectedPlanId] = useState(strategicPlanId || '');
  const [selectedThemes, setSelectedThemes] = useState([]);

  // Use existing hooks
  const { data: strategicPlans = [] } = useStrategicPlans();
  const { createProgramsBatch, isBatchCreating } = useProgramMutations();
  const { generateThemes, isGenerating, themes: generatedThemes } = useStrategyThemeGenerator();
  const { status: aiStatus, rateLimitInfo } = useAIWithFallback();

  const selectedPlan = strategicPlans.find(p => p.id === selectedPlanId);

  const handleGenerate = async () => {
    if (!selectedPlan) return;
    try {
      await generateThemes.mutateAsync({ selectedPlan });
      toast.success(t({ en: 'Themes generated successfully', ar: 'تم توليد الموضوعات بنجاح' }));
    } catch (e) {
      // Handled by hook error
    }
  };

  const handleCreatePrograms = async () => {
    const themesToCreate = generatedThemes.filter((_, i) => selectedThemes.includes(i));

    const programsData = themesToCreate.map(theme => ({
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
    }));

    try {
      const createdPrograms = await createProgramsBatch.mutateAsync(programsData);
      setSelectedThemes([]);
      onProgramCreated?.(createdPrograms);
    } catch (e) {
      // Handled by hook
    }
  };

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
        <AIStatusIndicator status={aiStatus} rateLimitInfo={rateLimitInfo} error={null} />

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
                    {language === 'ar' && plan?.name_ar ? plan?.name_ar : plan?.name_en || (plan as any)?.title_en}
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
              {language === 'ar' && selectedPlan?.name_ar ? selectedPlan?.name_ar : selectedPlan?.name_en || selectedPlan?.title_en}
            </h4>
            <p className="text-sm text-slate-600">
              {language === 'ar' && selectedPlan?.description_ar ? selectedPlan?.description_ar : selectedPlan?.description_en || selectedPlan?.vision_en}
            </p>
            {((selectedPlan as any)?.objectives || (selectedPlan as any)?.strategic_objectives)?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {((selectedPlan as any).objectives || (selectedPlan as any).strategic_objectives || []).slice(0, 3).map((obj, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {typeof obj === 'object' ? obj?.name_en || obj?.title : obj}
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
            onClick={handleGenerate}
            disabled={!selectedPlanId || isGenerating}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
          >
            {isGenerating ? (
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
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedThemes.includes(index)
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
              onClick={handleCreatePrograms}
              disabled={selectedThemes.length === 0 || isBatchCreating}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isBatchCreating ? (
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
