import React from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sparkles, AlertTriangle, Plus, X, Shield, TrendingUp, TrendingDown } from 'lucide-react';
import { useLanguage } from '../../../LanguageContext';
import { RISK_CATEGORIES } from '../StrategyWizardSteps';
import { cn } from '@/lib/utils';

export default function Step7Risks({ data, onChange, onGenerateAI, isGenerating }) {
  const { language, t, isRTL } = useLanguage();

  const addRisk = () => {
    const newRisk = {
      id: Date.now().toString(),
      title: '',
      description: '',
      category: 'OPERATIONAL',
      likelihood: 'medium', // low, medium, high
      impact: 'medium', // low, medium, high
      risk_score: 0,
      mitigation_strategy: '',
      contingency_plan: '',
      owner: '',
      status: 'identified' // identified, mitigating, resolved, accepted
    };
    onChange({ risks: [...(data.risks || []), newRisk] });
  };

  const updateRisk = (index, field, value) => {
    const updated = [...(data.risks || [])];
    updated[index] = { ...updated[index], [field]: value };
    
    // Auto-calculate risk score
    if (field === 'likelihood' || field === 'impact') {
      const scores = { low: 1, medium: 2, high: 3 };
      const likelihood = field === 'likelihood' ? value : updated[index].likelihood;
      const impact = field === 'impact' ? value : updated[index].impact;
      updated[index].risk_score = scores[likelihood] * scores[impact];
    }
    
    onChange({ risks: updated });
  };

  const removeRisk = (index) => {
    onChange({ risks: data.risks.filter((_, i) => i !== index) });
  };

  const getLevelOptions = () => [
    { value: 'low', label: { en: 'Low', ar: 'منخفض' }, color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: { en: 'Medium', ar: 'متوسط' }, color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: { en: 'High', ar: 'مرتفع' }, color: 'bg-red-100 text-red-800' }
  ];

  const statusOptions = [
    { value: 'identified', label: { en: 'Identified', ar: 'محدد' } },
    { value: 'mitigating', label: { en: 'Mitigating', ar: 'قيد التخفيف' } },
    { value: 'resolved', label: { en: 'Resolved', ar: 'تم الحل' } },
    { value: 'accepted', label: { en: 'Accepted', ar: 'مقبول' } }
  ];

  const getRiskColor = (score) => {
    if (score >= 6) return 'bg-red-500 text-white';
    if (score >= 3) return 'bg-yellow-500 text-black';
    return 'bg-green-500 text-white';
  };

  const riskAppetiteOptions = [
    { value: 'low', label: { en: 'Low (Risk Averse)', ar: 'منخفض (تجنب المخاطر)' } },
    { value: 'moderate', label: { en: 'Moderate (Balanced)', ar: 'معتدل (متوازن)' } },
    { value: 'high', label: { en: 'High (Risk Tolerant)', ar: 'مرتفع (تحمل المخاطر)' } }
  ];

  // Group risks by score for matrix
  const riskMatrix = {
    high_high: data.risks?.filter(r => r.likelihood === 'high' && r.impact === 'high') || [],
    high_medium: data.risks?.filter(r => r.likelihood === 'high' && r.impact === 'medium') || [],
    high_low: data.risks?.filter(r => r.likelihood === 'high' && r.impact === 'low') || [],
    medium_high: data.risks?.filter(r => r.likelihood === 'medium' && r.impact === 'high') || [],
    medium_medium: data.risks?.filter(r => r.likelihood === 'medium' && r.impact === 'medium') || [],
    medium_low: data.risks?.filter(r => r.likelihood === 'medium' && r.impact === 'low') || [],
    low_high: data.risks?.filter(r => r.likelihood === 'low' && r.impact === 'high') || [],
    low_medium: data.risks?.filter(r => r.likelihood === 'low' && r.impact === 'medium') || [],
    low_low: data.risks?.filter(r => r.likelihood === 'low' && r.impact === 'low') || []
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {t({ 
              en: 'Identify strategic risks and define mitigation strategies to protect plan execution.',
              ar: 'تحديد المخاطر الاستراتيجية وتعريف استراتيجيات التخفيف لحماية تنفيذ الخطة.'
            })}
          </p>
          <Badge variant="secondary" className="mt-2">
            {(data.risks || []).length} {t({ en: 'risks identified', ar: 'مخاطر محددة' })}
          </Badge>
        </div>
        <Button 
          variant="outline" 
          onClick={onGenerateAI} 
          disabled={isGenerating}
          className="gap-2"
        >
          <Sparkles className="w-4 h-4" />
          {isGenerating 
            ? t({ en: 'Generating...', ar: 'جاري الإنشاء...' })
            : t({ en: 'Identify Risks with AI', ar: 'تحديد المخاطر بالذكاء الاصطناعي' })
          }
        </Button>
      </div>

      {/* Risk Appetite */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="w-5 h-5 text-primary" />
            {t({ en: 'Risk Appetite', ar: 'تحمل المخاطر' })}
          </CardTitle>
          <CardDescription>
            {t({ en: 'Define the organization\'s tolerance for risk', ar: 'تحديد تحمل المنظمة للمخاطر' })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={data.risk_appetite || 'moderate'}
            onValueChange={(v) => onChange({ risk_appetite: v })}
            className="flex flex-wrap gap-4"
          >
            {riskAppetiteOptions.map(opt => (
              <div key={opt.value} className="flex items-center space-x-2">
                <RadioGroupItem value={opt.value} id={opt.value} />
                <Label htmlFor={opt.value}>{opt.label[language]}</Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Risk Matrix */}
      {(data.risks || []).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t({ en: 'Risk Matrix', ar: 'مصفوفة المخاطر' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-1 text-xs">
              {/* Header */}
              <div></div>
              <div className="text-center font-medium p-2 bg-muted rounded">{t({ en: 'Low Impact', ar: 'تأثير منخفض' })}</div>
              <div className="text-center font-medium p-2 bg-muted rounded">{t({ en: 'Medium Impact', ar: 'تأثير متوسط' })}</div>
              <div className="text-center font-medium p-2 bg-muted rounded">{t({ en: 'High Impact', ar: 'تأثير مرتفع' })}</div>
              
              {/* High Likelihood Row */}
              <div className="font-medium p-2 bg-muted rounded text-center">{t({ en: 'High', ar: 'مرتفع' })}</div>
              <div className="p-2 bg-yellow-100 rounded min-h-[60px]">
                {riskMatrix.high_low.map(r => <Badge key={r.id} variant="outline" className="text-[10px] m-0.5">{r.title || '?'}</Badge>)}
              </div>
              <div className="p-2 bg-orange-100 rounded min-h-[60px]">
                {riskMatrix.high_medium.map(r => <Badge key={r.id} variant="outline" className="text-[10px] m-0.5">{r.title || '?'}</Badge>)}
              </div>
              <div className="p-2 bg-red-100 rounded min-h-[60px]">
                {riskMatrix.high_high.map(r => <Badge key={r.id} variant="destructive" className="text-[10px] m-0.5">{r.title || '?'}</Badge>)}
              </div>
              
              {/* Medium Likelihood Row */}
              <div className="font-medium p-2 bg-muted rounded text-center">{t({ en: 'Medium', ar: 'متوسط' })}</div>
              <div className="p-2 bg-green-100 rounded min-h-[60px]">
                {riskMatrix.medium_low.map(r => <Badge key={r.id} variant="outline" className="text-[10px] m-0.5">{r.title || '?'}</Badge>)}
              </div>
              <div className="p-2 bg-yellow-100 rounded min-h-[60px]">
                {riskMatrix.medium_medium.map(r => <Badge key={r.id} variant="outline" className="text-[10px] m-0.5">{r.title || '?'}</Badge>)}
              </div>
              <div className="p-2 bg-orange-100 rounded min-h-[60px]">
                {riskMatrix.medium_high.map(r => <Badge key={r.id} variant="outline" className="text-[10px] m-0.5">{r.title || '?'}</Badge>)}
              </div>
              
              {/* Low Likelihood Row */}
              <div className="font-medium p-2 bg-muted rounded text-center">{t({ en: 'Low', ar: 'منخفض' })}</div>
              <div className="p-2 bg-green-50 rounded min-h-[60px]">
                {riskMatrix.low_low.map(r => <Badge key={r.id} variant="outline" className="text-[10px] m-0.5">{r.title || '?'}</Badge>)}
              </div>
              <div className="p-2 bg-green-100 rounded min-h-[60px]">
                {riskMatrix.low_medium.map(r => <Badge key={r.id} variant="outline" className="text-[10px] m-0.5">{r.title || '?'}</Badge>)}
              </div>
              <div className="p-2 bg-yellow-100 rounded min-h-[60px]">
                {riskMatrix.low_high.map(r => <Badge key={r.id} variant="outline" className="text-[10px] m-0.5">{r.title || '?'}</Badge>)}
              </div>
            </div>
            <div className="text-center mt-2 text-xs text-muted-foreground">
              ← {t({ en: 'Likelihood', ar: 'الاحتمالية' })} →
            </div>
          </CardContent>
        </Card>
      )}

      {/* Risks List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="w-5 h-5 text-primary" />
            {t({ en: 'Risk Register', ar: 'سجل المخاطر' })}
          </CardTitle>
          <Button variant="outline" size="sm" onClick={addRisk}>
            <Plus className="w-4 h-4 mr-1" />
            {t({ en: 'Add Risk', ar: 'إضافة خطر' })}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {(data.risks || []).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
              {t({ en: 'No risks identified yet. Click "Add Risk" to begin.', ar: 'لم يتم تحديد مخاطر بعد. انقر "إضافة خطر" للبدء.' })}
            </div>
          ) : (
            <div className="space-y-4">
              {data.risks.map((risk, index) => (
                <div key={risk.id} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <Badge className={getRiskColor(risk.risk_score)}>
                        {t({ en: 'Score:', ar: 'الدرجة:' })} {risk.risk_score || 0}
                      </Badge>
                      <Badge variant="outline">
                        {RISK_CATEGORIES.find(c => c.code === risk.category)?.[`name_${language}`] || risk.category}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeRisk(index)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>{t({ en: 'Risk Title', ar: 'عنوان الخطر' })} *</Label>
                      <Input
                        value={risk.title}
                        onChange={(e) => updateRisk(index, 'title', e.target.value)}
                        placeholder={t({ en: 'Brief risk title', ar: 'عنوان موجز للخطر' })}
                      />
                    </div>
                    
                    <div>
                      <Label>{t({ en: 'Category', ar: 'الفئة' })}</Label>
                      <Select
                        value={risk.category}
                        onValueChange={(v) => updateRisk(index, 'category', v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {RISK_CATEGORIES.map(cat => (
                            <SelectItem key={cat.code} value={cat.code}>
                              {cat[`name_${language}`]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>{t({ en: 'Likelihood', ar: 'الاحتمالية' })}</Label>
                      <Select
                        value={risk.likelihood}
                        onValueChange={(v) => updateRisk(index, 'likelihood', v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {getLevelOptions().map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>
                              <span className={cn("px-2 py-0.5 rounded", opt.color)}>{opt.label[language]}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>{t({ en: 'Impact', ar: 'التأثير' })}</Label>
                      <Select
                        value={risk.impact}
                        onValueChange={(v) => updateRisk(index, 'impact', v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {getLevelOptions().map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>
                              <span className={cn("px-2 py-0.5 rounded", opt.color)}>{opt.label[language]}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>{t({ en: 'Description', ar: 'الوصف' })}</Label>
                    <Textarea
                      value={risk.description}
                      onChange={(e) => updateRisk(index, 'description', e.target.value)}
                      placeholder={t({ en: 'Describe the risk in detail...', ar: 'وصف الخطر بالتفصيل...' })}
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>{t({ en: 'Mitigation Strategy', ar: 'استراتيجية التخفيف' })}</Label>
                      <Textarea
                        value={risk.mitigation_strategy}
                        onChange={(e) => updateRisk(index, 'mitigation_strategy', e.target.value)}
                        placeholder={t({ en: 'How will you reduce the risk?', ar: 'كيف ستقلل من الخطر؟' })}
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label>{t({ en: 'Contingency Plan', ar: 'خطة الطوارئ' })}</Label>
                      <Textarea
                        value={risk.contingency_plan}
                        onChange={(e) => updateRisk(index, 'contingency_plan', e.target.value)}
                        placeholder={t({ en: 'What if the risk materializes?', ar: 'ماذا لو تحقق الخطر؟' })}
                        rows={2}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{t({ en: 'Risk Owner', ar: 'مالك الخطر' })}</Label>
                      <Input
                        value={risk.owner}
                        onChange={(e) => updateRisk(index, 'owner', e.target.value)}
                        placeholder={t({ en: 'Name or role', ar: 'الاسم أو الدور' })}
                      />
                    </div>
                    <div>
                      <Label>{t({ en: 'Status', ar: 'الحالة' })}</Label>
                      <Select
                        value={risk.status}
                        onValueChange={(v) => updateRisk(index, 'status', v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label[language]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
