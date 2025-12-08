import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from './LanguageContext';
import { DollarSign, TrendingUp, Calendar, Sparkles, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ROICalculator({ initiativeType, onCalculated }) {
  const { language, isRTL, t } = useLanguage();
  const [inputs, setInputs] = useState({
    type: initiativeType || 'pilot',
    budget: '',
    sector: '',
    duration_months: '',
    expected_outcome: ''
  });
  const [results, setResults] = useState(null);
  const [calculating, setCalculating] = useState(false);

  const calculateROI = async () => {
    if (!inputs.budget || !inputs.sector) {
      toast.error(t({ en: 'Please fill required fields', ar: 'الرجاء ملء الحقول المطلوبة' }));
      return;
    }

    setCalculating(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Calculate expected ROI and impact for this initiative:

Type: ${inputs.type}
Budget: ${inputs.budget} SAR
Sector: ${inputs.sector}
Duration: ${inputs.duration_months} months
Expected Outcome: ${inputs.expected_outcome}

Based on similar initiatives in municipal innovation, provide:
1. Expected ROI (%)
2. Payback period (months)
3. Impact score (0-100)
4. Cost per citizen served (SAR)
5. Benchmark comparison (how does this compare to similar initiatives)
6. Risk factors (3 key risks)

Be realistic and data-driven.`,
        response_json_schema: {
          type: "object",
          properties: {
            roi_percentage: { type: "number" },
            payback_months: { type: "number" },
            impact_score: { type: "number" },
            cost_per_citizen: { type: "number" },
            benchmark: { type: "string" },
            risks: { type: "array", items: { type: "string" } }
          }
        }
      });

      setResults(response);
      if (onCalculated) onCalculated(response);
      toast.success(t({ en: 'ROI calculated', ar: 'تم حساب العائد' }));
    } catch (error) {
      toast.error(t({ en: 'Calculation failed', ar: 'فشل الحساب' }));
    } finally {
      setCalculating(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-green-50 to-white border-2 border-green-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-600" />
          {t({ en: 'ROI Calculator', ar: 'حاسبة العائد على الاستثمار' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm">{t({ en: 'Initiative Type', ar: 'نوع المبادرة' })}</Label>
            <Select value={inputs.type} onValueChange={(val) => setInputs({...inputs, type: val})}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pilot">Pilot</SelectItem>
                <SelectItem value="rd_project">R&D Project</SelectItem>
                <SelectItem value="program">Program</SelectItem>
                <SelectItem value="scaling">Scaling Initiative</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm">{t({ en: 'Budget (SAR)', ar: 'الميزانية (ريال)' })}</Label>
            <Input
              type="number"
              value={inputs.budget}
              onChange={(e) => setInputs({...inputs, budget: e.target.value})}
              placeholder="500000"
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-sm">{t({ en: 'Sector', ar: 'القطاع' })}</Label>
            <Select value={inputs.sector} onValueChange={(val) => setInputs({...inputs, sector: val})}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select sector" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="transport">Transport</SelectItem>
                <SelectItem value="environment">Environment</SelectItem>
                <SelectItem value="urban_design">Urban Design</SelectItem>
                <SelectItem value="digital_services">Digital Services</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm">{t({ en: 'Duration (months)', ar: 'المدة (أشهر)' })}</Label>
            <Input
              type="number"
              value={inputs.duration_months}
              onChange={(e) => setInputs({...inputs, duration_months: e.target.value})}
              placeholder="12"
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label className="text-sm">{t({ en: 'Expected Outcomes', ar: 'النتائج المتوقعة' })}</Label>
          <Input
            value={inputs.expected_outcome}
            onChange={(e) => setInputs({...inputs, expected_outcome: e.target.value})}
            placeholder="Reduce traffic congestion by 20%"
            className="mt-1"
          />
        </div>

        <Button onClick={calculateROI} disabled={calculating} className="w-full bg-gradient-to-r from-green-600 to-teal-600">
          <Sparkles className="h-4 w-4 mr-2" />
          {calculating ? t({ en: 'Calculating...', ar: 'جاري الحساب...' }) : t({ en: 'Calculate ROI', ar: 'حساب العائد' })}
        </Button>

        {results && (
          <div className="space-y-3 pt-4 border-t">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-green-50 rounded-lg text-center">
                <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-green-600">{results.roi_percentage}%</p>
                <p className="text-xs text-slate-600">{t({ en: 'Expected ROI', ar: 'العائد المتوقع' })}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg text-center">
                <Calendar className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-blue-600">{results.payback_months}</p>
                <p className="text-xs text-slate-600">{t({ en: 'Payback (months)', ar: 'الاسترداد (أشهر)' })}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg text-center">
                <Target className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-purple-600">{results.impact_score}</p>
                <p className="text-xs text-slate-600">{t({ en: 'Impact Score', ar: 'درجة التأثير' })}</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg text-center">
                <DollarSign className="h-6 w-6 text-amber-600 mx-auto mb-1" />
                <p className="text-xl font-bold text-amber-600">{results.cost_per_citizen}</p>
                <p className="text-xs text-slate-600">{t({ en: 'Cost/Citizen', ar: 'التكلفة/مواطن' })}</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border">
              <p className="text-xs text-slate-600 mb-1">{t({ en: 'Benchmark Comparison', ar: 'المقارنة المرجعية' })}</p>
              <p className="text-sm text-slate-700">{results.benchmark}</p>
            </div>

            {results.risks?.length > 0 && (
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="text-xs font-semibold text-red-900 mb-2 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {t({ en: 'Risk Factors', ar: 'عوامل المخاطر' })}
                </p>
                <ul className="space-y-1">
                  {results.risks.map((risk, idx) => (
                    <li key={idx} className="text-xs text-red-700">• {risk}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}