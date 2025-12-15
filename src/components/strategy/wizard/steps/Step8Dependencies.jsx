import React from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, GitBranch, Link2, AlertCircle, Plus, X, CheckCircle } from 'lucide-react';
import { useLanguage } from '../../../LanguageContext';

export default function Step8Dependencies({ data, onChange, onGenerateAI, isGenerating }) {
  const { language, t, isRTL } = useLanguage();

  // Dependencies
  const addDependency = () => {
    const newDep = {
      id: Date.now().toString(),
      name_en: '',
      name_ar: '',
      type: 'internal',
      source: '',
      target: '',
      criticality: 'medium',
      status: 'pending',
      notes: ''
    };
    onChange({ dependencies: [...(data.dependencies || []), newDep] });
  };

  const updateDependency = (index, field, value) => {
    const updated = [...(data.dependencies || [])];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ dependencies: updated });
  };

  const removeDependency = (index) => {
    onChange({ dependencies: data.dependencies.filter((_, i) => i !== index) });
  };

  // Constraints
  const addConstraint = () => {
    const newConstraint = {
      id: Date.now().toString(),
      description_en: '',
      description_ar: '',
      type: 'budget',
      impact: 'medium',
      mitigation_en: '',
      mitigation_ar: ''
    };
    onChange({ constraints: [...(data.constraints || []), newConstraint] });
  };

  const updateConstraint = (index, field, value) => {
    const updated = [...(data.constraints || [])];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ constraints: updated });
  };

  const removeConstraint = (index) => {
    onChange({ constraints: data.constraints.filter((_, i) => i !== index) });
  };

  // Assumptions
  const addAssumption = () => {
    const newAssumption = {
      id: Date.now().toString(),
      statement_en: '',
      statement_ar: '',
      category: 'operational',
      confidence: 'high',
      validation_method_en: '',
      validation_method_ar: ''
    };
    onChange({ assumptions: [...(data.assumptions || []), newAssumption] });
  };

  const updateAssumption = (index, field, value) => {
    const updated = [...(data.assumptions || [])];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ assumptions: updated });
  };

  const removeAssumption = (index) => {
    onChange({ assumptions: data.assumptions.filter((_, i) => i !== index) });
  };

  const dependencyTypes = [
    { value: 'internal', label: { en: 'Internal', ar: 'داخلي' } },
    { value: 'external', label: { en: 'External', ar: 'خارجي' } },
    { value: 'technical', label: { en: 'Technical', ar: 'تقني' } },
    { value: 'resource', label: { en: 'Resource', ar: 'موارد' } }
  ];

  const constraintTypes = [
    { value: 'budget', label: { en: 'Budget', ar: 'ميزانية' } },
    { value: 'time', label: { en: 'Time', ar: 'وقت' } },
    { value: 'resource', label: { en: 'Resource', ar: 'موارد' } },
    { value: 'regulatory', label: { en: 'Regulatory', ar: 'تنظيمي' } },
    { value: 'technical', label: { en: 'Technical', ar: 'تقني' } }
  ];

  const assumptionCategories = [
    { value: 'operational', label: { en: 'Operational', ar: 'تشغيلي' } },
    { value: 'financial', label: { en: 'Financial', ar: 'مالي' } },
    { value: 'market', label: { en: 'Market', ar: 'سوق' } },
    { value: 'stakeholder', label: { en: 'Stakeholder', ar: 'أصحاب المصلحة' } },
    { value: 'regulatory', label: { en: 'Regulatory', ar: 'تنظيمي' } }
  ];

  const criticalityOptions = [
    { value: 'low', label: { en: 'Low', ar: 'منخفض' }, color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: { en: 'Medium', ar: 'متوسط' }, color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: { en: 'High', ar: 'مرتفع' }, color: 'bg-red-100 text-red-800' }
  ];

  const statusOptions = [
    { value: 'pending', label: { en: 'Pending', ar: 'معلق' } },
    { value: 'resolved', label: { en: 'Resolved', ar: 'تم الحل' } },
    { value: 'blocked', label: { en: 'Blocked', ar: 'محظور' } }
  ];

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {t({ 
              en: 'Map dependencies, identify constraints, and document key assumptions.',
              ar: 'تحديد التبعيات والقيود وتوثيق الافتراضات الرئيسية.'
            })}
          </p>
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
            : t({ en: 'Analyze Dependencies', ar: 'تحليل التبعيات' })
          }
        </Button>
      </div>

      {/* Dependencies */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <GitBranch className="w-5 h-5 text-primary" />
              {t({ en: 'Dependencies', ar: 'التبعيات' })}
              <Badge variant="secondary">{(data.dependencies || []).length}</Badge>
            </CardTitle>
            <CardDescription>
              {t({ en: 'What must be in place for the strategy to succeed?', ar: 'ما الذي يجب أن يكون متوفراً لنجاح الاستراتيجية؟' })}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={addDependency}>
            <Plus className="w-4 h-4 mr-1" />
            {t({ en: 'Add', ar: 'إضافة' })}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {(data.dependencies || []).length === 0 ? (
            <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-lg">
              {t({ en: 'No dependencies defined', ar: 'لم يتم تحديد تبعيات' })}
            </div>
          ) : (
            data.dependencies.map((dep, index) => (
              <div key={dep.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant={dep.status === 'resolved' ? 'default' : dep.status === 'blocked' ? 'destructive' : 'secondary'}>
                    {statusOptions.find(s => s.value === dep.status)?.label[language]}
                  </Badge>
                  <Button variant="ghost" size="icon" onClick={() => removeDependency(index)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>{t({ en: 'Dependency Name (EN)', ar: 'اسم التبعية (إنجليزي)' })}</Label>
                    <Input
                      value={dep.name_en || dep.name || ''}
                      onChange={(e) => updateDependency(index, 'name_en', e.target.value)}
                      placeholder={t({ en: 'e.g., Budget approval from finance', ar: 'مثال: موافقة الميزانية من المالية' })}
                    />
                  </div>
                  <div>
                    <Label>{t({ en: 'Dependency Name (AR)', ar: 'اسم التبعية (عربي)' })}</Label>
                    <Input
                      dir="rtl"
                      value={dep.name_ar || ''}
                      onChange={(e) => updateDependency(index, 'name_ar', e.target.value)}
                      placeholder="مثال: موافقة الميزانية من المالية"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <Label>{t({ en: 'Type', ar: 'النوع' })}</Label>
                    <Select value={dep.type} onValueChange={(v) => updateDependency(index, 'type', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {dependencyTypes.map(dt => (
                          <SelectItem key={dt.value} value={dt.value}>{dt.label[language]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{t({ en: 'Source', ar: 'المصدر' })}</Label>
                    <Input
                      value={dep.source}
                      onChange={(e) => updateDependency(index, 'source', e.target.value)}
                      placeholder={t({ en: 'From...', ar: 'من...' })}
                    />
                  </div>
                  <div>
                    <Label>{t({ en: 'Target', ar: 'الهدف' })}</Label>
                    <Input
                      value={dep.target}
                      onChange={(e) => updateDependency(index, 'target', e.target.value)}
                      placeholder={t({ en: 'To...', ar: 'إلى...' })}
                    />
                  </div>
                  <div>
                    <Label>{t({ en: 'Criticality', ar: 'الأهمية' })}</Label>
                    <Select value={dep.criticality} onValueChange={(v) => updateDependency(index, 'criticality', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {criticalityOptions.map(c => (
                          <SelectItem key={c.value} value={c.value}>{c.label[language]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Constraints */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertCircle className="w-5 h-5 text-primary" />
              {t({ en: 'Constraints', ar: 'القيود' })}
              <Badge variant="secondary">{(data.constraints || []).length}</Badge>
            </CardTitle>
            <CardDescription>
              {t({ en: 'What limitations must be worked within?', ar: 'ما القيود التي يجب العمل ضمنها؟' })}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={addConstraint}>
            <Plus className="w-4 h-4 mr-1" />
            {t({ en: 'Add', ar: 'إضافة' })}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {(data.constraints || []).length === 0 ? (
            <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-lg">
              {t({ en: 'No constraints defined', ar: 'لم يتم تحديد قيود' })}
            </div>
          ) : (
            data.constraints.map((constraint, index) => (
              <div key={constraint.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">
                    {constraintTypes.find(c => c.value === constraint.type)?.label[language]}
                  </Badge>
                  <Button variant="ghost" size="icon" onClick={() => removeConstraint(index)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>{t({ en: 'Constraint Description (EN)', ar: 'وصف القيد (إنجليزي)' })}</Label>
                    <Textarea
                      value={constraint.description_en || constraint.description || ''}
                      onChange={(e) => updateConstraint(index, 'description_en', e.target.value)}
                      placeholder={t({ en: 'Describe the constraint...', ar: 'وصف القيد...' })}
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label>{t({ en: 'Constraint Description (AR)', ar: 'وصف القيد (عربي)' })}</Label>
                    <Textarea
                      dir="rtl"
                      value={constraint.description_ar || ''}
                      onChange={(e) => updateConstraint(index, 'description_ar', e.target.value)}
                      placeholder="وصف القيد..."
                      rows={2}
                    />
                  </div>
                </div>
                
                <div>
                  <Label>{t({ en: 'Type', ar: 'النوع' })}</Label>
                  <Select value={constraint.type} onValueChange={(v) => updateConstraint(index, 'type', v)}>
                    <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {constraintTypes.map(c => (
                        <SelectItem key={c.value} value={c.value}>{c.label[language]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>{t({ en: 'Mitigation Approach (EN)', ar: 'نهج التخفيف (إنجليزي)' })}</Label>
                    <Input
                      value={constraint.mitigation_en || constraint.mitigation || ''}
                      onChange={(e) => updateConstraint(index, 'mitigation_en', e.target.value)}
                      placeholder={t({ en: 'How will you work around this?', ar: 'كيف ستتعامل مع هذا؟' })}
                    />
                  </div>
                  <div>
                    <Label>{t({ en: 'Mitigation Approach (AR)', ar: 'نهج التخفيف (عربي)' })}</Label>
                    <Input
                      dir="rtl"
                      value={constraint.mitigation_ar || ''}
                      onChange={(e) => updateConstraint(index, 'mitigation_ar', e.target.value)}
                      placeholder="كيف ستتعامل مع هذا؟"
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Assumptions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle className="w-5 h-5 text-primary" />
              {t({ en: 'Key Assumptions', ar: 'الافتراضات الرئيسية' })}
              <Badge variant="secondary">{(data.assumptions || []).length}</Badge>
            </CardTitle>
            <CardDescription>
              {t({ en: 'What are you assuming to be true?', ar: 'ما الذي تفترض أنه صحيح؟' })}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={addAssumption}>
            <Plus className="w-4 h-4 mr-1" />
            {t({ en: 'Add', ar: 'إضافة' })}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {(data.assumptions || []).length === 0 ? (
            <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-lg">
              {t({ en: 'No assumptions documented', ar: 'لم يتم توثيق افتراضات' })}
            </div>
          ) : (
            data.assumptions.map((assumption, index) => (
              <div key={assumption.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {assumptionCategories.find(c => c.value === assumption.category)?.label[language]}
                    </Badge>
                    <Badge variant={assumption.confidence === 'high' ? 'default' : assumption.confidence === 'low' ? 'destructive' : 'secondary'}>
                      {t({ en: 'Confidence:', ar: 'الثقة:' })} {criticalityOptions.find(c => c.value === assumption.confidence)?.label[language]}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeAssumption(index)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>{t({ en: 'Assumption Statement (EN)', ar: 'بيان الافتراض (إنجليزي)' })}</Label>
                    <Textarea
                      value={assumption.statement_en || assumption.statement || ''}
                      onChange={(e) => updateAssumption(index, 'statement_en', e.target.value)}
                      placeholder={t({ en: 'We assume that...', ar: 'نفترض أن...' })}
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label>{t({ en: 'Assumption Statement (AR)', ar: 'بيان الافتراض (عربي)' })}</Label>
                    <Textarea
                      dir="rtl"
                      value={assumption.statement_ar || ''}
                      onChange={(e) => updateAssumption(index, 'statement_ar', e.target.value)}
                      placeholder="نفترض أن..."
                      rows={2}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label>{t({ en: 'Category', ar: 'الفئة' })}</Label>
                    <Select value={assumption.category} onValueChange={(v) => updateAssumption(index, 'category', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {assumptionCategories.map(c => (
                          <SelectItem key={c.value} value={c.value}>{c.label[language]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{t({ en: 'Confidence Level', ar: 'مستوى الثقة' })}</Label>
                    <Select value={assumption.confidence} onValueChange={(v) => updateAssumption(index, 'confidence', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {criticalityOptions.map(c => (
                          <SelectItem key={c.value} value={c.value}>{c.label[language]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>{t({ en: 'Validation Method (EN)', ar: 'طريقة التحقق (إنجليزي)' })}</Label>
                    <Input
                      value={assumption.validation_method_en || assumption.validation_method || ''}
                      onChange={(e) => updateAssumption(index, 'validation_method_en', e.target.value)}
                      placeholder={t({ en: 'How to verify?', ar: 'كيفية التحقق؟' })}
                    />
                  </div>
                  <div>
                    <Label>{t({ en: 'Validation Method (AR)', ar: 'طريقة التحقق (عربي)' })}</Label>
                    <Input
                      dir="rtl"
                      value={assumption.validation_method_ar || ''}
                      onChange={(e) => updateAssumption(index, 'validation_method_ar', e.target.value)}
                      placeholder="كيفية التحقق؟"
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
