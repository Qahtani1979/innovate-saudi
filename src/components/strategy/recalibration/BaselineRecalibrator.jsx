import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/components/LanguageContext';
import { useStrategyRecalibration } from '@/hooks/strategy/useStrategyRecalibration';
import {
  Target, TrendingUp, ArrowRight,
  AlertTriangle, History, Save
} from 'lucide-react';

const BASELINE_TYPES = [
  { id: 'kpi_target', label: { en: 'KPI Target', ar: 'هدف مؤشر الأداء' } },
  { id: 'maturity_score', label: { en: 'Maturity Score', ar: 'درجة النضج' } },
  { id: 'benchmark', label: { en: 'Benchmark Value', ar: 'قيمة المعيار المرجعي' } },
  { id: 'budget_baseline', label: { en: 'Budget Baseline', ar: 'خط أساس الميزانية' } },
  { id: 'performance_threshold', label: { en: 'Performance Threshold', ar: 'عتبة الأداء' } }
];

const RECALIBRATION_SCENARIOS = [
  { id: 'external_event', label: { en: 'Major External Event', ar: 'حدث خارجي كبير' }, action: 'Full reset' },
  { id: 'investment', label: { en: 'Significant Investment', ar: 'استثمار كبير' }, action: 'Partial update' },
  { id: 'methodology', label: { en: 'Methodology Change', ar: 'تغيير المنهجية' }, action: 'Restatement' },
  { id: 'restructure', label: { en: 'Organization Restructure', ar: 'إعادة هيكلة المنظمة' }, action: 'New baseline' }
];

export default function BaselineRecalibrator({ planId }) {
  const { t, language } = useLanguage();
  const { updateBaseline } = useStrategyRecalibration(planId);
  
  const [recalibration, setRecalibration] = useState({
    baselineType: '',
    scenario: '',
    oldValue: '',
    newValue: '',
    justification: '',
    effectiveDate: new Date().toISOString().split('T')[0]
  });

  const [history, setHistory] = useState([
    // Mock history for demo
    {
      id: 1,
      type: 'kpi_target',
      oldValue: '70%',
      newValue: '85%',
      date: '2025-11-01',
      reason: 'Q3 performance exceeded expectations'
    },
    {
      id: 2,
      type: 'maturity_score',
      oldValue: '3.2',
      newValue: '3.8',
      date: '2025-10-15',
      reason: 'New capabilities deployed'
    }
  ]);

  const handleSubmit = () => {
    updateBaseline({
      baselineType: recalibration.baselineType,
      oldValue: recalibration.oldValue,
      newValue: recalibration.newValue,
      justification: `${recalibration.scenario}: ${recalibration.justification}`
    });

    // Add to local history
    setHistory(prev => [{
      id: Date.now(),
      type: recalibration.baselineType,
      oldValue: recalibration.oldValue,
      newValue: recalibration.newValue,
      date: recalibration.effectiveDate,
      reason: recalibration.justification
    }, ...prev]);

    // Reset form
    setRecalibration({
      baselineType: '',
      scenario: '',
      oldValue: '',
      newValue: '',
      justification: '',
      effectiveDate: new Date().toISOString().split('T')[0]
    });
  };

  const calculateChange = () => {
    const old = parseFloat(recalibration.oldValue);
    const newVal = parseFloat(recalibration.newValue);
    if (isNaN(old) || isNaN(newVal) || old === 0) return null;
    
    const change = ((newVal - old) / old) * 100;
    return {
      percentage: Math.abs(change).toFixed(1),
      direction: change >= 0 ? 'increase' : 'decrease',
      isSignificant: Math.abs(change) > 10
    };
  };

  const change = calculateChange();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          {t({ en: 'Baseline Recalibrator', ar: 'معاير خط الأساس' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Recalibration Scenarios */}
        <div className="space-y-3">
          <Label>{t({ en: 'Recalibration Scenario', ar: 'سيناريو إعادة المعايرة' })}</Label>
          <div className="grid grid-cols-2 gap-2">
            {RECALIBRATION_SCENARIOS.map(scenario => (
              <button
                key={scenario.id}
                onClick={() => setRecalibration(prev => ({ ...prev, scenario: scenario.id }))}
                className={`p-3 border rounded-lg text-left transition-colors ${
                  recalibration.scenario === scenario.id 
                    ? 'border-primary bg-primary/5' 
                    : 'hover:border-muted-foreground/50'
                }`}
              >
                <p className="font-medium text-sm">{t(scenario.label)}</p>
                <p className="text-xs text-muted-foreground">{scenario.action}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Baseline Type */}
        <div className="space-y-2">
          <Label>{t({ en: 'Baseline Type', ar: 'نوع خط الأساس' })}</Label>
          <Select
            value={recalibration.baselineType}
            onValueChange={(value) => setRecalibration(prev => ({ ...prev, baselineType: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder={t({ en: 'Select baseline type', ar: 'حدد نوع خط الأساس' })} />
            </SelectTrigger>
            <SelectContent>
              {BASELINE_TYPES.map(type => (
                <SelectItem key={type.id} value={type.id}>
                  {t(type.label)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Values */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t({ en: 'Current Value', ar: 'القيمة الحالية' })}</Label>
            <Input
              type="text"
              value={recalibration.oldValue}
              onChange={(e) => setRecalibration(prev => ({ ...prev, oldValue: e.target.value }))}
              placeholder="e.g., 70% or 3.5"
            />
          </div>
          <div className="space-y-2">
            <Label>{t({ en: 'New Value', ar: 'القيمة الجديدة' })}</Label>
            <Input
              type="text"
              value={recalibration.newValue}
              onChange={(e) => setRecalibration(prev => ({ ...prev, newValue: e.target.value }))}
              placeholder="e.g., 85% or 4.2"
            />
          </div>
        </div>

        {/* Change Preview */}
        {change && (
          <div className={`p-3 rounded-lg flex items-center justify-between ${
            change.isSignificant ? 'bg-amber-50 border border-amber-200' : 'bg-muted'
          }`}>
            <div className="flex items-center gap-2">
              {change.direction === 'increase' ? (
                <TrendingUp className="h-5 w-5 text-green-600" />
              ) : (
                <TrendingUp className="h-5 w-5 text-red-600 rotate-180" />
              )}
              <span className="font-medium">
                {change.percentage}% {change.direction}
              </span>
            </div>
            {change.isSignificant && (
              <Badge variant="outline" className="text-amber-700">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {t({ en: 'Significant change', ar: 'تغيير كبير' })}
              </Badge>
            )}
          </div>
        )}

        {/* Effective Date */}
        <div className="space-y-2">
          <Label>{t({ en: 'Effective Date', ar: 'تاريخ السريان' })}</Label>
          <Input
            type="date"
            value={recalibration.effectiveDate}
            onChange={(e) => setRecalibration(prev => ({ ...prev, effectiveDate: e.target.value }))}
          />
        </div>

        {/* Justification */}
        <div className="space-y-2">
          <Label>{t({ en: 'Justification', ar: 'المبرر' })}</Label>
          <Textarea
            value={recalibration.justification}
            onChange={(e) => setRecalibration(prev => ({ ...prev, justification: e.target.value }))}
            placeholder={t({ en: 'Explain why this recalibration is necessary...', ar: 'اشرح لماذا هذه إعادة المعايرة ضرورية...' })}
            rows={3}
          />
        </div>

        <Button 
          onClick={handleSubmit}
          disabled={!recalibration.baselineType || !recalibration.oldValue || !recalibration.newValue || !recalibration.justification}
          className="w-full"
        >
          <Save className="h-4 w-4 mr-2" />
          {t({ en: 'Update Baseline', ar: 'تحديث خط الأساس' })}
        </Button>

        {/* History */}
        <div className="pt-4 border-t">
          <div className="flex items-center gap-2 mb-3">
            <History className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-medium">{t({ en: 'Recent Changes', ar: 'التغييرات الأخيرة' })}</h3>
          </div>
          <div className="space-y-2">
            {history.slice(0, 5).map((item) => (
              <div key={item.id} className="p-3 bg-muted/50 rounded-lg text-sm">
                <div className="flex items-center justify-between mb-1">
                  <Badge variant="outline" className="text-xs">
                    {BASELINE_TYPES.find(t => t.id === item.type)?.label.en || item.type}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{item.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{item.oldValue}</span>
                  <ArrowRight className="h-3 w-3" />
                  <span className="font-medium">{item.newValue}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{item.reason}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
