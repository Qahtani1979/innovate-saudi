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
import { Shield, Sparkles, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function SandboxCreateWizard({ onClose }) {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [formData, setFormData] = useState({
    name_en: '',
    name_ar: '',
    description_en: '',
    description_ar: '',
    sandbox_type: 'regulatory',
    sector: '',
    regulatory_framework: [],
    safety_protocols: [],
    max_concurrent_projects: 5,
    duration_weeks_default: 26,
    entry_criteria: [],
    exit_criteria: []
  });

  const { data: sectors = [] } = useQuery({
    queryKey: ['sectors'],
    queryFn: () => base44.entities.Sector.list()
  });

  const handleAIGenerate = async () => {
    setAiGenerating(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Design a regulatory sandbox for this context:
        
Type: ${formData.sandbox_type}
Sector: ${formData.sector || 'General Municipal Innovation'}
Basic Description: ${formData.description_en || 'N/A'}

Generate comprehensive bilingual sandbox design:
1. Professional name (EN + AR)
2. Detailed description (EN + AR) - 150+ words
3. 5-8 regulatory framework items (bilingual objects with en/ar)
4. 6-10 safety protocols (bilingual objects)
5. 5-7 entry criteria (bilingual)
6. 5-7 exit criteria (bilingual)`,
        response_json_schema: {
          type: 'object',
          properties: {
            name_en: { type: 'string' },
            name_ar: { type: 'string' },
            description_en: { type: 'string' },
            description_ar: { type: 'string' },
            regulatory_framework: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
            safety_protocols: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
            entry_criteria: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
            exit_criteria: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } }
          }
        }
      });

      setFormData(prev => ({ ...prev, ...result }));
      toast.success(t({ en: '✨ AI design complete!', ar: '✨ تم التصميم الذكي!' }));
    } catch (error) {
      toast.error(t({ en: 'AI generation failed', ar: 'فشل التوليد' }));
    } finally {
      setAiGenerating(false);
    }
  };

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Sandbox.create(data),
    onSuccess: (sandbox) => {
      queryClient.invalidateQueries(['sandboxes']);
      toast.success(t({ en: 'Sandbox created!', ar: 'تم إنشاء المنطقة!' }));
      navigate(createPageUrl(`SandboxDetail?id=${sandbox.id}`));
      onClose?.();
    }
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="border-2 border-purple-400">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <Shield className="h-6 w-6" />
              {t({ en: 'Create Regulatory Sandbox', ar: 'إنشاء منطقة تنظيمية' })}
            </CardTitle>
            <Badge className="text-lg px-3 py-1">
              {t({ en: 'Step', ar: 'خطوة' })} {step}/3
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-900 font-medium">
                  {t({ en: 'Step 1: Basic Information & AI Design', ar: 'الخطوة 1: المعلومات الأساسية والتصميم الذكي' })}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t({ en: 'Sandbox Type', ar: 'نوع المنطقة' })}</Label>
                  <select
                    value={formData.sandbox_type}
                    onChange={(e) => setFormData({ ...formData, sandbox_type: e.target.value })}
                    className="w-full border rounded-lg p-2"
                  >
                    <option value="regulatory">Regulatory</option>
                    <option value="innovation">Innovation</option>
                    <option value="data">Data</option>
                    <option value="sector_specific">Sector Specific</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>{t({ en: 'Primary Sector', ar: 'القطاع الرئيسي' })}</Label>
                  <select
                    value={formData.sector}
                    onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                    className="w-full border rounded-lg p-2"
                  >
                    <option value="">{t({ en: 'Select...', ar: 'اختر...' })}</option>
                    {sectors.map(s => (
                      <option key={s.id} value={s.name_en}>{s.name_en}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t({ en: 'Brief Description', ar: 'وصف مختصر' })}</Label>
                <Textarea
                  value={formData.description_en}
                  onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                  rows={3}
                  placeholder={t({ en: 'What is the purpose of this sandbox?', ar: 'ما هو الغرض من هذه المنطقة؟' })}
                />
              </div>

              <Button
                onClick={handleAIGenerate}
                disabled={aiGenerating || !formData.sandbox_type}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                size="lg"
              >
                {aiGenerating ? (
                  <><Loader2 className="h-5 w-5 mr-2 animate-spin" />{t({ en: 'Generating...', ar: 'جاري التوليد...' })}</>
                ) : (
                  <><Sparkles className="h-5 w-5 mr-2" />{t({ en: 'AI Generate Full Design', ar: 'توليد التصميم الكامل' })}</>
                )}
              </Button>

              {formData.name_en && (
                <Button onClick={() => setStep(2)} className="w-full" size="lg">
                  <ArrowRight className="h-5 w-5 mr-2" />
                  {t({ en: 'Next: Framework & Protocols', ar: 'التالي: الإطار والبروتوكولات' })}
                </Button>
              )}
            </>
          )}

          {step === 2 && (
            <>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-900 font-medium">
                  {t({ en: 'Step 2: Regulatory Framework & Safety', ar: 'الخطوة 2: الإطار التنظيمي والسلامة' })}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t({ en: 'Name (English)', ar: 'الاسم (إنجليزي)' })}</Label>
                  <Input value={formData.name_en} onChange={(e) => setFormData({ ...formData, name_en: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>{t({ en: 'Name (Arabic)', ar: 'الاسم (عربي)' })}</Label>
                  <Input value={formData.name_ar || ''} onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })} dir="rtl" />
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border">
                <p className="text-sm font-medium text-blue-900 mb-2">
                  {t({ en: 'Regulatory Framework Items', ar: 'بنود الإطار التنظيمي' })} ({formData.regulatory_framework?.length || 0})
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {formData.regulatory_framework?.map((item, i) => (
                    <div key={i} className="p-2 bg-white rounded border text-xs">
                      <p className="font-medium">{typeof item === 'object' ? item.en : item}</p>
                      {typeof item === 'object' && item.ar && (
                        <p className="text-slate-600" dir="rtl">{item.ar}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border">
                <p className="text-sm font-medium text-green-900 mb-2">
                  {t({ en: 'Safety Protocols', ar: 'بروتوكولات السلامة' })} ({formData.safety_protocols?.length || 0})
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {formData.safety_protocols?.map((item, i) => (
                    <div key={i} className="p-2 bg-white rounded border text-xs">
                      <p className="font-medium">{typeof item === 'object' ? item.en : item}</p>
                      {typeof item === 'object' && item.ar && (
                        <p className="text-slate-600" dir="rtl">{item.ar}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={() => setStep(1)} variant="outline" className="flex-1">
                  {t({ en: 'Back', ar: 'رجوع' })}
                </Button>
                <Button onClick={() => setStep(3)} className="flex-1" size="lg">
                  <ArrowRight className="h-5 w-5 mr-2" />
                  {t({ en: 'Next: Criteria & Review', ar: 'التالي: المعايير' })}
                </Button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-900 font-medium">
                  {t({ en: 'Step 3: Entry/Exit Criteria & Submit', ar: 'الخطوة 3: معايير الدخول/الخروج' })}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t({ en: 'Max Concurrent Projects', ar: 'مشاريع متزامنة' })}</Label>
                  <Input
                    type="number"
                    value={formData.max_concurrent_projects}
                    onChange={(e) => setFormData({ ...formData, max_concurrent_projects: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t({ en: 'Default Duration (weeks)', ar: 'المدة (أسابيع)' })}</Label>
                  <Input
                    type="number"
                    value={formData.duration_weeks_default}
                    onChange={(e) => setFormData({ ...formData, duration_weeks_default: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border">
                <p className="text-sm font-medium text-green-900 mb-2">
                  {t({ en: '✅ Entry Criteria', ar: '✅ معايير الدخول' })} ({formData.entry_criteria?.length || 0})
                </p>
                <div className="space-y-1 max-h-32 overflow-y-auto text-xs">
                  {formData.entry_criteria?.map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="h-3 w-3 text-green-600 mt-0.5" />
                      <span>{typeof item === 'object' ? item.en : item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-red-50 rounded-lg border">
                <p className="text-sm font-medium text-red-900 mb-2">
                  {t({ en: '🚪 Exit Criteria', ar: '🚪 معايير الخروج' })} ({formData.exit_criteria?.length || 0})
                </p>
                <div className="space-y-1 max-h-32 overflow-y-auto text-xs">
                  {formData.exit_criteria?.map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="h-3 w-3 text-red-600 mt-0.5" />
                      <span>{typeof item === 'object' ? item.en : item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={() => setStep(2)} variant="outline" className="flex-1">
                  {t({ en: 'Back', ar: 'رجوع' })}
                </Button>
                <Button
                  onClick={() => createMutation.mutate(formData)}
                  disabled={createMutation.isPending || !formData.name_en}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
                  size="lg"
                >
                  {createMutation.isPending ? (
                    <><Loader2 className="h-5 w-5 mr-2 animate-spin" />{t({ en: 'Creating...', ar: 'جاري الإنشاء...' })}</>
                  ) : (
                    <><CheckCircle2 className="h-5 w-5 mr-2" />{t({ en: 'Create Sandbox', ar: 'إنشاء المنطقة' })}</>
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