import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, DollarSign, Users, Cpu, Building, Plus, X, StickyNote, Link2 } from 'lucide-react';
import { useLanguage } from '../../../LanguageContext';
import EntityAllocationSelector from '../EntityAllocationSelector';

export default function Step13Resources({ data, onChange, onGenerateAI, isGenerating, strategicPlanId }) {
  const { language, t, isRTL } = useLanguage();

  const resourceTypes = [
    { key: 'hr_requirements', icon: Users, title: { en: 'HR Requirements', ar: 'متطلبات الموارد البشرية' } },
    { key: 'technology_requirements', icon: Cpu, title: { en: 'Technology Requirements', ar: 'متطلبات التقنية' } },
    { key: 'infrastructure_requirements', icon: Building, title: { en: 'Infrastructure', ar: 'البنية التحتية' } },
    { key: 'budget_allocation', icon: DollarSign, title: { en: 'Budget Allocation', ar: 'تخصيص الميزانية' } }
  ];

  const addResource = (type) => {
    const current = data.resource_plan?.[type] || [];
    const newItem = { 
      id: Date.now().toString(), 
      name_en: '', 
      name_ar: '', 
      quantity: '', 
      cost: '', 
      notes_en: '',
      notes_ar: '',
      entity_allocations: [] // NEW: Track which entities this resource supports
    };
    onChange({ resource_plan: { ...data.resource_plan, [type]: [...current, newItem] } });
  };

  const updateResource = (type, index, field, value) => {
    const current = [...(data.resource_plan?.[type] || [])];
    current[index] = { ...current[index], [field]: value };
    onChange({ resource_plan: { ...data.resource_plan, [type]: current } });
  };

  const removeResource = (type, index) => {
    const current = data.resource_plan?.[type] || [];
    onChange({ resource_plan: { ...data.resource_plan, [type]: current.filter((_, i) => i !== index) } });
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex justify-end">
        <Button variant="outline" onClick={onGenerateAI} disabled={isGenerating} className="gap-2">
          <Sparkles className="w-4 h-4" />
          {isGenerating ? t({ en: 'Generating...', ar: 'جاري الإنشاء...' }) : t({ en: 'Generate Resource Plan', ar: 'إنشاء خطة الموارد' })}
        </Button>
      </div>

      {resourceTypes.map(({ key, icon: Icon, title }) => (
        <Card key={key}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Icon className="w-5 h-5 text-primary" />
              {title[language]}
              <Badge variant="secondary">{(data.resource_plan?.[key] || []).length}</Badge>
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => addResource(key)}>
              <Plus className="w-4 h-4 mr-1" />{t({ en: 'Add', ar: 'إضافة' })}
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {(data.resource_plan?.[key] || []).length === 0 ? (
              <div className="text-center py-4 text-muted-foreground border-2 border-dashed rounded-lg text-sm">
                {t({ en: 'No items added', ar: 'لم تتم إضافة عناصر' })}
              </div>
            ) : (
              data.resource_plan[key].map((item, idx) => (
                <div key={item.id} className="p-3 border rounded-lg space-y-3">
                  <div className="flex justify-end">
                    <Button variant="ghost" size="icon" onClick={() => removeResource(key, idx)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">{t({ en: 'Name (EN)', ar: 'الاسم (إنجليزي)' })}</Label>
                      <Input
                        placeholder={t({ en: 'Name/Description', ar: 'الاسم/الوصف' })}
                        value={item.name_en || item.name || ''}
                        onChange={(e) => updateResource(key, idx, 'name_en', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">{t({ en: 'Name (AR)', ar: 'الاسم (عربي)' })}</Label>
                      <Input
                        dir="rtl"
                        placeholder="الاسم/الوصف"
                        value={item.name_ar || ''}
                        onChange={(e) => updateResource(key, idx, 'name_ar', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">{t({ en: 'Quantity', ar: 'الكمية' })}</Label>
                      <Input
                        placeholder={t({ en: 'Quantity', ar: 'الكمية' })}
                        value={item.quantity}
                        onChange={(e) => updateResource(key, idx, 'quantity', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">{t({ en: 'Cost', ar: 'التكلفة' })}</Label>
                      <Input
                        placeholder={t({ en: 'Cost (SAR)', ar: 'التكلفة (ريال)' })}
                        value={item.cost}
                        onChange={(e) => updateResource(key, idx, 'cost', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs flex items-center gap-1">
                        <StickyNote className="h-3 w-3" />
                        {t({ en: 'Notes (EN)', ar: 'ملاحظات (إنجليزي)' })}
                      </Label>
                      <Input
                        placeholder={t({ en: 'Optional notes', ar: 'ملاحظات اختيارية' })}
                        value={item.notes_en || item.notes || ''}
                        onChange={(e) => updateResource(key, idx, 'notes_en', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs flex items-center gap-1">
                        <StickyNote className="h-3 w-3" />
                        {t({ en: 'Notes (AR)', ar: 'ملاحظات (عربي)' })}
                      </Label>
                      <Input
                        dir="rtl"
                        placeholder="ملاحظات اختيارية"
                        value={item.notes_ar || ''}
                        onChange={(e) => updateResource(key, idx, 'notes_ar', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Entity Allocation - Link resource to generated entities */}
                  <div className="space-y-1 pt-2 border-t">
                    <Label className="text-xs flex items-center gap-1">
                      <Link2 className="h-3 w-3" />
                      {t({ en: 'Link to Entities', ar: 'ربط بالكيانات' })}
                    </Label>
                    <EntityAllocationSelector
                      strategicPlanId={strategicPlanId}
                      value={item.entity_allocations || []}
                      onChange={(allocations) => updateResource(key, idx, 'entity_allocations', allocations)}
                      multiple={true}
                      showDetails={true}
                      placeholder={t({ en: 'Select entities this resource supports...', ar: 'اختر الكيانات التي يدعمها هذا المورد...' })}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
