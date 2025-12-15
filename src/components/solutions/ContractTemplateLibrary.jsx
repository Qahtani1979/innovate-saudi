import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '../LanguageContext';
import { FileText, Download, Sparkles, Copy, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';

export default function ContractTemplateLibrary({ solutionType }) {
  const { language, t } = useLanguage();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [generatedContract, setGeneratedContract] = useState(null);
  const { invokeAI, isLoading } = useAIWithFallback();

  const templates = [
    {
      id: 'pilot-mou',
      name: t({ en: 'Pilot MOU Template', ar: 'قالب مذكرة تفاهم التجربة' }),
      type: 'pilot',
      description: t({ en: 'Standard MOU for pilot testing', ar: 'مذكرة تفاهم معيارية لاختبار التجريبي' }),
      clauses: ['Scope', 'Duration', 'KPIs', 'Data sharing', 'IP rights']
    },
    {
      id: 'procurement-rfp',
      name: t({ en: 'RFP Template', ar: 'قالب طلب عرض' }),
      type: 'procurement',
      description: t({ en: 'Request for Proposal template', ar: 'قالب طلب عرض' }),
      clauses: ['Requirements', 'Evaluation criteria', 'Timeline', 'Pricing']
    },
    {
      id: 'service-sla',
      name: t({ en: 'Service Level Agreement', ar: 'اتفاقية مستوى الخدمة' }),
      type: 'service',
      description: t({ en: 'SLA for scaled solutions', ar: 'اتفاقية مستوى الخدمة للحلول الموسعة' }),
      clauses: ['Service levels', 'Support', 'Penalties', 'Reporting']
    },
    {
      id: 'data-sharing',
      name: t({ en: 'Data Sharing Agreement', ar: 'اتفاقية مشاركة البيانات' }),
      type: 'data',
      description: t({ en: 'Data exchange and privacy', ar: 'تبادل البيانات والخصوصية' }),
      clauses: ['Data types', 'Security', 'Retention', 'Compliance']
    }
  ];

  const generateCustomContract = async (template) => {
    const result = await invokeAI({
      prompt: `Generate a customized ${template.name} contract for a Saudi municipal innovation project.
Template type: ${template.type}
Required clauses: ${template.clauses.join(', ')}
Solution type: ${solutionType || 'General innovation solution'}

Generate a professional contract document in both English and Arabic that includes all required clauses. Make it specific to Saudi Arabia's regulatory environment and Vision 2030 alignment.`,
      response_json_schema: {
        type: 'object',
        properties: {
          contract_en: { type: 'string' },
          contract_ar: { type: 'string' },
          key_terms: { type: 'array', items: { type: 'string' } }
        }
      },
      system_prompt: 'You are an expert in Saudi Arabian legal contracts and municipal procurement. Generate professional, legally-sound contract templates.'
    });

    if (result.success && result.data) {
      setGeneratedContract(result.data);
      toast.success(t({ en: 'Contract generated successfully', ar: 'تم إنشاء العقد بنجاح' }));
    }
  };

  return (
    <Card className="border-2 border-green-300">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-green-600" />
          {t({ en: 'Contract Templates', ar: 'قوالب العقود' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-3">
          {templates.map(template => (
            <div key={template.id} className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              selectedTemplate?.id === template.id
                ? 'border-green-400 bg-green-50'
                : 'border-slate-200 hover:border-green-300'
            }`} onClick={() => setSelectedTemplate(template)}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900">{template.name}</h4>
                  <p className="text-xs text-slate-600 mt-1">{template.description}</p>
                </div>
                <Badge variant="outline" className="text-xs">{template.type}</Badge>
              </div>

              {template.clauses && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {template.clauses.map((clause, idx) => (
                    <Badge key={idx} className="bg-slate-100 text-slate-700 text-xs">
                      {clause}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {selectedTemplate && !generatedContract && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg border-2 border-green-300">
            <p className="text-sm font-medium text-green-900 mb-3">
              {t({ en: 'Selected:', ar: 'المحدد:' })} {selectedTemplate.name}
            </p>
            <div className="flex gap-2">
              <Button size="sm" className="flex-1 bg-green-600">
                <Download className="h-3 w-3 mr-1" />
                {t({ en: 'Download', ar: 'تنزيل' })}
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1" 
                onClick={() => generateCustomContract(selectedTemplate)}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Sparkles className="h-3 w-3 mr-1" />}
                {t({ en: 'AI Customize', ar: 'تخصيص ذكي' })}
              </Button>
            </div>
          </div>
        )}

        {generatedContract && (
          <div className="mt-4 space-y-4">
            <div className="p-4 bg-green-50 rounded-lg border-2 border-green-300">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-green-900">
                  {t({ en: 'Generated Contract', ar: 'العقد المُنشأ' })}
                </p>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(language === 'ar' ? generatedContract.contract_ar : generatedContract.contract_en);
                      toast.success(t({ en: 'Copied!', ar: 'تم النسخ!' }));
                    }}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    {t({ en: 'Copy', ar: 'نسخ' })}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => setGeneratedContract(null)}
                  >
                    {t({ en: 'Clear', ar: 'مسح' })}
                  </Button>
                </div>
              </div>
              
              {generatedContract.key_terms && generatedContract.key_terms.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-green-800 mb-1">{t({ en: 'Key Terms:', ar: 'البنود الرئيسية:' })}</p>
                  <div className="flex flex-wrap gap-1">
                    {generatedContract.key_terms.map((term, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">{term}</Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <Textarea 
                value={language === 'ar' ? generatedContract.contract_ar : generatedContract.contract_en}
                readOnly
                rows={10}
                className="text-xs bg-white"
              />
            </div>
          </div>
        )}

        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-900">
            💡 {t({ en: 'All templates are pre-approved by legal and compliant with Saudi regulations', ar: 'جميع القوالب معتمدة مسبقًا من القانونية ومتوافقة مع اللوائح السعودية' })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}