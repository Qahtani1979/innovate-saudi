import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '../components/LanguageContext';
import { Plus, Trash2, Save, Sparkles, Target } from 'lucide-react';
import { toast } from 'sonner';

const DEFAULT_RUBRIC = {
  name: 'Standard Idea Evaluation',
  criteria: [
    { name: 'Feasibility', weight: 25, description: 'Can this be realistically implemented?', scale: '0-10' },
    { name: 'Impact', weight: 30, description: 'What is the expected impact on citizens?', scale: '0-10' },
    { name: 'Innovation', weight: 20, description: 'How novel is this idea?', scale: '0-10' },
    { name: 'Cost', weight: 15, description: 'Is the cost reasonable?', scale: '0-10' },
    { name: 'Strategic Alignment', weight: 10, description: 'Does it align with strategic goals?', scale: '0-10' }
  ],
  thresholds: {
    approve: 70,
    convert: 80,
    reject: 40
  }
};

export default function EvaluationRubricBuilder() {
  const { language, isRTL, t } = useLanguage();
  const [rubrics, setRubrics] = useState([DEFAULT_RUBRIC]);
  const [activeRubric, setActiveRubric] = useState(0);

  const addCriterion = () => {
    const updated = [...rubrics];
    updated[activeRubric].criteria.push({ name: '', weight: 10, description: '', scale: '0-10' });
    setRubrics(updated);
  };

  const updateCriterion = (idx, field, value) => {
    const updated = [...rubrics];
    updated[activeRubric].criteria[idx][field] = value;
    setRubrics(updated);
  };

  const removeCriterion = (idx) => {
    const updated = [...rubrics];
    updated[activeRubric].criteria.splice(idx, 1);
    setRubrics(updated);
  };

  const totalWeight = rubrics[activeRubric]?.criteria.reduce((sum, c) => sum + (parseFloat(c.weight) || 0), 0);
  const rubric = rubrics[activeRubric];

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-900 to-purple-700 bg-clip-text text-transparent">
          {t({ en: 'Evaluation Rubric Builder', ar: 'بناء معايير التقييم' })}
        </h1>
        <p className="text-slate-600 mt-2">
          {t({ en: 'Configure evaluation criteria for ideas and proposals', ar: 'تكوين معايير التقييم للأفكار والمقترحات' })}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t({ en: 'Evaluation Criteria', ar: 'معايير التقييم' })}</CardTitle>
                <Badge className={totalWeight === 100 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>
                  Total Weight: {totalWeight}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {rubric.criteria.map((criterion, idx) => (
                <div key={idx} className="p-4 border rounded-lg">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          placeholder={t({ en: 'Criterion name...', ar: 'اسم المعيار...' })}
                          value={criterion.name}
                          onChange={(e) => updateCriterion(idx, 'name', e.target.value)}
                        />
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            placeholder="Weight %"
                            value={criterion.weight}
                            onChange={(e) => updateCriterion(idx, 'weight', parseFloat(e.target.value))}
                            className="w-24"
                          />
                          <Select value={criterion.scale} onValueChange={(v) => updateCriterion(idx, 'scale', v)}>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0-10">0-10</SelectItem>
                              <SelectItem value="0-100">0-100</SelectItem>
                              <SelectItem value="1-5">1-5</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Input
                        placeholder={t({ en: 'Description / Guiding question...', ar: 'الوصف / السؤال الإرشادي...' })}
                        value={criterion.description}
                        onChange={(e) => updateCriterion(idx, 'description', e.target.value)}
                      />
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeCriterion(idx)} className="text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <Button onClick={addCriterion} variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                {t({ en: 'Add Criterion', ar: 'إضافة معيار' })}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t({ en: 'Decision Thresholds', ar: 'عتبات القرار' })}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t({ en: 'Convert to Challenge (Score ≥)', ar: 'تحويل إلى تحدي (النقاط ≥)' })}
                </label>
                <Input
                  type="number"
                  value={rubric.thresholds.convert}
                  onChange={(e) => {
                    const updated = [...rubrics];
                    updated[activeRubric].thresholds.convert = parseFloat(e.target.value);
                    setRubrics(updated);
                  }}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t({ en: 'Approve (Score ≥)', ar: 'قبول (النقاط ≥)' })}
                </label>
                <Input
                  type="number"
                  value={rubric.thresholds.approve}
                  onChange={(e) => {
                    const updated = [...rubrics];
                    updated[activeRubric].thresholds.approve = parseFloat(e.target.value);
                    setRubrics(updated);
                  }}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t({ en: 'Reject (Score <)', ar: 'رفض (النقاط <)' })}
                </label>
                <Input
                  type="number"
                  value={rubric.thresholds.reject}
                  onChange={(e) => {
                    const updated = [...rubrics];
                    updated[activeRubric].thresholds.reject = parseFloat(e.target.value);
                    setRubrics(updated);
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-sm">{t({ en: 'Scorecard Preview', ar: 'معاينة بطاقة النقاط' })}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {rubric.criteria.map((c, idx) => (
                <div key={idx} className="p-3 border rounded-lg bg-slate-50">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-sm text-slate-900">{c.name || `Criterion ${idx + 1}`}</p>
                    <Badge className="text-xs">{c.weight}%</Badge>
                  </div>
                  <p className="text-xs text-slate-600 mb-2">{c.description}</p>
                  <div className="flex gap-1">
                    {[...Array(parseInt(c.scale.split('-')[1]) || 10)].map((_, i) => (
                      <div key={i} className="h-6 w-6 border rounded flex items-center justify-center text-xs bg-white">
                        {i + 1}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="pt-3 border-t">
                <p className="text-xs text-slate-500 mb-2">{t({ en: 'Recommendation', ar: 'التوصية' })}</p>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span>≥ {rubric.thresholds.convert}:</span>
                    <Badge className="bg-purple-100 text-purple-700">Convert</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>≥ {rubric.thresholds.approve}:</span>
                    <Badge className="bg-green-100 text-green-700">Approve</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>&lt; {rubric.thresholds.reject}:</span>
                    <Badge className="bg-red-100 text-red-700">Reject</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => toast.success(t({ en: 'Rubric saved', ar: 'تم الحفظ' }))} className="bg-indigo-600">
          <Save className="h-4 w-4 mr-2" />
          {t({ en: 'Save Rubric', ar: 'حفظ المعايير' })}
        </Button>
      </div>
    </div>
  );
}