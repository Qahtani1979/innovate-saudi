import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Sparkles, Copy, Trash2, TrendingUp, AlertCircle, Target, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { toast } from 'sonner';
import ProtectedPage from '../components/permissions/ProtectedPage';

function DecisionSimulator() {
  const { language, isRTL, t } = useLanguage();
  const [scenarios, setScenarios] = useState([
    { id: 1, name: 'Current State', budget_pilot: 40, budget_rd: 25, budget_program: 20, budget_scaling: 15 },
    { id: 2, name: 'Scenario A', budget_pilot: 30, budget_rd: 35, budget_program: 20, budget_scaling: 15 },
    { id: 3, name: 'Scenario B', budget_pilot: 50, budget_rd: 15, budget_program: 20, budget_scaling: 15 }
  ]);
  const [predictions, setPredictions] = useState({});
  const [analyzing, setAnalyzing] = useState(false);

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots'],
    queryFn: () => base44.entities.Pilot.list()
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => base44.entities.Challenge.list()
  });

  const updateScenario = (id, field, value) => {
    setScenarios(scenarios.map(s => s.id === id ? { ...s, [field]: parseFloat(value) || 0 } : s));
  };

  const addScenario = () => {
    if (scenarios.length >= 3) {
      toast.error('Maximum 3 scenarios allowed');
      return;
    }
    const newId = Math.max(...scenarios.map(s => s.id)) + 1;
    setScenarios([...scenarios, { 
      id: newId, 
      name: `Scenario ${String.fromCharCode(64 + scenarios.length)}`,
      budget_pilot: 33,
      budget_rd: 33,
      budget_program: 17,
      budget_scaling: 17
    }]);
  };

  const removeScenario = (id) => {
    if (scenarios.length <= 1) {
      toast.error('At least one scenario required');
      return;
    }
    setScenarios(scenarios.filter(s => s.id !== id));
  };

  const duplicateScenario = (scenario) => {
    if (scenarios.length >= 3) {
      toast.error('Maximum 3 scenarios allowed');
      return;
    }
    const newId = Math.max(...scenarios.map(s => s.id)) + 1;
    setScenarios([...scenarios, { ...scenario, id: newId, name: `${scenario.name} (Copy)` }]);
  };

  const predictOutcomes = async () => {
    setAnalyzing(true);
    try {
      const historicalData = {
        pilot_count: pilots.length,
        pilot_success_rate: pilots.filter(p => p.stage === 'scaled').length / pilots.length,
        challenge_resolution_rate: challenges.filter(c => c.status === 'resolved').length / challenges.length,
        current_mii_avg: 58
      };

      const scenarioPromises = scenarios.map(async (scenario) => {
        const response = await base44.integrations.Core.InvokeLLM({
          prompt: `Predict outcomes for this budget allocation scenario:

Scenario: ${scenario.name}
Budget Allocation:
- Pilots: ${scenario.budget_pilot}%
- R&D: ${scenario.budget_rd}%
- Programs: ${scenario.budget_program}%
- Scaling: ${scenario.budget_scaling}%

Historical Context:
- Current Pilots: ${historicalData.pilot_count}
- Pilot Success Rate: ${(historicalData.pilot_success_rate * 100).toFixed(0)}%
- Challenge Resolution: ${(historicalData.challenge_resolution_rate * 100).toFixed(0)}%
- Current MII Average: ${historicalData.current_mii_avg}

Predict realistic outcomes for:
1. Expected new pilots launched (number)
2. Challenge resolution rate change (+/- %)
3. MII score change (+/- points)
4. Risk level (low/medium/high)
5. Success probability (%)
6. Key trade-offs (brief)`,
          response_json_schema: {
            type: "object",
            properties: {
              pilots_expected: { type: "number" },
              challenge_resolution_change: { type: "number" },
              mii_change: { type: "number" },
              risk_level: { type: "string" },
              success_probability: { type: "number" },
              trade_offs: { type: "string" }
            }
          }
        });

        return { scenarioId: scenario.id, ...response };
      });

      const results = await Promise.all(scenarioPromises);
      const predictionsMap = {};
      results.forEach(r => {
        predictionsMap[r.scenarioId] = r;
      });

      setPredictions(predictionsMap);
      toast.success('AI predictions generated');
    } catch (error) {
      toast.error('Failed to generate predictions');
    } finally {
      setAnalyzing(false);
    }
  };

  const comparisonData = scenarios.map(s => ({
    name: s.name,
    'Pilots': s.budget_pilot,
    'R&D': s.budget_rd,
    'Programs': s.budget_program,
    'Scaling': s.budget_scaling
  }));

  const radarData = scenarios.map(s => {
    const pred = predictions[s.id];
    return {
      scenario: s.name,
      'New Pilots': pred?.pilots_expected || 0,
      'MII Impact': (pred?.mii_change || 0) * 10,
      'Challenge Resolution': (pred?.challenge_resolution_change || 0) * 10,
      'Success': pred?.success_probability || 50
    };
  });

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {t({ en: 'Decision Simulator', ar: 'محاكي القرارات' })}
          </h1>
          <p className="text-slate-600 mt-1">
            {t({ en: 'Compare budget scenarios and predict outcomes with AI', ar: 'قارن سيناريوهات الميزانية وتنبأ بالنتائج مع الذكاء الاصطناعي' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={addScenario} variant="outline">
            {t({ en: '+ Add Scenario', ar: '+ إضافة سيناريو' })}
          </Button>
          <Button onClick={predictOutcomes} disabled={analyzing} className="bg-gradient-to-r from-purple-600 to-pink-600">
            <Sparkles className="h-4 w-4 mr-2" />
            {analyzing ? t({ en: 'Analyzing...', ar: 'جاري التحليل...' }) : t({ en: 'Predict Outcomes', ar: 'التنبؤ بالنتائج' })}
          </Button>
        </div>
      </div>

      {/* Scenario Builder */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {scenarios.map((scenario, idx) => (
          <Card key={scenario.id} className={idx === 0 ? 'border-2 border-blue-400' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Input
                  value={scenario.name}
                  onChange={(e) => updateScenario(scenario.id, 'name', e.target.value)}
                  className="font-semibold text-lg border-0 px-0 focus-visible:ring-0"
                />
                {idx > 0 && (
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" onClick={() => duplicateScenario(scenario)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => removeScenario(scenario.id)}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs">{t({ en: 'Pilots', ar: 'التجارب' })} (%)</Label>
                <Input
                  type="number"
                  value={scenario.budget_pilot}
                  onChange={(e) => updateScenario(scenario.id, 'budget_pilot', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">{t({ en: 'R&D', ar: 'البحث' })} (%)</Label>
                <Input
                  type="number"
                  value={scenario.budget_rd}
                  onChange={(e) => updateScenario(scenario.id, 'budget_rd', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">{t({ en: 'Programs', ar: 'البرامج' })} (%)</Label>
                <Input
                  type="number"
                  value={scenario.budget_program}
                  onChange={(e) => updateScenario(scenario.id, 'budget_program', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">{t({ en: 'Scaling', ar: 'التوسع' })} (%)</Label>
                <Input
                  type="number"
                  value={scenario.budget_scaling}
                  onChange={(e) => updateScenario(scenario.id, 'budget_scaling', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="pt-2 border-t">
                <p className="text-sm font-medium">
                  Total: {scenario.budget_pilot + scenario.budget_rd + scenario.budget_program + scenario.budget_scaling}%
                </p>
              </div>

              {predictions[scenario.id] && (
                <div className="space-y-3 pt-4 border-t">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-slate-600 mb-1">{t({ en: 'Expected Pilots', ar: 'التجارب المتوقعة' })}</p>
                    <p className="text-2xl font-bold text-blue-600">{predictions[scenario.id].pilots_expected}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-xs text-slate-600 mb-1">{t({ en: 'MII Impact', ar: 'تأثير المؤشر' })}</p>
                    <p className="text-2xl font-bold text-green-600">+{predictions[scenario.id].mii_change}</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-xs text-slate-600 mb-1">{t({ en: 'Success Probability', ar: 'احتمالية النجاح' })}</p>
                    <p className="text-2xl font-bold text-purple-600">{predictions[scenario.id].success_probability}%</p>
                  </div>
                  <Badge className={
                    predictions[scenario.id].risk_level === 'low' ? 'bg-green-100 text-green-700' :
                    predictions[scenario.id].risk_level === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }>
                    {t({ en: 'Risk:', ar: 'المخاطر:' })} {predictions[scenario.id].risk_level}
                  </Badge>
                  <p className="text-xs text-slate-600 leading-relaxed">{predictions[scenario.id].trade_offs}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Side-by-Side Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Budget Allocation Comparison', ar: 'مقارنة توزيع الميزانية' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Pilots" fill="#3b82f6" />
                <Bar dataKey="R&D" fill="#10b981" />
                <Bar dataKey="Programs" fill="#f59e0b" />
                <Bar dataKey="Scaling" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {Object.keys(predictions).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{t({ en: 'Predicted Outcomes Comparison', ar: 'مقارنة النتائج المتوقعة' })}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="scenario" />
                  <PolarRadiusAxis />
                  {scenarios.map((s, idx) => (
                    <Radar key={s.id} name={s.name} dataKey="scenario" stroke={['#3b82f6', '#10b981', '#f59e0b'][idx]} fill={['#3b82f6', '#10b981', '#f59e0b'][idx]} fillOpacity={0.3} />
                  ))}
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recommendations */}
      {Object.keys(predictions).length > 0 && (
        <Card className="bg-gradient-to-br from-purple-50 to-white border-2 border-purple-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              {t({ en: 'AI Decision Recommendations', ar: 'توصيات القرار الذكية' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {scenarios.map((scenario) => {
                const pred = predictions[scenario.id];
                if (!pred) return null;

                return (
                  <div key={scenario.id} className="p-4 bg-white rounded-lg border">
                    <h4 className="font-semibold text-slate-900 mb-3">{scenario.name}</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">{t({ en: 'Success', ar: 'النجاح' })}</span>
                        <span className="font-bold text-purple-600">{pred.success_probability}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">{t({ en: 'MII', ar: 'المؤشر' })}</span>
                        <span className="font-bold text-green-600">+{pred.mii_change}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">{t({ en: 'Pilots', ar: 'التجارب' })}</span>
                        <span className="font-bold">{pred.pilots_expected}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ProtectedPage(DecisionSimulator, { requiredPermissions: [] });