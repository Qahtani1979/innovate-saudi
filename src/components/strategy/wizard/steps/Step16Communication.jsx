import React from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Megaphone, RefreshCw, Plus, X } from 'lucide-react';
import { useLanguage } from '../../../LanguageContext';

// Combined Step 16 (Communication) and Step 17 (Change Management)
export function Step16Communication({ data, onChange, onGenerateAI, isGenerating }) {
  const { t, isRTL } = useLanguage();

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex justify-end">
        <Button variant="outline" onClick={onGenerateAI} disabled={isGenerating} className="gap-2">
          <Sparkles className="w-4 h-4" />
          {t({ en: 'Generate Communication Plan', ar: 'إنشاء خطة التواصل' })}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Megaphone className="w-5 h-5 text-primary" />
            {t({ en: 'Key Messages', ar: 'الرسائل الرئيسية' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={data.communication_plan?.key_messages?.join('\n') || ''}
            onChange={(e) => onChange({
              communication_plan: {
                ...data.communication_plan,
                key_messages: e.target.value.split('\n').map(s => s.trim()).filter(Boolean)
              }
            })}
            placeholder={t({ en: 'Enter key messages (one per line)...', ar: 'أدخل الرسائل الرئيسية (واحدة في كل سطر)...' })}
            rows={4}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t({ en: 'Internal Channels', ar: 'القنوات الداخلية' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={data.communication_plan?.internal_channels?.join('\n') || ''}
            onChange={(e) => onChange({
              communication_plan: {
                ...data.communication_plan,
                internal_channels: e.target.value.split('\n').map(s => s.trim()).filter(Boolean)
              }
            })}
            placeholder={t({ en: 'e.g., Email, Intranet, Team meetings...', ar: 'مثال: البريد الإلكتروني، الشبكة الداخلية...' })}
            rows={3}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t({ en: 'External Channels', ar: 'القنوات الخارجية' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={data.communication_plan?.external_channels?.join('\n') || ''}
            onChange={(e) => onChange({
              communication_plan: {
                ...data.communication_plan,
                external_channels: e.target.value.split('\n').map(s => s.trim()).filter(Boolean)
              }
            })}
            placeholder={t({ en: 'e.g., Press releases, Social media, Public events...', ar: 'مثال: البيانات الصحفية، وسائل التواصل...' })}
            rows={3}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export function Step17Change({ data, onChange, onGenerateAI, isGenerating }) {
  const { t, isRTL } = useLanguage();

  const trainingPlan = data.change_management?.training_plan || [];

  const addTraining = () => {
    const next = [
      ...trainingPlan,
      { id: Date.now().toString(), name: '', target_audience: '', duration: '', timeline: '' }
    ];

    onChange({
      change_management: {
        ...data.change_management,
        training_plan: next
      }
    });
  };

  const updateTraining = (id, updates) => {
    const next = trainingPlan.map((tItem) => (tItem.id === id ? { ...tItem, ...updates } : tItem));
    onChange({
      change_management: {
        ...data.change_management,
        training_plan: next
      }
    });
  };

  const removeTraining = (id) => {
    const next = trainingPlan.filter((tItem) => tItem.id !== id);
    onChange({
      change_management: {
        ...data.change_management,
        training_plan: next
      }
    });
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex justify-end">
        <Button variant="outline" onClick={onGenerateAI} disabled={isGenerating} className="gap-2">
          <Sparkles className="w-4 h-4" />
          {t({ en: 'Generate Change Plan', ar: 'إنشاء خطة التغيير' })}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <RefreshCw className="w-5 h-5 text-primary" />
            {t({ en: 'Readiness Assessment', ar: 'تقييم الجاهزية' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={data.change_management?.readiness_assessment || ''}
            onChange={(e) => onChange({ change_management: { ...data.change_management, readiness_assessment: e.target.value } })}
            placeholder={t({ en: 'Assess organizational readiness for change...', ar: 'تقييم جاهزية المنظمة للتغيير...' })}
            rows={4}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t({ en: 'Change Approach', ar: 'نهج التغيير' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={data.change_management?.change_approach || ''}
            onChange={(e) => onChange({ change_management: { ...data.change_management, change_approach: e.target.value } })}
            placeholder={t({ en: 'Describe the change management approach...', ar: 'وصف نهج إدارة التغيير...' })}
            rows={4}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t({ en: 'Resistance Management', ar: 'إدارة المقاومة' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={data.change_management?.resistance_management || ''}
            onChange={(e) => onChange({ change_management: { ...data.change_management, resistance_management: e.target.value } })}
            placeholder={t({ en: 'How will you address resistance to change?', ar: 'كيف ستتعامل مع مقاومة التغيير؟' })}
            rows={3}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {t({ en: 'Training Plan', ar: 'خطة التدريب' })}
            <Badge variant="secondary">{trainingPlan.length}</Badge>
          </CardTitle>
          <Button size="sm" variant="outline" onClick={addTraining} className="gap-2">
            <Plus className="h-4 w-4" />
            {t({ en: 'Add Training', ar: 'إضافة تدريب' })}
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {trainingPlan.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-lg">
              {t({ en: 'No training items added', ar: 'لم تتم إضافة عناصر تدريب' })}
            </div>
          ) : (
            trainingPlan.map((item) => (
              <div key={item.id} className="border rounded-lg p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{item.name || t({ en: 'Training Item', ar: 'عنصر تدريب' })}</p>
                  <Button size="icon" variant="ghost" onClick={() => removeTraining(item.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">{t({ en: 'Training Name', ar: 'اسم التدريب' })}</Label>
                    <Input value={item.name || ''} onChange={(e) => updateTraining(item.id, { name: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{t({ en: 'Target Audience', ar: 'الفئة المستهدفة' })}</Label>
                    <Input value={item.target_audience || ''} onChange={(e) => updateTraining(item.id, { target_audience: e.target.value })} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">{t({ en: 'Duration', ar: 'المدة' })}</Label>
                    <Input value={item.duration || ''} onChange={(e) => updateTraining(item.id, { duration: e.target.value })} placeholder={t({ en: 'e.g., 2 days', ar: 'مثال: يومان' })} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{t({ en: 'Timeline', ar: 'الجدول الزمني' })}</Label>
                    <Input value={item.timeline || ''} onChange={(e) => updateTraining(item.id, { timeline: e.target.value })} placeholder={t({ en: 'e.g., Q2 2026', ar: 'مثال: الربع الثاني 2026' })} />
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

export default Step16Communication;

