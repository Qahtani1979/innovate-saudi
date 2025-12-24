import { useState } from 'react';
import { useSolution } from '@/hooks/useSolutions';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useLanguage } from '../LanguageContext';
import { toast } from 'sonner';
import { ShoppingCart, Sparkles, Loader2, X, FileText } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import { PILOT_PROCUREMENT_SYSTEM_PROMPT, buildPilotProcurementPrompt, PILOT_PROCUREMENT_SCHEMA } from '@/lib/ai/prompts/pilots';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { useEmailTrigger } from '@/hooks/useEmailTrigger';

export default function PilotToProcurementWorkflow({ pilot, onClose }) {
  const { language, isRTL, t } = useLanguage();
  const { invokeAI, status, isLoading: aiGenerating, rateLimitInfo, isAvailable } = useAIWithFallback();
  const { triggerEmail } = useEmailTrigger();

  const [formData, setFormData] = useState({
    procurement_scope: '',
    technical_specs: '',
    evaluation_criteria: '',
    estimated_value: '',
    contract_duration_months: 12,
    rfp_text: ''
  });

  const { data: solution } = useSolution(pilot?.solution_id);

  const generateRFP = async () => {
    const result = await invokeAI({
      prompt: buildPilotProcurementPrompt(pilot, solution),
      system_prompt: PILOT_PROCUREMENT_SYSTEM_PROMPT,
      response_json_schema: PILOT_PROCUREMENT_SCHEMA
    });

    if (result.success) {
      setFormData({
        procurement_scope: language === 'ar' ? result.data.scope_ar : result.data.scope_en,
        technical_specs: language === 'ar' ? result.data.specs_ar : result.data.specs_en,
        evaluation_criteria: language === 'ar' ? result.data.criteria_ar : result.data.criteria_en,
        rfp_text: language === 'ar' ? result.data.rfp_text_ar : result.data.rfp_text_en,
        estimated_value: result.data.estimated_value?.toString() || '',
        contract_duration_months: 12
      });
      toast.success(t({ en: 'RFP generated', ar: 'تم إنشاء طلب العروض' }));
    }
  };

  const { mutate: createContract, isPending: isCreating } = useCreateContract();

  const handleSubmit = () => {
    createContract({
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
    }, {
      onSuccess: async (createdContract) => {
        // Trigger contract.created email
        try {
          await triggerEmail('contract.created', {
            entityType: 'contract',
            entityId: createdContract?.id,
            variables: {
              contractTitle: `Procurement: ${pilot.title_en}`,
              pilotTitle: pilot.title_en,
              estimatedValue: formData.estimated_value
            }
          });
        } catch (error) {
          console.error('Failed to send contract.created email:', error);
        }

        toast.success(t({ en: 'Procurement initiated', ar: 'تم بدء المشتريات' }));
        onClose();
      }
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

        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} className="mb-4" />

        <Button
          onClick={generateRFP}
          disabled={aiGenerating || !isAvailable}
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
            disabled={!formData.procurement_scope || isCreating}
            className="flex-1 bg-gradient-to-r from-green-600 to-teal-600"
          >
            {isCreating ? (
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