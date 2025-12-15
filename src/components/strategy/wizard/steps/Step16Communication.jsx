import React from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Megaphone, RefreshCw, Plus, X } from 'lucide-react';
import { useLanguage } from '../../../LanguageContext';

// Step 16: Communication Plan
export function Step16Communication({ data, onChange, onGenerateAI, isGenerating }) {
  const { language, t, isRTL } = useLanguage();

  // Key messages as bilingual objects
  const keyMessages = data.communication_plan?.key_messages || [];

  const addKeyMessage = () => {
    const newMessage = {
      id: Date.now().toString(),
      text_en: '',
      text_ar: ''
    };
    onChange({
      communication_plan: {
        ...data.communication_plan,
        key_messages: [...keyMessages, newMessage]
      }
    });
  };

  const updateKeyMessage = (index, field, value) => {
    const updated = keyMessages.map((m, i) => (i === index ? { ...m, [field]: value } : m));
    onChange({
      communication_plan: {
        ...data.communication_plan,
        key_messages: updated
      }
    });
  };

  const removeKeyMessage = (index) => {
    onChange({
      communication_plan: {
        ...data.communication_plan,
        key_messages: keyMessages.filter((_, i) => i !== index)
      }
    });
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex justify-end">
        <Button variant="outline" onClick={onGenerateAI} disabled={isGenerating} className="gap-2">
          <Sparkles className="w-4 h-4" />
          {t({ en: 'Generate Communication Plan', ar: 'إنشاء خطة التواصل' })}
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Megaphone className="w-5 h-5 text-primary" />
            {t({ en: 'Key Messages', ar: 'الرسائل الرئيسية' })}
            <Badge variant="secondary">{keyMessages.length}</Badge>
          </CardTitle>
          <Button variant="outline" size="sm" onClick={addKeyMessage}>
            <Plus className="w-4 h-4 mr-1" />{t({ en: 'Add Message', ar: 'إضافة رسالة' })}
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {keyMessages.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-lg">
              {t({ en: 'No key messages added', ar: 'لم تتم إضافة رسائل رئيسية' })}
            </div>
          ) : (
            keyMessages.map((msg, idx) => (
              <div key={msg.id || idx} className="p-3 border rounded-lg space-y-2">
                <div className="flex justify-end">
                  <Button variant="ghost" size="icon" onClick={() => removeKeyMessage(idx)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">{t({ en: 'Message (EN)', ar: 'الرسالة (إنجليزي)' })}</Label>
                    <Textarea
                      value={typeof msg === 'string' ? msg : (msg.text_en || '')}
                      onChange={(e) => updateKeyMessage(idx, 'text_en', e.target.value)}
                      placeholder={t({ en: 'Enter key message...', ar: 'أدخل الرسالة الرئيسية...' })}
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">{t({ en: 'Message (AR)', ar: 'الرسالة (عربي)' })}</Label>
                    <Textarea
                      dir="rtl"
                      value={typeof msg === 'string' ? '' : (msg.text_ar || '')}
                      onChange={(e) => updateKeyMessage(idx, 'text_ar', e.target.value)}
                      placeholder="أدخل الرسالة الرئيسية..."
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
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

// Step 17: Change Management
export function Step17Change({ data, onChange, onGenerateAI, isGenerating }) {
  const { language, t, isRTL } = useLanguage();

  const trainingPlan = data.change_management?.training_plan || [];

  const addTraining = () => {
    const next = [
      ...trainingPlan,
      { 
        id: Date.now().toString(), 
        name_en: '', 
        name_ar: '',
        target_audience: '', 
        duration: '', 
        timeline: '' 
      }
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
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">{t({ en: 'Assessment (EN)', ar: 'التقييم (إنجليزي)' })}</Label>
              <Textarea
                value={data.change_management?.readiness_assessment_en || data.change_management?.readiness_assessment || ''}
                onChange={(e) => onChange({ change_management: { ...data.change_management, readiness_assessment_en: e.target.value } })}
                placeholder={t({ en: 'Assess organizational readiness for change...', ar: 'تقييم جاهزية المنظمة للتغيير...' })}
                rows={4}
              />
            </div>
            <div>
              <Label className="text-xs">{t({ en: 'Assessment (AR)', ar: 'التقييم (عربي)' })}</Label>
              <Textarea
                dir="rtl"
                value={data.change_management?.readiness_assessment_ar || ''}
                onChange={(e) => onChange({ change_management: { ...data.change_management, readiness_assessment_ar: e.target.value } })}
                placeholder="تقييم جاهزية المنظمة للتغيير..."
                rows={4}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t({ en: 'Change Approach', ar: 'نهج التغيير' })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">{t({ en: 'Approach (EN)', ar: 'النهج (إنجليزي)' })}</Label>
              <Textarea
                value={data.change_management?.change_approach_en || data.change_management?.change_approach || ''}
                onChange={(e) => onChange({ change_management: { ...data.change_management, change_approach_en: e.target.value } })}
                placeholder={t({ en: 'Describe the change management approach...', ar: 'وصف نهج إدارة التغيير...' })}
                rows={4}
              />
            </div>
            <div>
              <Label className="text-xs">{t({ en: 'Approach (AR)', ar: 'النهج (عربي)' })}</Label>
              <Textarea
                dir="rtl"
                value={data.change_management?.change_approach_ar || ''}
                onChange={(e) => onChange({ change_management: { ...data.change_management, change_approach_ar: e.target.value } })}
                placeholder="وصف نهج إدارة التغيير..."
                rows={4}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t({ en: 'Resistance Management', ar: 'إدارة المقاومة' })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">{t({ en: 'Strategy (EN)', ar: 'الاستراتيجية (إنجليزي)' })}</Label>
              <Textarea
                value={data.change_management?.resistance_management_en || data.change_management?.resistance_management || ''}
                onChange={(e) => onChange({ change_management: { ...data.change_management, resistance_management_en: e.target.value } })}
                placeholder={t({ en: 'How will you address resistance to change?', ar: 'كيف ستتعامل مع مقاومة التغيير؟' })}
                rows={3}
              />
            </div>
            <div>
              <Label className="text-xs">{t({ en: 'Strategy (AR)', ar: 'الاستراتيجية (عربي)' })}</Label>
              <Textarea
                dir="rtl"
                value={data.change_management?.resistance_management_ar || ''}
                onChange={(e) => onChange({ change_management: { ...data.change_management, resistance_management_ar: e.target.value } })}
                placeholder="كيف ستتعامل مع مقاومة التغيير؟"
                rows={3}
              />
            </div>
          </div>
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
                  <p className="text-sm font-medium">
                    {language === 'ar' ? (item.name_ar || item.name_en || item.name) : (item.name_en || item.name)} 
                    || {t({ en: 'Training Item', ar: 'عنصر تدريب' })}
                  </p>
                  <Button size="icon" variant="ghost" onClick={() => removeTraining(item.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">{t({ en: 'Training Name (EN)', ar: 'اسم التدريب (إنجليزي)' })}</Label>
                    <Input 
                      value={item.name_en || item.name || ''} 
                      onChange={(e) => updateTraining(item.id, { name_en: e.target.value })} 
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{t({ en: 'Training Name (AR)', ar: 'اسم التدريب (عربي)' })}</Label>
                    <Input 
                      dir="rtl"
                      value={item.name_ar || ''} 
                      onChange={(e) => updateTraining(item.id, { name_ar: e.target.value })} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">{t({ en: 'Target Audience', ar: 'الفئة المستهدفة' })}</Label>
                    <Input 
                      value={item.target_audience || ''} 
                      onChange={(e) => updateTraining(item.id, { target_audience: e.target.value })} 
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{t({ en: 'Duration', ar: 'المدة' })}</Label>
                    <Input 
                      value={item.duration || ''} 
                      onChange={(e) => updateTraining(item.id, { duration: e.target.value })} 
                      placeholder={t({ en: 'e.g., 2 days', ar: 'مثال: يومان' })} 
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{t({ en: 'Timeline', ar: 'الجدول الزمني' })}</Label>
                    <Input 
                      value={item.timeline || ''} 
                      onChange={(e) => updateTraining(item.id, { timeline: e.target.value })} 
                      placeholder={t({ en: 'e.g., Q2 2026', ar: 'مثال: الربع الثاني 2026' })} 
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

export default Step16Communication;
