import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { FileText, Sparkles, Loader2, ChevronRight, ChevronLeft, CheckCircle2, X } from 'lucide-react';
import { toast } from 'sonner';

export default function ContractGeneratorWizard({ solution, pilot, onComplete, onCancel }) {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  
  const [contractData, setContractData] = useState({
    contract_number: `CTR-${Date.now()}`,
    title_en: `${solution?.name_en || 'Solution'} Deployment Agreement`,
    title_ar: `اتفاقية نشر ${solution?.name_ar || 'الحل'}`,
    contract_type: 'solution_deployment',
    party_a_type: 'municipality',
    party_a_id: pilot?.municipality_id || '',
    party_a_name: '',
    party_b_type: 'provider',
    party_b_id: solution?.provider_id || '',
    party_b_name: solution?.provider_name || '',
    related_entity_type: 'pilot',
    related_entity_id: pilot?.id || '',
    status: 'draft',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    contract_value: 0,
    payment_terms: { payment_schedule: 'milestone_based', payment_milestones: [] },
    deliverables: [],
    terms_and_conditions: ''
  });

  const steps = [
    { title: { en: 'Template', ar: 'القالب' }, icon: FileText },
    { title: { en: 'Customize', ar: 'تخصيص' }, icon: Sparkles },
    { title: { en: 'Review', ar: 'مراجعة' }, icon: CheckCircle2 }
  ];

  const generateContractMutation = useMutation({
    mutationFn: async () => {
      setIsAIGenerating(true);
      
      const prompt = `Generate a comprehensive solution deployment contract in bilingual format (Arabic + English).
      
      Context:
      - Solution: ${solution?.name_en}
      - Description: ${solution?.description_en}
      - Provider: ${solution?.provider_name}
      - Pilot: ${pilot?.title_en}
      - Budget: ${pilot?.budget} SAR
      - Duration: ${pilot?.duration_weeks} weeks
      
      Generate:
      1. Detailed terms and conditions (AR + EN)
      2. 5-7 deliverables with timelines
      3. 4-5 payment milestones linked to deliverables
      4. KPIs and success criteria
      5. Termination clauses
      6. Support and maintenance terms`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            terms_en: { type: 'string' },
            terms_ar: { type: 'string' },
            deliverables: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  deliverable_name: { type: 'string' },
                  due_date: { type: 'string' },
                  status: { type: 'string' }
                }
              }
            },
            payment_milestones: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  milestone_name: { type: 'string' },
                  amount: { type: 'number' },
                  due_date: { type: 'string' }
                }
              }
            }
          }
        }
      });

      setContractData(prev => ({
        ...prev,
        terms_and_conditions: result.terms_en,
        deliverables: result.deliverables || [],
        payment_terms: {
          payment_schedule: 'milestone_based',
          payment_milestones: result.payment_milestones || []
        }
      }));

      setIsAIGenerating(false);
      toast.success(t({ en: 'Contract generated', ar: 'تم توليد العقد' }));
    }
  });

  const createContractMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.Contract.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['contracts']);
      toast.success(t({ en: 'Contract created', ar: 'تم إنشاء العقد' }));
      onComplete?.();
    }
  });

  const handleSubmit = () => {
    createContractMutation.mutate(contractData);
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t({ en: 'Contract Generator', ar: 'مولد العقود' })}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <Progress value={(currentStep / (steps.length - 1)) * 100} className="mt-4" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between mb-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx} className={`flex items-center gap-2 ${idx <= currentStep ? 'text-blue-600' : 'text-slate-400'}`}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${idx <= currentStep ? 'bg-blue-600 text-white' : 'bg-slate-200'}`}>
                  {idx < currentStep ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <span className="text-sm font-medium">{step.title[language]}</span>
              </div>
            );
          })}
        </div>

        {currentStep === 0 && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-900">
                {t({ en: 'Generate a contract using AI based on solution and pilot details', ar: 'توليد عقد باستخدام الذكاء الاصطناعي بناءً على تفاصيل الحل والتجربة' })}
              </p>
            </div>
            <Button 
              onClick={() => generateContractMutation.mutate()} 
              disabled={isAIGenerating}
              className="w-full"
            >
              {isAIGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t({ en: 'Generating...', ar: 'جاري التوليد...' })}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {t({ en: 'Generate Contract with AI', ar: 'توليد العقد بالذكاء الاصطناعي' })}
                </>
              )}
            </Button>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t({ en: 'Contract Value (SAR)', ar: 'قيمة العقد (ريال)' })}</Label>
                <Input
                  type="number"
                  value={contractData.contract_value}
                  onChange={(e) => setContractData({...contractData, contract_value: parseFloat(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <Label>{t({ en: 'End Date', ar: 'تاريخ الانتهاء' })}</Label>
                <Input
                  type="date"
                  value={contractData.end_date}
                  onChange={(e) => setContractData({...contractData, end_date: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t({ en: 'Terms & Conditions', ar: 'الشروط والأحكام' })}</Label>
              <Textarea
                value={contractData.terms_and_conditions}
                onChange={(e) => setContractData({...contractData, terms_and_conditions: e.target.value})}
                rows={8}
              />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-lg space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-600">{t({ en: 'Contract Number', ar: 'رقم العقد' })}</p>
                  <p className="font-semibold">{contractData.contract_number}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">{t({ en: 'Value', ar: 'القيمة' })}</p>
                  <p className="font-semibold">{contractData.contract_value.toLocaleString()} SAR</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-600">{t({ en: 'Parties', ar: 'الأطراف' })}</p>
                <p className="font-semibold">{contractData.party_a_name} ↔️ {contractData.party_b_name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-600">{t({ en: 'Deliverables', ar: 'المخرجات' })}</p>
                <p className="font-semibold">{contractData.deliverables?.length || 0} items</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-6 border-t">
          <Button 
            variant="outline" 
            onClick={() => currentStep > 0 ? setCurrentStep(currentStep - 1) : onCancel?.()}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            {currentStep === 0 ? t({ en: 'Cancel', ar: 'إلغاء' }) : t({ en: 'Back', ar: 'السابق' })}
          </Button>
          
          {currentStep < steps.length - 1 ? (
            <Button onClick={() => setCurrentStep(currentStep + 1)}>
              {t({ en: 'Next', ar: 'التالي' })}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={createContractMutation.isPending}>
              {createContractMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t({ en: 'Creating...', ar: 'جاري الإنشاء...' })}
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {t({ en: 'Create Contract', ar: 'إنشاء العقد' })}
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}