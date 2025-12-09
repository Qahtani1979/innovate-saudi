import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Beaker, Sparkles, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

export default function LivingLabCreateWizard({ onClose }) {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const { invokeAI, status, isLoading: aiGenerating, rateLimitInfo, isAvailable } = useAIWithFallback();
  const [formData, setFormData] = useState({
    name_en: '',
    name_ar: '',
    description_en: '',
    description_ar: '',
    lab_type: 'urban_innovation',
    research_areas: [],
    equipment: [],
    facilities: [],
    capacity: 10,
    booking_rules: []
  });

  const handleAIGenerate = async () => {
    if (!isAvailable) return;
    
    const result = await invokeAI({
      prompt: `Design a municipal innovation living lab:
        
Type: ${formData.lab_type}
Basic Description: ${formData.description_en || 'Urban innovation testing facility'}

Generate comprehensive bilingual lab design:
1. Professional name (EN + AR)
2. Detailed description (EN + AR) - 150+ words
3. 5-8 research focus areas
4. 8-12 equipment items recommended for this lab type
5. 4-6 facility components
6. 5-7 booking/usage rules`,
      response_json_schema: {
        type: 'object',
        properties: {
          name_en: { type: 'string' },
          name_ar: { type: 'string' },
          description_en: { type: 'string' },
          description_ar: { type: 'string' },
          research_areas: { type: 'array', items: { type: 'string' } },
          equipment: { type: 'array', items: { type: 'string' } },
          facilities: { type: 'array', items: { type: 'string' } },
          booking_rules: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    if (result.success && result.data) {
      setFormData(prev => ({ ...prev, ...result.data }));
      toast.success(t({ en: '✨ AI design complete!', ar: '✨ تم التصميم!' }));
    }
  };

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.LivingLab.create(data),
    onSuccess: (lab) => {
      queryClient.invalidateQueries(['livinglabs']);
      toast.success(t({ en: 'Living Lab created!', ar: 'تم إنشاء المختبر!' }));
      navigate(createPageUrl(`LivingLabDetail?id=${lab.id}`));
      onClose?.();
    }
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="border-2 border-teal-400">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-teal-900">
              <Beaker className="h-6 w-6" />
              {t({ en: 'Create Living Lab', ar: 'إنشاء مختبر حي' })}
            </CardTitle>
            <Badge className="text-lg px-3 py-1">
              {t({ en: 'Step', ar: 'خطوة' })} {step}/2
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <>
              <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />
              <div className="p-4 bg-teal-50 rounded-lg">
                <p className="text-sm text-teal-900 font-medium">
                  {t({ en: 'Step 1: Basic Info & AI Infrastructure Recommendations', ar: 'الخطوة 1: المعلومات والبنية التحتية' })}
                </p>
              </div>

              <div className="space-y-2">
                <Label>{t({ en: 'Lab Type', ar: 'نوع المختبر' })}</Label>
                <select
                  value={formData.lab_type}
                  onChange={(e) => setFormData({ ...formData, lab_type: e.target.value })}
                  className="w-full border rounded-lg p-2"
                >
                  <option value="urban_innovation">Urban Innovation</option>
                  <option value="smart_city">Smart City</option>
                  <option value="environmental">Environmental</option>
                  <option value="transport">Transport & Mobility</option>
                  <option value="energy">Energy & Sustainability</option>
                  <option value="digital">Digital Services</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>{t({ en: 'Brief Description', ar: 'وصف مختصر' })}</Label>
                <Textarea
                  value={formData.description_en}
                  onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                  rows={3}
                />
              </div>

              <Button
                onClick={handleAIGenerate}
                disabled={aiGenerating || !isAvailable}
                className="w-full bg-gradient-to-r from-teal-600 to-cyan-600"
                size="lg"
              >
                {aiGenerating ? (
                  <><Loader2 className="h-5 w-5 mr-2 animate-spin" />{t({ en: 'Generating...', ar: 'جاري التوليد...' })}</>
                ) : (
                  <><Sparkles className="h-5 w-5 mr-2" />{t({ en: 'AI Generate Infrastructure Plan', ar: 'توليد خطة البنية' })}</>
                )}
              </Button>

              {formData.name_en && (
                <Button onClick={() => setStep(2)} className="w-full" size="lg">
                  <ArrowRight className="h-5 w-5 mr-2" />
                  {t({ en: 'Next: Review & Create', ar: 'التالي: المراجعة' })}
                </Button>
              )}
            </>
          )}

          {step === 2 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-teal-50 rounded-lg">
                  <p className="text-xs text-teal-900 font-medium mb-2">{t({ en: 'Equipment', ar: 'المعدات' })}</p>
                  <p className="text-2xl font-bold text-teal-600">{formData.equipment?.length || 0}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-900 font-medium mb-2">{t({ en: 'Facilities', ar: 'المرافق' })}</p>
                  <p className="text-2xl font-bold text-blue-600">{formData.facilities?.length || 0}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={() => setStep(1)} variant="outline" className="flex-1">
                  {t({ en: 'Back', ar: 'رجوع' })}
                </Button>
                <Button
                  onClick={() => createMutation.mutate(formData)}
                  disabled={createMutation.isPending || !formData.name_en}
                  className="flex-1 bg-gradient-to-r from-teal-600 to-cyan-600"
                  size="lg"
                >
                  {createMutation.isPending ? (
                    <><Loader2 className="h-5 w-5 mr-2 animate-spin" />{t({ en: 'Creating...', ar: 'جاري الإنشاء...' })}</>
                  ) : (
                    <><CheckCircle2 className="h-5 w-5 mr-2" />{t({ en: 'Create Living Lab', ar: 'إنشاء المختبر' })}</>
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}