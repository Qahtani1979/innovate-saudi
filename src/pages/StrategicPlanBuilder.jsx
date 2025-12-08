import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '../components/LanguageContext';
import { Target, Plus, Save, Sparkles } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

function StrategicPlanBuilder() {
  const { language, t } = useLanguage();
  const queryClient = useQueryClient();
  const [plan, setPlan] = useState({
    title_en: '',
    title_ar: '',
    vision_en: '',
    vision_ar: '',
    objectives: []
  });

  const savePlan = useMutation({
    mutationFn: (data) => base44.entities.StrategicPlan.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['strategic-plans']);
      setPlan({ title_en: '', title_ar: '', vision_en: '', vision_ar: '', objectives: [] });
    }
  });

  const generateWithAI = useMutation({
    mutationFn: async () => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a strategic plan for a municipal innovation initiative. Include:
1. Vision statement
2. 3-5 strategic objectives
3. Key focus areas

Format as JSON with title_en, vision_en, and objectives array.`,
        response_json_schema: {
          type: "object",
          properties: {
            title_en: { type: "string" },
            vision_en: { type: "string" },
            objectives: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name_en: { type: "string" },
                  description_en: { type: "string" }
                }
              }
            }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => {
      setPlan({ ...plan, ...data });
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Target className="h-8 w-8 text-purple-600" />
            {t({ en: 'Strategic Plan Builder', ar: 'بناء الخطة الاستراتيجية' })}
          </h1>
        </div>
        <Button onClick={() => generateWithAI.mutate()} disabled={generateWithAI.isPending}>
          <Sparkles className="h-4 w-4 mr-2" />
          {t({ en: 'Generate with AI', ar: 'إنشاء بالذكاء الاصطناعي' })}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Plan Details', ar: 'تفاصيل الخطة' })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">{t({ en: 'Title (English)', ar: 'العنوان (إنجليزي)' })}</label>
            <Input
              value={plan.title_en}
              onChange={(e) => setPlan({ ...plan, title_en: e.target.value })}
              placeholder={t({ en: 'Enter title...', ar: 'أدخل العنوان...' })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">{t({ en: 'Vision', ar: 'الرؤية' })}</label>
            <Textarea
              value={plan.vision_en}
              onChange={(e) => setPlan({ ...plan, vision_en: e.target.value })}
              placeholder={t({ en: 'Enter vision statement...', ar: 'أدخل بيان الرؤية...' })}
              rows={4}
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">{t({ en: 'Strategic Objectives', ar: 'الأهداف الاستراتيجية' })}</label>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPlan({ ...plan, objectives: [...plan.objectives, { name_en: '', description_en: '' }] })}
              >
                <Plus className="h-4 w-4 mr-2" />
                {t({ en: 'Add', ar: 'إضافة' })}
              </Button>
            </div>
            <div className="space-y-3">
              {plan.objectives.map((obj, i) => (
                <div key={i} className="p-3 border rounded-lg space-y-2">
                  <Input
                    placeholder={t({ en: 'Objective name', ar: 'اسم الهدف' })}
                    value={obj.name_en}
                    onChange={(e) => {
                      const newObjs = [...plan.objectives];
                      newObjs[i].name_en = e.target.value;
                      setPlan({ ...plan, objectives: newObjs });
                    }}
                  />
                  <Textarea
                    placeholder={t({ en: 'Description', ar: 'الوصف' })}
                    value={obj.description_en}
                    onChange={(e) => {
                      const newObjs = [...plan.objectives];
                      newObjs[i].description_en = e.target.value;
                      setPlan({ ...plan, objectives: newObjs });
                    }}
                    rows={2}
                  />
                </div>
              ))}
            </div>
          </div>

          <Button onClick={() => savePlan.mutate(plan)} className="w-full" disabled={!plan.title_en}>
            <Save className="h-4 w-4 mr-2" />
            {t({ en: 'Save Strategic Plan', ar: 'حفظ الخطة الاستراتيجية' })}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(StrategicPlanBuilder, { requiredPermissions: [], requiredRoles: ['Executive Leadership', 'GDISB Strategy Lead'] });