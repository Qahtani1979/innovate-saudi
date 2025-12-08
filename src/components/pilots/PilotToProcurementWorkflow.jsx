import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useLanguage } from '../LanguageContext';
import { toast } from 'sonner';
import { ShoppingCart, Sparkles, ArrowRight, Loader2, X, FileText, Shield } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

export default function PilotToProcurementWorkflow({ pilot, onClose }) {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    procurement_scope: '',
    technical_specs: '',
    evaluation_criteria: '',
    estimated_value: '',
    contract_duration_months: 12,
    rfp_text: ''
  });
  const [aiGenerating, setAiGenerating] = useState(false);

  const { data: solution } = useQuery({
    queryKey: ['solution', pilot?.solution_id],
    queryFn: async () => {
      const solutions = await base44.entities.Solution.list();
      return solutions.find(s => s.id === pilot?.solution_id);
    },
    enabled: !!pilot?.solution_id
  });

  const generateRFP = async () => {
    setAiGenerating(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate procurement RFP based on successful pilot validation:

Pilot: ${pilot.title_en}
Solution Validated: ${solution?.name_en || 'N/A'}
Provider: ${solution?.provider_name || 'N/A'}
Sector: ${pilot.sector}
Evaluation Score: ${pilot.success_probability || 'N/A'}%
KPIs Achieved: ${pilot.kpis?.map(k => k.name).join(', ') || 'N/A'}

Generate:
1. Procurement scope (what is being procured)
2. Technical specifications (from pilot learnings)
3. Evaluation criteria for vendor selection
4. RFP document text (bilingual)

Return in both English and Arabic.`,
        response_json_schema: {
          type: 'object',
          properties: {
            scope_en: { type: 'string' },
            scope_ar: { type: 'string' },
            specs_en: { type: 'string' },
            specs_ar: { type: 'string' },
            criteria_en: { type: 'string' },
            criteria_ar: { type: 'string' },
            rfp_text_en: { type: 'string' },
            rfp_text_ar: { type: 'string' },
            estimated_value: { type: 'number' }
          }
        }
      });

      setFormData({
        procurement_scope: language === 'ar' ? result.scope_ar : result.scope_en,
        technical_specs: language === 'ar' ? result.specs_ar : result.specs_en,
        evaluation_criteria: language === 'ar' ? result.criteria_ar : result.criteria_en,
        rfp_text: language === 'ar' ? result.rfp_text_ar : result.rfp_text_en,
        estimated_value: result.estimated_value?.toString() || '',
        contract_duration_months: 12
      });
      toast.success(t({ en: 'RFP generated', ar: 'تم إنشاء طلب العروض' }));
    } catch (error) {
      toast.error(t({ en: 'Generation failed', ar: 'فشل الإنشاء' }));
    } finally {
      setAiGenerating(false);
    }
  };

  const createMutation = useMutation({
    mutationFn: async (data) => {
      await base44.entities.Contract.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['contracts']);
      toast.success(t({ en: 'Procurement initiated', ar: 'تم بدء المشتريات' }));
      onClose();
    }
  });

  const handleSubmit = () => {
    createMutation.mutate({
      title_en: `Procurement: ${pilot.title_en}`,
      title_ar: pilot.title_ar ? `مشتريات: ${pilot.title_ar}` : '',
      contract_type: 'procurement',
      entity_type: 'pilot',
      entity_id: pilot.id,
      scope: formData.procurement_scope,
      technical_specifications: formData.technical_specs,
      evaluation_criteria: formData.evaluation_criteria,
      estimated_value: parseFloat(formData.estimated_value) || 0,
      duration_months: formData.contract_duration_months,
      status: 'draft',
      municipality_id: pilot.municipality_id,
      linked_pilot_id: pilot.id,
      linked_solution_id: pilot.solution_id,
      rfp_document_text: formData.rfp_text
    });
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-green-600" />
          {t({ en: 'Initiate Procurement', ar: 'بدء المشتريات' })}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-green-900">
            <strong>{t({ en: 'Validated Solution:', ar: 'الحل المعتمد:' })}</strong>{' '}
            {solution ? (language === 'ar' && solution.name_ar ? solution.name_ar : solution.name_en) : pilot.title_en}
          </p>
          {pilot.success_probability && (
            <Badge className="bg-green-600 text-white mt-2">
              {pilot.success_probability}% {t({ en: 'Success Rate', ar: 'معدل النجاح' })}
            </Badge>
          )}
        </div>

        <Button
          onClick={generateRFP}
          disabled={aiGenerating}
          variant="outline"
          className="w-full border-purple-300 text-purple-700"
        >
          {aiGenerating ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 mr-2" />
          )}
          {t({ en: 'Generate RFP with AI', ar: 'إنشاء طلب عروض ذكي' })}
        </Button>

        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            {t({ en: 'Procurement Scope', ar: 'نطاق المشتريات' })}
          </label>
          <Textarea
            value={formData.procurement_scope}
            onChange={(e) => setFormData({ ...formData, procurement_scope: e.target.value })}
            rows={3}
            placeholder={t({ 
              en: 'What is being procured?',
              ar: 'ما الذي يتم شراؤه؟'
            })}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            {t({ en: 'Technical Specifications', ar: 'المواصفات الفنية' })}
          </label>
          <Textarea
            value={formData.technical_specs}
            onChange={(e) => setFormData({ ...formData, technical_specs: e.target.value })}
            rows={4}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            {t({ en: 'Vendor Evaluation Criteria', ar: 'معايير تقييم المورد' })}
          </label>
          <Textarea
            value={formData.evaluation_criteria}
            onChange={(e) => setFormData({ ...formData, evaluation_criteria: e.target.value })}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              {t({ en: 'Estimated Value (SAR)', ar: 'القيمة المقدرة (ريال)' })}
            </label>
            <Input
              type="number"
              value={formData.estimated_value}
              onChange={(e) => setFormData({ ...formData, estimated_value: e.target.value })}
              placeholder="1000000"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              {t({ en: 'Contract Duration (months)', ar: 'مدة العقد (أشهر)' })}
            </label>
            <Input
              type="number"
              value={formData.contract_duration_months}
              onChange={(e) => setFormData({ ...formData, contract_duration_months: parseInt(e.target.value) })}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            {t({ en: 'Cancel', ar: 'إلغاء' })}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!formData.procurement_scope || createMutation.isPending}
            className="flex-1 bg-gradient-to-r from-green-600 to-teal-600"
          >
            {createMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileText className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            )}
            {t({ en: 'Create Procurement Request', ar: 'إنشاء طلب مشتريات' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}