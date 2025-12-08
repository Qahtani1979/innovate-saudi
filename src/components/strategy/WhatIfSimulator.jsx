import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Zap, Play, Save, RefreshCw } from 'lucide-react';
import { Slider } from "@/components/ui/slider";
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function WhatIfSimulator({ currentState }) {
  const { language, isRTL, t } = useLanguage();
  const [budgetAllocation, setBudgetAllocation] = useState({
    transport: 30,
    environment: 20,
    digital: 25,
    urban: 25
  });
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Predict KPI impacts of this budget reallocation:

Current: Transport 30%, Environment 20%, Digital 25%, Urban 25%
Proposed: ${JSON.stringify(budgetAllocation)}

Predict changes to:
- Pilot success rate
- Solutions deployed
- Average MII score
- R&D to pilot conversion

Provide specific percentage changes`,
        response_json_schema: {
          type: 'object',
          properties: {
            kpi_changes: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  kpi_en: { type: 'string' },
                  kpi_ar: { type: 'string' },
                  current: { type: 'number' },
                  predicted: { type: 'number' },
                  change_percent: { type: 'number' }
                }
              }
            }
          }
        }
      });
      setPredictions(result.kpi_changes);
      toast.success(t({ en: 'Simulation complete', ar: 'اكتملت المحاكاة' }));
    } catch (error) {
      toast.error(t({ en: 'Simulation failed', ar: 'فشلت المحاكاة' }));
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setBudgetAllocation({ transport: 30, environment: 20, digital: 25, urban: 25 });
    setPredictions(null);
  };

  return (
    <Card className="border-2 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-900">
          <Zap className="h-5 w-5" />
          {t({ en: 'What-If Simulator', ar: 'محاكي السيناريوهات' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {Object.keys(budgetAllocation).map(sector => (
            <div key={sector}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium capitalize">{sector}</span>
                <Badge>{budgetAllocation[sector]}%</Badge>
              </div>
              <Slider
                value={[budgetAllocation[sector]]}
                onValueChange={([val]) => setBudgetAllocation({ ...budgetAllocation, [sector]: val })}
                max={50}
                step={5}
              />
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button onClick={runSimulation} disabled={loading} className="flex-1 bg-purple-600">
            <Play className="h-4 w-4 mr-2" />
            {t({ en: 'Run Simulation', ar: 'تشغيل المحاكاة' })}
          </Button>
          <Button onClick={reset} variant="outline">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {predictions && (
          <div className="space-y-3 pt-4 border-t">
            <h4 className="font-semibold text-slate-900">{t({ en: 'Predicted Impact', ar: 'التأثير المتوقع' })}</h4>
            {predictions.map((pred, idx) => (
              <div key={idx} className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    {language === 'ar' ? pred.kpi_ar : pred.kpi_en}
                  </p>
                  <Badge className={pred.change_percent > 0 ? 'bg-green-600' : 'bg-red-600'}>
                    {pred.change_percent > 0 ? '+' : ''}{pred.change_percent}%
                  </Badge>
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs">
                  <span className="text-slate-600">{pred.current} → {pred.predicted}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}